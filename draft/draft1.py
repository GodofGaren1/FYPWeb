from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
from ultralytics import YOLO
import threading
import time

app = Flask(__name__)
CORS(app)

# Video capture (e.g., from webcam)
camera = cv2.VideoCapture(0)  # Change the argument for other video sources

# YOLO Model
model = YOLO(r"C:\Users\Wilson\FYP\runs\detect\epoch50\weights\best.pt")

# Shared variables
averageCrowd_count = 0
lock = threading.Lock()

def process_video():
    global averageCrowd_count  # Declare global variable
    results_generator = model.predict(source="0", stream=True)
    frame_counter = 0
    personCount_list = []
    headCount_list = []
    start_time = time.time()

    for results in results_generator:
        person_count = 0
        head_count = 0
        frame_counter += 1
        for box in results.boxes:
            if box.cls == 0:
                person_count += 1
            else:
                head_count += 1

        if len(personCount_list) >= 20:
            personCount_list.pop(0)
        personCount_list.append(person_count)

        if len(headCount_list) >= 20:
            headCount_list.pop(0)
        headCount_list.append(head_count)

        current_time = time.time()
        if frame_counter >= 30:
            averagePerson_count = int(sum(personCount_list) / max(1, len(personCount_list)))
            averageHead_count = int(sum(headCount_list) / max(1, len(headCount_list)))
            with lock:  # Ensure thread-safe update
                averageCrowd_count = max(averageHead_count, averagePerson_count)
            start_time = current_time
            frame_counter = 0

# Start the video processing thread
thread = threading.Thread(target=process_video, daemon=True)
thread.start()

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            # Encode the frame in JPEG format
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            # Yield the frame as part of the multipart response
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    # Return a multipart response with the video stream
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/crowd_count')
def crowd_count():
    with lock:
        return jsonify({'averageCrowdCount': averageCrowd_count})

if __name__ == '__main__':
    app.run(debug=True)
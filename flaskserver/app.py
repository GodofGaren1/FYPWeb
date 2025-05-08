from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
from ultralytics import YOLO
from yt_dlp import YoutubeDL
import yt_dlp
import subprocess
import numpy as np
from sahi import AutoDetectionModel
from sahi.predict import get_sliced_prediction
from sahi.utils.cv import visualize_object_predictions

app = Flask(__name__)
CORS(app)

youtube_url = "https://www.youtube.com/watch?v=DjdUEyjx8GM"
# youtube_url = "https://www.youtube.com/watch?v=DLmn7f9SJ5A"
# youtube_url = "https://www.youtube.com/watch?v=p0Qhe4vhYLQ"

averageCrowd_count = 0
webcam = 1


MODELS = {
    "1": r"C:\Users\Wilson\FYP\runs\detect\epoch50\weights\best.pt",
    "2": r"C:\Users\Wilson\FYP\runs\detect\epoch50head\weights\best.pt",
    "3": r"C:\Users\Wilson\FYP\runs\detect\epoch50headfdst50\weights\best.pt"
}

VIEWS = {
    "1", "2", "3"
}


selected_model = "1"
selected_view = "1"
model = YOLO(MODELS[selected_model])


def get_stream_url(youtube_url):
    ydl_opts = {
        'format': 'best',  # Get the best video stream
        'quiet': True,     # Suppress yt-dlp logs
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        return info['url']

stream_url = get_stream_url(youtube_url)

if webcam == 0:
    camera = cv2.VideoCapture(0)
else:
    camera = cv2.VideoCapture(stream_url)

ffmpeg_command = [
    'ffmpeg',
    '-i', stream_url,
    '-f', 'rawvideo',
    '-pix_fmt', 'bgr24',  # Raw pixel format in BGR
    '-an',                # Disable audio
    # '-timeout', '60000000'
    '-'
]

process = subprocess.Popen(ffmpeg_command, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)

def generate_frames():
    global averageCrowd_count
    while True:
        if webcam == 0:
            success, frame = camera.read()
            if not success:
                continue
        elif webcam == 1:
            success, frame = camera.read()
            if not success:
                continue
        else:
            raw_frame = process.stdout.read(1080 * 1920 * 3)
            if not raw_frame:
                print("Camera read failed")
                continue
            frame = np.frombuffer(raw_frame, np.uint8).reshape((1080, 1920, 3))

        results = model(frame, verbose = False)
        if selected_view == "2":
            frame = results[0].plot()

        result_0 = results[0]

        if selected_model == "1":
            person_count = 0
            head_count = 0

            # Count detected objects
            for box in result_0.boxes:
                if box.cls == 0:  # Assuming class 0 is 'person'
                    person_count += 1
                    if selected_view == "3":
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        label = f"{person_count}"
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)
                        cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                            0.5, (0, 255, 0), 2)
                else:  # Assuming other classes are 'head'
                    head_count += 1
                    if selected_view == "3":
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        label = f"{head_count}"
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
                        cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                            0.5, (0, 0, 255), 2)

            averageCrowd_count = max(person_count, head_count)

        else:
            head_count = 0
            
            for box in result_0.boxes:
                head_count +=1
                if selected_view == "3":
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    label = f"{head_count}"
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)
                    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                        0.5, (0, 255, 0), 2)

            averageCrowd_count = head_count

        _, buffer = cv2.imencode(".jpg", frame)
        frame_bytes = buffer.tobytes()

        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")
        
@app.route('/video_feed')
def video_feed():
    # Return a multipart response with the video stream
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/crowd_count')
def crowd_count():
    return jsonify({'averageCrowdCount': averageCrowd_count})

@app.route('/change_model', methods=['POST'])
def change_model():
    """API to change the YOLO model dynamically"""
    global model, selected_model
    data = request.json
    new_model = data.get("model")

    if new_model in MODELS:
        selected_model = new_model
        model = YOLO(MODELS[selected_model])  # Load the selected model
        return jsonify({"status": "success", "selected_model": new_model})
    else:
        return jsonify({"status": "error", "message": "Invalid model name"}), 400

@app.route('/change_view', methods=['POST'])
def change_view():
    """API to change the bounding box view dynamically"""
    global selected_view
    data = request.json
    new_view = data.get("view")

    if new_view in VIEWS:
        selected_view = new_view
        return jsonify({"status": "success", "selected_view": new_view})
    else:
        return jsonify({"status": "error", "message": "Invalid view name"}), 400
    
if __name__ == '__main__':
    app.run(debug=True)
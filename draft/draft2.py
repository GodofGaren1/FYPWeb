from flask import Flask, Response
from flask_cors import CORS
import cv2
from ultralytics import YOLO
import time
from flask import jsonify
import threading
from yt_dlp import YoutubeDL


app = Flask(__name__)
CORS(app)

youtube_url = "https://www.youtube.com/watch?v=DVMjtoeKEO8"

def get_stream_url(youtube_url):
    ydl_opts = {
        'format': 'best',  # Get the best video stream
        'quiet': True,     # Suppress yt-dlp logs
    }
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        return info['url']

stream_url = get_stream_url(youtube_url)
# Video capture (e.g., from webcam)
camera = cv2.VideoCapture(stream_url)  # Change the argument for other video sources (e.g., video file or RTSP stream)
# camera = cv2.VideoCapture(r"C:\Users\Wilson\FYP\video\PhilippinesStreet.mp4")  # Change the argument for other video sources (e.g., video file or RTSP stream)


model = YOLO(r"C:\Users\Wilson\FYP\runs\detect\epoch50\weights\best.pt")

averageCrowd_count = 0
lock = threading.Lock()


def process_video():
    global averageCrowd_count
    print("yo - process_video started")

    # Initialize variables outside the loop

    while True:
        print("Thread is alive") 
        success, frame = camera.read()
        if not success:
            print("Camera read failed")
            break
        print("before")
        try:
            # YOLO prediction
            results = model.predict(source=frame)
            print("YOLO prediction completed")

            # Initialize counts for the current frame
            person_count = 0
            head_count = 0

            if isinstance(results, list):
                results = results[0]

            # Count detected objects
            for box in results.boxes:
                if box.cls == 0:  # Assuming class 0 is 'person'
                    person_count += 1
                else:  # Assuming other classes are 'head'
                    head_count += 1

            # Update sliding window lists


            print("Head count: ", head_count, "People count: ", person_count)

            with lock:  # Update shared variable safely
                averageCrowd_count = max(person_count, head_count)

        except Exception as e:
            print(f"Error in YOLO prediction: {e}")
            break

print("Starting process_video thread...")
thread = threading.Thread(target=process_video, daemon=True)
thread.start()
print("Thread started")

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
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
from waitress import serve

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

# MODELS = {
#     "1": "/home/ubuntu/app/epoch50/best.pt",
#     "2": "/home/ubuntu/app/epoch50head/best.pt",
#     "3": "/home/ubuntu/app/epoch50fdst50/best.pt"
# }

VIEWS = {
    "1", "2", "3"
}

SLICE = {
    "0", "1"
}

selected_model = "1"
selected_view = "1"
selected_slice = "0"
model = YOLO(MODELS[selected_model])
# model = YOLO(MODELS[selected_model]).to("cpu")

sahi_model = AutoDetectionModel.from_pretrained(
    model_type="yolov8",
    model_path=MODELS[selected_model],
    confidence_threshold=0.25,
    device="cuda"  # Change to "cpu" if needed
)


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
    # camera = cv2.VideoCapture(r"C:\Users\Wilson\FYP\video\japanNight.mp4")

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
    frame_count = 0  # ✅ Frame counter
    global camera
    while True:
        if webcam == 0:
            success, frame = camera.read()
            if not success:
                continue
        elif webcam == 1:
            success, frame = camera.read()
            if not success:
                camera.release()
                camera = cv2.VideoCapture(stream_url)
                continue
        else:
            raw_frame = process.stdout.read(1080 * 1920 * 3)
            if not raw_frame:
                print("Camera read failed")
                continue
            frame = np.frombuffer(raw_frame, np.uint8).reshape((1080, 1920, 3))
        if selected_slice == "1":
            frame_count += 1
            if frame_count % 10 != 0:
                continue
            frame_count = 0

        if selected_slice == "0":
            results = model(frame, verbose = False)

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
        
        else:
            results = get_sliced_prediction(
                frame,
                sahi_model,
                slice_height=640,  # Slice size
                slice_width=640,
                overlap_height_ratio=0.2,  # Overlap for better merging
                overlap_width_ratio=0.2
            )
            # ✅ Extract object detections
            object_predictions = results.object_prediction_list  # Extract list from PredictionResult

            if selected_model == "1":
                person_count = 0
                head_count = 0
                temp = []
                for pred in object_predictions:
                    temp.append(pred.category.id)
                    if pred.category.id == 0:
                        person_count +=1
                        if selected_view == "3":
                            x1, y1, width, height = map(int, pred.bbox.to_xywh())
                            x2, y2, = x1 + width, y1 + height
                            label = f"{person_count}"
                            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)
                            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                                0.5, (0, 255, 0), 2)
                    else:
                        head_count += 1
                        if selected_view == "3":
                            x1, y1, width, height = map(int, pred.bbox.to_xywh())
                            x2, y2, = x1 + width, y1 + height
                            label = f"{head_count}"
                            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
                            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                                0.5, (0, 0, 255), 2)
                print(temp)
                averageCrowd_count = max(person_count, head_count)
            else:
                head_count = 0
                for pred in object_predictions:
                    head_count += 1
                    if selected_view == "3":
                        x1, y1, width, height = map(int, pred.bbox.to_xywh())
                        x2, y2, = x1 + width, y1 + height
                        label = f"{head_count}"
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)
                        cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                            0.5, (0, 255, 0), 2)

                averageCrowd_count = head_count

        if selected_view == "2":
            if selected_slice == "0" and isinstance(results, list):
                frame = results[0].plot()
            else:
                # ✅ Visualize predictions correctly
                frame = visualize_object_predictions(frame, object_predictions)

                if isinstance(frame, dict):
                    print("⚠️ Frame is a dictionary! Extracting `image` key...")
                    frame = frame.get("image", None)

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
    global model, selected_model, sahi_model
    data = request.json
    new_model = data.get("model")

    if new_model in MODELS:
        selected_model = new_model
        model = YOLO(MODELS[selected_model])  # Load the selected model
        sahi_model = AutoDetectionModel.from_pretrained(
            model_type="yolov8",
            model_path=MODELS[selected_model],
            confidence_threshold=0.25,
            device="cuda"  # Change to "cpu" if needed
        )
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

@app.route('/change_slice', methods=['POST'])
def change_slice():
    """API to change the slice"""
    global selected_slice
    data = request.json
    new_slice = data.get("slice")

    if new_slice in SLICE:
        selected_slice = new_slice
        return jsonify({"status": "success", "selected_slice": new_slice})
    else:
        return jsonify({"status": "error", "message": "Invalid slice"}), 400

@app.route('/change_url', methods=['POST'])
def change_url():
    global youtube_url, stream_url, camera, process

    data = request.json
    new_url = data.get('url')
    youtube_url = new_url
    stream_url = get_stream_url(youtube_url)

    camera = cv2.VideoCapture(stream_url)
    return jsonify({'status': 'success', 'url': youtube_url}), 400

if __name__ == '__main__':
    # app.run(debug=True)
    serve(app, host='0.0.0.0', port=5000)
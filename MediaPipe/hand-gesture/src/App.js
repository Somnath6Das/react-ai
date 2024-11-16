import React, { useState, useEffect, useRef } from "react";
import {
  GestureRecognizer,
  DrawingUtils,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import close_hand from "./emoji/close-removebg-preview.png";
import finger_up from "./emoji/fingerup-removebg-preview.png";
import open_plum from "./emoji/openplum-removebg-preview.png";
import rock from "./emoji/rock-removebg-preview.png";
import thumb_down from "./emoji/thumbdown-removebg-preview.png";
import thumb_up from "./emoji/thumbsup-removebg-preview.png";
import victory from "./emoji/victory-removebg-preview.png";

const App = () => {
  const [gestureRecognizer, setGestureRecognizer] = useState(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [buttonText, setButtonText] = useState("ENABLE WEBCAM");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const outputRef = useRef(null);
  const videoHeight = "360px";
  const videoWidth = "480px";
  let lastVideoTime = -1;
  let runningMode = "IMAGE";
  const [emoji, setEmoji] = useState(null);
  const gestureToEmojiMap = {
    Victory: victory,
    Thumb_Up: thumb_up,
    Thumb_Down: thumb_down,
    Open_Palm: open_plum,
    Pointing_Up: finger_up,
    Closed_Fist: close_hand,
    ILoveYou: rock,
  };
  useEffect(() => {
    const initializeGestureRecognizer = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      const online_model_path =
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";
      const recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: online_model_path,
          delegate: "GPU",
        },
        runningMode,
      });
      setGestureRecognizer(recognizer);
    };
    initializeGestureRecognizer();
  }, []);

  const hasGetUserMedia = () =>
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const enableCam = () => {
    if (!gestureRecognizer) {
      alert("Please wait for gestureRecognizer to load");
      return;
    }

    setWebcamRunning(!webcamRunning);
    setButtonText(webcamRunning ? "ENABLE PREDICTIONS" : "DISABLE PREDICTIONS");

    const constraints = { video: true };

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      });
    }
  };

  const predictWebcam = async () => {
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }

    if (videoRef.current.currentTime !== lastVideoTime) {
      lastVideoTime = videoRef.current.currentTime;
      const nowInMs = Date.now();
      const results = gestureRecognizer.recognizeForVideo(
        videoRef.current,
        nowInMs
      );

      const canvasCtx = canvasRef.current.getContext("2d");
      const drawingUtils = new DrawingUtils(canvasCtx);

      canvasCtx.save();
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      canvasRef.current.style.height = videoHeight;
      videoRef.current.style.height = videoHeight;
      canvasRef.current.style.width = videoWidth;
      videoRef.current.style.width = videoWidth;

      if (results.landmarks) {
        for (const landmarks of results.landmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            GestureRecognizer.HAND_CONNECTIONS,
            { color: "#00FF00", lineWidth: 5 }
          );
          drawingUtils.drawLandmarks(landmarks, {
            color: "#FF0000",
            lineWidth: 2,
          });
        }
      }
      canvasCtx.restore();

      if (results.gestures.length > 0) {
        outputRef.current.style.display = "block";
        outputRef.current.style.width = videoWidth;
        const categoryName = results.gestures[0][0].categoryName;
        const categoryScore = (results.gestures[0][0].score * 100).toFixed(2);
        const handedness = results.handednesses[0][0].displayName;
        const getEmoji = gestureToEmojiMap[categoryName] || null;
        setEmoji(getEmoji);
        outputRef.current.innerText = `GestureRecognizer: ${categoryName}\nConfidence: ${categoryScore} %\nHandedness: ${handedness}`;
      } else {
        outputRef.current.style.display = "none";
      }
    }

    if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  return (
    <div>
      <section>
        <p>the model can understand 🤘✊👋☝️👎👍✌️ hand gestures</p>
        {hasGetUserMedia() ? (
          <div>
            <button onClick={enableCam}>{buttonText}</button>
            <div style={{ position: "relative" }}>
              <video ref={videoRef} autoPlay playsInline></video>
              <canvas
                ref={canvasRef}
                className="output_canvas"
                width="1280"
                height="720"
              ></canvas>

              {emoji !== null ? (
                <img
                  src={gestureToEmojiMap[emoji]}
                  alt=""
                  style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    left: 400,
                    bottom: 500,
                    right: 0,
                    textAlign: "center",
                    height: 100,
                  }}
                />
              ) : (
                ""
              )}
              <p ref={outputRef} className="output"></p>
            </div>
          </div>
        ) : (
          <p>Your browser does not support getUserMedia.</p>
        )}
      </section>
    </div>
  );
};

export default App;

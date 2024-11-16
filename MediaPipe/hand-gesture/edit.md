//  Previous code with useRef on button on click

import React, { useState, useEffect, useRef } from "react";
import {
  GestureRecognizer,
  DrawingUtils,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

const App = () => {
  const [gestureRecognizer, setGestureRecognizer] = useState(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const outputRef = useRef(null);
  const buttonRef = useRef(null);
  const videoHeight = '360px';
  const videoWidth = '480px';
  let lastVideoTime = -1;
  let runningMode = 'IMAGE';

  useEffect(() => {
    const initializeGestureRecognizer = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
      );
      const recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
          delegate: 'GPU',
        },
        runningMode,
      });
      setGestureRecognizer(recognizer);
    };
    initializeGestureRecognizer();
  }, []);

  const hasGetUserMedia = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const enableCam = () => {
    if (!gestureRecognizer) {
      alert('Please wait for gestureRecognizer to load');
      return;
    }

    setWebcamRunning(!webcamRunning);

    if (webcamRunning) {
      buttonRef.current.innerText = 'ENABLE PREDICTIONS';
    } else {
      buttonRef.current.innerText = 'DISABLE PREDICTIONS';
    }

    const constraints = { video: true };

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      });
    }
  };

  const predictWebcam = async () => {
    if (runningMode === 'IMAGE') {
      runningMode = 'VIDEO';
      await gestureRecognizer.setOptions({ runningMode: 'VIDEO' });
    }

    if (videoRef.current.currentTime !== lastVideoTime) {
      lastVideoTime = videoRef.current.currentTime;
      const nowInMs = Date.now();
      const results = gestureRecognizer.recognizeForVideo(videoRef.current, nowInMs);

      const canvasCtx = canvasRef.current.getContext('2d');
      const drawingUtils = new DrawingUtils(canvasCtx);

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.style.height = videoHeight;
      videoRef.current.style.height = videoHeight;
      canvasRef.current.style.width = videoWidth;
      videoRef.current.style.width = videoWidth;

      if (results.landmarks) {
        for (const landmarks of results.landmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            GestureRecognizer.HAND_CONNECTIONS,
            { color: '#00FF00', lineWidth: 5 }
          );
          drawingUtils.drawLandmarks(landmarks, { color: '#FF0000', lineWidth: 2 });
        }
      }
      canvasCtx.restore();

      if (results.gestures.length > 0) {
        outputRef.current.style.display = 'block';
        outputRef.current.style.width = videoWidth;
        const categoryName = results.gestures[0][0].categoryName;
        const categoryScore = (results.gestures[0][0].score * 100).toFixed(2);
        const handedness = results.handednesses[0][0].displayName;
        outputRef.current.innerText = `GestureRecognizer: ${categoryName}\nConfidence: ${categoryScore} %\nHandedness: ${handedness}`;
      } else {
        outputRef.current.style.display = 'none';
      }
    }

    if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  return (
    <div>
      
      <section>
        <h2>The model can understand 🤘✊👋☝️👎👍✌️ hand gestures </h2>
        
        {hasGetUserMedia() ? (
          <div>
            <button ref={buttonRef} onClick={enableCam}>
              ENABLE WEBCAM
            </button>
            <div style={{ position: 'relative' }}>
              <video ref={videoRef} autoPlay playsInline></video>
              <canvas ref={canvasRef} className="output_canvas" width="1280" height="720"></canvas>
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

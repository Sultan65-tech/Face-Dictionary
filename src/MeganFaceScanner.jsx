import React, { useEffect, useRef,useState } from 'react';
import * as faceapi from 'face-api.js';
import Emotion from "./Emotion.jsx"

function MeganFaceScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [emotions, setEmotions] = useState({
    happy: 0,
    sad: 0,
    angry: 0,
    neutral: 0,
    surprised: 0,
    fearful: 0,
    disgusted: 0,
    dominant: 'ANALYZING...'
  });

  // Define video/canvas dimensions here so they match perfectly!
  const DISPLAY_WIDTH = 1280; // Changed from 640 to 1280
  const DISPLAY_HEIGHT = 720; // Changed from 480 to 720

  useEffect(() => {
    const loadModelsAndStart = async () => {
      // Load models from CDN or local public folder
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);

      // Request HD video stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    loadModelsAndStart();
  }, []);

  const handleVideoPlay = () => {
    setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      // FIX 1: MUST RETURN EARLY IF NO FACE DETECTED
      if (!detections || detections.length === 0) {
        console.log("NO face detected!");
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        return; 
      }

      const displaySize = {
        width: videoRef.current.videoWidth || DISPLAY_WIDTH,
        height: videoRef.current.videoHeight || DISPLAY_HEIGHT
      };

      faceapi.matchDimensions(canvasRef.current, displaySize);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
 
      // --- EXTRACT VALUES INSIDE FUNCTION ---
      const expr = resizedDetections[0].expressions;

   // 2. PUSH VALUES OUT OF FUNCTION INTO REACT STATE
      setEmotions({
        happy: Math.round(expr.happy * 100),
        sad: Math.round(expr.sad * 100),
        angry: Math.round(expr.angry * 100),
        neutral: Math.round(expr.neutral * 100),
        surprised: Math.round(expr.surprised * 100),
        fearful: Math.round(expr.fearful * 100),
        disgusted: Math.round(expr.disgusted * 100),
        // dominant: topEmotions.toUpperCase()
      });

      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, displaySize.width, displaySize.height);

      // FIX 2 & 3: SHIFT THE CANVAS CONTEXT TO MOVE THE DIAGRAM CLEANLY
      const offsetX = 50;  // 50px RIGHT
      const offsetY = -30; // 30px UP

      ctx.save();
      ctx.translate(offsetX, offsetY); // Shifts faceapi drawing automatically!

// Define custom styling options
const drawOptions = {
  lineWidth: 4,               // Thicker line stroke (default is ~1)
  lineColor: '#00ffcc',       // Neon Cyan / Green color
  drawLines: true,            // Connect landmark points with lines
  drawPoints: true,           // Draw dots at key nodes
  pointSize: 3                // Make node dots larger
};
const landmarks = resizedDetections.map((d) => d.landmarks);
      
      // Draw custom-styled landmarks onto canvas
      faceapi.draw.drawFaceLandmarks(canvasRef.current, landmarks, drawOptions);

      ctx.restore(); // Reset shift for next frame
    }, 100);
  };
// Create the drawer instance
// const drawLandmarks = new faceapi.draw.DrawFaceLandmarks(resizedDetections, drawOptions);

// Draw onto canvas
// drawLandmarks.draw(canvasRef.current);
      
      // Draw tracking mesh overlay & Emotion tags inside shifted space
    //   faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
    //   faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

    //   ctx.restore(); // Reset canvas shift for next frame
//     }, 100);
//   };

  return (
<>

    <div style={{ position: 'relative', width: `${DISPLAY_WIDTH}px`, height: `${DISPLAY_HEIGHT}px` }}>
      <video
        ref={videoRef}
        onPlay={handleVideoPlay}
        autoPlay
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
    </div>
    <div className="emotions">
  <Emotion emotion="Neutral" val={emotions.neutral} color="gray"/>
   <Emotion emotion="Happy" val={emotions.happy} color="rgb(21, 184, 21"/>
      <Emotion emotion="Angry" val={emotions.angry} color="red"/>
    <Emotion emotion="Sad" val={emotions.sad} color="purple"/>
     <Emotion emotion="Fearful" val={emotions.fearful} color="brown"/>
          <Emotion emotion="Disgusted" val={emotions.disgusted} color="orange"/>
               <Emotion emotion="Surprised" val={emotions.surprised} color="yellow"/>


  </div>
    </>
  );
}

export default MeganFaceScanner;
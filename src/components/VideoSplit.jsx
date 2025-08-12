import React, { useEffect, useRef } from "react";
import "../styles/VideoSplit.css";

const VideoSplit = ({ aiVideoSrc, isSpeaking }) => {
  const webcamRef = useRef(null);
  const aiVideoRef = useRef(null);

  useEffect(() => {
    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          webcamRef.current.play();
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    }
    startWebcam();

    return () => {
      if (webcamRef.current && webcamRef.current.srcObject) {
        webcamRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (aiVideoRef.current) {
      if (isSpeaking) {
        aiVideoRef.current.play().catch(() => {});
      } else {
        aiVideoRef.current.pause();
      }
    }
  }, [isSpeaking]);

  return (
    <div className="video-split-container">
      <video
        ref={webcamRef}
        muted
        playsInline
        className="video-split-webcam"
      />
      <video
        ref={aiVideoRef}
        src={aiVideoSrc}
        loop
        muted
        playsInline
        className="video-split-ai"
      />
    </div>
  );
};

export default VideoSplit;

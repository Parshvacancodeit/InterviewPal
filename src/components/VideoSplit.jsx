import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import "../styles/VideoSplit.css";

const VideoSplit = forwardRef(({ aiVideoSrc, isSpeaking }, ref) => {
  const webcamRef = useRef(null);
  const aiVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Start webcam
  useEffect(() => {
    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = stream;
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
      stopWebcam();
    };
  }, []);

  // Pause/play AI video
  useEffect(() => {
    if (aiVideoRef.current) {
      if (isSpeaking) {
        aiVideoRef.current.play().catch(() => {});
      } else {
        aiVideoRef.current.pause();
      }
    }
  }, [isSpeaking]);

  // 👉 Expose stopWebcam method to parent
  useImperativeHandle(ref, () => ({
    stopWebcam,
  }));

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
  };

  return (
    <div className="video-split-container">
      <video ref={webcamRef} muted playsInline className="video-split-webcam" />
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
});

export default VideoSplit;

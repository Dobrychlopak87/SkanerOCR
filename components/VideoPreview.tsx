
import React, { useEffect } from 'react';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
}

export function VideoPreview({ videoRef, stream }: Props) {
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="absolute inset-0 w-full h-full object-cover grayscale contrast-125"
    />
  );
}

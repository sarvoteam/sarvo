import React, { useEffect, useRef } from 'react';

const TransparentLogo = ({ src, alt, style }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Loop through pixels and remove white background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // If pixel is white or near white, make it transparent
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    };
  }, [src]);

  return (
    <canvas 
      ref={canvasRef} 
      title={alt}
      style={{ ...style, display: 'block' }} 
    />
  );
};

export default TransparentLogo;

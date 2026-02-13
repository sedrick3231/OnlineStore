// cropImage.js
export default function getCroppedImg(
  imageSrc,
  pixelCrop,
  returnType = "dataURL",
  targetWidth = null,
  targetHeight = null
) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Use target dimensions if provided, otherwise use cropped dimensions
      const outputWidth = targetWidth || pixelCrop.width;
      const outputHeight = targetHeight || pixelCrop.height;

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Draw the cropped area and resize to target dimensions
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputWidth,
        outputHeight
      );

      if (returnType === "dataURL") {
        // Return base64 data URL with high quality
        const dataURL = canvas.toDataURL("image/jpeg", 0.92);
        resolve(dataURL);
      } else {
        // Return File object
        canvas.toBlob(
          (blob) => {
            const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
            resolve(file);
          },
          "image/jpeg",
          0.92
        );
      }
    };
    image.onerror = reject;
  });
}


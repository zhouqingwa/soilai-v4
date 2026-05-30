export const compressFile = async (
  file: File | Blob,
  maxWidth = 1024,
  maxHeight = 1024,
  initialQuality = 0.85,
  outputMimeType = 'image/jpeg',
  maxBase64Length = 700 * 1024
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      try {
        ctx.drawImage(img, 0, 0, width, height);

        let quality = initialQuality;
        let dataUrl = canvas.toDataURL(outputMimeType, quality);
        let resultBase64 = dataUrl.split(',')[1];

        while (resultBase64.length > maxBase64Length && quality > 0.15) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL(outputMimeType, quality);
          resultBase64 = dataUrl.split(',')[1];
        }

        if (resultBase64.length > maxBase64Length) {
          reject(new Error("Compressed image is still too large"));
          return;
        }

        resolve(resultBase64);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(e);
    };
  });
};

export const compressImage = async (
  base64Str: string,
  mimeType: string,
  maxWidth = 1024,
  maxHeight = 1024,
  initialQuality = 0.85,
  outputMimeType = 'image/jpeg',
  maxBase64Length = 700 * 1024
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    // Do not set crossOrigin for data URIs as it can cause issues
    img.src = `data:${mimeType};base64,${base64Str}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      try {
        ctx.drawImage(img, 0, 0, width, height);

        let quality = initialQuality;
        let dataUrl = canvas.toDataURL(outputMimeType, quality);
        let resultBase64 = dataUrl.split(',')[1];

        while (resultBase64.length > maxBase64Length && quality > 0.15) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL(outputMimeType, quality);
          resultBase64 = dataUrl.split(',')[1];
        }

        resolve(resultBase64.length <= maxBase64Length ? resultBase64 : base64Str);
      } catch (e) {
        console.warn("Canvas compression failed (likely tainted canvas), returning original image", e);
        resolve(base64Str);
      }
    };
    img.onerror = (e) => {
      console.warn("Image load failed for compression, returning original image", e);
      resolve(base64Str);
    };
  });
};

type ImageSource = { kind: 'file'; file: File | Blob } | { kind: 'base64'; data: string; mimeType: string };

const loadImage = (source: ImageSource): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let objectUrl: string | null = null;

    if (source.kind === 'file') {
      objectUrl = URL.createObjectURL(source.file);
      img.src = objectUrl;
    } else {
      img.src = `data:${source.mimeType};base64,${source.data}`;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (e) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(e);
    };
  });
};

const compressOnCanvas = (
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
  initialQuality: number,
  outputMimeType: string,
  maxBase64Length: number,
  fallback: string
): Promise<string> => {
  return new Promise((resolve) => {
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
      resolve(fallback);
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

      resolve(resultBase64.length <= maxBase64Length ? resultBase64 : fallback);
    } catch (e) {
      console.warn("Canvas compression failed (likely tainted canvas), returning original", e);
      resolve(fallback);
    }
  });
};

export const compressFile = async (
  file: File | Blob,
  maxWidth = 1024,
  maxHeight = 1024,
  initialQuality = 0.85,
  outputMimeType = 'image/jpeg',
  maxBase64Length = 700 * 1024
): Promise<string> => {
  const img = await loadImage({ kind: 'file', file });
  const result = await compressOnCanvas(img, maxWidth, maxHeight, initialQuality, outputMimeType, maxBase64Length, '');

  if (!result) {
    throw new Error("Compressed image is still too large");
  }
  return result;
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
  try {
    const img = await loadImage({ kind: 'base64', data: base64Str, mimeType });
    return await compressOnCanvas(img, maxWidth, maxHeight, initialQuality, outputMimeType, maxBase64Length, base64Str);
  } catch (e) {
    console.warn("Image load failed for compression, returning original image", e);
    return base64Str;
  }
};

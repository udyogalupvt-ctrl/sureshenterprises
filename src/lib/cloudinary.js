const CLOUD_NAME = 'ov8k3cqz';
const UPLOAD_PRESET = 'sureshenterprises';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

/** Downscale and re-encode large photos. Falls back to the original file if the browser can't decode it. */
async function compressImage(file) {
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff'; // JPEG has no alpha channel
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

/** Compresses an image, uploads it to Cloudinary and returns its secure URL. */
export async function uploadImage(file) {
  const body = new FormData();
  body.append('file', await compressImage(file));
  body.append('upload_preset', UPLOAD_PRESET);
  body.append('folder', 'suresh-enterprises/expenses');

  const response = await fetch(UPLOAD_URL, { method: 'POST', body });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message ?? 'Image upload failed');
  }
  return data.secure_url;
}

// Cloudinary UNSIGNED uploads via upload preset (no backend signature needed).

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const IMAGE_ENDPOINT = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const VIDEO_ENDPOINT = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

function uploadFile(
  file: File,
  endpoint: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } catch {
          console.error("[Cloudinary] Failed to parse response:", xhr.responseText);
          reject(new Error("Failed to parse upload response"));
        }
      } else {
        console.error("[Cloudinary] Upload failed:", xhr.status, xhr.responseText);
        reject(new Error(`Upload failed: ${xhr.status} - ${xhr.responseText}`));
      }
    });

    xhr.addEventListener("error", () => {
      console.error("[Cloudinary] Network error during upload. Status:", xhr.status);
      reject(new Error(`Network error during upload (status: ${xhr.status})`));
    });
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", endpoint);
    xhr.send(formData);
  });
}

// Upload image to Cloudinary (unsigned)
export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return uploadFile(file, IMAGE_ENDPOINT, onProgress);
}

// Upload multiple images
export async function uploadImagesToCloudinary(
  files: File[],
  onProgress?: (current: number, total: number, percent: number) => void,
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadImageToCloudinary(files[i], (p) =>
      onProgress?.(i + 1, files.length, p),
    );
    urls.push(url);
  }
  return urls;
}

// Upload video/reel to Cloudinary (unsigned)
export async function uploadVideoToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return uploadFile(file, VIDEO_ENDPOINT, onProgress);
}

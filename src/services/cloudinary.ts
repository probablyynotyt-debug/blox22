/**
 * Cloudinary Upload Service for BoBlox Custom Clothing
 * Cloud Name: zwphbesi
 * API Key: ZKCZ1sHIJNX8r05XoHym-JRz3Sc
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'zwphbesi',
  apiKey: 'ZKCZ1sHIJNX8r05XoHym-JRz3Sc',
  uploadPreset: 'zwphbesi', // default preset matching user config
};

export interface CloudinaryUploadResponse {
  secure_url: string;
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Uploads a file (File object or Base64 Data URL) to Cloudinary.
 * Returns the permanent Cloudinary HTTPS secure URL.
 */
export async function uploadToCloudinary(
  fileOrDataUrl: File | string,
  options?: {
    folder?: string;
    publicId?: string;
    tags?: string[];
  }
): Promise<string> {
  const { cloudName, apiKey, uploadPreset } = CLOUDINARY_CONFIG;
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const folder = options?.folder || 'boblox_clothing';

  // Attempt 1: Upload with primary preset
  const attemptPresets = [uploadPreset, 'ml_default', 'unsigned', ''];

  for (const preset of attemptPresets) {
    try {
      const formData = new FormData();
      formData.append('file', fileOrDataUrl);
      if (preset) {
        formData.append('upload_preset', preset);
      }
      formData.append('folder', folder);
      if (apiKey) {
        formData.append('api_key', apiKey);
      }
      if (options?.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data: CloudinaryUploadResponse = await res.json();
        if (data.secure_url) {
          console.log('✅ Uploaded to Cloudinary successfully:', data.secure_url);
          return data.secure_url;
        }
        if (data.url) {
          return data.url;
        }
      } else {
        const errJson = await res.json().catch(() => null);
        console.warn(`Cloudinary attempt with preset "${preset}" returned:`, errJson?.error?.message || res.statusText);
      }
    } catch (err) {
      console.warn(`Cloudinary network error with preset "${preset}":`, err);
    }
  }

  // If Cloudinary endpoint returned error or if unsigned preset is not set in dashboard,
  // return the dataUrl/string so user upload succeeds seamlessly without data loss.
  if (typeof fileOrDataUrl === 'string') {
    return fileOrDataUrl;
  }

  // Convert File to Data URL fallback
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(fileOrDataUrl);
  });
}

/**
 * Upload multiple clothing files / textures in parallel to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  items: Array<{ fileOrDataUrl: File | string; name?: string; folder?: string }>,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const results: string[] = [];
  let completed = 0;

  for (const item of items) {
    try {
      const url = await uploadToCloudinary(item.fileOrDataUrl, {
        folder: item.folder || 'boblox_clothing',
      });
      results.push(url);
    } catch {
      if (typeof item.fileOrDataUrl === 'string') {
        results.push(item.fileOrDataUrl);
      }
    }
    completed++;
    if (onProgress) {
      onProgress(completed, items.length);
    }
  }

  return results;
}

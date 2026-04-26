import imageCompression from "browser-image-compression";

/**
 * Utility to compress images using browser-image-compression library.
 * This is more reliable as it handles EXIF orientation and better quality balancing.
 */

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Default options
  const config = {
    maxSizeMB: options.maxSizeMB || 1, // Target size 1MB
    maxWidthOrHeight: options.maxWidthOrHeight || 1920, // Max dimension
    useWebWorker: options.useWebWorker !== undefined ? options.useWebWorker : true,
    initialQuality: 0.8,
  };

  try {
    // If it's already smaller than the target size, no need to compress
    if (file.size / 1024 / 1024 < config.maxSizeMB) {
      return file;
    }

    const compressedBlob = await imageCompression(file, config);
    
    // Convert blob back to File object to preserve original metadata/name
    return new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Image compression failed:", error);
    // Fallback to original file if compression fails
    return file;
  }
}

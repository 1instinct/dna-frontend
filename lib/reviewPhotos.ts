/**
 * Client-side photo prep for the review composer: decode, scale down to
 * at most 1600 px on the long edge and re-encode as JPEG (~0.85). Re-encoding
 * also drops EXIF data such as GPS location. Files the browser can't decode
 * (HEIC on most non-Safari browsers) are sent as they are; the API accepts
 * HEIC/HEIF and converts them.
 */

export const REVIEW_PHOTO_MAX_DIMENSION = 1600;
export const REVIEW_PHOTO_QUALITY = 0.85;

export interface PreparedPhoto {
  /** What gets uploaded as `photos[]`. */
  file: File;
  /** Object URL for the preview, or null when the browser can't show it. */
  previewUrl: string | null;
  /** True when the original was sent because it couldn't be decoded. */
  original: boolean;
}

interface Decoded {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

const loadWithImageElement = (file: Blob): Promise<Decoded> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    img.onload = () =>
      resolve({
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        release: () => URL.revokeObjectURL(url)
      });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });

const decode = async (file: Blob): Promise<Decoded> => {
  if (typeof createImageBitmap === "function") {
    try {
      // Applies the EXIF orientation, so portrait phone photos stay upright.
      // (TS 4.9's DOM types predate the "from-image" value.)
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image"
      } as unknown as ImageBitmapOptions);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close()
      };
    } catch {
      // Fall through to <img>, which some browsers decode more formats with.
    }
  }
  return loadWithImageElement(file);
};

const toBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) =>
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality)
  );

const jpegName = (name: string) =>
  `${(name || "photo").replace(/\.[^./\\]+$/, "") || "photo"}.jpg`;

/**
 * Resizes and re-encodes one photo. Never throws: anything the browser can't
 * decode or encode comes back as the original file.
 */
export const prepareReviewPhoto = async (
  file: File,
  {
    maxDimension = REVIEW_PHOTO_MAX_DIMENSION,
    quality = REVIEW_PHOTO_QUALITY
  }: { maxDimension?: number; quality?: number } = {}
): Promise<PreparedPhoto> => {
  const original = (): PreparedPhoto => {
    const canPreview = /^image\/(jpe?g|png|webp|gif|avif|bmp)$/i.test(
      file.type
    );
    return {
      file,
      previewUrl: canPreview ? URL.createObjectURL(file) : null,
      original: true
    };
  };

  if (typeof document === "undefined") return original();

  let decoded: Decoded;
  try {
    decoded = await decode(file);
  } catch {
    return original();
  }

  try {
    const { width, height } = decoded;
    if (!width || !height) return original();
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return original();
    // JPEG has no alpha; paint transparent PNGs on white instead of black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
    const blob = await toBlob(canvas, quality);
    if (!blob) return original();
    const resized = new File([blob], jpegName(file.name), {
      type: "image/jpeg",
      lastModified: Date.now()
    });
    return {
      file: resized,
      previewUrl: URL.createObjectURL(resized),
      original: false
    };
  } catch {
    return original();
  } finally {
    decoded.release();
  }
};

const HEIC_EXTENSION = /\.(heic|heif)$/i;

/** The MIME type to validate against; some browsers leave HEIC files untyped. */
export const photoMimeType = (file: File): string => {
  if (file.type) return file.type.toLowerCase();
  if (HEIC_EXTENSION.test(file.name)) return "image/heic";
  return "";
};

/** True for anything that looks like a photo, before decoding. */
export const looksLikePhoto = (file: File): boolean => {
  const type = photoMimeType(file);
  return type.startsWith("image/") || HEIC_EXTENSION.test(file.name);
};

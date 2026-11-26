import React, { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@lib/utils";
import {
  looksLikePhoto,
  photoMimeType,
  prepareReviewPhoto
} from "@lib/reviewPhotos";
import type { ReviewFormLimits, ReviewPhoto } from "../../types/reviews";

export interface NewReviewPhoto {
  /** Local id for keys and removal. */
  key: string;
  /** Resized JPEG, or the original when the browser can't decode it (HEIC). */
  file: File;
  previewUrl: string | null;
  name: string;
}

interface PhotoUploaderProps {
  /** Photos picked in this session (not uploaded yet). */
  value: NewReviewPhoto[];
  onChange: (photos: NewReviewPhoto[]) => void;
  /** Photos already on the review being edited (minus removed ones). */
  existing?: ReviewPhoto[];
  onRemoveExisting?: (id: ReviewPhoto["id"]) => void;
  limits?: Partial<ReviewFormLimits>;
  productName?: string;
  /** Server error for `photos`, shown under the picker. */
  error?: string;
  /** Lets the composer block submit while photos are still processing. */
  onBusyChange?: (busy: boolean) => void;
}

const DEFAULT_MAX_PHOTOS = 5;
const DEFAULT_MAX_MB = 10;

let photoCounter = 0;
const nextKey = () => {
  photoCounter += 1;
  return `photo-${Date.now().toString(36)}-${photoCounter}`;
};

/** Revokes a preview's object URL. */
export const releasePhoto = (photo: NewReviewPhoto) => {
  if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
};

const Tile = ({
  src,
  alt,
  label,
  onRemove,
  removeLabel
}: {
  src: string | null;
  alt: string;
  label?: string;
  onRemove: () => void;
  removeLabel: string;
}) => (
  <li className="relative aspect-square overflow-hidden rounded-lg bg-muted">
    {src ? (
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    ) : (
      <span className="flex h-full w-full items-center justify-center p-2 text-center font-body text-[11px] leading-tight text-muted-foreground">
        {label || alt}
      </span>
    )}
    <button
      type="button"
      onClick={onRemove}
      aria-label={removeLabel}
      className="group absolute right-0 top-0 flex h-11 w-11 items-start justify-end p-1.5 focus-visible:outline-none"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white transition-colors group-hover:bg-black group-focus-visible:ring-2 group-focus-visible:ring-brand group-focus-visible:ring-offset-1">
        <X className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  </li>
);

/**
 * Camera-roll picker for review photos: `accept="image/*"`, multiple, up to
 * `limits.max_photos` in total. Each photo is resized on the device (≤ 1600 px
 * JPEG) before upload; HEIC files the browser can't decode go up as they are.
 * Validates type and size against the form's `limits`.
 */
export const PhotoUploader = ({
  value,
  onChange,
  existing = [],
  onRemoveExisting,
  limits,
  productName,
  error,
  onBusyChange
}: PhotoUploaderProps) => {
  const inputId = useId();
  const hintId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const [busy, setBusy] = useState(0);
  const [problems, setProblems] = useState<string[]>([]);

  const maxPhotos = limits?.max_photos || DEFAULT_MAX_PHOTOS;
  const maxMb = limits?.max_photo_mb || DEFAULT_MAX_MB;
  const allowedTypes = (limits?.photo_types || []).map((t) => t.toLowerCase());
  const total = existing.length + value.length;
  const slotsLeft = Math.max(0, maxPhotos - total - busy);
  const alt = productName
    ? `Customer photo of ${productName}`
    : "Customer photo";

  useEffect(() => {
    onBusyChange?.(busy > 0);
  }, [busy, onBusyChange]);

  const addFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (inputRef.current) inputRef.current.value = "";
    if (!files.length) return;

    const issues: string[] = [];
    const photos = files.filter((file) => {
      if (looksLikePhoto(file)) return true;
      issues.push(`${file.name} isn't a photo.`);
      return false;
    });
    const accepted = photos.slice(0, slotsLeft);
    if (photos.length > accepted.length) {
      issues.push(
        `You can add up to ${maxPhotos} photos, so ${
          photos.length - accepted.length === 1
            ? "one wasn't"
            : `${photos.length - accepted.length} weren't`
        } added.`
      );
    }
    setProblems(issues);
    if (!accepted.length) return;

    setBusy((count) => count + accepted.length);
    const prepared = await Promise.all(
      accepted.map((file) => prepareReviewPhoto(file))
    );
    setBusy((count) => Math.max(0, count - accepted.length));

    const added: NewReviewPhoto[] = [];
    prepared.forEach((result, index) => {
      const source = accepted[index];
      const type = photoMimeType(result.file);
      const reject = (message: string) => {
        if (result.previewUrl) URL.revokeObjectURL(result.previewUrl);
        issues.push(message);
      };
      if (allowedTypes.length && !allowedTypes.includes(type)) {
        reject(
          `${source.name} isn't a supported photo type. Try a JPEG or PNG.`
        );
        return;
      }
      if (result.file.size > maxMb * 1024 * 1024) {
        reject(`${source.name} is larger than ${maxMb} MB.`);
        return;
      }
      added.push({
        key: nextKey(),
        file: result.file,
        previewUrl: result.previewUrl,
        name: source.name
      });
    });
    setProblems([...issues]);
    if (added.length) onChange([...valueRef.current, ...added]);
  };

  const removeNew = (photo: NewReviewPhoto) => {
    releasePhoto(photo);
    onChange(valueRef.current.filter((item) => item.key !== photo.key));
    inputRef.current?.focus();
  };

  const messages = [...problems, ...(error ? [error] : [])];
  const full = slotsLeft === 0 && busy === 0;

  return (
    <div className="grid gap-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        disabled={full}
        aria-describedby={`${hintId} ${statusId}`}
        className="peer sr-only"
        onChange={(event) => addFiles(event.target.files)}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "grid min-h-[112px] cursor-pointer justify-items-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-border p-5 text-center font-body text-sm text-muted-foreground transition-colors",
          "hover:border-brand peer-focus-visible:border-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2",
          full && "cursor-not-allowed opacity-60 hover:border-border"
        )}
      >
        <ImagePlus className="h-6 w-6 text-brand-dark" aria-hidden="true" />
        <span className="text-foreground">
          {full
            ? `You've added ${maxPhotos} photos`
            : `Choose up to ${maxPhotos} photos`}
        </span>
        <span id={hintId} className="text-xs">
          JPEG, PNG or HEIC, up to {maxMb} MB each. Photos of it on, or in
          daylight, help the most.
        </span>
      </label>

      {(existing.length > 0 || value.length > 0 || busy > 0) && (
        <ul
          className="grid grid-cols-3 gap-2 sm:grid-cols-5"
          aria-label="Your photos"
        >
          {existing.map((photo, index) => (
            <Tile
              key={`existing-${photo.id}`}
              src={photo.thumb_url || photo.card_url}
              alt={photo.alt || alt}
              onRemove={() => onRemoveExisting?.(photo.id)}
              removeLabel={`Remove photo ${index + 1}`}
            />
          ))}
          {value.map((photo, index) => (
            <Tile
              key={photo.key}
              src={photo.previewUrl}
              alt={`New photo: ${photo.name}`}
              label={photo.name}
              onRemove={() => removeNew(photo)}
              removeLabel={`Remove photo ${existing.length + index + 1}`}
            />
          ))}
          {Array.from({ length: busy }, (_, i) => (
            <li
              key={`busy-${i}`}
              className="flex aspect-square items-center justify-center rounded-lg bg-muted"
            >
              <Loader2
                className="h-5 w-5 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      )}

      <div id={statusId} aria-live="polite" className="grid gap-1">
        {busy > 0 && (
          <p className="m-0 font-body text-xs text-muted-foreground">
            Preparing {busy === 1 ? "photo" : `${busy} photos`}…
          </p>
        )}
        {messages.map((message) => (
          <p key={message} className="m-0 font-body text-xs text-red">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default PhotoUploader;

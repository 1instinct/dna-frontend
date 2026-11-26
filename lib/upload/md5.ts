// Incremental MD5 (RFC 1321) for direct uploads. ActiveStorage checks every
// upload against the base64 MD5 the client declares, so the browser has to
// hash the file first. Fed in chunks so a 50 MB file never sits in memory
// twice. Pure: no window, runs under node --test.

const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
  9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
  16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
  21
];

const K = new Int32Array(64);
for (let i = 0; i < 64; i++) {
  K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
}

export class Md5 {
  private a = 0x67452301;
  private b = 0xefcdab89 | 0;
  private c = 0x98badcfe | 0;
  private d = 0x10325476;
  private buffer = new Uint8Array(64);
  private buffered = 0;
  private length = 0; // bytes; safe to 2^53
  private words = new Int32Array(16);

  update(bytes: Uint8Array): this {
    let offset = 0;
    this.length += bytes.length;
    if (this.buffered > 0) {
      const take = Math.min(64 - this.buffered, bytes.length);
      this.buffer.set(bytes.subarray(0, take), this.buffered);
      this.buffered += take;
      offset = take;
      if (this.buffered < 64) return this;
      this.block(this.buffer, 0);
      this.buffered = 0;
    }
    for (; offset + 64 <= bytes.length; offset += 64) this.block(bytes, offset);
    if (offset < bytes.length) {
      this.buffer.set(bytes.subarray(offset), 0);
      this.buffered = bytes.length - offset;
    }
    return this;
  }

  digest(): Uint8Array {
    const bitLenLo = (this.length * 8) >>> 0;
    const bitLenHi = Math.floor(this.length / 0x20000000) >>> 0;
    const padLen =
      this.buffered < 56 ? 56 - this.buffered : 120 - this.buffered;
    const pad = new Uint8Array(padLen + 8);
    pad[0] = 0x80;
    for (let i = 0; i < 4; i++) {
      pad[padLen + i] = (bitLenLo >>> (8 * i)) & 0xff;
      pad[padLen + 4 + i] = (bitLenHi >>> (8 * i)) & 0xff;
    }
    const length = this.length;
    this.update(pad);
    this.length = length;
    const out = new Uint8Array(16);
    [this.a, this.b, this.c, this.d].forEach((v, w) => {
      for (let i = 0; i < 4; i++) out[w * 4 + i] = (v >>> (8 * i)) & 0xff;
    });
    return out;
  }

  private block(bytes: Uint8Array, offset: number) {
    const x = this.words;
    for (let i = 0; i < 16; i++) {
      const o = offset + i * 4;
      x[i] =
        bytes[o] |
        (bytes[o + 1] << 8) |
        (bytes[o + 2] << 16) |
        (bytes[o + 3] << 24);
    }
    let a = this.a;
    let b = this.b;
    let c = this.c;
    let d = this.d;
    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) & 15;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) & 15;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) & 15;
      }
      const t = d;
      d = c;
      c = b;
      const sum = (a + f + K[i] + x[g]) | 0;
      b = (b + ((sum << S[i]) | (sum >>> (32 - S[i])))) | 0;
      a = t;
    }
    this.a = (this.a + a) | 0;
    this.b = (this.b + b) | 0;
    this.c = (this.c + c) | 0;
    this.d = (this.d + d) | 0;
  }
}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function bytesToBase64(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const n =
      (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    out += i + 1 < bytes.length ? B64[(n >> 6) & 63] : "=";
    out += i + 2 < bytes.length ? B64[n & 63] : "=";
  }
  return out;
}

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

export const md5Hex = (bytes: Uint8Array): string =>
  toHex(new Md5().update(bytes).digest());

export const md5Base64 = (bytes: Uint8Array): string =>
  bytesToBase64(new Md5().update(bytes).digest());

export const MD5_CHUNK_SIZE = 2 * 1024 * 1024;

/** Base64 MD5 of a Blob/File, read `chunkSize` bytes at a time. */
export async function md5BlobBase64(
  blob: Blob,
  {
    chunkSize = MD5_CHUNK_SIZE,
    onProgress,
    signal
  }: {
    chunkSize?: number;
    onProgress?: (doneBytes: number, totalBytes: number) => void;
    signal?: AbortSignal;
  } = {}
): Promise<string> {
  const h = new Md5();
  for (let o = 0; o < blob.size; o += chunkSize) {
    if (signal?.aborted) throw new Error("aborted");
    const part = blob.slice(o, Math.min(o + chunkSize, blob.size));
    h.update(new Uint8Array(await part.arrayBuffer()));
    onProgress?.(Math.min(o + chunkSize, blob.size), blob.size);
  }
  return bytesToBase64(h.digest());
}

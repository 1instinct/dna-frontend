import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  bytesToBase64,
  Md5,
  md5Base64,
  md5BlobBase64,
  md5Hex
} from "../upload/md5";

const enc = (s: string) => new TextEncoder().encode(s);

// RFC 1321 appendix A.5 test suite.
const RFC_VECTORS: [string, string][] = [
  ["", "d41d8cd98f00b204e9800998ecf8427e"],
  ["a", "0cc175b9c0f1b6a831c399e269772661"],
  ["abc", "900150983cd24fb0d6963f7d28e17f72"],
  ["message digest", "f96b697d7cb7938d525a2f31aaf161d0"],
  ["abcdefghijklmnopqrstuvwxyz", "c3fcd3d76192e4007dfb496cca67e13b"],
  [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    "d174ab98d277d9f5a5611c2c9f419d9f"
  ],
  [
    "12345678901234567890123456789012345678901234567890123456789012345678901234567890",
    "57edf4a22be3c955ac49da2e2107b67a"
  ]
];

describe("md5", () => {
  for (const [input, hex] of RFC_VECTORS) {
    test(`RFC 1321 vector ${JSON.stringify(input.slice(0, 16))}`, () => {
      assert.equal(md5Hex(enc(input)), hex);
    });
  }

  test("base64 digest is what ActiveStorage expects as checksum", () => {
    // `Digest::MD5.base64digest("hello world")`
    assert.equal(md5Base64(enc("hello world")), "XrY7u+Ae7tCTyyK7j1rNww==");
  });

  test("chunked updates of any size give the one-shot digest", () => {
    const data = new Uint8Array(10_000);
    for (let i = 0; i < data.length; i++) data[i] = (i * 31 + 7) & 0xff;
    const whole = md5Hex(data);
    for (const size of [1, 3, 63, 64, 65, 1000, 4096]) {
      const h = new Md5();
      for (let o = 0; o < data.length; o += size) {
        h.update(data.subarray(o, o + size));
      }
      assert.equal(
        Array.from(h.digest(), (b) => b.toString(16).padStart(2, "0")).join(""),
        whole,
        `chunk size ${size}`
      );
    }
  });

  test("a million 'a's (multi-block, length > 2^16 bits)", () => {
    const data = new Uint8Array(1_000_000).fill(0x61);
    assert.equal(md5Hex(data), "7707d6ae4e027c70eea2a935c2296f21");
  });

  test("md5BlobBase64 reads a Blob in chunks and reports progress", async () => {
    const text = "The quick brown fox jumps over the lazy dog";
    const blob = new Blob([enc(text)]);
    const seen: number[] = [];
    const b64 = await md5BlobBase64(blob, {
      chunkSize: 8,
      onProgress: (done) => seen.push(done)
    });
    // md5("The quick brown fox...") = 9e107d9d372bb6826bd81d3542a419d6
    assert.equal(b64, "nhB9nTcrtoJr2B01QqQZ1g==");
    assert.equal(seen[seen.length - 1], text.length);
    assert.ok(seen.length >= 5);
  });

  test("bytesToBase64 handles every padding length", () => {
    assert.equal(bytesToBase64(enc("")), "");
    assert.equal(bytesToBase64(enc("f")), "Zg==");
    assert.equal(bytesToBase64(enc("fo")), "Zm8=");
    assert.equal(bytesToBase64(enc("foo")), "Zm9v");
  });
});

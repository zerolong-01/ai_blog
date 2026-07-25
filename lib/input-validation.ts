export const INPUT_LIMITS = {
  adminId: 100,
  adminPassword: 256,
  postTitle: 200,
  postSlug: 120,
  postContentBytes: 200 * 1024
} as const;

export function exceedsUtf8Bytes(value: string, maxBytes: number) {
  return Buffer.byteLength(value, "utf8") > maxBytes;
}

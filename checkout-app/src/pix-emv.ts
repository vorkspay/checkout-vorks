/**
 * Validação do BR Code (payload EMV do Pix) — cópia local para o app
 * de checkout standalone (sem alias @/).
 */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function isValidPixEmv(code: unknown): code is string {
  if (typeof code !== "string") return false;
  const c = code.trim();
  if (c.length < 30 || c.length > 1024) return false;
  if (!c.startsWith("000201")) return false;
  if (!/br\.gov\.bcb\.pix/i.test(c)) return false;
  const idx = c.lastIndexOf("6304");
  if (idx < 0 || idx !== c.length - 8) return false;
  return crc16(c.slice(0, idx + 4)) === c.slice(idx + 4).toUpperCase();
}

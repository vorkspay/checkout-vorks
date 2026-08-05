/**
 * Utilitários de validação do BR Code (payload EMV do Pix).
 * Um QR só é pagável se o conteúdo for o payload EMV correto — uma URL
 * ou texto qualquer gera um QR "bonito" porém inválido no app do banco.
 */

/** CRC16-CCITT (0x1021, init 0xFFFF) — algoritmo exigido pelo BR Code. */
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

/**
 * Valida o BR Code: precisa começar com "000201", conter o GUI do Pix
 * (br.gov.bcb.pix) e ter o CRC final correto.
 */
export function isValidPixEmv(code: unknown): code is string {
  if (typeof code !== "string") return false;
  const c = code.trim();
  if (c.length < 30 || c.length > 1024) return false;
  if (!c.startsWith("000201")) return false;
  if (!/br\.gov\.bcb\.pix/i.test(c)) return false;
  const idx = c.lastIndexOf("6304");
  if (idx < 0 || idx !== c.length - 8) return false;
  const expected = crc16(c.slice(0, idx + 4));
  return expected === c.slice(idx + 4).toUpperCase();
}

/** Escolhe, entre vários campos possíveis da adquirente, o primeiro EMV válido. */
export function pickPixEmv(...candidates: unknown[]): string | null {
  for (const raw of candidates) {
    if (typeof raw !== "string") continue;
    const c = raw.trim();
    if (isValidPixEmv(c)) return c;
  }
  // fallback: aceita payload que ao menos aparente ser EMV do Pix (algumas
  // adquirentes devolvem com espaços/quebras), tentando limpar
  for (const raw of candidates) {
    if (typeof raw !== "string") continue;
    const c = raw.replace(/\s+/g, "");
    if (isValidPixEmv(c)) return c;
  }
  return null;
}

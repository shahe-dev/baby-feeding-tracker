import { deflateSync } from "node:zlib";
import { writeFile } from "node:fs/promises";

// Small deterministic PNG encoder. The icons use the same simple bowl drawing
// as app.svg; raster sizes support iPhone Home Screen and older PWA clients.
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function chunk(type, data) {
  const name = Buffer.from(type);
  let crc = 0xffffffff;
  for (const byte of Buffer.concat([name, data]))
    crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  const header = Buffer.alloc(4),
    footer = Buffer.alloc(4);
  header.writeUInt32BE(data.length);
  footer.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([header, name, data, footer]);
}
const colors = {
  blue: [2, 132, 199],
  white: [255, 255, 255],
  sky: [186, 230, 253],
};
function pixel(x, y) {
  if (
    y >= 244 &&
    y <= 386 &&
    ((x - 256) / 140) ** 2 + ((y - 244) / 142) ** 2 <= 1
  )
    return colors.white;
  if (Math.abs(y - 224) <= 12 && x >= 151 && x <= 361) return colors.white;
  if (
    (x - 151) ** 2 + (y - 224) ** 2 <= 144 ||
    (x - 361) ** 2 + (y - 224) ** 2 <= 144
  )
    return colors.white;
  for (const center of [214, 275]) {
    if (
      y >= 109 &&
      y <= 168 &&
      Math.abs(x - center - 9 * Math.sin(((y - 109) / 59) * Math.PI * 2)) <= 7.5
    )
      return colors.sky;
  }
  return colors.blue;
}
export async function generateIcons(directory) {
  for (const size of [180, 192, 512]) {
    const raw = Buffer.alloc((1 + size * 3) * size);
    for (let row = 0; row < size; row++) {
      const start = row * (1 + size * 3);
      raw[start] = 0;
      for (let col = 0; col < size; col++) {
        const total = [0, 0, 0];
        for (const dy of [0.25, 0.75])
          for (const dx of [0.25, 0.75]) {
            const color = pixel(
              ((col + dx) * 512) / size,
              ((row + dy) * 512) / size,
            );
            for (let channel = 0; channel < 3; channel++)
              total[channel] += color[channel];
          }
        for (let channel = 0; channel < 3; channel++)
          raw[start + 1 + col * 3 + channel] = Math.round(total[channel] / 4);
      }
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8;
    ihdr[9] = 2;
    const png = Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", ihdr),
      chunk("IDAT", deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]);
    await writeFile(new URL(`app-${size}.png`, directory), png);
  }
}

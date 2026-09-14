import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";

const QR_SIZE = 1024;
const MARK_PATH = path.join(process.cwd(), "public", "g-livery-qr-mark.png");
const PAPER = { r: 255, g: 255, b: 255, alpha: 1 };

function moduleGradientSvg(width: number) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}">
      <defs>
        <linearGradient id="modules" x1="0" y1="0.08" x2="1" y2="0.2">
          <stop offset="0%" stop-color="#0b6f2b"/>
          <stop offset="40%" stop-color="#15963a"/>
          <stop offset="72%" stop-color="#3dcc58"/>
          <stop offset="100%" stop-color="#22b34a"/>
        </linearGradient>
        <radialGradient id="shine" cx="76%" cy="24%" r="52%">
          <stop offset="0%" stop-color="#e7ffe9" stop-opacity="0.22"/>
          <stop offset="55%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#modules)"/>
      <rect width="100%" height="100%" fill="url(#shine)"/>
    </svg>`,
  );
}

async function greenModules(qr: Buffer) {
  const { data, info } = await sharp(qr).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const maskData = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
    const dark = data[i] < 128;
    maskData[j] = 255;
    maskData[j + 1] = 255;
    maskData[j + 2] = 255;
    maskData[j + 3] = dark ? 255 : 0;
  }

  const mask = await sharp(maskData, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const gradient = await sharp(moduleGradientSvg(info.width)).png().toBuffer();
  const greenQr = await sharp(gradient)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  return { greenQr, width: info.width };
}

async function brandedQrPng(text: string, width: number) {
  const qr = await QRCode.toBuffer(text, {
    type: "png",
    width,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#000000", light: "#ffffff" },
  });

  const { greenQr, width: size } = await greenModules(qr);
  const paper = await sharp({
    create: { width: size, height: size, channels: 4, background: PAPER },
  })
    .composite([{ input: greenQr }])
    .png()
    .toBuffer();

  const pad = Math.round(size * 0.22);
  const logoSize = Math.round(pad * 0.78);
  const radius = Math.round(pad * 0.22);

  const logo = await sharp(await readFile(MARK_PATH))
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  const plateSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pad}" height="${pad}">
      <rect width="${pad}" height="${pad}" rx="${radius}" ry="${radius}" fill="#ffffff"/>
    </svg>`,
  );

  const plate = await sharp(plateSvg)
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer();

  return sharp(paper)
    .composite([{ input: plate, gravity: "centre" }])
    .png()
    .toBuffer();
}

export async function qrPngBuffer(text: string) {
  return brandedQrPng(text, QR_SIZE);
}

export async function qrDataUrl(text: string) {
  const png = await brandedQrPng(text, 320);
  return `data:image/png;base64,${png.toString("base64")}`;
}

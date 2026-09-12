import QRCode from "qrcode";

export async function qrPngBuffer(text: string) {
  return QRCode.toBuffer(text, {
    type: "png",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}

export async function qrDataUrl(text: string) {
  return QRCode.toDataURL(text, {
    width: 320,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}

// Web only: reads an image file the user picked and returns it as a PNG data URL small enough to store.
// PNG keeps the transparency of a scanned signature; JPG input is converted. The size is reduced step by
// step until it fits `maxBytes` (the server rejects anything above 300 KB).

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')); };
    img.src = url;
  });
}

export async function fileToResizedPng(file: File, maxWidth = 600, maxHeight = 300, maxBytes = 280 * 1024): Promise<string> {
  if (!/^image\/(png|jpeg)$/.test(file.type)) throw new Error('Usa una imagen PNG o JPG');
  const img = await loadImage(file);
  let scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
  for (let attempt = 0; attempt < 6; attempt++) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo procesar la imagen');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    // base64 is ~4/3 of the bytes
    if ((dataUrl.length * 3) / 4 <= maxBytes) return dataUrl;
    scale *= 0.75;
  }
  throw new Error('La imagen es demasiado pesada. Usa una más simple o de menor tamaño');
}

/** Opens the browser's file picker and resolves with the chosen file (null if cancelled). */
export function pickImageFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg';
    input.onchange = () => resolve(input.files?.[0] || null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}

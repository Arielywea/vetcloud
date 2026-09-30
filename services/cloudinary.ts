import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'vetcloud_unsigned';

export async function uploadPetPhoto(uri: string): Promise<string> {
  if (!CLOUD_NAME) {
    throw new Error('La subida de fotos no está configurada (falta EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME).');
  }

  // Compress and resize the image
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1600 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  const fileName = `pet_${Date.now()}.jpg`;
  const formData = new FormData();
  if (Platform.OS === 'web') {
    // On web the manipulated uri is a blob:/data: URL; FormData needs the actual Blob
    const blob = await (await fetch(manipulated.uri)).blob();
    formData.append('file', blob, fileName);
  } else {
    formData.append('file', { uri: manipulated.uri, type: 'image/jpeg', name: fileName } as any);
  }
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'vetcloud/pets');

  // No Content-Type header: fetch sets multipart/form-data with the boundary itself
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  let data: any = null;
  try { data = await response.json(); } catch { /* non-JSON error page */ }
  if (!response.ok || !data?.secure_url) {
    throw new Error(data?.error?.message ? `No se pudo subir la foto: ${data.error.message}` : 'No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo.');
  }
  return data.secure_url;
}

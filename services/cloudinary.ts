import * as ImageManipulator from 'expo-image-manipulator';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'vetcloud_unsigned';

export async function uploadPetPhoto(uri: string): Promise<string> {
  if (!CLOUD_NAME) {
    throw new Error('Cloudinary cloud name not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME in .env');
  }

  // Compress and resize the image
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1600 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  // Create FormData for upload
  const formData = new FormData();
  formData.append('file', {
    uri: manipulated.uri,
    type: 'image/jpeg',
    name: `pet_${Date.now()}.jpg`,
  } as any);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'vetcloud/pets');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error uploading image');
  }

  const data = await response.json();
  return data.secure_url;
}

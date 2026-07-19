import { API_URL } from '../config';

export const FileService = {
  async uploadFile(file: Blob, fileName: string): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('file', file, fileName);

      const response = await fetch(`${API_URL}/files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      const result = await response.json();
      return result.data?.id || null;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  },

  async uploadImage(uri: string, fileName: string): Promise<string | null> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return this.uploadFile(blob, fileName);
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  },

  getFileUrl(fileId: string): string {
    return `${API_URL}/uploads/${fileId}`;
  },

  getThumbnailUrl(fileId: string, width: number = 200, height: number = 200): string {
    return `${API_URL}/uploads/${fileId}`;
  },

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/files/${fileId}`, { method: 'DELETE' });
      return response.ok;
    } catch (error) {
      console.error('File delete error:', error);
      return false;
    }
  },
};

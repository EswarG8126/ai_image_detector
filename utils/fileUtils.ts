
export const fileToBase64 = (file: File): Promise<{ base64Data: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader did not return a string.'));
      }
      // result is a data URL like "data:image/jpeg;base64,..."
      // we need to split it to get the mime type and the base64 data
      const [header, data] = reader.result.split(',');
      if (!header || !data) {
        return reject(new Error('Invalid file format.'));
      }
      const mimeType = header.split(':')[1].split(';')[0];
      resolve({ base64Data: data, mimeType });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

import ImageKit from '@imagekit/nodejs';
import { Config } from '../config/config.js';

const client = new ImageKit({
  privateKey: Config.IMAGEKIT_PRIVATE_KEY,
});

export const uploadFile = async ({ buffer, fileName, folder = 'stitch' }) => {
  const result = await client.files.upload({
    file: await ImageKit.toFile(buffer),
    fileName,
    folder,
  });

  return {
    fileUrl: result.url,
    fileId: result.fileId,
  };
};

export const deleteFile = async (fileId) => client.files.delete(fileId);

import ImageKit from '@imagekit/nodejs';
import { Config } from '../config/config.js';

const client = new ImageKit({
  privateKey: Config.IMAGEKIT_PRIVATE_KEY,
});

export const uploadFile = async ({ buffer, fileName, foulder = 'stitch' }) => {
  const result = await client.files.upload({
    file: await ImageKit.toFile(buffer),
    fileName,
    folder: foulder,
  });

  return {
    fileUrl: result.url,
    fileId: result.fileId,
  };

  return result;
};

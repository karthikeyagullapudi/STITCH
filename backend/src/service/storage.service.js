import ImageKit from '@imagekit/nodejs';
import { Config } from '../config/config';

const clint = new ImageKit({
  privateKey: Config.IMAGE_KIT_PRIVATE_KEY,
});

export const uploadImage = async (
  Buffer,
  filename,
  folder = 'STITCH/products',
) => {
  try {
    const response = await clint.files.upload({
      file: Buffer,
      fileName: filename,
      folder: folder,
    });

    return {
      fileUrl: response.url,
      fileId: response.fileId,
    };
  } catch (error) {
    console.log(error);
  }
};

import {
  httpError,
} from "../utility/httpUtility.js";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";

const maxWidth = 2048;
const maxHeight = 2048;

const sanitizeProfileImage = async (file) => {

    if (!file) httpError(400, "No file uploaded");

    const detected = await fileTypeFromBuffer(file.buffer);
    if (!detected || !["image/jpeg", "image/png"].includes(detected.mime)) {
      httpError(400, "Invalid or corrupted image file");
    }

    const meta = await sharp(file.buffer).metadata();

    /*
    if (meta.width > 2048 || meta.height > 2048) {
      httpError(400, "Image dimensions too large (max 2048x2048)");
    }

    const sanitizedBuffer = await sharp(file.buffer)
      .resize(512, 512, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();
    */

    let imagePipeline = sharp(file.buffer).withMetadata();

    if (meta.width > maxWidth || meta.height > maxHeight) {
      imagePipeline = imagePipeline.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const sanitizedBuffer = await imagePipeline
      .jpeg({ quality: 85 })
      .toBuffer();

    const fileName = `${uuidv4()}.jpg`;

    return { fileName, sanitizedBuffer }
};

export { sanitizeProfileImage };

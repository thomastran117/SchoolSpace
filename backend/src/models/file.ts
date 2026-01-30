/**
 * @file file.ts
 * @description
 * File related models
 *
 * @module models
 * @version 1.0.0
 * @auth Thomas
 */
interface UploadResult {
  fileName: string;
  filePath: string;
  publicUrl: string;
  isDuplicate: boolean;
}

interface GetFileResult {
  file: Buffer;
  filePath: string;
}

export type { GetFileResult, UploadResult };

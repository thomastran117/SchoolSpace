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

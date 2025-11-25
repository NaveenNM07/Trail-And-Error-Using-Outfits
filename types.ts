export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  base64: string; // Data URL format
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GeneratedResult {
  imageUrl: string;
  promptUsed: string;
}

export interface TryOnRequest {
  personImage: ImageFile;
  outfitImage: ImageFile;
  userInstructions?: string;
}
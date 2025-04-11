declare module 'img-clipboard' {
  export function copyImg(imageData: Buffer): Promise<[Error | null, string, string]>;
  export const ErrorCodes: {
    COMMAND_NOT_FOUND: string;
  };
  export function isWayland(): boolean;
} 
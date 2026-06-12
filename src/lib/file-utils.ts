export function parseBase64File(base64File: string): { buffer: Buffer; mimeType: string } {
  const match = base64File.match(/^data:(.*?);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid base64 file data');
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
}

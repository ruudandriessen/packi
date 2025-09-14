import fs from 'node:fs';

export const KNOWN_LOCK_FILES = [
  'package-lock.json',
  'bun.lock',
]

export function autodetectLockFile(folderPath: string) {
  for (const lockFile of KNOWN_LOCK_FILES) {
    const filePath = `${folderPath}/${lockFile}`;
    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
      return filePath;
    }
  }

  return null;
}
import { readFileSync } from 'fs';

export interface LockFilePackage {
  name: string;
  version: string;
}

interface PackageLockJson {
  packages: {
    '': {
      dependencies: Record<string, { version: string }>;
      devDependencies: Record<string, { version: string }>
    }
  }
  dependencies: Record<string, { version: string }>;
}

export function parsePackageLock(lockPath: string): LockFilePackage[] {
  try {
    const lockContent = readFileSync(lockPath, 'utf-8');
    const lockData = JSON.parse(lockContent) as PackageLockJson;

    const {
      dependencies,
      devDependencies
    } = lockData.packages[''];

    const installedPackages = Object.keys(dependencies).concat(Object.keys(devDependencies));

    return Object.entries(lockData.dependencies)
      .filter(([path]) => installedPackages.includes(path))
      .map(([path, info]) => ({ name: path, version: info.version }));
  } catch (error) {
    console.error('Error parsing package-lock.json:', error);
    return [];
  }
}
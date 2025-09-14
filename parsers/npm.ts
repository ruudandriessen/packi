import { readFileSync } from 'fs';

export interface LockFilePackage {
  name: string;
  version: string;
}

interface PackageLockJsonV2 {
  lockfileVersion: 2;
  packages: {
    '': {
      dependencies: Record<string, { version: string }>;
      devDependencies: Record<string, { version: string }>
    }
  }
  dependencies: Record<string, { version: string }>;
}

interface PackageLockJsonV3 {
  lockfileVersion: 3;
  packages: {
    '': {
      name: string;
      version: string;
      dependencies: Record<string, { version: string }>;
      devDependencies: Record<string, { version: string }>
    }
  }
}

type PackageLockJson = PackageLockJsonV2 | PackageLockJsonV3;

function parseLockV2(lockData: PackageLockJsonV2) {
  const {
    dependencies,
    devDependencies
  } = lockData.packages[''];

  const installedPackages = Object.keys(dependencies).concat(Object.keys(devDependencies));

  return Object.entries(lockData.dependencies)
    .filter(([path]) => installedPackages.includes(path))
    .map(([path, info]) => ({ name: path, version: info.version }));
}

function parseLockV3(lockData: PackageLockJsonV3) {
  const installedPackages = Object.keys(lockData.packages[''].dependencies);

  return Object.entries(lockData.packages)
    .filter(([path]) => installedPackages.includes(path.replace('node_modules/', '')))
    .map(([path, info]) => ({ name: path.replace('node_modules/', ''), version: info.version }));
}

export function parsePackageLock(lockPath: string): LockFilePackage[] {
  try {
    const lockContent = readFileSync(lockPath, 'utf-8');
    const lockData = JSON.parse(lockContent) as PackageLockJson;

    if (lockData.lockfileVersion === 2) {
      return parseLockV2(lockData);
    }
    if (lockData.lockfileVersion === 3) {
      return parseLockV3(lockData);
    }

    throw new Error('Unsupported lockfile version');
  } catch (error) {
    console.error('Error parsing package-lock.json:', error);
    return [];
  }
}
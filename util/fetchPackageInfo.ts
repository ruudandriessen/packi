interface PackageInfo {
  name: string;
  current: {
    version: string;
    publishDate: Date;
  };
  next?: {
    version: string;
    publishDate: Date;
  };
}

interface NpmRegistryResponse {
  versions: Record<string, any>;
  time: Record<string, string>;
}

export async function fetchPackageInfo(packageName: string, currentVersion: string): Promise<PackageInfo> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch package info for ${packageName}`);
  }

  const data = await response.json() as NpmRegistryResponse;
  const versions = Object.keys(data.versions)
    .filter(version => !version.includes('-'))
    .sort((a, b) => {
      const packageATime = data.time[a];
      const packageBTime = data.time[b];

      if (packageATime === undefined || packageBTime === undefined) {
        throw new Error('No time found for package');
      }

      return new Date(packageATime).getTime() - new Date(packageBTime).getTime();
    })


  const currentVersionIndex = versions.indexOf(currentVersion);
  const currentVersionPublishDate = data.time[currentVersion];
  if (currentVersionPublishDate == null) {
    throw new Error('Current version not found in time data');
  }

  if (currentVersionIndex == -1) {
    console.log(versions, currentVersion)
    throw new Error('Current version not found in package versions');
  }

  const nextVersion = versions[currentVersionIndex + 1];

  const current = {
    version: currentVersion,
    publishDate: new Date(currentVersionPublishDate)
  }

  if (nextVersion === undefined) {
    return {
      name: packageName,
      current,
    };
  }


  const nextPublishDate = data.time[nextVersion];
  if (nextPublishDate == null) {
    throw new Error('Next version not found in time data');
  }

  const next = {
    version: nextVersion,
    publishDate: new Date(nextPublishDate)
  };

  return {
    name: packageName,
    current,
    next,
  };
}

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
    versions: Record<string, unknown>;
    time: Record<string, string>;
}

interface PyPIRegistryResponse {
    info: {
        name: string;
        version: string;
    };
    releases: Record<
        string,
        Array<{
            upload_time: string;
            yanked: boolean;
        }>
    >;
}

async function fetchNpmPackageInfo(
    packageName: string,
    currentVersion: string,
): Promise<PackageInfo> {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch package info for ${packageName}`);
    }

    const data = (await response.json()) as NpmRegistryResponse;
    const versions = Object.keys(data.versions)
        .filter((version) => !version.includes("-"))
        .sort((a, b) => {
            const packageATime = data.time[a];
            const packageBTime = data.time[b];

            if (packageATime === undefined || packageBTime === undefined) {
                throw new Error("No time found for package");
            }

            return (
                new Date(packageATime).getTime() -
                new Date(packageBTime).getTime()
            );
        });

    const currentVersionIndex = versions.indexOf(currentVersion);
    const currentVersionPublishDate = data.time[currentVersion];
    if (currentVersionPublishDate == null) {
        throw new Error("Current version not found in time data");
    }

    if (currentVersionIndex === -1) {
        console.log(versions, currentVersion);
        throw new Error("Current version not found in package versions");
    }

    const nextVersion = versions[currentVersionIndex + 1];

    const current = {
        version: currentVersion,
        publishDate: new Date(currentVersionPublishDate),
    };

    if (nextVersion === undefined) {
        return {
            name: packageName,
            current,
        };
    }

    const nextPublishDate = data.time[nextVersion];
    if (nextPublishDate == null) {
        throw new Error("Next version not found in time data");
    }

    const next = {
        version: nextVersion,
        publishDate: new Date(nextPublishDate),
    };

    return {
        name: packageName,
        current,
        next,
    };
}

async function fetchPyPIPackageInfo(
    packageName: string,
    currentVersion: string,
    latestVersion?: string,
): Promise<PackageInfo> {
    const response = await fetch(`https://pypi.org/pypi/${packageName}/json`);
    if (!response.ok) {
        throw new Error(`Failed to fetch package info for ${packageName}`);
    }

    const data = (await response.json()) as PyPIRegistryResponse;

    const releases = Object.entries(data.releases)
        .filter(([_, releases]) => releases.some((r) => !r.yanked))
        .map(([version, releases]) => ({
            version,
            uploadTime:
                releases.find((r) => !r.yanked)?.upload_time ||
                releases[0]?.upload_time,
        }))
        .filter(({ uploadTime }) => uploadTime)
        .sort((a, b) => {
            const timeA = a.uploadTime ? new Date(a.uploadTime).getTime() : 0;
            const timeB = b.uploadTime ? new Date(b.uploadTime).getTime() : 0;
            return timeA - timeB;
        });

    const currentRelease = releases.find((r) => r.version === currentVersion);
    if (!currentRelease || !currentRelease.uploadTime) {
        throw new Error(`No upload time found for version ${currentVersion}`);
    }

    const current = {
        version: currentVersion,
        publishDate: new Date(currentRelease.uploadTime),
    };

    if (latestVersion) {
        const latestRelease = releases.find((r) => r.version === latestVersion);

        if (latestRelease?.uploadTime) {
            const next = {
                version: latestVersion,
                publishDate: new Date(latestRelease.uploadTime),
            };

            return {
                name: packageName,
                current,
                next,
            };
        }
    }

    const currentVersionIndex = releases.findIndex(
        (r) => r.version === currentVersion,
    );

    const nextRelease = releases[currentVersionIndex + 1];

    if (!nextRelease) {
        return {
            name: packageName,
            current,
        };
    }

    if (!nextRelease.uploadTime) {
        throw new Error(
            `No upload time found for version ${nextRelease.version}`,
        );
    }

    const next = {
        version: nextRelease.version,
        publishDate: new Date(nextRelease.uploadTime),
    };

    return {
        name: packageName,
        current,
        next,
    };
}

export async function fetchPackageInfo(
    packageName: string,
    currentVersion: string,
    registry?: "npm" | "pypi",
    latestVersion?: string,
): Promise<PackageInfo> {
    if (registry === "pypi") {
        return await fetchPyPIPackageInfo(
            packageName,
            currentVersion,
            latestVersion,
        );
    }

    return await fetchNpmPackageInfo(packageName, currentVersion);
}

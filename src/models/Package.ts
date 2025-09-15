export interface Package {
    name: string;
    version: string;
    registry?: "npm" | "pypi";
    latestVersion?: string;
}

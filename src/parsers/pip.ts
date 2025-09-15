import { execSync } from "node:child_process";
import type { Package } from "../models/Package";

interface PipPackage {
    name: string;
    version: string;
}

interface PipOutdatedPackage {
    name: string;
    version: string;
    latest_version: string;
    latest_filetype: string;
}

export function parseRequirementsTxt(requirementsPath: string): Package[] {
    try {
        const cwd = requirementsPath.split("/").slice(0, -1).join("/");
        const allPackagesOutput = execSync(
            "python3 -m pip list --format=json",
            {
                encoding: "utf-8",
                cwd,
            },
        );
        const allPackages: PipPackage[] = JSON.parse(allPackagesOutput);

        const outdatedOutput = execSync(
            "python3 -m pip list --outdated --format=json",
            {
                encoding: "utf-8",
                cwd,
            },
        );

        const outdatedPackages: PipOutdatedPackage[] =
            JSON.parse(outdatedOutput);

        return allPackages.map((pkg) => {
            const outdatedPkg = outdatedPackages.find(
                (outdated) => outdated.name === pkg.name,
            );
            return {
                name: pkg.name,
                version: pkg.version,
                registry: "pypi" as const,
                latestVersion: outdatedPkg?.latest_version,
            };
        });
    } catch (error) {
        console.error("Error running pip commands:", error);
        return [];
    }
}

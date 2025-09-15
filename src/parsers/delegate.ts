import type { Package } from "../models/Package";
import { parseBunLock } from "./bun";
import { parsePackageLock } from "./npm";
import { parseRequirementsTxt } from "./pip";
import { parseYarnLock } from "./yarn";
import { basename } from "node:path";

export function parseDelegate(lockPath: string): Package[] {
    try {
        const fileName = basename(lockPath);

        switch (fileName) {
            case "bun.lock":
                return parseBunLock(lockPath);
            case "package-lock.json":
                return parsePackageLock(lockPath);
            case "yarn.lock":
                return parseYarnLock(lockPath);
            case "requirements.txt":
                return parseRequirementsTxt(lockPath);
            default:
                throw new Error(`Unsupported lock file format: ${fileName}`);
        }
    } catch (error) {
        console.error(`Error parsing lock file ${lockPath}:`, error);
        return [];
    }
}

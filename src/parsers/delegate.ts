import type { Package } from "../models/Package";
import { parseBunLock } from "./bun";
import { parsePackageLock } from "./npm";

export function parseDelegate(lockPath: string): Package[] {
    const isBunlock =
        lockPath.includes("bun.lockb") || lockPath.includes("bun.lock");
    const isNpmLock = lockPath.includes("package-lock.json");

    if (isBunlock) {
        return parseBunLock(lockPath);
    }

    if (isNpmLock) {
        return parsePackageLock(lockPath);
    }

    throw new Error("Unsupported lock file format");
}

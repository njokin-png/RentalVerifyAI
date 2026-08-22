import type { ScanResult } from "./types";
const g = globalThis as unknown as { scanStore?: Map<string, ScanResult> };
export const scanStore = g.scanStore ?? (g.scanStore = new Map());

import type { NextConfig } from "next";
import path from "path";

/** מונע בלבול כשקיים package-lock נוסף בתיקיית הורה (למשל C:\Users\…). */
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;

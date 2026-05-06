/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';

const turbopackRoot = fileURLToPath(new URL('.', import.meta.url));
const nextConfig = {
  turbopack: {
    // Fix Next.js choosing the wrong workspace root (multiple lockfiles).
    root: turbopackRoot
  }
};

export default nextConfig;

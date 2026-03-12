/** @type {import('next').NextConfig} */
const nextConfig = {
  // Paket som ska transpileras med Next.js – minskar "Cannot find module ./vendor-chunks/…" i dev
  transpilePackages: ['react-day-picker'],
};

export default nextConfig;

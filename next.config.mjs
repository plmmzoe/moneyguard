/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.simpleicons.org', 'localhost', 'paddle-billing.vercel.app'],
  },
  serverExternalPackages: ['@google/generative-ai'],
};

export default nextConfig;

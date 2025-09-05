import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
};

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: !isProd,
})(baseConfig);

export default nextConfig;

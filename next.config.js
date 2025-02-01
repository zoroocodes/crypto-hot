/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'assets.coingecko.com',
          pathname: '/**',
        },
      ],
    },
  }
  
  module.exports = nextConfig
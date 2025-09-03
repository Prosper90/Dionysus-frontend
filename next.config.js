/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000/api/:path*' 
          : 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
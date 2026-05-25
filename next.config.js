/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'media.falabella.com' }
    ]
  },
  async redirects() {
    return [
      { source: '/catalogo', destination: '/materiales', permanent: true }
    ];
  }
};

module.exports = nextConfig;

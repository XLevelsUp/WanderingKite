import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            // Your existing Supabase configuration
            {
                protocol: 'https',
                hostname: 'umifcvgdbcpqzgjwuoqc.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
            // NEW: Google Places API profile photos
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '**',
            },
        ],
    },
    async redirects() {
        return [
            // Old URL /studio was renamed to /studiospace — 301 so ranking/backlinks
            // move to the new URL and the two stop competing (SEO cannibalization).
            {
                source: '/studio',
                destination: '/studiospace',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
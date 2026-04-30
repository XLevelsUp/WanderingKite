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
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // Vercel's Image Optimization pipeline hit its plan quota (402
        // Payment Required on every next/image request, local and remote).
        // unoptimized serves files as-is, bypassing that paid pipeline —
        // no more resizing/format conversion, but images load again for
        // free. Revisit if you upgrade the Vercel plan and want responsive
        // resizing back.
        unoptimized: true,
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
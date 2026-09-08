import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // See apps/marketing/next.config.ts for why this is unoptimized —
        // same Vercel plan constraint applies here.
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'umifcvgdbcpqzgjwuoqc.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    async headers() {
        return [
            {
                // Admin is a fully internal app — nothing here should ever
                // be indexed, unlike marketing which selectively noindexes
                // only its authenticated /client routes.
                source: '/:path*',
                headers: [
                    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
                ],
            },
        ];
    },
};

export default nextConfig;

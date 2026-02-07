import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/navigation/MainNav";
import { BookingFlyout } from "@/components/booking/BookingFlyout";

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: "Wandering Kite Studio | Photography, Rentals, Studio & Podcast in Coimbatore",
    description: "Professional photography services, camera & equipment rentals, studio space, and podcast recording in Coimbatore, Tamil Nadu. Sony, Canon, Rode equipment available. Serving Coimbatore and across India.",
    keywords: [
        // Local SEO - Service + City
        "podcast studio Coimbatore",
        "camera rentals Coimbatore",
        "photography studio Coimbatore",
        "studio rental Coimbatore",
        "event photography Coimbatore",
        // Service + Location Variations
        "camera rental near me",
        "event photography India",
        "podcast recording studio India",
        "photography services Tamil Nadu",
        // Equipment-Specific
        "Sony camera rental",
        "Canon lens rental",
        "Rode microphone rental",
        "DSLR rent Coimbatore",
        // Service-Specific
        "wedding photography Coimbatore",
        "commercial photography India",
        "podcast production Coimbatore",
        "video studio rental",
    ],
    authors: [{ name: "Wandering Kite Studio" }],
    openGraph: {
        type: "website",
        locale: "en_IN",
        url: "https://wanderingkite.in",
        siteName: "Wandering Kite Studio",
        title: "Wandering Kite Studio | Photography, Rentals, Studio & Podcast in Coimbatore",
        description: "Professional photography services, camera & equipment rentals, studio space, and podcast recording in Coimbatore, Tamil Nadu.",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Wandering Kite Studio - Creative Infrastructure for Modern Creators",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Wandering Kite Studio | Photography, Rentals, Studio & Podcast in Coimbatore",
        description: "Professional photography services, camera & equipment rentals, studio space, and podcast recording in Coimbatore.",
        images: ["/og-image.jpg"],
    },
    icons: {
        icon: [
            { url: "/icon.svg", type: "image/svg+xml" },
            { url: "/favicon.ico", sizes: "any" },
        ],
        apple: "/apple-icon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": ["LocalBusiness", "ProfessionalService", "Store"],
        "name": "Wandering Kite Studio",
        "description": "Multi-disciplinary creative hub offering Photography, Camera Rentals, Studio Spaces, and Podcast Production in Coimbatore, India.",
        "url": "https://wanderingkite.in",
        "telephone": "+91-XXXXXXXXXX",
        "email": "hello@wanderingkite.in",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "NO 178, 1st Floor A Rammachandra Road",
            "addressLocality": "RS Puram, Coimbatore",
            "addressRegion": "Tamil Nadu",
            "postalCode": "641002",
            "addressCountry": "IN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 11.0168,
            "longitude": 76.9558
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "18:00"
            },
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "10:00",
                "closes": "17:00"
            }
        ],
        "priceRange": "$$",
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Creative Services",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Event & Lifestyle Photography",
                        "description": "Professional photography for events, weddings, portraits, and commercial projects"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Camera & Equipment Rentals",
                        "description": "Professional camera, lens, lighting, and audio equipment rentals"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Studio Space Rental",
                        "description": "1200 sq ft photography and video studio with professional lighting and equipment"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Podcast Recording Studio",
                        "description": "Professional podcast recording with acoustic treatment and premium microphones"
                    }
                }
            ]
        }
    };

    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans antialiased bg-zinc-950 text-white`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
                <MainNav />
                {children}
                <BookingFlyout />
            </body>
        </html>
    );
}

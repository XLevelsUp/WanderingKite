/**
 * types/studio.ts
 * ───────────────────────────────────────────────────────────────────────────
 * Enterprise-grade type system for Wandering Kite Studio ERP.
 *
 * Architecture:
 *  - ServiceRegistry   → static map of all navigable domains & services
 *  - ProjectCategory   → discriminated union (Photography | Corporate |
 *                        Commercial | StudioFacilities)
 *  - Equipment fields  → narrowed per sub-type via discriminant + branded types
 *  - SmartAllocationKit → maps service slugs → recommended inventory kit IDs
 */

import type { LucideIcon } from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────
// § 1 — Primitive / shared types
// ────────────────────────────────────────────────────────────────────────────

export type ServiceSlug =
    // Photography – Events
    | 'wedding'
    | 'engagement'
    | 'birthday'
    // Photography – Portraits
    | 'family'
    | 'maternity'
    | 'baby-shoot'
    // Corporate
    | 'product'
    | 'cinematic-video'
    | 'social-media'
    | 'model-shoot'
    | 'headshot'
    // Commercial
    | 'ads'
    | 'music-video'
    | 'short-film'
    // Studio Facilities
    | 'podcast'
    | 'equipment-rental'
    | 'space-allocation';

/** Equipment IDs that live in the equipment catalog / Supabase table */
export type EquipmentId = string & { readonly _brand: 'EquipmentId' };

// ────────────────────────────────────────────────────────────────────────────
// § 2 — Equipment requirement interfaces (narrowed per project type)
// ────────────────────────────────────────────────────────────────────────────

export interface EventPhotographyEquipment {
    /** Primary body: Full-frame mirrorless required */
    primaryBody: EquipmentId;
    /** Telephoto zoom for ceremony shots */
    telephotoZoom: EquipmentId;
    /** Wide/standard zoom for candid coverage */
    standardZoom: EquipmentId;
    /** Flash with high-speed sync for outdoor fills */
    hssFlash: boolean;
    /** Second shooter kit */
    secondShooterKit?: EquipmentId;
}

export interface PortraitPhotographyEquipment {
    /** Prime lens — 50mm / 85mm / 135mm range required */
    primeLens: EquipmentId;
    /** Continuous softbox or strobe unit */
    studioLight: EquipmentId;
    /** Backdrop system */
    backdrop: 'white' | 'black' | 'grey' | 'custom';
    /** Reflector fill */
    reflector: boolean;
}

export interface CorporateEquipment {
    /** Camera body suitable for tethered shooting */
    primaryBody: EquipmentId;
    /** Standard zoom for versatility */
    standardZoom: EquipmentId;
    /** Colour-accurate studio strobe */
    strobeKit: EquipmentId;
    /** Teleprompter for corporate video */
    teleprompter?: boolean;
}

export interface CommercialEquipment {
    /** Cinema camera body */
    cinemaBody: EquipmentId;
    /** High-Speed Sync flash — mandatory for ads/music videos */
    hssFlash: boolean;
    /** Motorised gimbal — mandatory for music videos / short films */
    gimbal: boolean;
    /** Anamorphic or cinema glass */
    cinemaLens?: EquipmentId;
    /** Slider for product/ad shots */
    slider?: boolean;
    /** Drone for aerial footage */
    drone?: boolean;
}

export interface StudioFacilitiesEquipment {
    /** Podcast: microphone set; Rental: item IDs; Allocation: room ID */
    resourceIds: string[];
    /** Multi-track audio interface for podcast */
    audioInterface?: boolean;
    /** Video-podcast: camera + lighting rig */
    videoPodcastRig?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// § 3 — Project Category — Discriminated Unions
// ────────────────────────────────────────────────────────────────────────────

// ── 3a Photography ──────────────────────────────────────────────────────────

export type PhotographyEventType = 'wedding' | 'engagement' | 'birthday';
export type PhotographyPortraitType = 'family' | 'maternity' | 'baby-shoot';

export interface EventPhotographyProject {
    readonly domain: 'photography';
    readonly subDomain: 'events';
    type: PhotographyEventType;
    equipment: EventPhotographyEquipment;
    /** Coverage hours */
    durationHours: number;
    /** Number of locations */
    locationCount: number;
}

export interface PortraitPhotographyProject {
    readonly domain: 'photography';
    readonly subDomain: 'portraits';
    type: PhotographyPortraitType;
    equipment: PortraitPhotographyEquipment;
    /** Studio sessions vs outdoor */
    sessionType: 'studio' | 'outdoor' | 'hybrid';
}

export type PhotographyProject =
    | EventPhotographyProject
    | PortraitPhotographyProject;

// ── 3b Corporate ────────────────────────────────────────────────────────────

export type CorporateServiceType =
    | 'product'
    | 'cinematic-video'
    | 'social-media'
    | 'model-shoot'
    | 'headshot';

export interface CorporateProject {
    readonly domain: 'corporate';
    type: CorporateServiceType;
    equipment: CorporateEquipment;
    /** Deliverable format */
    deliverable: 'still' | 'video' | 'both';
    /** Target platform for social-media projects */
    platform?: 'instagram' | 'youtube' | 'linkedin' | 'other';
}

// ── 3c Commercial ───────────────────────────────────────────────────────────

export type CommercialServiceType = 'ads' | 'music-video' | 'short-film';

export interface CommercialProject {
    readonly domain: 'commercial';
    type: CommercialServiceType;
    equipment: CommercialEquipment;
    /** Shoot days */
    productionDays: number;
    /** Post-production included */
    postProduction: boolean;
}

// ── 3d Studio Facilities ────────────────────────────────────────────────────

export type StudioFacilityType =
    | 'podcast'
    | 'equipment-rental'
    | 'space-allocation';

export interface StudioFacilitiesProject {
    readonly domain: 'studio-facilities';
    type: StudioFacilityType;
    equipment: StudioFacilitiesEquipment;
    /** Booking duration in hours */
    durationHours: number;
}

// ── 3e Top-level union ──────────────────────────────────────────────────────

export type ProjectCategory =
    | PhotographyProject
    | CorporateProject
    | CommercialProject
    | StudioFacilitiesProject;

// ────────────────────────────────────────────────────────────────────────────
// § 4 — Smart Allocation Kit
// Maps a ServiceSlug → array of recommended equipment catalog IDs
// ────────────────────────────────────────────────────────────────────────────

export type SmartAllocationKit = Record<ServiceSlug, readonly string[]>;

export const SMART_ALLOCATION_KIT: SmartAllocationKit = {
    // ── Photography Events ─────────────────────────────────────────────────
    wedding: ['sony-a7iv', 'canon-r6', 'sony-70-200-gm', 'sony-24-70-gm', 'godox-v1'],
    engagement: ['sony-a7iv', 'sony-24-70-gm', 'sigma-35mm', 'aputure-120d'],
    birthday: ['canon-r6', 'sony-24-70-gm', 'godox-sl60'],

    // ── Photography Portraits ──────────────────────────────────────────────
    family: ['sony-a7iv', 'sigma-85mm', 'aputure-120d', 'godox-sl60'],
    maternity: ['sony-a7iv', 'sigma-85mm', 'aputure-120d'],
    'baby-shoot': ['canon-r6', 'sigma-35mm', 'godox-sl60'],

    // ── Corporate ─────────────────────────────────────────────────────────
    product: ['sony-a7iv', 'sigma-35mm', 'aputure-120d', 'godox-sl60'],
    'cinematic-video': ['sony-fx3', 'sony-24-70-gm', 'aputure-120d', 'rode-ntg5', 'zoom-h6'],
    'social-media': ['sony-a7iv', 'sony-24-70-gm', 'godox-sl60'],
    'model-shoot': ['sony-a7iv', 'sigma-85mm', 'aputure-120d', 'godox-sl60'],
    headshot: ['canon-r6', 'sigma-85mm', 'aputure-120d'],

    // ── Commercial ────────────────────────────────────────────────────────
    // Music Video → Cinema kit + HSS flash + gimbal mandatory
    'music-video': ['sony-fx3', 'sony-24-70-gm', 'godox-v1-hss', 'dji-rs3-pro', 'aputure-120d', 'rode-ntg5'],
    // Short Film → Cinema rig, audio, plus slider
    'short-film': ['sony-fx3', 'sony-24-70-gm', 'aputure-120d', 'rode-ntg5', 'zoom-h6', 'rhino-slider'],
    // Ads → Product precision kit
    ads: ['sony-a7iv', 'sigma-35mm', 'godox-v1-hss', 'aputure-120d', 'rhino-slider'],

    // ── Studio Facilities ─────────────────────────────────────────────────
    podcast: ['rode-ntg5', 'zoom-h6', 'godox-sl60'],
    'equipment-rental': [],
    'space-allocation': [],
} as const;

// ────────────────────────────────────────────────────────────────────────────
// § 5 — Service Registry
// Single source of truth consumed by navigation, routing, and allocation
// ────────────────────────────────────────────────────────────────────────────

export interface ServiceLeaf {
    label: string;
    slug: ServiceSlug;
    href: string;
    description: string;
}

export interface ServiceGroup {
    label: string;
    items: ServiceLeaf[];
}

export interface ServiceDomain {
    label: string;
    href: string;
    iconName: string; // LucideIcon name — resolved at runtime to avoid server import issues
    groups: ServiceGroup[];
}

export const SERVICE_REGISTRY: Record<string, ServiceDomain> = {
    photography: {
        label: 'Photography',
        href: '/photography',
        iconName: 'Camera',
        groups: [
            {
                label: 'Events',
                items: [
                    { label: 'Wedding', slug: 'wedding', href: '/photography/wedding', description: 'Full-day wedding coverage with dual-shooter kits' },
                    { label: 'Engagement', slug: 'engagement', href: '/photography/engagement', description: 'Intimate pre-wedding & engagement sessions' },
                    { label: 'Birthday', slug: 'birthday', href: '/photography/birthday', description: 'Birthday milestones & party coverage' },
                ],
            },
            {
                label: 'Portraits',
                items: [
                    { label: 'Family', slug: 'family', href: '/photography/family', description: 'Studio & outdoor family portrait sessions' },
                    { label: 'Maternity', slug: 'maternity', href: '/photography/maternity', description: 'Elegant maternity & expecting mother shoots' },
                    { label: 'Baby Shoot', slug: 'baby-shoot', href: '/photography/baby-shoot', description: 'Safe, gentle newborn & baby photography' },
                ],
            },
        ],
    },

    corporate: {
        label: 'Corporate',
        href: '/corporate',
        iconName: 'Briefcase',
        groups: [
            {
                label: 'Visual Content',
                items: [
                    { label: 'Product Photography', slug: 'product', href: '/corporate/product', description: 'E-commerce & catalogue product shoots' },
                    { label: 'Cinematic Videos', slug: 'cinematic-video', href: '/corporate/cinematic-video', description: 'Brand films & corporate video production' },
                    { label: 'Social Media Content', slug: 'social-media', href: '/corporate/social-media', description: 'Platform-ready reels, posts & campaigns' },
                    { label: 'Model Shoots', slug: 'model-shoot', href: '/corporate/model-shoot', description: 'Fashion & model portfolio sessions' },
                    { label: 'Headshot', slug: 'headshot', href: '/corporate/headshot', description: 'Professional headshots for teams & founders' },
                ],
            },
        ],
    },

    commercial: {
        label: 'Commercial',
        href: '/commercial',
        iconName: 'Clapperboard',
        groups: [
            {
                label: 'Production',
                items: [
                    { label: 'Ad Films', slug: 'ads', href: '/commercial/ads', description: 'High-concept advertisement productions' },
                    { label: 'Music Videos', slug: 'music-video', href: '/commercial/music-video', description: 'Full-production music videos with cinema kit' },
                    { label: 'Short Films', slug: 'short-film', href: '/commercial/short-film', description: 'Narrative short film production & post' },
                ],
            },
        ],
    },

    'studio-facilities': {
        label: 'Studio Facilities',
        href: '/studio',
        iconName: 'Building2',
        groups: [
            {
                label: 'Bookable Services',
                items: [
                    { label: 'Podcast Studio', slug: 'podcast', href: '/podcast', description: 'Acoustically treated podcast & interview studio' },
                    { label: 'Equipment Rental', slug: 'equipment-rental', href: '/rentals', description: 'Professional cameras, lenses, lighting & audio' },
                    { label: 'Space Allocation', slug: 'space-allocation', href: '/studio', description: 'Hourly & full-day studio floor bookings' },
                ],
            },
        ],
    },
} as const;

// ────────────────────────────────────────────────────────────────────────────
// § 6 — Type Guards
// ────────────────────────────────────────────────────────────────────────────

export function isPhotographyProject(p: ProjectCategory): p is PhotographyProject {
    return p.domain === 'photography';
}

export function isCommercialProject(p: ProjectCategory): p is CommercialProject {
    return p.domain === 'commercial';
}

export function isMusicVideoProject(p: CommercialProject): boolean {
    return p.type === 'music-video';
}

export function isCorporateProject(p: ProjectCategory): p is CorporateProject {
    return p.domain === 'corporate';
}

export function isStudioFacilitiesProject(p: ProjectCategory): p is StudioFacilitiesProject {
    return p.domain === 'studio-facilities';
}

// Re-export LucideIcon so consumers don't need to import twice
export type { LucideIcon };

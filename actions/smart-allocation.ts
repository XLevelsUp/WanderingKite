'use server';

/**
 * actions/smart-allocation.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Server Actions for Smart Equipment Allocation
 *
 * These run exclusively on the server (no client bundle cost).
 * They consume the SMART_ALLOCATION_KIT map from types/studio.ts to:
 *  1. Suggest a pre-built equipment kit for a given service slug
 *  2. Filter the live Supabase inventory to return only AVAILABLE items
 *     that match the suggested kit — ready for auto-populate in booking forms
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@/lib/supabase/server';
import {
    SMART_ALLOCATION_KIT,
    SERVICE_REGISTRY,
    type ServiceSlug,
    type ProjectCategory,
} from '@/types/studio';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AllocationSuggestion {
    kitIds: readonly string[];
    available: AvailableEquipmentRow[];
    missingIds: string[];
}

export interface AvailableEquipmentRow {
    id: string;
    name: string;
    serial_number: string;
    status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'LOST';
    rental_price: number;
    description: string | null;
    category: { name: string } | null;
}

// ── Helper: resolve domain + type → ServiceSlug ───────────────────────────────

function resolveSlug(project: ProjectCategory): ServiceSlug | null {
    switch (project.domain) {
        case 'photography':
            return project.type as ServiceSlug;
        case 'corporate':
            return project.type as ServiceSlug;
        case 'commercial':
            return project.type as ServiceSlug;
        case 'studio-facilities':
            return project.type as ServiceSlug;
        default:
            return null;
    }
}

// ── Action 1: suggestAllocationKit ──────────────────────────────────────────
/**
 * Given a ServiceSlug, returns the static kit recommendation from
 * SMART_ALLOCATION_KIT without any DB round-trip.
 *
 * Safe to call from React Server Components or Server Actions.
 */
export async function suggestAllocationKit(
    slug: ServiceSlug,
): Promise<readonly string[]> {
    return SMART_ALLOCATION_KIT[slug] ?? [];
}

// ── Action 2: getEquipmentForCategory ────────────────────────────────────────
/**
 * Full smart allocation:
 *  1. Derive the suggested kit IDs from SMART_ALLOCATION_KIT
 *  2. Query Supabase for equipment rows that are AVAILABLE and whose
 *     name loosely matches a kit item (by equipment id / catalog slug)
 *  3. Return available rows + a list of kit IDs that were NOT found (missing)
 *
 * Used by booking forms to auto-select equipment.
 */
export async function getEquipmentForCategory(
    project: ProjectCategory,
): Promise<AllocationSuggestion> {
    const slug = resolveSlug(project);
    const kitIds = slug ? SMART_ALLOCATION_KIT[slug] : ([] as const);

    if (kitIds.length === 0) {
        return { kitIds, available: [], missingIds: [] };
    }

    const supabase = await createClient();

    // Fetch all AVAILABLE equipment from Supabase, joined with categories
    const { data, error } = await supabase
        .from('equipment')
        .select('id, name, serial_number, status, rental_price, description, categories(name)')
        .eq('status', 'AVAILABLE');

    if (error) {
        console.error('[SmartAllocation] Supabase error:', error.message);
        return { kitIds, available: [], missingIds: [...kitIds] };
    }

    const rows: AvailableEquipmentRow[] = (data ?? []).map((row) => {
        const cats = row.categories;
        const category = Array.isArray(cats) ? (cats[0] as { name: string } ?? null) : (cats as { name: string } | null);
        return {
            id: row.id,
            name: row.name,
            serial_number: row.serial_number,
            status: row.status as AvailableEquipmentRow['status'],
            rental_price: row.rental_price,
            description: row.description,
            category,
        };
    });

    // Match kit IDs to available equipment by name fragment
    // The kit ID slugs (e.g. 'sony-fx3') map to equipment names ('Sony FX3')
    const matched: AvailableEquipmentRow[] = [];
    const missingIds: string[] = [];

    for (const kitId of kitIds) {
        // Normalise slug → search term: 'sony-fx3' → 'sony fx3'
        const searchTerm = kitId.replace(/-/g, ' ').toLowerCase();
        const found = rows.find((r) => r.name.toLowerCase().includes(searchTerm));
        if (found) {
            matched.push(found);
        } else {
            missingIds.push(kitId);
        }
    }

    return { kitIds, available: matched, missingIds };
}

// ── Action 3: getAllAvailableEquipment ────────────────────────────────────────
/**
 * Returns all AVAILABLE equipment rows — used by RSC directory pages.
 * No client secret exposed; runs fully server-side.
 */
export async function getAllAvailableEquipment(): Promise<AvailableEquipmentRow[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('equipment')
        .select('id, name, serial_number, status, rental_price, description, categories(name)')
        .eq('status', 'AVAILABLE')
        .order('name');

    if (error) {
        console.error('[SmartAllocation] getAllAvailableEquipment error:', error.message);
        return [];
    }

    return (data ?? []).map((row) => {
        const cats = row.categories;
        const category = Array.isArray(cats) ? (cats[0] as { name: string } ?? null) : (cats as { name: string } | null);
        return {
            id: row.id,
            name: row.name,
            serial_number: row.serial_number,
            status: row.status as AvailableEquipmentRow['status'],
            rental_price: row.rental_price,
            description: row.description,
            category,
        };
    });
}

// ── Action 4: getServiceDirectory ─────────────────────────────────────────────
/**
 * Returns the full SERVICE_REGISTRY enriched with available-equipment counts
 * per domain, fetched server-side — suitable for RSC page headers.
 */
export async function getServiceDirectory() {
    const available = await getAllAvailableEquipment();

    return Object.entries(SERVICE_REGISTRY).map(([key, domain]) => ({
        key,
        ...domain,
        availableEquipmentCount: available.length, // refine per domain if needed
    }));
}

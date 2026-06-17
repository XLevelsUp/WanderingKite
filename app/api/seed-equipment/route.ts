import { adminAuthClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const initialRentalEquipment = [
  {
    name: 'Sony Alpha a7 IV Camera Body',
    description: '33MP full-frame mirrorless camera, excellent for photo and 4K video.',
  },
  {
    name: 'Canon EOS R5 Mirrorless Camera',
    description: '45MP full-frame mirrorless camera, supports 8K RAW video and high-speed bursts.',
  },
  {
    name: 'Sony FE 24-70mm f/2.8 GM II Lens',
    description: 'Premium G Master standard zoom lens, extremely sharp and lightweight.',
  },
  {
    name: 'Canon RF 24-70mm f/2.8 L IS USM Lens',
    description: 'Professional L-series standard zoom lens with image stabilization.',
  },
  {
    name: 'Aputure LS 600d Pro LED Light',
    description: 'Daylight-balanced COB LED, highly powerful and weather-resistant.',
  },
  {
    name: 'DJI Ronin RS 3 Pro Gimbal Stabilizer',
    description: 'Professional 3-axis camera stabilizer for heavy payloads.',
  },
];

const initialStudioEquipment = [
  {
    name: 'Profoto D2 1000 AirTTL Studio Flash',
    description: '1000Ws monolight with TTL and High-Speed Sync support.',
  },
  {
    name: 'Elinchrom Litemotiv Octa 120cm Softbox',
    description: 'Large octagonal softbox producing beautiful wrap-around soft light.',
  },
  {
    name: 'Rode Studio Condenser Microphone Set',
    description: 'High-quality studio recording mics with shockmounts and pop filters.',
  },
  {
    name: 'Heavy Duty C-Stands with Boom Arms',
    description: 'Heavy duty steel stands for secure mounting of heavy lights and modifiers.',
  },
  {
    name: 'Godox SL150II LED Video Light',
    description: '150W continuous LED light source, ideal for video and content creation.',
  },
];

export async function GET() {
  try {
    const results: string[] = [];
    const supabase = adminAuthClient;

    // Seed Rental Equipment
    for (const item of initialRentalEquipment) {
      const { data: existing, error: checkError } = await supabase
        .from('equipment')
        .select('id')
        .eq('name', item.name)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!existing) {
        const { error: insertError } = await supabase
          .from('equipment')
          .insert({
            name: item.name,
            description: item.description,
            serialNumber: 'SEED-RENTAL-' + item.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
            rental_price: 150.00,
            is_rental: true,
            available_for_rental: true,
            available_for_studio: false,
            status: 'AVAILABLE',
          });
        if (insertError) throw insertError;
        results.push(`Created Rental Gear: ${item.name}`);
      } else {
        results.push(`Skipped existing Rental Gear: ${item.name}`);
      }
    }

    // Seed Studio Equipment
    for (const item of initialStudioEquipment) {
      const { data: existing, error: checkError } = await supabase
        .from('equipment')
        .select('id')
        .eq('name', item.name)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!existing) {
        const { error: insertError } = await supabase
          .from('equipment')
          .insert({
            name: item.name,
            description: item.description,
            serialNumber: 'SEED-STUDIO-' + item.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
            rental_price: 0.00,
            is_studio_space: true,
            available_for_rental: false,
            available_for_studio: true,
            status: 'AVAILABLE',
          });
        if (insertError) throw insertError;
        results.push(`Created Studio Gear: ${item.name}`);
      } else {
        results.push(`Skipped existing Studio Gear: ${item.name}`);
      }
    }

    return NextResponse.json({
      message: 'Seeding process completed successfully',
      results,
    });
  } catch (error: any) {
    logger.error('Seeding error:', error);
    return NextResponse.json(
      { error: 'Failed to seed equipment catalog', details: error.message },
      { status: 500 }
    );
  }
}

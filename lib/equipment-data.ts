export interface Equipment {
  id: string;
  name: string;
  category: 'camera' | 'lens' | 'lighting' | 'audio' | 'others';
  dailyRate: number;
  weeklyRate: number;
  image: string;
  specs: string[];
  available: boolean;
}

export const equipmentCatalog: Equipment[] = [
  // Cameras
  {
    id: 'sony-a7iv',
    name: 'Sony A7 IV',
    category: 'camera',
    dailyRate: 2500,
    weeklyRate: 15000,
    image: '/equipment/sony-a7iv.jpg',
    specs: ['33MP Full-Frame', '4K 60fps', 'IBIS', '10fps Burst'],
    available: true,
  },
  {
    id: 'canon-r6',
    name: 'Canon EOS R6',
    category: 'camera',
    dailyRate: 2800,
    weeklyRate: 16000,
    image: '/equipment/canon-r6.jpg',
    specs: ['20MP Full-Frame', '4K 60fps', 'Dual Pixel AF', 'IBIS'],
    available: true,
  },
  {
    id: 'sony-fx3',
    name: 'Sony FX3',
    category: 'camera',
    dailyRate: 3500,
    weeklyRate: 20000,
    image: '/equipment/sony-fx3.jpg',
    specs: ['Cinema Camera', '4K 120fps', 'S-Log3', 'Dual Base ISO'],
    available: true,
  },

  // Lenses
  {
    id: 'sony-24-70-gm',
    name: 'Sony 24-70mm f/2.8 GM',
    category: 'lens',
    dailyRate: 1200,
    weeklyRate: 7000,
    image: '/equipment/sony-24-70.jpg',
    specs: ['Versatile Zoom', 'f/2.8 Constant', 'G Master Quality'],
    available: true,
  },
  {
    id: 'sony-70-200-gm',
    name: 'Sony 70-200mm f/2.8 GM',
    category: 'lens',
    dailyRate: 1500,
    weeklyRate: 8500,
    image: '/equipment/sony-70-200.jpg',
    specs: ['Telephoto Zoom', 'f/2.8 Constant', 'OSS Stabilization'],
    available: true,
  },
  {
    id: 'sigma-35mm',
    name: 'Sigma 35mm f/1.4 Art',
    category: 'lens',
    dailyRate: 800,
    weeklyRate: 4500,
    image: '/equipment/sigma-35.jpg',
    specs: ['Wide Prime', 'f/1.4 Aperture', 'Sharp & Creamy Bokeh'],
    available: true,
  },

  // Lighting
  {
    id: 'godox-sl60',
    name: 'Godox SL-60W LED',
    category: 'lighting',
    dailyRate: 600,
    weeklyRate: 3000,
    image: '/equipment/godox-sl60.jpg',
    specs: ['60W LED', 'Bowens Mount', 'Daylight Balanced'],
    available: true,
  },
  {
    id: 'aputure-120d',
    name: 'Aputure 120D Mark II',
    category: 'lighting',
    dailyRate: 1000,
    weeklyRate: 5500,
    image: '/equipment/aputure-120d.jpg',
    specs: ['120W COB LED', 'CRI 96+', 'Wireless Control'],
    available: true,
  },

  // Audio
  {
    id: 'rode-ntg5',
    name: 'Rode NTG5',
    category: 'audio',
    dailyRate: 500,
    weeklyRate: 2500,
    image: '/equipment/rode-ntg5.jpg',
    specs: ['Shotgun Mic', 'Broadcast Quality', 'Lightweight'],
    available: true,
  },
  {
    id: 'zoom-h6',
    name: 'Zoom H6 Recorder',
    category: 'audio',
    dailyRate: 700,
    weeklyRate: 3500,
    image: '/equipment/zoom-h6.jpg',
    specs: ['6-Track Recording', 'XLR Inputs', 'Interchangeable Capsules'],
    available: true,
  },
];

export function getEquipmentByCategory(category: Equipment['category']) {
  return equipmentCatalog.filter((item) => item.category === category);
}

export function getEquipmentById(id: string) {
  return equipmentCatalog.find((item) => item.id === id);
}

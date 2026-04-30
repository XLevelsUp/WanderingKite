import { getEquipment } from './actions/equipment';

async function main() {
    const data = await getEquipment();
    console.log("Live Equipment Data:", data[0]);
}

main().catch(console.error);

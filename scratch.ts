import fs from 'fs';
import path from 'path';

// Read .env.local manually to get the token
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const tokenMatch = envContent.match(/INSTAGRAM_ACCESS_TOKEN_WANDERINGKITE=(.*)/);
const token = tokenMatch ? tokenMatch[1].trim() : null;

if (!token) {
  console.error("Token not found in .env.local");
  process.exit(1);
}

const activeToken = token as string;

async function main() {
  console.log("Using Token:", activeToken.substring(0, 15) + "...");

  // 1. Verify and refresh the token to check validity / expiration
  try {
    const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${activeToken}`;
    const res = await fetch(refreshUrl);
    const data = await res.json() as any;
    console.log("\n--- Token Info ---");
    console.log("Status:", res.status);
    console.log("Response Data:", data);
    if (data.expires_in) {
      const days = (data.expires_in / (3600 * 24)).toFixed(2);
      console.log(`Token is valid for: ${data.expires_in} seconds (~${days} days)`);
    }
  } catch (err: any) {
    console.error("Error checking token validity:", err.message);
  }

  // 2. Fetch the latest media items to see what's in there
  try {
    const mediaUrl = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp&limit=50&access_token=${activeToken}`;
    const res = await fetch(mediaUrl);
    const data = await res.json() as any;
    console.log("\n--- Instagram Media Feed (Chronological, limit 50) ---");
    if (!data.data || !Array.isArray(data.data)) {
      console.log("Failed to fetch media or unexpected structure:", data);
      return;
    }

    console.log(`Total items fetched: ${data.data.length}`);
    data.data.slice(0, 10).forEach((item: any, i: number) => {
      console.log(`[${i}] ID: ${item.id}, Type: ${item.media_type}, Time: ${item.timestamp}`);
    });

    const videos = data.data.filter((item: any) => item.media_type === 'VIDEO');
    console.log(`\nTotal videos in fetched items: ${videos.length}`);
    videos.slice(0, 5).forEach((item: any, i: number) => {
      console.log(`Video [${i}] ID: ${item.id}, Time: ${item.timestamp}, URL: ${item.permalink}`);
    });
  } catch (err: any) {
    console.error("Error fetching media:", err.message);
  }
}

main().catch(console.error);

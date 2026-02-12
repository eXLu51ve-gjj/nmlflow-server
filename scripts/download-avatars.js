const https = require('https');
const fs = require('fs');
const path = require('path');

const avatarsDir = path.join(__dirname, '..', 'public', 'avatars');

// Create directory if not exists
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Download avatar with retry
async function downloadAvatar(id, retries = 3) {
  const filePath = path.join(avatarsDir, `${id}.jpg`);
  
  // Skip if already exists
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.size > 1000) { // More than 1KB = valid image
      console.log(`Avatar ${id} already exists, skipping`);
      return;
    }
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const url = `https://i.pravatar.cc/150?img=${id}`;
        
        const request = https.get(url, { timeout: 10000 }, (response) => {
          // Follow redirect
          if (response.statusCode === 302 || response.statusCode === 301) {
            https.get(response.headers.location, { timeout: 10000 }, (res) => {
              const file = fs.createWriteStream(filePath);
              res.pipe(file);
              file.on('finish', () => {
                file.close();
                console.log(`Downloaded avatar ${id}`);
                resolve();
              });
              file.on('error', reject);
            }).on('error', reject);
          } else {
            const file = fs.createWriteStream(filePath);
            response.pipe(file);
            file.on('finish', () => {
              file.close();
              console.log(`Downloaded avatar ${id}`);
              resolve();
            });
            file.on('error', reject);
          }
        });
        
        request.on('error', reject);
        request.on('timeout', () => {
          request.destroy();
          reject(new Error('Timeout'));
        });
      });
      return; // Success
    } catch (err) {
      console.log(`Attempt ${attempt}/${retries} failed for avatar ${id}: ${err.message}`);
      if (attempt === retries) {
        console.log(`Failed to download avatar ${id} after ${retries} attempts`);
      } else {
        await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
      }
    }
  }
}

async function main() {
  console.log('Downloading avatars...');
  // Download one by one with delay
  for (let i = 1; i <= 20; i++) {
    await downloadAvatar(i);
    await new Promise(r => setTimeout(r, 500)); // 500ms delay between downloads
  }
  console.log('Done!');
}

main().catch(console.error);

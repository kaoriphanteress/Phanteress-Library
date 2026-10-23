const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function slice() {
  const inputPath = path.resolve(__dirname, '../public/assets/aistudio/80kllfoiz25f1_d993260e.png');
  const outputDir = path.resolve(__dirname, '../public/avatars');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const isDark = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * channels;
    return data[idx] < 240 || data[idx + 1] < 240 || data[idx + 2] < 240;
  };

  const step = 4;
  const gw = Math.floor(width / step);
  const gh = Math.floor(height / step);
  const grid = new Uint8Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      grid[gy * gw + gx] = isDark(gx * step, gy * step) ? 1 : 0;
    }
  }

  const visited = new Uint8Array(gw * gh);
  let comps = [];
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const idx = gy * gw + gx;
      if (grid[idx] && !visited[idx]) {
        const queue = [[gx, gy]];
        visited[idx] = 1;
        let minX = gx, maxX = gx, minY = gy, maxY = gy, count = 0;
        while (queue.length > 0) {
          const [cx, cy] = queue.pop();
          count++;
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;
          for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
            if (nx >= 0 && nx < gw && ny >= 0 && ny < gh) {
              const nidx = ny * gw + nx;
              if (grid[nidx] && !visited[nidx]) {
                visited[nidx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }
        if (count > 50) {
          comps.push({
            minX: minX * step,
            maxX: maxX * step,
            minY: minY * step,
            maxY: maxY * step,
            w: (maxX - minX) * step,
            h: (maxY - minY) * step,
            cx: Math.round(((minX + maxX) / 2) * step),
            cy: Math.round(((minY + maxY) / 2) * step),
            count
          });
        }
      }
    }
  }

  // Merge nearby components
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < comps.length; i++) {
      for (let j = i + 1; j < comps.length; j++) {
        const c1 = comps[i], c2 = comps[j];
        const dist = Math.hypot(c1.cx - c2.cx, c1.cy - c2.cy);
        if (dist < 85) {
          const newMinX = Math.min(c1.minX, c2.minX);
          const newMaxX = Math.max(c1.maxX, c2.maxX);
          const newMinY = Math.min(c1.minY, c2.minY);
          const newMaxY = Math.max(c1.maxY, c2.maxY);
          comps[i] = {
            minX: newMinX,
            maxX: newMaxX,
            minY: newMinY,
            maxY: newMaxY,
            w: newMaxX - newMinX,
            h: newMaxY - newMinY,
            cx: Math.round((newMinX + newMaxX) / 2),
            cy: Math.round((newMinY + newMaxY) / 2),
            count: c1.count + c2.count
          };
          comps.splice(j, 1);
          merged = true;
          break;
        }
      }
      if (merged) break;
    }
  }

  // Filter valid icons
  comps = comps.filter(c => Math.max(c.w, c.h) >= 80 && Math.max(c.w, c.h) <= 220);

  // Sort top-to-bottom, left-to-right
  comps.sort((a, b) => {
    const rowA = Math.floor(a.cy / 160);
    const rowB = Math.floor(b.cy / 160);
    if (rowA !== rowB) return rowA - rowB;
    return a.cx - b.cx;
  });

  console.log(`Extracting ${comps.length} icons...`);

  const avatarList = [];

  for (let i = 0; i < comps.length; i++) {
    const comp = comps[i];
    const size = Math.max(comp.w, comp.h) + 16;
    let left = Math.round(comp.cx - size / 2);
    let top = Math.round(comp.cy - size / 2);

    // Clamp
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left + size > width) left = width - size;
    if (top + size > height) top = height - size;

    const fileName = `avatar-${i + 1}.png`;
    const destPath = path.join(outputDir, fileName);

    await sharp(inputPath)
      .extract({ left, top, width: size, height: size })
      .resize(160, 160)
      .toFile(destPath);

    avatarList.push({
      id: `avatar-${i + 1}`,
      name: `Insignia ${i + 1}`,
      src: `/avatars/${fileName}`,
      fallbackColor: '#ec4899'
    });
  }

  const avatarsTsContent = `export interface HeroAvatarItem {
  id: string;
  name: string;
  src: string;
  fallbackColor: string;
}

export const HERO_AVATARS: HeroAvatarItem[] = ${JSON.stringify(avatarList, null, 2)};
`;

  fs.writeFileSync(path.resolve(__dirname, '../src/data/avatars.ts'), avatarsTsContent);
  console.log(`Done! Wrote ${avatarList.length} avatars to src/data/avatars.ts`);
}

slice().catch(err => {
  console.error(err);
  process.exit(1);
});

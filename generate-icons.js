const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size * 0.14;

  // Background gradient (dark navy → deep purple)
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(1, '#1e1b4b');
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(size, 0, size, size, r);
  ctx.arcTo(size, size, 0, size, r);
  ctx.arcTo(0, size, 0, 0, r);
  ctx.arcTo(0, 0, size, 0, r);
  ctx.closePath();
  ctx.fillStyle = bg;
  ctx.fill();

  // Decorative circle glow
  const glow = ctx.createRadialGradient(size * 0.75, size * 0.25, 0, size * 0.75, size * 0.25, size * 0.5);
  glow.addColorStop(0, 'rgba(99,102,241,0.35)');
  glow.addColorStop(1, 'rgba(99,102,241,0)');
  ctx.beginPath();
  ctx.arc(size * 0.75, size * 0.25, size * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // Logo: two arcs + filled circle (T.O brand mark)
  const cx = size / 2;
  const cy = size * 0.46;
  const outerR = size * 0.26;
  const innerR = size * 0.1;
  const strokeW = size * 0.055;

  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = strokeW;
  ctx.lineCap = 'round';

  // Left arc
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, Math.PI * 0.6, Math.PI * 1.4, false);
  ctx.stroke();

  // Right arc
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, Math.PI * 1.6, Math.PI * 0.4, false);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = '#6366f1';
  ctx.fill();

  // Center dot (white)
  ctx.beginPath();
  ctx.arc(cx, cy, innerR * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // "T.O" text below logo
  const fontSize = size * 0.13;
  ctx.font = `900 ${fontSize}px sans-serif`;
  ctx.fillStyle = '#e0e7ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('T.O', cx, cy + outerR + fontSize * 0.9);

  // Subtitle
  if (size >= 128) {
    const subSize = size * 0.07;
    ctx.font = `600 ${subSize}px sans-serif`;
    ctx.fillStyle = 'rgba(148,163,184,0.9)';
    ctx.fillText('Plataforma TEA', cx, cy + outerR + fontSize * 0.9 + subSize * 1.6);
  }

  return canvas;
}

if (!fs.existsSync('icons')) fs.mkdirSync('icons');

sizes.forEach(size => {
  const canvas = drawIcon(size);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join('icons', `icon-${size}.png`), buf);
  console.log(`✅ icon-${size}.png`);
});

console.log('\n🎉 Todos os ícones gerados!');

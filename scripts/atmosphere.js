export function initAtmosphere(reduce) {
  const canvas = document.querySelector('#binary-field');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width, height, raf = 0;
  const fine = matchMedia('(pointer: fine)');
  const point = { x: -500, y: -500, alpha: 0 };
  const target = { x: -500, y: -500, alpha: 0 };
  const bit = (x, y) => ((Math.imul(x, 374761393) ^ Math.imul(y, 668265263)) >>> 14) & 1;
  function draw() {
    raf = 0;
    const ease = reduce.matches ? 1 : .18;
    point.x += (target.x - point.x) * ease;
    point.y += (target.y - point.y) * ease;
    point.alpha += (target.alpha - point.alpha) * ease;
    ctx.clearRect(0, 0, width, height);
    if (point.alpha > .006 && fine.matches) {
      const radius = Math.min(180, width * .24), cell = 14;
      ctx.font = '10px "Courier New", monospace';
      ctx.textBaseline = 'middle';
      for (let y = Math.max(0, Math.floor((point.y - radius) / cell)); y <= Math.ceil((point.y + radius) / cell); y++) {
        for (let x = Math.max(0, Math.floor((point.x - radius) / cell)); x <= Math.ceil((point.x + radius) / cell); x++) {
          const px = x * cell + 7, py = y * cell + 7;
          const distance = Math.hypot(px - point.x, py - point.y) / radius;
          if (distance >= 1 || px > width || py > height) continue;
          ctx.fillStyle = 'rgba(255,255,255,' + (Math.pow(1 - distance * distance, 2) * point.alpha * .3).toFixed(3) + ')';
          ctx.fillText(String(bit(x, y)), px, py);
        }
      }
    }
    if (!document.hidden && (Math.abs(target.x - point.x) > .2 || Math.abs(target.y - point.y) > .2 || Math.abs(target.alpha - point.alpha) > .006)) raf = requestAnimationFrame(draw);
  }
  function wake() { if (!raf && !document.hidden) raf = requestAnimationFrame(draw); }
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); wake();
  }
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !fine.matches) return;
    target.x = event.clientX; target.y = event.clientY;
    target.alpha = event.target.closest('[data-binary-ignore], .chapter-dock, dialog, input, button') ? 0 : 1;
    if (point.x < 0) { point.x = target.x; point.y = target.y; }
    wake();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { target.alpha = 0; wake(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; ctx.clearRect(0, 0, width, height); }
    else { target.alpha = 0; point.alpha = 0; wake(); }
  });
  addEventListener('resize', resize);
  resize();
}

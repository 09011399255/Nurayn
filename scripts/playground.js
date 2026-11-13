export function initPlayground(reduce) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const tabs = [...document.querySelectorAll('[data-tab]')];
  function activate(name, focus = false) {
    tabs.forEach(tab => {
      const active = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.querySelector('#panel-' + tab.dataset.tab).hidden = !active;
      if (active && focus) tab.focus({ preventScroll: true });
    });
    if (name === 'interface') requestAnimationFrame(sizeFrame);
    if (name !== 'motion') stop();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (i + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
      activate(tabs[next].dataset.tab, true);
    });
  });
  const canvas = document.querySelector('#identity-canvas');
  const name = document.querySelector('#identity-name');
  const weight = document.querySelector('#identity-weight');
  const tracking = document.querySelector('#identity-tracking');
  const palettes = { signal: ['#f04d2a', '#181917'], acid: ['#d6eb48', '#181917'], blue: ['#2349d7', '#f1f0e9'] };
  function updateIdentity() {
    const label = name.value.trim().toUpperCase() || 'ONDA';
    document.querySelectorAll('.live-wordmark, .mini-brand').forEach(mark => {
      mark.textContent = label;
      if (mark.classList.contains('live-wordmark')) mark.style.zoom = Math.min(1, 4.4 / Math.max(4, label.length));
    });
    canvas.style.setProperty('--brand-weight', weight.value);
    canvas.style.setProperty('--brand-tracking', Number(tracking.value) / 100 + 'em');
    document.querySelector('#weight-value').textContent = weight.value;
    document.querySelector('#tracking-value').textContent = Number(tracking.value) < -2 ? 'Tight' : Number(tracking.value) > 3 ? 'Open' : 'Balanced';
  }
  [name, weight, tracking].forEach(input => input.addEventListener('input', updateIdentity));
  function palette(key) {
    canvas.style.setProperty('--brand-bg', palettes[key][0]);
    canvas.style.setProperty('--brand-ink', palettes[key][1]);
    document.querySelectorAll('[data-palette]').forEach(button => {
      const active = button.dataset.palette === key;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  document.querySelectorAll('[data-palette]').forEach(button => button.addEventListener('click', () => palette(button.dataset.palette)));
  document.querySelector('#reset-identity').addEventListener('click', () => {
    name.value = 'ONDA'; weight.value = '800'; tracking.value = '-5';
    palette('signal'); updateIdentity();
  });
  updateIdentity();

  const frame = document.querySelector('#browser-frame');
  const desk = document.querySelector('.responsive-desk');
  const range = document.querySelector('#viewport-range');
  const handle = document.querySelector('#resize-handle');
  let resizeDrag = null;
  function frameBounds() {
    const style = getComputedStyle(desk);
    const max = Math.min(900, desk.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    return { max, min: Math.min(max, innerWidth <= 370 ? 245 : innerWidth <= 700 ? 260 : 290) };
  }
  function sizeFrame(pixels) {
    if (typeof pixels !== 'number') pixels = frameBounds().max * Number(range.value) / 100;
    const { max, min } = frameBounds();
    if (max <= 0) return;
    const width = clamp(pixels, min, max);
    frame.style.width = width + 'px';
    range.value = String(Math.round(width / max * 100));
    document.querySelector('#viewport-value').textContent = Math.round(width) + ' px';
    document.querySelector('#frame-width').textContent = Math.round(width) + ' PX';
    handle.setAttribute('aria-valuetext', Math.round(width) + ' pixels wide');
  }
  range.addEventListener('input', () => sizeFrame(frameBounds().max * Number(range.value) / 100));
  handle.addEventListener('pointerdown', event => {
    resizeDrag = { x: event.clientX, width: frame.offsetWidth, id: event.pointerId };
    handle.setPointerCapture(event.pointerId);
    frame.style.transition = 'none';
    event.preventDefault();
  });
  handle.addEventListener('pointermove', event => {
    if (resizeDrag && event.pointerId === resizeDrag.id) sizeFrame(resizeDrag.width + (event.clientX - resizeDrag.x) * 2);
  });
  function endResize() { resizeDrag = null; frame.style.transition = ''; }
  handle.addEventListener('pointerup', endResize);
  handle.addEventListener('pointercancel', endResize);
  handle.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    sizeFrame(frame.offsetWidth + (event.key === 'ArrowLeft' ? -30 : 30));
  });
  new ResizeObserver(() => { if (!document.querySelector('#panel-interface').hidden && !resizeDrag) sizeFrame(); }).observe(desk);
  let quantity = 0;
  document.querySelector('#mini-add').addEventListener('click', () => {
    quantity++;
    document.querySelector('#mini-bag').textContent = 'BAG (' + quantity + ')';
    document.querySelector('#mini-message').textContent = quantity === 1 ? 'First pressing added. Good taste.' : quantity + ' records in your demo bag.';
  });
  document.querySelector('#mini-bag').addEventListener('click', () => {
    document.querySelector('#mini-message').textContent = quantity ? 'Your demo bag: ' + quantity + ' × ONDA — First Pressing. No checkout in this concept.' : 'Your demo bag is empty. Try adding the first pressing.';
  });

  const record = document.querySelector('#record');
  const speedLabel = document.querySelector('#record-speed');
  let rotation = 0, velocity = 0, recordDrag = null, animation = 0, lastFrame = 0, lastAnnounce = 0;
  function paint(time = 0) {
    record.style.setProperty('--rotation', rotation + 'deg');
    const rpm = Math.abs(velocity) * 1000 / 360 * 60;
    speedLabel.innerHTML = rpm.toFixed(1).padStart(4, '0') + ' <small>RPM</small>';
    if (time - lastAnnounce > 220 || !animation) {
      record.setAttribute('aria-valuenow', String(Math.round((rotation % 360 + 360) % 360)));
      record.setAttribute('aria-valuetext', Math.abs(velocity) > .005 ? 'Spinning at ' + rpm.toFixed(1) + ' RPM' : 'Stopped');
      lastAnnounce = time;
    }
  }
  function tick(time) {
    const dt = Math.min(32, time - lastFrame || 16);
    lastFrame = time;
    rotation += velocity * dt;
    velocity *= Math.pow(.987, dt / 16.67);
    paint(time);
    if (Math.abs(velocity) > .002 && !document.hidden && !record.closest('[role="tabpanel"]').hidden) animation = requestAnimationFrame(tick);
    else stop();
  }
  function start() {
    if (reduce.matches) { rotation += 40; velocity = 0; paint(); return; }
    if (!animation) { lastFrame = performance.now(); animation = requestAnimationFrame(tick); }
  }
  function stop() {
    cancelAnimationFrame(animation);
    animation = 0;
    velocity = 0;
    paint();
  }
  function angle(event) {
    const box = record.getBoundingClientRect();
    return Math.atan2(event.clientY - (box.top + box.height / 2), event.clientX - (box.left + box.width / 2)) * 180 / Math.PI;
  }
  record.addEventListener('pointerdown', event => {
    stop();
    recordDrag = { id: event.pointerId, angle: angle(event), time: performance.now() };
    record.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  record.addEventListener('pointermove', event => {
    if (!recordDrag || event.pointerId !== recordDrag.id) return;
    const next = angle(event), now = performance.now();
    let delta = next - recordDrag.angle;
    delta = (delta + 540) % 360 - 180;
    rotation += delta;
    velocity = clamp(delta / Math.max(8, now - recordDrag.time), -1.5, 1.5);
    recordDrag.angle = next; recordDrag.time = now;
    paint(now);
  });
  function release(event) {
    if (!recordDrag || event.pointerId !== recordDrag.id) return;
    if (performance.now() - recordDrag.time > 100 || reduce.matches) velocity = 0;
    recordDrag = null;
    if (record.hasPointerCapture(event.pointerId)) record.releasePointerCapture(event.pointerId);
    if (Math.abs(velocity) > .002) start(); else stop();
  }
  record.addEventListener('pointerup', release);
  record.addEventListener('pointercancel', () => { recordDrag = null; stop(); });
  record.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', ' ', 'Escape', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    stop();
    if (event.key === ' ') { velocity = .35; start(); }
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { rotation += event.key === 'ArrowLeft' ? -15 : 15; paint(); }
    else if (event.key === 'Home' || event.key === 'End') { rotation = event.key === 'Home' ? 0 : 359; paint(); }
  });
  document.querySelector('#spin-record').addEventListener('click', () => { velocity = .42; start(); });
  document.querySelector('#stop-record').addEventListener('click', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  reduce.addEventListener('change', () => { if (reduce.matches) stop(); });
}

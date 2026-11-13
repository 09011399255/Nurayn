import { initGallery } from './gallery.js';
import { initPlayground } from './playground.js';
import { initAtmosphere } from './atmosphere.js';
import { initEdition } from './edition.js';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const toggle = document.querySelector('#theme-toggle');
let switching = false;
function applyTheme(theme) {
  root.dataset.theme = theme;
  toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#181917' : '#f1f0e9';
  try { localStorage.setItem('nurayn-studio-theme', theme); } catch {}
}
applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
toggle.addEventListener('click', async () => {
  if (switching) return;
  switching = true;
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.transition = 'theme';
  root.dataset.wipe = next;
  try {
    if (document.startViewTransition && !reduce.matches) {
      const transition = document.startViewTransition(() => applyTheme(next));
      await transition.finished;
    } else if (!reduce.matches) {
      const curtain = document.querySelector('.theme-curtain');
      curtain.style.transformOrigin = next === 'dark' ? 'right' : 'left';
      await curtain.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 360, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }).finished;
      applyTheme(next);
      curtain.style.transformOrigin = next === 'dark' ? 'left' : 'right';
      await curtain.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 360, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }).finished;
    } else applyTheme(next);
  } catch { applyTheme(next); }
  finally { delete root.dataset.transition; delete root.dataset.wipe; switching = false; }
});

const chapters = [...document.querySelectorAll('.chapter')];
const links = [...document.querySelectorAll('.dock-links a')];
const indicator = document.querySelector('.dock-indicator');
let activeSection = '';
let queued = false;
function updatePage() {
  queued = false;
  const y = scrollY;
  root.style.setProperty('--page-progress', y / Math.max(1, root.scrollHeight - innerHeight));
  let current = chapters[0];
  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top < innerHeight * .43) current = chapter;
  }
  const group = current.dataset.navGroup || current.id;
  if (activeSection !== group) {
    activeSection = group;
    links.forEach(link => {
      if (link.dataset.section === group) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  const active = links.find(link => link.dataset.section === group);
  indicator.style.setProperty('--dock-x', active.offsetLeft + 'px');
  indicator.style.setProperty('--dock-width', active.offsetWidth + 'px');
}
function schedulePage() { if (!queued) { queued = true; requestAnimationFrame(updatePage); } }
addEventListener('scroll', schedulePage, { passive: true });
addEventListener('resize', schedulePage);
document.fonts.ready.then(schedulePage);
updatePage();

const film = document.querySelector('.hero-film');
film.addEventListener('pointermove', event => {
  if (reduce.matches || event.pointerType !== 'mouse') return;
  const rect = film.getBoundingClientRect();
  film.style.setProperty('--film-x', ((event.clientX - rect.left) / rect.width - .5) * -16 + 'px');
  film.style.setProperty('--film-y', ((event.clientY - rect.top) / rect.height - .5) * -12 + 'px');
  film.style.setProperty('--film-scale', '1.025');
});
film.addEventListener('pointerleave', () => {
  film.style.setProperty('--film-x', '0px');
  film.style.setProperty('--film-y', '0px');
  film.style.setProperty('--film-scale', '1');
});
initGallery(reduce);
initEdition(reduce);
initPlayground(reduce);
initAtmosphere(reduce);

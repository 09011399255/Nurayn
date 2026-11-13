import { projects } from './projects.js';

export function initGallery(reduce) {
  const gallery = document.querySelector('#gallery');
  const cards = [...gallery.querySelectorAll('.project-card')];
  const jumps = [...document.querySelectorAll('[data-gallery-go]')];
  let index = 0, scrollTimer = 0;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const gutter = () => parseFloat(getComputedStyle(gallery).scrollPaddingLeft) || 0;
  function update(next) {
    index = clamp(next, 0, cards.length - 1);
    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === index);
      if (i === index) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
    });
    jumps.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    document.querySelector('#gallery-count').textContent = String(index + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
    document.querySelector('#prev-project').disabled = index === 0;
    document.querySelector('#next-project').disabled = index === cards.length - 1;
  }
  function goTo(next, instant = false) {
    update(next);
    if (!gallery.clientWidth) return;
    const left = cards[index].getBoundingClientRect().left - gallery.getBoundingClientRect().left + gallery.scrollLeft - gutter();
    gallery.scrollTo({ left, behavior: instant || reduce.matches ? 'instant' : 'smooth' });
  }
  function syncFromScroll() {
    if (!gallery.clientWidth) return;
    const start = gallery.getBoundingClientRect().left + gutter();
    let nearest = 0, distance = Infinity;
    cards.forEach((card, i) => {
      const delta = Math.abs(card.getBoundingClientRect().left - start);
      if (delta < distance) { distance = delta; nearest = i; }
    });
    if (gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 3) nearest = cards.length - 1;
    update(nearest);
  }
  document.querySelector('#prev-project').addEventListener('click', () => goTo(index - 1));
  document.querySelector('#next-project').addEventListener('click', () => goTo(index + 1));
  jumps.forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.galleryGo))));
  gallery.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  gallery.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(syncFromScroll, 120);
  }, { passive: true });
  gallery.addEventListener('scrollend', syncFromScroll);
  gallery.addEventListener('gallery:show', () => requestAnimationFrame(() => goTo(index, true)));
  gallery.addEventListener('dragstart', event => event.preventDefault());
  let previousWidth = 0;
  new ResizeObserver(() => {
    if (gallery.clientWidth && gallery.clientWidth !== previousWidth) {
      previousWidth = gallery.clientWidth;
      goTo(index, true);
    }
  }).observe(gallery);
  update(0);

  const dialog = document.querySelector('#case-dialog');
  const content = document.querySelector('#case-content');
  const root = document.documentElement;
  let selectedProject = 0, sourceImage = null, sourceButton = null, savedScroll = 0, opening = false;
  function renderCase(i) {
    const p = projects[i];
    const figures = p.images.map((art, n) =>
      '<figure><img' + (n === 0 ? ' class="case-hero"' : '') + ' src="assets/' + art.file + '" alt="' + art.alt + '" loading="' + (n === 0 ? 'eager' : 'lazy') + '"><figcaption>' + art.caption + '</figcaption></figure>'
    ).join('');
    content.innerHTML =
      '<div class="case-heading"><h2 id="case-title">' + p.name + '</h2><p>' + p.description + '</p></div>' +
      '<div class="preview-scope"><span class="micro">THE FOCUS / ' + p.category + '</span><p>' + p.focus + '</p></div>' +
      '<div class="project-preview-grid ' + (p.layout === 'portrait' ? 'is-portrait' : '') + '">' + figures + '</div>';
    document.querySelector('#case-number').textContent = '0' + (i + 1) + ' / PROJECT PREVIEW';
    document.querySelector('#next-case').textContent = 'Next: ' + projects[(i + 1) % projects.length].name + ' ↗';
  }
  async function openCase(i, button) {
    if (opening || dialog.open) return;
    opening = true;
    selectedProject = i;
    sourceButton = button;
    sourceImage = button.querySelector('img');
    savedScroll = scrollY;
    renderCase(i);
    const reveal = () => {
      if (sourceImage) sourceImage.style.viewTransitionName = '';
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      dialog.scrollTop = 0;
      if (sourceImage) content.querySelector('.case-hero').style.viewTransitionName = 'project-art';
      document.querySelector('#close-case').focus({ preventScroll: true });
    };
    root.dataset.transition = 'case';
    try {
      if (document.startViewTransition && !reduce.matches) {
        if (sourceImage) sourceImage.style.viewTransitionName = 'project-art';
        await document.startViewTransition(reveal).finished;
      } else reveal();
    } catch { if (!dialog.open) reveal(); }
    finally {
      sourceImage?.style.removeProperty('view-transition-name');
      content.querySelector('.case-hero')?.style.removeProperty('view-transition-name');
      delete root.dataset.transition;
      opening = false;
    }
  }
  function closeCase() {
    if (!dialog.open) return;
    dialog.close();
  }
  document.querySelectorAll('[data-open-project]').forEach(button => {
    button.addEventListener('click', () => {
      const i = Number(button.dataset.openProject);
      openCase(i, button);
    });
  });
  document.querySelector('#close-case').addEventListener('click', closeCase);
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    window.scrollTo({ top: savedScroll, behavior: 'instant' });
    sourceButton?.focus({ preventScroll: true });
  });
  document.querySelector('#next-case').addEventListener('click', () => {
    selectedProject = (selectedProject + 1) % projects.length;
    renderCase(selectedProject);
    dialog.scrollTo({ top: 0, behavior: reduce.matches ? 'instant' : 'smooth' });
    document.querySelector('#close-case').focus({ preventScroll: true });
  });
}

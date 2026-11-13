import { projects } from './projects.js';

export function initGallery(reduce) {
  const gallery = document.querySelector('#gallery');
  const track = gallery.querySelector('.gallery-track');
  const cards = [...gallery.querySelectorAll('.project-card')];
  const cursor = document.querySelector('.drag-cursor');
  let index = 0, origin = 0, drag = null, blockClickUntil = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function dimensions() {
    const width = cards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 42;
    return { width, step: width + gap };
  }
  function place(offset = 0) {
    const { width, step } = dimensions();
    origin = (gallery.clientWidth - width) / 2 - index * step;
    track.style.transform = 'translate3d(' + (origin + offset) + 'px,0,0)';
  }
  function select(next) {
    index = clamp(next, 0, cards.length - 1);
    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === index);
      card.classList.toggle('is-before', i < index);
      card.querySelector('button').tabIndex = i === index ? 0 : -1;
      card.setAttribute('aria-current', String(i === index));
    });
    document.querySelector('#gallery-count').textContent = '0' + (index + 1) + ' — 0' + cards.length;
    document.querySelector('.gallery-progress').style.setProperty('--project-index', index);
    document.querySelector('#prev-project').disabled = index === 0;
    document.querySelector('#next-project').disabled = index === cards.length - 1;
    place();
  }
  document.querySelector('#prev-project').addEventListener('click', () => select(index - 1));
  document.querySelector('#next-project').addEventListener('click', () => select(index + 1));
  gallery.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    select(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  gallery.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, moved: false, time: performance.now(), target: event.target };
  });
  gallery.addEventListener('pointermove', event => {
    cursor.style.left = event.clientX + 'px';
    cursor.style.top = event.clientY + 'px';
    cursor.classList.toggle('visible', event.pointerType === 'mouse');
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved && Math.abs(event.clientY - drag.y) > Math.abs(dx) + 10) { drag = null; return; }
    if (Math.abs(dx) > 7 && !drag.moved) {
      drag.moved = true;
      gallery.setPointerCapture(event.pointerId);
      gallery.classList.add('is-dragging');
    }
    if (drag.moved) {
      drag.dx = dx;
      const edge = (index === 0 && dx > 0) || (index === cards.length - 1 && dx < 0);
      place(dx * (edge ? .28 : 1));
    }
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const previous = drag;
    drag = null;
    gallery.classList.remove('is-dragging');
    if (gallery.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
    if (previous.moved) {
      blockClickUntil = performance.now() + 350;
      const speed = Math.abs(previous.dx) / Math.max(1, performance.now() - previous.time);
      const threshold = Math.min(95, dimensions().width * .16);
      select(index + (Math.abs(previous.dx) > threshold || speed > .45 ? Math.sign(-previous.dx) : 0));
    } else place();
  }
  gallery.addEventListener('pointerup', endDrag);
  gallery.addEventListener('pointercancel', event => { if (drag) drag.dx = 0; endDrag(event); });
  gallery.addEventListener('pointerleave', () => cursor.classList.remove('visible'));
  gallery.addEventListener('dragstart', event => event.preventDefault());
  new ResizeObserver(() => place()).observe(gallery);
  select(0);

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
    cursor.classList.remove('visible');
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
    button.addEventListener('click', event => {
      if (performance.now() < blockClickUntil) { event.preventDefault(); return; }
      const i = Number(button.dataset.openProject);
      if (button.closest('.gallery') && i !== index) { select(i); return; }
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

export function initEdition(reduce) {
  const views = [...document.querySelectorAll('[data-work-view]')];
  views.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.workView;
    views.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#gallery-view').hidden = selected !== 'gallery';
    document.querySelector('#project-index').hidden = selected !== 'index';
  }));

  const reveal = document.querySelector('#identity-reveal');
  const revealRange = document.querySelector('#identity-reveal-range');
  function showReveal() {
    reveal.style.setProperty('--reveal', revealRange.value + '%');
    revealRange.setAttribute('aria-valuetext', revealRange.value + ' percent monogram, ' + (100 - Number(revealRange.value)) + ' percent imagery');
  }
  revealRange.addEventListener('input', showReveal);
  showReveal();

  const services = {
    brand: {
      image: 'honeydrop-guidelines.jpg', alt: 'Honeydrop brand guidelines and editorial art direction',
      description: 'A visual language with its own point of view. Designed to hold together, from the smallest mark to the biggest expression.',
      href: '#identity', link: 'See it in Honeydrop ↗'
    },
    product: {
      image: 'reloop.jpg', alt: 'Reloop recycling marketplace dashboard',
      description: 'Make the complicated feel clear. Shape journeys, interfaces and design systems around the people who will actually use them.',
      href: '#work', link: 'Explore the product work ↗'
    },
    web: {
      image: 'little-fixers-repair.jpg', alt: 'Little Fixers interaction concept: choosing a wheel for Milo',
      description: 'Give the idea a life beyond the layout. Responsive websites, working prototypes and interactions with a reason to exist.',
      href: '#craft', link: 'Get hands-on in the studio ↗'
    }
  };
  const tabs = [...document.querySelectorAll('[data-service]')];
  const panel = document.querySelector('#service-preview');
  function chooseService(button, focus = false) {
    const key = button.dataset.service;
    const service = services[key];
    tabs.forEach(tab => {
      const active = tab === button;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panel.dataset.service = key;
    panel.setAttribute('aria-labelledby', button.id);
    const img = document.querySelector('#service-image');
    img.src = 'assets/' + service.image;
    img.alt = service.alt;
    document.querySelector('#service-description').textContent = service.description;
    const link = document.querySelector('#service-link');
    link.href = service.href; link.textContent = service.link;
    if (!reduce.matches) {
      panel.classList.remove('is-changing');
      requestAnimationFrame(() => panel.classList.add('is-changing'));
    }
    if (focus) button.focus({ preventScroll: true });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => chooseService(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const n = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowDown' ? 1 : tabs.length - 1)) % tabs.length;
      chooseService(tabs[n], true);
    });
  });
  const steps = [...document.querySelectorAll('[data-process]')];
  const diagram = document.querySelector('.process-diagram');
  const symbols = ['?', '✳', '↗'];
  const labels = ['01 / FIND THE QUESTION', '02 / FIND THE CHARACTER', '03 / BRING IT TO LIFE'];
  steps.forEach(step => step.addEventListener('toggle', () => {
    if (!step.open) return;
    steps.forEach(other => { if (other !== step) other.open = false; });
    const i = Number(step.dataset.process);
    diagram.dataset.stage = i;
    diagram.querySelector('.diagram-core').textContent = symbols[i];
    diagram.querySelector('.diagram-label').textContent = labels[i];
  }));
}

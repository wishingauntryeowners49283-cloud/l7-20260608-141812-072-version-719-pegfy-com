const body = document.body;

function setupNavigation() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    body.classList.toggle('nav-open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      body.classList.remove('nav-open');
    });
  });
}

function setupHero() {
  const carousel = document.querySelector('[data-hero-carousel]');
  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
  const prev = carousel.querySelector('[data-hero-prev]');
  const next = carousel.querySelector('[data-hero-next]');
  let current = 0;
  let timer = null;

  const show = (index) => {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === current);
    });
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      show(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(current + 1);
      restart();
    });
  }

  restart();
}

function setupSearchPanels() {
  document.querySelectorAll('[data-search-panel]').forEach((panel) => {
    const input = panel.querySelector('[data-search-input]');
    const chips = Array.from(panel.querySelectorAll('[data-filter-value]'));
    const section = panel.closest('section') || document;
    const items = Array.from(section.querySelectorAll('[data-search-item]'));
    const empty = section.querySelector('[data-empty-state]');
    let activeFilter = 'all';

    const normalize = (value) => String(value || '').toLowerCase().trim();

    const update = () => {
      const query = normalize(input ? input.value : '');
      let visible = 0;

      items.forEach((item) => {
        const hay = normalize([
          item.dataset.hay,
          item.dataset.title,
          item.dataset.year,
          item.dataset.type,
          item.dataset.region,
          item.dataset.genre,
          item.dataset.tags,
          item.textContent
        ].join(' '));
        const filterMatch = activeFilter === 'all' || hay.includes(normalize(activeFilter));
        const queryMatch = !query || hay.includes(query);
        const matched = filterMatch && queryMatch;
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    if (input) {
      input.addEventListener('input', update);
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filterValue || 'all';
        chips.forEach((currentChip) => currentChip.classList.toggle('active', currentChip === chip));
        update();
      });
    });
  });
}

setupNavigation();
setupHero();
setupSearchPanels();

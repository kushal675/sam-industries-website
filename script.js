/* SAM Industries — vanilla JS */
(function () {
  'use strict';

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const mobile = document.querySelector('.mobile-menu');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => mobile.classList.toggle('open'));
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobile.classList.remove('open')));
  }

  /* ---------- Nav dropdown (click toggle on mobile/tablet, hover on desktop via CSS) ---------- */
  document.querySelectorAll('.nav-dropdown').forEach(dd => {
    const btn = dd.querySelector('.nav-drop-btn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', dd.classList.contains('open') ? 'true' : 'false');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
  });

  /* ---------- OEM enquiry form (mailto) ---------- */
  const oemForm = document.getElementById('oem-form');
  if (oemForm) {
    oemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(oemForm);
      const lines = [];
      ['name','company','country','email','phone','oem','product','message'].forEach(k => {
        const v = d.get(k);
        if (v) lines.push(k.toUpperCase() + ': ' + v);
      });
      const file = d.get('attachment');
      if (file && file.name) lines.push('ATTACHMENT: ' + file.name + ' (please attach manually)');
      const subject = encodeURIComponent('OEM Enquiry — ' + (d.get('product') || d.get('name') || 'Request'));
      const body = encodeURIComponent(lines.join('\n'));
      window.location.href = `mailto:info@samindustries.com?subject=${subject}&body=${body}`;
    });
  }


  /* ---------- Product carousel ---------- */
  const productsData = window.__FEATURED_PRODUCTS__ || [];
  const car = document.querySelector('[data-carousel="featured"]');
  if (car && productsData.length) {
    const track = car.querySelector('.carousel-track');
    const dotsWrap = car.querySelector('.carousel-dots');
    const prev = car.querySelector('.carousel-arrow.prev');
    const next = car.querySelector('.carousel-arrow.next');
    let index = 0;
    let perView = 4;
    let timer = null;
    let paused = false;

    function computePerView() {
      const w = window.innerWidth;
      perView = w < 640 ? 1 : w < 1024 ? 2 : w < 1280 ? 3 : 4;
    }

    function render() {
      track.innerHTML = '';
      for (let k = 0; k < perView; k++) {
        const p = productsData[(index + k) % productsData.length];
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <div class="p-img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
          <div class="p-body">
            <div class="p-name">${p.name}</div>
            <span class="p-cat">${p.category}</span>
            <span class="p-view">View Product →</span>
          </div>`;
        track.appendChild(card);
      }
      if (dotsWrap) {
        dotsWrap.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === index));
      }
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      productsData.forEach((_, i) => {
        const b = document.createElement('button');
        b.setAttribute('aria-label', 'Go to product ' + (i + 1));
        b.addEventListener('click', () => { index = i; render(); resetTimer(); });
        dotsWrap.appendChild(b);
      });
    }

    function go(dir) {
      index = (index + dir + productsData.length) % productsData.length;
      render();
    }
    function resetTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => { if (!paused) go(1); }, 3500);
    }

    prev && prev.addEventListener('click', () => { go(-1); resetTimer(); });
    next && next.addEventListener('click', () => { go(1); resetTimer(); });
    car.addEventListener('mouseenter', () => paused = true);
    car.addEventListener('mouseleave', () => paused = false);
    car.addEventListener('touchstart', () => paused = true, { passive: true });
    car.addEventListener('touchend', () => paused = false);

    window.addEventListener('resize', () => {
      const p = perView; computePerView();
      if (p !== perView) render();
    });

    computePerView();
    buildDots();
    render();
    resetTimer();
  }

  /* ---------- Equipment carousel (infrastructure) ---------- */
  const eqData = window.__EQUIPMENT__ || [];
  const eqCar = document.querySelector('[data-carousel="equipment"]');
  if (eqCar && eqData.length) {
    const track = eqCar.querySelector('.carousel-track');
    const prev = eqCar.querySelector('.carousel-arrow.prev');
    const next = eqCar.querySelector('.carousel-arrow.next');
    let index = 0;
    let perView = 6;
    function computePV() {
      const w = window.innerWidth;
      perView = w < 640 ? 2 : w < 1024 ? 3 : w < 1280 ? 4 : 6;
    }
    function render() {
      track.innerHTML = '';
      for (let k = 0; k < perView; k++) {
        const e = eqData[(index + k) % eqData.length];
        const el = document.createElement('div');
        el.className = 'equip-card';
        el.innerHTML = `
          <div class="e-img"><img src="${e.image}" alt="${e.name}" loading="lazy"></div>
          <div class="e-body">
            <h5>${e.name}</h5>
            <p>${e.desc}</p>
          </div>`;
        track.appendChild(el);
      }
    }
    prev && prev.addEventListener('click', () => { index = (index - 1 + eqData.length) % eqData.length; render(); });
    next && next.addEventListener('click', () => { index = (index + 1) % eqData.length; render(); });
    window.addEventListener('resize', () => { const p = perView; computePV(); if (p !== perView) render(); });
    computePV(); render();
  }

  /* ---------- Products page: filter + search ---------- */
  const catalog = window.__PRODUCT_CATALOG__ || [];
  const grid = document.querySelector('#product-grid');
  const searchEl = document.querySelector('#product-search');
  const filterBtns = document.querySelectorAll('.filter');
  if (grid && catalog.length) {
    let active = 'hero';
    let query = '';

    function renderGrid() {
      const items = catalog.filter(p => {
        const okCat = active === 'hero' ? p.hero : p.categoryKey === active;
        const okQ = !query || p.name.toLowerCase().includes(query.toLowerCase());
        return okCat && okQ;
      });
      grid.innerHTML = '';
      if (!items.length) {
        grid.innerHTML = '<p class="empty">No products match your search.</p>';
        return;
      }
      items.forEach(p => {
        const el = document.createElement('div');
        el.className = 'product-card';
        el.innerHTML = `
          <div class="p-img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
          <div class="p-body">
            <div class="p-name">${p.name}</div>
            <span class="p-cat">${p.category}</span>
          </div>`;
        grid.appendChild(el);
      });
    }
    filterBtns.forEach(b => b.addEventListener('click', () => {
      filterBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      active = b.dataset.filter;
      renderGrid();
    }));
    searchEl && searchEl.addEventListener('input', e => { query = e.target.value; renderGrid(); });
    renderGrid();
  }

  /* ---------- Testimonial rotator ---------- */
  const tWrap = document.querySelector('.testimonials');
  if (tWrap) {
    const dots = tWrap.querySelectorAll('.t-dots button');
    const prev = tWrap.querySelector('.carousel-arrow.prev');
    const next = tWrap.querySelector('.carousel-arrow.next');
    const track = tWrap.querySelector('.testimonial-track');
    const groups = window.__TESTIMONIAL_GROUPS__ || [];
    let i = 0;
    function render() {
      if (!groups.length) return;
      track.innerHTML = '';
      groups[i].forEach(t => {
        const el = document.createElement('div');
        el.className = 'testimonial';
        el.innerHTML = `
          <div class="stars">${'<svg viewBox="0 0 24 24"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9"/></svg>'.repeat(5)}</div>
          <p class="quote">"${t.quote}"</p>
          <div class="who">
            <div class="avatar">${t.initials}</div>
            <div><h6>${t.name}</h6><small>${t.org}</small></div>
          </div>`;
        track.appendChild(el);
      });
      dots.forEach((d, k) => d.classList.toggle('active', k === i));
    }
    dots.forEach((d, k) => d.addEventListener('click', () => { i = k; render(); }));
    prev && prev.addEventListener('click', () => { i = (i - 1 + groups.length) % groups.length; render(); });
    next && next.addEventListener('click', () => { i = (i + 1) % groups.length; render(); });
    render();
    if (groups.length > 1) setInterval(() => { i = (i + 1) % groups.length; render(); }, 6000);
  }

  /* ---------- Number count-up on stats ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        let n = 0;
        const dur = 1200;
        const start = performance.now();
        function tick(t) {
          const p = Math.min(1, (t - start) / dur);
          n = Math.floor(target * (0.5 - Math.cos(p * Math.PI) / 2));
          el.textContent = n + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => io.observe(c));
  }
})();

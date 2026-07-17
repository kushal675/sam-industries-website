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
    const dotsWrap = tWrap.querySelector('.t-dots');
    const track = tWrap.querySelector('.testimonial-track');
    const items = window.__TESTIMONIALS__ || [];
    let i = 0;
    if (dotsWrap && items.length) {
      dotsWrap.innerHTML = '';
      items.forEach((_, k) => {
        const b = document.createElement('button');
        if (k === 0) b.classList.add('active');
        b.addEventListener('click', () => { i = k; render(); });
        dotsWrap.appendChild(b);
      });
    }
    function render() {
      if (!items.length) return;
      const t = items[i];
      track.innerHTML = `
        <article class="testimonial-slide">
          <div class="ts-cert">
            <div class="ts-cert-frame"><img src="${t.certificate}" alt="Certificate from ${t.org}" loading="lazy"></div>
          </div>
          <div class="ts-body">
            <div class="ts-quote-mark">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.17 6C4.87 6 3 7.87 3 10.17v7.83h7.83V10.17H6.5c0-1.47 1.2-2.67 2.67-2.67V6H7.17zm10 0c-2.3 0-4.17 1.87-4.17 4.17v7.83h7.83V10.17H16.5c0-1.47 1.2-2.67 2.67-2.67V6h-2z"/></svg>
            </div>
            <p class="ts-quote">"${t.quote}"</p>
            <hr class="ts-divider">
            <div class="ts-meta">
              <h6>${t.name}</h6>
              <small>${t.org}</small>
            </div>
          </div>
        </article>`;
      dotsWrap && dotsWrap.querySelectorAll('button').forEach((d, k) => d.classList.toggle('active', k === i));
    }
    render();
    if (items.length > 1) setInterval(() => { i = (i + 1) % items.length; render(); }, 7000);
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

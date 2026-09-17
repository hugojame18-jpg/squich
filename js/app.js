/* ==========================================================
   SQUISHLAND — Application
   ========================================================== */
(function () {
  const { render, squish, wobble, mix, Sound } = window.Squishy;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const charById = Object.fromEntries(MASCOTS.map(p => [p.id, p])); // personnages dessinés (décor)
  const MAX_ITEMS = 1; // 1 squishy par commande

  /* ---------- Stockage sécurisé ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('squishland:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('squishland:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  const state = {
    cart: store.get('cart', []).filter(i => i && PRODUCTS.some(p => p.id === i.id)).slice(0, MAX_ITEMS).map(i => ({ ...i, qty: 1 })),
    wish: new Set(store.get('wish', []).filter(id => PRODUCTS.some(p => p.id === id))),
    squishes: store.get('squishes', 0),
    filters: { cat: 'all', tag: null, q: '', sort: 'featured', minSoft: 1, minRise: 0 },
    drawerTab: 'cart'
  };
  Sound.on = store.get('sound', true);

  /* ---------- Utilitaires ---------- */
  const euro = n => n.toFixed(2).replace('.', ',') + ' €';
  const bg = p => mix(mix(p.c1, p.c2, .4), '#ffffff', .5);
  const starsTxt = n => '★★★★★'.slice(0, Math.round(n)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(n));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function variantOf(p, v) {
    if (!v) return p;
    const cv = COLOR_VARIANTS[v - 1];
    return cv ? { ...p, c1: cv.c1, c2: cv.c2, _variant: true } : p;
  }

  /* ---------- Photos produits ----------
     Dépose tes photos dans /images en les nommant avec l'id du produit :
     images/momo-peche.jpg (+ momo-peche-2.jpg, -3, -4 pour la galerie).
     Formats : jpg, jpeg, png, webp. Sans photo, le dessin animé est affiché. */
  const PHOTOS = {};
  const EXTS = ['jpg', 'jpeg', 'png', 'webp'];
  const probe = url => new Promise(res => { const i = new Image(); i.onload = () => res(url); i.onerror = () => res(null); i.src = url; });
  async function findPhotos(p) {
    if (p.images) return (await Promise.all(p.images.map(probe))).filter(Boolean);
    for (const ext of EXTS) {
      const main = await probe(`images/${p.id}.${ext}`);
      if (main) return [main, ...(await Promise.all([2, 3, 4].map(n => probe(`images/${p.id}-${n}.${ext}`)))).filter(Boolean)];
    }
    return [];
  }
  // Photo si disponible (et coloris d'origine), sinon squishy dessiné
  function media(p, withAlt) {
    const ph = p && PHOTOS[p.id];
    if (!ph || !ph.length) return render(p);
    return `<img class="photo" src="${ph[0]}" alt="${esc(p.name)}" loading="lazy" decoding="async" draggable="false"/>` +
      (withAlt && ph[1] ? `<img class="photo photo-alt" src="${ph[1]}" alt="" loading="lazy" decoding="async" draggable="false"/>` : '');
  }
  function variantsFor(p) {
    // Original + 3 coloris choisis de manière stable selon le produit
    const start = p.id.length % COLOR_VARIANTS.length;
    const idx = [0, 1, 2].map(i => ((start + i) % COLOR_VARIANTS.length) + 1);
    return [0, ...idx];
  }
  function sizesFor(p) { return p.xxl ? [{ id: 'XXL', label: 'Géant', dim: '30-35 cm', delta: 0 }] : SIZES; }
  function unitPrice(item) {
    const p = byId[item.id];
    const s = sizesFor(p).find(s => s.id === item.size) || sizesFor(p)[0];
    return +(p.price + s.delta).toFixed(2);
  }

  function burst(x, y, emojis, count) {
    emojis = emojis || ['💖', '✨', '💫', '🌸'];
    count = count || 7;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'burst';
      el.textContent = emojis[i % emojis.length];
      el.style.left = x + 'px'; el.style.top = y + 'px';
      document.body.appendChild(el);
      const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 70;
      el.animate([
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 30}px)) scale(1) rotate(${Math.random() * 60 - 30}deg)`, opacity: 0 }
      ], { duration: 800 + Math.random() * 400, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => el.remove();
    }
  }

  function confetti() {
    const cols = ['#FF5C9A', '#FFD24D', '#6FD6B2', '#B69CFF', '#8EC5FF'];
    const W = window.innerWidth;
    for (let i = 0; i < 90; i++) {
      const el = document.createElement('i');
      el.className = 'confetti';
      const w = 6 + Math.random() * 8;
      el.style.width = w + 'px'; el.style.height = w * (Math.random() > .5 ? .45 : 1) + 'px';
      el.style.background = cols[i % cols.length];
      if (Math.random() > .6) el.style.borderRadius = '50%';
      document.body.appendChild(el);
      const x0 = W / 2 + (Math.random() - .5) * 200, y0 = window.innerHeight * .45;
      const x1 = x0 + (Math.random() - .5) * W * .9, y1 = window.innerHeight + 40;
      const peak = y0 - 150 - Math.random() * 300;
      el.animate([
        { transform: `translate(${x0}px, ${y0}px) rotate(0)` },
        { transform: `translate(${(x0 + x1) / 2}px, ${peak}px) rotate(${Math.random() * 360}deg)`, offset: .35, easing: 'ease-in' },
        { transform: `translate(${x1}px, ${y1}px) rotate(${Math.random() * 900}deg)` }
      ], { duration: 1600 + Math.random() * 1200, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = () => el.remove();
    }
  }

  function toast(html, thumb, action) {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="t-thumb">${thumb || '✨'}</span><span>${html}</span>`;
    if (action) {
      const b = document.createElement('button');
      b.textContent = action.label;
      b.onclick = () => { action.fn(); close(); };
      el.appendChild(b);
    }
    box.appendChild(el);
    while (box.children.length > 3) box.firstElementChild.remove();
    const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 350); };
    setTimeout(close, 3200);
  }

  function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

  function countSquish() {
    state.squishes++;
    store.set('squishes', state.squishes);
    const c = $('#heroCount');
    c.textContent = state.squishes.toLocaleString('fr-FR');
    const box = c.parentElement;
    box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump');
  }

  /* ---------- Logo & décor ---------- */
  $('#logoMark').innerHTML = render(charById['momo-peche']);
  $('#logoMark2').innerHTML = render(charById['momo-peche']);

  /* ---------- Hero ---------- */
  const hero = charById['momo-peche'];
  const heroBtn = $('#heroSquishy');
  heroBtn.innerHTML = render(hero);
  $('#heroCount').textContent = state.squishes.toLocaleString('fr-FR');
  heroBtn.addEventListener('pointerdown', e => {
    squish(heroBtn, hero.rise, 1);
    Sound.play('squish');
    countSquish();
    burst(e.clientX, e.clientY);
    $('.hero-hint').style.opacity = '0';
  });
  heroBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); squish(heroBtn, hero.rise, 1); Sound.play('squish'); countSquish(); } });

  const floaters = [
    ['mochi-matcha', 1, 2, -10], ['neko-mochi', 42, 1, 8], ['donut-rose', 1, 90, 12],
    ['etoile-filante', 45, 92, -14], ['poussin-pompon', 92, 8, 10], ['nuage-calin', 94, 72, -6]
  ];
  $('#heroFloaters').innerHTML = floaters.map(([id, x, y, r], i) =>
    `<div class="floater" data-id="${id}" style="left:${x}%;top:${y}%;--r:${r}deg;animation-delay:${-i * 1.4}s;width:${48 + (i % 3) * 12}px;height:${48 + (i % 3) * 12}px">${render(charById[id])}</div>`).join('');
  $('#heroFloaters').addEventListener('pointerdown', e => {
    const f = e.target.closest('.floater');
    if (!f) return;
    squish(f, 4, 1); Sound.play('pop'); countSquish();
  });

  $('.squishy-word').addEventListener('click', () => Sound.play('pop'));

  /* ---------- Son ---------- */
  const soundBtn = $('#soundBtn');
  const syncSound = () => soundBtn.classList.toggle('muted', !Sound.on);
  syncSound();
  soundBtn.addEventListener('click', () => {
    Sound.on = !Sound.on; store.set('sound', Sound.on); syncSound();
    Sound.play('pop');
    toast(Sound.on ? 'Son activé' : 'Son coupé', Sound.on ? '🔊' : '🔇');
  });

  /* ---------- Header ---------- */
  const header = $('#header');
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true });
  $('#burger').addEventListener('click', () => $('#nav').classList.toggle('open'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => $('#nav').classList.remove('open')));

  /* ---------- Recherche ---------- */
  const searchInput = $('#searchInput'), searchResults = $('#searchResults');
  let srIndex = -1;
  function renderSearch() {
    const q = norm(searchInput.value.trim());
    if (!q) { searchResults.classList.remove('open'); return; }
    const res = PRODUCTS.filter(p => norm(p.name + ' ' + CATEGORIES[p.cat] + ' ' + p.shape).includes(q)).slice(0, 6);
    srIndex = -1;
    searchResults.innerHTML = res.length
      ? res.map(p => `<div class="sr-item" data-id="${p.id}"><div class="sr-thumb" style="background:${bg(p)}">${media(p)}</div><div><b>${esc(p.name)}</b><small>${euro(p.price)} · ${CATEGORIES[p.cat]}</small></div></div>`).join('')
      : `<div class="sr-empty">Aucun résultat pour « ${esc(searchInput.value)} » 🥲</div>`;
    searchResults.classList.add('open');
  }
  searchInput.addEventListener('input', renderSearch);
  searchInput.addEventListener('focus', renderSearch);
  searchInput.addEventListener('keydown', e => {
    const items = $$('.sr-item', searchResults);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      srIndex = (srIndex + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((it, i) => it.classList.toggle('active', i === srIndex));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (srIndex >= 0 && items[srIndex]) openProduct(items[srIndex].dataset.id);
      else { state.filters.q = searchInput.value.trim(); state.filters.cat = 'all'; state.filters.tag = null; renderChips(); renderGrid(); $('#shop').scrollIntoView(); }
      searchResults.classList.remove('open');
      searchInput.blur();
    } else if (e.key === 'Escape') { searchResults.classList.remove('open'); searchInput.blur(); }
  });
  searchResults.addEventListener('mousedown', e => {
    const it = e.target.closest('.sr-item');
    if (it) { e.preventDefault(); openProduct(it.dataset.id); searchResults.classList.remove('open'); searchInput.blur(); }
  });
  searchInput.addEventListener('blur', () => setTimeout(() => searchResults.classList.remove('open'), 120));

  /* ---------- Collections ---------- */
  const COLLECTIONS = [
    { title: 'Sensoriel', sub: 'Billes, perles et gel', ids: ['raisin-perles', 'boule-perles', 'fruits-billes'], color: '#EFE8FF', action: { cat: 'sensoriel' } },
    { title: 'Beurres & gourmandises', sub: 'Beurres, donuts, chocolat', ids: ['beurre-sale-rose', 'donuts-pastel', 'tablette-choco'], color: '#FFF4CC', action: { cat: 'gourmandises' } },
    { title: 'Slow Rising', sub: 'Remontée de 6 s et plus', ids: ['mangue-squishy', 'savons-squishy', 'lingot-or'], color: '#DDF7EE', action: { minRise: 6, sort: 'rise' } },
    { title: 'Nouveautés', sub: 'Les derniers arrivés', ids: ['oursons-gummy', 'glacons-squishy', 'tubes-gel'], color: '#FFE1EC', action: { tag: 'new' } }
  ];
  $('#collectionsGrid').innerHTML = COLLECTIONS.map((c, i) => `
    <button class="collection reveal" data-col="${i}" style="--bgc:${c.color};transition-delay:${i * 80}ms">
      <div class="collection-art">${c.ids.map(id => `<div class="c-sq"><img class="photo" src="images/${id}.jpg" alt="" draggable="false"/></div>`).join('')}</div>
      <h3>${c.title}</h3><p>${c.sub}</p>
      <span class="arrow"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
    </button>`).join('');
  $('#collectionsGrid').addEventListener('click', e => {
    const el = e.target.closest('.collection');
    if (!el) return;
    const c = COLLECTIONS[+el.dataset.col];
    $$('.c-sq', el).forEach((s, i) => setTimeout(() => squish(s, 3, .8), i * 90));
    Sound.play('pop');
    setTimeout(() => applyFilter(c.action), 250);
  });

  function applyFilter(a) {
    resetFilters(false);
    Object.assign(state.filters, a);
    if (a.minRise != null) { $('#riseRange').value = a.minRise; }
    if (a.sort) $('#sortSelect').value = a.sort;
    syncRanges();
    renderChips(); renderGrid();
    $('#shop').scrollIntoView({ behavior: 'smooth' });
  }
  $$('[data-filter-tag]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); applyFilter({ tag: el.dataset.filterTag }); }));
  $$('[data-filter-cat]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); applyFilter({ cat: el.dataset.filterCat }); }));


  /* ---------- Boutique : chips, filtres, grille ---------- */
  const CHIPS = [
    { label: 'Tout', cat: 'all' },
    { label: '🐱 Animaux', cat: 'animaux' },
    { label: '🍩 Gourmandises', cat: 'gourmandises' },
    { label: '🍑 Fruits', cat: 'fruits' },
    { label: '☁️ Fantaisie', cat: 'fantaisie' },
    { label: '🫧 Sensoriel', cat: 'sensoriel' },
    { label: '✨ Nouveautés', tag: 'new' }
  ];
  function renderChips() {
    const f = state.filters;
    $('#chips').innerHTML = CHIPS.map((c, i) => {
      const active = c.tag ? f.tag === c.tag : (!f.tag && f.cat === c.cat);
      return `<button class="chip ${active ? 'active' : ''}" data-i="${i}">${c.label}</button>`;
    }).join('');
  }
  $('#chips').addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    const c = CHIPS[+b.dataset.i];
    state.filters.cat = c.cat || 'all';
    state.filters.tag = c.tag || null;
    state.filters.q = '';
    searchInput.value = '';
    Sound.play('tick');
    renderChips(); renderGrid();
  });

  const BADGE_LABEL = { best: 'Best-seller', new: 'Nouveau', limited: 'Édition limitée', xxl: 'XXL' };
  const ICON = {
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5C19 15.6 12 20 12 20z"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>'
  };
  const dots = n => `<span class="dots">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
  const badgesHtml = p => `<div class="badges">${p.tags.filter(t => BADGE_LABEL[t]).map(t => `<span class="badge ${t}">${BADGE_LABEL[t]}</span>`).join('')}</div>`;

  function filtered() {
    const f = state.filters;
    const q = norm(f.q);
    let list = PRODUCTS.filter(p =>
      (f.cat === 'all' || p.cat === f.cat) &&
      (!f.tag || p.tags.includes(f.tag)) &&
      p.soft >= f.minSoft && p.rise >= f.minRise &&
      (!q || norm(p.name + ' ' + CATEGORIES[p.cat]).includes(q))
    );
    const sorters = {
      featured: (a, b) => a.rank - b.rank,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rise: (a, b) => b.rise - a.rise,
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      new: (a, b) => b.tags.includes('new') - a.tags.includes('new') || a.rank - b.rank
    };
    return list.sort(sorters[f.sort]);
  }

  function cardHtml(p, i) {
    return `<article class="card" data-id="${p.id}" style="animation-delay:${Math.min(i, 12) * 45}ms">
      <div class="card-media" style="--bgc:${bg(p)}">
        ${badgesHtml(p)}
        <div class="card-actions">
          <button class="round-act wish ${state.wish.has(p.id) ? 'on' : ''}" data-act="wish" aria-label="Ajouter aux favoris">${ICON.heart}</button>
          <button class="round-act quick" data-act="view" aria-label="Aperçu rapide">${ICON.eye}</button>
        </div>
        ${media(p, true)}
        <span class="card-hint">👆 Voir le produit</span>
      </div>
      <div class="card-body">
        <div class="card-top"><span class="card-cat">${CATEGORIES[p.cat]}</span><span class="stars"><i>★</i>${p.rating.toFixed(1).replace('.', ',')} <small>(${p.reviews.toLocaleString('fr-FR')})</small></span></div>
        <h3 data-act="view">${esc(p.name)}</h3>
        <div class="specs"><span>☁️ ${dots(p.soft)}</span><span>🐢 ${p.rise} s</span></div>
        <div class="card-foot">
          <div class="price ${p.old ? 'sale' : ''}">${euro(p.price)}${p.old ? `<s>${euro(p.old)}</s>` : ''}</div>
          <button class="add-btn" data-act="add" aria-label="Ajouter ${esc(p.name)} au panier">${ICON.plus}<span class="add-label">Ajouter</span></button>
        </div>
      </div>
    </article>`;
  }

  function renderGrid() {
    const list = filtered();
    $('#productGrid').innerHTML = list.map(cardHtml).join('');
    $('#emptyState').hidden = list.length > 0;
    const f = state.filters;
    let label = `${list.length} squishy${list.length > 1 ? 's' : ''}`;
    if (f.q) label += ` pour « ${esc(f.q)} »`;
    $('#resultsCount').innerHTML = label;
  }

  const grid = $('#productGrid');
  grid.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const p = byId[card.dataset.id];
    const act = e.target.closest('[data-act]');
    if (act) {
      const a = act.dataset.act;
      if (a === 'wish') toggleWish(p.id, act, e);
      else if (a === 'view') openProduct(p.id);
      else if (a === 'add') {
        addToCart(p.id, sizesFor(p)[sizesFor(p).length > 1 ? 1 : 0].id, 0, 1, act);
        squish(card.querySelector('.card-media'), p.rise, .6);
        act.classList.add('done'); act.innerHTML = ICON.check + '<span class="add-label">Ajouté</span>';
        setTimeout(() => { act.classList.remove('done'); act.innerHTML = ICON.plus + '<span class="add-label">Ajouter</span>'; }, 1400);
      }
      return;
    }
    squish(card.querySelector('.card-media'), p.rise, .5);
    Sound.play('pop');
    openProduct(p.id);
  });
  grid.addEventListener('mouseover', e => {
    const m = e.target.closest('.card-media');
    if (!m || m.contains(e.relatedTarget)) return;
    wobble(m);
  });

  // Filtres avancés
  const filtersEl = $('#filters');
  $('#filterToggle').addEventListener('click', () => filtersEl.classList.toggle('open'));
  $('#sortSelect').addEventListener('change', e => { state.filters.sort = e.target.value; renderGrid(); });
  function syncRanges() {
    const so = $('#softRange'), ri = $('#riseRange');
    state.filters.minSoft = +so.value; state.filters.minRise = +ri.value;
    $('#softVal').textContent = so.value + '/5';
    $('#riseVal').textContent = ri.value + ' s';
    [so, ri].forEach(r => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'));
  }
  ['#softRange', '#riseRange'].forEach(s => $(s).addEventListener('input', () => { syncRanges(); renderGrid(); }));
  function resetFilters(rerender = true) {
    Object.assign(state.filters, { cat: 'all', tag: null, q: '', sort: 'featured', minSoft: 1, minRise: 0 });
    $('#softRange').value = 1; $('#riseRange').value = 0; $('#sortSelect').value = 'featured';
    searchInput.value = '';
    syncRanges();
    if (rerender) { renderChips(); renderGrid(); }
  }
  $('#resetFilters').addEventListener('click', () => resetFilters());
  $('#emptyReset').addEventListener('click', () => resetFilters());
  $('#emptySq').innerHTML = render({ ...charById['boo-fantome'], mood: 'wow' });

  /* ---------- Favoris ---------- */
  function toggleWish(id, btn, e) {
    const p = byId[id];
    if (state.wish.has(id)) { state.wish.delete(id); toast(`Retiré des favoris`, media(p)); }
    else {
      state.wish.add(id);
      Sound.play('pop');
      if (e) burst(e.clientX, e.clientY, ['💖', '💗', '💕'], 6);
      toast(`<b>${esc(p.name)}</b> ajouté aux favoris`, media(p), { label: 'Voir', fn: () => openDrawer('wish') });
    }
    store.set('wish', [...state.wish]);
    $$(`.card[data-id="${id}"] .wish`).forEach(b => b.classList.toggle('on', state.wish.has(id)));
    if (btn) btn.classList.toggle('on', state.wish.has(id));
    updateBadges();
    if (drawer.classList.contains('open')) renderDrawer();
  }

  /* ---------- Panier ---------- */
  function addToCart(id, size, v, qty, sourceEl) {
    const key = `${id}|${size}|${v}`;
    const p = byId[id];
    if (state.cart.length >= MAX_ITEMS) {
      const cur = state.cart[0];
      Sound.play('tick');
      if (cur.key === key) { toast(`<b>${esc(p.name)}</b> est déjà dans ton panier`, media(variantOf(p, v)), { label: 'Voir le panier', fn: () => openDrawer('cart') }); return; }
      toast(`1 squishy max par commande`, media(lineProduct(cur)), { label: 'Remplacer', fn: () => { state.cart = [{ key, id, size, v, qty: 1 }]; saveCart(); toast(`<b>${esc(p.name)}</b> est maintenant dans ton panier`, media(variantOf(p, v))); } });
      return;
    }
    state.cart = [{ key, id, size, v, qty: 1 }];
    saveCart();
    Sound.play('pop');
    const cartBtn = $('#cartBtn');
    cartBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25,.8)' }, { transform: 'scale(.9,1.1)' }, { transform: 'scale(1)' }], { duration: 500 });
    if (sourceEl) flyToCart(sourceEl, variantOf(p, v));
    toast(`<b>${esc(p.name)}</b> ajouté au panier`, media(variantOf(p, v)), { label: 'Voir le panier', fn: () => openDrawer('cart') });
  }
  function flyToCart(from, p) {
    const r = from.getBoundingClientRect(), t = $('#cartBtn').getBoundingClientRect();
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:${r.left + r.width / 2 - 30}px;top:${r.top + r.height / 2 - 30}px;width:60px;height:60px;z-index:300;pointer-events:none`;
    el.innerHTML = media(p);
    document.body.appendChild(el);
    const dx = t.left + t.width / 2 - (r.left + r.width / 2), dy = t.top + t.height / 2 - (r.top + r.height / 2);
    el.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * .5}px, ${dy * .5 - 80}px) scale(1.2, .9)`, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.3)`, opacity: .6 }
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.5,1)' }).onfinish = () => el.remove();
  }
  function saveCart() { store.set('cart', state.cart); updateBadges(); if (drawer.classList.contains('open')) renderDrawer(); }
  function cartCount() { return state.cart.reduce((s, i) => s + i.qty, 0); }
  function totals() {
    const sub = state.cart.reduce((s, i) => s + unitPrice(i) * i.qty, 0);
    const ship = 0; // livraison gratuite
    return { sub, ship, total: sub + ship };
  }
  function updateBadges() {
    const cc = cartCount(), wc = state.wish.size;
    const cEl = $('#cartCount'), wEl = $('#wishCount');
    if (cEl.textContent !== String(cc)) bump(cEl);
    if (wEl.textContent !== String(wc)) bump(wEl);
    cEl.textContent = cc; wEl.textContent = wc;
    cEl.classList.toggle('show', cc > 0); wEl.classList.toggle('show', wc > 0);
    $('#drawerCartCount').textContent = cc; $('#drawerWishCount').textContent = wc;
  }

  const drawer = $('#drawer'), overlay = $('#overlay');
  function lock() { document.body.classList.add('locked'); overlay.classList.add('show'); }
  function unlockIfNone() {
    if (!drawer.classList.contains('open') && !$$('.modal.open').length) { document.body.classList.remove('locked'); overlay.classList.remove('show'); }
  }
  function openDrawer(tab) {
    closeModals();
    state.drawerTab = tab || 'cart';
    renderDrawer();
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    lock();
  }
  function closeDrawer() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); unlockIfNone(); }
  $('#cartBtn').addEventListener('click', () => openDrawer('cart'));
  $('#wishBtn').addEventListener('click', () => openDrawer('wish'));
  $$('.drawer-tab').forEach(t => t.addEventListener('click', () => { state.drawerTab = t.dataset.tab; renderDrawer(); }));

  function lineName(i) { return byId[i.id].name; }
  function lineMeta(i) {
    const p = byId[i.id], s = sizesFor(p).find(s => s.id === i.size);
    const col = i.v ? COLOR_VARIANTS[i.v - 1].name : 'Original';
    return `${s ? s.label + ' · ' + s.dim : ''} · ${col}`;
  }
  function lineProduct(i) { return variantOf(byId[i.id], i.v); }

  function renderDrawer() {
    const tab = state.drawerTab;
    $$('.drawer-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    const body = $('#drawerBody');
    const t = totals();
    $('.limit-note').hidden = tab !== 'cart';
    $('#drawerFoot').hidden = tab !== 'cart' || !state.cart.length;

    if (tab === 'wish') {
      const items = [...state.wish].map(id => byId[id]).filter(Boolean);
      body.innerHTML = items.length ? items.map(p => `
        <div class="line-item" data-id="${p.id}">
          <div class="li-thumb" style="background:${bg(p)}" data-act="squish">${media(p)}</div>
          <div class="li-info"><b>${esc(p.name)}</b><small>${CATEGORIES[p.cat]} · 🐢 ${p.rise} s</small>
            <button class="btn btn-sm btn-primary" data-act="wish-add">Ajouter au panier</button></div>
          <div class="li-side"><span class="price">${euro(p.price)}</span><button class="li-remove" data-act="wish-remove">Retirer</button></div>
        </div>`).join('')
        : emptyHtml('Aucun favori pour l\'instant', 'Clique sur le cœur d\'un squishy pour le garder ici.', 'neko-mochi');
      return;
    }

    if (!state.cart.length) {
      body.innerHTML = emptyHtml('Ton panier est tout vide', 'Il n\'attend qu\'un petit squishy à câliner.', 'panda-dodo');
      return;
    }
    body.innerHTML = state.cart.map(i => {
      const p = lineProduct(i);
      return `<div class="line-item" data-key="${esc(i.key)}">
        <div class="li-thumb" style="background:${bg(p)}" data-act="squish">${media(p)}</div>
        <div class="li-info"><b>${esc(lineName(i))}</b><small>${esc(lineMeta(i))}</small>
</div>
        <div class="li-side"><span class="price">${euro(unitPrice(i) * i.qty)}</span><button class="li-remove" data-act="remove">Retirer</button></div>
      </div>`;
    }).join('');

    const rows = [`<div><span>Sous-total</span><span>${euro(t.sub)}</span></div>`];
    rows.push(`<div><span>Livraison</span><span>${t.ship ? euro(t.ship) : 'Offerte'}</span></div>`);
    rows.push(`<div class="grand"><span>Total</span><span>${euro(t.total)}</span></div>`);
    $('#totals').innerHTML = rows.join('');
  }
  function emptyHtml(title, text, id) {
    return `<div class="drawer-empty"><div class="sq-wrap" data-act="squish">${render({ ...charById[id], mood: 'sleepy' })}</div><h4>${title}</h4><p>${text}</p><button class="btn btn-primary" data-act="shop">Découvrir les squishies</button></div>`;
  }

  $('#drawerBody').addEventListener('click', e => {
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    if (a === 'squish') { squish(act, 6, 1); Sound.play('squish'); return; }
    if (a === 'shop') { closeDrawer(); $('#shop').scrollIntoView({ behavior: 'smooth' }); return; }
    const row = act.closest('.line-item');
    if (a === 'wish-add') { const p = byId[row.dataset.id]; addToCart(p.id, sizesFor(p)[sizesFor(p).length > 1 ? 1 : 0].id, 0, 1); return; }
    if (a === 'wish-remove') { toggleWish(row.dataset.id); return; }
    const item = state.cart.find(i => i.key === row.dataset.key);
    if (!item) return;
    if (a === 'remove') removeLine(row, item);
  });
  function removeLine(row, item) {
    row.classList.add('removing');
    setTimeout(() => {
      state.cart = state.cart.filter(i => i !== item);
      saveCart();
      toast(`${esc(lineName(item))} retiré`, media(lineProduct(item)), { label: 'Annuler', fn: () => { if (!state.cart.length) { state.cart = [item]; saveCart(); } } });
    }, 350);
  }

  /* ---------- Modal produit ---------- */
  const pm = $('#productModal');
  let pmState = null;
  function openProduct(id) {
    const p = byId[id];
    if (!p) return;
    closeDrawer();
    const sizes = sizesFor(p);
    pmState = { id, size: sizes[sizes.length > 1 ? 1 : 0].id, v: 0, qty: 1, tab: 'desc', view: 'photo', photo: 0 };
    renderProductModal();
    pm.classList.add('open'); pm.setAttribute('aria-hidden', 'false');
    lock();
    setTimeout(() => {
      $$('.pm-meter .gauge-bar i', pm).forEach(b => { b.style.width = b.dataset.w; });
      squish($('.pm-sq', pm), p.rise, .5);
    }, 250);
  }
  function renderProductModal() {
    const p = byId[pmState.id];
    const vp = variantOf(p, pmState.v);
    const sizes = sizesFor(p);
    const size = sizes.find(s => s.id === pmState.size);
    const price = p.price + size.delta;
    const vars = variantsFor(p);
    const photos = PHOTOS[p.id] || [];
    const showPhoto = photos.length > 0;
    const revs = REVIEWS.filter(r => r.product === p.id).concat(REVIEWS.filter(r => r.product !== p.id)).slice(0, 3);
    $('#pmContent').innerHTML = `
      <div class="pm-media" style="--bgc:${bg(vp)}">
        ${badgesHtml(p)}
        <div class="pm-sq ${showPhoto ? 'has-photo' : ''}" data-act="squish">${showPhoto ? `<img class="photo" src="${photos[pmState.photo]}" alt="${esc(p.name)}" draggable="false"/>` : render(vp)}</div>
        ${photos.length > 1 ? `<div class="pm-thumbs">${photos.map((u, i) => `<button class="pm-thumb ${showPhoto && i === pmState.photo ? 'active' : ''}" data-photo="${i}" aria-label="Photo ${i + 1}"><img src="${u}" alt=""/></button>`).join('')}</div>` : ''}
        <span class="pm-tip">👆 Appuie pour l'écraser</span>
      </div>
      <div class="pm-info">
        <div>
          <span class="card-cat">${CATEGORIES[p.cat]}</span>
          <h2>${esc(p.name)}</h2>
        </div>
        <div class="pm-rating"><span class="r-stars">${starsTxt(p.rating)}</span>${p.rating.toFixed(1).replace('.', ',')} · <a href="#" data-act="tab-reviews">${p.reviews.toLocaleString('fr-FR')} avis</a></div>
        <div class="pm-price"><span class="price ${p.old ? 'sale' : ''}">${euro(price)}</span>${p.old ? `<s style="color:var(--ink-3);font-weight:700">${euro(p.old + size.delta)}</s><span class="save">-${Math.round((1 - p.price / p.old) * 100)} %</span>` : ''}</div>
        <div class="pm-meters">
          <div class="pm-meter"><div class="gauge-head"><span>☁️ Douceur</span><b>${p.soft}/5</b></div><div class="gauge-bar"><i data-w="${p.soft * 20}%"></i></div></div>
          <div class="pm-meter"><div class="gauge-head"><span>🐢 Remontée</span><b>${p.rise} s</b></div><div class="gauge-bar rise"><i data-w="${Math.min(100, p.rise / 14 * 100)}%"></i></div></div>
        </div>
        <div>
          <div class="opt-row-label">Coloris : <b>${pmState.v ? COLOR_VARIANTS[pmState.v - 1].name : 'Original'}</b></div>
          <div class="swatches">${vars.map(v => { const c = variantOf(p, v); return `<button class="swatch ${v === pmState.v ? 'active' : ''}" data-v="${v}" style="--s1:${c.c1};--s2:${c.c2}" aria-label="${v ? COLOR_VARIANTS[v - 1].name : 'Original'}"></button>`; }).join('')}</div>
        </div>
        <div>
          <div class="opt-row-label">Taille : <b>${size.label} (${size.dim})</b></div>
          <div class="options">${sizes.map(s => `<button class="opt ${s.id === pmState.size ? 'active' : ''}" data-size="${s.id}">${s.label}<small>${s.dim}${s.delta ? ` · ${s.delta > 0 ? '+' : '−'}${euro(Math.abs(s.delta))}` : ''}</small></button>`).join('')}</div>
        </div>
        <div class="pm-buy">
          <button class="btn btn-primary btn-lg" data-act="pm-add">Ajouter au panier · ${euro(price)}</button>
          <button class="icon-btn wish-pm ${state.wish.has(p.id) ? 'on' : ''}" data-act="pm-wish" aria-label="Favoris" style="${state.wish.has(p.id) ? 'background:var(--pink-soft)' : ''}">${ICON.heart.replace('<path', `<path style="${state.wish.has(p.id) ? 'fill:var(--pink);stroke:var(--pink)' : ''}"`)}</button>
        </div>
        <div class="pm-perks"><span>🚚 Livré en 3 jours</span><span>🧸 Certifié EN71</span><span>↩️ Retours 30 jours</span><span>🧸 Limité à 1 par commande</span></div>
        <div class="tabs">
          <button class="tab ${pmState.tab === 'desc' ? 'active' : ''}" data-tab="desc">Description</button>
          <button class="tab ${pmState.tab === 'specs' ? 'active' : ''}" data-tab="specs">Caractéristiques</button>
          <button class="tab ${pmState.tab === 'reviews' ? 'active' : ''}" data-tab="reviews">Avis</button>
        </div>
        <div class="tab-panel">${
          pmState.tab === 'desc' ? `<p>${esc(p.desc)}</p>` :
          pmState.tab === 'specs' ? `<ul><li>Matière : mousse polyuréthane haute densité</li><li>Temps de remontée : ${p.rise} secondes</li><li>Dimensions : ${size.dim}</li><li>Parfum léger hypoallergénique</li><li>Norme EN71 · Dès 3 ans</li></ul>` :
          revs.map(r => `<div class="mini-review"><b>${esc(r.name)}</b><span class="r-stars">${starsTxt(r.stars)}</span><br/>${esc(r.text)}</div>`).join('')
        }</div>
      </div>`;
  }
  pm.addEventListener('click', e => {
    if (e.target === pm) { closeModals(); return; }
    const p = pmState && byId[pmState.id];
    if (!p) return;
    const th = e.target.closest('[data-photo]');
    if (th) {
      pmState.photo = +th.dataset.photo;
      rerenderKeepBars(); squish($('.pm-sq', pm), p.rise, .5); Sound.play('tick');
      return;
    }
    const sw = e.target.closest('.swatch');
    if (sw) { pmState.v = +sw.dataset.v; renderProductModal(); $$('.pm-meter .gauge-bar i', pm).forEach(b => { b.style.transition = 'none'; b.style.width = b.dataset.w; }); squish($('.pm-sq', pm), p.rise, .6); Sound.play('pop'); return; }
    const sz = e.target.closest('[data-size]');
    if (sz) { pmState.size = sz.dataset.size; rerenderKeepBars(); Sound.play('tick'); return; }
    const tab = e.target.closest('.tab');
    if (tab) { pmState.tab = tab.dataset.tab; rerenderKeepBars(); return; }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    if (a === 'squish') { squish(act, p.rise, 1); Sound.play('squish'); countSquish(); burst(e.clientX, e.clientY); }
    else if (a === 'pm-add') { addToCart(p.id, pmState.size, pmState.v, pmState.qty, $('.pm-sq', pm)); squish($('.pm-sq', pm), p.rise, .8); }
    else if (a === 'pm-wish') { toggleWish(p.id, null, e); rerenderKeepBars(); }
    else if (a === 'tab-reviews') { e.preventDefault(); pmState.tab = 'reviews'; rerenderKeepBars(); }
  });
  function rerenderKeepBars() {
    renderProductModal();
    $$('.pm-meter .gauge-bar i', pm).forEach(b => { b.style.transition = 'none'; b.style.width = b.dataset.w; });
  }

  function closeModals() {
    $$('.modal.open').forEach(m => { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); });
    unlockIfNone();
  }
  $$('[data-close]').forEach(b => b.addEventListener('click', () => { closeModals(); closeDrawer(); }));
  overlay.addEventListener('click', () => { closeModals(); closeDrawer(); });
  $('#checkoutModal').addEventListener('click', e => { if (e.target.id === 'checkoutModal') closeModals(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeModals(); closeDrawer(); $('#nav').classList.remove('open'); } });

  /* ---------- Squish Lab ---------- */
  const LAB_IDS = ['momo-peche', 'nuage-calin', 'panda-dodo', 'grenouille-bubu', 'mochi-matcha', 'cupcake-licorne'];
  const lab = { id: LAB_IDS[0], pressure: 0, pressing: false, start: 0, squishes: store.get('labSquishes', 0), record: store.get('labRecord', 0), stress: 100, skew: 0, raf: 0 };
  const labStage = $('#labStage'), labSq = $('#labSquishy');
  $('#labPicker').innerHTML = LAB_IDS.map(id => `<button class="lab-pick" data-id="${id}" style="background:${bg(charById[id])}" aria-label="${esc(charById[id].name)}">${render(charById[id])}</button>`).join('');
  function setLab(id) {
    lab.id = id;
    const p = charById[id];
    labSq.innerHTML = render(p);
    $('#labName').innerHTML = `${esc(p.name)}<small>Personnage du Squish Lab · Remontée ${p.rise} s</small>`;
    labStage.style.setProperty('--lab-c', mix(p.c1, '#ffffff', .2));
    $$('.lab-pick').forEach(b => b.classList.toggle('active', b.dataset.id === id));
    $('#riseLabel').textContent = p.rise + ' s';
    squish(labSq, 3, .5);
  }
  $('#labPicker').addEventListener('click', e => { const b = e.target.closest('.lab-pick'); if (b) { setLab(b.dataset.id); Sound.play('pop'); } });

  function labBody() { return labSq.querySelector('.sq-body'); }
  function labShadow() { return labSq.querySelector('.sq-shadow'); }
  function labFrame() {
    if (!lab.pressing) return;
    const held = (performance.now() - lab.start) / 1000;
    const p = charById[lab.id];
    // plus c'est doux, plus ça s'écrase vite
    lab.pressure = Math.min(1, 1 - Math.exp(-held * (1.2 + p.soft * .5)));
    const k = lab.pressure;
    const b = labBody();
    if (b) b.style.transform = `scale(${1 + .38 * k}, ${1 - .5 * k}) skewX(${lab.skew * k}deg)`;
    const sh = labShadow();
    if (sh) sh.style.transform = `scaleX(${1 + .45 * k})`;
    $('#pressureBar').style.width = (k * 100) + '%';
    $('#pressureVal').textContent = Math.round(k * 100) + ' %';
    $('#labRecord').textContent = Math.max(lab.record, held).toFixed(1).replace('.', ',') + ' s';
    lab.raf = requestAnimationFrame(labFrame);
  }
  labStage.addEventListener('pointerdown', e => {
    const b = labBody();
    if (!b) return;
    labStage.setPointerCapture(e.pointerId);
    b.getAnimations().forEach(a => a.cancel());
    const sh = labShadow(); if (sh) sh.getAnimations().forEach(a => a.cancel());
    $('#riseBar').getAnimations().forEach(a => a.cancel());
    lab.pressing = true; lab.start = performance.now();
    lab.skew = 0;
    labSq.querySelector('svg').classList.add('squeezed');
    Sound.play('squish');
    spawnParticles(e);
    cancelAnimationFrame(lab.raf);
    lab.raf = requestAnimationFrame(labFrame);
  });
  labStage.addEventListener('pointermove', e => {
    if (!lab.pressing) return;
    const r = labStage.getBoundingClientRect();
    lab.skew = ((e.clientX - r.left) / r.width - .5) * -40;
  });
  const release = e => {
    if (!lab.pressing) return;
    lab.pressing = false;
    cancelAnimationFrame(lab.raf);
    const held = (performance.now() - lab.start) / 1000;
    const p = charById[lab.id];
    const b = labBody(), sh = labShadow(), k = lab.pressure;
    if (held > lab.record) { lab.record = held; store.set('labRecord', held); }
    $('#labRecord').textContent = lab.record.toFixed(1).replace('.', ',') + ' s';
    lab.squishes++; store.set('labSquishes', lab.squishes);
    $('#labSquishes').textContent = lab.squishes.toLocaleString('fr-FR');
    countSquish();
    lab.stress = Math.max(0, lab.stress - (4 + k * 8));
    renderStress();

    const riseMs = Math.max(900, p.rise * 1000 * (.35 + k * .65));
    const from = `scale(${1 + .38 * k}, ${1 - .5 * k}) skewX(${lab.skew * k}deg)`;
    if (b) {
      b.style.transform = '';
      b.animate([
        { transform: from },
        { transform: `scale(${1 + .22 * k}, ${1 - .3 * k}) skewX(${lab.skew * k * .3}deg)`, offset: .2, easing: 'cubic-bezier(.4,0,.2,1)' },
        { transform: 'scale(.985, 1.02)', offset: .92 },
        { transform: 'scale(1,1)' }
      ], { duration: riseMs, easing: 'cubic-bezier(.25,.1,.25,1)' });
    }
    if (sh) { sh.style.transform = ''; sh.animate([{ transform: `scaleX(${1 + .45 * k})` }, { transform: 'scaleX(1)' }], { duration: riseMs, easing: 'ease-out' }); }
    const svg = labSq.querySelector('svg');
    setTimeout(() => svg && svg.classList.remove('squeezed'), riseMs * .45);
    $('#pressureBar').style.width = '0%';
    $('#pressureVal').textContent = '0 %';
    $('#riseBar').animate([{ width: '0%' }, { width: '100%' }], { duration: riseMs, easing: 'linear' });
    if (k > .3) setTimeout(() => Sound.play('rise'), 80);
    lab.pressure = 0;
  };
  labStage.addEventListener('pointerup', release);
  labStage.addEventListener('pointercancel', release);
  labStage.addEventListener('lostpointercapture', release);

  function spawnParticles(e) {
    const r = labStage.getBoundingClientRect();
    const box = $('#labParticles');
    const em = ['💨', '✨', '💖', '🫧'];
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('span');
      s.textContent = em[i % em.length];
      s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px';
      box.appendChild(s);
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 80;
      s.animate([
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(1.1)`, opacity: 0 }
      ], { duration: 900, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => s.remove();
    }
  }
  function renderStress() {
    const s = lab.stress;
    $('#stressBar').style.width = s + '%';
    $('#stressBar').style.backgroundPosition = `${-(100 - s) * 2.2}px 0`;
    const lv = s > 75 ? ['😤', 'Encore quelques squishes…'] : s > 50 ? ['😮‍💨', 'Ça commence à aller mieux.'] : s > 25 ? ['🙂', 'Respire… écrase… relâche…'] : s > 0 ? ['😌', 'Presque zen !'] : ['🧘', 'Zen absolu atteint. Bravo !'];
    $('#stressEmoji').textContent = lv[0];
    $('#stressText').textContent = lv[1];
    if (s === 0 && !lab.zen) {
      lab.zen = true; confetti();
      toast('Niveau zen atteint 🧘 Bravo !', '🏆');
    }
  }
  $('#labSquishes').textContent = lab.squishes.toLocaleString('fr-FR');
  $('#labRecord').textContent = lab.record.toFixed(1).replace('.', ',') + ' s';
  setLab(lab.id);
  renderStress();

  /* ---------- Avis ---------- */
  function renderReviews() {
  const revHtml = REVIEWS.map(r => {
    const p = byId[r.product];
    return `<article class="review"><div class="r-stars">${starsTxt(r.stars)}</div><p>« ${esc(r.text)} »</p>
      <div class="review-foot"><div class="r-sq" style="background:${bg(p)}">${media(p)}</div><div><b>${esc(r.name)}</b><small>${esc(r.meta)} · ${esc(p.name)}</small><br/><span class="verified">✓ Achat vérifié</span></div></div></article>`;
  }).join('');
  $('#reviewTrack').innerHTML = revHtml + revHtml;
  }
  renderReviews();
  $('#reviewTrack').addEventListener('pointerdown', e => { const s = e.target.closest('.r-sq'); if (s) { squish(s, 4, 1); Sound.play('pop'); } });

  /* ---------- FAQ ---------- */
  $('#faqList').innerHTML = FAQ.map((f, i) => `<div class="faq-item reveal ${i === 0 ? 'open' : ''}" style="transition-delay:${i * 60}ms"><button class="faq-q" aria-expanded="${i === 0}">${esc(f.q)}<i></i></button><div class="faq-a"><div><p>${esc(f.a)}</p></div></div></div>`).join('');
  $('#faqList').addEventListener('click', e => {
    const q = e.target.closest('.faq-q');
    if (!q) return;
    const item = q.parentElement, open = !item.classList.contains('open');
    $$('.faq-item').forEach(i => { i.classList.remove('open'); i.firstElementChild.setAttribute('aria-expanded', 'false'); });
    if (open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
    Sound.play('tick');
  });

  /* ---------- Newsletter ---------- */
  const nlSq = $('#nlSq');
  nlSq.innerHTML = render(charById['neko-mochi']);
  nlSq.addEventListener('pointerdown', () => { squish(nlSq, 7, 1); Sound.play('squish'); countSquish(); });
  $('#nlForm').addEventListener('submit', e => {
    e.preventDefault();
    const inp = $('#nlEmail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(inp.value.trim())) {
      inp.classList.remove('error'); void inp.offsetWidth; inp.classList.add('error');
      toast('Adresse email invalide', '📭');
      return;
    }
    $('#nlForm').hidden = true;
    $('#nlSuccess').hidden = false;
    squish(nlSq, 7, 1); confetti(); Sound.play('pop');
  });

  /* ---------- Checkout ---------- */
  const co = { step: 1, ship: 'standard', pay: 'card', data: {} };
  const SHIP_OPTS = [
    { id: 'standard', label: 'Livraison standard', sub: 'Livré en 3 jours', price: () => 0 }
  ];
  const PAY_OPTS = [
    { id: 'card', label: 'Carte bancaire', sub: 'CB, Visa, Mastercard' },
    { id: 'paypal', label: 'PayPal', sub: 'Paiement en 4× sans frais' },
    { id: 'apple', label: 'Apple Pay', sub: 'Rapide et sécurisé' }
  ];
  function coTotals() {
    const t = totals();
    const ship = SHIP_OPTS.find(s => s.id === co.ship).price();
    return { ...t, ship, total: t.sub + ship };
  }
  function coTotalsHtml() {
    const t = coTotals();
    return `<div class="totals"><div><span>Sous-total (${cartCount()} article${cartCount() > 1 ? 's' : ''})</span><span>${euro(t.sub)}</span></div>
      <div><span>Livraison</span><span>${t.ship ? euro(t.ship) : 'Offerte'}</span></div>
      <div class="grand"><span>Total</span><span>${euro(t.total)}</span></div></div>`;
  }
  function renderCheckout() {
    $$('#steps .step').forEach((s, i) => { s.classList.toggle('active', i + 1 === co.step); s.classList.toggle('done', i + 1 < co.step); });
    const c = $('#checkoutContent');
    const d = co.data;
    if (co.step === 1) {
      c.innerHTML = `<h3 class="co-title">Où livrer tes squishies ?</h3>
        <form id="coForm" novalidate>
          <div class="form-grid">
            ${field('first', 'Prénom', 'text', 'given-name')}${field('last', 'Nom', 'text', 'family-name')}
            ${field('email', 'Email', 'email', 'email', 'full')}${field('address', 'Adresse', 'text', 'street-address', 'full')}
            ${field('zip', 'Code postal', 'text', 'postal-code')}${field('city', 'Ville', 'text', 'address-level2')}
          </div>
          <div class="ship-opts">${SHIP_OPTS.map(s => radio('ship', s.id, s.label, s.sub, s.price() ? euro(s.price()) : 'Offert', co.ship === s.id)).join('')}</div>
          <div class="co-summary">${coTotalsHtml()}</div>
          <div class="co-actions"><button type="button" class="btn btn-ghost" data-close-co>Retour au panier</button><button class="btn btn-primary btn-lg" type="submit">Continuer vers le paiement</button></div>
        </form>`;
      function field(n, l, t, ac, cls) { return `<div class="field ${cls || ''}"><label for="co-${n}">${l}</label><input id="co-${n}" name="${n}" type="${t}" autocomplete="${ac}" value="${esc(d[n] || '')}" required /></div>`; }
    } else if (co.step === 2) {
      c.innerHTML = `<h3 class="co-title">Paiement</h3>
        <div class="demo-note">🛠️ Boutique de démonstration : aucun paiement réel n'est effectué. Branche Stripe, PayPal ou Shopify pour encaisser de vraies commandes.</div>
        <div class="pay-opts">${PAY_OPTS.map(p => radio('pay', p.id, p.label, p.sub, '', co.pay === p.id)).join('')}</div>
        <div class="co-summary">
          <div style="font-weight:700;color:var(--ink-2);margin-bottom:10px">📦 Livraison à ${esc(d.first)} ${esc(d.last)}, ${esc(d.address)}, ${esc(d.zip)} ${esc(d.city)}</div>
          ${coTotalsHtml()}
        </div>
        <div class="co-actions"><button class="btn btn-ghost" data-co-back>Retour</button><button class="btn btn-primary btn-lg" data-co-pay>Valider la commande · ${euro(coTotals().total)}</button></div>`;
    } else {
      const num = 'SQ-' + Date.now().toString(36).toUpperCase().slice(-6);
      c.innerHTML = `<div class="co-done">
        <div class="done-sq" data-act="squish">${render({ ...charById['momo-peche'], mood: 'wow' })}</div>
        <h3>Merci ${esc(d.first)} ! 🎉</h3>
        <p>Ta commande est confirmée. Un email récapitulatif va arriver à <b>${esc(d.email)}</b>.</p>
        <span class="order-num">Commande ${num}</span><br/>
        <button class="btn btn-primary btn-lg" data-close-co>Continuer à squisher</button>
      </div>`;
    }
    function radio(name, id, label, sub, price, checked) {
      return `<label class="radio-card ${checked ? 'checked' : ''}"><input type="radio" name="${name}" value="${id}" ${checked ? 'checked' : ''}/><span class="rc-main"><b>${label}</b><small>${sub}</small></span>${price ? `<span class="rc-price">${price}</span>` : ''}</label>`;
    }
  }
  $('#checkoutBtn').addEventListener('click', () => {
    if (!state.cart.length) return;
    window.location.href = 'shipping.html';
  });
  const coModal = $('#checkoutModal');
  coModal.addEventListener('change', e => {
    if (e.target.name === 'ship') { co.ship = e.target.value; saveCoForm(); renderCheckout(); }
    if (e.target.name === 'pay') { co.pay = e.target.value; $$('.pay-opts .radio-card').forEach(r => r.classList.toggle('checked', r.querySelector('input').checked)); }
  });
  function saveCoForm() { const f = $('#coForm'); if (f) new FormData(f).forEach((v, k) => { if (k !== 'ship') co.data[k] = v; }); }
  coModal.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    let ok = true;
    $$('input[required]', f).forEach(inp => {
      const v = inp.value.trim();
      const bad = !v || (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) || (inp.name === 'zip' && !/^\d{4,5}$/.test(v));
      inp.classList.remove('error');
      if (bad) { void inp.offsetWidth; inp.classList.add('error'); if (ok) inp.focus(); ok = false; }
    });
    if (!ok) { toast('Vérifie les champs en rouge', '✏️'); return; }
    saveCoForm();
    co.step = 2; renderCheckout();
    Sound.play('tick');
  });
  coModal.addEventListener('click', e => {
    if (e.target.closest('[data-close-co]')) {
      const done = co.step === 3;
      closeModals();
      if (!done) openDrawer('cart');
      return;
    }
    if (e.target.closest('[data-co-back]')) { co.step = 1; renderCheckout(); return; }
    if (e.target.closest('[data-co-pay]')) {
      const btn = e.target.closest('[data-co-pay]');
      btn.disabled = true; btn.textContent = 'Redirection…';
      setTimeout(() => {
        window.location.href = 'https://t.trklinkx.com/click?pid=4784&offer_id=10936';
      }, 600);
      return;
    }
    const s = e.target.closest('[data-act="squish"]');
    if (s) { squish(s, 8, 1); Sound.play('squish'); burst(e.clientX, e.clientY, ['🎉', '💖', '✨']); }
  });

  /* ---------- Révélations au scroll ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' }) : null;
  $$('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  /* ---------- Init ---------- */
  syncRanges();
  renderChips();
  renderGrid();
  updateBadges();

  // Détection des photos dans /images, puis ré-affichage
  Promise.all(PRODUCTS.map(async p => { PHOTOS[p.id] = await findPhotos(p); })).then(() => {
    if (!Object.values(PHOTOS).some(a => a.length)) return;
    renderGrid();
    renderReviews();
    if (drawer.classList.contains('open')) renderDrawer();
  });
})();

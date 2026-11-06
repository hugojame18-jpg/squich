/* ==========================================================
   Consentement cookies + Microsoft Clarity
   Clarity ne se charge qu'après « Accepter ». Le choix est gardé
   6 mois ; le lien « Gérer les cookies » permet de le changer.
   ========================================================== */
(function () {
  const CLARITY_ID = 'z9idvcq6s7';
  const KEY = 'squishland:consent';
  const MAX_AGE = 1000 * 60 * 60 * 24 * 182;

  function read() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || 'null');
      return v && Date.now() - v.t < MAX_AGE ? v.ok : null;
    } catch (e) { return null; }
  }
  function save(ok) { try { localStorage.setItem(KEY, JSON.stringify({ ok, t: Date.now() })); } catch (e) { /* stockage indisponible */ } }

  let loaded = false;
  function loadClarity() {
    if (loaded) return;
    loaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    window.clarity('consent');
    tagSession();
  }

  function tagSession() {
    const q = new URLSearchParams(location.search);
    let source = q.get('utm_source');
    if (!source && document.referrer) {
      try {
        const h = new URL(document.referrer).hostname.replace(/^www\./, '');
        if (h !== location.hostname.replace(/^www\./, '')) source = h;
      } catch (e) { /* referrer illisible */ }
    }
    const set = (k, v) => { if (v) window.clarity('set', k, String(v).slice(0, 60)); };
    set('source', source || 'direct');
    set('campagne', q.get('utm_campaign'));
    set('page', /shipping/.test(location.pathname) ? 'livraison' : 'accueil');
    let visits = 1;
    try {
      visits = +localStorage.getItem('squishland:visits') || 0;
      if (!sessionStorage.getItem('squishland:session')) { visits += 1; localStorage.setItem('squishland:visits', visits); sessionStorage.setItem('squishland:session', '1'); }
    } catch (e) { /* ignore */ }
    set('visiteur', visits > 1 ? 'revenu' : 'nouveau');
  }

  /* Événement personnalisé visible dans Clarity (filtres « Événements personnalisés »). */
  /* Envoyé juste après l'affichage, pour que le clic réagisse tout de suite (score INP). */
  window.track = function (name, tags) {
    if (!loaded || typeof window.clarity !== 'function') return;
    const send = () => {
      if (tags) Object.keys(tags).forEach(k => window.clarity('set', k, String(tags[k])));
      window.clarity('event', name);
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => setTimeout(send, 0));
    else setTimeout(send, 0);
  };

  const css = `
  .cookie-bar { position: fixed; left: 16px; bottom: 16px; z-index: 300; width: min(420px, calc(100% - 32px));
    padding: 18px 18px 16px; border-radius: 18px; background: #fff; color: #2A1033;
    box-shadow: 0 24px 50px -16px rgba(42,16,51,.45); border: 2px solid #FFE135;
    font: 14px/1.5 Inter, system-ui, sans-serif; }
  .cookie-bar b { display: block; font-size: 15px; margin-bottom: 4px; }
  .cookie-bar p { margin: 0; color: #5B4A60; }
  .cookie-bar .cb-actions { display: flex; gap: 8px; margin-top: 14px; }
  .cookie-bar button { flex: 1; height: 42px; border-radius: 999px; font: 600 14px Inter, system-ui, sans-serif; cursor: pointer; }
  .cookie-bar .cb-yes { background: #E6007E; color: #fff; border: 0; }
  .cookie-bar .cb-no { background: #fff; color: #2A1033; border: 1.5px solid #2A1033; }
  @media (max-width: 640px) { .cookie-bar { left: 10px; bottom: 10px; width: calc(100% - 20px); } }`;

  function showBar() {
    if (document.getElementById('cookieBar')) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const bar = document.createElement('div');
    bar.className = 'cookie-bar'; bar.id = 'cookieBar';
    bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', 'Cookies');
    bar.innerHTML = `<b>On peut mesurer ta visite ?</b>
      <p>Avec ton accord, Microsoft Clarity enregistre ta navigation (clics, défilement) de façon anonyme pour nous aider à améliorer le site. Ce que tu tapes (nom, adresse…) n'est jamais enregistré.</p>
      <div class="cb-actions"><button class="cb-no" type="button">Refuser</button><button class="cb-yes" type="button">Accepter</button></div>`;
    bar.querySelector('.cb-yes').addEventListener('click', () => { save(true); bar.remove(); loadClarity(); });
    bar.querySelector('.cb-no').addEventListener('click', () => { save(false); bar.remove(); });
    document.body.appendChild(bar);
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-cookie-settings]')) {
      e.preventDefault();
      try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
      if (loaded) { window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' }); window.clarity('consent', false); location.reload(); return; }
      showBar();
    }
  });

  const choice = read();
  if (choice === true) loadClarity();
  else if (choice === null) {
    if (document.body) showBar(); else document.addEventListener('DOMContentLoaded', showBar);
  }
})();

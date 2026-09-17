/* ==========================================================
   Squishy renderer : dessine les squishies en SVG + physique
   ========================================================== */
(function () {
  let uid = 0;
  const INK = '#2B1B3D';

  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }

  // Pseudo-aléatoire déterministe (pour les pépites, graines…)
  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  /* ---------- Visage kawaii ---------- */
  function face(cx, cy, s, mood, eyeInk) {
    s = s || 1;
    const ink = INK, eye = eyeInk || INK, shine = eye === INK ? "#fff" : INK;
    const ex = 22 * s, er = 6.5 * s;
    let open;
    if (mood === 'sleepy') {
      open = `<path d="M${cx - ex - er} ${cy - 1} q${er} ${er * 1.1} ${er * 2} 0 M${cx + ex - er} ${cy - 1} q${er} ${er * 1.1} ${er * 2} 0" stroke="${eye}" stroke-width="${3 * s}" fill="none" stroke-linecap="round"/>`;
    } else {
      open = `<ellipse cx="${cx - ex}" cy="${cy}" rx="${er}" ry="${er * 1.18}" fill="${eye}"/>
        <ellipse cx="${cx + ex}" cy="${cy}" rx="${er}" ry="${er * 1.18}" fill="${eye}"/>
        <circle cx="${cx - ex + 2.3 * s}" cy="${cy - 2.8 * s}" r="${2.3 * s}" fill="${shine}"/>
        <circle cx="${cx + ex + 2.3 * s}" cy="${cy - 2.8 * s}" r="${2.3 * s}" fill="${shine}"/>
        <circle cx="${cx - ex - 2.2 * s}" cy="${cy + 3 * s}" r="${1.1 * s}" fill="${shine}"/>
        <circle cx="${cx + ex - 2.2 * s}" cy="${cy + 3 * s}" r="${1.1 * s}" fill="${shine}"/>`;
    }
    let mouth;
    if (mood === 'cat') mouth = `<path d="M${cx - 9 * s} ${cy + 8 * s} q${4.5 * s} ${6 * s} ${9 * s} 0 q${4.5 * s} ${6 * s} ${9 * s} 0" stroke="${ink}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if (mood === 'wow') mouth = `<ellipse cx="${cx}" cy="${cy + 11 * s}" rx="${4 * s}" ry="${5 * s}" fill="${ink}"/>`;
    else if (mood === 'none') mouth = '';
    else if (mood === 'sleepy') mouth = `<ellipse cx="${cx}" cy="${cy + 10 * s}" rx="${3 * s}" ry="${2.2 * s}" fill="${ink}"/>`;
    else mouth = `<path d="M${cx - 6 * s} ${cy + 8 * s} q${6 * s} ${7 * s} ${12 * s} 0" stroke="${ink}" stroke-width="${2.8 * s}" fill="none" stroke-linecap="round"/>`;

    const squeeze = `<path d="M${cx - ex - er} ${cy - er * .9} l${er * 1.7} ${er * .9} l${-er * 1.7} ${er * .9}" stroke="${eye}" stroke-width="${3 * s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${cx + ex + er} ${cy - er * .9} l${-er * 1.7} ${er * .9} l${er * 1.7} ${er * .9}" stroke="${eye}" stroke-width="${3 * s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${cx - 7 * s} ${cy + 8 * s} q${7 * s} ${10 * s} ${14 * s} 0 z" fill="${ink}"/>`;

    const blush = `<ellipse cx="${cx - ex - 12 * s}" cy="${cy + 10 * s}" rx="${8 * s}" ry="${4.5 * s}" fill="#FF6FA5" opacity=".38"/>
      <ellipse cx="${cx + ex + 12 * s}" cy="${cy + 10 * s}" rx="${8 * s}" ry="${4.5 * s}" fill="#FF6FA5" opacity=".38"/>`;

    return `<g class="sq-face">${blush}<g class="f-open">${open}${mouth}</g><g class="f-squeeze">${squeeze}</g></g>`;
  }

  function starPath(cx, cy, R, r, n) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const rad = i % 2 ? r : R;
      const a = -Math.PI / 2 + (i * Math.PI) / n;
      d += (i ? 'L' : 'M') + (cx + rad * Math.cos(a)).toFixed(1) + ' ' + (cy + rad * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }
  function wavyCircle(cx, cy, r, amp, waves) {
    let d = '';
    const N = 72;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const rr = r + amp * Math.sin(a * waves) + (a > Math.PI * .15 && a < Math.PI * .85 ? amp * 1.2 * Math.sin(a * 3) : 0);
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }

  /* ---------- Rendu principal ---------- */
  function render(p, opts) {
    opts = opts || {};
    const id = 'sq' + (uid++);
    const c1 = p.c1, c2 = p.c2;
    const hl = mix(c1, '#ffffff', .6);
    const edge = mix(c2, INK, .18);
    const F = `url(#${id})`;
    const st = `stroke="${edge}" stroke-width="2.2" stroke-linejoin="round"`;
    let defs = `<radialGradient id="${id}" cx="38%" cy="28%" r="78%"><stop offset="0" stop-color="${hl}"/><stop offset=".5" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>`;
    let body = '', fx = 100, fy = 122, fs = 1, gloss = [66, 86, 16, 9], extra = '';
    const mood = p.mood || 'happy';

    switch (p.shape) {
      case 'peach':
        body = `<path d="M100 64 C70 30 16 50 18 112 C20 162 60 180 100 180 C140 180 180 162 182 112 C184 50 130 30 100 64Z" fill="${F}" ${st}/>
          <path d="M100 66 C90 96 90 128 98 152" stroke="${mix(c2, INK, .1)}" stroke-width="2.5" fill="none" opacity=".35" stroke-linecap="round"/>
          <path d="M101 62 C108 32 138 26 152 34 C142 56 120 64 101 62Z" fill="#8ED081" stroke="#5EA35A" stroke-width="2" stroke-linejoin="round"/>`;
        fy = 124; gloss = [52, 92, 15, 9];
        break;

      case 'cat':
        body = `<path d="M30 170 C16 150 18 104 34 82 L38 34 C40 28 44 28 48 32 L76 62 C92 57 108 57 124 62 L152 32 C156 28 160 28 162 34 L166 82 C182 104 184 150 170 170 C150 182 50 182 30 170Z" fill="${F}" ${st}/>
          <path d="M44 46 L66 66 L46 72Z M156 46 L134 66 L154 72Z" fill="#FF9CC2" opacity=".7"/>`;
        extra = `<path d="M30 128 L6 122 M30 138 L6 140 M170 128 L194 122 M170 138 L194 140" stroke="${edge}" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
        fy = 120; gloss = [60, 92, 14, 8];
        break;

      case 'bear':
      case 'panda': {
        const panda = p.shape === 'panda';
        const earC = panda ? '#3A2E4A' : c2;
        body = `<circle cx="46" cy="66" r="25" fill="${earC}" ${st}/><circle cx="154" cy="66" r="25" fill="${earC}" ${st}/>
          <circle cx="46" cy="66" r="12" fill="${panda ? '#5A4B6B' : mix(c1, '#FF9CC2', .4)}"/><circle cx="154" cy="66" r="12" fill="${panda ? '#5A4B6B' : mix(c1, '#FF9CC2', .4)}"/>
          <ellipse cx="100" cy="122" rx="80" ry="60" fill="${F}" ${st}/>`;
        if (panda) body += `<ellipse cx="76" cy="116" rx="17" ry="20" transform="rotate(-25 76 116)" fill="#3A2E4A"/><ellipse cx="124" cy="116" rx="17" ry="20" transform="rotate(25 124 116)" fill="#3A2E4A"/>`;
        else body += `<ellipse cx="100" cy="140" rx="26" ry="18" fill="${mix(c1, '#ffffff', .5)}" opacity=".85"/>`;
        fy = 120;
        gloss = [58, 88, 16, 9];
        if (panda) {
          // visage clair sur patches sombres
          return wrap(id, defs, body, face(fx, fy, 1, mood, '#ffffff'), gloss, extra, opts);
        }
        break;
      }

      case 'bunny':
        body = `<ellipse cx="72" cy="58" rx="17" ry="46" transform="rotate(-12 72 58)" fill="${F}" ${st}/>
          <ellipse cx="128" cy="58" rx="17" ry="46" transform="rotate(12 128 58)" fill="${F}" ${st}/>
          <ellipse cx="72" cy="60" rx="7" ry="30" transform="rotate(-12 72 60)" fill="#FF9CC2" opacity=".6"/>
          <ellipse cx="128" cy="60" rx="7" ry="30" transform="rotate(12 128 60)" fill="#FF9CC2" opacity=".6"/>
          <ellipse cx="100" cy="132" rx="76" ry="50" fill="${F}" ${st}/>`;
        fy = 130; gloss = [60, 108, 15, 8];
        break;

      case 'strawberry': {
        body = `<path d="M100 180 C58 172 20 122 24 84 C28 56 60 50 100 58 C140 50 172 56 176 84 C180 122 142 172 100 180Z" fill="${F}" ${st}/>`;
        const r = rng(7);
        let seeds = '';
        const pts = [[58, 92], [142, 92], [46, 118], [154, 118], [70, 150], [130, 150], [100, 164], [60, 76], [140, 76], [100, 72]];
        pts.forEach(([x, y]) => { seeds += `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="4" transform="rotate(${(r() * 40 - 20).toFixed(0)} ${x} ${y})" fill="#FFE8A3"/>`; });
        body += seeds + `<path d="M100 62 L80 40 L94 50 L100 30 L106 50 L120 40 Z M70 60 C80 46 92 52 100 62 C108 52 120 46 130 60 C118 70 82 70 70 60Z" fill="#8ED081" stroke="#5EA35A" stroke-width="2" stroke-linejoin="round"/>`;
        fy = 112; gloss = [54, 100, 12, 8];
        break;
      }

      case 'cloud':
        body = `<path d="M44 166 C10 166 8 118 38 112 C34 78 70 64 92 80 C106 50 154 54 160 92 C192 90 198 136 172 152 C170 162 162 166 152 166 Z" fill="${F}" ${st}/>`;
        fy = 128; gloss = [54, 120, 14, 8];
        break;

      case 'donut': {
        const mId = id + 'm', dId = id + 'd';
        defs += `<radialGradient id="${dId}" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#FBE2B8"/><stop offset="1" stop-color="#D99A5B"/></radialGradient>
          <mask id="${mId}"><rect width="200" height="200" fill="#fff"/><ellipse cx="100" cy="94" rx="16" ry="11" fill="#000"/></mask>`;
        const r = rng(p.name ? p.name.length * 13 : 3);
        const sprCols = ['#FFFFFF', '#FFD66B', '#7FD9B8', '#8EC5FF', '#B69CFF'];
        let spr = '';
        for (let i = 0; i < 16; i++) {
          const a = r() * Math.PI * 2, d = 26 + r() * 30;
          const x = 100 + Math.cos(a) * d * 1.2, y = 104 + Math.sin(a) * d * .75;
          if (y > 118 && Math.abs(x - 100) < 44) continue;
          spr += `<rect x="${(x - 5).toFixed(1)}" y="${(y - 1.8).toFixed(1)}" width="10" height="3.6" rx="1.8" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${sprCols[i % sprCols.length]}"/>`;
        }
        body = `<g mask="url(#${mId})">
          <ellipse cx="100" cy="118" rx="84" ry="60" fill="url(#${dId})" stroke="#B87A45" stroke-width="2.2"/>
          <path d="M26 108 C28 70 64 54 100 54 C136 54 172 70 174 108 C176 128 164 126 158 136 C150 150 140 138 130 146 C118 156 110 142 100 150 C90 158 80 142 70 148 C58 154 50 138 42 136 C30 132 24 126 26 108Z" fill="${F}" ${st}/>
          ${spr}
          </g><ellipse cx="100" cy="95" rx="16" ry="11" fill="none" stroke="#B87A45" stroke-width="2" opacity=".5"/>`;
        fy = 122; fs = .85; gloss = [52, 84, 12, 7];
        break;
      }

      case 'toast':
        body = `<path d="M38 170 L38 92 C16 90 14 40 58 34 C80 18 120 18 142 34 C186 40 184 90 162 92 L162 170 C162 178 156 180 148 180 L52 180 C44 180 38 178 38 170Z" fill="${c2}" ${st}/>
          <path d="M50 166 L50 86 C32 84 30 50 64 46 C84 32 116 32 136 46 C170 50 168 84 150 86 L150 166 C150 170 146 170 142 170 L58 170 C54 170 50 170 50 166Z" fill="${F}"/>
          <rect x="112" y="60" width="26" height="18" rx="5" fill="#FFE58A" stroke="#E8BF4A" stroke-width="2" transform="rotate(-8 125 69)"/>`;
        fy = 118; gloss = [70, 70, 12, 7];
        break;

      case 'avocado':
        body = `<path d="M100 20 C132 20 144 60 152 90 C182 120 176 180 100 180 C24 180 18 120 48 90 C56 60 68 20 100 20Z" fill="${mix(c2, INK, .25)}" ${st}/>
          <path d="M100 32 C124 32 134 64 142 94 C166 120 162 170 100 170 C38 170 34 120 58 94 C66 64 76 32 100 32Z" fill="${F}"/>
          <circle cx="100" cy="136" r="26" fill="#A86B4C"/><circle cx="92" cy="128" r="7" fill="#C98E6C"/>`;
        fx = 100; fy = 88; fs = .8; gloss = [80, 60, 8, 12];
        break;

      case 'frog':
        body = `<circle cx="62" cy="80" r="27" fill="${F}" ${st}/><circle cx="138" cy="80" r="27" fill="${F}" ${st}/>
          <path d="M20 150 C20 104 50 86 100 86 C150 86 180 104 180 150 C180 174 150 180 100 180 C50 180 20 174 20 150Z" fill="${F}" ${st}/>
          <circle cx="62" cy="80" r="14" fill="#fff"/><circle cx="138" cy="80" r="14" fill="#fff"/>`;
        // yeux spéciaux dans les bosses
        return wrap(id, defs, body,
          `<g class="sq-face">
            <ellipse cx="54" cy="136" rx="10" ry="5" fill="#FF6FA5" opacity=".38"/><ellipse cx="146" cy="136" rx="10" ry="5" fill="#FF6FA5" opacity=".38"/>
            <g class="f-open"><circle cx="64" cy="82" r="8" fill="${INK}"/><circle cx="140" cy="82" r="8" fill="${INK}"/><circle cx="67" cy="79" r="2.6" fill="#fff"/><circle cx="143" cy="79" r="2.6" fill="#fff"/>
            <path d="M74 128 Q100 150 126 128" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/></g>
            <g class="f-squeeze"><path d="M54 76 l14 6 l-14 6 M148 76 l-14 6 l14 6" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M80 128 Q100 156 120 128Z" fill="${INK}"/></g>
          </g>`, [56, 110, 14, 8], '', opts);

      case 'ghost':
        body = `<path d="M38 172 L38 92 C38 50 66 24 100 24 C134 24 162 50 162 92 L162 172 C156 182 148 168 140 174 C132 182 124 166 116 174 C108 182 100 166 92 174 C84 182 76 166 68 174 C58 182 46 168 38 172Z" fill="${F}" ${st}/>`;
        fy = 100; gloss = [66, 56, 12, 8];
        break;

      case 'star':
        body = `<path d="${starPath(100, 116, 80, 40, 5)}" fill="${F}" stroke="${F}" stroke-width="22" stroke-linejoin="round"/>
          <path d="${starPath(100, 116, 80, 40, 5)}" fill="none" stroke="${edge}" stroke-width="2" stroke-linejoin="round" opacity="0"/>`;
        fy = 120; fs = .9; gloss = [72, 90, 10, 6];
        break;

      case 'mochi':
        body = `<path d="M40 178 C18 178 16 160 16 132 C16 84 42 62 100 62 C158 62 184 84 184 132 C184 160 182 178 160 178Z" fill="${F}" ${st}/>`;
        fy = 126; gloss = [56, 92, 16, 9];
        break;

      case 'chick':
        body = `<path d="M88 44 C84 28 96 22 100 36 C104 20 118 26 110 44" fill="${c2}" ${st}/>
          <path d="M40 178 C18 178 16 158 16 128 C16 76 48 50 100 50 C152 50 184 76 184 128 C184 158 182 178 160 178Z" fill="${F}" ${st}/>
          <path d="M22 132 C6 128 6 110 20 104" fill="${c2}" ${st}/><path d="M178 132 C194 128 194 110 180 104" fill="${c2}" ${st}/>`;
        extra = `<path d="M92 124 L108 124 L100 133Z" fill="#FF9F43" stroke="#E07A1F" stroke-width="1.5" stroke-linejoin="round"/>`;
        fy = 112; gloss = [58, 82, 15, 9];
        return wrap(id, defs, body, face(fx, fy, 1, 'none'), gloss, extra, opts);

      case 'cupcake': {
        body = `<path d="M46 118 L154 118 L142 180 L58 180Z" fill="${mix(c2, '#ffffff', .15)}" ${st}/>
          <path d="M70 120 L74 180 M90 120 L91 180 M110 120 L109 180 M130 120 L126 180" stroke="${mix(c2, INK, .15)}" stroke-width="2" opacity=".35"/>
          <path d="M34 124 C16 122 20 92 42 92 C40 62 74 52 88 62 C96 36 138 40 134 66 C162 62 174 92 160 102 C180 110 172 128 156 126Z" fill="${F}" ${st}/>
          <circle cx="112" cy="40" r="11" fill="#FF4D6D" stroke="#C9184A" stroke-width="2"/><path d="M114 30 C116 20 124 16 130 16" stroke="#5EA35A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        fy = 146; fs = .75; gloss = [60, 84, 14, 7];
        const r = rng(19);
        for (let i = 0; i < 9; i++) {
          const x = 50 + r() * 100, y = 70 + r() * 40;
          extra += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="2.6" fill="${['#FFD66B', '#7FD9B8', '#8EC5FF', '#fff'][i % 4]}"/>`;
        }
        break;
      }

      case 'box':
        body = `<rect x="30" y="86" width="140" height="92" rx="16" fill="${F}" ${st}/>
          <rect x="22" y="66" width="156" height="34" rx="12" fill="${c2}" ${st}/>
          <rect x="90" y="66" width="20" height="34" fill="#FFD66B"/>
          <path d="M100 66 C80 34 50 44 64 62 C70 68 88 68 100 66Z M100 66 C120 34 150 44 136 62 C130 68 112 68 100 66Z" fill="#FFD66B" stroke="#E8BF4A" stroke-width="2" stroke-linejoin="round"/>`;
        fy = 130; gloss = [52, 110, 10, 16];
        break;

      default:
        body = `<ellipse cx="100" cy="124" rx="80" ry="56" fill="${F}" ${st}/>`;
    }

    return wrap(id, defs, body, face(fx, fy, fs, mood), gloss, extra, opts);
  }

  function wrap(id, defs, body, faceSvg, gloss, extra, opts) {
    const [gx, gy, grx, gry] = gloss;
    const glossSvg = `<ellipse cx="${gx}" cy="${gy}" rx="${grx}" ry="${gry}" transform="rotate(-30 ${gx} ${gy})" fill="#fff" opacity=".55"/><circle cx="${gx + grx + 6}" cy="${gy - 6}" r="3" fill="#fff" opacity=".6"/>`;
    return `<svg class="sq ${opts.cls || ''}" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><defs>${defs}</defs><ellipse class="sq-shadow" cx="100" cy="186" rx="68" ry="8"/><g class="sq-body">${body}${glossSvg}${faceSvg}${extra}</g></svg>`;
  }

  /* ---------- Physique ---------- */
  // Écrasement d'une vraie photo (moins exagéré qu'un dessin)
  function squishPhotos(host, rise, power) {
    const dur = 520 + rise * 190;
    host.querySelectorAll('img.photo').forEach(img => {
      if (!img.animate) return;
      img.getAnimations().forEach(a => a.cancel());
      img.animate([
        { transform: 'scale(1,1)', easing: 'cubic-bezier(.2,.9,.3,1)' },
        { transform: `scale(${1 + .12 * power},${1 - .16 * power})`, offset: .08, easing: 'linear' },
        { transform: `scale(${1 + .09 * power},${1 - .12 * power})`, offset: .3, easing: 'cubic-bezier(.3,.1,.3,1)' },
        { transform: `scale(${1 - .015 * power},${1 + .02 * power})`, offset: .86 },
        { transform: 'scale(1,1)' }
      ], { duration: dur });
    });
  }

  function squish(svg, rise, power) {
    if (!svg) return;
    rise = rise == null ? 6 : rise;
    power = power == null ? 1 : power;
    if (svg.tagName !== 'svg') {
      const s = svg.querySelector('svg.sq');
      if (!s) return squishPhotos(svg, rise, power);
      svg = s;
    }
    const b = svg.querySelector('.sq-body'), sh = svg.querySelector('.sq-shadow');
    if (!b || !b.animate) return;
    const dur = 520 + rise * 190;
    const sx = 1 + .26 * power, sy = 1 - .32 * power;
    b.getAnimations().forEach(a => a.cancel());
    svg.classList.add('squeezed');
    clearTimeout(svg._sqT);
    svg._sqT = setTimeout(() => svg.classList.remove('squeezed'), dur * .4);
    b.animate([
      { transform: 'scale(1,1)', easing: 'cubic-bezier(.2,.9,.3,1)' },
      { transform: `scale(${sx},${sy})`, offset: .08, easing: 'linear' },
      { transform: `scale(${1 + .2 * power},${1 - .24 * power})`, offset: .3, easing: 'cubic-bezier(.3,.1,.3,1)' },
      { transform: `scale(${1 - .03 * power},${1 + .04 * power})`, offset: .86 },
      { transform: 'scale(1,1)' }
    ], { duration: dur });
    if (sh) sh.animate([
      { transform: 'scaleX(1)' },
      { transform: `scaleX(${sx + .08})`, offset: .08 },
      { transform: `scaleX(${1 + .15 * power})`, offset: .3 },
      { transform: 'scaleX(1)' }
    ], { duration: dur });
  }

  function wobble(svg) {
    if (!svg) return;
    if (svg.tagName !== 'svg') {
      const s = svg.querySelector('svg.sq');
      if (!s) {
        const img = svg.querySelector('img.photo');
        if (img && img.animate && !img.getAnimations().length) img.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.03,.97)', offset: .3 }, { transform: 'scale(.99,1.01)', offset: .65 }, { transform: 'scale(1,1)' }], { duration: 600, easing: 'ease-out' });
        return;
      }
      svg = s;
    }
    const b = svg && svg.querySelector('.sq-body');
    if (!b || !b.animate || b.getAnimations().length) return;
    b.animate([
      { transform: 'scale(1,1)' },
      { transform: 'scale(1.06,.94)', offset: .25 },
      { transform: 'scale(.97,1.04)', offset: .55 },
      { transform: 'scale(1.01,.99)', offset: .8 },
      { transform: 'scale(1,1)' }
    ], { duration: 650, easing: 'ease-out' });
  }

  /* ---------- Sons (Web Audio, aucun fichier) ---------- */
  let actx = null;
  const Sound = {
    on: true,
    play(type) {
      if (!this.on) return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        const t = actx.currentTime;
        const o = actx.createOscillator(), g = actx.createGain(), f = actx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = 1800;
        o.type = type === 'squish' ? 'triangle' : 'sine';
        if (type === 'squish') { o.frequency.setValueAtTime(380, t); o.frequency.exponentialRampToValueAtTime(70, t + .22); }
        else if (type === 'pop') { o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(880, t + .09); }
        else if (type === 'rise') { o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(420, t + .5); }
        else { o.frequency.setValueAtTime(660, t); o.frequency.exponentialRampToValueAtTime(1320, t + .12); }
        const len = type === 'rise' ? .55 : .28;
        const vol = type === 'rise' ? .05 : .16;
        g.gain.setValueAtTime(.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + .02);
        g.gain.exponentialRampToValueAtTime(.0001, t + len);
        o.connect(f); f.connect(g); g.connect(actx.destination);
        o.start(t); o.stop(t + len + .05);
      } catch (e) { /* audio indisponible */ }
    }
  };

  window.Squishy = { render, squish, wobble, mix, Sound };
})();

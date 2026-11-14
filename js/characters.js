// Christmas cartoon characters drawn as SVG, each with a friend's face on it.
// Standing characters use a 200x300 canvas with the face at x55 y40 (90x108).
(function () {
  const FACE = { x: 55, y: 40, w: 90, h: 108 };

  // Shared gradients, patterns and the fur filter (added to the page once).
  const DEFS = `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <filter id="ss-fur" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="3"/>
        <feDisplacementMap in="SourceGraphic" scale="9"/>
      </filter>
      <radialGradient id="ss-snow" cx="40%" cy="35%" r="70%">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfdeee"/>
      </radialGradient>
      <radialGradient id="ss-nose" cx="35%" cy="35%" r="70%">
        <stop offset="0" stop-color="#ff7a7a"/><stop offset=".5" stop-color="#e3001b"/><stop offset="1" stop-color="#8a0010"/>
      </radialGradient>
      <radialGradient id="ss-glow" r="50%">
        <stop offset="0" stop-color="#ffe9a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="ss-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#c8961e"/>
      </linearGradient>
      <pattern id="ss-candy" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <rect width="14" height="14" fill="#fff"/><rect width="7" height="14" fill="#d42426"/>
      </pattern>
      <pattern id="ss-cap" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
        <rect width="16" height="16" fill="#efe6cf"/><rect width="8" height="16" fill="#8b1e2b"/>
      </pattern>
    </defs>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", DEFS);

  const faceImg = (f, b = FACE) =>
    `<image href="${f.src}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" preserveAspectRatio="xMidYMid slice"/>`;

  const skin = (f) => (f && f.skin) || "#e8b796";

  // ---------- heads (hat + whatever sits behind/around the face) ----------
  const heads = {
    santa: (f) => `
      <path d="M56 108 Q46 162 72 184 Q86 198 100 191 Q114 198 128 184 Q154 162 144 108 Q100 150 56 108Z" fill="#fff"/>
      <circle cx="64" cy="172" r="9" fill="#fff"/><circle cx="136" cy="172" r="9" fill="#fff"/><circle cx="100" cy="196" r="9" fill="#fff"/>
      ${faceImg(f)}
      <path d="M56 66 C58 20 100 4 132 14 C158 22 170 40 168 62 L156 60 C152 44 140 34 128 32 C138 44 144 56 144 66Z" fill="#d42426"/>
      <circle cx="163" cy="64" r="12" fill="#fff"/>
      <rect x="50" y="54" width="100" height="20" rx="10" fill="#fff"/>`,
    grinch: (f) => `
      <ellipse cx="100" cy="94" rx="54" ry="64" fill="#5f9e2c" filter="url(#ss-fur)"/>
      ${faceImg(f)}
      <path d="M60 66 C62 22 120 8 142 38 C150 50 148 60 146 66Z" fill="#d42426"/>
      <path d="M72 38 C50 28 28 48 36 80 L48 78 C46 58 58 48 76 52Z" fill="#d42426"/>
      <circle cx="40" cy="84" r="11" fill="#fff"/>
      <rect x="52" y="56" width="98" height="19" rx="9.5" fill="#fff"/>`,
    scrooge: (f) => `
      <ellipse cx="60" cy="116" rx="15" ry="24" fill="#d8d8d8" filter="url(#ss-fur)"/>
      <ellipse cx="140" cy="116" rx="15" ry="24" fill="#d8d8d8" filter="url(#ss-fur)"/>
      ${faceImg(f)}
      <path d="M58 66 C60 18 122 6 152 40 C172 64 178 110 174 142 L164 140 C162 104 150 72 140 64Z" fill="url(#ss-cap)" stroke="#6d1520" stroke-width="1.5"/>
      <circle cx="169" cy="148" r="9" fill="#efe6cf" stroke="#cbbf9f"/>
      <rect x="53" y="56" width="94" height="17" rx="8.5" fill="#efe6cf" stroke="#cbbf9f"/>`,
    reindeer: (f) => {
      const nx = FACE.x + (f.nose ? f.nose[0] : 0.5) * FACE.w;
      const ny = FACE.y + (f.nose ? f.nose[1] : 0.58) * FACE.h;
      return `
      <g stroke="#6b4423" stroke-width="7" stroke-linecap="round" fill="none">
        <path d="M80 52 C72 30 62 18 50 4"/><path d="M68 32 L46 30"/><path d="M60 20 L64 2"/>
        <path d="M120 52 C128 30 138 18 150 4"/><path d="M132 32 L154 30"/><path d="M140 20 L136 2"/>
      </g>
      <ellipse cx="50" cy="74" rx="20" ry="9" transform="rotate(-28 50 74)" fill="#8b5a2b"/>
      <ellipse cx="150" cy="74" rx="20" ry="9" transform="rotate(28 150 74)" fill="#8b5a2b"/>
      <ellipse cx="50" cy="74" rx="11" ry="4" transform="rotate(-28 50 74)" fill="#e8a7a0"/>
      <ellipse cx="150" cy="74" rx="11" ry="4" transform="rotate(28 150 74)" fill="#e8a7a0"/>
      <ellipse cx="100" cy="94" rx="50" ry="60" fill="#8b5a2b"/>
      ${faceImg(f)}
      <circle class="nose" cx="${nx}" cy="${ny}" r="9" fill="url(#ss-nose)"/>
      <circle cx="${nx - 3}" cy="${ny - 3}" r="2.5" fill="#fff" opacity=".8"/>`;
    },
    elf: (f) => `
      <path d="M58 92 L30 70 L50 112Z" fill="${skin(f)}" stroke="rgba(0,0,0,.15)"/>
      <path d="M142 92 L170 70 L150 112Z" fill="${skin(f)}" stroke="rgba(0,0,0,.15)"/>
      ${faceImg(f)}
      <path d="M58 66 C70 40 96 20 132 2 C126 26 138 50 142 66Z" fill="#1f8a3b"/>
      <circle cx="133" cy="5" r="7" fill="url(#ss-gold)"/>
      <rect x="52" y="56" width="96" height="18" rx="9" fill="#d42426"/>
      <g fill="#f4c430"><circle cx="66" cy="65" r="2.4"/><circle cx="82" cy="65" r="2.4"/><circle cx="98" cy="65" r="2.4"/><circle cx="114" cy="65" r="2.4"/><circle cx="130" cy="65" r="2.4"/></g>`,
    snowman: (f) => `
      <circle cx="100" cy="94" r="60" fill="url(#ss-snow)"/>
      ${faceImg(f)}
      <rect x="66" y="10" width="68" height="50" rx="3" fill="#1d1d1d"/>
      <rect x="66" y="44" width="68" height="10" fill="#d42426"/>
      <rect x="48" y="56" width="104" height="10" rx="5" fill="#1d1d1d"/>
      <ellipse cx="124" cy="44" rx="9" ry="4" transform="rotate(-25 124 44)" fill="#1f8a3b"/>
      <ellipse cx="132" cy="48" rx="9" ry="4" transform="rotate(20 132 48)" fill="#1f8a3b"/>
      <circle cx="126" cy="50" r="3" fill="#d42426"/><circle cx="131" cy="52" r="3" fill="#d42426"/>`,
    gingerbread: (f) => `
      <circle cx="100" cy="94" r="60" fill="#b5651d"/>
      <circle cx="100" cy="94" r="55" fill="none" stroke="#fff" stroke-width="3.5" stroke-dasharray="7 6"/>
      ${faceImg(f)}`,
  };

  // ---------- bodies ----------
  const bodies = {
    santa: () => `
      <g class="arm-l"><path d="M64 160 Q38 186 40 220" stroke="#c81d25" stroke-width="22" stroke-linecap="round" fill="none"/>
        <rect x="27" y="208" width="26" height="10" rx="5" fill="#fff"/><circle cx="40" cy="228" r="12" fill="#1d1d1d"/></g>
      <g class="arm-wave" style="transform-origin:136px 162px"><path d="M136 162 Q166 146 170 112" stroke="#c81d25" stroke-width="22" stroke-linecap="round" fill="none"/>
        <rect x="157" y="112" width="26" height="10" rx="5" fill="#fff"/><circle cx="170" cy="102" r="12" fill="#1d1d1d"/></g>
      <rect x="66" y="256" width="26" height="28" fill="#b3161b"/><rect x="108" y="256" width="26" height="28" fill="#b3161b"/>
      <rect x="58" y="276" width="38" height="18" rx="8" fill="#1d1d1d"/><rect x="104" y="276" width="38" height="18" rx="8" fill="#1d1d1d"/>
      <path d="M60 150 Q46 200 48 262 L152 262 Q154 200 140 150 Q100 138 60 150Z" fill="#d42426"/>
      <rect x="92" y="150" width="16" height="106" fill="#fff"/>
      <rect x="44" y="250" width="112" height="16" rx="8" fill="#fff"/>
      <rect x="49" y="206" width="102" height="14" fill="#1d1d1d"/>
      <rect x="87" y="202" width="26" height="22" rx="3" fill="none" stroke="url(#ss-gold)" stroke-width="5"/>`,
    grinch: (f) => `
      <path d="M14 206 Q4 262 48 272 Q84 274 78 214 Q62 196 46 198 Q28 196 14 206Z" fill="#a8743f"/>
      <path d="M30 202 Q46 190 64 200" stroke="#6b4423" stroke-width="5" fill="none"/>
      <rect x="20" y="236" width="14" height="14" rx="2" fill="#d42426" transform="rotate(-12 27 243)"/>
      <rect x="66" y="252" width="12" height="32" fill="#5f9e2c"/><rect x="122" y="252" width="12" height="32" fill="#5f9e2c"/>
      <ellipse cx="62" cy="288" rx="22" ry="8" fill="#5f9e2c"/><ellipse cx="138" cy="288" rx="22" ry="8" fill="#5f9e2c"/>
      <path d="M70 150 Q36 214 64 264 L136 264 Q164 214 130 150Z" fill="#5f9e2c" filter="url(#ss-fur)"/>
      <ellipse cx="100" cy="218" rx="30" ry="36" fill="#86c046" filter="url(#ss-fur)"/>
      <path d="M72 166 Q52 190 54 214" stroke="#5f9e2c" stroke-width="12" stroke-linecap="round" fill="none"/>
      <g class="arm-wave" style="transform-origin:130px 166px">
        <path d="M130 166 Q160 150 170 118" stroke="#5f9e2c" stroke-width="12" stroke-linecap="round" fill="none"/>
        <g stroke="#5f9e2c" stroke-width="5" stroke-linecap="round"><path d="M170 118 L162 92"/><path d="M170 118 L176 92"/><path d="M170 118 L188 102"/></g>
      </g>`,
    scrooge: (f) => `
      <ellipse cx="78" cy="290" rx="18" ry="8" fill="#6b3b1f"/><ellipse cx="122" cy="290" rx="18" ry="8" fill="#6b3b1f"/>
      <path d="M66 148 Q50 220 46 288 L154 288 Q150 220 134 148 Q100 136 66 148Z" fill="#efe8d6" stroke="#cfc4a8" stroke-width="2"/>
      <g stroke="#d8cfb6" stroke-width="2" fill="none"><path d="M84 170 Q78 230 74 284"/><path d="M116 170 Q122 230 126 284"/><path d="M100 160 L100 286"/></g>
      <path d="M130 166 Q150 196 148 228" stroke="#efe8d6" stroke-width="20" stroke-linecap="round" fill="none"/>
      <circle cx="148" cy="236" r="8" fill="${skin(f)}"/>
      <circle cx="44" cy="186" r="34" fill="url(#ss-glow)" class="flicker-glow"/>
      <path d="M70 166 Q50 190 46 214" stroke="#efe8d6" stroke-width="20" stroke-linecap="round" fill="none"/>
      <rect x="38" y="190" width="12" height="32" rx="2" fill="#fffbe6" stroke="#e6dcb8"/>
      <path class="flame" d="M44 172 Q36 184 44 190 Q52 184 44 172Z" fill="#ffb021"/>
      <ellipse cx="44" cy="224" rx="20" ry="6" fill="url(#ss-gold)"/>
      <circle cx="44" cy="220" r="7" fill="${skin(f)}"/>`,
    reindeer: () => `
      <rect x="68" y="250" width="22" height="34" fill="#7a4d24"/><rect x="110" y="250" width="22" height="34" fill="#7a4d24"/>
      <rect x="64" y="280" width="30" height="12" rx="5" fill="#3b2414"/><rect x="106" y="280" width="30" height="12" rx="5" fill="#3b2414"/>
      <path d="M64 150 Q46 210 58 262 L142 262 Q154 210 136 150 Q100 140 64 150Z" fill="#8b5a2b"/>
      <ellipse cx="100" cy="212" rx="28" ry="40" fill="#d9b48f"/>
      <path d="M66 166 Q44 190 46 222" stroke="#8b5a2b" stroke-width="16" stroke-linecap="round" fill="none"/>
      <rect x="37" y="222" width="18" height="12" rx="4" fill="#3b2414"/>
      <g class="arm-wave" style="transform-origin:134px 166px">
        <path d="M134 166 Q160 150 164 118" stroke="#8b5a2b" stroke-width="16" stroke-linecap="round" fill="none"/>
        <rect x="155" y="104" width="18" height="12" rx="4" fill="#3b2414"/></g>
      <path d="M68 150 Q100 170 132 150" stroke="#d42426" stroke-width="10" fill="none"/>
      <circle cx="100" cy="166" r="9" fill="url(#ss-gold)"/><circle cx="100" cy="169" r="2" fill="#6b4423"/>`,
    elf: (f) => `
      <rect x="72" y="238" width="18" height="40" fill="url(#ss-candy)"/><rect x="110" y="238" width="18" height="40" fill="url(#ss-candy)"/>
      <path d="M92 276 L92 292 L64 292 Q48 292 46 278 Q52 284 62 280 Q72 274 92 276Z" fill="#1f8a3b"/>
      <path d="M108 276 L108 292 L136 292 Q152 292 154 278 Q148 284 138 280 Q128 274 108 276Z" fill="#1f8a3b"/>
      <circle cx="47" cy="277" r="4" fill="url(#ss-gold)"/><circle cx="153" cy="277" r="4" fill="url(#ss-gold)"/>
      <path d="M66 148 Q56 190 52 244 L148 244 Q144 190 134 148 Q100 138 66 148Z" fill="#1f8a3b"/>
      <path d="M52 238 L60 252 L68 238 L76 252 L84 238 L92 252 L100 238 L108 252 L116 238 L124 252 L132 238 L140 252 L148 238Z" fill="#d42426"/>
      <rect x="55" y="198" width="90" height="12" fill="#3a2a1a"/><rect x="92" y="196" width="16" height="16" rx="2" fill="none" stroke="url(#ss-gold)" stroke-width="4"/>
      <path d="M68 166 Q48 186 48 214" stroke="#1f8a3b" stroke-width="18" stroke-linecap="round" fill="none"/>
      <circle cx="48" cy="222" r="9" fill="${skin(f)}"/>
      <g class="arm-wave" style="transform-origin:132px 166px">
        <path d="M132 166 Q160 152 164 120" stroke="#1f8a3b" stroke-width="18" stroke-linecap="round" fill="none"/>
        <circle cx="164" cy="110" r="9" fill="${skin(f)}"/></g>
      <path d="M66 146 L72 162 L80 148 L88 164 L96 150 L104 164 L112 150 L120 164 L128 148 L134 162 L134 146 Q100 136 66 146Z" fill="#d42426"/>`,
    snowman: () => `
      <circle cx="100" cy="242" r="54" fill="url(#ss-snow)"/>
      <circle cx="100" cy="172" r="40" fill="url(#ss-snow)"/>
      <g fill="#222"><circle cx="100" cy="160" r="5"/><circle cx="100" cy="180" r="5"/><circle cx="100" cy="226" r="6"/><circle cx="100" cy="250" r="6"/></g>
      <g stroke="#6b4423" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M64 168 L22 132"/><path d="M38 146 L28 154"/><path d="M38 146 L34 130"/></g>
      <g class="arm-wave" style="transform-origin:136px 168px" stroke="#6b4423" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M136 168 L178 128"/><path d="M162 142 L174 148"/><path d="M162 142 L164 126"/></g>
      <rect x="58" y="138" width="84" height="16" rx="8" fill="#d42426"/>
      <rect x="118" y="146" width="16" height="44" rx="4" fill="#d42426" transform="rotate(-8 126 146)"/>
      <g stroke="#fff" stroke-width="3"><path d="M80 138 L80 154"/><path d="M100 138 L100 154"/><path d="M120 138 L120 154"/></g>`,
    gingerbread: () => `
      <g fill="#b5651d">
        <rect x="62" y="134" width="76" height="96" rx="30"/>
        <rect x="20" y="152" width="70" height="30" rx="15" transform="rotate(20 55 167)"/>
        <rect x="110" y="152" width="70" height="30" rx="15" transform="rotate(-20 145 167)"/>
        <rect x="66" y="208" width="32" height="84" rx="16" transform="rotate(8 82 250)"/>
        <rect x="102" y="208" width="32" height="84" rx="16" transform="rotate(-8 118 250)"/>
      </g>
      <g stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round">
        <path d="M28 160 l5 8 l5 -8 l5 8"/><path d="M158 168 l5 -8 l5 8 l5 -8"/>
        <path d="M66 278 l5 6 l5 -6 l5 6"/><path d="M114 284 l5 -6 l5 6 l5 -6"/>
      </g>
      <path d="M86 146 L100 154 L86 162Z M114 146 L100 154 L114 162Z" fill="#d42426"/>
      <circle cx="100" cy="176" r="7" fill="#e3001b"/><circle cx="100" cy="196" r="7" fill="#1f8a3b"/><circle cx="100" cy="216" r="7" fill="#1e6fd9"/>`,
  };

  const LABELS = {
    santa: "Santa Claus", grinch: "The Grinch", scrooge: "Ebenezer Scrooge",
    reindeer: "Rudolph", elf: "Head Elf", snowman: "Frosty", gingerbread: "Gingerbread Man",
  };
  const TYPES = Object.keys(LABELS);

  function characterSVG(type, face) {
    return `<svg class="char-svg char-${type}" viewBox="0 -8 200 308" xmlns="http://www.w3.org/2000/svg">
      <g class="char-body">${bodies[type](face)}</g>
      <g class="char-head">${heads[type](face)}</g>
    </svg>`;
  }

  function character(type, face, opts = {}) {
    const el = document.createElement("div");
    el.className = `char char--${type}` + (opts.className ? " " + opts.className : "");
    el.innerHTML = characterSVG(type, face) +
      (opts.label === false ? "" : `<div class="char-label">${opts.label || LABELS[type]}</div>`);
    return el;
  }

  // Just a head with a Santa hat (or another hat) — for avatars and falling faces.
  function hatHead(face, type = "santa") {
    const vb = type === "reindeer" ? "20 -6 160 170" : "20 -6 160 200";
    return `<svg class="hat-head" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${heads[type](face)}</svg>`;
  }

  // ---------- side-on flying reindeer + sleigh, for the flyover ----------
  function flyingReindeer(face, lead) {
    const b = { x: 132, y: 6, w: 70, h: 84 };
    const nx = b.x + (face.nose ? face.nose[0] : 0.5) * b.w;
    const ny = b.y + (face.nose ? face.nose[1] : 0.58) * b.h;
    return `<svg class="fly-deer" viewBox="0 -30 220 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 96 L60 96" stroke="#f4c430" stroke-width="3"/>
      <g class="legs-back" stroke="#7a4d24" stroke-width="10" stroke-linecap="round" fill="none">
        <path d="M54 118 L36 138 L18 136"/><path d="M66 120 L56 146 L40 152"/></g>
      <g class="legs-front" stroke="#7a4d24" stroke-width="10" stroke-linecap="round" fill="none">
        <path d="M122 118 L146 132 L162 124"/><path d="M110 122 L128 146 L146 146"/></g>
      <ellipse cx="90" cy="102" rx="60" ry="28" fill="#8b5a2b"/>
      <ellipse cx="92" cy="114" rx="42" ry="12" fill="#d9b48f"/>
      <path d="M30 92 Q14 80 20 70 Q30 82 38 86Z" fill="#fff"/>
      <path d="M60 80 Q90 96 120 80" stroke="#d42426" stroke-width="8" fill="none"/>
      <circle cx="74" cy="90" r="5" fill="url(#ss-gold)"/><circle cx="90" cy="92" r="5" fill="url(#ss-gold)"/><circle cx="106" cy="90" r="5" fill="url(#ss-gold)"/>
      <path d="M128 92 Q148 74 160 54" stroke="#8b5a2b" stroke-width="28" stroke-linecap="round" fill="none"/>
      <g stroke="#6b4423" stroke-width="6" stroke-linecap="round" fill="none">
        <path d="M150 16 C144 -2 136 -10 126 -22"/><path d="M140 0 L124 -2"/>
        <path d="M184 16 C190 -2 198 -10 208 -22"/><path d="M194 0 L210 -2"/></g>
      <ellipse cx="167" cy="48" rx="38" ry="46" fill="#8b5a2b"/>
      ${faceImg(face, b)}
      ${lead ? `<circle class="nose" cx="${nx}" cy="${ny}" r="7" fill="url(#ss-nose)"/>` : ""}
    </svg>`;
  }

  function sleigh(face) {
    return `<svg class="fly-sleigh" viewBox="0 -76 300 276" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 92 Q8 40 50 30 Q92 24 96 80Z" fill="#a8743f"/>
      <rect x="30" y="34" width="22" height="20" fill="#1e6fd9" transform="rotate(-14 41 44)"/>
      <rect x="58" y="30" width="20" height="24" fill="#1f8a3b" transform="rotate(10 68 42)"/>
      <path d="M41 34 v20 M30 44 h22" stroke="#f4c430" stroke-width="3" transform="rotate(-14 41 44)"/>
      <g transform="translate(76 -64) scale(.8)">
        <path d="M60 150 Q46 200 48 230 L152 230 Q154 200 140 150 Q100 138 60 150Z" fill="#d42426"/>
        <rect x="92" y="150" width="16" height="80" fill="#fff"/>
        <path d="M136 162 Q170 140 196 118" stroke="#c81d25" stroke-width="22" stroke-linecap="round" fill="none"/>
        <circle cx="200" cy="112" r="12" fill="#1d1d1d"/>
        ${heads.santa(face)}
      </g>
      <path d="M262 100 L300 112" stroke="#f4c430" stroke-width="3"/>
      <path d="M20 96 L236 96 Q262 96 262 70 L272 64 Q284 110 248 146 L64 146 Q22 146 20 96Z" fill="#b3161b" stroke="url(#ss-gold)" stroke-width="5"/>
      <path d="M60 118 Q100 106 140 118 Q180 130 220 118" stroke="#f4c430" stroke-width="3" fill="none"/>
      <g stroke="url(#ss-gold)" stroke-width="5" fill="none" stroke-linecap="round">
        <path d="M80 146 L76 172"/><path d="M200 146 L204 172"/>
        <path d="M14 172 L246 172 Q282 172 284 140 Q286 124 272 124"/></g>
    </svg>`;
  }

  // Face with nothing on it, for when a person has no photo yet.
  function placeholderFace(name) {
    const initials = (name || "?").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360"><ellipse cx="150" cy="180" rx="132" ry="165" fill="#f1c9a5"/><text x="150" y="215" font-family="Arial" font-weight="700" font-size="110" text-anchor="middle" fill="#8b1e2b">${initials}</text></svg>`;
    return { id: "placeholder", src: "data:image/svg+xml;utf8," + encodeURIComponent(svg), skin: "#f1c9a5", nose: [0.5, 0.58] };
  }

  window.Characters = { TYPES, LABELS, character, characterSVG, hatHead, flyingReindeer, sleigh, placeholderFace };
})();

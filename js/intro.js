// The intro "video": scenes timed to "The EP Lads Christmas Meal" (102s, ~78 bpm).
// Each scene has a start/end time in seconds; cues fire once when the song reaches them.
// The intro only finishes when the song itself ends, so the whole track always plays.
(function () {
  const C = window.Characters;
  const BEAT = 60 / 78;
  const FALLBACK_LENGTH = 102; // used only if the song can't play (no sound allowed)

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  const TURKEY = `
    <svg class="turkey" viewBox="0 0 200 120" aria-hidden="true">
      <ellipse cx="100" cy="100" rx="96" ry="18" fill="#e9eef5" stroke="#b9c4d2" stroke-width="3"/>
      <ellipse cx="100" cy="70" rx="62" ry="38" fill="#b8692a"/>
      <ellipse cx="88" cy="56" rx="34" ry="16" fill="#d88a45" opacity=".8"/>
      <path d="M44 74 Q22 60 20 42" stroke="#b8692a" stroke-width="18" stroke-linecap="round" fill="none"/>
      <path d="M156 74 Q178 60 180 42" stroke="#b8692a" stroke-width="18" stroke-linecap="round" fill="none"/>
      <circle cx="18" cy="36" r="8" fill="#fff"/><circle cx="182" cy="36" r="8" fill="#fff"/>
      <circle cx="40" cy="98" r="8" fill="#2f8f3a"/><circle cx="160" cy="98" r="8" fill="#2f8f3a"/>
      <circle cx="56" cy="104" r="6" fill="#e07b1f"/><circle cx="146" cy="104" r="6" fill="#e07b1f"/>
    </svg>`;

  function createIntro({ audio, stage, caption, progressBar, onDone }) {
    // Each scene casts its own set of different people, so nobody appears twice on screen at once.
    let face;
    const cast = (n) => {
      const fs = window.People.distinct(n);
      let j = 0;
      face = () => fs[j++ % fs.length];
    };

    stage.innerHTML = "";
    stage.style.setProperty("--beat", BEAT + "s");
    const scenes = [];
    const cues = [];
    const scene = (name, start, end) => {
      const s = el(`<div class="scene scene-${name}"></div>`);
      stage.appendChild(s);
      scenes.push({ s, start, end });
      return s;
    };
    const cue = (t, fn) => cues.push({ t, fn, done: false });
    const say = (t, text, pos = "bottom") => cue(t, () => {
      caption.classList.remove("show");
      caption.dataset.pos = pos;
      void caption.offsetWidth;
      caption.textContent = text;
      if (text) caption.classList.add("show");
    });

    // 1. Title (0–8) -------------------------------------------------------
    cast(6);
    const s1 = scene("title", 0, 8);
    const tagline = window.CONFIG.introTagline;
    s1.innerHTML = `
      <h1 class="intro-title">${(() => {
        let i = 0; // letters drop one after another across all the words
        return tagline.split(" ").map((word) =>
          `<span class="word">${[...word].map((ch) => `<span style="--i:${i++}">${ch}</span>`).join("")}</span>`).join(" ");
      })()}</h1>
      <p class="intro-sub">presents…</p>
      <div class="hill-heads"></div>`;
    const hill = s1.querySelector(".hill-heads");
    for (let i = 0; i < 6; i++) {
      hill.appendChild(el(`<div class="hill-head" style="--i:${i}">${C.hatHead(face(), i % 3 === 1 ? "elf" : "santa")}</div>`));
    }
    cue(0.2, () => s1.classList.add("go"));
    cue(4.2, () => s1.classList.add("heads"));

    // 2. Sleigh flyover (8–18) ---------------------------------------------
    cast(4);
    const s2 = scene("sleigh", 8, 18);
    const train = el(`<div class="train"></div>`);
    train.insertAdjacentHTML("beforeend", C.sleigh(face()));
    for (let i = 0; i < 3; i++) train.insertAdjacentHTML("beforeend", C.flyingReindeer(face(), i === 2));
    s2.appendChild(train);
    say(8.5, "Santa's on his way…");
    say(13.5, "…with a very special sleigh crew");

    // 3. Grinch peeks in (18–23) -------------------------------------------
    cast(1);
    const s3 = scene("peek", 18, 23);
    s3.appendChild(C.character("grinch", face(), { label: false, className: "peeker" }));
    say(18.3, "But someone's up to no good…");

    // 4. Santa / Grinch / Scrooge (23–33) ----------------------------------
    cast(3);
    const s4 = scene("trio", 23, 33);
    const trio = [
      ["santa", "Ho ho ho!"],
      ["grinch", "I HATE Christmas!"],
      ["scrooge", "Bah! Humbug!"],
    ].map(([type, line], i) => {
      const c = C.character(type, face(), { className: "trio-" + i });
      c.insertAdjacentHTML("beforeend", `<div class="bubble">${line}</div>`);
      s4.appendChild(c);
      return c;
    });
    say(23.05, "");
    cue(23.1, () => window.FX.confetti(innerWidth / 2, innerHeight * 0.3, 80));
    cue(24.6, () => trio[0].classList.add("talk"));
    cue(27.2, () => trio[1].classList.add("talk"));
    cue(29.8, () => trio[2].classList.add("talk"));

    // 5. Naughty or nice list (33–45) --------------------------------------
    // Everyone with a photo is on the list (one photo each), naughty or nice at random.
    const listed = shuffle(window.People.everyone);
    let verdicts = listed.map(() => (Math.random() < 0.5 ? "NAUGHTY" : "NICE"));
    if (listed.length > 1 && new Set(verdicts).size === 1) verdicts[0] = verdicts[0] === "NICE" ? "NAUGHTY" : "NICE";
    const s5 = scene("list", 33, 45);
    s5.innerHTML = `<div class="scroll"><h2>Santa's List</h2><div class="list-grid"></div></div>`;
    const grid = s5.querySelector(".list-grid");
    const gap = Math.min(1.2, 9.4 / Math.max(listed.length, 1)); // all stamped before the scene ends
    listed.forEach((person, i) => {
      const v = verdicts[i];
      const e = el(`<div class="entry"><img src="${window.People.randomPhotoOf(person).src}" alt=""><span class="entry-name">${person}</span><span class="stamp stamp--${v.toLowerCase()}">${v}</span></div>`);
      grid.appendChild(e);
      cue(34.2 + i * gap, () => e.classList.add("on"));
    });
    say(33.4, "Santa's checking his list…", "top");
    say(39.5, "…and checking it twice", "top");

    // 6. The gang dances (45–55) -------------------------------------------
    cast(4);
    const s6 = scene("party", 45, 55);
    ["reindeer", "elf", "snowman", "gingerbread"].forEach((type, i) => {
      const c = C.character(type, face(), { className: "dancer" });
      c.style.setProperty("--i", i);
      s6.appendChild(c);
    });
    say(45.3, "…and the whole gang's here!", "top");

    // 7. The Christmas meal (55–67) ----------------------------------------
    cast(5);
    const s7 = scene("meal", 55, 67);
    s7.innerHTML = `<div class="diners"></div><div class="table">${TURKEY}<div class="bang">BANG!</div></div>`;
    const diners = s7.querySelector(".diners");
    ["elf", "santa", "reindeer", "snowman", "gingerbread"].forEach((type, i) => {
      const c = C.character(type, face(), { label: false, className: "diner" });
      c.style.setProperty("--i", i);
      diners.appendChild(c);
    });
    say(55.3, "Christmas dinner with the lads…", "top");
    say(60.5, "Who's pulling the cracker?!", "top");
    cue(62.8, () => {
      s7.classList.add("banged");
      const r = s7.querySelector(".table").getBoundingClientRect();
      window.FX.confetti(r.left + r.width / 2, r.top, 160);
    });

    // 8. Grinch nicks the presents (67–76) ---------------------------------
    cast(5);
    const s8 = scene("chase", 67, 76);
    [["grinch", 0], ["santa", 1.3], ["elf", 2.0], ["reindeer", 2.7], ["snowman", 3.4]].forEach(([type, delay]) => {
      const c = C.character(type, face(), { label: false, className: "runner" });
      c.style.setProperty("--delay", delay + "s");
      s8.appendChild(c);
    });
    say(67.3, "Oi! Bring back the presents!", "top");

    // 9. Tree of faces (76–86) ---------------------------------------------
    cast(9);
    const s9 = scene("tree", 76, 86);
    s9.innerHTML = `
      <div class="tree">
        <svg viewBox="0 0 400 480" class="tree-svg">
          <polygon class="tree-star" points="200,6 214,44 254,44 222,68 234,106 200,84 166,106 178,68 146,44 186,44" fill="url(#ss-gold)"/>
          <path d="M200 70 L300 190 L260 190 L340 300 L290 300 L380 420 L20 420 L110 300 L60 300 L140 190 L100 190Z" fill="#1d6b35"/>
          <path d="M200 70 L300 190 L260 190 L340 300 L290 300 L380 420 L200 420Z" fill="#165a2c"/>
          <path d="M120 200 Q200 240 290 186 M90 310 Q200 350 320 296" stroke="#f4c430" stroke-width="5" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>
          <rect x="176" y="420" width="48" height="50" fill="#6b4423"/>
        </svg>
        <div class="baubles"></div>
      </div>`;
    const spots = [
      [50, 33], [37, 49], [63, 47], [28, 66], [50, 63], [72, 66], [24, 83], [50, 81], [76, 83],
    ];
    const baubles = s9.querySelector(".baubles");
    spots.forEach(([x, y], i) => {
      const b = el(`<div class="bauble" style="left:${x}%;top:${y}%"><img src="${face().src}" alt=""></div>`);
      baubles.appendChild(b);
      cue(76.6 + i * 0.75, () => b.classList.add("on"));
    });
    cue(84.4, () => {
      s9.classList.add("lit");
      const r = s9.querySelector(".tree-star").getBoundingClientRect();
      window.FX.firework(r.left + r.width / 2, r.top + r.height / 2);
    });
    say(76.4, "Every single one of you…");

    // 10. Finale (86 → end of song) ----------------------------------------
    cast(7);
    const s10 = scene("finale", 86, 999);
    s10.innerHTML = `<h1 class="finale-title">${window.CONFIG.eventTitle}</h1><div class="lineup"></div>`;
    const lineup = s10.querySelector(".lineup");
    ["grinch", "elf", "santa", "reindeer", "scrooge", "snowman", "gingerbread"].forEach((type, i) => {
      const c = C.character(type, face(), { label: false, className: "liner" });
      c.style.setProperty("--i", i);
      lineup.appendChild(c);
    });
    say(86.1, "…it's Secret Santa time!", "mid");
    say(94, "Merry Christmas, lads! 🎄", "mid");
    cue(86.2, () => window.FX.confetti(innerWidth / 2, innerHeight * 0.4, 200));
    for (let t = 87; t < 100.5; t += BEAT * 2) cue(t, () => window.FX.firework());

    // ---------- clock ----------
    let raf = 0, finished = false, clockStart = 0, useClock = false;
    const length = () => (useClock || !isFinite(audio.duration) ? FALLBACK_LENGTH : audio.duration);
    const now = () => (useClock ? (performance.now() - clockStart) / 1000 : audio.currentTime);

    function tick() {
      const t = now();
      for (const c of cues) if (!c.done && t >= c.t) { c.done = true; c.fn(); }
      for (const sc of scenes) sc.s.classList.toggle("on", t >= sc.start && t < sc.end);
      progressBar.style.width = Math.min(100, (t / length()) * 100) + "%";
      // With sound, we wait for the song's own "ended" event so every second plays.
      if (useClock && t >= FALLBACK_LENGTH) return finish();
      raf = requestAnimationFrame(tick);
    }
    function finish() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      caption.classList.remove("show");
      onDone();
    }

    return {
      async play() {
        window.FX.setSnow(1.4);
        audio.loop = false;
        audio.currentTime = 0;
        audio.onended = finish;
        try {
          await audio.play();
        } catch (e) {
          // No sound allowed / file missing: run the animation on a timer instead.
          useClock = true;
          clockStart = performance.now();
        }
        raf = requestAnimationFrame(tick);
      },
      skip() {
        audio.pause();
        finish();
      },
    };
  }

  window.createIntro = createIntro;
})();

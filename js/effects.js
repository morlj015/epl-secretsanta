// Snowfall, confetti and fireworks on two full-screen canvases.
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fitCanvas(c) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---------- snow ----------
  const snow = document.getElementById("snow");
  const sctx = snow.getContext("2d");
  let flakes = [];
  let snowRate = 1; // 0..2, intro can make it heavier

  function makeFlake(top) {
    return {
      x: Math.random() * innerWidth,
      y: top ? -10 : Math.random() * innerHeight,
      r: Math.random() * 2.6 + 0.8,
      vy: Math.random() * 0.8 + 0.4,
      drift: Math.random() * Math.PI * 2,
      o: Math.random() * 0.5 + 0.5,
    };
  }
  function resetSnow() {
    fitCanvas(snow);
    const n = Math.round((innerWidth * innerHeight) / 9000);
    flakes = Array.from({ length: Math.min(n, 220) }, () => makeFlake(false));
  }
  function drawSnow() {
    sctx.clearRect(0, 0, innerWidth, innerHeight);
    sctx.fillStyle = "#fff";
    for (const f of flakes) {
      f.y += f.vy * snowRate;
      f.drift += 0.01;
      f.x += Math.sin(f.drift) * 0.4 * snowRate;
      if (f.y > innerHeight + 5) Object.assign(f, makeFlake(true));
      sctx.globalAlpha = f.o;
      sctx.beginPath();
      sctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      sctx.fill();
    }
    sctx.globalAlpha = 1;
  }

  // ---------- confetti + fireworks ----------
  const fx = document.getElementById("fx");
  const fctx = fx.getContext("2d");
  let parts = [];
  const COLORS = ["#d42426", "#f4c430", "#1f8a3b", "#ffffff", "#ff7a7a", "#7ad1ff"];

  function confetti(x = innerWidth / 2, y = innerHeight / 2, n = 140) {
    if (reduced) n = 30;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * 9 + 3;
      parts.push({
        kind: "confetti", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6,
        w: Math.random() * 8 + 5, h: Math.random() * 5 + 3, rot: Math.random() * 6, vr: Math.random() * 0.3 - 0.15,
        c: COLORS[(Math.random() * COLORS.length) | 0], life: 1, decay: 0.006 + Math.random() * 0.006,
      });
    }
  }
  function firework(x, y) {
    x = x ?? innerWidth * (0.15 + Math.random() * 0.7);
    y = y ?? innerHeight * (0.12 + Math.random() * 0.35);
    const c = COLORS[(Math.random() * COLORS.length) | 0];
    const n = reduced ? 20 : 70;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, s = Math.random() * 3 + 2.5;
      parts.push({ kind: "spark", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, c, life: 1, decay: 0.012 + Math.random() * 0.01 });
    }
  }
  function drawFx() {
    fctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.life -= p.decay;
      fctx.globalAlpha = Math.max(p.life, 0);
      fctx.fillStyle = p.c;
      if (p.kind === "confetti") {
        p.vy += 0.25; p.vx *= 0.98; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot);
        fctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
        fctx.restore();
      } else {
        p.vy += 0.05; p.vx *= 0.97; p.vy *= 0.97; p.x += p.vx; p.y += p.vy;
        fctx.beginPath(); fctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); fctx.fill();
      }
    }
    fctx.globalAlpha = 1;
  }

  function loop() {
    drawSnow();
    drawFx();
    requestAnimationFrame(loop);
  }

  resetSnow();
  fitCanvas(fx);
  addEventListener("resize", () => { resetSnow(); fitCanvas(fx); });
  requestAnimationFrame(loop);

  window.FX = {
    confetti, firework,
    setSnow(rate) { snowRate = rate; },
    reduced,
  };
})();

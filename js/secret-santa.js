// Reads the pre-made draw (js/draw.js, made by tools/make_draw.py) and keeps
// this device locked to one person once they've confirmed who they are.
(function () {
  const PAD_CHAR = "\0";

  function fnv1a(text) {
    let h = 0x811c9dc5;
    for (const b of new TextEncoder().encode(text)) {
      h ^= b;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }
  function keystream(seed, n) {
    let x = seed || 0x9e3779b9;
    const out = [];
    for (let i = 0; i < n; i++) {
      x ^= x << 13; x >>>= 0;
      x ^= x >>> 17;
      x ^= x << 5; x >>>= 0;
      out.push(x & 0xff);
    }
    return out;
  }
  const hex8 = (n) => n.toString(16).padStart(8, "0");

  function recipientFor(giver) {
    const D = window.DRAW;
    if (!D) throw new Error("No draw yet. Run: python3 tools/make_draw.py");
    const cipher = D.table[hex8(fnv1a(D.salt + "#" + giver))];
    if (!cipher) throw new Error(`${giver} isn't in the draw. Re-run tools/make_draw.py after changing the names.`);
    const bytes = cipher.match(/../g).map((h) => parseInt(h, 16));
    const ks = keystream(fnv1a(D.salt + "|" + giver), bytes.length);
    const plain = new TextDecoder().decode(new Uint8Array(bytes.map((b, i) => b ^ ks[i])));
    return plain.split(PAD_CHAR)[0];
  }

  // The draw must match the names in config.js.
  function drawMatchesConfig() {
    const D = window.DRAW;
    return !!D && D.roster === hex8(fnv1a(window.CONFIG.participants.slice().sort().join("|")));
  }

  // ---------- device lock ----------
  // Kept in localStorage AND a cookie, so clearing one isn't enough.
  const KEY = "secret-santa-lock-" + ((window.DRAW && window.DRAW.salt) || "none");

  function readLock() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    if (!raw) {
      const m = document.cookie.match(new RegExp("(?:^|; )" + KEY + "=([^;]*)"));
      if (m) raw = decodeURIComponent(m[1]);
    }
    try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function writeLock(lock) {
    const raw = JSON.stringify(lock);
    try { localStorage.setItem(KEY, raw); } catch (e) {}
    document.cookie = `${KEY}=${encodeURIComponent(raw)}; max-age=${60 * 60 * 24 * 120}; path=/; SameSite=Lax`;
  }

  // ---------- shared "who's opened" list (Cloudflare Worker) ----------
  const DEVICE_KEY = "secret-santa-device";
  function deviceId() {
    let id = null;
    try { id = localStorage.getItem(DEVICE_KEY); } catch (e) {}
    if (!id) {
      const m = document.cookie.match(new RegExp("(?:^|; )" + DEVICE_KEY + "=([^;]*)"));
      if (m) id = decodeURIComponent(m[1]);
    }
    if (!id) {
      id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : Array.from({ length: 32 }, () => ((Math.random() * 16) | 0).toString(16)).join("");
    }
    try { localStorage.setItem(DEVICE_KEY, id); } catch (e) {}
    document.cookie = `${DEVICE_KEY}=${encodeURIComponent(id)}; max-age=${60 * 60 * 24 * 120}; path=/; SameSite=Lax`;
    return id;
  }

  const apiBase = () => (window.CONFIG.claimsApi || "").replace(/\/+$/, "");

  async function api(path, options = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    try {
      const res = await fetch(apiBase() + path, { ...options, cache: "no-store", signal: ctrl.signal });
      const body = await res.json().catch(() => ({}));
      return { status: res.status, body };
    } finally {
      clearTimeout(timer);
    }
  }

  // Names already opened by anyone. null = couldn't reach the server.
  async function fetchClaims() {
    if (!apiBase()) return [];
    try {
      const { status, body } = await api("/claims");
      return status === 200 && Array.isArray(body.claimed) ? body.claimed : null;
    } catch (e) {
      return null;
    }
  }

  // Ask the server for this name. Resolves to { ok, reason, name? }.
  async function claim(name) {
    if (!apiBase()) return { ok: true };
    try {
      const { status, body } = await api("/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, device: deviceId() }),
      });
      if (status === 200 && body.ok) return { ok: true };
      return { ok: false, reason: body.reason || "error", name: body.name };
    } catch (e) {
      return { ok: false, reason: "offline" };
    }
  }

  window.SecretSanta = {
    recipientFor,
    drawMatchesConfig,
    fetchClaims,
    claim,
    usesServer: () => !!apiBase(),
    getLock: readLock,
    lockTo(name) {
      const existing = readLock();
      if (existing && existing.name !== name) return existing; // already someone else's device
      const lock = { name, spun: existing ? existing.spun : false, at: Date.now() };
      writeLock(lock);
      return lock;
    },
    markSpun() {
      const lock = readLock();
      if (lock) writeLock({ ...lock, spun: true });
    },
  };
})();

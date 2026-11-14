(function () {
  const C = window.Characters;
  const P = window.People;
  const SS = window.SecretSanta;
  const CFG = window.CONFIG;
  const $ = (id) => document.getElementById(id);
  const audio = $("song");
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  // ---------- fairy lights ----------
  const BULBS = ["#ff3b3b", "#ffd23f", "#3bff6e", "#3bc8ff", "#ff7af0"];
  function hangLights(el, n) {
    el.innerHTML = Array.from({ length: n }, (_, i) =>
      `<span class="bulb" style="--c:${BULBS[i % BULBS.length]};--d:${(i % 3) * -0.4}s"></span>`).join("");
  }
  document.querySelectorAll(".lights").forEach((el) => hangLights(el, 11));
  hangLights(document.querySelector(".garland"), Math.max(10, Math.round(innerWidth / 70)));

  // ---------- screens ----------
  function show(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("is-active", s.id === id));
    document.body.dataset.screen = id;
  }

  // ---------- 1 → 2: gate → intro ----------
  let intro = null;
  function startIntro() {
    show("intro");
    intro = window.createIntro({
      audio, stage: $("stage"), caption: $("caption"), progressBar: $("progressBar"),
      onDone: showEnter,
    });
    intro.play();
  }
  $("startBtn").addEventListener("click", startIntro);
  $("skipGate").addEventListener("click", showEnter);
  $("skipIntro").addEventListener("click", () => intro && intro.skip());

  // ---------- 3: enter box ----------
  function showEnter() {
    window.FX.setSnow(1);
    $("stage").innerHTML = "";
    const peek = $("enterPeekers");
    peek.innerHTML = "";
    const faces = P.distinct(4);
    ["grinch", "santa", "reindeer", "elf"].forEach((type, i) => {
      peek.appendChild(C.character(type, faces[i], { label: false, className: "enter-peek enter-peek--" + i }));
    });
    show("enter");
    setTimeout(() => $("enterBtn").focus({ preventScroll: true }), 400);
  }
  $("replayBtn").addEventListener("click", startIntro);
  $("enterBtn").addEventListener("click", () => {
    const r = $("enterBtn").getBoundingClientRect();
    window.FX.confetti(r.left + r.width / 2, r.top + r.height / 2, 160);
    setTimeout(enterSite, 350);
  });

  // ---------- 4: the site ----------
  let siteStarted = false;
  function enterSite() {
    show("site");
    if (siteStarted) return;
    siteStarted = true;
    $("siteTitle").textContent = CFG.eventTitle;
    buildCorners();
    startFallingFaces();
    startFlyovers();
    startSecretSanta();
  }

  function setStep(id) {
    document.querySelectorAll(".step").forEach((s) => s.classList.toggle("is-active", s.id === id));
  }

  // ---------- background faces: never the same person twice at once ----------
  const onScreen = new Map();
  const claim = (f) => { onScreen.set(f.person, (onScreen.get(f.person) || 0) + 1); return f; };
  const release = (f) => {
    const n = (onScreen.get(f.person) || 1) - 1;
    n > 0 ? onScreen.set(f.person, n) : onScreen.delete(f.person);
  };
  function freeFaces(n) {
    const free = P.everyone.filter((p) => !onScreen.has(p));
    if (free.length < n) return null;
    return P.shuffle(free).slice(0, n).map((p) => claim(P.randomPhotoOf(p)));
  }

  function buildCorners() {
    const sides = [[$("cornerL"), "grinch"], [$("cornerR"), "santa"]];
    const current = new Map();
    for (const [el, type] of sides) {
      const [f] = freeFaces(1) || [P.randomPhotoOf(P.everyone[0])];
      current.set(el, f);
      el.replaceChildren(C.character(type, f, { label: false }));
    }
    setInterval(() => {
      const el = Math.random() < 0.5 ? $("cornerL") : $("cornerR");
      el.classList.add("hide");
      setTimeout(() => {
        release(current.get(el));
        const [f] = freeFaces(1) || [claim(current.get(el))];
        current.set(el, f);
        el.replaceChildren(C.character(pick(C.TYPES), f, { label: false }));
        el.classList.remove("hide");
      }, 900);
    }, 7000);
  }

  function startFallingFaces() {
    if (window.FX.reduced) return;
    const box = $("falling");
    const drop = () => {
      if (document.hidden || document.body.dataset.screen !== "site") return;
      const got = freeFaces(1);
      if (!got) return; // everyone's already on screen somewhere
      const f = got[0];
      const d = document.createElement("div");
      d.className = "faller";
      const size = 44 + Math.random() * 40;
      d.style.cssText = `left:${Math.random() * 100}%;width:${size}px;--dur:${9 + Math.random() * 7}s;--spin:${Math.random() < 0.5 ? -1 : 1}`;
      d.innerHTML = C.hatHead(f, pick(["santa", "santa", "elf", "reindeer", "snowman"]));
      box.appendChild(d);
      d.addEventListener("animationend", () => { release(f); d.remove(); });
    };
    for (let i = 0; i < 3; i++) setTimeout(drop, i * 700);
    setInterval(drop, 1900);
  }

  function startFlyovers() {
    const box = $("flyover");
    const fly = () => {
      if (document.hidden || document.body.dataset.screen !== "site") return;
      const fs = freeFaces(4);
      if (!fs) return;
      const t = document.createElement("div");
      t.className = "train train--site";
      t.style.top = 4 + Math.random() * 18 + "%";
      t.insertAdjacentHTML("beforeend", C.sleigh(fs[0]));
      for (let i = 1; i < 4; i++) t.insertAdjacentHTML("beforeend", C.flyingReindeer(fs[i], i === 3));
      box.appendChild(t);
      t.addEventListener("animationend", () => { fs.forEach(release); t.remove(); });
    };
    setTimeout(fly, 1500);
    setInterval(fly, 16000);
  }

  // ---------- Secret Santa ----------
  function startSecretSanta() {
    if (!window.DRAW) return showError("The draw hasn't been made yet. The organiser needs to run tools/make_draw.py.");
    if (!SS.drawMatchesConfig()) return showError("The names list changed after the draw was made. The organiser needs to run tools/make_draw.py again.");
    const lock = SS.getLock();
    if (lock && CFG.participants.includes(lock.name)) {
      SS.claim(lock.name); // make sure the server knows (quietly)
      return openWheel(lock.name, lock.spun);
    }
    buildPeople();
    setStep("stepPick");
    // Keep the "opened" names up to date while people are choosing.
    refreshClaims();
    setInterval(() => { if ($("stepPick").classList.contains("is-active") && !document.hidden) refreshClaims(); }, 10000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshClaims(); });
  }

  // ---------- names other people have already opened ----------
  let claimed = new Set();
  function setOpened(btn, on) {
    btn.classList.toggle("is-opened", on);
    btn.disabled = on;
    btn.setAttribute("aria-label", on ? `${btn.dataset.name}: already opened` : btn.dataset.name);
  }
  async function refreshClaims() {
    const list = await SS.fetchClaims();
    if (!list) return; // offline: the server still checks when someone confirms
    claimed = new Set(list);
    document.querySelectorAll(".person").forEach((b) => setOpened(b, claimed.has(b.dataset.name)));
  }
  function showNotice(text) {
    const n = $("pickNotice");
    n.textContent = text;
    n.hidden = !text;
  }
  function showError(msg) {
    $("errorText").textContent = msg;
    setStep("stepError");
  }

  function buildPeople() {
    const wrap = $("people");
    wrap.innerHTML = "";
    CFG.participants.forEach((name, i) => {
      const b = document.createElement("button");
      b.className = "person";
      b.dataset.name = name;
      b.style.setProperty("--i", i);
      b.innerHTML = `<span class="person-face">${C.hatHead(P.avatar(name), i % 4 === 3 ? "elf" : "santa")}</span><span class="person-name">${name}</span><span class="opened-stamp" aria-hidden="true">OPENED</span>`;
      setOpened(b, claimed.has(name));
      b.addEventListener("click", () => askConfirm(name));
      wrap.appendChild(b);
    });
  }

  // "are you sure?"
  let pending = null;
  function askConfirm(name) {
    if (claimed.has(name)) return;
    pending = name;
    $("confirmError").textContent = "";
    $("confirmChar").replaceChildren(C.character("grinch", P.avatar(name), { label: false }));
    $("confirmTitle").textContent = `Are you sure you're ${name}?`;
    $("confirmText").textContent = "Once you say yes, this device is locked to you. You won't be able to come back and look at anyone else's.";
    $("confirm").hidden = false;
    requestAnimationFrame(() => $("confirm").classList.add("open"));
    $("confirmYes").focus();
  }
  function closeConfirm() {
    $("confirm").classList.remove("open");
    setTimeout(() => ($("confirm").hidden = true), 250);
  }
  $("confirmNo").addEventListener("click", closeConfirm);
  $("confirm").addEventListener("click", (e) => { if (e.target.id === "confirm") closeConfirm(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("confirm").hidden) closeConfirm(); });
  $("confirmYes").addEventListener("click", async () => {
    const name = pending;
    const yes = $("confirmYes"), no = $("confirmNo");
    yes.disabled = no.disabled = true;
    yes.textContent = "Checking…";
    $("confirmError").textContent = "";
    const res = await SS.claim(name); // the server makes sure nobody else has opened it
    yes.disabled = no.disabled = false;
    yes.textContent = "Yes, it's me!";

    if (res.ok || (res.reason === "device-has-name" && res.name)) {
      closeConfirm();
      const lock = SS.lockTo(res.ok ? name : res.name); // lock this device BEFORE anything is shown
      return openWheel(lock.name, lock.spun);
    }
    if (res.reason === "taken") {
      closeConfirm();
      claimed.add(name);
      document.querySelectorAll(".person").forEach((b) => setOpened(b, claimed.has(b.dataset.name)));
      showNotice(`${name}'s has already been opened on another phone. If that wasn't you, tell the organiser.`);
      return;
    }
    $("confirmError").textContent = "Couldn't reach Santa's workshop 📡 Check your signal and try again.";
  });

  // ---------- the wheel ----------
  const SEG_COLORS = ["#d42426", "#1f8a3b", "#c8961e", "#0f5a26", "#a3141a", "#2a6fb0", "#7a2a8a", "#b8692a", "#16707a", "#8f1015"];
  const WHEEL_R = 200;
  let wheelOrder = [];

  function buildWheel(names) {
    const n = names.length, seg = 360 / n;
    const pt = (deg, r) => {
      const a = (deg * Math.PI) / 180;
      return `${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)}`;
    };
    const faceW = Math.min(70, 360 / n + 14), faceH = faceW * 1.2;
    let svg = `<circle r="${WHEEL_R + 8}" fill="url(#ss-gold)"/>`;
    names.forEach((name, i) => {
      const a0 = i * seg, a1 = (i + 1) * seg, mid = a0 + seg / 2;
      svg += `<path d="M0 0 L${pt(a0, WHEEL_R)} A${WHEEL_R} ${WHEEL_R} 0 0 1 ${pt(a1, WHEEL_R)} Z" fill="${SEG_COLORS[i % SEG_COLORS.length]}" stroke="#fff8ec" stroke-width="3"/>`;
      svg += `<g transform="rotate(${mid})">
        <image href="${P.avatar(name).src}" x="${-faceW / 2}" y="${-WHEEL_R + 10}" width="${faceW}" height="${faceH}" preserveAspectRatio="xMidYMid slice"/>
        <text y="${-WHEEL_R + 26 + faceH}" text-anchor="middle" class="wheel-name">${name}</text>
      </g>`;
    });
    for (let i = 0; i < n; i++) {
      const [x, y] = pt(i * seg, WHEEL_R + 1).split(" ");
      svg += `<circle cx="${x}" cy="${y}" r="5" fill="#fff8ec" stroke="#b8860b" stroke-width="2"/>`;
    }
    svg += `<circle r="52" fill="#fff8ec" stroke="url(#ss-gold)" stroke-width="8"/>`;
    $("wheel").innerHTML = svg;
  }

  function landingAngle(index, n, jitter) {
    const seg = 360 / n;
    return -(index * seg + seg / 2) + jitter * seg * 0.32;
  }

  function openWheel(giver, alreadySpun) {
    setStep("stepWheel");
    const recipient = SS.recipientFor(giver);
    wheelOrder = P.shuffle(CFG.participants.filter((p) => p !== giver));
    buildWheel(wheelOrder);
    fillResult(giver, recipient);
    const step = $("stepWheel");
    step.classList.remove("done", "spinning");
    const wheel = $("wheel");
    if (alreadySpun) {
      $("wheelKicker").textContent = `Welcome back, ${giver}!`;
      wheel.style.transition = "none";
      wheel.style.transform = `rotate(${landingAngle(wheelOrder.indexOf(recipient), wheelOrder.length, 0)}deg)`;
      step.classList.add("done");
      return;
    }
    $("wheelKicker").textContent = `${giver}, spin the wheel!`;
    wheel.style.transition = "none";
    wheel.style.transform = "rotate(0deg)";
    $("spinBtn").disabled = false;
    $("spinBtn").onclick = () => spin(giver, recipient);
  }

  function fillResult(giver, recipient) {
    $("revealName").textContent = recipient;
    $("revealInfo").textContent = "Keep it secret! 🤫";
    $("lockedNote").textContent = `🔒 This device is locked to ${giver}.`;
    const type = pick(["santa", "elf", "reindeer", "snowman", "gingerbread", "scrooge", "grinch"]);
    $("revealChar").replaceChildren(C.character(type, P.avatar(recipient), { label: false }));
  }

  // little "tick" as each segment passes the pointer
  let actx = null;
  function tick() {
    const ptr = $("wheelPointer");
    ptr.classList.remove("tick");
    void ptr.offsetWidth;
    ptr.classList.add("tick");
    if (!actx) return;
    const o = actx.createOscillator(), g = actx.createGain();
    o.frequency.value = 1400;
    g.gain.setValueAtTime(0.06, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.04);
    o.connect(g).connect(actx.destination);
    o.start();
    o.stop(actx.currentTime + 0.05);
  }

  function spin(giver, recipient) {
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    const btn = $("spinBtn");
    btn.disabled = true;
    const step = $("stepWheel");
    step.classList.add("spinning");
    $("wheelKicker").textContent = "Round and round it goes…";

    const n = wheelOrder.length, seg = 360 / n;
    const target = 360 * 7 + landingAngle(wheelOrder.indexOf(recipient), n, Math.random() * 2 - 1);
    const wheel = $("wheel");
    const DURATION = window.FX.reduced ? 1.2 : 6.5;
    void wheel.getBoundingClientRect();
    wheel.style.transition = `transform ${DURATION}s cubic-bezier(.12,.62,.08,1)`;
    wheel.style.transform = `rotate(${target}deg)`;

    let last = -1, done = false;
    const watch = () => {
      if (done) return;
      const m = getComputedStyle(wheel).transform;
      if (m && m !== "none") {
        const [a, b] = m.slice(m.indexOf("(") + 1, -1).split(",").map(parseFloat);
        const deg = (Math.atan2(b, a) * 180) / Math.PI;
        const under = Math.floor((((-deg % 360) + 360) % 360) / seg);
        if (under !== last) { if (last !== -1) tick(); last = under; }
      }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);

    const finish = () => {
      if (done) return;
      done = true;
      SS.markSpun();
      step.classList.remove("spinning");
      step.classList.add("done");
      $("wheelKicker").textContent = `Ho ho ho, ${giver}!`;
      const r = $("wheelWrap").getBoundingClientRect();
      window.FX.confetti(r.left + r.width / 2, r.top + r.height * 0.4, 200);
      setTimeout(() => window.FX.firework(r.left + r.width * 0.15, r.top + 40), 300);
      setTimeout(() => window.FX.firework(r.left + r.width * 0.85, r.top + 40), 650);
      setTimeout(() => $("result").scrollIntoView({ behavior: "smooth", block: "center" }), 600);
    };
    wheel.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, DURATION * 1000 + 400); // in case transitionend doesn't fire
  }

  // ---------- music on the site ----------
  $("musicBtn").addEventListener("click", () => {
    const on = audio.paused;
    if (on) { audio.loop = true; audio.play().catch(() => {}); } else audio.pause();
    $("musicBtn").setAttribute("aria-pressed", String(on));
    $("musicBtn").classList.toggle("on", on);
  });
  audio.addEventListener("pause", () => { $("musicBtn").classList.remove("on"); $("musicBtn").setAttribute("aria-pressed", "false"); });

  document.body.dataset.screen = "gate";
  // Shortcuts while editing: ?skip goes to the "Enter Site" box, ?site goes straight in.
  if (location.search.includes("skip")) showEnter();
  if (location.search.includes("site")) enterSite();
})();

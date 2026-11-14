// Groups the face photos by person, so we never show the same person twice at once.
(function () {
  const byPerson = {};
  for (const f of window.FACES) (byPerson[f.person] = byPerson[f.person] || []).push(f);
  const everyone = Object.keys(byPerson);

  const rand = (a) => a[(Math.random() * a.length) | 0];
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  window.People = {
    everyone,
    shuffle,
    // One random photo each of `n` different people. Only repeats someone if
    // `n` is bigger than the number of people we have photos of.
    distinct(n, exclude = []) {
      let pool = shuffle(everyone.filter((p) => !exclude.includes(p)));
      if (!pool.length) pool = shuffle(everyone);
      if (!pool.length) return Array.from({ length: n }, () => window.Characters.placeholderFace("?"));
      const out = [];
      for (let i = 0; i < n; i++) out.push(rand(byPerson[pool[i % pool.length]]));
      return out;
    },
    // The photo used for someone on the name list / wheel / reveal.
    avatar(name) {
      const id = (window.CONFIG.avatars || {})[name];
      return window.FACES.find((f) => f.id === id) || (byPerson[name] || [])[0] || window.Characters.placeholderFace(name);
    },
    randomPhotoOf(name) {
      return byPerson[name] ? rand(byPerson[name]) : window.Characters.placeholderFace(name);
    },
  };
})();

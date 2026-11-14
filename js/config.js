// =====================================================================
//  EDIT ME: the settings you'll want to change are in this file.
// =====================================================================
window.CONFIG = {
  eventTitle: "Secret Santa 2026",
  introTagline: "A Very Lads Christmas",

  // Who's in the draw. Names must match the face file names in assets/faces
  // (alfie01.png -> "Alfie"). Anyone with a face file but NOT listed here
  // (e.g. Billy, Alfie) still appears in the intro but can't be picked.
  // ⚠ If you change this list, re-run: python3 tools/make_draw.py
  participants: ["Charlie", "Dan", "Flynn", "Harry", "Max", "Noah", "Yacs"],

  // Server that remembers which names have been opened, so each name
  // can only be opened once across everyone's phones. Leave "" to turn off.
  claimsApi: "https://epl-secretsanta-claims.epl-lads-santa.workers.dev",

  // Which photo to use for each person on the name list and the wheel.
  // Anyone not listed uses their first photo (e.g. alfie01).
  avatars: {
    // Dan: "dan02",
  },
};

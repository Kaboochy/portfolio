// ======= Simple Portfolio Game =======
// - WASD movement
// - Idle / Run animation using spritesheets
// - Stations (projects) open a modal when you press E nearby
// - About panel toggle
//
// Your spritesheets (based on provided sizes):
// Idle: 512x32 => 16 frames of 32x32
// Run : 256x32 => 8 frames of 32x32

const gameEl = document.getElementById("game");
const worldEl = document.getElementById("world");
const playerEl = document.getElementById("player");
const hintEl = document.getElementById("hint");

const modalBackdrop = document.getElementById("modalBackdrop");
const btnCloseModal = document.getElementById("btnCloseModal");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalDescription = document.getElementById("modalDescription");
const modalBullets = document.getElementById("modalBullets");
const modalTech = document.getElementById("modalTech");
const modalLinks = document.getElementById("modalLinks");
const modalMedia = document.getElementById("modalMedia");

const aboutPanel = document.getElementById("aboutPanel");
const btnAbout = document.getElementById("btnAbout");
const btnCloseAbout = document.getElementById("btnCloseAbout");

// ---- Config
const WORLD_W = 1400;
const WORLD_H = 900;

const PLAYER = {
  x: 140,
  y: 220,
  speed: 260,      // pixels/sec
  facing: 1,       // 1 = right, -1 = left
  width: 52,       // collision size (not sprite size)
  height: 44,
  state: "idle",
};

// Sprite animation config (frame size is 32x32, rendered as 64x64 by CSS)
const SPRITES = {
  idle: {
    url: "assets/greenDinoIdle1.png",
    frameW: 32,
    frameH: 32,
    frames: 16,
    fps: 12,
  },
  run: {
    url: "assets/greenDinoRun1.png",
    frameW: 32,
    frameH: 32,
    frames: 8,
    fps: 14,
  }
};

// Project stations
const PROJECTS = [
  {
    id: "zenog",
    title: "2D High Score Game",
    subtitle: "Tight movement + sprite sheets + enemy AI",
    x: 300, y: 240,
    w: 150, h: 120,
    description:
      "A fast, responsive 2D game focused on player-feel, cutscenes, and clean collisions.",
    bullets: [
      "Implemented movement system (accel/decel, coyote time, jump buffering).",
      "Built an animation controller + state machine for run/jump/attack.",
      "Designed a scaling system to increase the challenge."
    ],
    tech: ["XNA Framework", "C#", "Aseprite", "Git"],
    links: [
      { label: "GitHub Repo", href: "https://github.com/Kaboochy/SchoolZenog" },
      { label: "Playable Build", href: "https://YOUR_ITCH_IO_PAGE" }
    ],
    media: {
      type: "iframe",
      // use embed for iframe:
      src: "https://www.youtube.com/embed/onYZIVCZa5M"
    }
  },

  {
    id: "project-kaos",
    title: "Project Kaos",
    subtitle: "Home-made animations, assets, and gameplay",
    x: 600, y: 240,
    w: 150, h: 95,
    description:
      "Project Kaos is a first-person action RPG following Zy as he fights to reunite the city of Zenog by defeating the power of Kaos magic.",
    bullets: [
      "Motion-captured animations using Xbox Kinect.",
      "Created original assets in Blender.",
      "Built gameplay using Unreal Engine Blueprints."
    ],
    tech: ["Unreal Engine", "Blueprints", "Blender", "FPS"],
    links: [
      { label: "Project Site", href: "https://sites.google.com/k12.friscoisd.org/projectkaos/home" }
    ],
    media: null
  },

  {
    id: "blue-car",
    title: "Blue Car",
    subtitle: "Optimization, game feel, rendering",
    x: 500, y: 440,
    w: 150, h: 95,
    description:
      "A downhill racing time-trial game optimized to run smoothly in Chrome on itch.io.",
    bullets: [
      "Created and animated custom assets in Maya.",
      "Programmed gameplay in Unity using C#.",
      "Optimized rendering and lighting for browser performance."
    ],
    tech: ["Unity", "C#", "Maya", "WebGL"],
    links: [
      { label: "itch.io Page", href: "https://kaboochy.itch.io/" }
    ],
    media: null
  }
];


// ---- Input
const keys = new Set();
let justPressedE = false;

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  keys.add(k);
  if (k === "e") justPressedE = true;

  // prevent page scrolling when pressing WASD
  if (["w","a","s","d"," "].includes(k)) e.preventDefault();

  // ESC closes modal/panel
  if (k === "escape") {
    closeModal();
    closeAbout();
  }
}, { passive: false });

window.addEventListener("keyup", (e) => {
  keys.delete(e.key.toLowerCase());
});

// ---- Build world bounds visually (optional simple “walls”)
worldEl.style.width = WORLD_W + "px";
worldEl.style.height = WORLD_H + "px";

// Create stations
const stationEls = new Map();
for (const p of PROJECTS) {
  const el = document.createElement("div");
  el.className = "station";
  el.style.left = p.x + "px";
  el.style.top = p.y + "px";
  el.style.width = p.w + "px";
  el.style.height = p.h + "px";

  el.innerHTML = `
    <div class="stationTitle">${p.title}</div>
    <div class="stationSub">${p.subtitle}</div>
    <div class="stationPrompt">Press E</div>
  `;

  worldEl.appendChild(el);
  stationEls.set(p.id, el);
}

// ---- About panel
btnAbout.addEventListener("click", () => {
  aboutPanel.classList.add("open");
});
btnCloseAbout.addEventListener("click", closeAbout);

function closeAbout() {
  aboutPanel.classList.remove("open");
}

// ---- Modal
btnCloseModal.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

function openModal(project) {
  modalTitle.textContent = project.title;
  modalSubtitle.textContent = project.subtitle;
  modalDescription.textContent = project.description;

  // bullets
  modalBullets.innerHTML = "";
  for (const b of project.bullets) {
    const li = document.createElement("li");
    li.textContent = b;
    modalBullets.appendChild(li);
  }

  // tech chips
  modalTech.innerHTML = "";
  for (const t of project.tech) {
    const li = document.createElement("li");
    li.textContent = t;
    modalTech.appendChild(li);
  }

  // links
  modalLinks.innerHTML = "";
  for (const l of project.links) {
    const a = document.createElement("a");
    a.className = "btn";
    a.href = l.href;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = l.label;
    modalLinks.appendChild(a);
  }

  // media (optional)
  modalMedia.innerHTML = "";
  if (project.media?.type === "img") {
    const img = document.createElement("img");
    img.src = project.media.src;
    img.alt = project.title + " screenshot";
    img.style.width = "100%";
    img.style.display = "block";
    img.style.borderRadius = "12px";
    modalMedia.appendChild(img);
  } else if (project.media?.type === "iframe") {
    const iframe = document.createElement("iframe");
    iframe.src = project.media.src;
    iframe.title = project.title + " video";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.style.width = "100%";
    iframe.style.height = "260px";
    iframe.style.border = "0";
    iframe.style.borderRadius = "12px";
    modalMedia.appendChild(iframe);
  } else {
    const ph = document.createElement("div");
    ph.className = "mediaPlaceholder";
    ph.textContent = "Add a screenshot, GIF, or short video here later.";
    modalMedia.appendChild(ph);
  }

  modalBackdrop.classList.add("open");
  modalBackdrop.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modalBackdrop.classList.remove("open");
  modalBackdrop.setAttribute("aria-hidden", "true");
}

// ---- Sprite animation state
let animTime = 0;
let currentFrame = 0;

function setPlayerSprite(state) {
  const s = SPRITES[state];
  playerEl.style.backgroundImage = `url("${s.url}")`;

  // Background size: sheet width scaled automatically, keep height = 100%
  // We'll shift background-position-x by frame index.
  // Because our CSS scales sprite to 64x64 while frame is 32x32,
  // the background-position uses the rendered size. We’ll compute using element width.
}

function updateSprite(dt) {
  const state = PLAYER.state;
  const s = SPRITES[state];

  // Setup sprite sheet
  if (!playerEl.dataset.sprite || playerEl.dataset.sprite !== state) {
    playerEl.dataset.sprite = state;
    animTime = 0;
    currentFrame = 0;
    setPlayerSprite(state);
  }

  // Advance animation
  animTime += dt;
  const frameDuration = 1 / s.fps;
  while (animTime >= frameDuration) {
    animTime -= frameDuration;
    currentFrame = (currentFrame + 1) % s.frames;
  }

  // Compute rendered frame width in pixels (on screen).
  const renderedW = playerEl.getBoundingClientRect().width;
  const shiftX = currentFrame * renderedW;

  // Flip sprite by scaling X
  const flip = PLAYER.facing === 1 ? 1 : -1;
  playerEl.style.transform = `translate(-50%, -50%) scaleX(${flip})`;

  // Background positioning to show the correct frame
  playerEl.style.backgroundPosition = `-${shiftX}px 0px`;
  playerEl.style.backgroundSize = `${renderedW * s.frames}px 100%`;
}

// ---- Collision helpers
function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function nearestProjectInRange() {
  // small interaction box around player
  const px = PLAYER.x - PLAYER.width / 2;
  const py = PLAYER.y - PLAYER.height / 2;

  for (const p of PROJECTS) {
    if (aabb(px, py, PLAYER.width, PLAYER.height, p.x, p.y, p.w, p.h)) {
      return p;
    }
  }
  return null;
}

// ---- Camera (scroll world inside the viewport)
function updateCamera() {
  const viewW = gameEl.clientWidth;
  const viewH = gameEl.clientHeight;

  // Center camera on player
  let camX = PLAYER.x - viewW / 2;
  let camY = PLAYER.y - viewH / 2;

  // Clamp camera within world
  camX = Math.max(0, Math.min(camX, WORLD_W - viewW));
  camY = Math.max(0, Math.min(camY, WORLD_H - viewH));

  // Move world opposite camera
  worldEl.style.transform = `translate(${-camX}px, ${-camY}px)`;

  // Optional: make grid “feel alive” by offsetting background
  worldEl.style.backgroundPosition = `0 0, ${-camX}px ${-camY}px, ${-camX}px ${-camY}px`;
}

// ---- Main loop
let last = performance.now();

function tick(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  // Don’t move when modal is open (keeps it clean)
  const modalOpen = modalBackdrop.classList.contains("open");

  if (!modalOpen) {
    let mx = 0, my = 0;
    if (keys.has("a")) mx -= 1;
    if (keys.has("d")) mx += 1;
    if (keys.has("w")) my -= 1;
    if (keys.has("s")) my += 1;

    // Normalize diagonal
    if (mx !== 0 && my !== 0) {
      const inv = 1 / Math.sqrt(2);
      mx *= inv; my *= inv;
    }

    const moving = (mx !== 0 || my !== 0);
    PLAYER.state = moving ? "run" : "idle";

    // Facing direction
    if (mx > 0) PLAYER.facing = 1;
    else if (mx < 0) PLAYER.facing = -1;

    // Move
    PLAYER.x += mx * PLAYER.speed * dt;
    PLAYER.y += my * PLAYER.speed * dt;

    // Keep inside world bounds (simple clamp)
    PLAYER.x = Math.max(20, Math.min(PLAYER.x, WORLD_W - 20));
    PLAYER.y = Math.max(20, Math.min(PLAYER.y, WORLD_H - 20));

    // Interaction
    const near = nearestProjectInRange();
    if (near) {
      hintEl.innerHTML = `Near <b>${near.title}</b> — Press <b>E</b> to open.`;
      if (justPressedE) openModal(near);
    } else {
      hintEl.innerHTML = `Walk with <b>WASD</b>. Approach a project and press <b>E</b> to open.`;
    }
  }

  justPressedE = false;

  // Update player DOM position (in world coordinates)
  playerEl.style.left = PLAYER.x + "px";
  playerEl.style.top = PLAYER.y + "px";

  updateSprite(dt);
  updateCamera();

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

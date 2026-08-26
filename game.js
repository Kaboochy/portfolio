// ======= Portfolio site script =======
// - Dino mascot smoothly follows the mouse cursor (idle/run sprite swap)
// - Project cards are rendered from data and open a modal with details
//
// Idle: 512x32 => 16 frames of 32x32
// Run : 256x32 => 8 frames of 32x32

const dinoEl = document.getElementById("dino");

const modalBackdrop = document.getElementById("modalBackdrop");
const btnCloseModal = document.getElementById("btnCloseModal");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalDescription = document.getElementById("modalDescription");
const modalBullets = document.getElementById("modalBullets");
const modalTech = document.getElementById("modalTech");
const modalLinks = document.getElementById("modalLinks");
const modalMedia = document.getElementById("modalMedia");

const projectsGrid = document.getElementById("projectsGrid");

/* ================= PROJECT DATA ================= */
const PROJECTS = [
  {
    id: "zenog",
    title: "2D High Score Game",
    subtitle: "Made with XNA, sprite sheets, and enemy AI",
    description:
      "A fast, responsive 2D game focused on player-feel, cutscenes, and clean collisions.",
    bullets: [
      "Implemented movement system.",
      "Built an animation controller + state machine for run/jump/attack.",
      "Designed a dynamic enemy system that managed the game's difficulty."
    ],
    tech: ["XNA Framework", "C#", "Aseprite", "Git"],
    links: [
      { label: "GitHub Repo", href: "https://github.com/Kaboochy/SchoolZenog" },
      { label: "Playable Build", href: "https://YOUR_ITCH_IO_PAGE" }
    ],
    media: {
      type: "iframe",
      src: "https://www.youtube.com/embed/onYZIVCZa5M"
    }
  },

  {
    id: "project-kaos",
    title: "3D Unreal Engine Game",
    subtitle: "Home-made animations, assets, and gameplay",
    description:
      "Project Kaos is a first-person action RPG following Zy as he fights to reunite the city of Zenog by defeating the power of Kaos magic.",
    bullets: [
      "Motion-captured animations using Xbox Kinect.",
      "Lead a team using Scrum and Agile principles.",
      "Built gameplay using Unreal Engine Blueprints."
    ],
    tech: ["Unreal Engine", "Blueprints", "Blender", "FPS"],
    links: [
      { label: "Project Site", href: "https://sites.google.com/k12.friscoisd.org/projectkaos/home" }
    ],
    media: {
      type: "img",
      src: "assets/projectKaosScreenshot.png"
    }
  },

  {
    id: "blue-car",
    title: "Browser-Based Unity Game",
    subtitle: "Optimization, game feel, rendering",
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
    media: {
      type: "iframe",
      src: "https://youtu.be/T2XLLKnBQ3U"
    }
  }
];

/* ================= RENDER PROJECT CARDS ================= */
for (const p of PROJECTS) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "projectCard";
  card.innerHTML = `
    <div class="projectTitle">${p.title}</div>
    <div class="projectSub">${p.subtitle}</div>
    <div class="projectMeta">
      ${p.tech.slice(0, 3).map((t) => `<span>${t}</span>`).join("")}
    </div>
    <div class="projectPrompt">View details →</div>
  `;
  card.addEventListener("click", () => openModal(p));
  projectsGrid.appendChild(card);
}

/* ================= MODAL ================= */
btnCloseModal.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

function toYouTubeEmbed(url) {
  try {
    if (url.includes("youtube.com/embed/")) return url;
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
  } catch {}
  return url;
}

function openModal(project) {
  modalTitle.textContent = project.title;
  modalSubtitle.textContent = project.subtitle;
  modalDescription.textContent = project.description;

  modalBullets.innerHTML = "";
  for (const b of project.bullets) {
    const li = document.createElement("li");
    li.textContent = b;
    modalBullets.appendChild(li);
  }

  modalTech.innerHTML = "";
  for (const t of project.tech) {
    const li = document.createElement("li");
    li.textContent = t;
    modalTech.appendChild(li);
  }

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
    iframe.src = toYouTubeEmbed(project.media.src);
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

/* ================= DINO MASCOT (follows the mouse) ================= */
const SPRITES = {
  idle: { url: "assets/greenDinoIdle1.png", frames: 16, fps: 12 },
  run: { url: "assets/greenDinoRun1.png", frames: 8, fps: 14 },
};

const dino = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  facing: 1,
  state: "idle",
};

const OFFSET_X = -46; // sit to the left of the cursor
const OFFSET_Y = 40;  // sit below the cursor

let targetX = dino.x;
let targetY = dino.y;
let hasMouse = false;

window.addEventListener("mousemove", (e) => {
  targetX = e.clientX + OFFSET_X;
  targetY = e.clientY + OFFSET_Y;
  hasMouse = true;
});

window.addEventListener(
  "touchmove",
  (e) => {
    const t = e.touches[0];
    if (!t) return;
    targetX = t.clientX + OFFSET_X;
    targetY = t.clientY + OFFSET_Y;
    hasMouse = true;
  },
  { passive: true }
);

let animTime = 0;
let currentFrame = 0;

function setDinoSprite(state) {
  const s = SPRITES[state];
  dinoEl.style.backgroundImage = `url("${s.url}")`;
}

function updateDinoSprite(dt) {
  const s = SPRITES[dino.state];

  if (dinoEl.dataset.sprite !== dino.state) {
    dinoEl.dataset.sprite = dino.state;
    animTime = 0;
    currentFrame = 0;
    setDinoSprite(dino.state);
  }

  animTime += dt;
  const frameDuration = 1 / s.fps;
  while (animTime >= frameDuration) {
    animTime -= frameDuration;
    currentFrame = (currentFrame + 1) % s.frames;
  }

  const renderedW = dinoEl.getBoundingClientRect().width;
  const shiftX = currentFrame * renderedW;

  const flip = dino.facing === 1 ? 1 : -1;
  dinoEl.style.transform = `translate(-50%, -50%) scaleX(${flip})`;
  dinoEl.style.backgroundPosition = `-${shiftX}px 0px`;
  dinoEl.style.backgroundSize = `${renderedW * s.frames}px 100%`;
}

const FOLLOW_SPEED = 90; // constant px/sec chase speed
const ARRIVE_DIST = 2;   // snap when this close, avoids jitter

let last = performance.now();

function tick(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (hasMouse) {
    const dx = targetX - dino.x;
    const dy = targetY - dino.y;
    const dist = Math.hypot(dx, dy);

    if (dist > ARRIVE_DIST) {
      const step = Math.min(dist, FOLLOW_SPEED * dt);
      dino.x += (dx / dist) * step;
      dino.y += (dy / dist) * step;
      dino.state = "run";
      if (Math.abs(dx) > 2) dino.facing = dx > 0 ? 1 : -1;
    } else {
      dino.state = "idle";
    }

    dinoEl.style.left = dino.x + "px";
    dinoEl.style.top = dino.y + "px";
    dinoEl.style.opacity = 1;
  } else {
    dinoEl.style.opacity = 0;
  }

  updateDinoSprite(dt);
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

/* ================= FOOTER YEAR ================= */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

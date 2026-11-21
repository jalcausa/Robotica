"use strict";

const readingProgress = document.querySelector("#reading-progress");
const tocLinks = [...document.querySelectorAll(".toc-sidebar .toc-links a")];
const sections = tocLinks.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);

function updateReading() {
  const maximum = document.documentElement.scrollHeight - window.innerHeight;
  readingProgress.style.width = `${maximum > 0 ? (window.scrollY / maximum) * 100 : 100}%`;
  const position = window.scrollY + 140;
  let active = null;
  for (const section of sections) {
    if (section.offsetTop <= position) active = section.id;
  }
  tocLinks.forEach((link) => {
    const selected = active && decodeURIComponent(link.hash.slice(1)) === active;
    link.classList.toggle("is-active", !!selected);
    if (selected) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

window.addEventListener("scroll", updateReading, { passive: true });
window.addEventListener("resize", updateReading);
updateReading();

const studyButtons = [...document.querySelectorAll(".study-check")];
if (studyButtons.length) {
  const storageKey = studyButtons[0].dataset.roadmapKey;
  let route = { marks: {}, pass: {}, days: [], summary: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) route = { ...route, ...saved };
  } catch {}

  const dayKey = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  const syncButtons = () => {
    studyButtons.forEach((button) => {
      const done = route.marks?.[button.dataset.step] === true;
      button.setAttribute("aria-pressed", String(done));
      button.textContent = done ? "✓ Estudiado" : "Marcar como estudiado";
      button.classList.toggle("is-studied", done);
    });
  };
  const showToast = () => {
    let toast = document.querySelector(".study-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "study-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }
    toast.textContent = "¡Paso completado! +100 XP";
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  };

  studyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const step = button.dataset.step;
      const done = route.marks[step] !== true;
      route.marks = { ...route.marks, [step]: done };
      if (done) route.days = [...new Set([...(Array.isArray(route.days) ? route.days : []), dayKey()])].sort();
      try { localStorage.setItem(storageKey, JSON.stringify(route)); } catch {}
      syncButtons();
      if (done) showToast();
    });
  });
  syncButtons();
}

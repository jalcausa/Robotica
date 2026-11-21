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

const tracker = document.querySelector("#study-tracker");
if (tracker) initStudyTracker(tracker);

function initStudyTracker(tracker) {
  const storageKey = tracker.dataset.roadmapKey;
  const pageKey = tracker.dataset.page;
  const studyStep = `study:${pageKey}`;
  const studyMinutes = Number(tracker.dataset.minutes) || 0;
  const indexTitles = new Set(["Índice", "Contenidos de la lección"]);
  const blocks = [...document.querySelectorAll(".notes-body section.level2")]
    .filter((section) => !indexTitles.has(section.querySelector("h2")?.textContent.trim()));
  const studyButtons = [...document.querySelectorAll(".study-check")];
  let route = { marks: {}, pass: {}, days: [], blocks: {}, summary: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) route = { ...route, ...saved };
  } catch {}
  for (const name of ["marks", "pass", "blocks"]) {
    if (!route[name] || typeof route[name] !== "object" || Array.isArray(route[name])) route[name] = {};
  }
  if (!Array.isArray(route.days)) route.days = [];

  const el = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const dayKey = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  const formatTime = (minutes) => {
    const rounded = Math.max(0, Math.round(minutes));
    const hours = Math.floor(rounded / 60);
    return hours ? `~${hours} h ${String(rounded % 60).padStart(2, "0")} min` : `~${rounded} min`;
  };
  const save = () => {
    route.days = [...new Set([...route.days, dayKey()])].sort();
    try { localStorage.setItem(storageKey, JSON.stringify(route)); } catch {}
  };
  const readIds = () => new Set(Array.isArray(route.blocks[pageKey]) ? route.blocks[pageKey] : []);
  const readCount = () => blocks.filter((section) => readIds().has(section.id)).length;
  const track = (percent) => {
    const bar = el("div", "tracker-track");
    const fill = el("span");
    fill.style.width = `${percent}%`;
    bar.append(fill);
    return bar;
  };
  const toast = (text) => {
    let node = document.querySelector(".study-toast");
    if (!node) {
      node = el("div", "study-toast");
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.textContent = text;
    node.classList.add("is-visible");
    window.clearTimeout(toast.timeout);
    toast.timeout = window.setTimeout(() => node.classList.remove("is-visible"), 2600);
  };

  // Progreso de la ruta con lo que dejó guardado la página del test (pesos por paso) y los bloques leídos aquí.
  const routeStats = () => {
    const steps = Array.isArray(route.summary?.steps) ? route.summary.steps : null;
    if (!steps?.length) return null;
    let total = 0;
    let done = 0;
    for (const step of steps) {
      total += step.weight;
      if (route.marks[step.id] === true) done += step.weight;
      else if (step.id.startsWith("study:")) {
        const read = Array.isArray(route.blocks[step.key]) ? route.blocks[step.key].length : 0;
        done += step.weight * Math.min(1, step.total ? read / step.total : 0);
      } else done += step.weight * (step.frac || 0);
    }
    const next = steps.find((step) => route.marks[step.id] !== true);
    return {
      percent: total ? Math.round((done / total) * 100) : 0,
      done: steps.filter((step) => route.marks[step.id] === true).length,
      total: steps.length,
      next,
    };
  };

  const render = () => {
    const read = readCount();
    const studied = route.marks[studyStep] === true;
    const fraction = blocks.length ? read / blocks.length : 0;
    const percent = studied ? 100 : Math.round(fraction * 100);
    tracker.replaceChildren();
    const page = el("div", "tracker-card");
    page.append(el("span", "overline", `TU PROGRESO EN ${pageKey}`));
    const line = el("div", "tracker-line");
    line.append(el("strong", "tracker-percent", `${percent}%`));
    const copy = el("div", "tracker-copy");
    copy.append(el("b", "", studied ? `✓ ${pageKey} estudiado` : `${read} de ${blocks.length} bloques leídos`));
    copy.append(el("span", "", studied ? "Paso completado. Ahora toca el test." : `⏱ ${formatTime(studyMinutes * (1 - fraction))} de estudio restantes`));
    copy.append(track(percent));
    line.append(copy);
    page.append(line);
    page.append(el("p", "tracker-hint", "Al terminar cada bloque, pulsa «Marcar bloque como leído» al final del bloque."));
    const stats = routeStats();
    const routeCard = el("div", "tracker-card tracker-route");
    routeCard.append(el("span", "overline", "RUTA DEL PARCIAL 2"));
    if (stats) {
      const routeLine = el("div", "tracker-line");
      routeLine.append(el("strong", "tracker-percent", `${stats.percent}%`));
      const routeCopy = el("div", "tracker-copy");
      routeCopy.append(el("b", "", `${stats.done} de ${stats.total} pasos`));
      routeCopy.append(el("span", "", stats.next ? `Siguiente: ${stats.next.title}` : "¡Ruta completada!"));
      routeCopy.append(track(stats.percent));
      routeLine.append(routeCopy);
      routeCard.append(routeLine);
    } else {
      routeCard.append(el("p", "tracker-hint", "Abre tu ruta una vez para ver aquí el progreso total del parcial."));
    }
    const actions = el("div", "tracker-actions");
    const routeLink = el("a", "button subtle", "Ver mi ruta ↗");
    routeLink.href = tracker.dataset.routeUrl;
    actions.append(routeLink);
    if (studied) {
      const quizLink = el("a", "button primary", `Hacer el test de ${pageKey} →`);
      quizLink.href = tracker.dataset.routeUrl;
      actions.prepend(quizLink);
    }
    routeCard.append(actions);
    tracker.append(page, routeCard);

    let companions = [];
    try { companions = JSON.parse(tracker.dataset.companions || "[]"); } catch {}
    if (companions.length) {
      const card = el("div", "tracker-card tracker-companions");
      card.append(el("span", "overline", (tracker.dataset.companionsTitle || "").toUpperCase()));
      const list = el("div", "companion-list");
      companions.forEach((item) => {
        const studied = route.marks[`study:${item.key}`] === true;
        const tested = route.marks[`test:${item.key}`] === true;
        const read = Array.isArray(route.blocks[item.key]) ? route.blocks[item.key].length : 0;
        const status = studied && tested ? "✓ Completada"
          : studied ? "Estudiada · falta el test"
          : read ? `${read} ${read === 1 ? "bloque leído" : "bloques leídos"}`
          : "Sin empezar";
        const link = el("a", `companion${studied && tested ? " is-done" : studied || read ? " is-started" : ""}`);
        link.href = item.href;
        link.append(el("span", "companion-key", item.lesson ? `${item.key} · TEORÍA` : `${item.key} · PRÁCTICA`));
        link.append(el("strong", "", item.title));
        link.append(el("small", "", status));
        list.append(link);
      });
      card.append(list);
      tracker.append(card);
    }

    const ids = readIds();
    blocks.forEach((section) => {
      const done = ids.has(section.id);
      const button = section.querySelector(":scope > .block-check");
      button.classList.toggle("is-read", done);
      button.setAttribute("aria-pressed", String(done));
      button.textContent = done ? "✓ Bloque leído" : "Marcar bloque como leído";
    });
    document.querySelectorAll(".toc-chapter").forEach((chapter) => {
      const target = chapter.querySelector(".toc-links a")?.hash.slice(1);
      chapter.classList.toggle("is-read", !!target && ids.has(decodeURIComponent(target)));
    });
    document.querySelectorAll(".toc-box > p").forEach((label) => {
      label.textContent = `${pageKey} · ${read}/${blocks.length} bloques leídos`;
    });
    studyButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(studied));
      button.textContent = studied ? "✓ Estudiado" : "Marcar como estudiado";
      button.classList.toggle("is-studied", studied);
    });
  };

  blocks.forEach((section, index) => {
    const button = el("button", "button subtle block-check");
    button.type = "button";
    button.addEventListener("click", () => {
      const ids = readIds();
      const done = !ids.has(section.id);
      if (done) ids.add(section.id);
      else ids.delete(section.id);
      route.blocks[pageKey] = [...ids];
      const read = readCount();
      if (done && read === blocks.length && route.marks[studyStep] === undefined) {
        route.marks[studyStep] = true;
        toast(`¡${pageKey} estudiado! +100 XP`);
      } else if (done) {
        toast(`+10 XP · ${read}/${blocks.length} bloques leídos`);
      }
      save();
      render();
      const next = blocks[index + 1];
      if (done && next) next.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    section.append(button);
  });
  studyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const done = route.marks[studyStep] !== true;
      route.marks[studyStep] = done;
      save();
      render();
      if (done) toast(`¡${pageKey} estudiado! +100 XP`);
    });
  });
  render();
}

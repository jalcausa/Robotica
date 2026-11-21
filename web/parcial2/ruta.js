"use strict";

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initRoadmap, { once: true });
else initRoadmap();

function initRoadmap() {
  const root = document.querySelector("#ruta");
  const config = window.RUTA;
  const api = window.RoboTest;
  if (!root || !config || !api) return;

  const questionMinutes = { single: 1, multi: 1.5, numeric: 3, cloze: 2, bug: 1.5 };
  const lessonNames = {
    L4: "L4 · Percepción",
    L5: "L5 · Localización",
  };
  const levels = [
    { name: "Encoder", xp: 0 },
    { name: "Odómetro", xp: 200 },
    { name: "Sonar", xp: 500 },
    { name: "LiDAR", xp: 850 },
    { name: "Filtro de Bayes", xp: 1250 },
    { name: "Kalman", xp: 1750 },
    { name: "EKF", xp: 2300 },
    { name: "Robot localizado", xp: 3000 },
  ];
  const questions = api.questions;
  const progress = api.getProgress();
  const pages = config.pages;
  const questionsByBlock = new Map();
  const pageMinutes = new Map(pages.map((page) => [page.key, page.minutes]));
  const pageList = pages.map((page) => {
    const blockQuestions = questions.filter((question) => question.lesson === page.key);
    questionsByBlock.set(page.key, blockQuestions);
    return page;
  });
  const routeSteps = [];
  const phases = [];

  function addStep(step) {
    routeSteps.push(step);
    phases[phases.length - 1].steps.push(step);
  }

  pageList.forEach((page) => {
    const isLesson = page.type === "lesson";
    const practiceNumber = page.key.replace(/^P/, "");
    phases.push({
      title: isLesson
        ? (lessonNames[page.key] || `${page.key} · ${page.title}`)
        : `Práctica ${practiceNumber} · ${page.title}`,
      steps: [],
    });
    addStep({
      id: `study:${page.key}`,
      type: "study",
      key: page.key,
      page,
      title: isLesson ? `Estudiar la teoría de ${page.key}` : `Estudiar la guía de la práctica ${practiceNumber}`,
      minutes: page.minutes,
    });
    addStep({
      id: `test:${page.key}`,
      type: "test",
      key: page.key,
      page,
      title: isLesson ? `Test de teoría ${page.key}` : `Test de la práctica ${practiceNumber}`,
      minutes: questionsByBlock.get(page.key).reduce((sum, question) => sum + (questionMinutes[question.format] || 1), 0),
    });
  });
  phases.push({ title: "Estudio general", steps: [] });
  addStep({
    id: "pass",
    type: "pass",
    key: "pass",
    title: "Pasada completa: todas las preguntas",
    minutes: questions.reduce((sum, question) => sum + (questionMinutes[question.format] || 1), 0) * 0.6,
  });
  phases.push({ title: "Repaso final", steps: [] });
  pageList.forEach((page) => {
    const practiceNumber = page.key.replace(/^P/, "");
    addStep({
      id: `review:${page.key}`,
      type: "review",
      key: page.key,
      page,
      title: page.type === "lesson" ? `Repaso ${page.key}` : `Repaso Práctica ${practiceNumber}`,
      minutes: 0,
    });
  });

  const emptyRoute = () => ({ marks: {}, pass: {}, days: [], summary: {} });
  let route = emptyRoute();
  try {
    const saved = JSON.parse(localStorage.getItem(config.storageKey) || "{}");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) route = { ...route, ...saved };
  } catch {}
  if (!route.marks || typeof route.marks !== "object" || Array.isArray(route.marks)) route.marks = {};
  if (!route.pass || typeof route.pass !== "object" || Array.isArray(route.pass)) route.pass = {};
  if (!Array.isArray(route.days)) route.days = [];

  const el = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const dayKey = (date = new Date()) => (
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  );
  const save = () => {
    try { localStorage.setItem(config.storageKey, JSON.stringify(route)); } catch {}
  };
  const questionsFor = (key) => questionsByBlock.get(key) || [];
  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  };
  const answerCount = (key) => questionsFor(key).filter((question) => Number(progress[question.id]?.tries) > 0).length;
  const masteredCount = (key) => questionsFor(key).filter((question) => progress[question.id]?.lastCorrect === true).length;
  const passCount = () => questions.filter((question) => Object.hasOwn(route.pass, question.id)).length;
  const failedFor = (key) => questionsFor(key).filter((question) => progress[question.id]?.lastCorrect === false);
  const minutesForQuestions = (items) => items.reduce((sum, question) => sum + (questionMinutes[question.format] || 1), 0);
  const dateTodayOrYesterday = () => {
    const today = dayKey();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    return new Set([today, dayKey(yesterdayDate)]);
  };
  const routeStreak = () => {
    const days = new Set(route.days);
    const allowed = dateTodayOrYesterday();
    let cursor = new Date();
    if (!days.has(dayKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
      if (!allowed.has(dayKey(cursor)) || !days.has(dayKey(cursor))) return 0;
    }
    let streak = 0;
    while (days.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  };
  const formatTime = (minutes) => {
    const rounded = Math.max(0, Math.round(minutes));
    const hours = Math.floor(rounded / 60);
    const remainder = rounded % 60;
    return hours ? `~${hours} h ${String(remainder).padStart(2, "0")} min` : `~${remainder} min`;
  };
  const remainingFor = (step) => {
    if (route.marks[step.id] === true) return 0;
    if (step.type === "test") {
      return minutesForQuestions(questionsFor(step.key).filter((question) => !(Number(progress[question.id]?.tries) > 0)));
    }
    if (step.type === "pass") {
      return minutesForQuestions(questions.filter((question) => !Object.hasOwn(route.pass, question.id))) * 0.6;
    }
    if (step.type === "review") {
      const block = questionsFor(step.key);
      const failures = failedFor(step.key);
      const hasUnseen = block.some((question) => !(Number(progress[question.id]?.tries) > 0));
      const failedMinutes = hasUnseen ? minutesForQuestions(block) * 0.25 : minutesForQuestions(failures);
      return (pageMinutes.get(step.key) || 0) * 0.15 + failedMinutes;
    }
    return step.minutes;
  };
  routeSteps.forEach((step) => {
    if (step.type === "review") {
      step.minutesForTotal = (pageMinutes.get(step.key) || 0) * 0.15
        + minutesForQuestions(questionsFor(step.key)) * 0.25;
    } else {
      step.minutesForTotal = step.minutes;
    }
  });
  const isComplete = (step) => route.marks[step.id] === true;
  const xpFor = (step) => step.type === "pass" ? 300 : 100;
  const totalXP = () => routeSteps.reduce((sum, step) => sum + (isComplete(step) ? xpFor(step) : 0), 0)
    + questions.filter((question) => progress[question.id]?.lastCorrect === true).length * 5;
  const currentLevel = (xp) => {
    let index = 0;
    for (let candidate = 1; candidate < levels.length; candidate++) {
      if (xp < levels[candidate].xp) break;
      index = candidate;
    }
    return { ...levels[index], number: index + 1, next: levels[index + 1] || null };
  };
  const addToday = () => {
    route.days = [...new Set([...route.days, dayKey()])].sort();
  };
  let toastTimer = 0;
  const toast = (text) => {
    let node = document.querySelector(".roadmap-toast");
    if (!node) {
      node = el("div", "roadmap-toast");
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.textContent = text;
    node.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => node.classList.remove("is-visible"), 2500);
  };
  const celebrationQueue = new Set();
  const celebrate = (stepId) => {
    const node = [...root.querySelectorAll(".roadmap-step")].find((item) => item.dataset.stepId === stepId);
    if (!node) return;
    node.classList.remove("is-celebrating");
    window.requestAnimationFrame(() => node.classList.add("is-celebrating"));
    window.setTimeout(() => node.classList.remove("is-celebrating"), 1100);
  };
  const completeStep = (step) => {
    if (route.marks[step.id] === true) return;
    route.marks[step.id] = true;
    addToday();
    save();
    toast(`¡Paso completado! +${xpFor(step)} XP`);
    celebrationQueue.add(step.id);
  };
  const checkAutomatic = () => {
    routeSteps.forEach((step) => {
      if (route.marks[step.id] !== undefined) return;
      if (step.type === "test") {
        const block = questionsFor(step.key);
        if (block.length && block.every((question) => Number(progress[question.id]?.tries) > 0)) completeStep(step);
      } else if (step.type === "pass" && questions.length && questions.every((question) => Object.hasOwn(route.pass, question.id))) {
        completeStep(step);
      }
    });
  };
  const completionStats = () => {
    const done = routeSteps.filter(isComplete).length;
    const weightedTotal = routeSteps.reduce((sum, step) => sum + step.minutesForTotal, 0);
    const weightedDone = routeSteps.reduce((sum, step) => sum + (isComplete(step) ? step.minutesForTotal : 0), 0);
    const percent = weightedTotal ? Math.round(weightedDone / weightedTotal * 100) : 0;
    route.summary = { percent, done, total: routeSteps.length };
    save();
    return { done, percent, weightedTotal };
  };
  const textButton = (label, className, handler, disabled = false) => {
    const button = el("button", `button ${className}`, label);
    button.type = "button";
    button.disabled = disabled;
    button.addEventListener("click", handler);
    return button;
  };
  const linkButton = (label, href, className = "button subtle") => {
    const link = el("a", className, label);
    link.href = href;
    return link;
  };
  const startTest = (step) => {
    let list;
    if (step.type === "test") {
      const block = questionsFor(step.key);
      list = block.filter((question) => !(Number(progress[question.id]?.tries) > 0));
      if (!list.length) list = block;
      list = shuffle(list);
    } else if (step.type === "pass") {
      list = questions.filter((question) => !Object.hasOwn(route.pass, question.id));
      if (!list.length) list = [...questions];
      list = shuffle(list);
    } else {
      list = shuffle(failedFor(step.key));
    }
    api.start(list, step.type === "pass" ? "pass" : `${step.type}:${step.key}`);
  };
  const answerButton = (step) => {
    if (step.type === "study") {
      return linkButton(step.page.type === "lesson" ? "Abrir resumen ↗" : "Abrir guía ↗", step.page.href);
    }
    if (step.type === "test") {
      const total = questionsFor(step.key).length;
      const answered = answerCount(step.key);
      const label = answered === 0 ? "Hacer test" : answered === total ? "Repetir test" : `Continuar (${answered}/${total})`;
      return textButton(label, "primary", () => startTest(step));
    }
    if (step.type === "pass") {
      const answered = passCount();
      const total = questions.length;
      const label = answered === 0 ? "Empezar pasada" : answered === total ? "Repetir pasada" : `Continuar pasada (${answered}/${total})`;
      const controls = el("div", "roadmap-actions");
      controls.append(textButton(label, "primary", () => startTest(step)));
      const reset = textButton("Reiniciar pasada", "subtle", () => {
        if (!window.confirm("¿Borrar el progreso de esta pasada y empezar de nuevo?")) return;
        route.pass = {};
        delete route.marks.pass;
        save();
        render();
      });
      reset.classList.add("roadmap-reset-pass");
      controls.append(reset);
      return controls;
    }
    const failed = failedFor(step.key);
    const controls = el("div", "roadmap-actions");
    controls.append(textButton(
      failed.length ? `Repasar falladas (${failed.length})` : "Sin fallos",
      failed.length ? "primary" : "subtle",
      () => startTest(step),
      failed.length === 0,
    ));
    controls.append(linkButton(
      step.page.type === "lesson" ? "Releer resumen ↗" : "Releer guía ↗",
      step.page.href,
      "roadmap-read-link",
    ));
    return controls;
  };
  const stepProgress = (step) => {
    if (step.type === "test") {
      const total = questionsFor(step.key).length;
      const answered = answerCount(step.key);
      const mastered = masteredCount(step.key);
      return { text: `Respondidas ${answered}/${total} · dominadas ${mastered}/${total}`, value: total ? answered / total * 100 : 0 };
    }
    if (step.type === "pass") {
      const answered = passCount();
      const mastered = questions.filter((question) => route.pass[question.id] === true).length;
      return { text: `Respondidas ${answered}/${questions.length} · dominadas ${mastered}/${questions.length}`, value: questions.length ? answered / questions.length * 100 : 0 };
    }
    return null;
  };
  const stepMeta = (step) => {
    if (step.type === "study") return `${step.page.blocks} bloques de lectura`;
    if (step.type === "test" || step.type === "review") {
      const count = step.type === "test" ? questionsFor(step.key).length : failedFor(step.key).length;
      if (step.type === "review") return `${count} ${count === 1 ? "fallada" : "falladas"}`;
      return `${count} ${count === 1 ? "pregunta" : "preguntas"}`;
    }
    return `${questions.length} preguntas en el banco`;
  };
  const stepMinutes = (step) => {
    if (step.type === "review") {
      const block = questionsFor(step.key);
      const failures = failedFor(step.key);
      const hasUnseen = block.some((question) => !(Number(progress[question.id]?.tries) > 0));
      return (pageMinutes.get(step.key) || 0) * 0.15
        + (hasUnseen ? minutesForQuestions(block) * 0.25 : minutesForQuestions(failures));
    }
    return step.minutes;
  };
  const renderNext = (step) => {
    const card = el("article", "roadmap-next");
    const copy = el("div");
    copy.append(el("span", "overline", "SIGUIENTE PASO"));
    copy.append(el("h3", "", step ? step.title : "¡Ruta completada!"));
    copy.append(el("p", "", step ? `⏱ ${formatTime(remainingFor(step))} · ${stepMeta(step)}` : "Has completado todos los pasos de estudio."));
    card.append(copy);
    if (step) card.append(answerButton(step));
    return card;
  };
  const renderDashboard = (stats, nextStep) => {
    const dashboard = el("div", "roadmap-dashboard");
    const progressCard = el("article", "roadmap-progress");
    progressCard.append(el("span", "overline", "TU RUTA"));
    progressCard.append(el("h2", "", "Aprende paso a paso"));
    const progressLine = el("div", "roadmap-progress-line");
    const ring = el("div", "roadmap-ring");
    ring.style.setProperty("--route-progress", `${stats.percent}%`);
    ring.append(el("span", "roadmap-ring-value", `${stats.percent}%`));
    const progressCopy = el("div", "roadmap-progress-copy");
    progressCopy.append(el("strong", "", `${stats.done} de ${routeSteps.length} pasos`));
    const remaining = routeSteps.reduce((sum, step) => sum + remainingFor(step), 0);
    progressCopy.append(el("span", "", `⏱ ${formatTime(remaining)} restantes`));
    const overallTrack = el("div", "roadmap-track");
    const overallFill = el("span");
    overallFill.style.width = `${stats.percent}%`;
    overallTrack.append(overallFill);
    progressCopy.append(overallTrack);
    progressLine.append(ring, progressCopy);
    progressCard.append(progressLine);

    const xp = totalXP();
    const level = currentLevel(xp);
    const levelCard = el("article", "roadmap-level");
    levelCard.append(el("span", "overline", "EXPERIENCIA"));
    const levelLine = el("div", "roadmap-level-line");
    levelLine.append(el("strong", "roadmap-xp", `${xp} XP`));
    levelLine.append(el("span", "roadmap-level-name", `Nivel ${level.number} · ${level.name}`));
    levelCard.append(levelLine);
    const levelTrack = el("div", "roadmap-track");
    const levelFill = el("span");
    const levelStart = level.xp;
    const levelEnd = level.next ? level.next.xp : level.xp;
    levelFill.style.width = `${level.next ? Math.min(100, (xp - levelStart) / (levelEnd - levelStart) * 100) : 100}%`;
    levelTrack.append(levelFill);
    levelCard.append(levelTrack);
    levelCard.append(el("p", "roadmap-level-caption", level.next ? `${level.next.xp - xp} XP para ${level.next.name}` : "Nivel máximo alcanzado"));
    levelCard.append(el("p", "roadmap-streak", `🔥 Racha: ${routeStreak()} ${routeStreak() === 1 ? "día" : "días"}`));

    const overview = el("div", "roadmap-overview");
    overview.append(progressCard, levelCard);
    dashboard.append(overview, renderNext(nextStep));
    return dashboard;
  };
  const renderStep = (step, nextId, stepIndex) => {
    const item = el("article", "roadmap-step");
    item.dataset.stepId = step.id;
    const done = isComplete(step);
    const isNext = step.id === nextId;
    if (done) item.classList.add("is-done");
    else if (isNext) item.classList.add("is-next");
    else if (stepIndex > routeSteps.findIndex((candidate) => candidate.id === nextId)) item.classList.add("is-future");
    const checkLabel = el("label", "roadmap-check");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = done;
    checkbox.setAttribute("aria-label", `${done ? "Marcar como pendiente" : "Marcar como completado"}: ${step.title}`);
    const checkMark = el("span", "roadmap-check-mark", done ? "✓" : "");
    checkLabel.append(checkbox, checkMark);
    checkbox.addEventListener("change", () => {
      route.marks[step.id] = checkbox.checked;
      if (checkbox.checked) {
        addToday();
        toast(`¡Paso completado! +${xpFor(step)} XP`);
        celebrationQueue.add(step.id);
      }
      save();
      render();
    });

    const body = el("div", "roadmap-step-body");
    const titleLine = el("div", "roadmap-step-title");
    titleLine.append(el("h3", "", step.title));
    if (done) titleLine.append(el("span", "roadmap-done-label", "Completado"));
    body.append(titleLine);
    const metadata = el("p", "roadmap-step-meta", `⏱ ${formatTime(stepMinutes(step))} · ${stepMeta(step)}`);
    body.append(metadata);
    const mini = stepProgress(step);
    if (mini) {
      const miniLine = el("div", "roadmap-mini-progress");
      miniLine.append(el("span", "", mini.text));
      const track = el("div", "roadmap-track");
      const fill = el("span");
      fill.style.width = `${mini.value}%`;
      track.append(fill);
      miniLine.append(track);
      body.append(miniLine);
    }
    if (step.type === "pass" && passCount() === questions.length) {
      const hits = questions.filter((question) => route.pass[question.id] === true).length;
      body.append(el("p", "roadmap-pass-result", `Última pasada: ${hits}/${questions.length} aciertos`));
    }
    const actions = answerButton(step);
    body.append(actions);
    item.append(checkLabel, body);
    return item;
  };
  const render = () => {
    checkAutomatic();
    const stats = completionStats();
    const nextStep = routeSteps.find((step) => !isComplete(step));
    root.replaceChildren();
    const heading = el("div", "roadmap-heading");
    const intro = el("div");
    intro.append(el("span", "overline", "TU PLAN DE ESTUDIO"));
    const title = el("h2", "", "Una ruta clara hasta el examen");
    title.id = "roadmap-title";
    intro.append(title);
    intro.append(el("p", "", "Avanza a tu ritmo: los pasos futuros siguen disponibles y puedes marcar cada bloque cuando lo termines."));
    heading.append(intro);
    const reset = textButton("Reiniciar ruta", "subtle", () => {
      if (!window.confirm("¿Reiniciar la ruta de estudio? Se borrarán sus marcas y la pasada, pero no el progreso del test.")) return;
      route = emptyRoute();
      save();
      render();
    });
    reset.classList.add("roadmap-reset");
    heading.append(reset);
    root.append(heading, renderDashboard(stats, nextStep));
    const list = el("div", "roadmap-timeline");
    let stepIndex = 0;
    phases.forEach((phase) => {
      if (!phase.steps.length) return;
      const group = el("section", "roadmap-phase");
      group.append(el("h3", "", phase.title));
      const phaseSteps = el("div", "roadmap-phase-steps");
      phase.steps.forEach((step) => {
        phaseSteps.append(renderStep(step, nextStep?.id, stepIndex));
        stepIndex++;
      });
      group.append(phaseSteps);
      list.append(group);
    });
    root.append(list);
    celebrationQueue.forEach(celebrate);
    celebrationQueue.clear();
  };

  document.addEventListener("robotest:answer", (event) => {
    const { id, correct, tag } = event.detail || {};
    if (tag === "pass" && id) route.pass[id] = !!correct;
    addToday();
    save();
    render();
  });
  document.addEventListener("robotest:finish", (event) => {
    const { tag } = event.detail || {};
    const resultActions = document.querySelector("#result .result-actions");
    resultActions?.querySelector(".route-result-link")?.remove();
    if (tag === "pass" || (typeof tag === "string" && /^(test|review):/.test(tag))) {
      if (resultActions) {
        const back = linkButton("Volver a mi ruta →", "#ruta");
        back.classList.add("route-result-link");
        resultActions.append(back);
      }
    }
    render();
  });
  render();
}

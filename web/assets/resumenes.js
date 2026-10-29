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

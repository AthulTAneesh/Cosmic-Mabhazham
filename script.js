(() => {
  "use strict";

  const root = document.documentElement;
  const track = document.querySelector(".scroll-track");
  const copies = [...document.querySelectorAll(".copy")];
  const loading = document.querySelector("#loading");
  const chapter = document.querySelector("#chapter-label");
  const scrollCue = document.querySelector("#scroll-cue");
  const motionButton = document.querySelector("#sound-toggle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const map = (value, inMin, inMax, outMin, outMax) => {
    const amount = clamp((value - inMin) / (inMax - inMin));
    return outMin + (outMax - outMin) * amount;
  };
  const range = (value, start, end) => clamp((value - start) / (end - start));
  const pulse = (value, start, middle, end) => Math.min(range(value, start, middle), 1 - range(value, middle, end)) * 2;
  const set = (name, value) => root.style.setProperty(name, value);

  function updateScene() {
    const maxScroll = Math.max(1, track.offsetHeight - window.innerHeight);
    const p = clamp(window.scrollY / maxScroll);
    root.style.setProperty("--p", p.toFixed(4));

    const mars = pulse(p, .13, .30, .49);
    const surface = pulse(p, .31, .46, .66);
    const storm = pulse(p, .53, .62, .72);
    const tech = Math.min( range(p, .25, .10),1 - range(p, .52, .50));
    const voyager = pulse(p, .62, .78, .94);
    const solar = pulse(p, .68, .79, .91);
    const pale = pulse(p, .83, .93, 1.01);

    set("--mars-opacity", mars.toFixed(3));
    set("--mars-scale", map(p, .13, .47, .14, 1.24).toFixed(3));
    set("--mars-x", `${map(p, .13, .47, 44, -28).toFixed(2)}vw`);
    set("--mars-y", `${map(p, .13, .47, 14, -4).toFixed(2)}vh`);
    set("--rust-opacity", (surface * .72 + storm * .3).toFixed(3));
    set("--surface-opacity", surface.toFixed(3));
    set("--surface-scale", map(p, .31, .66, 1.42, 1.03).toFixed(3));
    set("--surface-y", `${map(p, .31, .66, 27, 0).toFixed(2)}%`);
    set("--tech-opacity", tech.toFixed(3));
    set("--tech-y", `${map(p, .28, .49, 22, 0).toFixed(2)}%`);
    set("--dust-opacity", storm.toFixed(3));
    set("--dust-x", `${map(p, .53, .72, 45, -16).toFixed(2)}%`);
    set("--voyager-opacity", voyager.toFixed(3));
    set("--voyager-x", `${map(p, .62, .94, -3, 102).toFixed(2)}vw`);
    set("--voyager-y", `${map(p, .62, .94, 11, -14).toFixed(2)}vh`);
    set("--voyager-scale", map(p, .62, .94, .56, 1.02).toFixed(3));
    set("--solar-opacity", (solar * .76).toFixed(3));
    set("--solar-x", `${map(p, .68, .91, 13, -18).toFixed(2)}vw`);
    set("--solar-scale", map(p, .68, .91, 1.12, .95).toFixed(3));
    set("--dot-opacity", pale.toFixed(3));
    set("--dot-scale", map(p, .83, 1, 3.1, 1.04).toFixed(3));
    set("--earth-return", range(p, .945, 1).toFixed(3));
    set("--earth-return-scale", map(p, .945, 1, .35, 1.02).toFixed(3));

    let activeChapter = "Prologue";
    copies.forEach((copy) => {
      const start = Number(copy.dataset.start);
      const end = Number(copy.dataset.end);
      const local = range(p, start, end);
      const visible = copy.classList.contains("copy--hero")
      ? p < 0.12
      : Math.sin(local * Math.PI) > .08;
      copy.classList.toggle("is-visible", visible);
      if (visible) activeChapter = copy.dataset.chapter;
    });
    chapter.textContent = activeChapter;
    scrollCue.classList.toggle("is-hidden", p > .015);
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScene();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener("resize", updateScene, { passive: true });

  motionButton.addEventListener("click", () => {
    const enabled = motionButton.getAttribute("aria-pressed") !== "true";
    motionButton.setAttribute("aria-pressed", String(enabled));
    motionButton.textContent = enabled ? "Full motion" : "Enable motion";
    document.body.classList.toggle("motion-boost", enabled);
  });

  const reveal = () => {
    loading.classList.add("is-hidden");
    updateScene();
  };
  if (document.readyState === "complete") window.setTimeout(reveal, 250);
  else window.addEventListener("load", () => window.setTimeout(reveal, 250), { once: true });
  if (reducedMotion.matches) motionButton.textContent = "Reduced motion";
})();

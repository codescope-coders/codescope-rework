/** Local, opt-in phone diagnostics. No storage, requests, analytics or form data.
 * rAF timestamps measure main-thread callbacks, not pixels presented by the GPU.
 */
export function installMenuDiagnostics(
  disclosure: HTMLDetailsElement,
  trigger: HTMLElement,
  panel: HTMLElement | null,
) {
  if (process.env.NODE_ENV !== "development" ||
      new URLSearchParams(location.search).get("menu-debug") !== "1" || !panel) return;

  const output = document.createElement("output");
  output.dataset.menuDiagnostics = "transform-v4";
  output.style.cssText = "position:fixed;bottom:0;left:0;right:0;z-index:2147483647;padding:8px;background:#fff;color:#111;font:12px/1.4 monospace;white-space:pre-wrap;pointer-events:none;direction:ltr;text-align:left";
  output.textContent = "Menu check v4 · transform curtain · local only\nTap the menu; timings appear after 1.5 seconds.";
  document.body.append(output);

  let start = 0;
  let frame = 0;
  let timer = 0;
  let previousFrame = 0;
  let largestGap = 0;
  let firstFrame: number | undefined;
  let events: string[] = [];
  let gaps: number[] = [];
  let recording = false;
  const ms = (n: number) => `${Math.round(n)}ms`;
  const record = (label: string) => {
    if (recording) events.push(`${label}: ${ms(performance.now() - start)}`);
  };
  const sample = (now: number) => {
    firstFrame ??= now - start;
    largestGap = Math.max(largestGap, now - previousFrame);
    if (gaps.length < 15) gaps.push(Math.round(now - previousFrame));
    previousFrame = now;
    frame = requestAnimationFrame(sample);
  };
  // Capturing touchend observes the completed tap before the fast toggle handler.
  // Native mouse/keyboard activation is observed at click instead.
  const begin = (event: Event) => {
    if (event.type === "click" && recording && performance.now() - start < 500) return;
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    start = performance.now();
    previousFrame = start;
    firstFrame = undefined;
    largestGap = 0;
    gaps = [];
    recording = true;
    const queueDelay = start - event.timeStamp;
    events = [`${disclosure.open ? "Close" : "Open"} · ${event.type}`, `Input queue: ${queueDelay >= 0 && queueDelay < 60000 ? ms(queueDelay) : "unavailable"}`];
    frame = requestAnimationFrame(sample);
    timer = window.setTimeout(() => {
      cancelAnimationFrame(frame);
      recording = false;
      output.textContent = [
        "Menu check v4 · transform curtain · local only",
        ...events,
        `First rAF: ${firstFrame === undefined ? "unavailable" : ms(firstFrame)} · Largest rAF gap: ${ms(largestGap)}`,
        `Frame gaps (ms): ${gaps.join(", ")}`,
        `Reduced motion: ${matchMedia("(prefers-reduced-motion: reduce)").matches ? "on" : "off"}`,
      ].join("\n");
    }, 1500);
  };
  const toggle = () => record("Native toggle");
  const transition = (event: TransitionEvent) => {
    if ((event.target as Element).classList.contains("site-menu-sheet") && event.propertyName === "transform") {
      record(event.type === "transitionstart" ? "Sheet start" : "Sheet end");
    }
  };
  trigger.addEventListener("touchend", begin, { capture: true, passive: true });
  trigger.addEventListener("click", begin, true);
  disclosure.addEventListener("toggle", toggle);
  panel.addEventListener("transitionstart", transition);
  panel.addEventListener("transitionend", transition);
  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    trigger.removeEventListener("touchend", begin, true);
    trigger.removeEventListener("click", begin, true);
    disclosure.removeEventListener("toggle", toggle);
    panel.removeEventListener("transitionstart", transition);
    panel.removeEventListener("transitionend", transition);
    output.remove();
  };
}

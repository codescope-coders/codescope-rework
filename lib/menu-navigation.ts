"use client";

import { getLenis, pauseSmoothScroll, resumeSmoothScroll } from "./lenis";

type PublicNavigation = {
  from: string;
  to: string;
  kind: "menu" | "page";
  panel?: HTMLElement;
  complete: () => void;
  dispose?: () => void;
  releaseBackdrop?: () => void;
  revealBackdrop?: () => void;
};
type MenuNavigation = Omit<PublicNavigation, "kind" | "panel"> & { panel: HTMLElement };

// Only public links, the persistent menu, and the public wrapper participate. Next's
// Link still owns routing, history, cancellation, and the actual network work.
let navigation: PublicNavigation | undefined;

/** Preserve the visible page across loading/route commits. Desktop menu
 * navigation holds it still; CTA navigation moves it down on every screen.
 * Mobile menu navigation keeps its existing, lighter curtain path. */
function preservePageBackdrop(site: HTMLElement, moveDown = false) {
  const backdrop = document.createElement("div");
  backdrop.className = "site-menu-outgoing-page";
  backdrop.inert = true;
  backdrop.setAttribute("aria-hidden", "true");
  for (const source of site.querySelectorAll<HTMLElement>(":scope > main, :scope > footer")) {
    const rect = source.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue;
    const copy = source.cloneNode(true) as HTMLElement;
    // cloneNode copies canvas elements, but not their painted pixels. Preserve
    // the current frame (including the homepage globe) before hiding the live
    // page, without starting another renderer or encoding an image.
    const copiedCanvases = copy.querySelectorAll("canvas");
    source.querySelectorAll("canvas").forEach((canvas, index) => {
      const box = canvas.getBoundingClientRect();
      if (!canvas.width || !canvas.height || box.bottom <= 0 || box.top >= window.innerHeight ||
          box.right <= 0 || box.left >= window.innerWidth) return;
      const target = copiedCanvases[index];
      try {
        target?.getContext("2d")?.drawImage(canvas, 0, 0);
      } catch {
        // A lost/unavailable canvas must not interrupt navigation or cleanup.
      }
    });
    // This is a temporary visual surface, never another live form/media tree.
    copy.querySelectorAll("script, iframe, video, audio").forEach((node) => node.remove());
    copy.querySelectorAll("[id]:not(svg [id])").forEach((node) => node.removeAttribute("id"));
    Object.assign(copy.style, {
      position: "absolute", top: `${rect.top}px`, left: `${rect.left}px`,
      width: `${rect.width}px`, margin: "0",
    });
    backdrop.append(copy);
  }
  site.append(backdrop);
  site.dataset.menuHandoff = "waiting";
  return {
    reveal: () => {
      site.dataset.menuHandoff = "entering";
      if (moveDown) backdrop.dataset.pageExit = "true";
    },
    release: () => {
      backdrop.remove();
      delete site.dataset.menuHandoff;
    },
  };
}

export function cancelMenuNavigation(panel?: HTMLElement | null) {
  if (!navigation || (panel && navigation.panel !== panel)) return;
  const current = navigation;
  navigation = undefined;
  current.dispose?.();
  current.releaseBackdrop?.();
  const activePanel = current.panel;
  if (!activePanel) return;
  delete activePanel.dataset.navigation;
  activePanel.removeAttribute("aria-busy");
  activePanel.inert = false;
  if (current.dispose) {
    // Reset the outgoing layer while hidden; otherwise removing its completed
    // animation would briefly show the open menu again before native close.
    activePanel.dataset.navigation = "reset";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (activePanel.dataset.navigation === "reset") delete activePanel.dataset.navigation;
    }));
  }
}

export function beginMenuNavigation(next: MenuNavigation) {
  cancelMenuNavigation();
  if (next.from === next.to || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    next.complete();
    return;
  }
  const current: PublicNavigation = { ...next, kind: "menu" };
  navigation = current;
  const site = next.panel.closest<HTMLElement>('[data-site="public"]');
  const backdrop = site && matchMedia("(min-width: 1024px)").matches
    ? preservePageBackdrop(site) : undefined;
  current.releaseBackdrop = backdrop?.release;
  current.revealBackdrop = backdrop?.reveal;
  next.panel.dataset.navigation = "waiting";
  next.panel.setAttribute("aria-busy", "true");
}

export function cancelPageNavigation() {
  if (navigation?.kind === "page") cancelMenuNavigation();
}

/** CTA links use the same arrival, with the old viewport as the outgoing layer.
 * Next Link still starts navigation immediately and owns the destination URL. */
export function beginPageNavigation(from: string, to: string, source: HTMLAnchorElement) {
  cancelMenuNavigation();
  if (from === to || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const site = source.closest<HTMLElement>('[data-site="public"]');
  if (!site) return;
  const current: PublicNavigation = { from, to, kind: "page", complete: () => {} };
  navigation = current;
  const backdrop = preservePageBackdrop(site, true);
  const main = site.querySelector<HTMLElement>(":scope > main");
  const wasInert = main?.inert ?? false;
  if (main) main.inert = true;
  const busy = source.getAttribute("aria-busy");
  source.setAttribute("aria-busy", "true");
  pauseSmoothScroll();

  const cancel = () => { if (navigation === current) cancelPageNavigation(); };
  const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") cancel(); };
  const preventScroll = (event: WheelEvent | TouchEvent) => {
    if ("touches" in event && event.touches.length > 1) return;
    if (event.cancelable) event.preventDefault();
  };
  window.addEventListener("popstate", cancel);
  document.addEventListener("keydown", onKey);
  document.addEventListener("wheel", preventScroll, { passive: false });
  document.addEventListener("touchmove", preventScroll, { passive: false });
  // Recovery for a failed/stalled request; never delays routing or the reveal.
  const recovery = window.setTimeout(cancel, 15000);
  current.revealBackdrop = () => {
    clearTimeout(recovery);
    backdrop.reveal();
  };
  current.releaseBackdrop = () => {
    clearTimeout(recovery);
    backdrop.release();
    if (main) main.inert = wasInert;
    if (busy === null) source.removeAttribute("aria-busy");
    else source.setAttribute("aria-busy", busy);
    window.removeEventListener("popstate", cancel);
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("wheel", preventScroll);
    document.removeEventListener("touchmove", preventScroll);
    resumeSmoothScroll();
  };
}

/** Called after the destination commits, including after a streamed fallback.
 * Returning false asks the page wrapper to keep observing its loading boundary.
 */
export function revealMenuDestination(pathname: string, page: HTMLElement) {
  const current = navigation;
  if (!current) return true;
  if (current.to !== pathname) {
    if (pathname !== current.from) {
      cancelMenuNavigation();
      current.complete();
    }
    return true;
  }
  if (current.dispose) return true;
  if (page.querySelector("[data-public-page-loading]")) return false;

  const finish = () => {
    if (navigation !== current) return;
    cancelMenuNavigation();
    current.complete();
    page.focus({ preventScroll: true });
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
    return true;
  }

  // Reset both scroll owners before the incoming viewport enters. No root
  // overflow mutation and no screenshot/full-document animation layer.
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo({ top: 0, behavior: "instant" });

  const onEnd = (event: AnimationEvent) => {
    if (event.target === page && event.animationName === "site-page-menu-enter") finish();
  };
  page.addEventListener("animationend", onEnd);
  page.addEventListener("animationcancel", onEnd);
  // Cleanup insurance if the OS changes motion preferences mid-animation or a
  // browser omits the end event. This never delays or triggers navigation.
  const timeout = window.setTimeout(finish, 1200);
  current.dispose = () => {
    clearTimeout(timeout);
    page.removeEventListener("animationend", onEnd);
    page.removeEventListener("animationcancel", onEnd);
    page.dataset.menuArrival = "complete";
    page.classList.remove("site-page-menu-enter");
  };
  if (current.panel) {
    current.panel.removeAttribute("aria-busy");
    current.panel.inert = true;
    current.panel.dataset.navigation = "leaving";
  }
  page.classList.add("site-page-menu-enter");
  current.revealBackdrop?.();
  return true;
}

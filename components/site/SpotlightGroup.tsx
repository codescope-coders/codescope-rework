"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type React from "react";

/**
 * Lets one hovered card dim its siblings.
 *
 * ── Why a context and not `:has()` / a parent `group` ──────────────────────
 * The effect is "every card EXCEPT the hovered one recedes", which no CSS
 * selector on the card itself can express: a card cannot ask whether a SIBLING
 * is hovered. `.grid:has(:hover) > :not(:hover)` gets close and then breaks on
 * the two things this grid actually does — the cards are each wrapped in a
 * `FadeIn`, so `:not(:hover)` matches the wrapper of the hovered card too, and
 * the pricing grid nests a lift wrapper inside that. A shared id is exact, and
 * it costs one state update per pointer enter.
 *
 * Cards register nothing on mount: the provider only ever holds the id of the
 * card currently under the pointer, so a grid with no hover does no work.
 */

interface SpotlightGroupValue {
  hovered: string | null;
  setHovered: React.Dispatch<React.SetStateAction<string | null>>;
}

const SpotlightGroupContext = createContext<SpotlightGroupValue | null>(null);

export function SpotlightGroup({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const value = useMemo(() => ({ hovered, setHovered }), [hovered]);

  return (
    <SpotlightGroupContext.Provider value={value}>
      {children}
    </SpotlightGroupContext.Provider>
  );
}

/**
 * `dimmed` is true only when ANOTHER member of the group is hovered — never
 * when nothing is, and never for the hovered card itself. A card outside any
 * group gets `dimmed: false` and inert callbacks, which is what keeps
 * `SpotlightCard` usable on its own.
 */
export function useSpotlightGroup(id: string) {
  const ctx = useContext(SpotlightGroupContext);
  return {
    dimmed: ctx !== null && ctx.hovered !== null && ctx.hovered !== id,
    enter: () => ctx?.setHovered(id),
    /* Clears only if this card is still the one on record. Pointer-leave and
       the next card's pointer-enter can arrive in either order; an
       unconditional clear would sometimes wipe the card that just took over
       and leave the whole grid undimmed mid-sweep. */
    leave: () => ctx?.setHovered((cur) => (cur === id ? null : cur)),
  };
}

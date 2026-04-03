// DESIGN.md §4 — "Roundedness Scale of 0px"
// "All containers must have hard, 90-degree angles. This conveys a Brutalist-Luxe
// architectural feel."
export const radius = {
  none: 0,
  xs:   0,
  sm:   0,
  md:   0,
  lg:   0,
  xl:   0,
  full: 9999,   // kept only for pill badges / avatar crops — use sparingly
} as const

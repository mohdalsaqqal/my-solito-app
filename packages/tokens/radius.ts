// NiceOne-derived rounded scale.
// md (6px) is the primary card radius. xl/2xl for containers and hero banners.
export const radius = {
  none:  0,
  xs:    2,    // hairline rounding for tags/chips
  sm:    2,
  md:    6,    // primary card radius
  lg:    8,    // modals, drawers
  xl:    12,   // large containers, bottom sheets
  '2xl': 16,   // hero banners, large cards
  full:  9999, // pills and avatar crops only
} as const

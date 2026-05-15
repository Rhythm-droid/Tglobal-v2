/**
 * SVGO configuration for tglobal.in static illustrations.
 *
 * Goals:
 *   - Aggressive size reduction without altering visual output
 *   - Preserve viewBox so responsive scaling still works
 *   - Preserve IDs because some illustrations use mask/clip-path
 *     references that depend on stable IDs
 *
 * Run: `npx svgo --multipass --config svgo.config.mjs -f public/how-it-works -f public/services`
 */
export default {
  multipass: true,
  floatPrecision: 1,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: false,
          removeUnknownsAndDefaults: { keepDataAttrs: false },
        },
      },
    },
    "removeDimensions",
    "convertStyleToAttrs",
    "sortAttrs",
  ],
};

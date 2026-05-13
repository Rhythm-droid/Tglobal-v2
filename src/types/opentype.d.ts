/* Minimal ambient declaration for opentype.js — pulled in by the
   Componentry signature component. Suppresses the implicit-any
   error without forcing us to install @types/opentype.js (which
   does exist on npm but adds package weight we don't need for this
   experiment). If we keep signature past the experiment, swap this
   for the real typings: `npm i -D @types/opentype.js`. */
declare module "opentype.js";

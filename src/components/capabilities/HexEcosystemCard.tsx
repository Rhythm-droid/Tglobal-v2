/**
 * Capabilities Section — Card 1 (top-left, diagonal position).
 *
 * Pure inline SVG that reproduces the Figma source (design/…/1.svg) as
 * native React markup. Nothing is loaded as an image; every shape is a
 * first-class SVG element the browser renders crisply at every scale.
 *
 * Fidelity strategy:
 *   • Every hexagon uses the EXACT rounded-hex path from Figma (path[0]
 *     and path[1]). One hexagon is authored once; the rest are placed by
 *     wrapping the template in `<g transform="translate(…)">`.
 *   • Each hex gets the Figma drop-shadow filter (erode 4 → offset y=1
 *     → Gaussian blur 4 → 5% black → multiply blend) so the honeycomb
 *     reads as a stack of semi-transparent cards rather than a flat
 *     polygon pattern.
 *   • Logo-bearing hexes (OpenAI at top-mid, Angular at mid-left) get an
 *     additional BLURRED shadow hex underneath (Gaussian blur stdDev=6)
 *     offset by a few pixels — this creates the "lifted double-hex"
 *     silhouette visible in the breakdown/Icon Group.svg.
 *   • Node.js, Angular, and OpenAI logos use the exact vector paths that
 *     were in Figma — no raster, no approximation.
 *   • AWS and Google "G" were embedded as PNGs in the Figma file; we
 *     rebuild them as native SVG so they stay crisp and scale with the
 *     card.
 */

/* ────────────────────────────────────────────────────────────
   HEX TEMPLATE — verbatim from the Figma export (path[0] and
   path[1] of 1.svg). All 10 hexagons reuse this shape via
   translate() — SVG transforms on the wrapping <g> shift the
   absolute-coordinate paths without distorting them.
   ──────────────────────────────────────────────────────────── */
const HEX_FILL_D =
  "M63.7 13.3901C68.3631 10.6978 70.6946 9.35173 73.1734 8.82485C75.3666 8.35866 77.6334 8.35866 79.8266 8.82485C82.3054 9.35173 84.6369 10.6978 89.3 13.3901L96.609 17.6099C101.272 20.3022 103.604 21.6483 105.299 23.5315C106.8 25.1978 107.933 27.1609 108.626 29.2933C109.409 31.7035 109.409 34.3957 109.409 39.7802V48.2198C109.409 53.6043 109.409 56.2965 108.626 58.7067C107.933 60.8391 106.8 62.8022 105.299 64.4685C103.604 66.3517 101.272 67.6978 96.609 70.3901L89.3 74.6099C84.6369 77.3022 82.3054 78.6483 79.8266 79.1752C77.6334 79.6413 75.3666 79.6413 73.1734 79.1752C70.6946 78.6483 68.3631 77.3022 63.7 74.6099L56.391 70.3901C51.7279 67.6978 49.3964 66.3517 47.7007 64.4685C46.2004 62.8022 45.067 60.8391 44.3741 58.7067C43.591 56.2965 43.591 53.6043 43.591 48.2198V39.7802C43.591 34.3957 43.591 31.7035 44.3741 29.2933C45.067 27.1609 46.2004 25.1978 47.7007 23.5315C49.3964 21.6483 51.7279 20.3022 56.391 17.6099L63.7 13.3901Z";

const HEX_STROKE_D =
  "M73.3291 9.55859C75.4195 9.11426 77.5805 9.11426 79.6709 9.55859C82.0058 10.055 84.2181 11.3226 88.9248 14.04L96.2344 18.2598C100.941 20.9771 103.145 22.2593 104.742 24.0332C106.172 25.6214 107.252 27.4929 107.912 29.5254C108.65 31.7957 108.659 34.3453 108.659 39.7803V48.2197C108.659 53.6547 108.65 56.2043 107.912 58.4746C107.252 60.5071 106.172 62.3786 104.742 63.9668C103.145 65.7407 100.941 67.0229 96.2344 69.7402L88.9248 73.96C84.2181 76.6774 82.0058 77.945 79.6709 78.4414C77.5805 78.8857 75.4195 78.8857 73.3291 78.4414C70.9942 77.945 68.7819 76.6774 64.0752 73.96L56.7656 69.7402C52.059 67.0229 49.8551 65.7407 48.2578 63.9668C46.8278 62.3786 45.7483 60.5071 45.0879 58.4746C44.3503 56.2043 44.3408 53.6547 44.3408 48.2197V39.7803C44.3408 34.3453 44.3503 31.7957 45.0879 29.5254C45.7483 27.4929 46.8278 25.6214 48.2578 24.0332C49.8551 22.2593 52.059 20.9771 56.7656 18.2598L64.0752 14.04C68.7819 11.3226 70.9942 10.055 73.3291 9.55859Z";

/** Reference point (top-left corner of hex[0] bbox) — all translations
 *  are computed as (target - base). */
const HEX_BASE: readonly [number, number] = [63.7, 13.3901];

/* ────────────────────────────────────────────────────────────
   Hex positions (exact Figma coords). Offset pattern:
     Rows 1 & 3: x ∈ {63.7, 139.7, 215.7}
     Row 2     : x ∈ {25.7, 101.7, 177.7, 253.7}
   Horizontal step 76 · vertical step 66 · Row 2 half-offset of 38.
   ──────────────────────────────────────────────────────────── */
type HexSlot =
  | "top-left" | "top-mid" | "top-right"
  | "mid-far-left" | "mid-left" | "mid-right" | "mid-far-right"
  | "bot-left" | "bot-mid" | "bot-right";

const HEXES: readonly { slot: HexSlot; x: number; y: number }[] = [
  { slot: "top-left",      x:  63.7, y:  13.39 },
  { slot: "top-mid",       x: 139.7, y:  13.39 },
  { slot: "top-right",     x: 215.7, y:  13.39 },
  { slot: "mid-far-left",  x:  25.7, y:  79.39 },
  { slot: "mid-left",      x: 101.7, y:  79.39 },
  { slot: "mid-right",     x: 177.7, y:  79.39 },
  { slot: "mid-far-right", x: 253.7, y:  79.39 },
  { slot: "bot-left",      x:  63.7, y: 145.39 },
  { slot: "bot-mid",       x: 139.7, y: 145.39 },
  { slot: "bot-right",     x: 215.7, y: 145.39 },
] as const;

/* Opacity hierarchy extracted from main 1.svg's 7 <g opacity> wrappers:
 *   full   → OpenAI (top-mid), Angular (mid-left), Node (mid-right)
 *   0.5    → top-left, top-right, mid-far-left, mid-far-right (AWS), bot-mid (Google)
 *   0.3    → bot-left, bot-right
 * This is what gives the card its reading order — the three full-weight
 * brand hexes in the center "I" shape, with the rest fading back. */
const OPACITY_BY_SLOT: Record<HexSlot, number> = {
  "top-left": 0.5,
  "top-mid": 1,
  "top-right": 0.5,
  "mid-far-left": 0.5,
  "mid-left": 1,
  "mid-right": 1,
  "mid-far-right": 0.5,
  "bot-left": 0.3,
  "bot-mid": 0.5,
  "bot-right": 0.3,
};

function Hex({ x, y }: { x: number; y: number }) {
  const dx = x - HEX_BASE[0];
  const dy = y - HEX_BASE[1];
  return (
    <g transform={`translate(${dx} ${dy})`} filter="url(#hex-drop)">
      <path d={HEX_FILL_D} fill="#FDFDFD" fillOpacity="0.5" shapeRendering="crispEdges" />
      <path d={HEX_STROKE_D} fill="none" stroke="#FDFDFD" strokeOpacity="0.25" strokeWidth="1.5" shapeRendering="crispEdges" />
    </g>
  );
}

function LogoFor({ slot }: { slot: HexSlot }) {
  switch (slot) {
    case "top-mid":        return <OpenAILogo />;
    case "mid-left":       return <AngularLogo />;
    case "mid-right":      return <NodeLogo />;
    case "mid-far-right":  return <AwsLogo />;
    case "bot-mid":        return <GoogleLogo />;
    default:               return null;
  }
}

/* ────────────────────────────────────────────────────────────
   Soft under-shadows for the two "elevated" logo hexes (OpenAI,
   Angular). Figma verbatim — each is the hex path duplicated,
   offset by a few pixels, filled black @ 6%, WRAPPED IN A
   Gaussian-blur filter (stdDev 6) with mix-blend-mode: multiply.
   The blur is what creates the soft halo that reads as "lifted".
   ──────────────────────────────────────────────────────────── */
const SHADOW_TOPMID_D =
  "M150.7 26.3901C155.363 23.6978 157.695 22.3517 160.173 21.8248C162.367 21.3587 164.633 21.3587 166.827 21.8248C169.305 22.3517 171.637 23.6978 176.3 26.3901L183.609 30.6099C188.272 33.3022 190.604 34.6483 192.299 36.5315C193.8 38.1978 194.933 40.1609 195.626 42.2933C196.409 44.7035 196.409 47.3957 196.409 52.7802V61.2198C196.409 66.6043 196.409 69.2965 195.626 71.7067C194.933 73.8391 193.8 75.8022 192.299 77.4685C190.604 79.3517 188.272 80.6978 183.609 83.3901L176.3 87.6099C171.637 90.3022 169.305 91.6483 166.827 92.1752C164.633 92.6413 162.367 92.6413 160.173 92.1752C157.695 91.6483 155.363 90.3022 150.7 87.6099L143.391 83.3901C138.728 80.6978 136.396 79.3517 134.701 77.4685C133.2 75.8022 132.067 73.8391 131.374 71.7067C130.591 69.2965 130.591 66.6043 130.591 61.2198V52.7802C130.591 47.3957 130.591 44.7035 131.374 42.2933C132.067 40.1609 133.2 38.1978 134.701 36.5315C136.396 34.6483 138.728 33.3022 143.391 30.6099L150.7 26.3901Z";

const SHADOW_MIDLEFT_D =
  "M93.7 95.3901C98.3631 92.6978 100.695 91.3517 103.173 90.8248C105.367 90.3587 107.633 90.3587 109.827 90.8248C112.305 91.3517 114.637 92.6978 119.3 95.3901L126.609 99.6099C131.272 102.302 133.604 103.648 135.299 105.532C136.8 107.198 137.933 109.161 138.626 111.293C139.409 113.703 139.409 116.396 139.409 121.78V130.22C139.409 135.604 139.409 138.297 138.626 140.707C137.933 142.839 136.8 144.802 135.299 146.468C133.604 148.352 131.272 149.698 126.609 152.39L119.3 156.61C114.637 159.302 112.305 160.648 109.827 161.175C107.633 161.641 105.367 161.641 103.173 161.175C100.695 160.648 98.3631 159.302 93.7 156.61L86.391 152.39C81.7279 149.698 79.3964 148.352 77.7007 146.468C76.2004 144.802 75.067 142.839 74.3741 140.707C73.591 138.297 73.591 135.604 73.591 130.22V121.78C73.591 116.396 73.591 113.703 74.3741 111.293C75.067 109.161 76.2004 107.198 77.7007 105.532C79.3964 103.648 81.7279 102.302 86.391 99.6099L93.7 95.3901Z";

/* ────────────────────────────────────────────────────────────
   Brand logos at their exact Figma coordinates.

   Node.js, Angular, and OpenAI are the Figma vector paths verbatim.
   AWS and Google G were embedded raster in Figma — we replace them
   with native SVG equivalents that scale crisply at any size.
   ──────────────────────────────────────────────────────────── */

function NodeLogo() {
  return (
    <g>
      <path d="M187.102 107.561L184.648 108.919C184.556 108.969 184.5 109.063 184.5 109.165V111.881C184.5 111.983 184.556 112.076 184.648 112.127L187.102 113.486C187.194 113.536 187.307 113.536 187.399 113.486L189.852 112.127C189.943 112.076 190 111.983 190 111.881V109.165C190 109.063 189.943 108.97 189.851 108.919L187.399 107.561C187.353 107.536 187.301 107.523 187.25 107.523C187.198 107.523 187.147 107.536 187.101 107.561M199.725 110.007L199.316 110.233C199.301 110.241 199.292 110.257 199.292 110.274V110.727C199.292 110.744 199.301 110.759 199.316 110.768L199.725 110.994C199.741 111.003 199.759 111.003 199.775 110.994L200.184 110.768C200.199 110.759 200.208 110.744 200.208 110.727V110.274C200.208 110.257 200.199 110.241 200.183 110.233L199.774 110.007C199.767 110.002 199.758 110 199.75 110C199.741 110 199.733 110.002 199.725 110.007Z" fill="#388E3C" />
      <path d="M196.375 104.682L195.181 104.015C195.143 103.994 195.097 103.995 195.06 104.017C195.023 104.039 195 104.078 195 104.121L195 108.147L193.899 107.538C193.853 107.512 193.801 107.5 193.75 107.5C193.699 107.5 193.647 107.512 193.601 107.538H193.602L191.149 108.895C191.057 108.946 191 109.04 191 109.141V111.857C191 111.959 191.057 112.052 191.149 112.103L193.602 113.462C193.694 113.512 193.808 113.512 193.899 113.462L196.353 112.103C196.444 112.053 196.5 111.959 196.5 111.857V104.894C196.5 104.806 196.452 104.725 196.375 104.682ZM194.933 111.229L193.818 111.846C193.776 111.869 193.725 111.869 193.684 111.846L192.568 111.229C192.525 111.206 192.5 111.163 192.5 111.117V109.882C192.5 109.836 192.526 109.793 192.568 109.77L193.683 109.153C193.704 109.141 193.727 109.136 193.75 109.136C193.773 109.136 193.797 109.142 193.818 109.153L194.933 109.77C194.975 109.793 195 109.836 195 109.882V111.117C195 111.163 194.975 111.206 194.933 111.229Z" fill="#37474F" />
      <path d="M187.102 107.561L184.5 111.881C184.5 111.983 184.556 112.076 184.648 112.127L187.102 113.486C187.194 113.536 187.308 113.536 187.399 113.486L190 109.165C190 109.063 189.943 108.97 189.851 108.919L187.399 107.561C187.353 107.536 187.301 107.523 187.25 107.523C187.198 107.523 187.147 107.536 187.101 107.561" fill="#2E7D32" />
      <path d="M187.102 107.561L184.648 108.919C184.556 108.969 184.5 109.063 184.5 109.165L187.102 113.486C187.194 113.536 187.307 113.536 187.399 113.486L189.852 112.127C189.944 112.076 190 111.983 190 111.881L187.399 107.561C187.353 107.536 187.301 107.523 187.25 107.523C187.198 107.523 187.147 107.536 187.101 107.561" fill="#4CAF50" />
      <path d="M202.351 108.896L199.899 107.538C199.853 107.513 199.801 107.5 199.75 107.5C199.699 107.5 199.647 107.513 199.601 107.538L197.149 108.896C197.057 108.946 197 109.042 197 109.147V111.852C197 111.957 197.057 112.054 197.149 112.104L199.603 113.462C199.694 113.513 199.807 113.513 199.899 113.462L201.031 112.836C201.134 112.779 201.133 112.63 201.029 112.573L198.567 111.229C198.526 111.206 198.5 111.163 198.5 111.116V109.882C198.5 109.836 198.525 109.794 198.565 109.772L199.683 109.154H199.682C199.703 109.143 199.726 109.137 199.75 109.137C199.773 109.137 199.796 109.143 199.817 109.154L200.934 109.773C200.975 109.795 201 109.837 201 109.883V110.889C201 110.932 201.022 110.972 201.06 110.993C201.097 111.014 201.143 111.015 201.181 110.993L202.38 110.297C202.454 110.254 202.5 110.174 202.5 110.088V109.148C202.5 109.042 202.443 108.946 202.351 108.896ZM183.852 108.896L181.398 107.538C181.352 107.513 181.301 107.5 181.25 107.5C181.199 107.5 181.148 107.513 181.102 107.538L178.648 108.896C178.557 108.946 178.5 109.042 178.5 109.147V112.88C178.5 112.923 178.523 112.963 178.56 112.984C178.598 113.005 178.644 113.005 178.682 112.983L179.88 112.287C179.954 112.244 180 112.164 180 112.078V109.882C180 109.836 180.025 109.793 180.065 109.771L181.182 109.153C181.203 109.142 181.227 109.137 181.25 109.137C181.273 109.137 181.297 109.142 181.318 109.153L182.435 109.772C182.475 109.794 182.5 109.836 182.5 109.882V112.079C182.5 112.165 182.545 112.245 182.62 112.288L183.819 112.984C183.856 113.006 183.903 113.005 183.94 112.984C183.977 112.963 184 112.923 184 112.88V109.148C184 109.043 183.943 108.946 183.852 108.896Z" fill="#37474F" />
    </g>
  );
}

function AngularLogo() {
  return (
    <g>
      <path d="M114.467 99.0469L104 102.689L105.654 116.251L114.477 121.047L123.347 116.186L125 102.625L114.467 99.0469Z" fill="#BDBDBD" />
      <path d="M123.909 103.31L114.5 100.114V119.894L122.416 115.555L123.909 103.31Z" fill="#B71C1C" />
      <path d="M114.47 100.104L105.09 103.369L106.584 115.618L114.475 119.907L114.5 119.894V100.114L114.47 100.104Z" fill="#DD2C00" />
      <path d="M114.5 101.045V105.799L118.789 115.047H120.993L114.5 101.045Z" fill="#BDBDBD" />
      <path d="M108.006 115.047H110.211L114.5 105.799V101.045L108.006 115.047Z" fill="#EEEEEE" />
      <path d="M114.5 110.047H117.5V112.047H114.5V110.047Z" fill="#BDBDBD" />
      <path d="M111.5 110.047H114.5V112.047H111.5V110.047Z" fill="#EEEEEE" />
    </g>
  );
}

function OpenAILogo() {
  return (
    <path
      fill="#1B1B1B"
      d="M162.924 41.9564C163.196 41.1371 163.29 40.2692 163.2 39.4107C163.109 38.5522 162.837 37.7228 162.401 36.9779C161.074 34.6679 158.406 33.4796 155.801 34.0379C155.08 33.2356 154.16 32.6372 153.134 32.3028C152.109 31.9684 151.013 31.9098 149.957 32.1328C148.902 32.3559 147.924 32.8528 147.121 33.5735C146.318 34.2943 145.719 35.2137 145.384 36.2392C144.538 36.4126 143.739 36.7646 143.04 37.2716C142.341 37.7786 141.759 38.429 141.331 39.1792C139.99 41.4856 140.294 44.3949 142.084 46.3736C141.811 47.1924 141.716 48.0601 141.806 48.9187C141.895 49.7772 142.166 50.6068 142.602 51.3519C143.931 53.6628 146.6 54.851 149.207 54.2919C149.78 54.9372 150.484 55.4528 151.272 55.8043C152.06 56.1559 152.914 56.3352 153.777 56.3304C156.447 56.3327 158.813 54.609 159.629 52.0665C160.474 51.8928 161.273 51.5407 161.972 51.0337C162.671 50.5267 163.254 49.8766 163.681 49.1265C165.007 46.8242 164.701 43.9307 162.924 41.9564ZM153.777 54.738C152.711 54.7397 151.679 54.3662 150.861 53.6829L151.005 53.6013L155.849 50.8052C155.97 50.7345 156.07 50.6337 156.14 50.5126C156.209 50.3915 156.247 50.2543 156.247 50.1146V43.2849L158.295 44.4695C158.316 44.4799 158.33 44.4995 158.334 44.5223V50.1817C158.328 52.6959 156.291 54.7328 153.777 54.738ZM143.984 50.5559C143.449 49.6329 143.257 48.5511 143.442 47.5006L143.585 47.587L148.434 50.3832C148.554 50.4536 148.691 50.4907 148.83 50.4907C148.969 50.4907 149.106 50.4536 149.226 50.3832L155.149 46.9683V49.3328C155.148 49.345 155.145 49.357 155.139 49.3678C155.133 49.3786 155.125 49.3879 155.115 49.3951L150.209 52.2249C148.029 53.4809 145.243 52.734 143.984 50.5559ZM142.708 40.0042C143.246 39.0753 144.095 38.3669 145.106 38.0042V43.7595C145.104 43.8986 145.14 44.0356 145.209 44.1562C145.278 44.2769 145.378 44.3767 145.499 44.4454L151.394 47.8459L149.346 49.0305C149.335 49.0364 149.322 49.0395 149.31 49.0395C149.297 49.0395 149.285 49.0364 149.274 49.0305L144.377 46.2058C142.201 44.9444 141.455 42.161 142.708 39.9803V40.0042ZM159.533 43.9131L153.619 40.479L155.662 39.2992C155.673 39.2933 155.686 39.2902 155.698 39.2902C155.711 39.2902 155.723 39.2933 155.734 39.2992L160.631 42.1289C161.38 42.561 161.99 43.1971 162.391 43.963C162.792 44.7289 162.966 45.593 162.894 46.4544C162.822 47.3158 162.507 48.139 161.985 48.8279C161.463 49.5168 160.755 50.0428 159.945 50.3447V44.5893C159.941 44.4505 159.901 44.3152 159.828 44.1967C159.756 44.0781 159.654 43.9804 159.533 43.9131ZM161.571 40.8484L161.427 40.762L156.588 37.9419C156.467 37.8711 156.33 37.8337 156.19 37.8337C156.05 37.8337 155.912 37.8711 155.792 37.9419L149.873 41.3568V38.9924C149.872 38.9803 149.874 38.9682 149.879 38.9572C149.884 38.9462 149.892 38.9368 149.902 38.93L154.799 36.105C155.549 35.6727 156.407 35.463 157.273 35.5004C158.138 35.5378 158.975 35.8209 159.685 36.3164C160.396 36.812 160.95 37.4995 161.284 38.2987C161.618 39.0978 161.717 39.9756 161.571 40.8292V40.8484H161.571ZM148.756 45.0402L146.708 43.8603C146.698 43.8541 146.689 43.8458 146.682 43.8358C146.675 43.8259 146.671 43.8146 146.669 43.8028V38.1578C146.67 37.2918 146.918 36.444 147.383 35.7136C147.848 34.9832 148.512 34.4003 149.296 34.0331C150.081 33.6658 150.953 33.5295 151.812 33.6399C152.671 33.7503 153.481 34.103 154.147 34.6566L154.003 34.7382L149.159 37.5343C149.038 37.605 148.938 37.7058 148.868 37.8269C148.798 37.948 148.761 38.0852 148.761 38.2249L148.756 45.0403V45.0402ZM149.868 42.642L152.506 41.1217L155.149 42.6421V45.6828L152.516 47.2033L149.873 45.6828L149.868 42.642Z"
    />
  );
}

function AwsLogo() {
  // Hex mid-far-right: bbox x ∈ [233.591, 299.409], y ∈ [74.825, 145.175]
  // → geometric center (266.5, 110). Logo visible bbox (in local coords):
  //   text  x [0, 21], y [4.24, 11]
  //   arc   x [1, 19],  y [17, 18.4]
  //   tri   x [16.7, 18.8], y [16.3, 18.2]
  //   → local center (10.5, 11.3). Translate = center − local = (256, 98.7).
  return (
    <g transform="translate(256 98.7)">
      <text x="0" y="11" fontFamily="Arial, Helvetica, sans-serif" fontSize="13" fontWeight="700" fill="#232F3E" letterSpacing="-0.3">aws</text>
      <path d="M1 17c5 2.8 13 2.8 18 0" fill="none" stroke="#FF9900" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18.8 16.3 L16.7 16.6 L18.3 18.2 Z" fill="#FF9900" />
    </g>
  );
}

function GoogleLogo() {
  // Hex bot-mid: bbox x ∈ [119.591, 185.409], y ∈ [140.825, 211.175]
  // → geometric center (152.5, 176). Google paths occupy x ∈ [0, 18],
  // y ∈ [0, 18.3] → local center (9, 9.15). Translate = (143.5, 166.85).
  return (
    <g transform="translate(143.5 166.85)">
      <path d="M18 9.2c0-.6-.1-1.3-.2-1.9H9.2v3.6h4.9c-.2 1.1-.9 2.1-1.9 2.7v2.2h3c1.8-1.6 2.8-4 2.8-6.6Z" fill="#4285F4" />
      <path d="M9.2 18.3c2.5 0 4.7-.8 6.2-2.3l-3-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.2-3.8H1v2.2c1.6 3.1 4.8 5.2 8.2 5.2Z" fill="#34A853" />
      <path d="M4 10.9c-.2-.6-.3-1.3-.3-2s.1-1.3.3-2V4.8H1C.4 6.1 0 7.5 0 9s.4 2.9 1 4.2l3-2.3Z" fill="#FBBC05" />
      <path d="M9.2 3.6c1.3 0 2.6.5 3.5 1.4l2.6-2.6C13.8.9 11.6 0 9.2 0 5.8 0 2.6 2.1 1 5.2L4 7.4C4.8 5.2 6.8 3.6 9.2 3.6Z" fill="#EA4335" />
    </g>
  );
}

/* ────────────────────────────────────────────────────────────
   CARD
   ──────────────────────────────────────────────────────────── */
export default function HexEcosystemCard() {
  return (
    <svg
      className="block h-full w-full"
      viewBox="0 0 305 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        {/* Peach → white radial gradient — Figma paint0_radial */}
        <radialGradient
          id="hex-card-bg"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(152.5 110) rotate(90.1209) scale(237.001 328.569)"
        >
          <stop stopColor="#F0AFAF" />
          <stop offset="1" stopColor="#ffffff" />
        </radialGradient>

        <clipPath id="hex-card-clip">
          <rect x="0.5" y="0.5" width="304" height="219" rx="15.5" />
        </clipPath>

        {/*
          Per-hex drop shadow (Figma filter0_d..filter7_d..filter9_d).
          Recipe: shrink alpha (erode 4) → offset down 1 → blur 4 →
          darken to 5% black → multiply blend. Produces the soft
          inset-edge shadow that makes each hex read as a card.
        */}
        <filter id="hex-drop" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox">
          <feMorphology radius="4" operator="erode" in="SourceAlpha" result="erode" />
          <feOffset dy="1" in="erode" result="offset" />
          <feGaussianBlur stdDeviation="4" in="offset" result="blurred" />
          <feColorMatrix in="blurred" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/*
          Soft halo behind each elevated logo hex (Figma filter8_f,
          filter10_f). Just a Gaussian blur — the opacity comes from
          the path's own fill-opacity=0.06.
        */}
        <filter id="hex-halo" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Background + border */}
      <rect x="0.5" y="0.5" width="304" height="219" rx="15.5" fill="url(#hex-card-bg)" />
      <rect x="0.5" y="0.5" width="304" height="219" rx="15.5" fill="none" stroke="#F1E2E2" />

      {/* Clipped inner content */}
      <g clipPath="url(#hex-card-clip)">
        {/*
          Halo shadows for the two elevated hexes — rendered BEFORE
          the hexes themselves so they sit underneath. Each is a
          duplicate of the hex path, offset a few pixels, filled 6%
          black, then blurred.
        */}
        <g filter="url(#hex-halo)">
          <path d={SHADOW_TOPMID_D} fill="#000000" fillOpacity="0.06" style={{ mixBlendMode: "multiply" }} />
        </g>
        <g filter="url(#hex-halo)">
          <path d={SHADOW_MIDLEFT_D} fill="#000000" fillOpacity="0.06" style={{ mixBlendMode: "multiply" }} />
        </g>

        {/*
          10 hexagons — each wrapped in the <g opacity> per Figma's
          position-specific grouping. The logo (when present) lives
          inside the same group so it inherits the hex's opacity —
          matches how Icon Group (3) [Google @ 0.5] and Icon Group (5)
          [AWS @ 0.5] are authored in the breakdown SVGs.
        */}
        {HEXES.map(({ slot, x, y }) => {
          const opacity = OPACITY_BY_SLOT[slot];
          const content = (
            <>
              <Hex x={x} y={y} />
              <LogoFor slot={slot} />
            </>
          );
          return opacity < 1 ? (
            <g key={slot} opacity={opacity}>{content}</g>
          ) : (
            <g key={slot}>{content}</g>
          );
        })}
      </g>
    </svg>
  );
}

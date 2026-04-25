/**
 * Network illustration for Card 4 (TGlobalCard).
 * Lifted 1:1 from Figma's card4-illustrations.svg (node 107-21106).
 *
 * Why this is inlined instead of served as /public/problem/*.svg:
 *   Every glowing dot uses a <foreignObject> with CSS `backdrop-filter` to
 *   blur whatever sits behind it. Loaded via <img>, the SVG renders in an
 *   isolated context — the "background" is just its own transparent canvas,
 *   so the glass effect disappears. Inlined in the DOM, the backdrop-filter
 *   resolves against the card's purple gradient, and the dots read like
 *   frosted glass exactly as Figma shows.
 *
 * IDs are prefixed `tg-` to avoid collisions with any other inline SVGs on
 * the page. The filters and per-dot gradients are all retained as Figma
 * exported them because they use userSpaceOnUse coordinates tied to each
 * dot's absolute position — sharing them across dots would misalign the
 * lighting direction.
 */

/** Per-dot data — absolute coords from the Figma export. Index maps to the
 *  filter / gradient / clip-path suffix in <defs> below. */
const DOTS = [
  { cx: 175, cy: 147, foX: 161.5, foY: 133.5 },
  { cx: 4, cy: 146.25, foX: -9.5, foY: 132.75 },
  { cx: 64, cy: 123.75, foX: 50.5, foY: 110.25 },
  { cx: 112.75, cy: 147, foX: 99.25, foY: 133.5 },
  { cx: 34, cy: 73.5, foX: 20.5, foY: 60 },
  { cx: 112.75, cy: 73.5, foX: 99.25, foY: 60 },
  { cx: 175, cy: 123.75, foX: 161.5, foY: 110.25 },
] as const;

/** Re-usable "drop-shadow + inner-shadow" filter primitive used by every
 *  4.5-radius dot. Duplicated per-index below so filterUnits="userSpaceOnUse"
 *  bounding boxes match each dot's absolute position. */
function DotDropShadowFilter({ id, x, y }: { readonly id: string; readonly x: number; readonly y: number }) {
  return (
    <filter id={id} x={x} y={y} width="27" height="48" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
      <feFlood floodOpacity="0" result="BackgroundImageFix" />
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
      <feMorphology radius="12" operator="erode" in="SourceAlpha" result={`effect1_${id}`} />
      <feOffset dy="24" />
      <feGaussianBlur stdDeviation="9" />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0" />
      <feBlend mode="multiply" in2="BackgroundImageFix" result={`drop_${id}`} />
      <feBlend mode="normal" in="SourceGraphic" in2={`drop_${id}`} result="shape" />
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha2" />
      <feOffset />
      <feGaussianBlur stdDeviation="3" />
      <feComposite in2="hardAlpha2" operator="arithmetic" k2="-1" k3="1" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.972549 0 0 0 0 0.972549 0 0 0 0 0.972549 0 0 0 0.25 0" />
      <feBlend mode="normal" in2="shape" />
    </filter>
  );
}

/** Edge-highlight gradient used on every dot's 4.125-radius stroke. */
function DotStrokeGradient({ id, cx, cy }: { readonly id: string; readonly cx: number; readonly cy: number }) {
  // Same directional gradient Figma uses: top ~40% white → middle transparent → bottom 10% white.
  // dx/dy below mirror the offsets Figma computed per-dot.
  return (
    <linearGradient id={id} x1={cx} y1={cy - 4.5} x2={cx + 3.915} y2={cy + 5.383} gradientUnits="userSpaceOnUse">
      <stop stopColor="white" stopOpacity="0.4" />
      <stop offset="0.4" stopColor="white" stopOpacity="0.01" />
      <stop offset="0.6" stopColor="white" stopOpacity="0.01" />
      <stop offset="1" stopColor="white" stopOpacity="0.1" />
    </linearGradient>
  );
}

export function TGlobalNetwork({ className }: { readonly className?: string }) {
  return (
    <svg
      width={231}
      height={251}
      viewBox="0 0 231 251"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <mask id="tg-mask" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="224" height="251">
        <rect width="224" height="251" fill="url(#tg-mask-gradient)" />
      </mask>

      <g mask="url(#tg-mask)">
        {/* Background rails — the thin network lattice under the dots */}
        <path opacity="0.1" d="M21.25 216.375V187.13C21.25 184.001 22.4719 180.996 24.6552 178.755L60.5948 141.87C62.7781 139.629 64 136.624 64 133.495V120.375C64 113.748 69.3726 108.375 76 108.375H134.065C137.227 108.375 140.26 107.127 142.507 104.903L212.875 35.25" stroke="#404040" strokeWidth="1.125" />
        <path d="M21.25 216.375V187.13C21.25 184.001 22.4719 180.996 24.6552 178.755L60.5948 141.87C62.7781 139.629 64 136.624 64 133.495V120.375C64 113.748 69.3726 108.375 76 108.375H112.375" stroke="#4B28FF" strokeWidth="1.125" />
        <path opacity="0.1" d="M-13.625 146.625H263.125" stroke="#404040" strokeWidth="1.125" />
        <path opacity="0.1" d="M32.5 73.5L60.1275 119.435C62.2977 123.043 66.2002 125.25 70.4108 125.25H211.375C218.002 125.25 223.375 130.623 223.375 137.25V215.25" stroke="#404040" strokeWidth="1.125" />
        <path opacity="0.1" d="M4 146.625V85.125C4 78.4976 9.37258 73.125 16 73.125H299.875" stroke="#F8F8F8" strokeWidth="1.125" />
        <path opacity="0.1" d="M4.75 -25.125V61.125C4.75 67.7524 10.1226 73.125 16.75 73.125H299.5" stroke="#404040" strokeWidth="1.125" />
        <path opacity="0.1" d="M-12.5 198.75H163C169.627 198.75 175 193.377 175 186.75V-4.5" stroke="#404040" strokeWidth="1.125" />
        <path opacity="0.1" d="M54.625 217.125L109.658 149.942C111.415 147.797 112.375 145.11 112.375 142.338V-15.375" stroke="#404040" strokeWidth="1.125" />

        {/* 7 glassy dots — each a foreignObject backdrop-blur + filtered circle + white core */}
        {DOTS.map((dot, i) => (
          <g key={i}>
            <foreignObject x={dot.foX} y={dot.foY} width="27" height="48">
              <div
                style={{
                  backdropFilter: "blur(4.5px)",
                  WebkitBackdropFilter: "blur(4.5px)",
                  clipPath: `url(#tg-bgblur-${i}-clip)`,
                  height: "100%",
                  width: "100%",
                }}
              />
            </foreignObject>
            <g filter={`url(#tg-filter-${i})`} data-figma-bg-blur-radius="9">
              <circle cx={dot.cx} cy={dot.cy} r="4.5" fill="#F8F8F8" fillOpacity="0.01" shapeRendering="crispEdges" />
              <circle cx={dot.cx} cy={dot.cy} r="4.5" fill="#121212" fillOpacity="0.3" shapeRendering="crispEdges" />
              <circle cx={dot.cx} cy={dot.cy} r="4.125" stroke={`url(#tg-dot-stroke-${i})`} strokeOpacity="0.25" strokeWidth="0.75" shapeRendering="crispEdges" />
            </g>
            <circle cx={dot.cx} cy={dot.cy} r="2.25" fill="#F8F8F8" />
          </g>
        ))}

        {/* Extra tiny white dot (no glass, no ring) that anchors the top-center beam */}
        <circle cx="112.75" cy="108" r="2.25" fill="#F8F8F8" />
      </g>

      {/* "40% Faster" pill — outside the mask so it stays fully opaque at the corner */}
      <g filter="url(#tg-filter-pill)">
        <g clipPath="url(#tg-clip-pill)">
          <foreignObject x="119" y="24" width="112" height="63">
            <div
              style={{
                backdropFilter: "blur(4.5px)",
                WebkitBackdropFilter: "blur(4.5px)",
                clipPath: "url(#tg-bgblur-pill-clip)",
                height: "100%",
                width: "100%",
              }}
            />
          </foreignObject>
          <g filter="url(#tg-filter-pill-inner)" data-figma-bg-blur-radius="9">
            <rect x="128" y="33" width="94" height="24" rx="12" fill="#F8F8F8" fillOpacity="0.01" />
            <rect x="128" y="33" width="94" height="24" rx="12" fill="#7358FD" />
            <rect x="128.562" y="33.5625" width="92.875" height="22.875" rx="11.4375" stroke="url(#tg-pill-stroke)" strokeOpacity="0.25" strokeWidth="1.125" />
            {/* "40% Faster" path-rendered text */}
            <path d="M141.537 48.5C141.467 48.5 141.407 48.479 141.358 48.437C141.316 48.388 141.295 48.3285 141.295 48.2585V46.7465H137.893C137.823 46.7465 137.764 46.7255 137.715 46.6835C137.673 46.6345 137.652 46.575 137.652 46.505V46.085C137.652 46.057 137.659 46.015 137.673 45.959C137.694 45.896 137.725 45.833 137.767 45.77L140.917 41.3285C141.001 41.2095 141.131 41.15 141.306 41.15H142.062C142.132 41.15 142.188 41.1745 142.23 41.2235C142.279 41.2655 142.303 41.3215 142.303 41.3915V45.833H143.248C143.325 45.833 143.385 45.8575 143.427 45.9065C143.476 45.9485 143.5 46.0045 143.5 46.0745V46.505C143.5 46.575 143.476 46.6345 143.427 46.6835C143.385 46.7255 143.329 46.7465 143.259 46.7465H142.303V48.2585C142.303 48.3285 142.279 48.388 142.23 48.437C142.188 48.479 142.132 48.5 142.062 48.5H141.537ZM138.775 45.854H141.306V42.2525L138.775 45.854ZM147.176 48.605C146.693 48.605 146.284 48.5315 145.948 48.3845C145.619 48.2305 145.349 48.0205 145.139 47.7545C144.929 47.4885 144.775 47.184 144.677 46.841C144.586 46.498 144.534 46.134 144.52 45.749C144.513 45.56 144.506 45.3605 144.499 45.1505C144.499 44.9405 144.499 44.7305 144.499 44.5205C144.506 44.3035 144.513 44.097 144.52 43.901C144.527 43.516 144.579 43.152 144.677 42.809C144.782 42.459 144.936 42.1545 145.139 41.8955C145.349 41.6295 145.622 41.423 145.958 41.276C146.294 41.122 146.7 41.045 147.176 41.045C147.659 41.045 148.065 41.122 148.394 41.276C148.73 41.423 149.003 41.6295 149.213 41.8955C149.423 42.1545 149.577 42.459 149.675 42.809C149.78 43.152 149.836 43.516 149.843 43.901C149.85 44.097 149.854 44.3035 149.854 44.5205C149.861 44.7305 149.861 44.9405 149.854 45.1505C149.854 45.3605 149.85 45.56 149.843 45.749C149.836 46.134 149.78 46.498 149.675 46.841C149.577 47.184 149.423 47.4885 149.213 47.7545C149.01 48.0205 148.741 48.2305 148.405 48.3845C148.076 48.5315 147.666 48.605 147.176 48.605ZM147.176 47.7125C147.722 47.7125 148.125 47.534 148.384 47.177C148.65 46.813 148.786 46.3195 148.793 45.6965C148.807 45.4935 148.814 45.2975 148.814 45.1085C148.814 44.9125 148.814 44.72 148.814 44.531C148.814 44.335 148.807 44.1425 148.793 43.9535C148.786 43.3445 148.65 42.858 148.384 42.494C148.125 42.123 147.722 41.9375 147.176 41.9375C146.637 41.9375 146.235 42.123 145.969 42.494C145.71 42.858 145.573 43.3445 145.559 43.9535C145.559 44.1425 145.556 44.335 145.549 44.531C145.549 44.72 145.549 44.9125 145.549 45.1085C145.556 45.2975 145.559 45.4935 145.559 45.6965C145.573 46.3195 145.713 46.813 145.979 47.177C146.245 47.534 146.644 47.7125 147.176 47.7125ZM151.657 48.5C151.51 48.5 151.437 48.43 151.437 48.29C151.437 48.248 151.451 48.2095 151.479 48.1745L156.666 41.3495C156.715 41.2865 156.76 41.2375 156.802 41.2025C156.851 41.1675 156.921 41.15 157.012 41.15H157.359C157.506 41.15 157.579 41.22 157.579 41.36C157.579 41.402 157.565 41.4405 157.537 41.4755L152.361 48.3005C152.312 48.3635 152.263 48.4125 152.214 48.4475C152.172 48.4825 152.102 48.5 152.004 48.5H151.657ZM156.466 48.563C156.004 48.563 155.644 48.4335 155.385 48.1745C155.126 47.9155 154.982 47.576 154.954 47.156C154.947 46.974 154.944 46.82 154.944 46.694C154.944 46.561 154.947 46.3965 154.954 46.2005C154.975 45.7805 155.112 45.441 155.364 45.182C155.616 44.916 155.983 44.783 156.466 44.783C156.956 44.783 157.324 44.916 157.569 45.182C157.821 45.441 157.961 45.7805 157.989 46.2005C158.003 46.3965 158.01 46.561 158.01 46.694C158.01 46.82 158.003 46.974 157.989 47.156C157.961 47.576 157.814 47.9155 157.548 48.1745C157.289 48.4335 156.928 48.563 156.466 48.563ZM156.466 47.87C156.648 47.87 156.792 47.8315 156.897 47.7545C157.009 47.6775 157.089 47.583 157.138 47.471C157.187 47.352 157.215 47.233 157.222 47.114C157.236 46.925 157.243 46.778 157.243 46.673C157.243 46.561 157.236 46.4175 157.222 46.2425C157.215 46.0535 157.156 45.8785 157.044 45.7175C156.932 45.5565 156.739 45.476 156.466 45.476C156.2 45.476 156.011 45.5565 155.899 45.7175C155.794 45.8785 155.735 46.0535 155.721 46.2425C155.714 46.4175 155.71 46.561 155.71 46.673C155.71 46.778 155.714 46.925 155.721 47.114C155.735 47.233 155.763 47.352 155.805 47.471C155.854 47.583 155.931 47.6775 156.036 47.7545C156.148 47.8315 156.291 47.87 156.466 47.87ZM152.539 44.8355C152.077 44.8355 151.717 44.713 151.458 44.468C151.199 44.223 151.055 43.8905 151.027 43.4705C151.02 43.2885 151.017 43.1345 151.017 43.0085C151.017 42.8755 151.02 42.711 151.027 42.515C151.048 42.095 151.185 41.7555 151.437 41.4965C151.689 41.2305 152.056 41.0975 152.539 41.0975C153.029 41.0975 153.397 41.2305 153.642 41.4965C153.894 41.7555 154.03 42.095 154.051 42.515C154.065 42.711 154.072 42.8755 154.072 43.0085C154.072 43.1345 154.065 43.2885 154.051 43.4705C154.03 43.8905 153.887 44.223 153.621 44.468C153.362 44.713 153.001 44.8355 152.539 44.8355ZM152.539 44.1845C152.721 44.1845 152.865 44.146 152.97 44.069C153.082 43.992 153.162 43.8975 153.211 43.7855C153.26 43.6665 153.288 43.5475 153.295 43.4285C153.309 43.2395 153.316 43.0925 153.316 42.9875C153.316 42.8755 153.309 42.732 153.295 42.557C153.288 42.368 153.225 42.193 153.106 42.032C152.994 41.871 152.805 41.7905 152.539 41.7905C152.273 41.7905 152.084 41.871 151.972 42.032C151.867 42.193 151.808 42.368 151.794 42.557C151.787 42.732 151.783 42.8755 151.783 42.9875C151.783 43.0925 151.787 43.2395 151.794 43.4285C151.808 43.5475 151.836 43.6665 151.878 43.7855C151.927 43.8975 152.004 43.992 152.109 44.069C152.214 44.146 152.357 44.1845 152.539 44.1845ZM162.229 48.5C162.152 48.5 162.093 48.479 162.051 48.437C162.009 48.388 161.988 48.3285 161.988 48.2585V41.402C161.988 41.325 162.009 41.2655 162.051 41.2235C162.093 41.1745 162.152 41.15 162.229 41.15H166.513C166.59 41.15 166.65 41.1745 166.692 41.2235C166.734 41.2655 166.755 41.325 166.755 41.402V41.822C166.755 41.899 166.734 41.9585 166.692 42.0005C166.65 42.0425 166.59 42.0635 166.513 42.0635H163.006V44.51H166.303C166.38 44.51 166.44 44.5345 166.482 44.5835C166.524 44.6255 166.545 44.685 166.545 44.762V45.182C166.545 45.252 166.524 45.3115 166.482 45.3605C166.44 45.4025 166.38 45.4235 166.303 45.4235H163.006V48.2585C163.006 48.3285 162.982 48.388 162.933 48.437C162.891 48.479 162.831 48.5 162.754 48.5H162.229ZM169.198 48.605C168.848 48.605 168.529 48.535 168.242 48.395C167.955 48.255 167.724 48.066 167.549 47.828C167.374 47.59 167.287 47.3205 167.287 47.0195C167.287 46.5365 167.483 46.1515 167.875 45.8645C168.267 45.5775 168.778 45.3885 169.408 45.2975L170.972 45.077V44.7725C170.972 44.4365 170.874 44.174 170.678 43.985C170.489 43.796 170.178 43.7015 169.744 43.7015C169.429 43.7015 169.173 43.7645 168.977 43.8905C168.788 44.0165 168.655 44.1775 168.578 44.3735C168.536 44.4785 168.463 44.531 168.358 44.531H167.885C167.808 44.531 167.749 44.51 167.707 44.468C167.672 44.419 167.654 44.363 167.654 44.3C167.654 44.195 167.693 44.0655 167.77 43.9115C167.854 43.7575 167.98 43.607 168.148 43.46C168.316 43.313 168.529 43.1905 168.788 43.0925C169.054 42.9875 169.376 42.935 169.754 42.935C170.174 42.935 170.528 42.991 170.815 43.103C171.102 43.208 171.326 43.3515 171.487 43.5335C171.655 43.7155 171.774 43.922 171.844 44.153C171.921 44.384 171.959 44.6185 171.959 44.8565V48.2585C171.959 48.3285 171.935 48.388 171.886 48.437C171.844 48.479 171.788 48.5 171.718 48.5H171.235C171.158 48.5 171.098 48.479 171.056 48.437C171.014 48.388 170.993 48.3285 170.993 48.2585V47.807C170.902 47.933 170.78 48.059 170.626 48.185C170.472 48.304 170.279 48.4055 170.048 48.4895C169.817 48.5665 169.534 48.605 169.198 48.605ZM169.418 47.8175C169.705 47.8175 169.968 47.758 170.206 47.639C170.444 47.513 170.629 47.3205 170.762 47.0615C170.902 46.8025 170.972 46.477 170.972 46.085V45.791L169.754 45.9695C169.257 46.0395 168.883 46.1585 168.631 46.3265C168.379 46.4875 168.253 46.694 168.253 46.946C168.253 47.142 168.309 47.3065 168.421 47.4395C168.54 47.5655 168.687 47.66 168.862 47.723C169.044 47.786 169.229 47.8175 169.418 47.8175ZM175.359 48.605C174.967 48.605 174.631 48.556 174.351 48.458C174.071 48.36 173.843 48.241 173.668 48.101C173.493 47.961 173.36 47.821 173.269 47.681C173.185 47.541 173.14 47.429 173.133 47.345C173.126 47.268 173.15 47.2085 173.206 47.1665C173.262 47.1245 173.318 47.1035 173.374 47.1035H173.836C173.878 47.1035 173.91 47.1105 173.931 47.1245C173.959 47.1315 173.994 47.1595 174.036 47.2085C174.127 47.3065 174.228 47.4045 174.34 47.5025C174.452 47.6005 174.589 47.681 174.75 47.744C174.918 47.807 175.124 47.8385 175.369 47.8385C175.726 47.8385 176.02 47.772 176.251 47.639C176.482 47.499 176.598 47.296 176.598 47.03C176.598 46.855 176.549 46.715 176.451 46.61C176.36 46.505 176.192 46.4105 175.947 46.3265C175.709 46.2425 175.38 46.155 174.96 46.064C174.54 45.966 174.207 45.847 173.962 45.707C173.717 45.56 173.542 45.3885 173.437 45.1925C173.332 44.9895 173.28 44.762 173.28 44.51C173.28 44.251 173.357 44.0025 173.511 43.7645C173.665 43.5195 173.889 43.32 174.183 43.166C174.484 43.012 174.858 42.935 175.306 42.935C175.67 42.935 175.982 42.9805 176.241 43.0715C176.5 43.1625 176.713 43.278 176.881 43.418C177.049 43.551 177.175 43.684 177.259 43.817C177.343 43.95 177.389 44.062 177.396 44.153C177.403 44.223 177.382 44.2825 177.333 44.3315C177.284 44.3735 177.228 44.3945 177.165 44.3945H176.724C176.675 44.3945 176.633 44.384 176.598 44.363C176.57 44.342 176.542 44.3175 176.514 44.2895C176.444 44.1985 176.36 44.1075 176.262 44.0165C176.171 43.9255 176.048 43.852 175.894 43.796C175.747 43.733 175.551 43.7015 175.306 43.7015C174.956 43.7015 174.694 43.775 174.519 43.922C174.344 44.069 174.256 44.2545 174.256 44.4785C174.256 44.6115 174.295 44.7305 174.372 44.8355C174.449 44.9405 174.596 45.035 174.813 45.119C175.03 45.203 175.352 45.294 175.779 45.392C176.241 45.483 176.605 45.6055 176.871 45.7595C177.137 45.9135 177.326 46.092 177.438 46.295C177.55 46.498 177.606 46.7325 177.606 46.9985C177.606 47.2925 177.518 47.562 177.343 47.807C177.175 48.052 176.923 48.248 176.587 48.395C176.258 48.535 175.849 48.605 175.359 48.605ZM180.943 48.5C180.551 48.5 180.232 48.4265 179.987 48.2795C179.742 48.1255 179.564 47.912 179.452 47.639C179.34 47.359 179.284 47.03 179.284 46.652V43.88H178.465C178.395 43.88 178.335 43.859 178.286 43.817C178.244 43.768 178.223 43.7085 178.223 43.6385V43.2815C178.223 43.2115 178.244 43.1555 178.286 43.1135C178.335 43.0645 178.395 43.04 178.465 43.04H179.284V41.2865C179.284 41.2165 179.305 41.1605 179.347 41.1185C179.396 41.0695 179.455 41.045 179.525 41.045H180.019C180.089 41.045 180.145 41.0695 180.187 41.1185C180.236 41.1605 180.26 41.2165 180.26 41.2865V43.04H181.562C181.632 43.04 181.688 43.0645 181.73 43.1135C181.779 43.1555 181.804 43.2115 181.804 43.2815V43.6385C181.804 43.7085 181.779 43.768 181.73 43.817C181.688 43.859 181.632 43.88 181.562 43.88H180.26V46.5785C180.26 46.9075 180.316 47.1665 180.428 47.3555C180.54 47.5445 180.74 47.639 181.027 47.639H181.667C181.737 47.639 181.793 47.6635 181.835 47.7125C181.884 47.7545 181.909 47.8105 181.909 47.8805V48.2585C181.909 48.3285 181.884 48.388 181.835 48.437C181.793 48.479 181.737 48.5 181.667 48.5H180.943ZM185.086 48.605C184.365 48.605 183.791 48.3845 183.364 47.9435C182.937 47.4955 182.703 46.8865 182.661 46.1165C182.654 46.0255 182.65 45.91 182.65 45.77C182.65 45.623 182.654 45.504 182.661 45.413C182.689 44.916 182.804 44.482 183.007 44.111C183.21 43.733 183.487 43.4425 183.837 43.2395C184.194 43.0365 184.61 42.935 185.086 42.935C185.618 42.935 186.063 43.047 186.42 43.271C186.784 43.495 187.06 43.8135 187.249 44.2265C187.438 44.6395 187.533 45.1225 187.533 45.6755V45.854C187.533 45.931 187.508 45.9905 187.459 46.0325C187.417 46.0745 187.361 46.0955 187.291 46.0955H183.658C183.658 46.1025 183.658 46.1165 183.658 46.1375C183.658 46.1585 183.658 46.176 183.658 46.19C183.672 46.477 183.735 46.7465 183.847 46.9985C183.959 47.2435 184.12 47.443 184.33 47.597C184.54 47.751 184.792 47.828 185.086 47.828C185.338 47.828 185.548 47.7895 185.716 47.7125C185.884 47.6355 186.021 47.5515 186.126 47.4605C186.231 47.3625 186.301 47.289 186.336 47.24C186.399 47.149 186.448 47.0965 186.483 47.0825C186.518 47.0615 186.574 47.051 186.651 47.051H187.155C187.225 47.051 187.281 47.072 187.323 47.114C187.372 47.149 187.393 47.2015 187.386 47.2715C187.379 47.3765 187.323 47.506 187.218 47.66C187.113 47.807 186.962 47.954 186.766 48.101C186.57 48.248 186.332 48.3705 186.052 48.4685C185.772 48.5595 185.45 48.605 185.086 48.605ZM183.658 45.371H186.535V45.3395C186.535 45.0245 186.476 44.7445 186.357 44.4995C186.245 44.2545 186.08 44.062 185.863 43.922C185.646 43.775 185.387 43.7015 185.086 43.7015C184.785 43.7015 184.526 43.775 184.309 43.922C184.099 44.062 183.938 44.2545 183.826 44.4995C183.714 44.7445 183.658 45.0245 183.658 45.3395V45.371ZM189.03 48.5C188.96 48.5 188.9 48.479 188.851 48.437C188.809 48.388 188.788 48.3285 188.788 48.2585V43.292C188.788 43.222 188.809 43.1625 188.851 43.1135C188.9 43.0645 188.96 43.04 189.03 43.04H189.513C189.583 43.04 189.642 43.0645 189.691 43.1135C189.74 43.1625 189.765 43.222 189.765 43.292V43.754C189.905 43.516 190.097 43.3375 190.342 43.2185C190.587 43.0995 190.881 43.04 191.224 43.04H191.644C191.714 43.04 191.77 43.0645 191.812 43.1135C191.854 43.1555 191.875 43.2115 191.875 43.2815V43.712C191.875 43.782 191.854 43.838 191.812 43.88C191.77 43.922 191.714 43.943 191.644 43.943H191.014C190.636 43.943 190.339 44.055 190.122 44.279C189.905 44.496 189.796 44.7935 189.796 45.1715V48.2585C189.796 48.3285 189.772 48.388 189.723 48.437C189.674 48.479 189.614 48.5 189.544 48.5H189.03Z" fill="#F8F8F8" fillOpacity="0.95" />
            {/* Sparkle + icon inside pill */}
            <g clipPath="url(#tg-clip-sparkle)">
              <circle opacity="0.1" cx="210" cy="45" r="9" fill="#F8F8F8" />
              <g opacity="0.5" filter="url(#tg-filter-sparkle-inner)">
                <path d="M210.75 43.125C210.75 43.7463 211.254 44.25 211.875 44.25H212.25C212.664 44.25 213 44.5858 213 45C213 45.4142 212.664 45.75 212.25 45.75H211.875C211.254 45.75 210.75 46.2537 210.75 46.875V47.25C210.75 47.6642 210.414 48 210 48C209.586 48 209.25 47.6642 209.25 47.25V46.875C209.25 46.2537 208.746 45.75 208.125 45.75H207.75C207.336 45.75 207 45.4142 207 45C207 44.5858 207.336 44.25 207.75 44.25H208.125C208.746 44.25 209.25 43.7463 209.25 43.125V42.75C209.25 42.3358 209.586 42 210 42C210.414 42 210.75 42.3358 210.75 42.75V43.125Z" fill="#F8F8F8" />
              </g>
            </g>
          </g>
        </g>
        <rect x="125.562" y="30.5625" width="98.875" height="28.875" rx="14.4375" stroke="#F8F8F8" strokeOpacity="0.4" strokeWidth="1.125" shapeRendering="crispEdges" />
      </g>

      {/* Center X / target glyph (4 arc corners + 4 diagonals + square) */}
      <path opacity="0.25" d="M104.738 105.512C104.105 104.879 103.75 104.02 103.75 103.125C103.75 102.23 104.105 101.371 104.738 100.738C105.371 100.105 106.23 99.7495 107.125 99.7495C108.02 99.7495 108.879 100.105 109.512 100.738" stroke="#F8F8F8" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path opacity="0.25" d="M114.488 100.738C115.121 100.105 115.98 99.7495 116.875 99.7495C117.77 99.7495 118.629 100.105 119.262 100.738C119.895 101.371 120.251 102.23 120.251 103.125C120.251 104.02 119.895 104.879 119.262 105.512" stroke="#F8F8F8" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path opacity="0.25" d="M119.262 110.488C119.895 111.121 120.251 111.98 120.251 112.875C120.251 113.77 119.895 114.629 119.262 115.262C118.629 115.895 117.77 116.251 116.875 116.251C115.98 116.251 115.121 115.895 114.488 115.262" stroke="#F8F8F8" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path opacity="0.25" d="M109.512 115.262C108.879 115.895 108.02 116.251 107.125 116.251C106.23 116.251 105.371 115.895 104.738 115.262C104.105 114.629 103.75 113.77 103.75 112.875C103.75 111.98 104.105 111.121 104.738 110.488" stroke="#F8F8F8" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M114.25 105.75L116.875 103.125" stroke="#F8F8F8" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M107.125 112.875L109.75 110.25" stroke="#F8F8F8" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M114.25 110.25L116.875 112.875" stroke="#F8F8F8" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M107.125 103.125L109.75 105.75" stroke="#F8F8F8" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M114.25 105.75H109.75V110.25H114.25V105.75Z" stroke="#F8F8F8" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />

      {/* Larger dot at (175, 72.5) */}
      <foreignObject x="158.5" y="56" width="33" height="54">
        <div
          style={{
            backdropFilter: "blur(4.5px)",
            WebkitBackdropFilter: "blur(4.5px)",
            clipPath: "url(#tg-bgblur-big-clip)",
            height: "100%",
            width: "100%",
          }}
        />
      </foreignObject>
      <g filter="url(#tg-filter-big)" data-figma-bg-blur-radius="9">
        <circle cx="175" cy="72.5" r="7.5" fill="#F8F8F8" fillOpacity="0.01" shapeRendering="crispEdges" />
        <circle cx="175" cy="72.5" r="7.5" fill="#121212" fillOpacity="0.3" shapeRendering="crispEdges" />
        <circle cx="175" cy="72.5" r="7.125" stroke="url(#tg-big-stroke)" strokeOpacity="0.25" strokeWidth="0.75" shapeRendering="crispEdges" />
      </g>
      <circle cx="175" cy="72.5" r="3.75" fill="#F8F8F8" />

      {/* Cursor / arrow glyph */}
      <path d="M181.813 77.8873C181.672 77.8367 181.529 77.7854 181.408 77.754C181.294 77.7243 181.073 77.6749 180.836 77.757C180.564 77.851 180.351 78.0645 180.257 78.3361C180.175 78.573 180.224 78.7939 180.254 78.9084C180.285 79.029 180.337 79.1719 180.387 79.3127L183.968 89.2873C184.031 89.4624 184.091 89.6304 184.15 89.7598C184.201 89.8692 184.315 90.1084 184.563 90.2436C184.835 90.3914 185.162 90.3957 185.438 90.2551C185.69 90.1264 185.81 89.8903 185.864 89.7823C185.926 89.6545 185.991 89.4881 186.058 89.3147L187.67 85.1702L191.815 83.5585C191.988 83.4911 192.154 83.4264 192.282 83.3635C192.39 83.3104 192.626 83.1899 192.755 82.9379C192.896 82.6624 192.891 82.3353 192.744 82.0635C192.608 81.815 192.369 81.7007 192.26 81.6505C192.13 81.591 191.962 81.5307 191.787 81.4679L181.813 77.8873Z" fill="#121212" stroke="#F8F8F8" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round" />

      <defs>
        <radialGradient id="tg-mask-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(112 125.5) rotate(90) scale(168.827 150.667)">
          <stop stopColor="#D9D9D9" />
          <stop offset="0.751624" stopColor="#737373" stopOpacity="0" />
        </radialGradient>

        {/* Per-dot drop-shadow filters + bgblur clipPaths + stroke gradients */}
        {DOTS.map((dot, i) => (
          <g key={i}>
            <DotDropShadowFilter id={`tg-filter-${i}`} x={dot.foX} y={dot.foY} />
            <clipPath id={`tg-bgblur-${i}-clip`} transform={`translate(${-dot.foX} ${-dot.foY})`}>
              <circle cx={dot.cx} cy={dot.cy} r="4.5" />
            </clipPath>
            <DotStrokeGradient id={`tg-dot-stroke-${i}`} cx={dot.cx} cy={dot.cy} />
          </g>
        ))}

        {/* Pill filter (drop + inner shadow) */}
        <filter id="tg-filter-pill" x="119" y="30" width="112" height="60" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="12" operator="erode" in="SourceAlpha" result="ds1" />
          <feOffset dy="24" />
          <feGaussianBlur stdDeviation="9" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0" />
          <feBlend mode="multiply" in2="BackgroundImageFix" result="pillDrop" />
          <feBlend mode="normal" in="SourceGraphic" in2="pillDrop" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha2" />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha2" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.972549 0 0 0 0 0.972549 0 0 0 0 0.972549 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" />
        </filter>

        <filter id="tg-filter-pill-inner" x="119" y="24" width="112" height="63" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="12" operator="erode" in="SourceAlpha" result="ds" />
          <feOffset dy="24" />
          <feGaussianBlur stdDeviation="9" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0" />
          <feBlend mode="multiply" in2="BackgroundImageFix" result="pd" />
          <feBlend mode="normal" in="SourceGraphic" in2="pd" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha3" />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha3" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.972549 0 0 0 0 0.972549 0 0 0 0 0.972549 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" />
        </filter>

        <clipPath id="tg-bgblur-pill-clip" transform="translate(-119 -24)">
          <rect x="128" y="33" width="94" height="24" rx="12" />
        </clipPath>

        <filter id="tg-filter-sparkle-inner" x="207" y="42" width="6" height="6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.972549 0 0 0 0 0.972549 0 0 0 0 0.972549 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" />
        </filter>

        <filter id="tg-filter-big" x="158.5" y="56" width="33" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="12" operator="erode" in="SourceAlpha" result="bds" />
          <feOffset dy="24" />
          <feGaussianBlur stdDeviation="9" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0" />
          <feBlend mode="multiply" in2="BackgroundImageFix" result="bd" />
          <feBlend mode="normal" in="SourceGraphic" in2="bd" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha4" />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha4" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.972549 0 0 0 0 0.972549 0 0 0 0 0.972549 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" />
        </filter>

        <clipPath id="tg-bgblur-big-clip" transform="translate(-158.5 -56)">
          <circle cx="175" cy="72.5" r="7.5" />
        </clipPath>

        <linearGradient id="tg-pill-stroke" x1="175" y1="33" x2="178.053" y2="63.1821" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.4" />
          <stop offset="0.4" stopColor="white" stopOpacity="0.01" />
          <stop offset="0.6" stopColor="white" stopOpacity="0.01" />
          <stop offset="1" stopColor="white" stopOpacity="0.1" />
        </linearGradient>

        <linearGradient id="tg-big-stroke" x1="175" y1="65" x2="181.525" y2="81.4718" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.4" />
          <stop offset="0.4" stopColor="white" stopOpacity="0.01" />
          <stop offset="0.6" stopColor="white" stopOpacity="0.01" />
          <stop offset="1" stopColor="white" stopOpacity="0.1" />
        </linearGradient>

        <clipPath id="tg-clip-pill">
          <rect x="125" y="30" width="100" height="30" rx="15" fill="white" />
        </clipPath>

        <clipPath id="tg-clip-sparkle">
          <rect x="201" y="36" width="18" height="18" rx="9" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();

await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const heroH = await page.evaluate(() => document.querySelector("main > section")?.getBoundingClientRect().height ?? 0);
const vh = await page.evaluate(() => window.innerHeight);
const pinRange = heroH - vh;

console.log(`hero=${heroH} vh=${vh} pinRange=${pinRange}`);

/* Snapshot helper — returns the on-screen rendered height of the
   canvas text (estimated by measuring non-empty rows of pixels in the
   compositor canvas) AND the on-screen height of the DOM side text. */
async function snapshot(progress) {
  await page.evaluate((p) => {
    const py = (document.querySelector("main > section").getBoundingClientRect().height - window.innerHeight) * p;
    window.scrollTo({ top: py, behavior: "instant" });
  }, progress);
  await page.waitForTimeout(800);

  return page.evaluate(() => {
    /* Find the visible compositor canvas (the one with `imageRendering: pixelated`) */
    const canvases = Array.from(document.querySelectorAll("canvas"));
    const visCanvas = canvases.find((c) => getComputedStyle(c).imageRendering === "pixelated");
    let canvasInfo = null;
    if (visCanvas) {
      const r = visCanvas.getBoundingClientRect();
      const wrapper = visCanvas.closest('[class*="absolute inset-0 z-[3]"]');
      const wrapperOpacity = wrapper ? parseFloat(getComputedStyle(wrapper).opacity) : -1;
      /* Measure the rendered text height by reading pixel rows */
      const ctx = visCanvas.getContext("2d");
      let topRow = -1, bottomRow = -1;
      if (ctx && visCanvas.width > 0) {
        const data = ctx.getImageData(visCanvas.width / 2 - 100, 0, 200, visCanvas.height).data;
        for (let y = 0; y < visCanvas.height; y++) {
          for (let x = 0; x < 200; x++) {
            const a = data[(y * 200 + x) * 4 + 3];
            if (a > 0) {
              if (topRow === -1) topRow = y;
              bottomRow = y;
              break;
            }
          }
        }
      }
      /* The canvas is 2400x600 internally but rendered at displayWidth = r.width.
         So 1 internal px = r.width / 2400 on-screen. */
      const internalTextHeight = bottomRow >= 0 ? bottomRow - topRow : 0;
      const scale = r.width / visCanvas.width;
      const onScreenTextHeight = internalTextHeight * scale;
      canvasInfo = {
        displayedWidth: Math.round(r.width),
        displayedHeight: Math.round(r.height),
        wrapperOpacity,
        internalTextHeight,
        onScreenTextHeight: Math.round(onScreenTextHeight),
      };
    }

    /* DOM side halves */
    const left = document.querySelectorAll('main > section [class*="absolute right-1/2"]')[0];
    const right = document.querySelectorAll('main > section [class*="absolute left-1/2"]')[0];
    let leftInfo = null;
    let rightInfo = null;
    if (left) {
      const span = left.querySelector("span");
      const csSpan = getComputedStyle(span);
      const r = span.getBoundingClientRect();
      const csDiv = getComputedStyle(left);
      leftInfo = {
        opacity: parseFloat(csDiv.opacity),
        fontSize: csSpan.fontSize,
        onScreenHeight: Math.round(r.height),
        transform: csDiv.transform,
      };
    }
    if (right) {
      const span = right.querySelector("span");
      const csSpan = getComputedStyle(span);
      const r = span.getBoundingClientRect();
      const csDiv = getComputedStyle(right);
      rightInfo = {
        opacity: parseFloat(csDiv.opacity),
        fontSize: csSpan.fontSize,
        onScreenHeight: Math.round(r.height),
        transform: csDiv.transform,
      };
    }

    return { canvas: canvasInfo, left: leftInfo, right: rightInfo };
  });
}

const points = [0.85, 0.88, 0.895, 0.90, 0.905, 0.92, 0.95, 0.97];
for (const p of points) {
  const s = await snapshot(p);
  console.log(`\n── progress ${p.toFixed(3)} ──`);
  if (s.canvas) {
    console.log(`  canvas display=${s.canvas.displayedWidth}×${s.canvas.displayedHeight}  opacity=${s.canvas.wrapperOpacity}  text-onscreen-h=${s.canvas.onScreenTextHeight}px`);
  }
  if (s.left) {
    console.log(`  L  opacity=${s.left.opacity}  font=${s.left.fontSize}  height=${s.left.onScreenHeight}px  tx=${s.left.transform.slice(0, 60)}`);
  }
  if (s.right) {
    console.log(`  R  opacity=${s.right.opacity}  font=${s.right.fontSize}  height=${s.right.onScreenHeight}px  tx=${s.right.transform.slice(0, 60)}`);
  }
}

await browser.close();

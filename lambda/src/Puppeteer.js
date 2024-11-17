'use strict';

const puppeteer = require('puppeteer');
const chromium = require('@sparticuz/chromium');

async function canvasBuilder({ width, height }) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });
  return {
    getCanvasBuffer: async (svg) => {
      await page.setContent(`
          <!DOCTYPE html>
          <html>
            <body>
              <canvas id="canvas" width="${width}" height="${height}"></canvas>
              <script>
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');
    
                // Function to render SVG
                function drawSvg(ctx, svgData) {
                  const img = new Image();
                  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                  img.onload = () => {
                    ctx.drawImage(img, 0, 0, ${width}, ${height});
                  };
                }
    
                // Draw the traced SVG
                const tracedSVG = ${JSON.stringify(svg)};
                drawSvg(ctx, tracedSVG);
    
                // Save the canvas as SVG
                window.canvasToSvg = () => {
                  const svgData = canvas.toDataURL('image/svg+xml');
                  return svgData;
                };
              </script>
            </body>
          </html>
        `);
      // Execute script to get the final SVG data
      const svgDataUrl = await page.evaluate(() => window.canvasToSvg());
      const svgData = svgDataUrl.replace(/^data:image\/svg\+xml;base64,/, ''); // Strip base64 header
      const svgBuffer = Buffer.from(svgData, 'base64');
      return svgBuffer;
    },
    closeBrowser: async () => {
      await browser.close();
    },
  };
}

module.exports = { canvasBuilder };

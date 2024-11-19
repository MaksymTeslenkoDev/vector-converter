function generateCanvasSVG({
  width,
  height,
  tracedSVG,
  geometries = [],
  text = [],
}) {
  // Start with the SVG header
  let svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${tracedSVG}</svg>
    `;

  // Add the traced SVG
  svgContent += `
      ${tracedSVG}
    `;

  geometries.forEach(({ type, x, y, w, h, color }) => {
    if (type === 'rectangle') {
      svgContent += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" />`;
    } else if (type === 'circle') {
      svgContent += `<circle cx="${x}" cy="${y}" r="${w}" fill="${color}" />`;
    }
  });

  text.forEach(({ content, x, y, fontSize = 20, color = 'black' }) => {
    svgContent += `
        <text x="${x}" y="${y}" font-size="${fontSize}" fill="${color}" text-anchor="start">${content}</text>
      `;
  });

  return svgContent;
}

module.exports = { generateCanvasSVG };

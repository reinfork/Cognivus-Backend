const fs = require('fs');
const path = require ('path');

exports.append = (templateName, variables = {}) => {
  const basePath = path.resolve(__dirname);
  const htmlPath = path.join(basePath, `${templateName}.html`);

  let html = fs.readFileSync(htmlPath, 'utf8');

  // inject variables {{var}}
  for (const key in variables) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    html = html.replace(regex, variables[key]);
  }

  return html;
}

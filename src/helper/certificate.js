const path = require('path');

const ASSETS = path.join(__dirname, '../assets/certificates');

const A4_LANDSCAPE = { width: 842, height: 595 };
const LETTER_LANDSCAPE = { width: 792, height: 612 };

const NAVY = '#16408b';

const SCORE_ORDER = [
  'listening_score',
  'speaking_score',
  'grammar_score',
  'reading_score',
  'writing_score',
  'vocabulary_score',
  'final_score',
];

const preElementary = (file, name) => ({
  file: path.join(ASSETS, file),
  page: LETTER_LANDSCAPE,
  fields: {
    reference: { x: 58.8, y: 8, size: 14 },
    name,
    birth: { x: 101.7, y: 308, size: 14 },
    signDate: { x: 119.8, y: 450, size: 14 },
  },
  scores: { x: 510.3, y: 414.7, gap: 18.4, width: 60, size: 15 },
});

const preElementaryName = (y) => ({
  x: 35.6,
  y,
  size: 30,
  font: 'Helvetica-Bold',
  width: 420,
});

const TEMPLATES = {
  'pre-elementary-1': preElementary('pre_elementary_1.png', preElementaryName(247)),
  'pre-elementary-3': preElementary('pre_elementary_3.png', preElementaryName(254)),
  'pre-elementary-4': preElementary('pre_elementary_4.png', preElementaryName(254)),

  'pre-elementary-2': {
    file: path.join(ASSETS, 'pre_elementary_2.png'),
    page: LETTER_LANDSCAPE,
    fields: {
      reference: { x: 72.9, y: 8, size: 14 },
      name: { x: 42.3, y: 269, size: 30, font: 'Helvetica-Bold', width: 420 },
      birth: { x: 108.4, y: 333, size: 14 },
      signDate: { x: 119.8, y: 450, size: 14 },
    },
    scores: { x: 513.9, y: 418, gap: 18.4, width: 60, size: 15 },
  },

  // Elementary & Intermediate mirror Advanced: identity block on the right,
  // score box on the lower left. Their name line is centred over the paragraph.
  elementary: {
    file: path.join(ASSETS, 'elementary.png'),
    page: A4_LANDSCAPE,
    fields: {
      reference: { x: 681.5, y: 13.2, size: 11, width: 150 },
      name: { x: 378, y: 177, size: 35, font: 'Helvetica-Bold', width: 400, align: 'center', color: NAVY },
      birth: { x: 545, y: 225, size: 13 },
      signDate: { x: 703, y: 375, size: 10 },
    },
    scores: { x: 249.9, y: 355.4, gap: 19.68, width: 60, size: 14 },
  },

  intermediate: {
    file: path.join(ASSETS, 'intermediate.png'),
    page: A4_LANDSCAPE,
    fields: {
      reference: { x: 610, y: 18, size: 14, width: 220 },
      name: { x: 381, y: 168, size: 35, font: 'Helvetica-Bold', width: 400, align: 'center', color: NAVY },
      birth: { x: 597, y: 224, size: 13 },
      signDate: { x: 693, y: 377, size: 10 },
    },
    scores: { x: 244.5, y: 354, gap: 19.5, width: 60, size: 14 },
  },

  // Exact: measured off the filled sample certificate.
  advanced: {
    file: path.join(ASSETS, 'advanced.png'),
    page: A4_LANDSCAPE,
    fields: {
      reference: { x: 91.5, y: 11.4, size: 14 },
      name: { x: 72.3, y: 264.6, size: 35, font: 'Helvetica-Bold', width: 600, color: NAVY },
      birth: { x: 132.4, y: 314.6, size: 15 },
      signDate: { x: 139, y: 431.8, size: 11.5 },
    },
    scores: { x: 570.5, y: 392.8, gap: 19.51, width: 60, size: 14 },
  },
};

// Human-readable labels for the frontend dropdown / API listing.
const LEVEL_LABELS = {
  'pre-elementary-1': 'Pre-Elementary I',
  'pre-elementary-2': 'Pre-Elementary II',
  'pre-elementary-3': 'Pre-Elementary III',
  'pre-elementary-4': 'Pre-Elementary IV',
  elementary: 'Elementary',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

// Ordered by course progression, not by object key order.
const LEVEL_KEYS = Object.keys(LEVEL_LABELS);

const ROMAN = { i: 1, ii: 2, iii: 3, iv: 4 };

const resolveTemplateKey = (level) => {
  if (!level || typeof level !== 'string') return null;

  const normalized = level.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!normalized) return null;

  const asKey = normalized.replace(/ /g, '-');
  if (TEMPLATES[asKey]) return asKey;

  const preElementary = normalized.match(/^(?:pre\s*elementary|pre\s*elem|pe)\s*([a-z0-9]+)$/);
  if (preElementary) {
    const token = preElementary[1];
    const tier = ROMAN[token] || Number(token);
    return tier >= 1 && tier <= 4 ? `pre-elementary-${tier}` : null;
  }

  if (normalized === 'elementary') return 'elementary';
  if (normalized === 'intermediate') return 'intermediate';
  if (normalized === 'advanced' || normalized === 'adv') return 'advanced';

  return null;
};

const resolveTemplate = (level) => {
  const key = resolveTemplateKey(level);
  return key ? { key, label: LEVEL_LABELS[key], ...TEMPLATES[key] } : null;
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

// Draws text, shrinking the font until it fits the available width so a long
// name never overruns the artwork.
const fitText = (doc, text, field) => {
  const { width } = field;
  let size = field.size;

  doc.font(field.font || 'Helvetica');
  if (width) {
    while (size > 8 && doc.fontSize(size).widthOfString(text) > width) size -= 1;
  }

  doc.fontSize(size)
     .fillColor(field.color || '#000000')
     .text(text, field.x, field.y, {
       lineBreak: false,
       width,
       align: field.align || 'left'
     });
};

const renderCertificate = (doc, template, grade) => {
  const student = grade.tbstudent || {};
  const { fields, scores } = template;

  doc.image(template.file, 0, 0, {
    width: template.page.width,
    height: template.page.height
  });

  if (grade.referencenumber) fitText(doc, String(grade.referencenumber), fields.reference);
  if (student.fullname) fitText(doc, student.fullname.toUpperCase(), fields.name);

  // The templates print the "Born in" label; we supply "<place>, <date>".
  const birth = [student.birthplace, formatDate(student.birthdate)].filter(Boolean).join(', ');
  if (birth) fitText(doc, birth, fields.birth);

  const signDate = formatDate(grade.date_taken);
  if (signDate) fitText(doc, signDate, fields.signDate);

  // Every row is printed, blanks included, so each number stays on the line of
  // the label it belongs to.
  SCORE_ORDER.forEach((field, index) => {
    const value = grade[field];
    doc.fontSize(scores.size)
       .font('Helvetica')
       .fillColor('#000000')
       .text(value === null || value === undefined ? '-' : String(value),
             scores.x,
             scores.y + index * scores.gap,
             { width: scores.width, align: 'right', lineBreak: false });
  });
};

module.exports = {
  TEMPLATES,
  SCORE_ORDER,
  LEVEL_KEYS,
  LEVEL_LABELS,
  resolveTemplateKey,
  resolveTemplate,
  renderCertificate,
};

// langmetrics — dashboard renderer

const LANGUAGES = {
  python: { name: 'Python', color: '#3572a5' },
  typescript: { name: 'TypeScript', color: '#3178c6' },
  rust: { name: 'Rust', color: '#dea584' },
  go: { name: 'Go', color: '#00add8' },
  c: { name: 'C', color: '#555555' },
};

const DATA = {
  "a1-two-sum": {
    python:     { loc: 7,  tokens: 31,  chars: 158, halstead: 146, sigilsPerLine: 4.43, uniqueSigils: 11 },
    typescript: { loc: 11, tokens: 45,  chars: 263, halstead: 233, sigilsPerLine: 5.73, uniqueSigils: 17 },
    rust:       { loc: 12, tokens: 43,  chars: 244, halstead: 219, sigilsPerLine: 5.25, uniqueSigils: 15 },
    go:         { loc: 12, tokens: 44,  chars: 173, halstead: 216, sigilsPerLine: 3.25, uniqueSigils: 11 },
    c:          { loc: 12, tokens: 60,  chars: 222, halstead: 310, sigilsPerLine: 5.17, uniqueSigils: 16 },
  },
  "a3-valid-parens": {
    python:     { loc: 11, tokens: 40,  chars: 176, halstead: 203, sigilsPerLine: 5.09, uniqueSigils: 14 },
    typescript: { loc: 12, tokens: 51,  chars: 228, halstead: 271, sigilsPerLine: 6.17, uniqueSigils: 15 },
    rust:       { loc: 13, tokens: 63,  chars: 254, halstead: 331, sigilsPerLine: 7.85, uniqueSigils: 17 },
    go:         { loc: 16, tokens: 61,  chars: 264, halstead: 327, sigilsPerLine: 5.25, uniqueSigils: 14 },
    c:          { loc: 17, tokens: 81,  chars: 285, halstead: 445, sigilsPerLine: 6.29, uniqueSigils: 20 },
  },
  "r1-word-freq": {
    python:     { loc: 14, tokens: 45,  chars: 326, halstead: 238, sigilsPerLine: 4.71, uniqueSigils: 11 },
    typescript: { loc: 21, tokens: 80,  chars: 538, halstead: 473, sigilsPerLine: 7.33, uniqueSigils: 23 },
    rust:       { loc: 25, tokens: 72,  chars: 598, halstead: 404, sigilsPerLine: 6.72, uniqueSigils: 17 },
    go:         { loc: 42, tokens: 126, chars: 722, halstead: 801, sigilsPerLine: 4.29, uniqueSigils: 19 },
    c:          { loc: 56, tokens: 263, chars: 1218, halstead: 1790, sigilsPerLine: 5.98, uniqueSigils: 23 },
  },
  "r4-concurrent-fetch": {
    python:     { loc: 19, tokens: 48,  chars: 480, halstead: 259, sigilsPerLine: 5.11, uniqueSigils: 12 },
    typescript: { loc: 25, tokens: 80,  chars: 593, halstead: 463, sigilsPerLine: 6.32, uniqueSigils: 18 },
    rust:       { loc: 32, tokens: 87,  chars: 668, halstead: 501, sigilsPerLine: 5.78, uniqueSigils: 17 },
    go:         { loc: 35, tokens: 84,  chars: 560, halstead: 508, sigilsPerLine: 4.49, uniqueSigils: 17 },
    c:          { loc: 61, tokens: 225, chars: 1567, halstead: 1587, sigilsPerLine: 5.26, uniqueSigils: 23 },
  },
};

const PROBLEMS = Object.keys(DATA);
const LANG_ORDER = ['python', 'typescript', 'rust', 'go', 'c'];

// --- Chart rendering with Canvas ---

function createCanvas(container, width = 700, height = 300) {
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = '100%';
  canvas.style.maxWidth = width + 'px';
  canvas.style.height = 'auto';
  container.appendChild(canvas);
  return canvas.getContext('2d');
}

function drawBarChart(containerId, metric, title) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const ctx = createCanvas(container, 750, 340);
  const padding = { top: 40, right: 20, bottom: 80, left: 60 };
  const w = 750 - padding.left - padding.right;
  const h = 340 - padding.top - padding.bottom;

  // Group bars by problem, colored by language
  const groupWidth = w / PROBLEMS.length;
  const barWidth = (groupWidth - 20) / LANG_ORDER.length;

  // Find max value
  let maxVal = 0;
  for (const prob of PROBLEMS) {
    for (const lang of LANG_ORDER) {
      const val = DATA[prob][lang][metric];
      if (val > maxVal) maxVal = val;
    }
  }
  maxVal *= 1.1;

  // Title
  ctx.fillStyle = '#e6edf3';
  ctx.font = '14px -apple-system, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 375, 20);

  // Y axis
  ctx.strokeStyle = '#30363d';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + h - (h * i / 4);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + w, y);
    ctx.stroke();
    ctx.fillStyle = '#8b949e';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal * i / 4).toString(), padding.left - 8, y + 4);
  }

  // Bars
  for (let pi = 0; pi < PROBLEMS.length; pi++) {
    const prob = PROBLEMS[pi];
    const groupX = padding.left + pi * groupWidth + 10;

    for (let li = 0; li < LANG_ORDER.length; li++) {
      const lang = LANG_ORDER[li];
      const val = DATA[prob][lang][metric];
      const barH = (val / maxVal) * h;
      const x = groupX + li * barWidth;
      const y = padding.top + h - barH;

      ctx.fillStyle = LANGUAGES[lang].color;
      ctx.fillRect(x, y, barWidth - 2, barH);
    }

    // Problem label
    ctx.fillStyle = '#8b949e';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(groupX + (groupWidth - 20) / 2, padding.top + h + 15);
    ctx.fillText(prob, 0, 0);
    ctx.restore();
  }

  // Legend
  const legendY = 340 - 25;
  let legendX = padding.left;
  for (const lang of LANG_ORDER) {
    ctx.fillStyle = LANGUAGES[lang].color;
    ctx.fillRect(legendX, legendY, 12, 12);
    ctx.fillStyle = '#e6edf3';
    ctx.font = '11px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(LANGUAGES[lang].name, legendX + 16, legendY + 10);
    legendX += ctx.measureText(LANGUAGES[lang].name).width + 30;
  }
}

function drawAveragesTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Compute averages per language
  const avgs = {};
  for (const lang of LANG_ORDER) {
    avgs[lang] = { loc: 0, tokens: 0, halstead: 0, sigilsPerLine: 0, uniqueSigils: 0 };
    for (const prob of PROBLEMS) {
      const d = DATA[prob][lang];
      avgs[lang].loc += d.loc;
      avgs[lang].tokens += d.tokens;
      avgs[lang].halstead += d.halstead;
      avgs[lang].sigilsPerLine += d.sigilsPerLine;
      avgs[lang].uniqueSigils += d.uniqueSigils;
    }
    const n = PROBLEMS.length;
    avgs[lang].loc = (avgs[lang].loc / n).toFixed(1);
    avgs[lang].tokens = (avgs[lang].tokens / n).toFixed(1);
    avgs[lang].halstead = Math.round(avgs[lang].halstead / n);
    avgs[lang].sigilsPerLine = (avgs[lang].sigilsPerLine / n).toFixed(2);
    avgs[lang].uniqueSigils = (avgs[lang].uniqueSigils / n).toFixed(1);
  }

  let html = `<table>
    <tr><th>Language</th><th>Avg LOC</th><th>Avg Tokens</th><th>Avg Halstead Vol</th><th>Avg Sigils/Line</th><th>Avg Unique Sigils</th></tr>`;
  for (const lang of LANG_ORDER) {
    const a = avgs[lang];
    html += `<tr>
      <td><span class="lang-dot" style="background:${LANGUAGES[lang].color}"></span>${LANGUAGES[lang].name}</td>
      <td>${a.loc}</td><td>${a.tokens}</td><td>${a.halstead}</td><td>${a.sigilsPerLine}</td><td>${a.uniqueSigils}</td>
    </tr>`;
  }
  html += '</table>';
  container.innerHTML = html;
}

function drawSigilChart(containerId) {
  drawBarChart(containerId, 'sigilsPerLine', 'Sigils per Line (lower = less symbolic noise)');
}

// --- Nav scroll highlighting ---
function setupNav() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`nav a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => observer.observe(section));
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  drawBarChart('conciseness-chart', 'loc', 'Lines of Code per Problem (lower = more concise)');
  drawSigilChart('sigils-chart');
  drawAveragesTable('summary-table');

  // Render Halstead in the readability section for now
  drawBarChart('readability-chart', 'halstead', 'Halstead Volume (information density — lower = simpler)');
});

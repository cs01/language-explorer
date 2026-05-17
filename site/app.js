// langmetrics — dashboard renderer
// Loads JSON from ../data/ and renders charts

const LANGUAGES = {
  rust: { name: 'Rust', color: '#dea584' },
  typescript: { name: 'TypeScript', color: '#3178c6' },
  python: { name: 'Python', color: '#3572a5' },
  go: { name: 'Go', color: '#00add8' },
  milo: { name: 'Milo', color: '#a371f7' },
};

const METRICS = [
  'conciseness',
  'sigils',
  'concepts',
  'type-burden',
  'error-ceremony',
  'readability',
];

async function loadData() {
  // Load all JSON files from data/
  // For now, return empty — data doesn't exist yet
  return {};
}

function renderPlaceholders() {
  // Charts will be rendered here once data exists
  // Using vanilla Canvas API or Chart.js via CDN
  console.log('langmetrics: no data yet — add scored results to data/');
}

// Nav scroll highlighting
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

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  renderPlaceholders();
});

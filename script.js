// Dark mode toggle with persistence
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const stored = localStorage.getItem('theme');
  if (stored === 'light') root.classList.add('light');
  if (stored === 'dark') root.classList.remove('light');
  if (btn) {
    btn.addEventListener('click', () => {
      const isLight = root.classList.toggle('light');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      btn.setAttribute('aria-pressed', String(isLight));
    });
  }
})();

// Smooth scroll for same-page nav
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id && document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', id);
    }
  });
});

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Category filter highlight
(function () {
  const buttons = document.querySelectorAll('.filter-btn');
  if (!buttons.length) return;
  let active = '';

  function apply(tag) {
    document.querySelectorAll('[data-tags]').forEach(el => {
      const tokens = (el.dataset.tags || '').split(/\s+/).filter(Boolean);
      // Avoid outlining the entire Technical Skills section
      if (el.id === 'skills') {
        el.classList.remove('highlight');
        return;
      }
      if (tag && tokens.includes(tag)) {
        el.classList.add('highlight');
      } else {
        el.classList.remove('highlight');
      }
    });

    // Highlight matching skill chips too
    document.querySelectorAll('.skill-chip').forEach(chip => {
      const tokens = (chip.dataset.tags || '').split(/\s+/).filter(Boolean);
      if (tag && tokens.includes(tag)) chip.classList.add('highlight');
      else chip.classList.remove('highlight');
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.filter || '';
      const next = active === tag ? '' : tag;
      active = next;
      buttons.forEach(b => b.setAttribute('aria-pressed', String((b.dataset.filter || '') === next)));
      apply(next);
    });
  });
})();

// Skill chip details viewer
(function () {
  const details = document.getElementById('skillDetails');
  if (!details) return;
  const nameEl = document.getElementById('skillName');
  const descEl = document.getElementById('skillDesc');

  // You can customize these descriptions later inline or via data-desc
  const defaultDescriptions = {
    'Python': 'Data analysis, ML prototyping, scripting, and web backends.',
    'JavaScript': 'Interactive UIs and client-side logic; Node basics.',
    'SQL': 'Querying, joins, aggregations; schema design basics.',
    'R': 'Statistical analysis and visualization workflows.',
    'TypeScript': 'Typed React apps; safer front-end logic.',
    'HTML/CSS': 'Responsive, accessible interfaces with modern CSS.',
    'Java': 'OOP, data structures, and algorithms training.',
    'C++': 'Performance and memory model fundamentals.',
    'C': 'Low-level programming concepts and systems basics.',
    'React': 'Component-driven UIs; hooks and state management.',
    'Django': 'Rapid backends with ORM, auth, and admin.',
    'Flask': 'Light APIs and quick prototypes.',
    'Seaborn': 'Statistical plotting on top of Matplotlib.',
    'SciKit ML': 'Classical ML models, pipelines, evaluation.',
    'NumPy/Pandas': 'Vectorized computation and tabular data wrangling.',
    'Selenium': 'UI automation and E2E testing.',
    'BERT': 'Transformer-based NLP; embeddings and fine-tuning basics.',
    'Git': 'Branching, PRs, code reviews, and workflows.',
    'Cursor Code': 'AI-assisted development workflows.',
    'Microsoft Excel': 'Pivot tables, charts, and functions.',
    'Word': 'Technical documentation basics.',
    'Tableau': 'Dashboards and storytelling with data.',
    'REST APIs': 'Designing and consuming HTTP JSON services.'
  };

  function setDetails(skill, desc) {
    nameEl.textContent = skill;
    descEl.textContent = desc;
    details.hidden = false;
  }

  // Show details on hover (focus/blur for accessibility)
  document.querySelectorAll('.skill-chip').forEach(chip => {
    const show = () => {
      const skill = chip.dataset.skill || chip.textContent.trim();
      const desc = chip.dataset.desc || defaultDescriptions[skill] || '';
      setDetails(skill, desc);
    };
    const hide = () => { details.hidden = true; };
    chip.addEventListener('mouseenter', show);
    chip.addEventListener('focus', show);
    chip.addEventListener('mouseleave', hide);
    chip.addEventListener('blur', hide);

    // Temporarily disable click behavior
    chip.addEventListener('click', (e) => { e.preventDefault(); });
  });
})();

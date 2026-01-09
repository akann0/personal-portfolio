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
  const projectItems = document.querySelectorAll('#projects .timeline .item');
  const viewMore = document.getElementById('projectViewMore');
  const viewMoreSummary = viewMore?.querySelector('summary');

  // setActiveRoleColor: Sets the CSS variable for the active role highlight.
  function setActiveRoleColor(tag) {
    const roleToColorVar = {
      swe: 'var(--role-swe)',
      ml: 'var(--role-ml)',
      data: 'var(--role-data)',
      genai: 'var(--role-genai)'
    };
    document.documentElement.style.setProperty('--role-active', roleToColorVar[tag] || '');
  }

  // toggleSectionHighlights: Toggles section highlights while skipping general sections.
  function toggleSectionHighlights(tag) {
    document.querySelectorAll('[data-tags]').forEach(el => {
      if (el.id === 'skills') {
        el.classList.remove('highlight');
        return;
      }
      if (el.matches('section.section')) {
        el.classList.remove('highlight');
        return;
      }
      const tokens = (el.dataset.tags || '').split(/\s+/).filter(Boolean);
      if (tag && tokens.includes(tag)) el.classList.add('highlight');
      else el.classList.remove('highlight');
    });
  }

  // toggleSkillChips: Toggles highlight classes on skill chips.
  function toggleSkillChips(tag) {
    document.querySelectorAll('.skill-chip').forEach(chip => {
      const tokens = (chip.dataset.tags || '').split(/\s+/).filter(Boolean);
      if (tag && tokens.includes(tag)) chip.classList.add('highlight');
      else chip.classList.remove('highlight');
    });
  }

  // reorderHighlightedItems: Moves highlighted cards/items to the top of their container.
  function reorderHighlightedItems() {
    document.querySelectorAll('.timeline, .grid').forEach(container => {
      const items = Array.from(container.children);
      if (!items.length) return;
      const highlighted = [];
      const normal = [];
      items.forEach(item => {
        const isFlagged = item.classList.contains('highlight') || item.classList.contains('highlight-skill');
        if (isFlagged) highlighted.push(item);
        else normal.push(item);
      });
      if (!highlighted.length) return;
      const fragment = document.createDocumentFragment();
      highlighted.forEach(node => fragment.appendChild(node));
      normal.forEach(node => fragment.appendChild(node));
      container.appendChild(fragment);
    });
  }

  // updateProjectVisibility: Hide projects that fall outside the selected focus.
  function updateProjectVisibility(tag) {
    let hasHidden = false;
    if (!projectItems.length) return false;
    projectItems.forEach(item => {
      const tokens = (item.dataset.tags || '').split(/\s+/).filter(Boolean);
      const matches = !tag || tokens.includes(tag);
      const shouldHide = Boolean(tag) && !matches;
      item.classList.toggle('hidden-by-filter', shouldHide);
      if (shouldHide) hasHidden = true;
    });
    return hasHidden;
  }

  // syncViewMoreToggle: Show or hide the view-more dropdown.
  function setViewMoreLabel(isOpen) {
    if (!viewMoreSummary) return;
    viewMoreSummary.textContent = isOpen ? 'See less projects ↑' : 'See more projects ↓';
  }

  function syncViewMoreToggle(hasHidden) {
    if (!viewMore) return;
    viewMore.hidden = !hasHidden;
    if (viewMore.open) viewMore.open = false;
    setViewMoreLabel(false);
  }

  if (viewMore) {
    viewMore.addEventListener('toggle', () => {
      document.body.classList.toggle('show-hidden-projects', viewMore.open);
      setViewMoreLabel(viewMore.open);
    });
    setViewMoreLabel(false);
  }

  // apply: Applies the selected filter tag and reorders highlighted sections.
  function apply(tag) {
    setActiveRoleColor(tag);
    toggleSectionHighlights(tag);
    toggleSkillChips(tag);
    const hiddenProjects = updateProjectVisibility(tag);
    syncViewMoreToggle(hiddenProjects);
    if (!tag) document.body.classList.remove('show-hidden-projects');
    reorderHighlightedItems();
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

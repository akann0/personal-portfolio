// Warp transition system
(function () {
  const categoryBtns = document.querySelectorAll('.category-btn');
  const focusSelector = document.getElementById('focusSelector');
  const sections = document.querySelectorAll('.section');
  const hero = document.querySelector('.hero');
  const mainEl = document.querySelector('main');

  // Map categories to section IDs
  const categoryMap = {
    projects: ['projects'],
    experience: ['experience'],
    education: ['education'],
    other: ['skills', 'achievements', 'stories', 'project-ideas', 'contact']
  };

  let activeCategory = '';
  let isWarping = false;

  // createWarpOverlay: Creates the canvas for star-streak effect
  function createWarpOverlay() {
    const overlay = document.createElement('canvas');
    overlay.id = 'warpOverlay';
    document.body.appendChild(overlay);
    return overlay;
  }

  // createBackButton: Creates floating back-to-home button
  function createBackButton() {
    const btn = document.createElement('button');
    btn.className = 'back-home-btn';
    btn.title = 'Back to home';
    btn.setAttribute('aria-label', 'Back to home');
    document.body.appendChild(btn);
    btn.addEventListener('click', warpBackHome);
    return btn;
  }

  const warpCanvas = createWarpOverlay();
  const warpCtx = warpCanvas.getContext('2d');
  const backBtn = createBackButton();

  // resizeWarpCanvas: Keeps warp canvas full screen
  function resizeWarpCanvas() {
    warpCanvas.width = window.innerWidth;
    warpCanvas.height = window.innerHeight;
  }
  resizeWarpCanvas();
  window.addEventListener('resize', resizeWarpCanvas);

  // showSections: Shows sections for the selected category
  function showSections(category) {
    sections.forEach(section => {
      const sectionIds = categoryMap[category] || [];
      if (sectionIds.includes(section.id)) {
        section.classList.add('visible');
      } else {
        section.classList.remove('visible');
      }
    });
  }

  // handleCategoryClick: Handles category button selection
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (focusSelector) focusSelector.hidden = false;
      showSections(activeCategory);
    });
  });

  // animateWarpStars: Draws streaking stars radiating from center
  function animateWarpStars(duration, onComplete) {
    const cx = warpCanvas.width / 2;
    const cy = warpCanvas.height / 2;
    const numStars = 200;
    const stars = [];

    // Initialize stars at random positions near center
    for (let i = 0; i < numStars; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 30 + 5;
      stars.push({
        angle: angle,
        dist: dist,
        speed: Math.random() * 3 + 2,
        length: 0,
        brightness: Math.random() * 0.5 + 0.5,
        hue: Math.random() > 0.7 ? 210 : 0
      });
    }

    warpCanvas.classList.add('active');
    const start = performance.now();

    // drawFrame: Renders one frame of the warp animation
    function drawFrame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease: slow start, fast middle, slow end
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      warpCtx.clearRect(0, 0, warpCanvas.width, warpCanvas.height);

      // Central glow that builds and fades
      const glowAlpha = Math.sin(progress * Math.PI) * 0.3;
      const glowGrad = warpCtx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      glowGrad.addColorStop(0, `rgba(147, 197, 253, ${glowAlpha})`);
      glowGrad.addColorStop(1, 'transparent');
      warpCtx.fillStyle = glowGrad;
      warpCtx.fillRect(0, 0, warpCanvas.width, warpCanvas.height);

      // Draw each star streak
      const maxDist = Math.sqrt(cx * cx + cy * cy) * 1.2;
      for (const star of stars) {
        star.dist += star.speed * (1 + ease * 20);
        star.length = star.speed * (1 + ease * 15);

        if (star.dist > maxDist) continue;

        const x1 = cx + Math.cos(star.angle) * star.dist;
        const y1 = cy + Math.sin(star.angle) * star.dist;
        const x2 = cx + Math.cos(star.angle) * Math.max(0, star.dist - star.length);
        const y2 = cy + Math.sin(star.angle) * Math.max(0, star.dist - star.length);

        const fadeIn = Math.min(star.dist / 50, 1);
        const alpha = star.brightness * fadeIn * (1 - progress * 0.3);
        const color = star.hue === 210
          ? `rgba(147, 197, 253, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`;

        warpCtx.beginPath();
        warpCtx.moveTo(x2, y2);
        warpCtx.lineTo(x1, y1);
        warpCtx.strokeStyle = color;
        warpCtx.lineWidth = 1 + ease * 2;
        warpCtx.stroke();
      }

      if (progress < 1) {
        requestAnimationFrame(drawFrame);
      } else {
        warpCtx.clearRect(0, 0, warpCanvas.width, warpCanvas.height);
        warpCanvas.classList.remove('active');
        if (onComplete) onComplete();
      }
    }

    requestAnimationFrame(drawFrame);
  }

  // animateWarpReverse: Stars converge to center (reverse warp)
  function animateWarpReverse(duration, onComplete) {
    const cx = warpCanvas.width / 2;
    const cy = warpCanvas.height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy) * 1.2;
    const numStars = 200;
    const stars = [];

    for (let i = 0; i < numStars; i++) {
      const angle = Math.random() * Math.PI * 2;
      stars.push({
        angle: angle,
        dist: Math.random() * maxDist,
        speed: Math.random() * 3 + 2,
        length: 0,
        brightness: Math.random() * 0.5 + 0.5,
        hue: Math.random() > 0.7 ? 210 : 0
      });
    }

    warpCanvas.classList.add('active');
    const start = performance.now();

    // drawFrame: Renders one frame of reverse warp
    function drawFrame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      warpCtx.clearRect(0, 0, warpCanvas.width, warpCanvas.height);

      const glowAlpha = Math.sin(progress * Math.PI) * 0.3;
      const glowGrad = warpCtx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      glowGrad.addColorStop(0, `rgba(147, 197, 253, ${glowAlpha})`);
      glowGrad.addColorStop(1, 'transparent');
      warpCtx.fillStyle = glowGrad;
      warpCtx.fillRect(0, 0, warpCanvas.width, warpCanvas.height);

      for (const star of stars) {
        star.dist -= star.speed * (1 + ease * 20);
        star.length = star.speed * (1 + ease * 10);

        if (star.dist < 0) continue;

        const x1 = cx + Math.cos(star.angle) * star.dist;
        const y1 = cy + Math.sin(star.angle) * star.dist;
        const x2 = cx + Math.cos(star.angle) * (star.dist + star.length);
        const y2 = cy + Math.sin(star.angle) * (star.dist + star.length);

        const alpha = star.brightness * (1 - progress * 0.3);
        const color = star.hue === 210
          ? `rgba(147, 197, 253, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`;

        warpCtx.beginPath();
        warpCtx.moveTo(x2, y2);
        warpCtx.lineTo(x1, y1);
        warpCtx.strokeStyle = color;
        warpCtx.lineWidth = 1 + ease * 2;
        warpCtx.stroke();
      }

      if (progress < 1) {
        requestAnimationFrame(drawFrame);
      } else {
        warpCtx.clearRect(0, 0, warpCanvas.width, warpCanvas.height);
        warpCanvas.classList.remove('active');
        if (onComplete) onComplete();
      }
    }

    requestAnimationFrame(drawFrame);
  }

  // warpToContent: Full forward warp sequence
  function warpToContent() {
    if (isWarping) return;
    isWarping = true;

    // Phase 1: Hero departs + star streaks begin
    hero.classList.add('warp-out');
    animateWarpStars(1400, () => {
      // Phase 2: Hero hidden, content arrives
      hero.classList.remove('warp-out');
      hero.classList.add('warped');
      window.scrollTo(0, 0);
      if (mainEl) mainEl.classList.add('content-active');

      // Add arriving animation to visible sections
      sections.forEach(s => {
        if (s.classList.contains('visible')) {
          s.classList.add('arriving');
        }
      });

      // Show back button
      backBtn.classList.add('visible');

      // Clean up arriving class after animation
      setTimeout(() => {
        sections.forEach(s => s.classList.remove('arriving'));
        isWarping = false;
      }, 900);
    });
  }

  // warpBackHome: Reverse warp back to hero
  function warpBackHome() {
    if (isWarping) return;
    isWarping = true;
    backBtn.classList.remove('visible');

    // Phase 1: Content departs
    sections.forEach(s => {
      if (s.classList.contains('visible')) {
        s.classList.add('warp-away');
      }
    });

    // Star streaks converge
    animateWarpReverse(1200, () => {
      // Phase 2: Hide content, show hero
      sections.forEach(s => {
        s.classList.remove('visible', 'warp-away');
      });

      hero.classList.remove('warped');
      hero.classList.add('warp-in');
      window.scrollTo(0, 0);
      if (mainEl) mainEl.classList.remove('content-active');
      if (window.resetSpecialization) window.resetSpecialization();

      // Reset category/focus state
      categoryBtns.forEach(b => b.classList.remove('active'));
      if (focusSelector) focusSelector.hidden = true;
      activeCategory = '';

      setTimeout(() => {
        hero.classList.remove('warp-in');
        isWarping = false;
      }, 900);
    });
  }

  // Trigger warp on specialization click
  const filterBtns = document.querySelectorAll('.focus-selector .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const firstSection = document.querySelector('.section.visible');
      if (firstSection) {
        warpToContent();
      }
    });
  });
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

// Shooting star cursor trail effect using canvas
(function() {
  // Create custom star cursor element
  const starCursor = document.createElement('div');
  starCursor.id = 'starCursor';
  const starGlow = document.createElement('div');
  starGlow.className = 'star-glow';
  const starShape = document.createElement('div');
  starShape.className = 'star-shape';
  starCursor.appendChild(starGlow);
  starCursor.appendChild(starShape);
  document.body.appendChild(starCursor);
  
  const canvas = document.createElement('canvas');
  canvas.id = 'starTrailCanvas';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  let points = [];
  const maxPoints = 30;
  const trailLifetime = 300; // ms
  
  // resizeCanvas: Keeps canvas full screen
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // addPoint: Adds a point to the trail
  function addPoint(x, y) {
    points.push({
      x: x,
      y: y,
      time: Date.now()
    });
    if (points.length > maxPoints) {
      points.shift();
    }
  }
  
  // drawTrail: Renders the fading trail
  function drawTrail() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const now = Date.now();
    points = points.filter(p => now - p.time < trailLifetime);
    
    if (points.length < 2) {
      requestAnimationFrame(drawTrail);
      return;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      
      const age = now - p2.time;
      const opacity = Math.max(0, 1 - (age / trailLifetime));
      const width = opacity * 2;
      
      // Light blue trail
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(147, 197, 253, ${opacity * 0.7})`;
      ctx.lineWidth = width;
      ctx.stroke();
      
      // Subtle glow
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(147, 197, 253, ${opacity * 0.2})`;
      ctx.lineWidth = width * 2;
      ctx.stroke();
    }
    
    requestAnimationFrame(drawTrail);
  }
  
  let lastMouseX = 0;
  let lastMouseY = 0;
  let currentRotation = 0;
  
  // Track mouse movement
  document.addEventListener('mousemove', (e) => {
    // Move custom star cursor
    starCursor.style.left = e.clientX + 'px';
    starCursor.style.top = e.clientY + 'px';
    
    // Rotate star based on movement direction
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > 5) {
      currentRotation += distance * 2;
      starShape.style.setProperty('--rotation', currentRotation + 'deg');
    }
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    
    addPoint(e.clientX, e.clientY);
  });
  
  // Spin on click
  document.addEventListener('click', () => {
    currentRotation += 360;
    starShape.style.setProperty('--rotation', currentRotation + 'deg');
    starCursor.classList.add('clicked');
    setTimeout(() => {
      starCursor.classList.remove('clicked');
    }, 400);
  });
  
  // Hide star cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    starCursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    starCursor.style.opacity = '1';
  });
  
  drawTrail();
})();

// Category filter highlight
(function () {
  const buttons = document.querySelectorAll('.filter-btn');
  if (!buttons.length) return;
  let active = '';
  const projectItems = document.querySelectorAll('#projects .timeline .item');
  const containers = document.querySelectorAll('.timeline, .grid');
  const viewMore = document.getElementById('projectViewMore');
  const viewMoreSummary = viewMore?.querySelector('summary');
  const orderMap = new Map();

  containers.forEach(container => {
    orderMap.set(container, Array.from(container.children));
  });

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
  function reorderHighlightedItems(tag) {
    orderMap.forEach((original, container) => {
      if (!tag) {
        original.forEach(item => container.appendChild(item));
        return;
      }
      const highlighted = [];
      const normal = [];
      original.forEach(item => {
        const tokens = (item.dataset.tags || '').split(/\s+/).filter(Boolean);
        if (tokens.includes(tag)) highlighted.push(item);
        else normal.push(item);
      });
      const fragment = document.createDocumentFragment();
      highlighted.forEach(node => fragment.appendChild(node));
      normal.forEach(node => fragment.appendChild(node));
      container.appendChild(fragment);
    });
  }

  // updateProjectVisibility: Hide projects that fall outside the selected focus.
  function updateProjectVisibility(tag) {
    let hasHidden = false;
    const hasItems = projectItems.length;
    if (!hasItems) return false;
    projectItems.forEach(item => {
      const tokens = (item.dataset.tags || '').split(/\s+/).filter(Boolean);
      const defaultHide = item.dataset.defaultHidden === 'true';
      const matches = tokens.includes(tag);
      const shouldHide = Boolean(tag) ? !matches : defaultHide;
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
    reorderHighlightedItems(tag);
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

  function resetSpecialization() {
    active = '';
    buttons.forEach(b => b.setAttribute('aria-pressed', 'false'));
    apply('');
  }

  window.resetSpecialization = resetSpecialization;

  apply('');
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

// handleMobileDescriptionToggle: toggles descriptions and arrows on touch devices
(function handleMobileDescriptionToggle() {
  if (!window.matchMedia('(hover: none)').matches) return;
  const items = document.querySelectorAll('#projects .timeline .item, .timeline .item.collapsible');
  if (!items.length) return;
  addExpandIndicators();
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(other => {
        if (other !== item) other.classList.remove('expanded');
      });
      item.classList.toggle('expanded');
    });
  });
})();

// addExpandIndicators: adds down arrow indicators to project items on mobile
function addExpandIndicators() {
  const projectItems = document.querySelectorAll('#projects .timeline .item');
  projectItems.forEach(item => {
    const head = item.querySelector('.item-head');
    if (!head) return;
    const indicator = document.createElement('span');
    indicator.className = 'expand-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.textContent = '▼';
    head.appendChild(indicator);
  });
}

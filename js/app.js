/* ============================================================
   FIRE PARTICLES — Canvas hero animation
   ============================================================ */
(function initFireCanvas() {
  const canvas = document.getElementById('fire-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  const COLORS = [
    [180,  40,  0],
    [220,  70,  0],
    [234,  88, 12],
    [249, 115, 22],
    [251, 146, 60],
    [253, 186, 116],
    [254, 215, 170],
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    const col = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x:      randomBetween(0, W),
      y:      H + randomBetween(0, 40),
      vx:     randomBetween(-0.6, 0.6),
      vy:     randomBetween(-1.8, -3.4),
      radius: randomBetween(1.2, 3.8),
      alpha:  randomBetween(0.55, 0.9),
      decay:  randomBetween(0.008, 0.018),
      color:  col,
      wobble: randomBetween(0, Math.PI * 2),
      wobbleSpeed: randomBetween(0.03, 0.07),
    };
  }

  function spawnBatch() {
    const count = Math.floor(W / 22);
    for (let i = 0; i < count; i++) {
      if (particles.length < 280) particles.push(createParticle());
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    if (particles.length < 200) spawnBatch();

    particles = particles.filter(p => p.alpha > 0.02);

    for (const p of particles) {
      p.wobble += p.wobbleSpeed;
      p.x  += p.vx + Math.sin(p.wobble) * 0.4;
      p.y  += p.vy;
      p.vy *= 0.997;
      p.radius *= 0.9985;
      p.alpha  -= p.decay;

      const [r, g, b] = p.color;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${p.alpha})`);
      grad.addColorStop(0.5, `rgba(${r},${g},${b},${p.alpha * 0.55})`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    animId = requestAnimationFrame(tick);
  }

  function start() {
    resize();
    spawnBatch();
    tick();
  }

  function stop() {
    cancelAnimationFrame(animId);
  }

  window.addEventListener('resize', () => {
    resize();
    particles = [];
  });

  // Pause when tab is hidden to save battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else { start(); }
  });

  // Respect prefers-reduced-motion
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    canvas.style.display = 'none';
    return;
  }

  // Wait for fonts/layout before sizing
  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start);
  }
})();


/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Stagger siblings inside same parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 80, 320);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   FAQ ACCORDION
   ============================================================ */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    // Remove the HTML hidden attr so CSS transition works; start collapsed via CSS
    answer.removeAttribute('hidden');

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      items.forEach(other => {
        const otherBtn    = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn && otherAnswer && otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.setAttribute('hidden', '');
        }
      });

      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        answer.setAttribute('hidden', '');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
      }
    });
  });
})();


/* ============================================================
   SMOOTH SCROLL — internal anchor links
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ============================================================
   BUY BUTTONS — InitiateCheckout pixel event (fallback)
   Safety net: fbq is already called via onclick attributes,
   this adds a listener-based backup for JS-added buttons.
   ============================================================ */
(function initBuyButtons() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.buy-btn');
    if (!btn) return;
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout');
    }
  });
})();

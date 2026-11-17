// Pop-ups (PDF viewer + workflow gallery)
const pdfModal = document.getElementById('pdfModal');
const pdfFrame = pdfModal.querySelector('iframe');
const galModal = document.getElementById('galleryModal');
const galImg = document.getElementById('galleryImg');

function toggleModal(m, open) {
  m.classList.toggle('open', open);
  m.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = document.querySelector('.modal.open') ? 'hidden' : '';
}
function closeAll() {
  [pdfModal, galModal].forEach(m => toggleModal(m, false));
  pdfFrame.src = ''; // stop loading / free memory
}

document.querySelectorAll('[data-pdf]').forEach(b => b.addEventListener('click', () => {
  document.getElementById('pdfTitle').textContent = b.dataset.title || 'Document';
  // keep the browser's own PDF toolbar so visitors can open / download from it
  pdfFrame.src = b.dataset.pdf + '#navpanes=0';
  toggleModal(pdfModal, true);
}));

// Gallery: data-gallery="img1.jpg|Caption 1;img2.jpg|Caption 2"
let slides = [], si = 0;
function showSlide(i) {
  si = (i + slides.length) % slides.length;
  galImg.src = slides[si].src;
  galImg.alt = slides[si].cap;
  document.getElementById('galleryCaption').textContent = slides[si].cap;
  document.getElementById('galleryCount').textContent = slides.length > 1 ? `${si + 1} / ${slides.length}` : '';
  galModal.classList.toggle('single', slides.length < 2);
}
document.querySelectorAll('[data-gallery]').forEach(b => b.addEventListener('click', () => {
  slides = b.dataset.gallery.split(';').map(s => { const [src, cap] = s.split('|'); return { src, cap: cap || '' }; });
  showSlide(0);
  toggleModal(galModal, true);
}));
galModal.querySelector('.prev').addEventListener('click', () => showSlide(si - 1));
galModal.querySelector('.next').addEventListener('click', () => showSlide(si + 1));

[pdfModal, galModal].forEach(m => {
  m.querySelector('.modal-close').addEventListener('click', closeAll);
  m.addEventListener('click', e => { if (e.target === m) closeAll(); });
});
addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAll();
  if (galModal.classList.contains('open')) {
    if (e.key === 'ArrowLeft') showSlide(si - 1);
    if (e.key === 'ArrowRight') showSlide(si + 1);
  }
});

// Cursor glow
const glow = document.querySelector('.glow');
window.addEventListener('pointermove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

// Scroll progress bar
const bar = document.querySelector('.progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
}, { passive: true });

// Typing effect — edit these phrases!
const phrases = ['AI solutions.', 'smart automations.', 'intelligent systems.', 'useful web apps.'];
const el = document.getElementById('typing');
let p = 0, c = 0, del = false;
(function type() {
  const word = phrases[p];
  el.textContent = word.slice(0, c);
  if (!del && c === word.length) { del = true; return setTimeout(type, 1500); }
  if (del && c === 0) { del = false; p = (p + 1) % phrases.length; }
  c += del ? -1 : 1;
  setTimeout(type, del ? 35 : 80);
})();

// Reveal on scroll + count-up stats
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    en.target.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(en.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((n, i) => {
  n.style.transitionDelay = (i % 4) * 90 + 'ms';
  io.observe(n);
});

function countUp(n) {
  const target = +n.dataset.count; let v = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const t = setInterval(() => {
    v = Math.min(target, v + step);
    n.textContent = v;
    if (v >= target) clearInterval(t);
  }, 30);
}

// 3D tilt cards
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transition = 'none';
    card.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transition = 'transform .5s ease';
    card.style.transform = '';
  });
});

// Particle network background
const cv = document.getElementById('bg');
const ctx = cv.getContext('2d');
let W, H, dots = [];
const mouse = { x: -999, y: -999 };
window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

function resize() {
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  const n = Math.min(110, Math.floor(W * H / 14000));
  dots = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4
  }));
}
addEventListener('resize', resize); resize();

(function draw() {
  ctx.clearRect(0, 0, W, H);
  for (const d of dots) {
    d.x += d.vx; d.y += d.vy;
    if (d.x < 0 || d.x > W) d.vx *= -1;
    if (d.y < 0 || d.y > H) d.vy *= -1;
    ctx.beginPath(); ctx.arc(d.x, d.y, 1.6, 0, 7);
    ctx.fillStyle = 'rgba(160,150,255,.7)'; ctx.fill();
  }
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < 130) {
        ctx.strokeStyle = `rgba(124,92,255,${(1 - dist / 130) * .35})`;
        ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
      }
    }
    const mx = dots[i].x - mouse.x, my = dots[i].y - mouse.y;
    const md = Math.hypot(mx, my);
    if (md < 160) {
      ctx.strokeStyle = `rgba(0,212,255,${(1 - md / 160) * .6})`;
      ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
  }
  requestAnimationFrame(draw);
})();

// Copy email to clipboard
document.querySelectorAll('[data-copy]').forEach(btn => {
  const hint = btn.parentElement.querySelector('.copy-hint');
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const t = document.createElement('textarea');
      t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (_) {}
      t.remove();
    }
    if (hint) {
      hint.textContent = 'Copied!';
      hint.classList.add('done');
      setTimeout(() => { hint.textContent = 'Tap to copy'; hint.classList.remove('done'); }, 1800);
    }
  });
});

// Header: solid on scroll, hide on scroll down, mobile menu, active section
const nav = document.getElementById('nav');
const toggle = nav.querySelector('.menu-toggle');
const menu = document.getElementById('menu');

function setMenu(open) {
  nav.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (open) nav.classList.remove('hide');
}
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
addEventListener('resize', () => { if (innerWidth > 760) setMenu(false); });
document.addEventListener('click', e => {
  if (nav.classList.contains('menu-open') && !nav.contains(e.target)) setMenu(false);
});

let lastY = scrollY;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('scrolled', y > 40);
  if (!nav.classList.contains('menu-open')) {
    if (y > lastY + 6 && y > 160) nav.classList.add('hide');
    else if (y < lastY - 6 || y <= 160) nav.classList.remove('hide');
  }
  lastY = y;
}, { passive: true });

const links = [...menu.querySelectorAll('a[href^="#"]')];
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    links.forEach(l => {
      const on = l.getAttribute('href') === '#' + en.target.id;
      l.classList.toggle('active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
links.forEach(l => {
  const s = document.querySelector(l.getAttribute('href'));
  if (s && s.tagName === 'SECTION') spy.observe(s);
});
// clear highlight while in the hero
new IntersectionObserver(([en]) => {
  if (en.isIntersecting) links.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
}, { rootMargin: '-45% 0px -50% 0px' }).observe(document.getElementById('home'));

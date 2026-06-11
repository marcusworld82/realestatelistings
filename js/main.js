/* ============================================
   VIDEOLISTAI — MAIN JS
   ============================================ */

'use strict';

// ── HERO CANVAS PARTICLE ANIMATION ──────────────────────────────
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animFrame;

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.life = Math.random() * 200 + 100;
    this.maxLife = this.life;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life--;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height || this.life <= 0) {
      this.reset();
    }
  }
  draw() {
    const fade = this.life / this.maxLife;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * fade})`;
    ctx.fill();
  }
}

function initParticles() {
  resizeCanvas();
  particles = [];
  const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 12000));
  for (let i = 0; i < count; i++) particles.push(new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  animFrame = requestAnimationFrame(animateParticles);
}

// ── NAV SCROLL STATE ─────────────────────────────────────────────
const nav = document.getElementById('nav');
function updateNav() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', updateNav, { passive: true });

// ── MOBILE NAV TOGGLE ────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
let navOpen = false;

navToggle.addEventListener('click', () => {
  navOpen = !navOpen;
  navLinks.classList.toggle('open', navOpen);
  const spans = navToggle.querySelectorAll('span');
  if (navOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navOpen = false;
    navLinks.classList.remove('open');
    navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ── INTERSECTION OBSERVER REVEAL ─────────────────────────────────
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

reveals.forEach((el, i) => {
  el.dataset.delay = (i % 4) * 80;
  revealObs.observe(el);
});

// ── COUNTER ANIMATION ─────────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const isDollar = el.classList.contains('proof__num--dollar');
  const duration = 2200;
  const startTime = performance.now();

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(easeOutExpo(progress) * target);
    if (isDollar) {
      el.textContent = '$' + value.toLocaleString();
    } else {
      el.textContent = value.toLocaleString();
    }
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterEls = document.querySelectorAll('.proof__num[data-target]');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

counterEls.forEach(el => counterObs.observe(el));

// ── ROI CALCULATOR ───────────────────────────────────────────────
const listingsRange = document.getElementById('listingsRange');
const priceRange = document.getElementById('priceRange');
const listingsVal = document.getElementById('listingsVal');
const priceVal = document.getElementById('priceVal');
const roiCarrying = document.getElementById('roiCarrying');
const roiCommission = document.getElementById('roiCommission');
const roiAnnual = document.getElementById('roiAnnual');

function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

function calcROI() {
  const listings = parseInt(listingsRange.value, 10);
  const price = parseInt(priceRange.value, 10);
  const commissionRate = 0.025;
  const carryPerDay = price * 0.005 / 30;
  const daysSaved = 23;
  const carryingSavings = listings * carryPerDay * daysSaved;
  const extraSalesPerMonth = listings / 10;
  const extraCommission = extraSalesPerMonth * price * commissionRate;
  const monthly = carryingSavings + extraCommission;
  const annual = monthly * 12;

  listingsVal.textContent = listings;
  priceVal.textContent = '$' + price.toLocaleString();
  roiCarrying.textContent = fmt(carryingSavings);
  roiCommission.textContent = fmt(extraCommission);
  roiAnnual.textContent = fmt(annual);
}

if (listingsRange && priceRange) {
  listingsRange.addEventListener('input', calcROI);
  priceRange.addEventListener('input', calcROI);
  calcROI();
}

// ── VIDEO PLAY BUTTON OVERLAY ─────────────────────────────────────
document.querySelectorAll('.showcase__video-wrap').forEach(wrap => {
  const video = wrap.querySelector('video');
  const overlay = wrap.querySelector('.showcase__overlay');
  const playBtn = wrap.querySelector('.showcase__play');

  if (!video || !overlay || !playBtn) return;

  playBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }
  });

  video.addEventListener('pause', () => {
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
  });

  video.addEventListener('ended', () => {
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
  });
});

// ── MAGNETIC BUTTON EFFECT ───────────────────────────────────────
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.btn--primary, .btn--ghost').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ── PARALLAX HERO TEXT ───────────────────────────────────────────
let ticking = false;
const heroHeadline = document.querySelector('.hero__headline');
const heroSub = document.querySelector('.hero__sub');

window.addEventListener('scroll', () => {
  if (ticking || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ticking = true;
  requestAnimationFrame(() => {
    const scrollY = window.scrollY;
    if (heroHeadline) heroHeadline.style.transform = `translateY(${scrollY * 0.18}px)`;
    if (heroSub) heroSub.style.transform = `translateY(${scrollY * 0.1}px)`;
    ticking = false;
  });
}, { passive: true });

// ── INIT ─────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  initParticles();
  animateParticles();
  updateNav();
});

window.addEventListener('resize', () => {
  cancelAnimationFrame(animFrame);
  initParticles();
  animateParticles();
}, { passive: true });

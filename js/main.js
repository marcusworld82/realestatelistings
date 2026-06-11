'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── CANVAS PARTICLES ──────────────────────────────────────────────
const canvas = document.getElementById('heroCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let rafId;

function resizeCanvas() {
  if (!canvas) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.offsetWidth;
    this.y = Math.random() * canvas.offsetHeight;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.size = Math.random() * 1.8 + 0.4;
    this.alpha = Math.random() * 0.45 + 0.08;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    if (this.x < -10 || this.x > w + 10 || this.y < -10 || this.y > h + 10) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
    ctx.fill();
  }
}

function initParticles() {
  if (!canvas || prefersReducedMotion) return;
  resizeCanvas();
  particles = [];
  const count = Math.min(120, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 15000));
  for (let i = 0; i < count; i++) particles.push(new Particle());
}

function drawLines() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(255,255,255,${0.08 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }
}

function animateCanvas() {
  if (!canvas || prefersReducedMotion) return;
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  drawLines();
  particles.forEach(p => { p.update(); p.draw(); });
  rafId = requestAnimationFrame(animateCanvas);
}

// ── NAV ───────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function updateNavState() {
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > 24);
}
window.addEventListener('scroll', updateNavState, { passive: true });

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
}

// ── SCROLL REVEAL ─────────────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');
if (!prefersReducedMotion) {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    revealObs.observe(el);
  });
} else {
  reveals.forEach(el => el.classList.add('visible'));
}

// ── COUNTERS ─────────────────────────────────────────────────────
const counters = document.querySelectorAll('.proof__num[data-target]');
function animateCounter(el) {
  const target = Number(el.dataset.target);
  const isDollar = el.classList.contains('proof__num--dollar');
  const start = performance.now();
  const duration = 2200;
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    const val = Math.floor(target * eased);
    el.textContent = isDollar ? `$${val.toLocaleString()}` : val.toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
if (counters.length) {
  const cObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); cObs.unobserve(entry.target); }
    });
  }, { threshold: 0.35 });
  counters.forEach(c => cObs.observe(c));
}

// ── ROI CALCULATOR ───────────────────────────────────────────────
const listingsRange = document.getElementById('listingsRange');
const priceRange    = document.getElementById('priceRange');
const listingsVal   = document.getElementById('listingsVal');
const priceVal      = document.getElementById('priceVal');
const roiCarrying   = document.getElementById('roiCarrying');
const roiCommission = document.getElementById('roiCommission');
const roiAnnual     = document.getElementById('roiAnnual');

function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

function calcROI() {
  if (!listingsRange || !priceRange) return;
  const listings = Number(listingsRange.value);
  const price    = Number(priceRange.value);
  const dailyCarry  = price * 0.005 / 30;
  const carryings   = listings * dailyCarry * 23;
  const commission  = (listings / 10) * price * 0.025;
  const annual      = (carryings + commission) * 12;
  listingsVal.textContent   = listings.toLocaleString();
  priceVal.textContent      = fmt(price);
  roiCarrying.textContent   = fmt(carryings);
  roiCommission.textContent = fmt(commission);
  roiAnnual.textContent     = fmt(annual);
}
[listingsRange, priceRange].forEach(el => el && el.addEventListener('input', calcROI));
calcROI();

// ── VIDEO PLAY BUTTONS ───────────────────────────────────────────
document.querySelectorAll('.showcase__video-wrap').forEach(wrap => {
  const video   = wrap.querySelector('video');
  const overlay = wrap.querySelector('.showcase__overlay');
  const play    = wrap.querySelector('.showcase__play');
  if (!video || !overlay || !play) return;
  play.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }
  });
  ['pause','ended'].forEach(evt => video.addEventListener(evt, () => {
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
  }));
});

// ── SMOOTH SCROLL – View Sample Tours → #showcase ────────────────
const viewSampleBtn = document.getElementById('viewSampleBtn');
if (viewSampleBtn) {
  viewSampleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById('showcase');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ── GLASS TILT HOVER ─────────────────────────────────────────────
if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.glass:not(.hero__content):not(.hero__top-row)').forEach(node => {
    node.addEventListener('mousemove', (e) => {
      const r = node.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      node.style.transform = `perspective(900px) rotateX(${y * -2.5}deg) rotateY(${x * 4}deg) translateY(-2px)`;
    });
    node.addEventListener('mouseleave', () => { node.style.transform = ''; });
  });
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      btn.style.transform = `perspective(600px) rotateX(${y * -3}deg) rotateY(${x * 5}deg) translateY(-3px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// ── PARALLAX HERO ─────────────────────────────────────────────────
const heroCopy = document.querySelector('.hero__copy');
const heroPanel = document.querySelector('.hero__panel');
let ticking = false;
window.addEventListener('scroll', () => {
  if (prefersReducedMotion || ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const offset = Math.min(window.scrollY, 500);
    if (heroCopy)  heroCopy.style.transform  = `translateY(${offset * 0.04}px)`;
    if (heroPanel) heroPanel.style.transform = `translateY(${offset * -0.025}px)`;
    ticking = false;
  });
}, { passive: true });

// ── INIT ─────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  updateNavState();
  if (!prefersReducedMotion) { initParticles(); animateCanvas(); }
});
window.addEventListener('resize', () => {
  if (!canvas || prefersReducedMotion) return;
  cancelAnimationFrame(rafId);
  initParticles();
  animateCanvas();
}, { passive: true });

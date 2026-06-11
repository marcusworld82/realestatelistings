'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    if (this.x < -10 || this.x > canvas.offsetWidth + 10 || this.y < -10 || this.y > canvas.offsetHeight + 10) {
      this.reset();
    }
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
  for (let i = 0; i < count; i += 1) particles.push(new Particle());
}

function drawLines() {
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
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
  particles.forEach((p) => { p.update(); p.draw(); });
  rafId = requestAnimationFrame(animateCanvas);
}

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
      spans.forEach((span) => {
        span.style.transform = '';
        span.style.opacity = '';
      });
    }
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.querySelectorAll('span').forEach((span) => {
        span.style.transform = '';
        span.style.opacity = '';
      });
    });
  });
}

const reveals = document.querySelectorAll('.reveal');
if (!prefersReducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el, index) => {
    el.style.transitionDelay = `${(index % 4) * 70}ms`;
    observer.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add('visible'));
}

const counters = document.querySelectorAll('.proof__num[data-target]');
function animateCounter(el) {
  const target = Number(el.dataset.target);
  const isDollar = el.classList.contains('proof__num--dollar');
  const start = performance.now();
  const duration = 2200;
  const tick = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const value = Math.floor(target * eased);
    el.textContent = isDollar ? `$${value.toLocaleString()}` : value.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

if (counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  counters.forEach((counter) => counterObserver.observe(counter));
}

const listingsRange = document.getElementById('listingsRange');
const priceRange = document.getElementById('priceRange');
const listingsVal = document.getElementById('listingsVal');
const priceVal = document.getElementById('priceVal');
const roiCarrying = document.getElementById('roiCarrying');
const roiCommission = document.getElementById('roiCommission');
const roiAnnual = document.getElementById('roiAnnual');

function formatMoney(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function calculateROI() {
  if (!listingsRange || !priceRange) return;
  const listings = Number(listingsRange.value);
  const price = Number(priceRange.value);
  const commissionRate = 0.025;
  const dailyCarry = price * 0.005 / 30;
  const daysSaved = 23;
  const carryingSavings = listings * dailyCarry * daysSaved;
  const extraSales = listings / 10;
  const extraCommission = extraSales * price * commissionRate;
  const annualImpact = (carryingSavings + extraCommission) * 12;

  listingsVal.textContent = listings.toLocaleString();
  priceVal.textContent = formatMoney(price);
  roiCarrying.textContent = formatMoney(carryingSavings);
  roiCommission.textContent = formatMoney(extraCommission);
  roiAnnual.textContent = formatMoney(annualImpact);
}

[listingsRange, priceRange].forEach((input) => {
  if (input) input.addEventListener('input', calculateROI);
});
calculateROI();

document.querySelectorAll('.showcase__video-wrap').forEach((wrap) => {
  const video = wrap.querySelector('video');
  const overlay = wrap.querySelector('.showcase__overlay');
  const playButton = wrap.querySelector('.showcase__play');
  if (!video || !overlay || !playButton) return;

  playButton.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }
  });

  ['pause', 'ended'].forEach((eventName) => {
    video.addEventListener(eventName, () => {
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
    });
  });
});

if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.btn, .glass').forEach((node) => {
    node.addEventListener('mousemove', (event) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.transform = `perspective(900px) rotateX(${y * -2.5}deg) rotateY(${x * 4}deg) translateY(-2px)`;
    });
    node.addEventListener('mouseleave', () => {
      node.style.transform = '';
    });
  });
}

const heroCopy = document.querySelector('.hero__copy');
const heroPanel = document.querySelector('.hero__panel');
let ticking = false;
window.addEventListener('scroll', () => {
  if (prefersReducedMotion || ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const offset = Math.min(window.scrollY, 500);
    if (heroCopy) heroCopy.style.transform = `translateY(${offset * 0.05}px)`;
    if (heroPanel) heroPanel.style.transform = `translateY(${offset * -0.03}px)`;
    ticking = false;
  });
}, { passive: true });

window.addEventListener('load', () => {
  updateNavState();
  if (!prefersReducedMotion) {
    initParticles();
    animateCanvas();
  }
});

window.addEventListener('resize', () => {
  if (!canvas || prefersReducedMotion) return;
  cancelAnimationFrame(rafId);
  initParticles();
  animateCanvas();
}, { passive: true });

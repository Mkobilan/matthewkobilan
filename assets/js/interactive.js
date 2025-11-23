// Interactive elements for Matthew Kobilan's cyberpunk website
// Starfield effects, glitch animations, carousels, and a badass terminal with Neonstorm and Core Breach Protocol

// Starfield Background Effect (Canvas)
class StarfieldBackground {
  constructor() {
    this.canvas = document.getElementById('starfield-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isActive = true;
    this.speed = 0.5;
    this.warpSpeed = false;

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.createStars();
    this.animate();
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createStars() {
    this.stars = [];
    const starCount = Math.floor((this.width * this.height) / 2000); // Density

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * this.width, // Depth
        size: Math.random() * 1.5,
        color: this.getRandomColor()
      });
    }
  }

  getRandomColor() {
    const colors = ['#ffffff', '#ffe9c4', '#d4fbff']; // White, yellowish, bluish
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animate() {
    if (!this.isActive) return;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Trail effect
    this.ctx.fillRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;

    this.stars.forEach(star => {
      // Move star closer
      star.z -= this.warpSpeed ? 20 : this.speed;

      // Reset star if it passes screen
      if (star.z <= 0) {
        star.z = this.width;
        star.x = Math.random() * this.width;
        star.y = Math.random() * this.height;
      }

      // Project 3D coordinates to 2D
      const x = (star.x - cx) * (this.width / star.z) + cx;
      const y = (star.y - cy) * (this.width / star.z) + cy;
      const size = (1 - star.z / this.width) * star.size * (this.warpSpeed ? 3 : 1);

      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        this.ctx.beginPath();
        this.ctx.fillStyle = star.color;
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    requestAnimationFrame(() => this.animate());
  }

  toggleWarp(active) {
    this.warpSpeed = active;
  }
}

// Swipeable Cards Feature
class SwipeableCards {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.swipeable-track');
    this.cards = Array.from(container.querySelectorAll('.swipeable-card'));

    this.isDragging = false;
    this.startPos = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationID = 0;
    this.currentIndex = 0;

    this.cardWidth = this.cards.length > 0 ? this.cards[0].offsetWidth + 20 : 0;

    this.initEvents();
  }

  initEvents() {
    this.container.addEventListener('touchstart', this.touchStart.bind(this));
    this.container.addEventListener('touchend', this.touchEnd.bind(this));
    this.container.addEventListener('touchmove', this.touchMove.bind(this));

    this.container.addEventListener('mousedown', this.touchStart.bind(this));
    this.container.addEventListener('mouseup', this.touchEnd.bind(this));
    this.container.addEventListener('mouseleave', this.touchEnd.bind(this));
    this.container.addEventListener('mousemove', this.touchMove.bind(this));

    this.container.addEventListener('contextmenu', e => e.preventDefault());

    window.addEventListener('resize', () => {
      this.cardWidth = this.cards.length > 0 ? this.cards[0].offsetWidth + 20 : 0;
      this.setPositionByIndex();
    });
  }

  touchStart(event) {
    this.isDragging = true;
    this.startPos = this.getPositionX(event);
    this.animationID = requestAnimationFrame(this.animation.bind(this));
    this.container.style.cursor = 'grabbing';
  }

  touchEnd() {
    this.isDragging = false;
    cancelAnimationFrame(this.animationID);

    const movedBy = this.currentTranslate - this.prevTranslate;

    if (movedBy < -100 && this.currentIndex < this.cards.length - 1) {
      this.currentIndex += 1;
    }

    if (movedBy > 100 && this.currentIndex > 0) {
      this.currentIndex -= 1;
    }

    this.setPositionByIndex();
    this.container.style.cursor = 'grab';
  }

  touchMove(event) {
    if (this.isDragging) {
      const currentPosition = this.getPositionX(event);
      this.currentTranslate = this.prevTranslate + currentPosition - this.startPos;
    }
  }

  getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  animation() {
    this.setSliderPosition();
    if (this.isDragging) requestAnimationFrame(this.animation.bind(this));
  }

  setSliderPosition() {
    const maxTranslate = 0;
    const minTranslate = -(this.cardWidth * (this.cards.length - 1));

    if (this.currentTranslate > maxTranslate) {
      this.currentTranslate = maxTranslate;
    } else if (this.currentTranslate < minTranslate) {
      this.currentTranslate = minTranslate;
    }

    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  setPositionByIndex() {
    this.currentTranslate = this.currentIndex * -this.cardWidth;
    this.prevTranslate = this.currentTranslate;
    this.setSliderPosition();
  }
}

// Card Carousel functionality - Slider Style
class CardCarousel {
  constructor(container) {
    this.container = container;
    this.carousel = container.querySelector('.card-carousel');
    this.cards = Array.from(container.querySelectorAll('.carousel-card'));
    this.cardCount = this.cards.length;
    this.currentIndex = 0;
    this.startX = 0;
    this.isDragging = false;
    this.isMobile = window.innerWidth < 768;

    if (!container.querySelector('.carousel-nav')) {
      this.createNavButtons();
    }

    this.prevBtn = container.querySelector('.prev-btn');
    this.nextBtn = container.querySelector('.next-btn');

    // Handle window resize events to adjust for mobile/desktop
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
      this.updateCarousel();
    });

    this.updateCarousel();
    this.addEventListeners();
  }

  createNavButtons() {
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-nav-btn prev-btn';
    prevBtn.innerHTML = '❮';
    prevBtn.setAttribute('aria-label', 'Previous card');

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-nav-btn next-btn';
    nextBtn.innerHTML = '❯';
    prevBtn.setAttribute('aria-label', 'Next card');

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    this.container.appendChild(nav);
  }

  addEventListeners() {
    this.prevBtn.addEventListener('click', () => this.prevCard());
    this.nextBtn.addEventListener('click', () => this.nextCard());

    this.container.addEventListener('mousedown', this.onDragStart.bind(this));
    this.container.addEventListener('touchstart', this.onDragStart.bind(this), { passive: true });

    this.container.addEventListener('mousemove', this.onDragMove.bind(this));
    this.container.addEventListener('touchmove', this.onDragMove.bind(this), { passive: true });

    this.container.addEventListener('mouseup', this.onDragEnd.bind(this));
    this.container.addEventListener('touchend', this.onDragEnd.bind(this));
    this.container.addEventListener('mouseleave', this.onDragEnd.bind(this));

    this.cards.forEach((card, index) => {
      card.addEventListener('click', (e) => {
        if (index !== this.currentIndex) {
          e.preventDefault();
          this.goToCard(index);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevCard();
      } else if (e.key === 'ArrowRight') {
        this.nextCard();
      }
    });
  }

  onDragStart(e) {
    this.isDragging = true;
    this.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    this.container.style.cursor = 'grabbing';
  }

  onDragMove(e) {
    if (!this.isDragging) return;

    const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    const diff = currentX - this.startX;

    if (diff > 50) {
      this.container.classList.add('dragging-prev');
    } else if (diff < -50) {
      this.container.classList.add('dragging-next');
    } else {
      this.container.classList.remove('dragging-prev', 'dragging-next');
    }
  }

  onDragEnd(e) {
    if (!this.isDragging) return;

    const currentX = e.type.includes('mouse') ? e.pageX : (e.changedTouches ? e.changedTouches[0].pageX : this.startX);
    const diff = currentX - this.startX;

    // Adjust threshold for mobile vs desktop
    const threshold = this.isMobile ? 50 : 100;

    if (diff > threshold) {
      this.prevCard();
    } else if (diff < -threshold) {
      this.nextCard();
    }

    this.isDragging = false;
    this.container.style.cursor = 'pointer';
    this.container.classList.remove('dragging-prev', 'dragging-next');
  }

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  }

  nextCard() {
    if (this.currentIndex < this.cardCount - 1) {
      this.currentIndex++;
      this.updateCarousel();
    }
  }

  goToCard(index) {
    if (index >= 0 && index < this.cardCount) {
      this.currentIndex = index;
      this.updateCarousel();
    }
  }

  updateCarousel() {
    this.cards.forEach(card => card.classList.remove('active', 'next', 'prev', 'far-next', 'far-prev'));

    this.cards.forEach((card, index) => {
      const offset = index - this.currentIndex;

      if (this.isMobile) {
        // Simplified transformations for mobile that still look good
        if (offset === 0) {
          card.classList.add('active');
          card.style.transform = 'translateX(-50%) scale(1)';
          card.style.zIndex = 10;
          card.style.opacity = 1;
        } else if (offset === 1) {
          card.classList.add('next');
          card.style.transform = 'translateX(30%) scale(0.85)';
          card.style.zIndex = 9;
          card.style.opacity = 0.8;
        } else if (offset === -1) {
          card.classList.add('prev');
          card.style.transform = 'translateX(-130%) scale(0.85)';
          card.style.zIndex = 9;
          card.style.opacity = 0.8;
        } else {
          card.style.transform = offset > 0
            ? 'translateX(100%) scale(0.7)'
            : 'translateX(-200%) scale(0.7)';
          card.style.zIndex = 0;
          card.style.opacity = 0;
        }
      } else {
        // Full 3D effect for desktop
        if (offset === 0) {
          card.classList.add('active');
          card.style.transform = 'translateX(-50%) scale(1)';
          card.style.zIndex = 10;
          card.style.opacity = 1;
        } else if (offset === 1) {
          card.classList.add('next');
          card.style.transform = 'translateX(20%) scale(0.9) rotate(5deg)';
          card.style.zIndex = 9;
          card.style.opacity = 0.9;
        } else if (offset === -1) {
          card.classList.add('prev');
          card.style.transform = 'translateX(-120%) scale(0.9) rotate(-5deg)';
          card.style.zIndex = 9;
          card.style.opacity = 0.9;
        } else if (offset === 2) {
          card.classList.add('far-next');
          card.style.transform = 'translateX(70%) scale(0.8) rotate(10deg)';
          card.style.zIndex = 8;
          card.style.opacity = 0.7;
        } else if (offset === -2) {
          card.classList.add('far-prev');
          card.style.transform = 'translateX(-170%) scale(0.8) rotate(-10deg)';
          card.style.zIndex = 8;
          card.style.opacity = 0.7;
        } else {
          card.style.transform = offset > 0
            ? 'translateX(120%) scale(0.7)'
            : 'translateX(-220%) scale(0.7)';
          card.style.zIndex = 0;
          card.style.opacity = 0;
        }
      }
    });

    this.updateButtonStates();
  }

  updateButtonStates() {
    if (this.currentIndex === 0) {
      this.prevBtn.classList.add('disabled');
      this.prevBtn.disabled = true;
    } else {
      this.prevBtn.classList.remove('disabled');
      this.prevBtn.disabled = false;
    }

    if (this.currentIndex === this.cardCount - 1) {
      this.nextBtn.classList.add('disabled');
      this.nextBtn.disabled = true;
    } else {
      this.nextBtn.classList.remove('disabled');
      this.nextBtn.disabled = false;
    }
  }
}

// Glitch text effect
class GlitchText {
  constructor(selector) {
    this.elements = document.querySelectorAll(selector);
    this.init();
  }

  init() {
    this.elements.forEach(element => {
      const originalText = element.textContent;
      element.dataset.originalText = originalText;

      element.addEventListener('mouseover', () => this.startGlitch(element));
      element.addEventListener('mouseout', () => this.stopGlitch(element));
    });
  }

  startGlitch(element) {
    if (element.glitchInterval) return;

    const originalText = element.dataset.originalText;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}:"<>?|';

    let glitchCount = 0;
    element.glitchInterval = setInterval(() => {
      let glitchedText = '';
      for (let i = 0; i < originalText.length; i++) {
        if (Math.random() < 0.1) {
          glitchedText += chars.charAt(Math.floor(Math.random() * chars.length));
        } else {
          glitchedText += originalText[i];
        }
      }

      element.textContent = glitchedText;

      glitchCount++;
      if (glitchCount > 10) {
        element.textContent = originalText;
        clearInterval(element.glitchInterval);
        element.glitchInterval = null;

        setTimeout(() => {
          if (element.matches(':hover')) {
            this.startGlitch(element);
          }
        }, 500);
      }
    }, 100);
  }

  stopGlitch(element) {
    if (element.glitchInterval) {
      clearInterval(element.glitchInterval);
      element.glitchInterval = null;
      element.textContent = element.dataset.originalText;
    }
  }
}

// Synthwave effect handler (Visual Only)
let synthwaveActive = false;
let synthwaveTimeout = null;
let staticOverlay = null;
let gridOverlay = null;

function toggleSynthwaveEffect() {
  if (synthwaveActive) {
    document.documentElement.style.setProperty('--neon-pink', '#ff69b4');
    document.documentElement.style.setProperty('--neon-blue', '#60A5FA');
    document.documentElement.style.setProperty('--neon-purple', '#5B21B6');
    if (staticOverlay) {
      document.body.removeChild(staticOverlay);
      staticOverlay = null;
    }
    if (gridOverlay) {
      document.body.removeChild(gridOverlay);
      gridOverlay = null;
    }
    clearTimeout(synthwaveTimeout);
    synthwaveActive = false;
    return 'Synthwave effect deactivated. Back to the cyberpunk grid.';
  } else {
    document.documentElement.style.setProperty('--neon-pink', '#ff00ea');
    document.documentElement.style.setProperty('--neon-blue', '#00dbff');
    document.documentElement.style.setProperty('--neon-purple', '#a100ff');

    // Static Overlay
    staticOverlay = document.createElement('div');
    staticOverlay.className = 'synthwave-static-overlay';
    staticOverlay.style.position = 'fixed';
    staticOverlay.style.top = '0';
    staticOverlay.style.left = '0';
    staticOverlay.style.width = '100%';
    staticOverlay.style.height = '100%';
    staticOverlay.style.pointerEvents = 'none';
    staticOverlay.style.zIndex = '5';
    staticOverlay.style.background = 'repeating-linear-gradient(to bottom, transparent 0%, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px)';
    staticOverlay.style.animation = 'static-shift 0.5s linear infinite';

    // Perspective Grid Overlay
    gridOverlay = document.createElement('div');
    gridOverlay.className = 'synthwave-grid-overlay';
    gridOverlay.style.position = 'fixed';
    gridOverlay.style.bottom = '0';
    gridOverlay.style.left = '0';
    gridOverlay.style.width = '100%';
    gridOverlay.style.height = '50%';
    gridOverlay.style.pointerEvents = 'none';
    gridOverlay.style.zIndex = '4';
    gridOverlay.style.transform = 'perspective(500px) rotateX(60deg)';
    gridOverlay.style.backgroundImage = 'linear-gradient(to right, rgba(255, 0, 234, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 0, 234, 0.5) 1px, transparent 1px)';
    gridOverlay.style.backgroundSize = '40px 40px';
    gridOverlay.style.animation = 'grid-move 20s linear infinite';

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes static-shift {
        0% { background-position: 0 0; }
        100% { background-position: 0 4px; }
      }
      @keyframes grid-move {
        0% { background-position: 0 0; }
        100% { background-position: 0 100%; }
      }
    `;
    document.head.appendChild(styleSheet);
    document.body.appendChild(staticOverlay);
    document.body.appendChild(gridOverlay);

    synthwaveTimeout = setTimeout(() => {
      toggleSynthwaveEffect();
    }, 30000);
    synthwaveActive = true;
    return 'Synthwave effect activated! Neon vibes intensified for 30 seconds. Type again to toggle.';
  }
}

// Neonstorm effect handler (Visual Only)
let neonstormActive = false;
let neonstormTimeout = null;
let neonstormOverlay = null;

function toggleNeonstormEffect() {
  if (neonstormActive) {
    document.documentElement.style.setProperty('--neon-pink', '#ff69b4');
    document.documentElement.style.setProperty('--neon-blue', '#60A5FA');
    document.documentElement.style.setProperty('--neon-purple', '#5B21B6');
    document.querySelectorAll('.neon-glow').forEach(el => el.classList.remove('neon-glow-intense'));
    document.querySelectorAll('.neon-border').forEach(el => el.classList.remove('neon-border-intense'));
    if (neonstormOverlay) {
      document.body.removeChild(neonstormOverlay);
      neonstormOverlay = null;
    }
    clearTimeout(neonstormTimeout);
    neonstormActive = false;
    return 'Neon storm dissipated. Grid stabilized.';
  } else {
    document.documentElement.style.setProperty('--neon-pink', '#ff00ea');
    document.documentElement.style.setProperty('--neon-blue', '#00dbff');
    document.documentElement.style.setProperty('--neon-purple', '#a100ff');
    document.querySelectorAll('.neon-glow').forEach(el => el.classList.add('neon-glow-intense'));
    document.querySelectorAll('.neon-border').forEach(el => el.classList.add('neon-border-intense'));

    neonstormOverlay = document.createElement('div');
    neonstormOverlay.className = 'neonstorm-rain-overlay';
    neonstormOverlay.style.position = 'fixed';
    neonstormOverlay.style.top = '0';
    neonstormOverlay.style.left = '0';
    neonstormOverlay.style.width = '100%';
    neonstormOverlay.style.height = '100%';
    neonstormOverlay.style.pointerEvents = 'none';
    neonstormOverlay.style.zIndex = '10';

    // Lightning Flash
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'white';
    flash.style.opacity = '0';
    flash.style.transition = 'opacity 0.1s';
    neonstormOverlay.appendChild(flash);

    // Trigger lightning randomly
    const lightningLoop = setInterval(() => {
      if (!neonstormActive) {
        clearInterval(lightningLoop);
        return;
      }
      if (Math.random() > 0.7) {
        flash.style.opacity = '0.8';
        setTimeout(() => { flash.style.opacity = '0'; }, 100);
        setTimeout(() => { flash.style.opacity = '0.4'; }, 150);
        setTimeout(() => { flash.style.opacity = '0'; }, 250);
      }
    }, 2000);

    for (let i = 0; i < 100; i++) {
      const bit = document.createElement('div');
      bit.className = 'neonstorm-rain-bit';
      bit.style.position = 'absolute';
      bit.style.top = '-20px';
      bit.style.left = `${Math.random() * 100}%`;
      bit.style.color = '#00dbff';
      bit.style.fontSize = `${Math.random() * 20 + 10}px`;
      bit.style.opacity = Math.random();
      bit.style.animation = `fall ${Math.random() * 2 + 1}s linear infinite`;
      bit.style.animationDelay = `${Math.random() * 2}s`;
      bit.textContent = Math.random() > 0.5 ? '1' : '0';
      neonstormOverlay.appendChild(bit);
    }

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes fall {
        to { transform: translateY(100vh); }
      }
    `;
    document.head.appendChild(styleSheet);
    document.body.appendChild(neonstormOverlay);

    neonstormTimeout = setTimeout(() => {
      toggleNeonstormEffect();
    }, 30000);
    neonstormActive = true;
    return `
      <div class="text-green-400">
        <p class="text-xl text-pink-500 mb-2 glitch-effect">NEON STORM UNLEASHED</p>
        <p class="mb-2">Lightning powers the grid... Digital rain descends...</p>
      </div>
    `;
  }
}

// Core Breach Protocol handler (Visual Only)
let coreBreachActive = false;
let coreBreachTimeout = null;
let coreBreachOverlays = {
  neonstorm: null,
  matrix: null,
  static: null,
  countdown: null
};

function toggleCoreBreachEffect(terminal) {
  if (!window.starfieldBackground || !terminal) {
    return 'Error: Required elements not found. Core Breach aborted.';
  }

  if (coreBreachActive) {
    document.documentElement.style.setProperty('--neon-pink', '#ff69b4');
    document.documentElement.style.setProperty('--neon-blue', '#60A5FA');
    document.documentElement.style.setProperty('--neon-purple', '#5B21B6');
    window.starfieldBackground.toggleWarp(false);

    Object.values(coreBreachOverlays).forEach(overlay => overlay && document.body.removeChild(overlay));
    coreBreachOverlays = { neonstorm: null, matrix: null, static: null, countdown: null };
    clearTimeout(coreBreachTimeout);
    coreBreachActive = false;
    return 'Core breach terminated. System stabilized.';
  } else {
    document.documentElement.style.setProperty('--neon-pink', '#ff00ea');
    document.documentElement.style.setProperty('--neon-blue', '#00dbff');
    document.documentElement.style.setProperty('--neon-purple', '#a100ff');

    coreBreachOverlays.neonstorm = document.createElement('div');
    coreBreachOverlays.neonstorm.className = 'neonstorm-overlay';
    for (let i = 0; i < 50; i++) {
      const streak = document.createElement('div');
      streak.className = 'neon-rain';
      streak.style.left = `${Math.random() * 100}%`;
      streak.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
      streak.style.animationDelay = `${Math.random() * 2}s`;
      coreBreachOverlays.neonstorm.appendChild(streak);
    }
    document.body.appendChild(coreBreachOverlays.neonstorm);

    coreBreachOverlays.matrix = document.createElement('div');
    coreBreachOverlays.matrix.className = 'matrix-rain-overlay';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    for (let i = 0; i < 50; i++) {
      const stream = document.createElement('div');
      stream.className = 'matrix-rain-stream';
      stream.style.left = `${Math.random() * 100}%`;
      stream.style.animationDelay = `${Math.random() * 2}s`;
      let streamText = '';
      for (let j = 0; j < 20; j++) {
        streamText += chars.charAt(Math.floor(Math.random() * chars.length)) + '<br>';
      }
      stream.innerHTML = streamText;
      coreBreachOverlays.matrix.appendChild(stream);
    }
    document.body.appendChild(coreBreachOverlays.matrix);

    coreBreachOverlays.static = document.createElement('div');
    coreBreachOverlays.static.className = 'synthwave-static-overlay';
    coreBreachOverlays.static.style.background = 'repeating-linear-gradient(to bottom, transparent 0%, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px)';
    coreBreachOverlays.static.style.animation = 'static-shift 0.5s linear infinite, pulse-static 2s ease-in-out infinite';
    document.body.appendChild(coreBreachOverlays.static);

    coreBreachOverlays.countdown = document.createElement('div');
    coreBreachOverlays.countdown.className = 'countdown-overlay';
    coreBreachOverlays.countdown.innerHTML = '<div class="countdown-message">Grid Integrity: 75%</div>';
    document.body.appendChild(coreBreachOverlays.countdown);

    window.starfieldBackground.toggleWarp(true);

    let countdown = 75;
    function updateCountdown() {
      if (!coreBreachActive) return;
      countdown -= 25;
      if (countdown > 0) {
        terminal.print(`<div class="text-green-400">Grid Integrity: ${countdown}%</div>`);
        coreBreachOverlays.countdown.querySelector('.countdown-message').textContent = `Grid Integrity: ${countdown}%`;
        coreBreachTimeout = setTimeout(updateCountdown, 10000);
      } else {
        terminal.print(`
          <div class="text-green-400">
            <p class="text-xl text-pink-500 mb-2 glitch-effect">CORE BREACH SUCCESSFUL</p>
            <p class="mb-2">Core breach terminated. You are legend.</p>
            <p class="mb-2">Badge Unlocked: Core Breacher [Grid Master]</p>
            <p class="mb-2">Discount Code: <span class="text-blue-600">${generateDiscountCode()}</span> (5% off any project)</p>
          </div>
        `);
        coreBreachOverlays.countdown.querySelector('.countdown-message').textContent = 'Grid Integrity: 0%';
        sessionStorage.setItem('CoreBreacher', 'true');
        toggleCoreBreachEffect(terminal);
      }
    }
    setTimeout(updateCountdown, 10000);

    coreBreachActive = true;
    return `
      <div class="text-green-400">
        <p class="text-xl text-pink-500 mb-2 glitch-effect">CORE BREACH PROTOCOL INITIATED</p>
        <p class="mb-2">Neon storm detected… Synthwave pulse online… Matrix code streaming…</p>
      </div>
    `;
  }
}

function generateDiscountCode() {
  let code = sessionStorage.getItem('coreBreachCode');
  if (!code) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    sessionStorage.setItem('coreBreachCode', code);
  }
  return code;
}

// Terminal effect
class TerminalEffect {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.commands = {};
    this.history = [];
    this.historyIndex = -1;

    this.initTerminal();
    this.addBasicCommands();
  }

  initTerminal() {
    this.terminal = document.createElement('div');
    this.terminal.className = 'terminal bg-gray-900 text-green-400 p-4 rounded-lg border border-blue-600 shadow-lg max-h-96 overflow-y-auto font-mono text-sm';

    this.output = document.createElement('div');
    this.output.className = 'terminal-output mb-4';

    this.inputLine = document.createElement('div');
    this.inputLine.className = 'terminal-input-line flex';

    const prompt = document.createElement('span');
    prompt.className = 'terminal-prompt text-pink-500 mr-2';
    prompt.innerHTML = 'info@matthewkobilan.com:~$ ';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'terminal-input bg-transparent text-green-400 outline-none flex-1 caret-pink-500';
    // Mobile-friendly tweaks
    this.input.style.fontSize = window.innerWidth < 700 ? '1.1rem' : '1rem';
    this.input.style.minHeight = '44px';
    this.input.style.padding = '0.5rem';
    this.input.style.borderRadius = '6px';
    this.input.style.boxSizing = 'border-box';
    this.input.setAttribute('spellcheck', 'false');

    this.inputLine.appendChild(prompt);
    this.inputLine.appendChild(this.input);

    this.terminal.appendChild(this.output);
    this.terminal.appendChild(this.inputLine);

    this.container.appendChild(this.terminal);

    this.input.addEventListener('keydown', this.handleKeyDown.bind(this));

    this.terminal.addEventListener('click', () => {
      this.input.focus();
    });

    this.print(`
      <div class="mb-2">
        <span class="text-blue-500 text-xl">╔══════════════════════════════════════════════════════╗</span>
        <span class="text-blue-500 text-xl">║                                                      ║</span>
        <span class="text-blue-500 text-xl">║  <span class="text-pink-500">MATTHEW KOBILAN</span> - <span class="text-green-400">CYBERPUNK TERMINAL v2.0</span>        ║</span>
        <span class="text-blue-500 text-xl">║                                                      ║</span>
        <span class="text-blue-500 text-xl">╚══════════════════════════════════════════════════════╝</span>
      </div>
      ${sessionStorage.getItem('hackerBadge') ? '<p class="mb-2 text-green-400">Badge: Grid Hacker [Elite Status]</p>' : ''}
      ${sessionStorage.getItem('shadowrunAchievement') ? '<p class="mb-2 text-green-400">Badge: Shadowrunner [Classified Access]</p>' : ''}
      ${sessionStorage.getItem('CoreBreacher') ? '<p class="mb-2 text-green-400">Badge: Core Breacher [Grid Master]</p>' : ''}
      <p class="mb-2">Welcome to the interactive terminal. Type <span class="text-pink-500">help</span> to see available commands.</p>
      <p class="mb-2 text-blue-400">Rumor has it, the grid hides secrets. Try unconventional commands...</p>
      <p class="text-xs text-gray-500 mb-4">System initialized: ${new Date().toLocaleString()}</p>
    `);
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      const command = this.input.value.trim();
      this.executeCommand(command);
      this.input.value = '';

      if (command) {
        this.history.unshift(command);
        this.historyIndex = -1;
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
        setTimeout(() => {
          this.input.selectionStart = this.input.selectionEnd = this.input.value.length;
        }, 0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        this.input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.autocomplete();
    }
  }

  autocomplete() {
    const input = this.input.value.trim();
    if (!input) return;

    const possibleCommands = Object.keys(this.commands).filter(cmd => cmd.startsWith(input));

    if (possibleCommands.length === 1) {
      this.input.value = possibleCommands[0];
    } else if (possibleCommands.length > 1) {
      this.print(`
        <div class="text-gray-400">
          <p>Possible commands:</p>
          <div class="pl-4">${possibleCommands.join(', ')}</div>
        </div>
      `);
    }
  }

  executeCommand(command) {
    if (!command) return;

    this.print(`<div class="text-pink-500">info@matthewkobilan.com:~$ <span class="text-green-400">${command}</span></div>`);

    if (command.toLowerCase() === 'neonstorm synthwave matrix') {
      const output = toggleCoreBreachEffect(this);
      if (output) {
        this.print(output);
      }
    } else {
      const args = command.split(' ');
      const cmd = args.shift().toLowerCase();

      if (this.commands[cmd]) {
        const output = this.commands[cmd].execute(args);
        if (output) {
          this.print(output);
        }
      } else {
        this.print(`<div class="text-red-500">Command not found: ${cmd}. Type <span class="text-pink-500">help</span> for available commands.</div>`);
      }
    }

    this.terminal.scrollTop = this.terminal.scrollHeight;
  }

  print(html) {
    this.output.innerHTML += html;
    // Always scroll output to the bottom
    this.output.scrollTop = this.output.scrollHeight;
    this.terminal.scrollTop = this.terminal.scrollHeight;
    // On mobile, also scroll window to terminal if needed
    if (window.innerWidth < 700) {
      this.terminal.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    // Always keep input focused
    if (this.input) {
      this.input.focus();
    }
  }

  addCommand(name, description, executeFunc) {
    this.commands[name] = {
      description,
      execute: executeFunc
    };
  }

  addBasicCommands() {
    this.addCommand('help', 'Display available commands', () => {
      let output = `
        <div class="text-green-400 mb-2">
          <p class="text-xl text-blue-500 mb-2">Available Commands:</p>
          <table class="w-full text-left">
            <thead>
              <tr>
                <th class="pb-2 text-pink-500">Command</th>
                <th class="pb-2 text-pink-500">Description</th>
              </tr>
            </thead>
            <tbody>
      `;

      Object.keys(this.commands).sort().forEach(cmd => {
        output += `
          <tr>
            <td class="pr-4 text-blue-400">${cmd}</td>
            <td>${this.commands[cmd].description}</td>
          </tr>
        `;
      });

      output += `
            </tbody>
          </table>
        </div>
      `;

      return output;
    });

    this.addCommand('clear', 'Clear the terminal', () => {
      this.output.innerHTML = '';
      return '';
    });

    this.addCommand('about', 'About Matthew Kobilan', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2">Matthew Kobilan</p>
          <p class="mb-2">Full-Stack Developer & Web3 Specialist based in the digital frontier.</p>
          <p class="mb-2">Specializing in:</p>
          <ul class="list-disc pl-5 mb-2">
            <li>Custom Web Applications</li>
            <li>E-commerce Solutions</li>
            <li>Web3 & NFT Integration</li>
            <li>Cyberpunk UI/UX Design</li>
            <li>Full-Stack Development</li>
          </ul>
          <p>Building digital experiences that push boundaries and create lasting impressions.</p>
        </div>
      `;
    });

    this.addCommand('skills', 'List technical skills', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2">Technical Skills:</p>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <div>
              <p class="text-blue-400 font-bold">Frontend:</p>
              <ul class="list-disc pl-5">
                <li>React / Next.js</li>
                <li>Vue.js / Nuxt.js</li>
                <li>HTML5 / CSS3</li>
                <li>Tailwind CSS</li>
                <li>JavaScript / TypeScript</li>
              </ul>
            </div>
            <div>
              <p class="text-blue-400 font-bold">Backend:</p>
              <ul class="list-disc pl-5">
                <li>Node.js / Express</li>
                <li>Python / Django</li>
                <li>PHP / Laravel</li>
                <li>MongoDB / PostgreSQL</li>
                <li>GraphQL / REST APIs</li>
              </ul>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <p class="text-blue-400 font-bold">Web3:</p>
              <ul class="list-disc pl-5">
                <li>Solidity / Smart Contracts</li>
                <li>Ethereum / Solana</li>
                <li>NFT Minting</li>
                <li>Web3.js / Ethers.js</li>
                <li>Crypto Payment Integration</li>
              </ul>
            </div>
            <div>
              <p class="text-blue-400 font-bold">DevOps:</p>
              <ul class="list-disc pl-5">
                <li>AWS / Azure</li>
                <li>Docker / Kubernetes</li>
                <li>CI/CD Pipelines</li>
                <li>Git / GitHub</li>
                <li>Linux Server Administration</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    });

    this.addCommand('projects', 'View portfolio projects', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2">Featured Projects:</p>
          
          <div class="mb-4">
            <p class="text-blue-400 font-bold">Lemon Club Collective</p>
            <p class="mb-1">A gamified Web3 platform with Solana NFT minting, e-commerce, and crypto payments.</p>
            <p class="text-xs text-gray-400">Technologies: React, Solidity, Node.js, Web3.js</p>
            <p class="text-xs text-pink-500">URL: <a href="https://www.lemonclubcollective.com" class="text-blue-400 hover:underline" target="_blank">lemonclubcollective.com</a></p>
          </div>
          
          <div class="mb-4">
            <p class="text-blue-400 font-bold">matthewkobilan.com</p>
            <p class="mb-1">Personal portfolio showcasing full-stack skills and cyberpunk design aesthetics.</p>
            <p class="text-xs text-gray-400">Technologies: HTML5, Tailwind CSS, JavaScript, Stripe</p>
            <p class="text-xs text-pink-500">URL: <a href="/" class="text-blue-400 hover:underline">matthewkobilan.com</a></p>
          </div>
        </div>
      `;
    });

    this.addCommand('contact', 'Get contact information', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2">Contact Information:</p>
          <p class="mb-1">Email: <span class="text-blue-400">matthew.kobilan@gmail.com</span></p>
          <p class="mb-1">Twitter: <span class="text-blue-400">@matthewkobilan</span></p>
          <p class="mb-4">Or use the contact form on the website.</p>
          <p>I typically respond within 24 hours to discuss your project!</p>
        </div>
      `;
    });

    this.addCommand('services', 'View services offered', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2">Services Offered:</p>
          
          <div class="mb-2">
            <p class="text-blue-400 font-bold">🌐 Web Development</p>
            <p>Custom websites and web applications with cutting-edge design and functionality.</p>
          </div>
          
          <div class="mb-2">
            <p class="text-blue-400 font-bold">🔗 Web3 Integration</p>
            <p>Blockchain technology integration, NFT platforms, and crypto payment systems.</p>
          </div>
          
          <div class="mb-2">
            <p class="text-blue-400 font-bold">🛒 E-commerce Solutions</p>
            <p>Online stores with payment processing, inventory management, and customer portals.</p>
          </div>
          
          <div class="mb-2">
            <p class="text-blue-400 font-bold">👥 Creator Platforms</p>
            <p>Custom platforms for content creators with membership areas and monetization tools.</p>
          </div>
        </div>
      `;
    });

    this.addCommand('pricing', 'View pricing information', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2 glitch-effect">_PRICING:MATRIX_</p>
          
          <div class="mb-3 neon-border p-3" style="border: 1px solid #ec4899; background-color: rgba(20, 20, 30, 0.7);">
            <p class="text-blue-400 font-bold">[SYSTEM]: Pricing parameters calibrating...</p>
            <p class="mb-2">Each digital construct is uniquely configured to client specifications.</p>
            <p class="mb-2 text-pink-500">// Pricing varies based on project complexity, scope, and timeline //</p>
            <div class="grid grid-cols-2 gap-2 mt-3">
              <div>
                <p class="text-blue-400">PARAMETERS:</p>
                <ul class="list-disc pl-5">
                  <li>Project complexity</li>
                  <li>Feature requirements</li>
                  <li>Timeline constraints</li>
                  <li>Integration needs</li>
                </ul>
              </div>
              <div>
                <p class="text-blue-400">DELIVERABLES:</p>
                <ul class="list-disc pl-5">
                  <li>Custom code architecture</li>
                  <li>Responsive interfaces</li>
                  <li>Secure data handling</li>
                  <li>Post-launch support</li>
                </ul>
              </div>
            </div>
          </div>
          
          <p class="text-xs text-pink-300 blink-text">Contact for a personalized quote tailored to your digital vision.</p>
          <p class="text-xs text-blue-400 mt-2">[ Type <span class="text-pink-500">contact</span> to initiate communication protocols ]</p>
        </div>
      `;
    });

    this.addCommand('dev', 'Unlock developer mode', () => {
      this.print('<div class="text-blue-400">Initializing developer sequence...</div>');
      setTimeout(() => {
        window.open('website-development.html', '_blank');
      }, 1500);

      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2 glitch-effect">ACCESS GRANTED</p>
          <p class="mb-2">Developer mode activated. Opening secret development portal...</p>
          <p class="text-xs text-blue-400 blink-text">Congratulations on discovering this hidden feature!</p>
        </div>
      `;
    });

    this.addCommand('neonhack', 'Initiate a neon hack sequence', () => {
      this.print('<div class="text-blue-400">Injecting neon payload...</div>');
      setTimeout(() => {
        window.open('hidden/neonhack.html', '_blank');
      }, 1500);
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2 glitch-effect">NEON HACK INITIATED</p>
          <p class="mb-2">Accessing the grid... Sequence started.</p>
          <p class="text-xs text-blue-400 blink-text">Prepare for digital immersion.</p>
        </div>
      `;
    });



    this.addCommand('gridrunner2025', 'Enter the secret code', () => {
      let userCode = sessionStorage.getItem('gridrunnerCode');
      if (!userCode) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        userCode = '';
        for (let i = 0; i < 8; i++) {
          userCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        sessionStorage.setItem('gridrunnerCode', userCode);
      }
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2 glitch-effect">CODE ACCEPTED</p>
          <p class="mb-2">Achievement Unlocked: Grid Runner</p>
          <p class="mb-2">Your unique code: <span class="text-blue-600">${userCode}</span></p>
          <p class="mb-2">Use this code for a 5% discount on any project. Mention it in your contact form!</p>
        </div>
      `;
    });

    this.addCommand('ghostprotocol', 'Initiate a hacking protocol', () => {
      this.print('<div class="text-blue-400">Ghost Protocol engaged. Masking IP...</div>');
      setTimeout(() => {
        window.open('hidden/game.html', '_blank');
      }, 1500);
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2 glitch-effect">GHOST PROTOCOL ACTIVATED</p>
          <p class="mb-2">Launching hacking simulator... Breach the grid.</p>
          <p class="text-xs text-blue-400 blink-text">Only the elite can conquer the megacorp.</p>
        </div>
      `;
    });

    this.addCommand('zerocool', 'Unlock a hidden message', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2 glitch-effect">ZEROCOOL DETECTED</p>
          <p class="mb-2">Legendary hacker vibes! More secrets await...</p>
          <p class="text-xs text-blue-400 blink-text">Keep exploring the grid.</p>
        </div>
      `;
    });

    this.addCommand('synthwave', 'Activate a synthwave visual effect', () => {
      const message = toggleSynthwaveEffect();
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2 glitch-effect">SYNTHWAVE MODE</p>
          <p class="mb-2">${message}</p>
        </div>
      `;
    });

    this.addCommand('shadowrun', 'Access a classified project', () => {
      this.print('<div class="text-blue-400">Authenticating Shadowrun credentials...</div>');
      setTimeout(() => {
        window.open('hidden/shadowrun.html', '_blank');
      }, 1500);
      sessionStorage.setItem('shadowrunAchievement', 'true');
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2 glitch-effect">SHADOWRUN PROTOCOL ACTIVATED</p>
          <p class="mb-2">Accessing classified project... Grid infiltration successful.</p>
          <p class="mb-2">Achievement Unlocked: Shadowrunner</p>
          <p class="text-xs text-blue-400 blink-text">You’ve uncovered a hidden operation. Proceed with caution.</p>
        </div>
      `;
    });

    this.addCommand('neonstorm', 'Unleash a neon storm effect', () => {
      const message = toggleNeonstormEffect();
      return message;
    });

    this.addCommand('creators', 'Information for content creators', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2">For Content Creators:</p>
          
          <div class="mb-3">
            <p class="text-blue-400 font-bold">Platform Benefits:</p>
            <ul class="list-disc pl-5 mb-2">
              <li>Own your platform and keep 100% of revenue</li>
              <li>Multiple monetization options</li>
              <li>Community building tools</li>
              <li>Gamification and engagement features</li>
              <li>NFT integration for digital collectibles</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <p class="text-blue-400 font-bold">Creator-Specific Features:</p>
            <ul class="list-disc pl-5 mb-2">
              <li>Members-only content areas</li>
              <li>Subscription management</li>
              <li>Digital product sales</li>
              <li>Live event ticketing</li>
              <li>Fan engagement tools</li>
            </ul>
          </div>
          
          <p>Type <span class="text-pink-500">features</span> for more detailed creator platform features.</p>
        </div>
      `;
    });

    this.addCommand('features', 'Detailed creator platform features', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2">Creator Platform Features:</p>
          <ul class="list-disc pl-5 mb-3">
            <li><span class="text-blue-400">🌐 Custom Domain</span> - Your own branded web address</li>
            <li><span class="text-blue-400">🔒 Members-Only Content</span> - Exclusive areas for paying fans</li>
            <li><span class="text-blue-400">💰 Multiple Payment Options</span> - Credit card, crypto, subscriptions</li>
            <li><span class="text-blue-400">🎮 Gamification</span> - Quests, badges, and rewards for fans</li>
            <li><span class="text-blue-400">🖼️ NFT Integration</span> - Create and sell digital collectibles</li>
            <li><span class="text-blue-400">📱 Mobile App</span> - iOS and Android companion apps</li>
            <li><span class="text-blue-400">💬 Community Tools</span> - Forums, chats, and direct messaging</li>
            <li><span class="text-blue-400">📊 Analytics Dashboard</span> - Track engagement and revenue</li>
          </ul>
          
          <p>Type <span class="text-pink-500">nft</span> to learn about NFT integration or <span class="text-pink-500">monetize</span> for monetization options.</p>
        </div>
      `;
    });

    this.addCommand('nft', 'Learn about NFT integration', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2">NFT Integration:</p>
          <div class="text-left mb-3">
            <p>Create and sell unique digital collectibles to your fans:</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Mint NFTs on Ethereum, Solana, or other chains</li>
              <li>Create tiered access based on NFT ownership</li>
              <li>Offer exclusive perks to NFT holders</li>
              <li>Set up royalties for secondary sales</li>
              <li>Create limited edition drops and collections</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <p class="text-blue-400 font-bold">Case Study: Lemon Club Collective</p>
            <p>An NFT project featuring unique digital collectibles that grant access to exclusive content, community features, and real-world perks.</p>
          </div>
        </div>
      `;
    });

    this.addCommand('monetize', 'Monetization options', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2">Monetization Options:</p>
          <div class="text-left">
            <ul class="list-disc pl-5 mb-3">
              <li><span class="text-blue-400">💲 Subscriptions</span> - Recurring revenue from members</li>
              <li><span class="text-blue-400">🛒 Digital Products</span> - Sell courses, ebooks, templates</li>
              <li><span class="text-blue-400">👕 Merchandise</span> - Integrated merch store</li>
              <li><span class="text-blue-400">🎟️ Ticketed Events</span> - Virtual or in-person events</li>
              <li><span class="text-blue-400">🖼️ NFT Sales</span> - Digital collectibles</li>
              <li><span class="text-blue-400">🎁 Tipping/Donations</span> - One-time support options</li>
              <li><span class="text-blue-400">👥 Affiliate Programs</span> - Earn from recommendations</li>
            </ul>
            <p>Multiple revenue streams = sustainable creator business</p>
          </div>
        </div>
      `;
    });

    this.addCommand('examples', 'Show example creator sites', () => {
      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2">Example Creator Sites:</p>
          <div class="text-left mb-3">
            <p><span class="text-blue-400">Lemon Club Collective</span> - NFT community with exclusive content</p>
            <p><span class="text-blue-400">CyberFunk Music</span> - Musician platform with direct-to-fan sales</p>
            <p><span class="text-blue-400">Digital Nomad Academy</span> - Course platform with community</p>
            <p><span class="text-blue-400">ArtistX Gallery</span> - Digital art marketplace with NFTs</p>
          </div>
          <p>Each site is custom-built for the creator's specific needs and audience.</p>
        </div>
      `;
    });

    this.addCommand('matrix', 'Enter the Matrix', () => {
      let output = '<div class="text-green-400 matrix-rain" style="font-family: monospace; line-height: 1.2;">';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$&+,:;=?@#|\'<>.^*()%!-';

      for (let i = 0; i < 15; i++) {
        let line = '';
        for (let j = 0; j < 50; j++) {
          line += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        output += `<div>${line}</div>`;
      }

      output += '</div><p class="text-green-400 mt-2">Wake up, Neo...</p>';
      return output;
    });

    this.addCommand('cyberpunk', 'Show cyberpunk quote', () => {
      const quotes = [
        "The future is already here — it's just not very evenly distributed. - William Gibson",
        "The sky above the port was the color of television, tuned to a dead channel. - Neuromancer",
        "Information wants to be free. - Stewart Brand",
        "It's not the strongest that survive, but those most responsive to change. - Charles Darwin",
        "The street finds its own uses for things. - William Gibson",
        "Cyberspace. A consensual hallucination experienced daily by billions of legitimate operators. - William Gibson"
      ];

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      return `
        <div class="text-green-400">
          <p class="text-xl text-pink-500 mb-2">Cyberpunk Wisdom:</p>
          <p class="italic">"${randomQuote}"</p>
        </div>
      `;
    });

    this.addCommand('date', 'Display current date and time', () => {
      return `
        <div class="text-green-400">
          <p>Current system time: ${new Date().toLocaleString()}</p>
        </div>
      `;
    });

    this.addCommand('whoami', 'Display current user', () => {
      return `
        <div class="text-green-400">
          <p>User: <span class="text-pink-500">visitor</span></p>
          <p>Status: <span class="text-pink-500">exploring the digital frontier</span></p>
        </div>
      `;
    });

    this.addCommand('ls', 'List directory contents', () => {
      return `
        <div class="text-green-400">
          <div class="grid grid-cols-4 gap-2">
            <span class="text-blue-400">about.txt</span>
            <span class="text-blue-400">services.md</span>
            <span class="text-blue-400">portfolio/</span>
            <span class="text-blue-400">contact.json</span>
            <span class="text-blue-400">skills.yml</span>
            <span class="text-blue-400">projects.db</span>
            <span class="text-blue-400">creators/</span>
            <span class="text-blue-400">nft.sol</span>
          </div>
        </div>
      `;
    });

    this.addCommand('cat', 'Display file contents', (args) => {
      if (!args.length) {
        return '<div class="text-red-500">Usage: cat [filename]</div>';
      }

      const filename = args[0].toLowerCase();

      if (filename === 'about.txt') {
        return this.commands['about'].execute();
      } else if (filename === 'services.md') {
        return this.commands['services'].execute();
      } else if (filename === 'skills.yml') {
        return this.commands['skills'].execute();
      } else if (filename === 'contact.json') {
        return this.commands['contact'].execute();
      } else if (filename === 'nft.sol') {
        return this.commands['nft'].execute();
      } else {
        return `<div class="text-red-500">File not found: ${filename}</div>`;
      }
    });
  }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === 'success.html' || currentPage === 'cancel.html') return;

  window.starfieldBackground = new StarfieldBackground();
  window.glitchText = new GlitchText('.glitch-text');

  setTimeout(() => {
    window.terminalEffect = new TerminalEffect('terminal-container');
    window.scrollTo(0, 0);
  }, 100);

  initSwipeableCards();
  initCardCarousels();
});

// Scroll animations
const observeElements = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
};

document.addEventListener('DOMContentLoaded', observeElements);

// Helper functions for initialization
function initSwipeableCards() {
  document.querySelectorAll('.swipeable-container').forEach(container => {
    new SwipeableCards(container);
  });
}

function initCardCarousels() {
  document.querySelectorAll('.card-carousel-container').forEach(container => {
    new CardCarousel(container);
  });
}
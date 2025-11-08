// Card Carousel with Touch/Swipe Support
class CardCarousel {
  constructor(container) {
    this.container = container;
    this.carousel = container.querySelector('.card-carousel');
    this.cards = Array.from(container.querySelectorAll('.carousel-card'));
    this.cardCount = this.cards.length;
    this.currentIndex = 0;
    this.startX = 0;
    this.currentTranslateX = 0;
    this.prevTranslateX = 0;
    this.isDragging = false;
    this.isMobile = window.innerWidth < 768;
    this.animationID = null;
    this.touchStartTime = 0;
    this.touchEndTime = 0;
    this.touchThreshold = 100; // Minimum swipe distance in pixels
    
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
    nav.style.position = 'absolute';
    nav.style.bottom = '-70px';
    nav.style.left = '0';
    nav.style.right = '0';
    nav.style.display = 'flex';
    nav.style.justifyContent = 'center';
    nav.style.gap = '15px';
    nav.style.zIndex = '100';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-nav-btn prev-btn';
    prevBtn.innerHTML = '&#10094;';
    prevBtn.setAttribute('aria-label', 'Previous card');
    prevBtn.style.width = '40px';
    prevBtn.style.height = '40px';
    prevBtn.style.borderRadius = '50%';
    prevBtn.style.backgroundColor = 'rgba(30, 30, 40, 0.8)';
    prevBtn.style.border = '2px solid #5B21B6';
    prevBtn.style.color = '#EC4899';
    prevBtn.style.fontSize = '18px';
    prevBtn.style.cursor = 'pointer';
    prevBtn.style.display = 'flex';
    prevBtn.style.alignItems = 'center';
    prevBtn.style.justifyContent = 'center';
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-nav-btn next-btn';
    nextBtn.innerHTML = '&#10095;';
    nextBtn.setAttribute('aria-label', 'Next card');
    nextBtn.style.width = '40px';
    nextBtn.style.height = '40px';
    nextBtn.style.borderRadius = '50%';
    nextBtn.style.backgroundColor = 'rgba(30, 30, 40, 0.8)';
    nextBtn.style.border = '2px solid #5B21B6';
    nextBtn.style.color = '#EC4899';
    nextBtn.style.fontSize = '18px';
    nextBtn.style.cursor = 'pointer';
    nextBtn.style.display = 'flex';
    nextBtn.style.alignItems = 'center';
    nextBtn.style.justifyContent = 'center';
    
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    this.container.appendChild(nav);
  }
  
  addEventListeners() {
    this.prevBtn.addEventListener('click', () => this.prevCard());
    this.nextBtn.addEventListener('click', () => this.nextCard());
    
    // Add touch and mouse events for both mobile and desktop
    // Mouse events
    this.carousel.addEventListener('mousedown', this.onDragStart.bind(this));
    window.addEventListener('mousemove', this.onDragMove.bind(this));
    window.addEventListener('mouseup', this.onDragEnd.bind(this));
    window.addEventListener('mouseleave', this.onDragEnd.bind(this));
    
    // Touch events
    this.carousel.addEventListener('touchstart', this.onDragStart.bind(this), { passive: true });
    window.addEventListener('touchmove', this.onDragMove.bind(this), { passive: false });
    window.addEventListener('touchend', this.onDragEnd.bind(this));
    
    // Prevent context menu on long press
    this.carousel.addEventListener('contextmenu', e => e.preventDefault());
    
    // Add click handlers for cards
    this.cards.forEach((card, index) => {
      card.addEventListener('click', (e) => {
        // Only handle click if we're not dragging
        if (this.isDragging || (this.touchEndTime - this.touchStartTime > 300)) {
          e.preventDefault();
          return;
        }
        
        if (index !== this.currentIndex) {
          e.preventDefault();
          this.goToCard(index);
        }
      });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevCard();
      } else if (e.key === 'ArrowRight') {
        this.nextCard();
      }
    });
  }
  
  onDragStart(e) {
    if (e.target.closest('.carousel-nav-btn')) return;
    
    this.isDragging = true;
    this.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    this.touchStartTime = Date.now();
    
    // Get current transform value
    const transform = window.getComputedStyle(this.carousel).getPropertyValue('transform');
    if (transform !== 'none') {
      const matrix = new DOMMatrix(transform);
      this.prevTranslateX = matrix.m41;
    } else {
      this.prevTranslateX = 0;
    }
    
    this.currentTranslateX = this.prevTranslateX;
    
    // Start animation frame
    cancelAnimationFrame(this.animationID);
    this.animationID = requestAnimationFrame(this.animation.bind(this));
    
    this.carousel.style.cursor = 'grabbing';
    this.carousel.classList.add('grabbing');
  }
  
  animation() {
    if (this.isMobile) {
      this.setCarouselTransform();
    }
    if (this.isDragging) {
      requestAnimationFrame(this.animation.bind(this));
    }
  }
  
  setCarouselTransform() {
    if (this.isMobile) {
      // Only apply transform in mobile view
      this.carousel.style.transform = `translateX(${this.currentTranslateX}px)`;
    }
  }
  
  onDragMove(e) {
    if (!this.isDragging) return;
    
    // Prevent default only on mobile to allow scrolling on desktop
    if (this.isMobile && e.cancelable) {
      e.preventDefault();
    }
    
    const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    const diff = currentX - this.startX;
    
    if (this.isMobile) {
      // Calculate new position with constraints
      const maxTranslate = 0;
      const minTranslate = -(this.cardCount - 1) * this.getCardWidth();
      
      this.currentTranslateX = Math.max(Math.min(this.prevTranslateX + diff, maxTranslate), minTranslate);
    } else {
      // For desktop, just add visual indicator classes
      if (diff > 50) {
        this.carousel.classList.add('dragging-prev');
        this.carousel.classList.remove('dragging-next');
      } else if (diff < -50) {
        this.carousel.classList.add('dragging-next');
        this.carousel.classList.remove('dragging-prev');
      } else {
        this.carousel.classList.remove('dragging-prev', 'dragging-next');
      }
    }
  }
  
  getCardWidth() {
    if (this.cards.length === 0) return 0;
    const card = this.cards[0];
    const style = window.getComputedStyle(card);
    const width = parseFloat(style.width);
    const marginRight = parseFloat(style.marginRight);
    return width + marginRight;
  }
  
  onDragEnd(e) {
    if (!this.isDragging) return;
    
    this.touchEndTime = Date.now();
    cancelAnimationFrame(this.animationID);
    
    const currentX = e.type.includes('mouse') ? e.pageX : (e.changedTouches ? e.changedTouches[0].pageX : this.startX);
    const diff = currentX - this.startX;
    
    // Adjust threshold for mobile vs desktop
    const threshold = this.isMobile ? 50 : 100;
    const swipeTime = this.touchEndTime - this.touchStartTime;
    const quickSwipe = swipeTime < 300 && Math.abs(diff) > 30;
    
    if (this.isMobile) {
      // Calculate which card is closest to the center
      const cardWidth = this.getCardWidth();
      let newIndex = Math.round(Math.abs(this.currentTranslateX) / cardWidth);
      
      // Adjust for swipe direction
      if (quickSwipe || Math.abs(diff) > threshold) {
        newIndex = diff > 0 ? Math.max(0, this.currentIndex - 1) : Math.min(this.cardCount - 1, this.currentIndex + 1);
      }
      
      // Ensure index is within bounds
      newIndex = Math.max(0, Math.min(newIndex, this.cardCount - 1));
      this.goToCard(newIndex);
    } else {
      // Desktop behavior
      if (diff > threshold) {
        this.prevCard();
      } else if (diff < -threshold) {
        this.nextCard();
      }
    }
    
    this.isDragging = false;
    this.carousel.style.cursor = '';
    this.carousel.classList.remove('grabbing', 'dragging-prev', 'dragging-next');
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
    // Check if we're on mobile
    const isMobile = window.innerWidth < 768;
    this.isMobile = isMobile;
    
    // Reset all cards first
    this.cards.forEach(card => {
      card.classList.remove('active', 'next', 'prev', 'far-next', 'far-prev');
    });
    
    if (isMobile) {
      // Mobile view: make all cards visible and swipeable
      this.cards.forEach((card, index) => {
        // Reset all inline styles
        card.style.transform = '';
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.zIndex = '1';
        card.style.position = 'relative';
        card.style.left = '0';
        // Reduce width to prevent overlapping on mobile
        card.style.flex = '0 0 80%';
        card.style.marginRight = '10px';
        card.style.scrollSnapAlign = 'center';
        
        // Add active class to current card for styling
        if (index === this.currentIndex) {
          card.classList.add('active');
        }
      });
      
      // Set up carousel for touch swiping
      if (this.carousel) {
        this.carousel.style.display = 'flex';
        this.carousel.style.flexWrap = 'nowrap';
        // Make transition smoother
        this.carousel.style.transition = this.isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        // Calculate position based on current index
        const cardWidth = this.getCardWidth();
        const newTranslate = -this.currentIndex * cardWidth;
        this.currentTranslateX = newTranslate;
        this.carousel.style.transform = `translateX(${newTranslate}px)`;
      }
    } else {
      // Desktop view: restore original carousel functionality
      if (this.carousel) {
        // Reset carousel styles for desktop
        this.carousel.style.display = '';
        this.carousel.style.flexWrap = '';
        this.carousel.style.transform = '';
        // Make transition smoother
        this.carousel.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        // Reset card styles
        this.cards.forEach(card => {
          card.style.flex = '';
          card.style.marginRight = '';
          card.style.scrollSnapAlign = '';
        });
      }
      
      // Apply desktop card styling
      this.cards.forEach((card, index) => {
        const offset = index - this.currentIndex;
        
        // Reset visibility for all cards
        card.style.visibility = 'visible';
        
        // Apply appropriate classes and styles based on position
        if (offset === 0) {
          // Current card
          card.classList.add('active');
          card.style.transform = 'translateX(0) scale(1)';
          card.style.zIndex = '10';
          card.style.opacity = '1';
          card.style.position = 'relative';
          card.style.left = '0';
        } else if (offset === 1) {
          // Next card - reduce spacing
          card.classList.add('next');
          card.style.transform = 'translateX(75%) scale(0.85) rotate(5deg)';
          card.style.zIndex = '9';
          card.style.opacity = '0.9';
          card.style.position = 'absolute';
          card.style.left = '50%';
        } else if (offset === -1) {
          // Previous card - reduce spacing
          card.classList.add('prev');
          card.style.transform = 'translateX(-75%) scale(0.85) rotate(-5deg)';
          card.style.zIndex = '9';
          card.style.opacity = '0.9';
          card.style.position = 'absolute';
          card.style.left = '50%';
        } else if (offset === 2) {
          // Far next card - reduce spacing
          card.classList.add('far-next');
          card.style.transform = 'translateX(150%) scale(0.7) rotate(10deg)';
          card.style.zIndex = '8';
          card.style.opacity = '0.7';
          card.style.position = 'absolute';
          card.style.left = '50%';
        } else if (offset === -2) {
          // Far previous card - reduce spacing
          card.classList.add('far-prev');
          card.style.transform = 'translateX(-150%) scale(0.7) rotate(-10deg)';
          card.style.zIndex = '8';
          card.style.opacity = '0.7';
          card.style.position = 'absolute';
          card.style.left = '50%';
        } else {
          // Hide cards that are too far away
          card.style.transform = offset > 0 
            ? 'translateX(200%) scale(0.5)' 
            : 'translateX(-200%) scale(0.5)';
          card.style.zIndex = '0';
          card.style.opacity = '0';
          card.style.position = 'absolute';
          card.style.left = '50%';
        }
      });
    }
    
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

// Initialize all carousels on the page
function initCardCarousels() {
  const carouselContainers = document.querySelectorAll('.card-carousel-container');
  const carousels = [];
  
  carouselContainers.forEach(container => {
    carousels.push(new CardCarousel(container));
  });
  
  // Add resize handler to update all carousels when window is resized
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      carousels.forEach(carousel => carousel.updateCarousel());
    }, 250);
  });
}

// Initialize carousels when DOM is loaded
document.addEventListener('DOMContentLoaded', initCardCarousels);

// Add CSS for mobile swipe indicators
const style = document.createElement('style');
style.textContent = `
  .card-carousel-container {
    position: relative;
    margin-bottom: 80px;
    overflow: hidden;
    padding: 20px 0;
  }
  
  .card-carousel {
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .card-carousel.grabbing {
    cursor: grabbing !important;
    transition: none;
  }
  
  .carousel-card {
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease;
    touch-action: pan-y;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .carousel-card.active {
    box-shadow: 0 0 25px rgba(157, 23, 77, 0.7);
  }
  
  .carousel-card-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .carousel-nav-btn {
    transition: all 0.3s ease;
  }
  
  .carousel-nav-btn:hover:not(.disabled) {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(157, 23, 77, 0.5);
  }
  
  .carousel-nav-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .card-carousel {
      display: flex;
      flex-wrap: nowrap;
      width: 100%;
      padding: 10px 0;
    }
    
    .carousel-card {
      flex: 0 0 80%;
      margin-right: 10px;
      scroll-snap-align: center;
    }
  }
`;
document.head.appendChild(style);

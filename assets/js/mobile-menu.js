// Mobile Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const bars = document.querySelectorAll('.mobile-menu-toggle .bar');
  
  // Toggle mobile menu when hamburger icon is clicked
  mobileMenuToggle.addEventListener('click', function() {
    mobileMenu.classList.toggle('active');
    
    // Animate hamburger icon to X
    bars.forEach(bar => {
      bar.classList.toggle('active');
    });
    
    // Add animation to the toggle button
    if (mobileMenu.classList.contains('active')) {
      bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'rotate(-45deg) translate(7px, -8px)';
    } else {
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    }
  });
  
  // Close mobile menu when a link is clicked
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      
      // Reset hamburger icon
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    });
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    const isClickInsideMenu = mobileMenu.contains(event.target);
    const isClickOnToggle = mobileMenuToggle.contains(event.target);
    
    if (!isClickInsideMenu && !isClickOnToggle && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      
      // Reset hamburger icon
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 640 && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      
      // Reset hamburger icon
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    }
  });
});

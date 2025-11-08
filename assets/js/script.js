// Stripe Setup (use test key for local testing)
const stripe = Stripe('pk_test_51YOUR_TEST_KEY'); // Replace with your Stripe test publishable key

// Stripe Checkout
function redirectToCheckout(tier) {
  const priceIds = {
    bronze: 'price_1YOUR_BRONZE_PRICE_ID', // Replace with Stripe price IDs
    silver: 'price_1YOUR_SILVER_PRICE_ID',
    gold: 'price_1YOUR_GOLD_PRICE_ID'
  };
  if (priceIds[tier]) {
    stripe.redirectToCheckout({
      lineItems: [{ price: priceIds[tier], quantity: 1 }],
      mode: 'payment',
      successUrl: 'http://localhost:8080/success.html',
      cancelUrl: 'http://localhost:8080/cancel.html'
    }).then((result) => {
      if (result.error) {
        alert(result.error.message);
      }
    });
  }
}

// Contact Form (mocked for local testing)
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message')
  };
  // Mock API call (replace with API Gateway URL when deployed)
  console.log('Form Data:', data);
  alert('Form submitted! (Mocked locally - check console)');
  e.target.reset();
});

// Smooth Scrolling for Nav Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Prevent auto-scrolling to terminal on page load
window.addEventListener('load', () => {
  // Scroll to top of page on load
  window.scrollTo(0, 0);
});
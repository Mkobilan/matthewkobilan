document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const formStatus = document.getElementById('form-status');
  const formSuccess = document.getElementById('form-success');
  const formError = document.getElementById('form-error');
  const submitText = document.getElementById('submit-text');
  const submitLoading = document.getElementById('submit-loading');

  // API Gateway endpoint URL
  const apiEndpoint = 'https://in53oczfrd.execute-api.us-east-1.amazonaws.com/prod/submit';

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    submitText.classList.add('hidden');
    submitLoading.classList.remove('hidden');
    formStatus.classList.add('hidden');
    formSuccess.classList.add('hidden');
    formError.classList.add('hidden');
    
    // Get form data
    const formData = {
      name: contactForm.elements.name.value,
      email: contactForm.elements.email.value,
      message: contactForm.elements.message.value
    };
    
    try {
      // Send data to API Gateway endpoint
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Show success message
        formStatus.classList.remove('hidden');
        formSuccess.classList.remove('hidden');
        contactForm.reset();
      } else {
        // Show error message
        formStatus.classList.remove('hidden');
        formError.classList.remove('hidden');
        formError.textContent = data.message || 'There was an error sending your message. Please try again.';
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error message
      formStatus.classList.remove('hidden');
      formError.classList.remove('hidden');
    } finally {
      // Hide loading state
      submitText.classList.remove('hidden');
      submitLoading.classList.add('hidden');
    }
  });
});
// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Show loading state
    formStatus.className = 'form-status loading';
    formStatus.textContent = 'Sending your message...';

    const submitBtn = contactForm.querySelector('.submit-btn');
    submitBtn.disabled = true;

    // Gather form data
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      mobile: document.getElementById('mobile').value.trim(),
      purpose: document.getElementById('purpose').value,
      message: document.getElementById('message').value.trim()
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        formStatus.className = 'form-status success';
        formStatus.textContent = 'Thank you! Your message has been sent successfully. I will get back to you soon.';
        contactForm.reset();
      } else {
        formStatus.className = 'form-status error';
        formStatus.textContent = result.error || 'Something went wrong. Please try again.';
      }
    } catch (error) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Network error. Please check your connection and try again.';
    } finally {
      submitBtn.disabled = false;
    }
  });
});

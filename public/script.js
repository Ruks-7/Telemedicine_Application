function formValidation() {
  let valid = true;
  clearErrors(); // Clear previous errors

  // Get all form inputs
  const firstName = document.getElementById('fname').value;
  const lastName = document.getElementById('lname').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;
  const confirmPassword = document.getElementById('confirm').value;
  const date = document.getElementById('date_of_birth').value;
  const terms = document.getElementById("terms").checked;
  const gender = document.querySelector('select[name="gender"]').value;

  // Validation rules
  if (!firstName) {
      showError('fnameError', 'First name is required');
      valid = false;
  }

  if (!lastName) {
      showError('lnameError', 'Last name is required');
      valid = false;
  }

  if (!email) {
      showError('emailError', 'Email is required');
      valid = false;
  } else if (!isValidEmail(email)) {
      showError('emailError', 'Please enter a valid email address');
      valid = false;
  }

  if (!date) {
      showError('dateError', 'Date of birth is required');
      valid = false;
  }

  if (!gender) {
      showError('genderError', 'Please select your gender');
      valid = false;
  }

  if (password.length < 8) {
      showError('passwordError', 'Password must be at least 8 characters');
      valid = false;
  }

  if (password !== confirmPassword) {
      showError('confirmError', 'Passwords do not match');
      valid = false;
  }

  if (!terms) {
      showError('termsError', 'You must agree to the terms and conditions');
      valid = false;
  }

  if (valid) {
      const formData = {
          fname: firstName,
          lname: lastName,
          email: email,
          gender: gender,
          date: date,
          password: password
      };

      // Submit form data
      submitForm(formData);
  }

  return valid;
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
      errorElement.innerHTML = `*${message}`;
      errorElement.style.color = 'red';
      errorElement.style.fontWeight = 'bold';
}
}

function clearErrors() {
  const errorElements = document.querySelectorAll('[id$="Error"]');
  errorElements.forEach(element => element.innerHTML = '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function submitForm(formData) {
  try {
      const response = await fetch('/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
      });

      if (response.ok) {
          // Show success message
          showSuccessMessage();
          // Redirect after delay
          setTimeout(() => {
              window.location.href = '/patient/dashboard';
          }, 2000);
      } else {
          const data = await response.json();
          showError('submitError', data.message || 'Registration failed');
      }
  } catch (error) {
      console.error('Registration error:', error);
      showError('submitError', 'An error occurred. Please try again');
  }
}

function showSuccessMessage() {
  const alert = document.createElement('div');
  alert.className = 'alert alert-success';
  alert.textContent = 'Registration successful! Redirecting...';
  document.querySelector('form').prepend(alert);
}
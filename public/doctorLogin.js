//Login a user
document.getElementById('loginForm').addEventListener('submit',async function (e) {
    e.preventDefault();
    let valid = true;
    clearErrors(); // Clear previous errors

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email) {
        showError('emailError', 'Email is required');
        valid = false;
    }
    else if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        valid = false;
    }

    if (!password) {
        showError('passwordError', 'Password is required');
        valid = false;
    }

    if (valid) {
        const formData = {
            email: email,
            password: password
        };
        await loginForm(formData);
    }
    return valid;
});
    

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.innerHTML = `*${message}`;
        errorElement.style.color = 'red';
        errorElement.style.fontWeight = 'bold';
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll("span");
    errorElements.forEach(element => element.innerHTML = '');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Login form data
async function loginForm(formData) {
    try {
        const response = await fetch('/auth/provider-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            
            // Show success message
            showSuccessMessage(data.message);

            setTimeout(() => {  
                window.location.href = data.redirect;
            }, 2000);
        }
        else {
            showErrorMessage(data.message);
        }
    } 
    catch (error) {
        console.error('Login error:', error);
        showErrorMessage('An error occurred. Please try again later');
    }
}

// Show success message
function showSuccessMessage(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerHTML = `${message}`;
    document.getElementsByClassName('container')[0].appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Show error message
function showErrorMessage(message) {
    const alert = document.createElement('div');    
    alert.className = 'alert alert-danger';
    alert.innerHTML = `${message}`;
    document.getElementsByClassName('container')[0].appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}


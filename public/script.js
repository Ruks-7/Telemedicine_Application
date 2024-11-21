function formValidation(){
  let valid=true;

  //Select the inputs
  let firstName=document.getElementById('fname').value;
  let lastName=document.getElementById('lname').value;
  let password=document.getElementById('password').value;
  let email=document.getElementById('email').value;
  let gender = document.querySelector('gender').value;
  let confirmPassword=document.getElementById('confirm').value;
  let date=document.getElementById('date_of_birth').value; //Date of birth
  let terms=document.getElementById("terms").checked;

  //Validate the information
  if(password.length < 8){
    let passwordError=document.getElementById('passwordError');
    passwordError.innerHTML="Password less than 8 characters!";
    valid=false;
  }

  
  if(password!==confirmPassword){
    let error=document.getElementById('confirmPassword');
    error.innerHTML="Incorrect Password!";
    valid=false;
  }

  if(!terms){
    let termsError=document.getElementById("termsError");
    termsError.innerHTML="You must agree to the terms and conditions!";
    valid=false;
  }

  if (valid) {
    
  // Object to store the form inputs
  const formData = {
        fname: firstName,
        lname: lastName,
        date: date,
        email: email,
        gender: gender,
        password: password
  };

try {
      const response = fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // Show success message
            showConfirmation();
            
            // Redirect to dashboard after delay
            setTimeout(() =>{
              
          }, 2000);
      } else {
          // Show error message
          document.body.innerHTML += `
              <div class="alert alert-danger">
                  ${data.message}
              </div>
          `;
          setTimeout(() => {
              document.querySelector('.alert').remove();
          }, 3000);
      }
  } 
  catch (error) {
      console.error('Registration error:', error);
      document.body.innerHTML += `
          <div class="alert alert-danger">
              Registration failed. Please try again.
          </div>
      `;
    }
  }
    
  //Confirm form submission
    function showConfirmation(){
      document.body.innerHTML += `
      <div class="confirmation">
        Form submitted successfully!
      </div>
    `;
    }
    showConfirmation();

  // Automatically close the confirmation div after 4 seconds
      setTimeout(function() {
        document.querySelector('.confirmation').remove();
      }, 3000);

  return valid;
};
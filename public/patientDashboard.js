//Create a script file for the patient dashboard view
const form = document.getElementById('appointmentForm' );

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    let valid = true;

    const provider =document.querySelector('select[name="doctor"]').value;
    const date = document.getElementById('date').value;
    const time = document.querySelector('select[name="time"]').value;
    const consultation_type = document.querySelector('select[name="consultation_type"]').value;
    const symptoms = document.getElementById('symptoms').value;


    //Ensure all fields are filled
    if (!provider || !date || !time || !consultation_type || !symptoms) {
        showErrorMessage('Please fill in all fields');
        valid = false;
    }

    if(valid){
        const appointmentData = {
            provider,
            date,
            time,
            consultation_type,
            symptoms
        };
    console.log(appointmentData);

    await submitData(appointmentData);
}
return valid;
});

async function submitData(appointmentData) {
    try {
        const response = await fetch('/auth/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
        });

        console.log(response.body);

        const data = await response.json();

        if(response.ok){
            showSuccessMessage(data.message);
            window.location.reload();
        }   
        else {
            showErrorMessage(data.message);
        }
    }
    catch (error) {
    showErrorMessage('Appointment booking failed... !');
    }
}

// Show success message
function showSuccessMessage(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerHTML = `${message}`;
    document.getElementById('appointmentForm').appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Show error message
function showErrorMessage(message) {
    const alert = document.createElement('div');    
    alert.className = 'alert alert-danger';
    alert.innerHTML = `${message}`;
    document.getElementById('appointmentForm').appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}
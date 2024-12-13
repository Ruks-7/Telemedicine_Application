//Update appointment status
async function confirmStatus(appointmentId){
    const info={
        appointmentId: appointmentId,
        status: 'Confirmed'
    };
        try{
        const response = await fetch('/auth/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(info)
        });

        const data = await response.json();
        if(response.ok){
            showSuccessMessage(data.message);
        }
        else{
            showErrorMessage(data.message);
        }
    } catch (error){
        showErrorMessage('Something went wrong. Please try again later.');
    }
}

async function cancelStatus(appointmentId){
    const info={
        appointmentId: appointmentId,
        status: 'Cancelled'
    };
    
        try{
            const response = await fetch(`/auth/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(info)
            });

            const data = await response.json();
            if(response.ok){
                showSuccessMessage(data.message);
            }
            else{
                showErrorMessage(data.message);
            }
        } catch (error){
            console.error('Error cancelling appointment:', error);
            showErrorMessage('Something went wrong. Please try again later.');
        }
    };
        
        
// Show success message
function showSuccessMessage(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerHTML = `${message}`;
    alert.style.marginTop = '10px';
    document.body.appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Show error message
function showErrorMessage(message) {
    const alert = document.createElement('div');    
    alert.className = 'alert alert-danger';
    alert.innerHTML = `${message}`;
    document.body.appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

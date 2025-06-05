document.addEventListener('DOMContentLoaded', () => {
    // Select the contact form and the message display area in the HTML
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    // Add an event listener for when the form is submitted
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission (page reload)

        // Show a "sending" message to the user
        formMessage.textContent = 'Sending your message...';
        formMessage.className = 'form-message'; // Reset message styling (remove previous success/error classes)

        // Get the values from the form input fields
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Try to send the data to our backend (the "kitchen")
        try {
            // Use the `fetch` API to make an HTTP POST request
            // `/api/contact` is the address of our "contact" endpoint in the backend
            const response = await fetch('/api/contact', {
                method: 'POST', // This is a POST request (sending data)
                headers: {
                    // We're telling the server that we're sending JSON data
                    'Content-Type': 'application/json',
                },
                // Convert the form data to JSON format and add it to the request body
                body: JSON.stringify({ name, email, message }),
            });

            // Read the response from the backend (like getting feedback from the kitchen)
            const data = await response.json();

            // Check if the response was successful (HTTP status code 2xx)
            if (response.ok) {
                formMessage.textContent = data.message || 'Message sent successfully!';
                formMessage.classList.add('success'); // Apply success styling (green background)
                contactForm.reset(); // Clear the form fields
                // Hide the message automatically after 5 seconds
                setTimeout(() => {
                    formMessage.classList.remove('success');
                    formMessage.textContent = '';
                }, 5000);
            } else { // If the backend returned an error response
                formMessage.textContent = data.message || 'An error occurred while sending your message.';
                formMessage.classList.add('error'); // Apply error styling (red background)
                // Hide the message automatically after 5 seconds
                setTimeout(() => {
                    formMessage.classList.remove('error');
                    formMessage.textContent = '';
                }, 5000);
            }
        } catch (error) { // If a network error occurs (e.g., server unreachable)
            console.error('Message sending error:', error);
            formMessage.textContent = 'A network error occurred. Please try again.';
            formMessage.classList.add('error');
            // Hide the message automatically after 5 seconds
            setTimeout(() => {
                formMessage.classList.remove('error');
                formMessage.textContent = '';
            }, 5000);
        }
    });
});
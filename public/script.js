document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const mobileMenu = document.getElementById('mobile-menu');
    const mainNav = document.getElementById('mainNav');

    // --- Contact Form Logic (Existing) ---
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        formMessage.textContent = 'Sending your message...';
        formMessage.className = 'form-message'; 

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await response.json();

            if (response.ok) {
                formMessage.textContent = data.message || 'Message sent successfully!';
                formMessage.classList.add('success');
                contactForm.reset();
                setTimeout(() => { formMessage.classList.remove('success'); formMessage.textContent = ''; }, 5000);
            } else {
                formMessage.textContent = data.message || 'An error occurred while sending your message.';
                formMessage.classList.add('error');
                setTimeout(() => { formMessage.classList.remove('error'); formMessage.textContent = ''; }, 5000);
            }
        } catch (error) {
            console.error('Message sending error:', error);
            formMessage.textContent = 'A network error occurred. Please try again.';
            formMessage.classList.add('error');
            setTimeout(() => { formMessage.classList.remove('error'); formMessage.textContent = ''; }, 5000);
        }
    });

    // --- Navbar Active Link & Scroll Logic ---
    function setActiveLink() {
        let currentSection = 'home';
        sections.forEach(section => {
            // Check if section is in viewport
            const sectionTop = section.offsetTop - mainNav.offsetHeight; // Adjust for fixed navbar height
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Call on scroll and on load
    window.addEventListener('scroll', setActiveLink);
    setActiveLink(); // Set active link on initial load

    // Smooth scroll for nav links (optional, as CSS scroll-behavior: smooth handles it too)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) { // Only for anchor links
                e.preventDefault(); // Prevent default jump
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - mainNav.offsetHeight, // Scroll to top of section minus navbar height
                        behavior: 'smooth'
                    });
                    // Close mobile menu after clicking a link
                    if (mainNav.classList.contains('active')) {
                        mainNav.classList.remove('active');
                        mobileMenu.classList.remove('is-active');
                    }
                }
            }
        });
    });

    // --- Mobile Menu Toggle Logic ---
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('is-active');
        mainNav.classList.toggle('active');
    });
});
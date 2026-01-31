document.addEventListener('DOMContentLoaded', () => {
            const hamburgerButton = document.querySelector('.hamburger');
            const navUl = document.querySelector('nav ul');
            const navLinks = document.querySelectorAll('nav a');
            const sections = document.querySelectorAll('section');

            // Toggle mobile menu
            hamburgerButton.addEventListener('click', () => {
                navUl.classList.toggle('active');
            });

            // Close menu when a link is clicked
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navUl.classList.remove('active');
                });
            });

            // Fetch events data
            const fetchEvents = async () => {
                const eventsContainer = document.getElementById('events-data');
                const placeholderCards = eventsContainer.querySelectorAll('.card');

                try {
                    // Using a public API for demonstration. Replace with a relevant API if available.
                    // This API provides placeholder data.
                    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();

                    // Clear placeholder cards only if fetch is successful and data is available
                    if (data && data.length > 0) {
                        eventsContainer.innerHTML = ''; // Clear placeholders
                        data.forEach(event => {
                            const card = document.createElement('div');
                            card.className = 'card fade-in-on-scroll';
                            card.innerHTML = `
                                <div class="image-placeholder">ADD IMAGE</div>
                                <h3>${event.title.substring(0, 30)}...</h3>
                                <p>Date: ${new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                                <p>${event.body.substring(0, 100)}...</p>
                            `;
                            eventsContainer.appendChild(card);
                        });
                    } else {
                        // If fetch succeeds but returns no data, keep placeholders
                        console.warn("API returned no events data, keeping placeholders.");
                    }
                } catch (error) {
                    console.error("Failed to fetch events:", error);
                    // If fetch fails, the placeholder cards remain visible as per the requirement.
                    // No error message is displayed to the user.
                }
            };

            fetchEvents();

            // Intersection Observer for fade-in animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target); // Stop observing once visible
                    }
                });
            }, {
                threshold: 0.1 // Trigger when 10% of the element is visible
            });

            document.querySelectorAll('.fade-in-on-scroll').forEach(element => {
                observer.observe(element);
            });

            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault(); // Prevent default anchor click behavior

                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });
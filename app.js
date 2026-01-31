document.addEventListener('DOMContentLoaded', () => {
            const navLinks = document.querySelector('.nav-links');
            const hamburger = document.querySelector('.hamburger-menu');
            const navButtons = document.querySelectorAll('.nav-links button, .logo button, .hero-button');
            const sections = document.querySelectorAll('main section');
            const revealElements = document.querySelectorAll('.section-title, .card, .about-text, .image-placeholder, .contact-info, .contact-form');

            // --- Hamburger Menu Toggle ---
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });

            navLinks.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => {
                    if (navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                    }
                });
            });

            // --- Smooth Scrolling for Navigation ---
            navButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    const targetId = button.dataset.section;
                    const targetSection = document.getElementById(targetId);

                    if (targetSection) {
                        // Offset by header height
                        const headerOffset = document.querySelector('header').offsetHeight;
                        const elementPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = elementPosition - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }
                });
            });

            // --- Active Navigation Highlight on Scroll ---
            const options = {
                root: null, // viewport
                rootMargin: `-${document.querySelector('header').offsetHeight}px 0px -50% 0px`, // Adjust based on header height, target middle of section
                threshold: 0 // As soon as the section enters, start highlighting
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const sectionId = entry.target.id;
                    const navButton = document.querySelector(`.nav-links button[data-section="${sectionId}"]`);

                    if (navButton) {
                        if (entry.isIntersecting && entry.intersectionRatio > 0) {
                            // Remove active from all
                            document.querySelectorAll('.nav-links button').forEach(btn => btn.classList.remove('active'));
                            // Add active to current
                            navButton.classList.add('active');
                        }
                    }
                });
            }, options);

            sections.forEach(section => {
                observer.observe(section);
            });

            // --- Reveal on Scroll Effect ---
            const revealOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); // Stop observing once visible
                    }
                });
            }, revealOptions);

            revealElements.forEach((el, index) => {
                // Stagger card animation
                if (el.classList.contains('card')) {
                    el.style.setProperty('--delay', `${index * 0.1}s`);
                }
                revealObserver.observe(el);
            });


            // --- Contact Form Submission (Placeholder) ---
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.addEventListener('submit', (event) => {
                    event.preventDefault(); // Prevent default form submission

                    // In a real application, you would send this data to a backend
                    console.log('Form Submitted!');
                    const formData = new FormData(contactForm);
                    for (let [key, value] of formData.entries()) {
                        console.log(`${key}: ${value}`);
                    }

                    alert('Thank you for your message! We will get back to you soon.');
                    contactForm.reset(); // Clear the form
                });
            }

            // --- API Data Fetching with Fallback (Events, Faculty, Fees) ---
            const API_BASE_URL = 'https://jsonplaceholder.typicode.com'; // Example public API
            const TIMEOUT_DURATION = 5000; // 5 seconds timeout

            function createCardHtml(item, type) {
                let title, description, meta;
                if (type === 'events') {
                    title = item.title.length > 50 ? item.title.substring(0, 47) + '...' : item.title;
                    description = item.body.length > 150 ? item.body.substring(0, 147) + '...' : item.body;
                    meta = `Event ID: ${item.id} | Posted: ${new Date().toLocaleDateString()}`;
                } else if (type === 'faculty') {
                    title = item.name;
                    description = `A dedicated member of our faculty, specializing in ${item.company.catchPhrase}. Their expertise covers various aspects of ${item.company.bs}.`;
                    meta = `Email: ${item.email} | Phone: ${item.phone}`;
                } else if (type === 'fees') {
                    title = `Fee Update: ${item.title.length > 30 ? item.title.substring(0, 27) + '...' : item.title}`;
                    description = item.body.length > 150 ? item.body.substring(0, 147) + '...' : item.body;
                    meta = `Update ID: ${item.id} | Last updated: ${new Date().toLocaleDateString()}`;
                } else {
                    title = item.title || 'Untitled';
                    description = item.body || 'No description available.';
                    meta = 'No metadata.';
                }

                return `
                    <div class="card" style="--delay: 0s;">
                        <h3>${title}</h3>
                        <p>${description}</p>
                        <p class="card-meta">${meta}</p>
                    </div>
                `;
            }

            async function fetchAndRenderCards(containerId, apiEndpoint, type, limit = 4) {
                const container = document.getElementById(containerId);
                // The initial HTML already contains placeholders, so we will REPLACE if successful.
                // If fetch fails, the initial placeholders remain.

                let fetchedData = [];
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);
                    const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    fetchedData = data.slice(0, limit); // Take first 'limit' items
                    console.log(`Fetched ${type} data:`, fetchedData);

                    // Clear existing (placeholder) cards and render new ones
                    container.innerHTML = ''; // Clear only if data is successfully fetched
                    fetchedData.forEach((item, index) => {
                        const cardHtml = createCardHtml(item, type);
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = cardHtml;
                        const cardElement = tempDiv.firstElementChild;
                        cardElement.style.setProperty('--delay', `${index * 0.1}s`); // Apply staggered delay
                        container.appendChild(cardElement);
                        revealObserver.observe(cardElement); // Re-observe new cards for reveal effect
                    });

                } catch (error) {
                    console.error(`Failed to fetch ${type} data:`, error);
                    // Do nothing here, the initial placeholders are already in the DOM and visible.
                    // The UI must never show error messages.
                }
            }

            // Call fetch functions for each section
            fetchAndRenderCards('events-container', '/posts', 'events', 4); // Using posts for events
            fetchAndRenderCards('faculty-container', '/users', 'faculty', 4); // Using users for faculty
            fetchAndRenderCards('fees-container', '/posts', 'fees', 4); // Using posts for fees (simulating updates)
        });
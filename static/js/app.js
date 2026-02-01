document.addEventListener('DOMContentLoaded', () => {
            const header = document.querySelector('.header');
            const navLinks = document.querySelectorAll('.nav-list a');
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-list a');
            const sections = document.querySelectorAll('section[id]');
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            const mobileNav = document.querySelector('.mobile-nav');
            const revealElements = document.querySelectorAll('.reveal');
            const eventsContainer = document.getElementById('events-container');
            const facultyContainer = document.getElementById('faculty-container');

            // --- Header Scroll Effect ---
            // Adds 'scrolled' class to header when page is scrolled down
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });

            // --- Hamburger Menu Toggle ---
            // Toggles mobile navigation menu visibility
            hamburgerMenu.addEventListener('click', () => {
                hamburgerMenu.classList.toggle('active');
                mobileNav.classList.toggle('open');
                // Prevent scrolling when mobile menu is open
                document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
            });

            // --- Smooth Scrolling for Navigation Links ---
            // Handles smooth scrolling to section IDs without modifying URL
            const smoothScroll = (e) => {
                e.preventDefault(); // Prevent default anchor link behavior (URL modification)
                const targetId = e.target.getAttribute('href'); // Get the href (e.g., "#about")
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open after clicking a link
                    if (mobileNav.classList.contains('open')) {
                        hamburgerMenu.classList.remove('active');
                        mobileNav.classList.remove('open');
                        document.body.style.overflow = '';
                    }
                }
            };

            // Attach smoothScroll handler to all desktop nav links
            navLinks.forEach(link => {
                link.addEventListener('click', smoothScroll);
            });

            // Attach smoothScroll handler to all mobile nav links
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', smoothScroll);
            });

            // --- CTA Button Scroll ---
            // Handles smooth scrolling for the "Explore Our Campus" button
            const ctaButton = document.querySelector('.cta-button.scroll-to-link');
            if (ctaButton) {
                ctaButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = ctaButton.getAttribute('data-target'); // Uses data-target attribute
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }


            // --- Active Nav Link Highlight on Scroll (Intersection Observer) ---
            // Highlights the current active navigation link based on section visibility
            const observerOptions = {
                root: null, // Use the viewport as the root
                rootMargin: '0px',
                threshold: 0.7 // Section is considered active when 70% of it is visible
            };

            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Remove 'active' from previously active link
                        const currentActive = document.querySelector('.nav-list a.active');
                        if (currentActive) {
                            currentActive.classList.remove('active');
                        }
                        // Add 'active' to the link corresponding to the intersecting section
                        const correspondingLink = document.querySelector(`.nav-list a[href="#${entry.target.id}"]`);
                        if (correspondingLink) {
                            correspondingLink.classList.add('active');
                        }
                    }
                });
            }, observerOptions);

            // Observe each section
            sections.forEach(section => {
                sectionObserver.observe(section);
            });


            // --- Reveal-on-Scroll Effect (Intersection Observer) ---
            // Adds 'active' class to elements when they enter the viewport
            const revealObserverOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.15 // Element reveals when 15% of it is visible
            };

            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target); // Stop observing once revealed to optimize performance
                    }
                });
            }, revealObserverOptions);

            // Observe all elements with the 'reveal' class
            revealElements.forEach(el => {
                revealObserver.observe(el);
            });


            // --- Fetch API Data & Render Cards (with fallback) ---

            // Helper function to create a card DOM element
            const createCard = (type, data) => {
                const card = document.createElement('div');
                card.classList.add('card', 'glassmorphism', 'reveal'); // Apply styling and reveal animation class
                if (type === 'event') {
                    card.innerHTML = `
                        <h3>${data.title}</h3>
                        <p>${data.description}</p>
                        <small>Date: ${data.date} | Time: ${data.time || ''} | Location: ${data.location || ''}</small>
                    `;
                } else if (type === 'faculty') {
                    card.innerHTML = `
                        <h3>${data.name}</h3>
                        <p>${data.role}</p>
                        <small>${data.email}</small>
                    `;
                }
                return card;
            };

            // Fetch Events Data
            const fetchEvents = async () => {
                try {
                    // Using JSONPlaceholder /posts as a mock API for events
                    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=4');
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();

                    eventsContainer.innerHTML = ''; // Clear the static placeholder cards
                    data.forEach((post, index) => {
                        const eventData = {
                            // Format API data to fit event structure
                            title: post.title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                            description: post.body.substring(0, 100) + '...',
                            date: `Oct ${26 + index}, 2024`, // Generate realistic dates
                            time: `${18 + index}:00 PM`,
                            location: ['College Auditorium', 'Sports Ground', 'Seminar Hall', 'Library Conference Room'][index % 4]
                        };
                        eventsContainer.appendChild(createCard('event', eventData));
                    });
                     // Re-observe newly added elements for reveal animation
                     document.querySelectorAll('#events-container .reveal').forEach(el => {
                        revealObserver.observe(el);
                    });
                } catch (error) {
                    console.error('Failed to fetch events, showing static content:', error);
                    // Crucial: If fetch fails, the initially rendered static placeholder cards remain visible.
                    // No error message is displayed to the user.
                }
            };

            // Fetch Faculty Data
            const fetchFaculty = async () => {
                try {
                    // Using JSONPlaceholder /users as a mock API for faculty
                    const response = await fetch('https://jsonplaceholder.typicode.com/users?_limit=4');
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();

                    facultyContainer.innerHTML = ''; // Clear the static placeholder cards
                    data.forEach((user, index) => {
                        const facultyData = {
                            // Format API data to fit faculty structure
                            name: user.name,
                            role: (index % 2 === 0 ? 'Professor' : 'Assistant Professor') + ', ' + user.company.name.split(' ')[0], // Generate realistic roles
                            email: user.email
                        };
                        facultyContainer.appendChild(createCard('faculty', facultyData));
                    });
                    // Re-observe newly added elements for reveal animation
                    document.querySelectorAll('#faculty-container .reveal').forEach(el => {
                        revealObserver.observe(el);
                    });
                } catch (error) {
                    console.error('Failed to fetch faculty, showing static content:', error);
                    // Crucial: If fetch fails, the initially rendered static placeholder cards remain visible.
                    // No error message is displayed to the user.
                }
            };

            // Initial API fetch calls when DOM is ready
            fetchEvents();
            fetchFaculty();

             // Set initial active link for the 'home' section on page load if it's in view
             const homeSection = document.getElementById('home');
             if (homeSection) {
                 const homeLink = document.querySelector('.nav-list a[href="#home"]');
                 if (homeLink) {
                     // Check if the home section is sufficiently visible on load
                     const rect = homeSection.getBoundingClientRect();
                     if (rect.top <= window.innerHeight * observerOptions.threshold && rect.bottom >= window.innerHeight * observerOptions.threshold) {
                         homeLink.classList.add('active');
                     }
                 }
            }
        });
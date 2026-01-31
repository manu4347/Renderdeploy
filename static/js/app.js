document.addEventListener('DOMContentLoaded', () => {
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            const navMenu = document.getElementById('nav-menu');

            hamburgerMenu.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            // Close menu when a link is clicked
            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });

            // Intersection Observer for scroll animations
            const scrollRevealElements = document.querySelectorAll('.scroll-reveal');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });

            scrollRevealElements.forEach(el => {
                observer.observe(el);
            });

            // Fetch Data from API
            const fetchData = async () => {
                const apiContainer = document.getElementById('api-data-container');

                // Sample data to ensure content is always present
                const staticPlaceholderData = [
                    { title: "Annual Convocation Scheduled", content: "The annual convocation ceremony will be held on December 15th. Details to follow.", footer: "Updated: Nov 10, 2023" },
                    { title: "New Library Resources Available", content: "Exciting new books and digital resources have been added to the college library. Visit today!", footer: "Updated: Nov 8, 2023" },
                    { title: "Inter-College Sports Meet", content: "Andaman College is proud to host the upcoming inter-college sports meet. Cheer for our athletes!", footer: "Updated: Nov 5, 2023" },
                    { title: "Guest Lecture on AI", content: "Renowned AI expert Dr. Anya Sharma will deliver a guest lecture on November 20th.", footer: "Updated: Nov 1, 2023" }
                ];

                // Render static placeholders first
                apiContainer.innerHTML = ''; // Clear any previous placeholders if re-fetch were implemented differently
                staticPlaceholderData.forEach((data, index) => {
                    const card = document.createElement('div');
                    card.className = 'feature-card scroll-reveal';
                    if (index > 0) card.style.animationDelay = `${index * 0.1}s`;
                    card.innerHTML = `
                        <div class="card-header">${data.title}</div>
                        <div class="card-content">${data.content}</div>
                        <div class="card-footer">${data.footer}</div>
                    `;
                    apiContainer.appendChild(card);
                });


                try {
                    // Using a placeholder API for demonstration. Replace with actual API endpoint.
                    // Example: JSONPlaceholder for posts
                    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=4');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();

                    // If fetch is successful, replace placeholders with actual data
                    apiContainer.innerHTML = ''; // Clear placeholders
                    data.forEach((item, index) => {
                        const card = document.createElement('div');
                        card.className = 'feature-card scroll-reveal';
                        if (index > 0) card.style.animationDelay = `${index * 0.1}s`;
                        card.innerHTML = `
                            <div class="card-header">${item.title.charAt(0).toUpperCase() + item.title.slice(1)}</div>
                            <div class="card-content">${item.body.substring(0, 150)}...</div>
                            <div class="card-footer">Published: ${new Date(Date.now() - Math.random() * 100000000).toLocaleDateString()}</div>
                        `;
                        apiContainer.appendChild(card);
                    });

                } catch (error) {
                    console.error("Failed to fetch data:", error);
                    // If fetch fails, the static placeholder cards remain visible,
                    // fulfilling the requirement to never show error messages.
                }
            };

            fetchData();
        });
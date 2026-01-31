// --- 1. Navigation Handling (SPA compliance) ---

        const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
        const hamburger = document.getElementById('hamburger-menu');
        const mobileMenu = document.getElementById('mobile-menu');

        // Function to handle internal navigation via scrollIntoView
        const handleNavigation = (event) => {
            // Check if the target is an anchor link meant for internal scrolling
            if (event.target.tagName === 'A' && event.target.getAttribute('href').startsWith('#')) {
                event.preventDefault();
                
                const targetId = event.target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Scroll smoothly to the target section
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    
                    // Close mobile menu if open
                    if (mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                    }
                    
                    // Update active link highlight after scroll completes (or immediately for visual feedback)
                    updateActiveLink(targetId);
                }
            }
        };
        
        // Attach listeners to all navigation elements
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavigation);
        });


        // Hamburger Toggle
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });


        // Active Link Highlighting (Intersection Observer based or Scroll Listener)
        const sections = document.querySelectorAll('section');
        const navA = document.querySelectorAll('.nav-links a');

        const updateActiveLink = (currentId) => {
            navA.forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href').substring(1) === currentId) {
                    a.classList.add('active');
                }
            });
        };
        
        // Intersection Observer for robust scroll tracking
        const observerOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 0.3 // Trigger when 30% of the section is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Set the active link to the intersecting section
                    const id = entry.target.id;
                    updateActiveLink(id);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });

        // Initialize active link based on initial view (Home)
        updateActiveLink('home');


        // --- 2. Reveal-on-Scroll Effect ---

        const revealElements = document.querySelectorAll('.reveal');

        const revealObserverOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 0.1 
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Stop observing once revealed
                }
            });
        }, revealObserverOptions);

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });


        // --- 3. Scroll to Top Button Logic ---

        const scrollToTopBtn = document.getElementById('scrollToTopBtn');

        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            document.body.scrollIntoView({ behavior: 'smooth' });
        });


        // --- 4. Fetch Data & Fallback (Critical Requirement) ---
        
        const updatesContainer = document.getElementById('updates-container');

        async function fetchVignanData() {
            // Use a non-existent/slow endpoint path to reliably trigger fallback for demonstration
            const API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=4'; 
            
            try {
                const response = await fetch(API_URL, { signal: AbortSignal.timeout(3000) }); // 3 second timeout
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data && data.length > 0) {
                    renderDynamicCards(data);
                } else {
                    // If fetch succeeds but returns empty array, static cards remain visible.
                }
                
            } catch (error) {
                // If fetch fails (network error, timeout, etc.), do nothing.
                // The beautiful static placeholder cards rendered during initial load remain visible.
                console.warn("Failed to fetch Vignan data. Displaying static content.");
            }
        }

        function renderDynamicCards(items) {
            // Clear static content placeholders before rendering dynamic content
            updatesContainer.innerHTML = '';
            
            items.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'data-card reveal';
                
                // Apply delay for staggered animation effect
                card.style.transitionDelay = `${index * 0.1}s`;

                // Map placeholder data to relevant Vignan context
                const title = item.title.length > 30 ? item.title.substring(0, 30) + '...' : item.title;
                const content = item.body.length > 100 ? item.body.substring(0, 100) + '...' : item.body;
                
                card.innerHTML = `
                    <h4>${title}</h4>
                    <span>Type: Announcement #${item.id}</span>
                    <p>${content}</p>
                `;
                
                updatesContainer.appendChild(card);
                
                // Manually trigger visibility for the newly created cards
                // (The IntersectionObserver will handle observing them if needed, but for immediate load,
                // we rely on initial static cards setting the stage)
                card.classList.add('visible');
            });
        }

        // Execute fetch operation when the script loads
        fetchVignanData();
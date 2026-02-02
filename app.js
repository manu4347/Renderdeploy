document.addEventListener('DOMContentLoaded', () => {
  const navElements = document.querySelectorAll('.nav-links span, .mobile-nav span, .logo, .hero-content button');
  const sections = document.querySelectorAll('section');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const header = document.querySelector('header');

  const scrollToSection = (targetId) => {
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      const headerOffset = header ? header.offsetHeight : 0;
      const elementPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset - 20;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    if (mobileNav && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      if (hamburger) hamburger.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  navElements.forEach(element => {
    element.addEventListener('click', () => {
      const targetId = element.getAttribute('data-target');
      if (targetId) scrollToSection(targetId);
    });
  });

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    document.addEventListener('click', (event) => {
      const isClickInsideMobileNav = mobileNav.contains(event.target);
      const isClickOnHamburger = hamburger.contains(event.target) || event.target === hamburger;
      if (mobileNav.classList.contains('open') && !isClickInsideMobileNav && !isClickOnHamburger) {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  const setActiveNavLink = () => {
    let currentActive = 'home';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - (header ? header.offsetHeight : 0) - 50;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
        currentActive = section.id;
      }
    });

    document.querySelectorAll('.nav-links span').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-target') === currentActive);
    });
    document.querySelectorAll('.mobile-nav span').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-target') === currentActive);
    });
  };

  window.addEventListener('scroll', setActiveNavLink);
  setActiveNavLink();

  const revealElements = document.querySelectorAll('.reveal');
  const observerOptions = { root: null, rootMargin: '0px', threshold: 0.2 };
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  revealElements.forEach(el => revealObserver.observe(el));

  document.querySelector('#home')?.classList.add('active');

  const eventCardsContainer = document.getElementById('event-cards-container');

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=4');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      eventCardsContainer.innerHTML = '';

      data.forEach((post, index) => {
        const eventCard = document.createElement('div');
        eventCard.classList.add('event-card', 'reveal');
        eventCard.style.transitionDelay = `${index * 0.1}s`;

        const today = new Date();
        const randomDays = Math.floor(Math.random() * 30);
        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + randomDays);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });

        eventCard.innerHTML = `
          <h3>${post.title.charAt(0).toUpperCase() + post.title.slice(1)}</h3>
          <span class="date">${formattedDate}</span>
          <p>${post.body.charAt(0).toUpperCase() + post.body.slice(1).substring(0, 100)}...</p>
          <button type="button" class="learn-more">Read More</button>
        `;
        eventCardsContainer.appendChild(eventCard);
      });

      document.querySelectorAll('.event-cards-grid .event-card').forEach(el => {
        if (!el.classList.contains('observed')) {
          revealObserver.observe(el);
          el.classList.add('observed');
        }
      });
    } catch (error) {
      // keep placeholders
    }
  };

  fetchAnnouncements();

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    const sendButton = contactForm.querySelector('button[type="button"]');
    sendButton.addEventListener('click', async () => {
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

      if (name && email && subject && message) {
        try {
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message }),
          });
        } catch (e) {
          // ignore for UI; message still shown
        }
        alert('Thank you for your message! We will get back to you shortly.');
        contactForm.reset();
      } else {
        alert('Please fill in all fields before sending.');
      }
    });
  }
});

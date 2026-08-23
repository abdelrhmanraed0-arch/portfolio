/**
 * Abdelrhman Raed — Personal Portfolio JavaScript
 * Interactive Particle Canvas, Cursor Glow, 3D Tilt, Scroll Animations, Modal & Form Handling
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Set current year in footer
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     1. INTERACTIVE PARTICLE CANVAS WITH MOUSE REPULSION PHYSICS
     ========================================================================== */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = {
      x: null,
      y: null,
      radius: 140, // Proximity repulsion distance
    };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    // Particle Class
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Base floating velocity (slow & smooth)
        this.vx = (Math.random() - 0.5) * 0.75;
        this.vy = (Math.random() - 0.5) * 0.75;
        this.originalVx = this.vx;
        this.originalVy = this.vy;
        this.radius = Math.random() * 2.2 + 1.2;
        this.alpha = Math.random() * 0.6 + 0.3;
        // Color variation between electric purple, violet and bright lavender
        const purpleShades = ['#a855f7', '#c084fc', '#9333ea', '#d8b4fe', '#7c3aed'];
        this.color = purpleShades[Math.floor(Math.random() * purpleShades.length)];
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#a855f7';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      update() {
        // Check mouse proximity for repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.hypot(dx, dy);

          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = mouse.radius;
            const force = (maxDistance - distance) / maxDistance;
            const repulsionStrength = 4.5;

            // Push smoothly away from mouse
            this.vx -= forceDirectionX * force * repulsionStrength * 0.12;
            this.vy -= forceDirectionY * force * repulsionStrength * 0.12;
          }
        }

        // Apply friction and gently restore to natural floating velocity
        this.vx += (this.originalVx - this.vx) * 0.04;
        this.vy += (this.originalVy - this.vy) * 0.04;

        this.x += this.vx;
        this.y += this.vy;

        // Screen wrap-around
        if (this.x < -10) this.x = width + 10;
        else if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        else if (this.y > height + 10) this.y = -10;

        this.draw();
      }
    }

    let particlesArray = [];
    const initParticles = () => {
      particlesArray = [];
      // Adjust density based on screen size
      const numberOfParticles = Math.min(Math.floor((width * height) / 10000), 110);
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };

    // Draw connecting faint lines
    const connectParticles = () => {
      const maxConnectDist = 110;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectDist) {
            const opacity = (1 - dist / maxConnectDist) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    };

    // Animation Loop
    const animateParticles = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connectParticles();
      requestAnimationFrame(animateParticles);
    };

    initParticles();
    animateParticles();
  }

  /* ==========================================================================
     2. CURSOR SPOTLIGHT GLOW
     ========================================================================== */
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cursorGlow.style.opacity = '1';
    });

    window.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
    });

    const updateCursor = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;
      requestAnimationFrame(updateCursor);
    };
    updateCursor();
  }

  /* ==========================================================================
     3. STICKY HEADER & MOBILE NAVIGATION
     ========================================================================== */
  const header = document.getElementById('header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Header scroll blur effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isActive = navMenu.classList.toggle('active');
      hamburgerBtn.classList.toggle('active');
      hamburgerBtn.setAttribute('aria-expanded', isActive);
    });

    // Close menu when link is clicked
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on click outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ==========================================================================
     4. SCROLL SPY & ACTIVE NAV LINK
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const handleScrollSpy = () => {
    const scrollY = window.pageYOffset + 120;
    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => link.classList.remove('active'));
        if (navLink) navLink.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', handleScrollSpy);

  /* ==========================================================================
     5. INTERSECTION OBSERVER FOR SCROLL REVEAL & SKILLS ANIMATION
     ========================================================================== */
  const revealElements = document.querySelectorAll(
    '.about-visual-column, .about-content-column, .skill-card, .project-card, .contact-info-column, .contact-form-column, .section-header'
  );

  revealElements.forEach((el) => {
    el.classList.add('reveal-fade-up');
  });

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');

        // Animate skill progress bars if this is a skill card
        if (entry.target.classList.contains('skill-card')) {
          const progressBar = entry.target.querySelector('.skill-progress-bar');
          if (progressBar) {
            progressBar.classList.add('animated');
          }
        }

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ==========================================================================
     6. 3D TILT EFFECT ON PROJECT CARDS
     ========================================================================== */
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within element
      const y = e.clientY - rect.top;  // y position within element

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max tilt angle in degrees
      const tiltX = ((y - centerY) / centerY) * -7;
      const tiltY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  /* ==========================================================================
     7. PROJECTS DATA & MODAL SYSTEM
     ========================================================================== */
  const projectsData = {
    1: {
      title: 'Quantum E-Commerce Hub',
      image: 'assets/project_ecommerce.jpg',
      tags: ['HTML5', 'CSS3', 'Responsive UI', 'JavaScript'],
      desc: 'A full-featured modern e-commerce dashboard created with deep focus on dark aesthetic design, fluid animations, and real-time inventory management. Built with structured HTML5 semantic components and CSS Grid.',
      features: [
        'Interactive real-time sales overview and visual metrics',
        'Dynamic product grid with instant category filtering',
        'Smooth checkout drawer and shopping cart state management',
        'Fully responsive adaptation across mobile, tablet, and widescreen displays',
      ],
      demoLink: '#',
      repoLink: 'https://github.com',
    },
    2: {
      title: 'SaaS Real-Time Analytics Overview',
      image: 'assets/project_analytics.jpg',
      tags: ['Web Development', 'CSS3 Glassmorphism', 'Data Visualization', 'UI/UX'],
      desc: 'A futuristic analytics platform providing SaaS businesses with interactive insight charts, traffic heatmaps, geolocation indicators, and user retention cohort trackers.',
      features: [
        'Glowing neon purple dynamic SVG/Canvas chart visualizer',
        'Live visitor count tracking with auto-refresh intervals',
        'Multi-metric cards with percentage gain indicators',
        'Glassmorphic dark design with accessible color contrast',
      ],
      demoLink: '#',
      repoLink: 'https://github.com',
    },
    3: {
      title: 'Quantum Flux Task & Workflow Suite',
      image: 'assets/project_tasks.jpg',
      tags: ['Java Core', 'HTML5', 'Modular Architecture', 'CSS Flexbox'],
      desc: 'An agile task management application featuring a Kanban workflow system. Demonstrates structured problem solving and clean separation of concerns rooted in Object-Oriented design principles.',
      features: [
        'Multi-column task lifecycle (To Do, In Progress, Review, Done)',
        'Progress bar indicators with priority badges',
        'Interactive assignment tags and task detail panels',
        'Intuitive interface designed for team collaboration',
      ],
      demoLink: '#',
      repoLink: 'https://github.com',
    },
    4: {
      title: 'CodeForge Interactive Sandbox',
      image: 'assets/project_devhub.jpg',
      tags: ['Java', 'HTML5', 'CSS3', 'Developer Tools'],
      desc: 'A dual-pane interactive code playground where developers can write Java logic and instantly preview frontend HTML/CSS output with custom purple syntax highlighting and console logging.',
      features: [
        'Side-by-side code editor with syntax color theme',
        'Live DOM preview iframe with instant render capabilities',
        'Integrated terminal simulator with build logs and status indicators',
        'Modular file tree explorer with multi-tab workspace',
      ],
      demoLink: '#',
      repoLink: 'https://github.com',
    },
  };

  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBody = document.getElementById('modal-body-content');
  const viewTriggers = document.querySelectorAll('.view-project-trigger');
  const viewAllProjectsBtn = document.getElementById('view-all-projects-btn');

  const openModal = (htmlContent) => {
    if (!projectModal || !modalBody) return;
    modalBody.innerHTML = htmlContent;
    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  };

  const closeModal = () => {
    if (!projectModal) return;
    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  viewTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const projectId = trigger.getAttribute('data-project');
      const project = projectsData[projectId];
      if (!project) return;

      const modalContent = `
        <img src="${project.image}" alt="${project.title}" class="modal-project-img">
        <div class="project-tags" style="margin-bottom: 0.75rem;">
          ${project.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
        </div>
        <h3 class="modal-title">${project.title}</h3>
        <p class="modal-desc">${project.desc}</p>
        
        <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.75rem; font-family: var(--font-heading);">Key Features:</h4>
        <ul class="modal-features-list">
          ${project.features
            .map(
              (f) => `
            <li class="modal-feature-item">
              <i data-lucide="check-circle-2"></i>
              <span>${f}</span>
            </li>
          `
            )
            .join('')}
        </ul>

        <div class="modal-actions">
          <a href="#contact" class="btn btn-primary" onclick="document.getElementById('project-modal').classList.remove('active'); document.body.style.overflow='';">
            <span class="btn-shine"></span>
            <i data-lucide="mail"></i>
            <span>Discuss This Project</span>
          </a>
          <a href="cv.pdf" download="cv.pdf" class="btn btn-outline">
            <i data-lucide="download"></i>
            <span>Download CV</span>
          </a>
        </div>
      `;
      openModal(modalContent);
    });
  });

  // "View All Projects" Handler
  if (viewAllProjectsBtn) {
    viewAllProjectsBtn.addEventListener('click', () => {
      const allProjectsContent = `
        <div style="text-align: center; margin-bottom: 1.75rem;">
          <div class="section-badge" style="margin-bottom: 0.75rem;"><i data-lucide="folder-git-2"></i> All Projects Archive</div>
          <h3 class="modal-title">Abdelrhman's Development Archive</h3>
          <p class="modal-desc" style="max-width: 540px; margin: 0 auto;">
            Explore the complete repository of web applications, experiments, and Java architecture solutions.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 2rem;">
          ${Object.values(projectsData)
            .map(
              (p) => `
            <div style="display: flex; gap: 1rem; align-items: center; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(168,85,247,0.25); border-radius: var(--radius-md);">
              <img src="${p.image}" alt="${p.title}" style="width: 100px; aspect-ratio: 16/9; object-fit: cover; border-radius: var(--radius-sm);">
              <div style="flex: 1;">
                <h4 style="font-size: 1.05rem; color: #fff; margin-bottom: 0.2rem;">${p.title}</h4>
                <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                  ${p.tags.map((t) => `<span class="tag" style="font-size: 0.7rem; padding: 0.15rem 0.45rem;">${t}</span>`).join('')}
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="modal-actions" style="justify-content: center;">
          <a href="#contact" class="btn btn-primary" onclick="document.getElementById('project-modal').classList.remove('active'); document.body.style.overflow='';">
            <span class="btn-shine"></span>
            <i data-lucide="send"></i>
            <span>Request Custom Solution</span>
          </a>
        </div>
      `;
      openModal(allProjectsContent);
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('active')) {
      closeModal();
    }
  });

  /* ==========================================================================
     8. TOAST NOTIFICATION UTILITY
     ========================================================================== */
  const toastContainer = document.getElementById('toast-container');
  const showToast = (message, icon = 'check-circle') => {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="${icon}" class="toast-icon"></i>
      <span class="toast-content">${message}</span>
    `;
    toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 4500);
  };

  /* ==========================================================================
     9. CONTACT FORM SUBMISSION & VALIDATION
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (contactForm) {
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const messageInput = document.getElementById('form-message');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    const validateEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Clear errors
      nameError.textContent = '';
      emailError.textContent = '';
      messageError.textContent = '';
      nameInput.classList.remove('invalid');
      emailInput.classList.remove('invalid');
      messageInput.classList.remove('invalid');

      // Validate Name
      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please enter your name.';
        nameInput.classList.add('invalid');
        isValid = false;
      }

      // Validate Email
      if (!emailInput.value.trim()) {
        emailError.textContent = 'Please enter your email address.';
        emailInput.classList.add('invalid');
        isValid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid email address.';
        emailInput.classList.add('invalid');
        isValid = false;
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        messageError.textContent = 'Please enter your message.';
        messageInput.classList.add('invalid');
        isValid = false;
      } else if (messageInput.value.trim().length < 10) {
        messageError.textContent = 'Message should be at least 10 characters.';
        messageInput.classList.add('invalid');
        isValid = false;
      }

      if (!isValid) return;

      // Simulate sending with loading state
      if (submitBtn) submitBtn.classList.add('loading');

      setTimeout(() => {
        if (submitBtn) submitBtn.classList.remove('loading');
        contactForm.reset();
        showToast('Thank you! Your message has been sent successfully. Abdelrhman will get back to you soon.');
      }, 1200);
    });
  }
});

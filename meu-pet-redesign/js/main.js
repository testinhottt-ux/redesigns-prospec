/* ========================================
   Meu Pet Brasil - Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    Loader.init();
    Navigation.init();
    Animations.init();
    ScrollEffects.init();
    ContactForm.init();
    BackToTop.init();
    CounterAnimation.init();
});

/* ========================================
   Loader
   ======================================== */
const Loader = {
    init() {
        const loader = document.getElementById('loader');
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.style.overflow = 'visible';
            }, 1500);
        });

        // Fallback if load event already fired
        if (document.readyState === 'complete') {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.style.overflow = 'visible';
            }, 1500);
        }
    }
};

/* ========================================
   Navigation
   ======================================== */
const Navigation = {
    init() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.bindEvents();
        this.handleScroll();
    },

    bindEvents() {
        // Mobile menu toggle
        this.navToggle.addEventListener('click', () => this.toggleMenu());
        
        // Close menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.closeMenu();
                this.setActiveLink(e.target);
            });
        });

        // Scroll event
        window.addEventListener('scroll', () => this.handleScroll());

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
                this.closeMenu();
            }
        });
    },

    toggleMenu() {
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
    },

    closeMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
    },

    handleScroll() {
        const scrollY = window.scrollY;
        
        // Navbar background on scroll
        if (scrollY > 100) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // Update active link based on scroll position
        this.updateActiveLink();
    },

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    },

    setActiveLink(link) {
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    }
};

/* ========================================
   Animations (Intersection Observer)
   ======================================== */
const Animations = {
    init() {
        this.observeElements();
    },

    observeElements() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });
    }
};

/* ========================================
   Scroll Effects
   ======================================== */
const ScrollEffects = {
    init() {
        this.initParallax();
        this.initSmoothScroll();
    },

    initParallax() {
        const hero = document.querySelector('.hero-image');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (hero && scrolled < window.innerHeight) {
                hero.style.transform = `scale(1.1) translateY(${scrolled * 0.3}px)`;
            }
        });
    },

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

/* ========================================
   Counter Animation
   ======================================== */
const CounterAnimation = {
    init() {
        this.counters = document.querySelectorAll('[data-count]');
        this.observeCounters();
    },

    observeCounters() {
        const options = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.counters.forEach(counter => observer.observe(counter));
    },

    animateCounter(counter) {
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
                // Add + suffix for numbers > 100
                if (target > 100) {
                    counter.textContent = target.toLocaleString('pt-BR');
                }
            }
        };

        updateCounter();
    }
};

/* ========================================
   Contact Form
   ======================================== */
const ContactForm = {
    init() {
        this.form = document.getElementById('contactForm');
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    },

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        if (!data.name || !data.email || !data.message) {
            this.showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showMessage('Por favor, insira um e-mail válido.', 'error');
            return;
        }

        // Simulate form submission
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        setTimeout(() => {
            this.showMessage('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            this.form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    },

    showMessage(message, type) {
        // Remove existing message
        const existingMsg = document.querySelector('.form-message');
        if (existingMsg) existingMsg.remove();

        // Create message element
        const msgDiv = document.createElement('div');
        msgDiv.className = `form-message ${type}`;
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            padding: 16px 24px;
            border-radius: 12px;
            margin-top: 20px;
            font-size: 0.95rem;
            font-weight: 500;
            animation: fadeIn 0.3s ease;
            ${type === 'success' 
                ? 'background: #D1FAE5; color: #065F46; border: 1px solid #10B981;' 
                : 'background: #FEE2E2; color: #991B1B; border: 1px solid #EF4444;'}
        `;

        this.form.appendChild(msgDiv);

        // Remove message after 5 seconds
        setTimeout(() => {
            msgDiv.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => msgDiv.remove(), 300);
        }, 5000);
    }
};

/* ========================================
   Back to Top Button
   ======================================== */
const BackToTop = {
    init() {
        this.button = document.getElementById('backToTop');
        if (this.button) {
            this.bindEvents();
        }
    },

    bindEvents() {
        window.addEventListener('scroll', () => this.toggleVisibility());
        this.button.addEventListener('click', () => this.scrollToTop());
    },

    toggleVisibility() {
        if (window.scrollY > 500) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    },

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

/* ========================================
   Gallery Lightbox (Optional Enhancement)
   ======================================== */
const Gallery = {
    init() {
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.createLightbox();
        this.bindEvents();
    },

    createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="" alt="Gallery image">
                <button class="lightbox-close">&times;</button>
            </div>
        `;
        document.body.appendChild(lightbox);
        this.lightbox = lightbox;
    },

    bindEvents() {
        this.galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const img = item.querySelector('img');
                this.openLightbox(img.src, img.alt);
            });
        });

        this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
            this.closeLightbox();
        });

        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeLightbox();
            }
        });
    },

    openLightbox(src, alt) {
        const img = this.lightbox.querySelector('img');
        img.src = src;
        img.alt = alt;
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Gallery.init();
});

/* ========================================
   Add CSS animations for form messages
   ======================================== */
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }

    /* Lightbox Styles */
    .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    .lightbox.active {
        opacity: 1;
        visibility: visible;
    }

    .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }

    .lightbox-content img {
        max-width: 100%;
        max-height: 85vh;
        object-fit: contain;
        border-radius: 8px;
    }

    .lightbox-close {
        position: absolute;
        top: -50px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 2.5rem;
        cursor: pointer;
        transition: transform 0.3s ease;
    }

    .lightbox-close:hover {
        transform: rotate(90deg);
    }
`;
document.head.appendChild(style);

// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const backToTop = document.getElementById('back-to-top');
const contactForm = document.getElementById('contact-form');
const navLinks = document.querySelectorAll('.nav-link');

// Theme Management
class ThemeManager {
    constructor() {
        this.themes = ['auto', 'light', 'dark'];
        this.currentTheme = localStorage.getItem('theme') || 'auto';
        this.systemThemeListener = null;
        this.init();
    }

    init() {
        this.setTheme(this.currentTheme);
        this.setupSystemThemeListener();
        this.updateThemeIcon();
    }

    setupSystemThemeListener() {
        // Listen for system theme changes when in auto mode
        if (window.matchMedia) {
            this.systemThemeListener = window.matchMedia('(prefers-color-scheme: dark)');
            this.systemThemeListener.addEventListener('change', () => {
                if (this.currentTheme === 'auto') {
                    this.applyTheme();
                }
            });
        }
    }

    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    getEffectiveTheme() {
        if (this.currentTheme === 'auto') {
            return this.getSystemTheme();
        }
        return this.currentTheme;
    }

    applyTheme() {
        const effectiveTheme = this.getEffectiveTheme();
        document.documentElement.setAttribute('data-theme', effectiveTheme);

        // Update navbar background for theme changes
        if (window.navigationManager) {
            window.navigationManager.handleNavbarScroll();
        }
    }

    setTheme(theme) {
        if (!this.themes.includes(theme)) {
            theme = 'auto';
        }

        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.applyTheme();
        this.updateThemeIcon();
    }

    toggleTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setTheme(this.themes[nextIndex]);
    }

    updateThemeIcon() {
        const icon = themeToggle.querySelector('i');
        const effectiveTheme = this.getEffectiveTheme();

        // Update icon based on current theme setting
        if (this.currentTheme === 'auto') {
            icon.className = 'fas fa-adjust'; // Auto mode icon
            icon.title = `Auto (currently ${effectiveTheme})`;
        } else if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun'; // Sun icon for dark mode (to switch to light)
            icon.title = 'Switch to Auto';
        } else {
            icon.className = 'fas fa-moon'; // Moon icon for light mode (to switch to dark)
            icon.title = 'Switch to Dark';
        }
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollSpy();
    }

    setupEventListeners() {
        // Mobile menu toggle
        navToggle.addEventListener('click', () => this.toggleMobileMenu());

        // Close menu when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    this.toggleMobileMenu();
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                this.toggleMobileMenu();
            }
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => this.handleNavbarScroll());
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    handleNavbarScroll() {
        const scrolled = window.scrollY > 50;
        navbar.style.background = scrolled
            ? 'rgba(255, 255, 255, 0.98)'
            : 'rgba(255, 255, 255, 0.95)';

        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            navbar.style.background = scrolled
                ? 'rgba(17, 24, 39, 0.98)'
                : 'rgba(17, 24, 39, 0.95)';
        }
    }

    setupScrollSpy() {
        const sections = document.querySelectorAll('section[id]');

        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    }
}

// Scroll Management
class ScrollManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupBackToTop();
        this.setupSmoothScrolling();
        this.setupScrollAnimations();
    }

    setupBackToTop() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    setupSmoothScrolling() {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.skill-category, .project-card, .timeline-item, .education-item');
        animatedElements.forEach(el => {
            el.classList.add('loading');
            observer.observe(el);
        });
    }
}

// Form Management
class FormManager {
    constructor() {
        this.init();
    }

    init() {
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        // Validate form
        if (!this.validateForm(data)) {
            return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Create WhatsApp message
        const whatsappMessage = this.createWhatsAppMessage(data);
        const whatsappUrl = `https://wa.me/+919340315994?text=${encodeURIComponent(whatsappMessage)}`;

        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');

        // Reset form and show success message
        setTimeout(() => {
            this.showNotification('Redirecting to WhatsApp...', 'success');
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1000);
    }

    createWhatsAppMessage(data) {
        let message = `Hi Ragini,\n\n`;
        message += `Name: ${data.name}\n`;
        message += `Email: ${data.email}\n`;

        if (data.subject && data.subject.trim()) {
            message += `Subject: ${data.subject}\n`;
        }

        message += `\nMessage:\n${data.message}\n\n`;
        message += `Best regards,\n${data.name}`;

        return message;
    }

    validateForm(data) {
        const errors = [];

        if (!data.name.trim()) errors.push('Name is required');
        if (!data.email.trim()) errors.push('Email is required');
        if (!this.isValidEmail(data.email)) errors.push('Please enter a valid email');
        if (!data.subject.trim()) errors.push('Subject is required');
        if (!data.message.trim()) errors.push('Message is required');

        if (errors.length > 0) {
            this.showNotification(errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
        });

        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        notification.style.background = colors[type] || colors.info;

        // Add to DOM and animate in
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Performance Optimization
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    preloadCriticalResources() {
        // Preload critical fonts
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
        fontLink.as = 'style';
        document.head.appendChild(fontLink);
    }
}

// Utility Functions
class Utils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static getScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = scrollTop / (docHeight - winHeight);
        return Math.min(scrollPercent * 100, 100);
    }
}

// Typing Animation for Hero Section
class TypingAnimation {
    constructor(element, texts, speed = 100) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.init();
    }

    init() {
        this.type();
    }

    type() {
        const currentText = this.texts[this.textIndex];

        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let typeSpeed = this.speed;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    const themeManager = new ThemeManager();
    window.navigationManager = new NavigationManager(); // Make globally accessible for theme updates
    const scrollManager = new ScrollManager();
    const formManager = new FormManager();
    const performanceOptimizer = new PerformanceOptimizer();

    // Setup theme toggle
    themeToggle.addEventListener('click', () => {
        themeManager.toggleTheme();
    });

    // Update copyright year dynamically
    const copyrightElement = document.querySelector('.footer-content p');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.innerHTML = `&copy; ${currentYear} Ragini Mahobiya. All rights reserved.`;
    }

    // Initialize typing animation for hero subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        new TypingAnimation(heroSubtitle, [
            'React Developer',
            'Frontend Engineer',
            'UI/UX Enthusiast',
            'Problem Solver'
        ], 150);
    }

    // Add loading animations
    setTimeout(() => {
        document.querySelectorAll('.loading').forEach(el => {
            el.classList.add('loaded');
        });
    }, 100);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navigationManager.isMenuOpen) {
            navigationManager.toggleMobileMenu();
        }
    });

    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: var(--primary-color);
        z-index: 10000;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', Utils.throttle(() => {
        const progress = Utils.getScrollProgress();
        progressBar.style.width = `${progress}%`;
    }, 10));

    console.log('Portfolio website initialized successfully! 🚀');
});

// Service Worker Registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

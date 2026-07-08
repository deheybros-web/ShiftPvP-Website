/**
 * Shift PvP - Client-Side Interactive Engine
 * Core Architecture Framework: Vanilla ECMAScript
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Core Elements Tracking
    const navbar = document.getElementById('mainNavbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const backToTopBtn = document.getElementById('backToTop');
    const scrollIndicator = document.getElementById('scrollIndicator');

    /* ==========================================================================
       1. STICKY NAVBAR MANAGEMENT
       ========================================================================== */
    const handleNavbarScroll = () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    // Fire on initialization to ensure correct status after refresh execution
    handleNavbarScroll();
    window.addEventListener('scroll', handleNavbarScroll);

    /* ==========================================================================
       2. MOBILE MENU INTERACTION OVERLAY
       ========================================================================== */
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent background page body scroll bleed while interactive overlay is rendering
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Terminate overlay if clicking document content canvas outside structural bounds
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close context mapping if viewport shifts bounds dynamically across break tokens
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    /* ==========================================================================
       3. BUTTON RIPPLE EMISSION METRIC
       ========================================================================== */
    const rippleButtons = document.querySelectorAll('.ripple');
    
    rippleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Setup coordination offsets
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Allocate DOM element structure instance
            const rippleCircle = document.createElement('span');
            rippleCircle.classList.add('ripple-effect');
            rippleCircle.style.left = `${x}px`;
            rippleCircle.style.top = `${y}px`;
            
            // Append and coordinate GC cleanup sequence handling
            this.appendChild(rippleCircle);
            
            rippleCircle.addEventListener('animationend', () => {
                rippleCircle.remove();
            });
        });
    });

    /* ==========================================================================
       4. BACK-TO-TOP FLOATING EMISSION MECHANICS
       ========================================================================== */
    const evaluateBackToTopStatus = () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
            if (scrollIndicator) scrollIndicator.style.opacity = '0';
        } else {
            backToTopBtn.classList.remove('visible');
            if (scrollIndicator) scrollIndicator.style.opacity = '0.6';
        }
    };

    window.addEventListener('scroll', evaluateBackToTopStatus);
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* ==========================================================================
       5. ASYNCHRONOUS SCROLL REVEAL VIEWPORT DETECTOR (INTERSECTION OBSERVER)
       ========================================================================== */
    const targetRevealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
        const revealOptions = {
            root: null, // Relative to device viewport bounds
            threshold: 0.05, // Trigger target emission execution at early visibility entry phase
            rootMargin: '0px 0px -40px 0px'
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Cease observations tracking once class context matches desired visual states
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);

        targetRevealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Safe structural fallback mapping for legacy platform parameters compatibility
        targetRevealElements.forEach(element => {
            element.classList.add('revealed');
        });
    }
});
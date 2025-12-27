/**
 * Workshop Presentation Controller
 * Handles slide navigation, keyboard controls, menu, and animations
 */

(function() {
    'use strict';

    // ========================================
    // DOM ELEMENTS
    // ========================================
    
    const presentation = document.getElementById('presentation');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressFill = document.getElementById('progressFill');
    const slideCounter = document.getElementById('slideCounter');
    
    // Menu elements
    const menuToggle = document.getElementById('menuToggle');
    const slideMenu = document.getElementById('slideMenu');
    const menuClose = document.getElementById('menuClose');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuLinks = document.querySelectorAll('.slide-menu a[data-goto]');

    // ========================================
    // STATE
    // ========================================
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    let menuOpen = false;

    // ========================================
    // SLIDE NAVIGATION
    // ========================================

    /**
     * Go to a specific slide by index
     * @param {number} index - The slide index to navigate to (0-based)
     */
    function goToSlide(index) {
        // Validate index
        if (index < 0 || index >= totalSlides) {
            return;
        }

        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        slides[currentSlide].classList.add('prev');

        // Update current slide index
        currentSlide = index;

        // Remove prev class from all slides and add active to current
        slides.forEach((slide, i) => {
            slide.classList.remove('prev');
            if (i === currentSlide) {
                slide.classList.add('active');
                // Reset animations for current slide
                resetAnimations(slide);
            }
        });

        // Update UI elements
        updateProgress();
        updateCounter();
        updateNavigationButtons();
        
        // Update menu active state if menu exists
        if (slideMenu) {
            updateMenuActiveState();
        }

        // Store current slide in URL hash for bookmarking
        window.location.hash = `slide-${currentSlide + 1}`;
    }

    /**
     * Navigate to the next slide
     */
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        }
    }

    /**
     * Navigate to the previous slide
     */
    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    }

    // ========================================
    // UI UPDATES
    // ========================================

    /**
     * Update the progress bar width
     */
    function updateProgress() {
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressFill.style.width = `${progress}%`;
    }

    /**
     * Update the slide counter text
     */
    function updateCounter() {
        slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
    }

    /**
     * Update navigation button states (disabled/enabled)
     */
    function updateNavigationButtons() {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
        
        // Update opacity for visual feedback
        prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '0.7';
        nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '0.7';
    }

    // ========================================
    // ANIMATIONS
    // ========================================

    /**
     * Reset animations for elements within a slide
     * This forces animations to replay when entering a slide
     * @param {HTMLElement} slide - The slide element
     */
    function resetAnimations(slide) {
        const animatedElements = slide.querySelectorAll(
            '.animate-fade-in, .animate-slide-up, .animate-scale-in'
        );

        animatedElements.forEach(element => {
            // Remove animation classes temporarily
            const classList = [...element.classList];
            const animationClasses = classList.filter(c => 
                c.startsWith('animate-') || c.startsWith('delay-')
            );
            
            // Force reflow
            animationClasses.forEach(c => element.classList.remove(c));
            void element.offsetWidth; // Trigger reflow
            animationClasses.forEach(c => element.classList.add(c));
        });
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    /**
     * Keyboard navigation handler
     */
    function handleKeydown(event) {
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // Spacebar
            case 'PageDown':
                event.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                event.preventDefault();
                prevSlide();
                break;
            case 'Home':
                event.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                event.preventDefault();
                goToSlide(totalSlides - 1);
                break;
            case 'Escape':
                // Could be used for menu or overview
                break;
        }
    }

    /**
     * Touch/swipe handling for mobile devices
     */
    let touchStartX = 0;
    let touchEndX = 0;

    function handleTouchStart(event) {
        touchStartX = event.changedTouches[0].screenX;
    }

    function handleTouchEnd(event) {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipe();
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - go to next slide
                nextSlide();
            } else {
                // Swiped right - go to previous slide
                prevSlide();
            }
        }
    }

    /**
     * Handle URL hash changes for direct navigation
     */
    function handleHashChange() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#slide-')) {
            const slideNum = parseInt(hash.replace('#slide-', ''), 10);
            if (slideNum >= 1 && slideNum <= totalSlides) {
                goToSlide(slideNum - 1);
            }
        }
    }

    // ========================================
    // TAB SWITCHING (for Slide 12)
    // ========================================

    /**
     * Initialize tab functionality for interactive slides
     */
    function initTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    /**
     * Initialize the presentation
     */
    function init() {
        // Set up event listeners
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
        document.addEventListener('keydown', handleKeydown);
        
        // Touch events for mobile
        presentation.addEventListener('touchstart', handleTouchStart, { passive: true });
        presentation.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Hash change for direct navigation
        window.addEventListener('hashchange', handleHashChange);

        // Initialize interactive elements
        initTabs();
        
        // Initialize slide menu
        initMenu();

        // Check for initial hash
        if (window.location.hash) {
            handleHashChange();
        } else {
            // Initialize first slide
            updateProgress();
            updateCounter();
            updateNavigationButtons();
        }

        // Log initialization
    }

    // ========================================
    // SLIDE MENU
    // ========================================
    
    /**
     * Initialize the slide navigation menu
     */
    function initMenu() {
        if (!menuToggle || !slideMenu) return;
        
        // Toggle menu open
        menuToggle.addEventListener('click', openMenu);
        
        // Close menu
        if (menuClose) {
            menuClose.addEventListener('click', closeMenu);
        }
        
        // Close on overlay click
        if (menuOverlay) {
            menuOverlay.addEventListener('click', closeMenu);
        }
        
        // Handle menu link clicks
        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const slideId = this.getAttribute('data-goto');
                goToSlideById(slideId);
                closeMenu();
            });
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menuOpen) {
                closeMenu();
            }
        });
    }
    
    /**
     * Open the slide menu
     */
    function openMenu() {
        menuOpen = true;
        slideMenu.classList.add('open');
        if (menuOverlay) {
            menuOverlay.classList.add('show');
        }
        updateMenuActiveState();
    }
    
    /**
     * Close the slide menu
     */
    function closeMenu() {
        menuOpen = false;
        slideMenu.classList.remove('open');
        if (menuOverlay) {
            menuOverlay.classList.remove('show');
        }
    }
    
    /**
     * Go to a slide by its data-slide id
     * @param {string} slideId - The data-slide attribute value
     */
    function goToSlideById(slideId) {
        const targetSlide = document.querySelector(`[data-slide="${slideId}"]`);
        if (targetSlide) {
            const index = Array.from(slides).indexOf(targetSlide);
            if (index !== -1) {
                goToSlide(index);
            }
        }
    }
    
    /**
     * Update the active state in the menu
     */
    function updateMenuActiveState() {
        const currentSlideEl = slides[currentSlide];
        const currentSlideId = currentSlideEl.getAttribute('data-slide');
        
        menuLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-goto') === currentSlideId) {
                link.classList.add('active');
            }
        });
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    /**
     * Toggle fullscreen mode
     */
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Get current slide information
     * @returns {Object} Current slide info
     */
    function getCurrentSlideInfo() {
        return {
            index: currentSlide,
            number: currentSlide + 1,
            total: totalSlides,
            element: slides[currentSlide]
        };
    }

    // Expose some functions globally for debugging/external control
    window.presentationControls = {
        next: nextSlide,
        prev: prevSlide,
        goTo: goToSlide,
        getInfo: getCurrentSlideInfo,
        fullscreen: toggleFullscreen
    };

    // ========================================
    // START
    // ========================================
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

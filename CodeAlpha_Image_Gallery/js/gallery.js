/**
 * ============================================
 * IMAGE GALLERY - COMPLETE WORKING VERSION
 * ============================================
 * Features:
 * - Category filtering
 * - Image effect filters
 * - Lightbox with navigation
 * - Keyboard navigation
 * - Touch swipe support
 * - Thumbnails
 * ============================================
 */

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        
        console.log('%c🖼️ Gallery Pro Initializing...', 'color: #6366f1; font-size: 14px; font-weight: bold;');

        // ========================================
        // DOM Elements
        // ========================================
        const galleryGrid = document.getElementById('galleryGrid');
        const galleryItems = document.querySelectorAll('.gallery-item');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const imageFilterSelect = document.getElementById('imageFilter');
        const noResults = document.getElementById('noResults');

        // Lightbox elements
        const lightbox = document.getElementById('lightbox');
        const lightboxOverlay = document.getElementById('lightboxOverlay');
        const lightboxImage = document.getElementById('lightboxImage');
        const imageTitle = document.getElementById('imageTitle');
        const imageCategory = document.getElementById('imageCategory');
        const currentNum = document.getElementById('currentNum');
        const totalNum = document.getElementById('totalNum');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const closeBtn = document.getElementById('closeBtn');
        const loader = document.getElementById('loader');
        const thumbsContainer = document.getElementById('thumbsContainer');
        const lightboxFilterBtns = document.querySelectorAll('.lf-btn');

        // ========================================
        // State Variables
        // ========================================
        let currentIndex = 0;
        let currentCategory = 'all';
        let visibleItems = [];
        let isLightboxOpen = false;
        let isLoading = false;

        // Touch variables
        let touchStartX = 0;
        let touchEndX = 0;

        // ========================================
        // Initialize
        // ========================================
        function init() {
            updateVisibleItems();
            bindEvents();
            updateStats();
            console.log('%c✅ Gallery Pro Ready! Total images: ' + galleryItems.length, 'color: #22c55e; font-weight: bold;');
        }

        // ========================================
        // Update Visible Items
        // ========================================
        function updateVisibleItems() {
            visibleItems = Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
            if (totalNum) {
                totalNum.textContent = visibleItems.length;
            }
        }

        // ========================================
        // Update Footer Stats
        // ========================================
        function updateStats() {
            const statsEl = document.getElementById('totalImagesCount');
            if (statsEl) {
                statsEl.textContent = galleryItems.length + '+';
            }
        }

        // ========================================
        // Bind All Events
        // ========================================
        function bindEvents() {
            // Filter buttons click
            filterButtons.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const filter = this.getAttribute('data-filter');
                    handleCategoryFilter(filter, this);
                });
            });

            // Image filter select change
            if (imageFilterSelect) {
                imageFilterSelect.addEventListener('change', function() {
                    handleImageFilter(this.value);
                });
            }

            // Gallery items click
            galleryItems.forEach(function(item, index) {
                item.addEventListener('click', function() {
                    openLightbox(this);
                });

                // Add keyboard support
                item.setAttribute('tabindex', '0');
                item.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox(this);
                    }
                });
            });

            // Lightbox navigation
            if (prevBtn) {
                prevBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    navigate(-1);
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    navigate(1);
                });
            }

            // Close button
            if (closeBtn) {
                closeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeLightbox();
                });
            }

            // Click overlay to close
            if (lightboxOverlay) {
                lightboxOverlay.addEventListener('click', function() {
                    closeLightbox();
                });
            }

            // Keyboard navigation
            document.addEventListener('keydown', handleKeydown);

            // Touch events for swipe
            if (lightbox) {
                lightbox.addEventListener('touchstart', function(e) {
                    touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });

                lightbox.addEventListener('touchend', function(e) {
                    touchEndX = e.changedTouches[0].screenX;
                    handleSwipe();
                }, { passive: true });
            }

            // Lightbox filter buttons
            lightboxFilterBtns.forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    handleLightboxFilter(this);
                });
            });

            // Image load event
            if (lightboxImage) {
                lightboxImage.addEventListener('load', function() {
                    if (loader) loader.classList.remove('show');
                    this.classList.add('loaded');
                    isLoading = false;
                });

                lightboxImage.addEventListener('error', function() {
                    if (loader) loader.classList.remove('show');
                    this.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                    this.classList.add('loaded');
                    isLoading = false;
                });
            }
        }

        // ========================================
        // Category Filter Handler
        // ========================================
        function handleCategoryFilter(filter, clickedBtn) {
            // Update active button
            filterButtons.forEach(function(btn) {
                btn.classList.remove('active');
            });
            clickedBtn.classList.add('active');

            // Store current filter
            currentCategory = filter;

            // Filter gallery items
            let visibleCount = 0;
            galleryItems.forEach(function(item) {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    item.style.animationDelay = (visibleCount * 0.05) + 's';
                    visibleCount++;
                } else {
                    item.classList.add('hidden');
                }
            });

            // Update visible items array
            updateVisibleItems();

            // Show/hide no results
            if (visibleItems.length === 0) {
                noResults.classList.add('show');
            } else {
                noResults.classList.remove('show');
            }

            console.log('%cFilter: ' + filter + ' (' + visibleCount + ' images)', 'color: #f59e0b;');
        }

        // ========================================
        // Image Filter Handler
        // ========================================
        function handleImageFilter(filter) {
            const filterClasses = ['filter-grayscale', 'filter-sepia', 'filter-blur', 
                                   'filter-brightness', 'filter-contrast', 'filter-saturate', 'filter-vintage'];

            galleryItems.forEach(function(item) {
                // Remove all filter classes
                filterClasses.forEach(function(fc) {
                    item.classList.remove(fc);
                });

                // Add new filter if not 'none'
                if (filter !== 'none') {
                    item.classList.add('filter-' + filter);
                }
            });

            console.log('%cImage filter: ' + filter, 'color: #06b6d4;');
        }

        // ========================================
        // Open Lightbox
        // ========================================
        function openLightbox(item) {
            updateVisibleItems();

            // Find index in visible items
            const index = visibleItems.indexOf(item);
            if (index === -1) return;

            currentIndex = index;
            isLightboxOpen = true;

            // Show lightbox
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Create thumbnails
            createThumbnails();

            // Show image
            showImage(currentIndex);

            console.log('%cLightbox opened: Image ' + (currentIndex + 1) + '/' + visibleItems.length, 'color: #6366f1;');
        }

        // ========================================
        // Close Lightbox
        // ========================================
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            isLightboxOpen = false;

            // Reset image
            lightboxImage.classList.remove('loaded');

            // Reset filters
            lightboxFilterBtns.forEach(function(btn) {
                btn.classList.toggle('active', btn.getAttribute('data-filter') === 'none');
            });
            lightboxImage.className = 'lightbox-image';

            console.log('%cLightbox closed', 'color: #6366f1;');
        }

        // ========================================
        // Show Image in Lightbox
        // ========================================
        function showImage(index) {
            if (isLoading) return;

            const item = visibleItems[index];
            if (!item) return;

            const img = item.querySelector('img');
            const title = item.querySelector('.item-overlay h3');
            const category = item.querySelector('.item-overlay p');

            // Show loader
            isLoading = true;
            if (loader) loader.classList.add('show');
            lightboxImage.classList.remove('loaded');

            // Get higher resolution image
            let imgSrc = img.src;
            if (imgSrc.includes('w=800')) {
                imgSrc = imgSrc.replace('w=800', 'w=1400');
            }

            // Set image
            lightboxImage.src = imgSrc;
            lightboxImage.alt = title ? title.textContent : 'Image';

            // Update info
            if (imageTitle) imageTitle.textContent = title ? title.textContent : 'Untitled';
            if (imageCategory) imageCategory.textContent = category ? category.textContent : 'Unknown';
            if (currentNum) currentNum.textContent = index + 1;

            // Update nav buttons
            if (prevBtn) prevBtn.disabled = index === 0;
            if (nextBtn) nextBtn.disabled = index === visibleItems.length - 1;

            // Update thumbnails
            updateActiveThumbnail(index);
        }

        // ========================================
        // Navigate Images
        // ========================================
        function navigate(direction) {
            if (isLoading) return;

            const newIndex = currentIndex + direction;

            if (newIndex < 0 || newIndex >= visibleItems.length) {
                return;
            }

            currentIndex = newIndex;
            showImage(currentIndex);
        }

        // ========================================
        // Create Thumbnails
        // ========================================
        function createThumbnails() {
            if (!thumbsContainer) return;

            thumbsContainer.innerHTML = '';

            visibleItems.forEach(function(item, index) {
                const img = item.querySelector('img');
                
                const thumb = document.createElement('div');
                thumb.className = 'thumb' + (index === currentIndex ? ' active' : '');
                
                const thumbImg = document.createElement('img');
                thumbImg.src = img.src;
                thumbImg.alt = 'Thumbnail ' + (index + 1);
                
                thumb.appendChild(thumbImg);

                thumb.addEventListener('click', function(e) {
                    e.stopPropagation();
                    currentIndex = index;
                    showImage(index);
                });

                thumbsContainer.appendChild(thumb);
            });
        }

        // ========================================
        // Update Active Thumbnail
        // ========================================
        function updateActiveThumbnail(index) {
            if (!thumbsContainer) return;

            const thumbs = thumbsContainer.querySelectorAll('.thumb');
            thumbs.forEach(function(thumb, i) {
                thumb.classList.toggle('active', i === index);
            });

            // Scroll active thumb into view
            const activeThumb = thumbs[index];
            if (activeThumb) {
                activeThumb.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }

        // ========================================
        // Keyboard Handler
        // ========================================
        function handleKeydown(e) {
            if (!isLightboxOpen) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    navigate(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    navigate(1);
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeLightbox();
                    break;
            }
        }

        // ========================================
        // Touch Swipe Handler
        // ========================================
        function handleSwipe() {
            if (!isLightboxOpen) return;

            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next
                    navigate(1);
                } else {
                    // Swipe right - prev
                    navigate(-1);
                }
            }
        }

        // ========================================
        // Lightbox Filter Handler
        // ========================================
        function handleLightboxFilter(btn) {
            const filter = btn.getAttribute('data-filter');

            // Update active button
            lightboxFilterBtns.forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            // Remove all filter classes
            lightboxImage.classList.remove('filter-grayscale', 'filter-sepia', 'filter-blur', 'filter-saturate');

            // Add new filter
            if (filter !== 'none') {
                lightboxImage.classList.add('filter-' + filter);
            }
        }

        // ========================================
        // Start the Gallery
        // ========================================
        init();

    });

})();
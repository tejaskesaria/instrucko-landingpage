
const { animate, inView, stagger } = Motion;

$(document).ready(function () {
    console.log("DOM loaded. Motion.dev is initialized.");

    /* =========================================
       STICKY HEADER SHADOW LOGIC
       ========================================= */
    $(window).scroll(function () {
        // If the user scrolls down more than 50 pixels, add the shadow
        if ($(window).scrollTop() > 50) {
            $('#site-header').addClass('scrolled');
        } else {
            // If they scroll back to the very top, remove the shadow
            $('#site-header').removeClass('scrolled');
        }
    });

    /* =========================================
       HERO / BANNER ANIMATIONS
       ========================================= */
    /* =========================================
        HERO / BANNER ANIMATIONS
        ========================================= */
    inView(".hero-section", () => {
        // 1. Animate the left column (Text and Form)
        animate(
            ".hero-text-col",
            { opacity: [0, 1], y: [40, 0], visibility: "visible" },
            { duration: 0.8, easing: "ease-out" }
        );

        // 2. Animate the right column (Main Kids Image)
        animate(
            ".hero-image-col",
            { opacity: [0, 1], scale: [0.95, 1], visibility: "visible" },
            { duration: 0.8, delay: 0.3, easing: "ease-out" }
        );

        // 3. Animate the floating pills (badges) with a staggered spring effect
        animate(
            ".floating-badge",
            // Starts hidden and slightly smaller, then fades and pops to full size
            { opacity: [0, 1], scale: [0.8, 1], y: [20, 0], visibility: "visible" },
            // Staggers each pill by 0.2 seconds, starting 0.8 seconds into the timeline
            { delay: stagger(0.2, { start: 0.8 }), duration: 0.6, easing: "spring" }
        );
    });

    /* =========================================
       FOOTER ANIMATION
       ========================================= */
    inView(".site-footer", () => {
        animate(
            ".site-footer",
            // We add visibility: "visible" so it clears the CSS hidden state
            { opacity: [0, 1], visibility: "visible" },
            { duration: 1, easing: "ease-in-out" }
        );
    });

    /* =========================================
       FORM VALIDATION LOGIC
       ========================================= */
 
    const $phoneInput = $('#phone-input');
    const $phoneError = $('#phone-error');
    const indianPhoneRegex = /^[6-9]\d{9}$/;

    // 1. Real-time formatting: Only allow numbers
    $phoneInput.on('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        $phoneError.addClass('d-none');
        $(this).removeClass('is-invalid');
    });

    // 2. Strict Regex check when they click away from the input (blur)
    $phoneInput.on('blur', function () {
        const phoneVal = $(this).val();
        if (phoneVal.length > 0 && !indianPhoneRegex.test(phoneVal)) {
            $(this).addClass('is-invalid'); 
            $phoneError.removeClass('d-none'); 
        } else {
            $(this).removeClass('is-invalid');
            $phoneError.addClass('d-none');
        }
    });

    // 3. Intercept form submission, validate, THEN open Razorpay
    $('#enrollmentForm').on('submit', function (e) {
        e.preventDefault(); // Stop standard page refresh

        const phoneVal = $phoneInput.val();

        // Final regex check before proceeding
        if (!indianPhoneRegex.test(phoneVal)) {
            $phoneInput.addClass('is-invalid');
            $phoneError.removeClass('d-none');
            return; // STOP execution here if phone is invalid
        } 
        
        // --- VALIDATION PASSED! START PAYMENT FLOW ---

        // Disable the submit button
        const $submitBtn = $('#submitBtn');
        $submitBtn.prop('disabled', true).text("Booking your trial...");

        // Gather your specific form data
        const formData = {
            name: $('#childName').val(),
            age: $('#ageGroup').val(),
            course: $('#courseName').val(),
            phone: phoneVal
        };

        // Call your Google Apps Script Web App
        const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyc5zMIQAyZMDNLq8Pf5Au1bJSmrHmOTsBvueVxKenFkqhGB6Zhg2o7VUBHcFTMQ9P6/exec";

        fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        })
        .then(response => response.json())
        .then(data => {
            
            // Open Razorpay using the secure order_id
                const options = {
                    "key": "rzp_live_btaUUqSVseVxmU",  
                    "amount": "34900", // ₹349 in paise
                    "currency": "INR",
                    "name": "Instrucko",
                    "description": formData.course + " Registration",
                    "order_id": data.order_id, 
                    
                    // 1. TRIGGER ON SUCCESS
                    "handler": function (response) {
                        // The payment was successful. Redirect immediately.
                        window.location.href = "thank-you.html";
                    },
                    
                    "prefill": {
                        "name": formData.name,
                        "contact": formData.phone
                    },
                    "theme": {
                        "color": "#004ADE" 
                    },
                    
                    // 2. TRIGGER ON POP-UP CLOSE
                    "modal": {
                        "ondismiss": function() {
                            // The user closed the window without paying, or after a failure.
                            // The data is already in Google Sheets as "Pending Payment".
                            window.location.href = "thank-you.html";
                        }
                    }
                };
                
                const rzp = new Razorpay(options);
                
                // We handle failure silently in the console so Razorpay's 
                // built-in retry UI can do its job.
                rzp.on('payment.failed', function (response){
                    console.log("Payment Failed: " + response.error.description);
                });
                
                rzp.open();
        })
        .catch(error => console.error("Error:", error))
        .finally(() => {
            // Re-enable the button if they close the pop-up without paying
            $submitBtn.prop('disabled', false).text("Submit");
        });
    });


    // SECTION 2

    /* =========================================
       FEATURES / SWIPER SECTION
       ========================================= */

    // 1. Initialize Swiper
    const featuresSwiper = new Swiper('.features-swiper', {
        slidesPerView: 1, // Mobile default
        spaceBetween: 20,
        centerMode: false,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        // Breakpoints for larger screens
        breakpoints: {
            // Tablet
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            // Desktop (Locks it into a 3-column grid, disables swiping)
            992: {
                slidesPerView: 3,
                spaceBetween: 30,
                allowTouchMove: false, // Disables mouse/touch dragging on desktop
            }
        }
    });

    // 3. Scroll Reveal Animations
    inView(".features-section", () => {
        // Reveal Header
        animate(
            ".section-header-reveal",
            { opacity: [0, 1], y: [30, 0], visibility: "visible" },
            { duration: 0.6, easing: "ease-out" }
        );

        // Deal out the 3 cards
        animate(
            ".feature-card",
            { opacity: [0, 1], y: [50, 0], visibility: "visible" },
            { delay: stagger(0.2, { start: 0.3 }), duration: 0.7, easing: "spring" }
        );
    });

    /* =========================================
       TEACHERS SWIPER
       ========================================= */
    const teachersSwiper = new Swiper('.teachers-swiper', {
        slidesPerView: 1, // Mobile shows 1 teacher at a time
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: '.teachers-swiper .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.teachers-swiper .swiper-button-next',
            prevEl: '.teachers-swiper .swiper-button-prev',
        },
        breakpoints: {
            // Tablet & Desktop view (shows 2 teachers side-by-side)
            768: {
                slidesPerView: 2,
                spaceBetween: 40,
            }
        }
    });

    /* =========================================
       TEACHERS SECTION ANIMATION
       ========================================= */
    inView(".teachers-section", () => {
        // Smooth slide-up fade strictly for the heading block
        animate(
            ".teacher-header-reveal",
            { opacity: [0, 1], y: [30, 0], visibility: "visible" },
            { duration: 0.8, easing: "ease-out" }
        );
    });

    inView(".schools-section", () => {
        animate(
            ".school-feature-item",
            { opacity: [0, 1], y: [20, 0], visibility: "visible" },
            { delay: stagger(0.15), duration: 0.6, easing: "ease-out" }
        );
    }, { amount: 0.2 });


    /* =========================================
       TESTIMONIALS SWIPER & ANIMATION (SMOOTH FIX)
       ========================================= */
    /* =========================================
       TESTIMONIALS SWIPER (SMOOTH NATIVE SCALING)
       ========================================= */
    const testimonialsSwiper = new Swiper('.testimonials-swiper', {
        loop: true,
        speed: 1000, // Smooth glide speed
        slidesPerView: 1, 
        spaceBetween: 20,
        infinite: true,
        pagination: {
            el: '.testimonials-swiper .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next.testimonial-arrow-custom',
            prevEl: '.swiper-button-prev.testimonial-arrow-custom',
        },
        breakpoints: {
            768: {
                slidesPerView: 2, // 1 full card + 50% peek of the next
                spaceBetween: 30,
            },
            1200: {
                slidesPerView: 2, // 1 full card, 50% peek of the next
                spaceBetween: 40,
            }
        },
        on: {
            // This runs continuously as you drag your cursor/finger
            progress: function (swiper) {
                for (let i = 0; i < swiper.slides.length; i++) {
                    const slide = swiper.slides[i];
                    const slideProgress = slide.progress;
                    const innerCard = slide.querySelector('.review-card');
                    
                    if (innerCard) {
                        // Math: active slide is 0. Next slide is 1. Prev is -1.
                        // Shrinks the inactive cards to 85% and fades them to 40% opacity
                        const scale = 1 - Math.min(Math.abs(slideProgress * 0.15), 0.15); 
                        const opacity = 1 - Math.min(Math.abs(slideProgress * 0.6), 0.6); 
                        
                        innerCard.style.transform = `scale(${scale})`;
                        innerCard.style.transformOrigin = 'center left'; // Keeps gap consistent
                        innerCard.style.opacity = opacity;
                        
                        // Turns off CSS transition so it perfectly tracks the drag without lagging
                        innerCard.style.transition = 'none'; 
                    }
                }
            },
            // This runs when you let go, letting it snap into place smoothly
            setTransition: function (swiper, speed) {
                for (let i = 0; i < swiper.slides.length; i++) {
                    const slide = swiper.slides[i];
                    const innerCard = slide.querySelector('.review-card');
                    if (innerCard) {
                        innerCard.style.transition = `all ${speed}ms ease-out`;
                    }
                }
            }
        }
    });

   /* =========================================
       TESTIMONIALS SECTION ANIMATIONS (FIXED)
       ========================================= */
    inView(".testimonials-section", () => {
        
        // 1. Reveal the entire left column (Quote, Text, Arrows)
        // Removed the "> *" so we animate the parent wrapper that actually holds the motion-hidden class
        animate(
            ".testimonail-header-reveal", 
            { opacity: [0, 1], y: [20, 0], visibility: "visible" },
            { duration: 0.8, easing: "ease-out" }
        );

        // 2. Slide the review cards in from the right
        animate(
            ".testimonial-slider-reveal",
            { opacity: [0, 1], x: [40, 0], visibility: "visible" },
            { delay: 0.3, duration: 0.8, easing: "ease-out" }
        );
        
    }, { amount: 0.2 }); // Lowered to 20% visibility to ensure it triggers perfectly on all screens

    /* =========================================
       PARTNERS SWIPER & ANIMATION
       ========================================= */
    const partnersSwiper = new Swiper('.partners-swiper', {
        loop: true,
        speed: 800,
        autoplay: {
            delay: 2500, // Auto-scrolls every 2.5 seconds
            disableOnInteraction: false, // Keeps playing after user swipes
        },
        pagination: {
            el: '.partners-swiper .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next.partner-nav-arrow',
            prevEl: '.swiper-button-prev.partner-nav-arrow',
        },
        breakpoints: {
            // Mobile (Phones)
            0: {
                slidesPerView: 3,
                spaceBetween: 20,
            },
            // Large Phones / Small Tablets
            576: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            // Tablets
            768: {
                slidesPerView: 4,
                spaceBetween: 40,
            },
            // Desktops
            992: {
                slidesPerView: 5,
                spaceBetween: 50,
            },
            // Large Desktops
            1200: {
                slidesPerView: 6,
                spaceBetween: 50,
            }
        }
    });

    inView(".partners-section", () => {
        // Drop-in fade for the header
        animate(
            ".partner-header-reveal", 
            { opacity: [0, 1], y: [20, 0], visibility: "visible" },
            { duration: 0.6, easing: "ease-out" }
        );

        // Gentle fade up for the logos row
        animate(
            ".partner-slider-reveal",
            { opacity: [0, 1], y: [30, 0], visibility: "visible" },
            { delay: 0.3, duration: 0.8, easing: "ease-out" }
        );
    }, { amount: 0.4 });


    /* =========================================
       LIVE CLASSES SWIPER (DESKTOP ONLY)
       ========================================= */
    const liveClassesSwiper = new Swiper('.live-classes-swiper', {
        slidesPerView: 2,
        spaceBetween: 30,
        grabCursor: true,
        navigation: {
            nextEl: '.swiper-button-next.classes-next',
            prevEl: '.swiper-button-prev.classes-prev',
        },
        breakpoints: {
            768: {
                slidesPerView: 1,
                spaceBetween: 30,
            },
            1000: {
                slidesPerView: 2,
                spaceBetween: 40,
            }
        }
    });

    /* =========================================
       LIVE CLASSES SECTION ANIMATIONS
       ========================================= */
    inView(".live-classes-section", () => {
        // 1. Reveal Header
        animate(
            ".classes-header-reveal", 
            { opacity: [0, 1], y: [20, 0], visibility: "visible" },
            { duration: 0.6, easing: "ease-out" }
        );

        // 2. Reveal Desktop Slider (If visible)
        if (window.innerWidth >= 768) {
            animate(
                ".classes-desktop-reveal",
                { opacity: [0, 1], y: [40, 0], visibility: "visible" },
                { delay: 0.3, duration: 0.8, easing: "ease-out" }
            );
        }

        // 3. Staggered Grid Reveal for Mobile (If visible)
        if (window.innerWidth < 768) {
            animate(
                ".classes-mobile-reveal",
                { opacity: [0, 1], visibility: "visible" },
                { delay: 0.2, duration: 0.1 }
            );
            
            // Cascades the mobile grid boxes in nicely
            animate(
                ".mobile-grid-item",
                { opacity: [0, 1], scale: [0.9, 1], visibility: "visible" },
                { delay: stagger(0.1), duration: 0.5, easing: "ease-out" }
            );
        }
    }, { amount: 0.2 });
});
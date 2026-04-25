// Sliding nav underline — moves to hovered link, shows under current by default
(function () {
    var navUnderline = document.getElementById('nav-link-underline');
    if (!navUnderline) return;
    var container = navUnderline.closest('.nav-links');
    if (!container) return;
    var pageLinks = container.querySelectorAll('a:not(.nav-btn)');
    function positionUnderline(link) {
        var cr = container.getBoundingClientRect();
        var lr = link.getBoundingClientRect();
        var left = lr.left - cr.left;
        var width = Math.max(lr.width, 20);
        navUnderline.style.left = left + 'px';
        navUnderline.style.width = width + 'px';
    }
    function underlineUnderCurrent() {
        var current = container.querySelector('a.current');
        if (current) {
            positionUnderline(current);
        } else if (pageLinks.length) {
            positionUnderline(pageLinks[0]);
        }
    }
    function init() {
        underlineUnderCurrent();
        for (var i = 0; i < pageLinks.length; i++) {
            pageLinks[i].addEventListener('mouseenter', function () {
                positionUnderline(this);
            });
        }
        container.addEventListener('mouseleave', underlineUnderCurrent);
        window.addEventListener('resize', underlineUnderCurrent);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    window.addEventListener('load', underlineUnderCurrent);
})();

// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function toggleMenu() {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

hamburger.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

// Close sidebar when clicking close button
const sidebarClose = document.getElementById('sidebar-close');
if (sidebarClose) {
    sidebarClose.addEventListener('click', toggleMenu);
}

// Close sidebar when clicking on links
const sidebarLinks = sidebar.querySelectorAll('a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Fundraising popup — show after short delay, once per session
const fundraiseOverlay = document.getElementById('fundraise-popup-overlay');
const fundraiseClose = document.getElementById('fundraise-popup-close');
if (fundraiseOverlay && fundraiseClose) {
    if (!sessionStorage.getItem('fundraise-popup-seen')) {
        setTimeout(function () {
            fundraiseOverlay.classList.add('is-visible');
            fundraiseOverlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }, 800);
    }
    function closeFundraisePopup() {
        fundraiseOverlay.classList.remove('is-visible');
        fundraiseOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        sessionStorage.setItem('fundraise-popup-seen', '1');
    }
    fundraiseClose.addEventListener('click', closeFundraisePopup);
    fundraiseOverlay.addEventListener('click', function (e) {
        if (e.target === fundraiseOverlay) closeFundraisePopup();
    });
}

/* Yard sign / donate popup (home page) - commented out
const yardsignPopupOverlay = document.getElementById('yardsign-popup-overlay');
const yardsignPopupClose = document.getElementById('yardsign-popup-close');
if (yardsignPopupOverlay && yardsignPopupClose) {
    if (!sessionStorage.getItem('yardsign-popup-seen')) {
        setTimeout(function () {
            yardsignPopupOverlay.classList.add('is-visible');
            yardsignPopupOverlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }, 600);
    }
    function closeYardsignPopup() {
        yardsignPopupOverlay.classList.remove('is-visible');
        yardsignPopupOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        sessionStorage.setItem('yardsign-popup-seen', '1');
    }
    yardsignPopupClose.addEventListener('click', closeYardsignPopup);
    yardsignPopupOverlay.addEventListener('click', function (e) {
        if (e.target === yardsignPopupOverlay) closeYardsignPopup();
    });
}
*/

/* Get the Facts popup — commented out
(function () {
    var overlay = document.getElementById('facts-popup-overlay');
    var closeBtn = document.getElementById('facts-popup-close');
    if (!overlay || !closeBtn) return;

    function close() {
        overlay.classList.remove('is-visible');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        sessionStorage.setItem('facts-popup-seen', '1');
    }

    if (!sessionStorage.getItem('facts-popup-seen')) {
        setTimeout(function () {
            overlay.classList.add('is-visible');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }, 1200);
    }

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('is-visible')) close();
    });
})();
*/

// Countdown to end of April 30, 2026 Pacific (May 1, 2026 00:00 PDT = May 1, 2026 07:00 UTC)
const countdownEl = document.getElementById('fundraise-countdown');
if (countdownEl) {
    var matchEndUtc = Date.UTC(2026, 4, 1, 7, 0, 0); // after April 30 PT (PDT = UTC-7)

    function updateCountdown() {
        var now = Date.now();
        var diff = matchEndUtc - now;
        if (diff <= 0) {
            countdownEl.textContent = 'Match ended';
            return;
        }
        var days = Math.floor(diff / 86400000);
        var hours = Math.floor((diff % 86400000) / 3600000);
        var mins = Math.floor((diff % 3600000) / 60000);
        var secs = Math.floor((diff % 60000) / 1000);
        countdownEl.textContent = days + 'd ' + hours + 'h ' + mins + 'm ' + secs + 's';
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// The City's Plan — horizontal video carousel (mixed slide widths)
(function () {
    var scrollEl = document.getElementById('city-plan-videos-scroll');
    var nextBtn = document.getElementById('city-plan-videos-next');
    var dotsEl = document.getElementById('city-plan-video-dots');
    var dotsWrapEl = document.getElementById('city-plan-video-dots-wrap');
    var stageEl = document.getElementById('city-plan-videos-stage');
    var controlsEl = document.getElementById('city-plan-video-controls');
    if (!scrollEl || !nextBtn) return;

    var navRaf = null;
    var pulseStorageKey = 'ec-home-carousel-next-pulse';

    function getSlides() {
        return scrollEl.querySelectorAll('.city-plan-video-slide');
    }

    function getClosestSlideIndex() {
        var slides = getSlides();
        if (!slides.length) return 0;
        var cre = scrollEl.getBoundingClientRect();
        var centerX = cre.left + cre.width / 2;
        var best = 0;
        var bestDist = Infinity;
        for (var i = 0; i < slides.length; i++) {
            var r = slides[i].getBoundingClientRect();
            var cx = r.left + r.width / 2;
            var d = Math.abs(cx - centerX);
            if (d < bestDist) {
                bestDist = d;
                best = i;
            }
        }
        return best;
    }

    function scrollToAdjacent(direction) {
        var slides = getSlides();
        if (!slides.length) return;
        var best = getClosestSlideIndex();
        var next = Math.max(0, Math.min(slides.length - 1, best + direction));
        slides[next].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }

    function scrollToSlide(index) {
        var slides = getSlides();
        if (!slides.length) return;
        var i = Math.max(0, Math.min(slides.length - 1, index));
        slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }

    /** Align Next chevron with the vertical center of the active video (landscape or portrait). */
    function syncNavPosition() {
        if (!controlsEl) return;
        var stripEl = controlsEl.closest('.city-plan-videos-strip');
        if (!stripEl) return;
        var slides = getSlides();
        if (!slides.length) return;
        var active = getClosestSlideIndex();
        var slide = slides[active];
        var inner = slide.querySelector('.city-plan-video-inner');
        if (!inner) return;
        var stripRect = stripEl.getBoundingClientRect();
        var vr = inner.getBoundingClientRect();
        var h = controlsEl.offsetHeight;
        var mt = vr.top + vr.height / 2 - stripRect.top - h / 2;
        if (mt < 0) {
            mt = 0;
        }
        controlsEl.style.marginTop = Math.round(mt) + 'px';
    }

    /** Place dot row directly under the active video, horizontally centered in that band; reserve stage padding when needed. */
    function syncDotsPosition() {
        if (!stageEl || !dotsWrapEl) return;
        var stripEl = scrollEl.closest('.city-plan-videos-strip');
        if (!stripEl) return;
        if (dotsWrapEl.hidden || !dotsEl || dotsEl.hidden) {
            dotsWrapEl.style.left = '';
            dotsWrapEl.style.top = '';
            dotsWrapEl.style.width = '';
            stageEl.style.setProperty('padding-bottom', '0', 'important');
            return;
        }
        var slides = getSlides();
        if (!slides.length) return;
        var active = getClosestSlideIndex();
        var slide = slides[active];
        var inner = slide.querySelector('.city-plan-video-inner');
        if (!inner) return;
        var stageRect = stageEl.getBoundingClientRect();
        var vr = inner.getBoundingClientRect();
        var gap = 8;
        dotsWrapEl.style.left = Math.round(vr.left - stageRect.left) + 'px';
        dotsWrapEl.style.width = Math.round(vr.width) + 'px';
        dotsWrapEl.style.top = Math.round(vr.bottom - stageRect.top + gap) + 'px';
        var pad = Math.ceil(dotsWrapEl.getBoundingClientRect().bottom - stripEl.getBoundingClientRect().bottom);
        if (pad < 0) {
            pad = 0;
        }
        stageEl.style.setProperty('padding-bottom', (pad + 10) + 'px', 'important');
    }

    function syncDots() {
        if (!dotsEl) return;
        var dots = dotsEl.querySelectorAll('.city-plan-video-dot');
        if (!dots.length) return;
        var active = getClosestSlideIndex();
        for (var j = 0; j < dots.length; j++) {
            dots[j].classList.toggle('is-active', j === active);
            if (j === active) {
                dots[j].setAttribute('aria-current', 'true');
            } else {
                dots[j].removeAttribute('aria-current');
            }
        }
    }

    function syncCarouselChrome() {
        syncNavPosition();
        syncDotsPosition();
        syncDots();
    }

    function scheduleCarouselSync() {
        if (navRaf !== null) return;
        navRaf = requestAnimationFrame(function () {
            navRaf = null;
            syncCarouselChrome();
        });
    }

    function buildDots() {
        if (!dotsEl) return;
        dotsEl.innerHTML = '';
        var slides = getSlides();
        var n = slides.length;
        if (n <= 1) {
            dotsEl.hidden = true;
            if (dotsWrapEl) {
                dotsWrapEl.hidden = true;
            }
            if (stageEl) {
                stageEl.style.setProperty('padding-bottom', '0', 'important');
            }
            scheduleCarouselSync();
            return;
        }
        dotsEl.hidden = false;
        if (dotsWrapEl) {
            dotsWrapEl.hidden = false;
        }
        for (var i = 0; i < n; i++) {
            (function (idx) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'city-plan-video-dot';
                dot.setAttribute('aria-label', 'Go to video ' + (idx + 1) + ' of ' + n);
                dot.addEventListener('click', function () {
                    scrollToSlide(idx);
                });
                dotsEl.appendChild(dot);
            })(i);
        }
        scheduleCarouselSync();
    }

    function bindPosterResize() {
        var imgs = scrollEl.querySelectorAll('.city-plan-video-slide img');
        for (var i = 0; i < imgs.length; i++) {
            imgs[i].addEventListener('load', scheduleCarouselSync);
        }
    }

    nextBtn.addEventListener('click', function () {
        scrollToAdjacent(1);
    });

    function setupFirstViewChevronPulse() {
        if (!stageEl) return;
        function markPulseDone() {
            nextBtn.classList.remove('is-pulse-intro');
            try {
                localStorage.setItem(pulseStorageKey, '1');
            } catch (e) {
                /* ignore */
            }
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            try {
                localStorage.setItem(pulseStorageKey, '1');
            } catch (e2) {
                /* ignore */
            }
            return;
        }
        try {
            if (localStorage.getItem(pulseStorageKey)) return;
        } catch (e3) {
            return;
        }
        var chevron = nextBtn.querySelector('.city-plan-video-nav-chevron');
        var fallbackTimer = null;
        var obs = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (en) {
                    if (!en.isIntersecting || en.intersectionRatio < 0.15) return;
                    obs.disconnect();
                    nextBtn.classList.add('is-pulse-intro');
                    var settled = false;
                    var finish = function () {
                        if (settled) return;
                        settled = true;
                        if (fallbackTimer !== null) {
                            clearTimeout(fallbackTimer);
                            fallbackTimer = null;
                        }
                        markPulseDone();
                    };
                    if (chevron) {
                        chevron.addEventListener('animationend', finish, { once: true });
                        fallbackTimer = setTimeout(finish, 4000);
                    } else {
                        finish();
                    }
                });
            },
            { threshold: [0, 0.15, 0.35] }
        );
        obs.observe(stageEl);
    }

    buildDots();
    setupFirstViewChevronPulse();
    bindPosterResize();
    scrollEl.addEventListener('scroll', scheduleCarouselSync, { passive: true });
    window.addEventListener('resize', scheduleCarouselSync);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleCarouselSync);
    } else {
        scheduleCarouselSync();
    }
    window.addEventListener('load', scheduleCarouselSync);
})();

// Upcoming events: show “scroll for more” hint until bottom (or hide if no overflow); hint click scrolls down
(function () {
    var wrap = document.getElementById('events-table-scroll-wrap');
    var scrollEl = wrap && wrap.querySelector('.events-table-scroll');
    var hintBtn = document.getElementById('events-table-scroll-hint');
    if (!wrap || !scrollEl) return;

    function sync() {
        var overflow = scrollEl.scrollHeight > scrollEl.clientHeight + 2;
        wrap.classList.toggle('no-overflow', !overflow);
        if (!overflow) return;
        var atEnd = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 3;
        wrap.classList.toggle('is-at-end', atEnd);
    }

    function scrollHintDown() {
        var remaining = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
        if (remaining <= 1) return;
        var step = Math.min(scrollEl.clientHeight * 0.7, remaining);
        scrollEl.scrollBy({ top: step, behavior: 'smooth' });
    }

    if (hintBtn) {
        hintBtn.addEventListener('click', function (e) {
            e.preventDefault();
            scrollHintDown();
        });
    }

    scrollEl.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sync);
    } else {
        sync();
    }
    window.addEventListener('load', sync);
})();

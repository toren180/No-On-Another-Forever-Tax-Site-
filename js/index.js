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

// Yard sign / donate popup (home page)
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

// Countdown to Midnight Feb 7, 2026 Pacific Time (PST = UTC-8 → 08:00 UTC Feb 7)
const countdownEl = document.getElementById('fundraise-countdown');
if (countdownEl) {
    var matchEndUtc = Date.UTC(2026, 1, 7, 8, 0, 0); // Feb 7, 2026 08:00 UTC = midnight PST

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

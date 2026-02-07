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

// Fundraising popup — commented out so it no longer appears on home page
// const fundraiseOverlay = document.getElementById('fundraise-popup-overlay');
// const fundraiseClose = document.getElementById('fundraise-popup-close');
// if (fundraiseOverlay && fundraiseClose) {
//     if (!sessionStorage.getItem('fundraise-popup-seen')) {
//         setTimeout(function () {
//             fundraiseOverlay.classList.add('is-visible');
//             document.body.style.overflow = 'hidden';
//         }, 800);
//     }
//     function closeFundraisePopup() {
//         fundraiseOverlay.classList.remove('is-visible');
//         document.body.style.overflow = '';
//         sessionStorage.setItem('fundraise-popup-seen', '1');
//     }
//     fundraiseClose.addEventListener('click', closeFundraisePopup);
//     fundraiseOverlay.addEventListener('click', function (e) {
//         if (e.target === fundraiseOverlay) closeFundraisePopup();
//     });
// }

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

// Sliding nav underline — moves to hovered link
(function () {
    var navUnderline = document.getElementById('nav-link-underline');
    if (!navUnderline) return;
    var container = navUnderline.closest('.nav-links');
    if (!container) return;
    var pageLinks = container.querySelectorAll('a:not(.nav-btn)');
    function positionUnderline(link) {
        var cr = container.getBoundingClientRect();
        var lr = link.getBoundingClientRect();
        navUnderline.style.left = (lr.left - cr.left) + 'px';
        navUnderline.style.width = lr.width + 'px';
    }
    function underlineUnderCurrent() {
        var current = container.querySelector('a.current');
        if (current) positionUnderline(current);
    }
    underlineUnderCurrent();
    for (var i = 0; i < pageLinks.length; i++) {
        pageLinks[i].addEventListener('mouseenter', function () {
            positionUnderline(this);
        });
    }
    container.addEventListener('mouseleave', underlineUnderCurrent);
    window.addEventListener('resize', underlineUnderCurrent);
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

/**
 * Loads YouTube iframe on first click so the default embed title overlay
 * does not show on the thumbnail (YouTube removed the showinfo parameter).
 */
(function () {
    function loadVideo(btn) {
        var wrap = btn.closest('.youtube-clickplay');
        if (!wrap) return;
        var frame = wrap.querySelector('.youtube-clickplay-frame');
        if (!frame || frame.dataset.loaded === '1') return;
        var embedBase = frame.getAttribute('data-embed-src');
        if (!embedBase) return;
        frame.dataset.loaded = '1';
        var sep = embedBase.indexOf('?') >= 0 ? '&' : '?';
        frame.src = embedBase + sep + 'autoplay=1&modestbranding=1&rel=0';
        frame.removeAttribute('hidden');
        btn.setAttribute('hidden', '');
    }

    function init() {
        document.querySelectorAll('.youtube-clickplay-poster').forEach(function (btn) {
            btn.addEventListener('click', function () {
                loadVideo(btn);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

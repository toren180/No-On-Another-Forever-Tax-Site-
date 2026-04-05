/* global document, window */
(function () {
    var PLACEHOLDER = 'Select options…';

    function optionLabel(cb) {
        var lab = cb.closest('label');
        if (!lab) {
            return cb.value;
        }
        var t = (lab.textContent || '').replace(/\s+/g, ' ').trim();
        return t || cb.value;
    }

    function formatDisplay(labels) {
        if (!labels.length) {
            return PLACEHOLDER;
        }
        var joined = labels.join(', ');
        if (joined.length <= 52) {
            return joined;
        }
        return String(labels.length) + ' selected';
    }

    function init(root) {
        var trigger = root.querySelector('.volunteer-multiselect-trigger');
        var panel = root.querySelector('.volunteer-multiselect-panel');
        var textEl = root.querySelector('.volunteer-multiselect-trigger-text');
        var form = root.closest('form');
        var checkboxes = root.querySelectorAll('input[type="checkbox"][name="volunteer_interest"]');

        if (!trigger || !panel || !textEl || !form || !checkboxes.length) {
            return;
        }

        var docMousedown = null;
        var docKeydown = null;

        function updateTrigger() {
            var labels = [];
            for (var i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    labels.push(optionLabel(checkboxes[i]));
                }
            }
            var display = formatDisplay(labels);
            textEl.textContent = display;
            var a11y =
                labels.length === 0
                    ? 'Volunteer interests. Nothing selected.'
                    : 'Volunteer interests. ' + labels.join(', ') + ' selected.';
            trigger.setAttribute('aria-label', a11y);
        }

        function detachDocListeners() {
            if (docMousedown) {
                document.removeEventListener('mousedown', docMousedown, true);
                document.removeEventListener('touchstart', docMousedown, true);
                docMousedown = null;
            }
            if (docKeydown) {
                document.removeEventListener('keydown', docKeydown, true);
                docKeydown = null;
            }
        }

        function close() {
            if (panel.hasAttribute('hidden')) {
                return;
            }
            panel.setAttribute('hidden', 'hidden');
            root.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            detachDocListeners();
        }

        function open() {
            panel.removeAttribute('hidden');
            root.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');

            docMousedown = function (ev) {
                if (!root.contains(ev.target)) {
                    close();
                }
            };
            document.addEventListener('mousedown', docMousedown, true);
            document.addEventListener('touchstart', docMousedown, true);

            docKeydown = function (ev) {
                if (ev.key === 'Escape') {
                    ev.preventDefault();
                    close();
                    trigger.focus();
                }
            };
            document.addEventListener('keydown', docKeydown, true);
        }

        function toggle() {
            if (panel.hasAttribute('hidden')) {
                open();
            } else {
                close();
            }
        }

        trigger.addEventListener('click', function (ev) {
            ev.preventDefault();
            toggle();
        });

        for (var c = 0; c < checkboxes.length; c++) {
            checkboxes[c].addEventListener('change', updateTrigger);
        }

        form.addEventListener('reset', function () {
            window.setTimeout(updateTrigger, 0);
        });

        updateTrigger();
    }

    function boot() {
        var nodes = document.querySelectorAll('[data-volunteer-multiselect]');
        for (var i = 0; i < nodes.length; i++) {
            init(nodes[i]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

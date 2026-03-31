/* global window, document, FormData, fetch */
(function () {
    var MAX_LEN = { first_name: 80, last_name: 80, email: 254, phone: 40, volunteer_interest: 80, company: 200 };
    var ALLOWED_INTEREST = {
        '': true,
        Tabling: true,
        'Flyer Distribution': true,
        Canvassing: true,
        'Help Behind The Scenes': true
    };
    var ALLOWED_FORM = { supporter: true, volunteer: true };

    function getConfig() {
        return window.SHEET_FORM_CONFIG || {};
    }

    function isConfigured() {
        var u = (getConfig().webAppUrl || '').trim();
        return u.length > 0 && u.indexOf('YOUR_DEPLOYMENT_ID') === -1 && u.indexOf('PASTE_') === -1;
    }

    function trimField(str, max) {
        var s = str == null ? '' : String(str);
        s = s.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        if (s.length > max) {
            s = s.substring(0, max);
        }
        return s;
    }

    function validEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function setStatus(form, kind, message) {
        var el = form.querySelector('[data-form-status]');
        if (!el) {
            return;
        }
        el.textContent = message || '';
        el.className = 'form-sheet-status' + (kind ? ' form-sheet-status--' + kind : '');
        if (message) {
            el.removeAttribute('hidden');
        } else {
            el.setAttribute('hidden', 'hidden');
        }
    }

    function gatherFields(form) {
        var fd = new FormData(form);
        var interest = trimField(fd.get('volunteer_interest'), MAX_LEN.volunteer_interest);
        if (!ALLOWED_INTEREST[interest]) {
            interest = '';
        }
        return {
            first_name: trimField(fd.get('first_name'), MAX_LEN.first_name),
            last_name: trimField(fd.get('last_name'), MAX_LEN.last_name),
            email: trimField(fd.get('email'), MAX_LEN.email).toLowerCase(),
            phone: trimField(fd.get('phone'), MAX_LEN.phone),
            volunteer_interest: interest,
            company: trimField(fd.get('company'), MAX_LEN.company)
        };
    }

    function submitPayload(url, jsonBody) {
        var init = {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: jsonBody,
            cache: 'no-store',
            referrerPolicy: 'no-referrer'
        };

        return fetch(url, Object.assign({ mode: 'cors' }, init))
            .then(function (res) {
                return res.text().then(function (text) {
                    var j;
                    try {
                        j = JSON.parse(text);
                    } catch (parseErr) {
                        var retry = new Error('retry');
                        retry._sheetFormRetryNoCors = true;
                        throw retry;
                    }
                    if (!j || typeof j !== 'object') {
                        var retry2 = new Error('retry');
                        retry2._sheetFormRetryNoCors = true;
                        throw retry2;
                    }
                    if (!j.ok) {
                        var rej = new Error(j.error || 'Submission was rejected');
                        rej._sheetFormServerRejected = true;
                        throw rej;
                    }
                    return { ok: true };
                });
            })
            .catch(function (err) {
                if (err && err._sheetFormServerRejected) {
                    return Promise.reject(err);
                }
                return fetch(url, Object.assign({ mode: 'no-cors' }, init)).then(function () {
                    return { ok: true, opaque: true };
                });
            });
    }

    function onSubmit(form, ev) {
        ev.preventDefault();

        if (!isConfigured()) {
            setStatus(form, 'error', 'This form is not configured yet. Please email NoOnAnotherForeverTax@gmail.com.');
            return;
        }

        var honey = form.querySelector('input[name="company"]');
        if (honey && honey.value) {
            setStatus(form, 'success', 'Thank you! We received your submission.');
            return;
        }

        if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
            return;
        }

        var data = gatherFields(form);
        if (!data.first_name || !data.last_name || !data.email) {
            setStatus(form, 'error', 'Please fill in all required fields.');
            return;
        }
        if (!validEmail(data.email)) {
            setStatus(form, 'error', 'Please enter a valid email address.');
            return;
        }

        var cfg = getConfig();
        var payload = {
            formType: form.getAttribute('data-sheet-form'),
            token: trimField(cfg.formSecret, 500),
            hp: data.company,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            volunteer_interest: data.volunteer_interest
        };

        var btn = form.querySelector('button[type="submit"]');
        if (btn) {
            btn.disabled = true;
        }
        setStatus(form, 'info', 'Sending…');

        submitPayload(cfg.webAppUrl.trim(), JSON.stringify(payload))
            .then(function () {
                setStatus(form, 'success', 'Thank you! Your information was submitted.');
                form.reset();
            })
            .catch(function (err) {
                var msg =
                    err && err.message
                        ? err.message
                        : 'Something went wrong. Please check your connection or email us.';
                setStatus(form, 'error', msg);
            })
            .then(function () {
                if (btn) {
                    btn.disabled = false;
                }
            });
    }

    function bindForm(form) {
        var ft = form.getAttribute('data-sheet-form');
        if (!ft || !ALLOWED_FORM[ft]) {
            return;
        }
        form.addEventListener('submit', function (ev) {
            onSubmit(form, ev);
        });
    }

    function init() {
        var forms = document.querySelectorAll('form[data-sheet-form]');
        for (var i = 0; i < forms.length; i++) {
            bindForm(forms[i]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

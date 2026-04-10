/**
 * Google Apps Script — append supporter / volunteer signups to a Sheet.
 *
 * SETUP (do once in the Apps Script editor):
 * 1. Create or open a Google Sheet. Extensions → Apps Script. Paste this file as Code.gs.
 * 2. Optional: Project Settings (gear) → Script properties → Add row
 *    Property: FORM_SECRET   Value: a long random string (e.g. openssl rand -hex 32)
 *    Put the SAME string in your site's js/form-config.js as formSecret.
 *    If FORM_SECRET is not set, the script accepts any caller who knows the Web App URL (weaker).
 * 3. Run once from the editor: select function setupSheetHeaders → Run (authorize when prompted).
 * 4. Deploy → New deployment → Type: Web app
 *    Execute as: Me
 *    Who has access: Anyone
 * 5. Copy the Web App URL into js/form-config.js as webAppUrl.
 *
 * Row 1 column order: Timestamp | Form | First name | Last name | Email | Phone | Address | Volunteer interest
 */
var SHEET_TAB_NAME = 'Form responses';

var HEADER_ROW = [
    'Timestamp',
    'Form',
    'First name',
    'Last name',
    'Email',
    'Phone',
    'Address',
    'Volunteer interest'
];

var ALLOWED_INTEREST = {
    '': true,
    'Tabling': true,
    'Flyer Distribution': true,
    'Canvassing': true,
    'Help Behind The Scenes': true
};

function setupSheetHeaders() {
    var sheet = getOrCreateSheet_();
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(HEADER_ROW);
    } else {
        var range = sheet.getRange(1, 1, 1, HEADER_ROW.length);
        var existing = range.getValues()[0];
        var empty = true;
        for (var c = 0; c < existing.length; c++) {
            if (String(existing[c]).trim() !== '') {
                empty = false;
                break;
            }
        }
        if (empty) {
            range.setValues([HEADER_ROW]);
        }
    }
}

function doPost(e) {
    try {
        if (!e || !e.postData || !e.postData.contents) {
            return jsonResponse_(false, 'No data');
        }
        var body;
        try {
            body = JSON.parse(e.postData.contents);
        } catch (parseErr) {
            return jsonResponse_(false, 'Invalid JSON');
        }
        if (!body || typeof body !== 'object') {
            return jsonResponse_(false, 'Invalid payload');
        }

        // Honeypot — bots often fill hidden fields; pretend success, do not write a row
        if (body.hp && String(body.hp).trim() !== '') {
            return jsonResponse_(true);
        }

        var props = PropertiesService.getScriptProperties();
        var secret = props.getProperty('FORM_SECRET');
        if (secret && String(secret).length > 0) {
            if (String(body.token || '') !== String(secret)) {
                return jsonResponse_(false, 'Unauthorized');
            }
        }

        var formType = String(body.formType || '');
        if (formType !== 'supporter' && formType !== 'volunteer') {
            return jsonResponse_(false, 'Invalid form');
        }

        var email = normalizeEmail_(body.email);
        if (!email || !isValidEmail_(email)) {
            return jsonResponse_(false, 'Invalid email');
        }

        var first = truncate_(body.first_name, 80);
        var last = truncate_(body.last_name, 80);
        if (!first || !last) {
            return jsonResponse_(false, 'Name required');
        }

        var rateKey = 'formrate_' + email.substring(0, 120);
        var cache = CacheService.getScriptCache();
        if (cache.get(rateKey)) {
            return jsonResponse_(false, 'Please wait a minute before submitting again');
        }
        cache.put(rateKey, '1', 60);

        var phone = truncate_(body.phone, 40);
        var address = truncate_(body.address, 500);
        if (!address) {
            return jsonResponse_(false, 'Address required');
        }
        var interest = normalizeInterest_(body.volunteer_interest, 200);

        var formLabel = formType === 'supporter' ? 'Become a supporter' : 'Volunteer interest';

        var lock = LockService.getScriptLock();
        lock.waitLock(20000);
        try {
            var sheet = getOrCreateSheet_();
            sheet.appendRow([
                new Date(),
                formLabel,
                first,
                last,
                email,
                phone,
                address,
                interest
            ]);
        } finally {
            lock.releaseLock();
        }

        return jsonResponse_(true);
    } catch (err) {
        return jsonResponse_(false, 'Server error');
    }
}

/** Optional: open the Web App URL in a browser to verify deployment. */
function doGet() {
    return ContentService.createTextOutput('Form endpoint is running. Use POST from the website.');
}

function getOrCreateSheet_() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_TAB_NAME);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_TAB_NAME);
    }
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(HEADER_ROW);
    }
    return sheet;
}

function jsonResponse_(ok, errMsg) {
    var o = { ok: !!ok };
    if (!ok && errMsg) {
        o.error = String(errMsg);
    }
    return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function truncate_(s, max) {
    var str = s == null ? '' : String(s);
    str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
    if (str.length > max) {
        str = str.substring(0, max);
    }
    return str;
}

function normalizeEmail_(e) {
    return truncate_(e, 254).toLowerCase();
}

function isValidEmail_(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

/**
 * Accepts a single interest or multiple values separated by "; " (from multi-select checkboxes).
 * Returns a validated, deduped string capped at maxTotalLen.
 */
function normalizeInterest_(v, maxTotalLen) {
    var cap = maxTotalLen != null ? maxTotalLen : 200;
    var s = v == null ? '' : String(v);
    s = truncate_(s, 500);
    var pieces = s.split(';');
    var seen = {};
    var out = [];
    for (var i = 0; i < pieces.length; i++) {
        var t = truncate_(pieces[i], 80).trim();
        if (!t || !ALLOWED_INTEREST[t] || seen[t]) {
            continue;
        }
        seen[t] = true;
        out.push(t);
    }
    var joined = out.join('; ');
    return truncate_(joined, cap);
}

/**
 * Google Sheet form endpoint (Apps Script Web App URL).
 * Get the URL from Apps Script: Deploy > Manage deployments > Web app.
 * Set formSecret to match Script property FORM_SECRET (Project Settings > Script properties).
 */
window.SHEET_FORM_CONFIG = {
    webAppUrl: 'https://script.google.com/macros/s/.../exec',
    formSecret: ''
};

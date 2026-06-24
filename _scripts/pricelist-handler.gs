// ============================================================
// SOLA Medical Supply — Price List Lead Capture
// Google Apps Script Web App
//
// SETUP (5 minutes):
// 1. Go to https://script.google.com → click "New project"
// 2. Delete the default code and paste this entire file
// 3. Replace SHEET_ID with your Google Sheet ID
//    → Open your Sheet → the ID is in the URL:
//       docs.google.com/spreadsheets/d/SHEET_ID/edit
// 4. Replace PDF_FILE_ID with the PDF file ID from Google Drive
//    → Right-click PDF → Share → Copy link → ID is between /d/ and /view
// 5. Click "Save" (Ctrl+S)
// 6. Click "Deploy" → "New deployment"
//    - Type: Web app
//    - Description: Price List Handler v1
//    - Execute as: Me (your Google account)
//    - Who has access: Anyone
//    - Click "Deploy" → Authorise when prompted
// 7. Copy the Web app URL → paste it into contact.html as SCRIPT_URL
// ============================================================

const CONFIG = {
  SHEET_ID:     'YOUR_GOOGLE_SHEET_ID',   // ← replace this
  PDF_FILE_ID:  'YOUR_PDF_FILE_ID',        // ← replace this
  SHEET_NAME:   'Price List Leads',
  SENDER_NAME:  'SOLA Medical Supply',
  EMAIL_SUBJECT:'SOLA Medical Supply — Your Wholesale Price List',
  TIMEZONE:     'Asia/Ho_Chi_Minh'
};

function doPost(e) {
  try {
    const raw  = e.postData ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    const name     = (data.name     || '').trim();
    const email    = (data.email    || '').trim();
    const whatsapp = (data.whatsapp || '').trim();
    const ts       = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

    // ── 1. Save lead to Google Sheet ───────────────────────────
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'WhatsApp']); // header row
    }
    sheet.appendRow([ts, name, email, whatsapp]);

    // ── 2. Email PDF to customer ───────────────────────────────
    if (email) {
      const pdfFile = DriveApp.getFileById(CONFIG.PDF_FILE_ID);
      const blob    = pdfFile.getBlob()
        .setName('SOLA Medical Supply - Wholesale Price List.pdf');

      MailApp.sendEmail({
        to:          email,
        name:        CONFIG.SENDER_NAME,
        subject:     CONFIG.EMAIL_SUBJECT,
        htmlBody:    buildEmail(name),
        attachments: [blob]
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log(err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handles GET requests — useful to test the deployment is live
function doGet() {
  return ContentService
    .createTextOutput('SOLA Price List Handler — running OK.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function buildEmail(name) {
  const greeting = name ? 'Dear <strong>' + name + '</strong>' : 'Dear Professional Buyer';
  return '<!DOCTYPE html>' +
'<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">' +

'<div style="border-bottom:3px solid #e84f8a;padding-bottom:20px;margin-bottom:28px">' +
  '<h2 style="margin:0;color:#571f38;font-size:22px">SOLA Medical Supply</h2>' +
  '<p style="margin:4px 0 0;color:#9b7a8c;font-size:13px">Professional Aesthetic Wholesale</p>' +
'</div>' +

'<p>' + greeting + ',</p>' +
'<p>Thank you for your interest in SOLA Medical Supply. Please find attached our <strong>complete wholesale price list</strong>.</p>' +

'<div style="background:#f6dfe9;border-radius:12px;padding:20px;margin:24px 0">' +
  '<p style="margin:0 0 10px;font-weight:700;color:#571f38">What\'s included:</p>' +
  '<ul style="margin:0;padding-left:20px;line-height:1.9;color:#571f38">' +
    '<li>190+ wholesale products</li>' +
    '<li>Dermal fillers, skin boosters, toxins, mesotherapy &amp; more</li>' +
    '<li>Organised by category and brand of origin</li>' +
    '<li>Leading brands: Juvederm, Rejuran, Sculptra, Profhilo, Restylane &amp; more</li>' +
  '</ul>' +
'</div>' +

'<p>To request a quotation or place an order, contact us directly:</p>' +
'<ul style="line-height:2.1">' +
  '<li><strong>WhatsApp:</strong> <a href="https://wa.me/84981778670" style="color:#e84f8a">+84 98 177 86 70</a></li>' +
  '<li><strong>Email:</strong> solamedicalsupply@gmail.com</li>' +
  '<li><strong>Website:</strong> <a href="https://www.solamedicalsupply.com" style="color:#e84f8a">solamedicalsupply.com</a></li>' +
'</ul>' +

'<p>We look forward to working with you.</p>' +
'<p>Best regards,<br><strong>SOLA Medical Supply</strong></p>' +

'<div style="margin-top:40px;padding-top:16px;border-top:1px solid #ead9e1;font-size:11px;color:#bbb">' +
  'Professional buyers only. Availability and pricing subject to change.' +
'</div>' +
'</body></html>';
}

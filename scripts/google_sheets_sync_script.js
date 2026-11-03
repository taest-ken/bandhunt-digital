/**
 * TAEST BANDHUNT - GOOGLE SHEETS LIVE SYNC SCRIPT
 * 
 * Setup Instructions (Takes 60 seconds):
 * 1. Open a new Google Sheet (e.g. "Bandhunt Registrations 2026").
 * 2. In row 1, add headers:
 *    A1: Timestamp | B1: Contact (Phone/Email) | C1: City | D1: Level Unlocked | E1: Category / Source | F1: Submitter
 * 3. In the Google Sheets top menu, click: Extensions -> Apps Script.
 * 4. Delete any code there, paste this entire file, and click Save (Ctrl+S).
 * 5. Click "Deploy" (top right) -> "New deployment".
 * 6. Under "Select type" (gear icon), choose "Web app".
 * 7. Set:
 *    - Description: Bandhunt RSVP Sync
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 8. Click "Deploy", authorize Google account permissions, and copy the Web App URL:
 *    (e.g. https://script.google.com/macros/s/AKfycbx.../exec)
 * 9. Add this Web App URL to your Vercel project Environment Variables:
 *    RSVP_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbx.../exec
 * 
 * Every submission will now instantly appear in your Google Sheet in real time!
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var timestamp = data.createdAt || new Date().toISOString();
    var contact = data.contact || data.experienceDescription || "";
    var city = data.suggestedCity || "Mumbai";
    var level = data.levelUnlocked ? "Level " + data.levelUnlocked : "All";
    var source = data.source || "web";
    var submitter = data.submittedBy || "Player";

    sheet.appendRow([
      timestamp,
      contact,
      city,
      level,
      source,
      submitter
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Row added" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Bandhunt Google Sheets Sync Webhook Active" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * TAEST BANDHUNT - OFFICIAL GOOGLE SHEETS LIVE 2-WAY SYNC SCRIPT
 * 
 * ============================================================================
 * HOW TO DEPLOY:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Replace all code in Code.gs with this entire file.
 * 4. Run `testAuthorize()` once to grant permissions (Review Permissions > Advanced > Allow).
 * 5. Click Deploy > New deployment (Select type: Web app).
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (CRITICAL: must be Anyone!)
 * 6. Copy the Web App URL and set it as RSVP_WEBHOOK_URL.
 * ============================================================================
 * 
 * Recommended Sheet Columns (Row 1):
 * [A] Timestamp (IST) | [B] Contact (Phone / Email) | [C] City | [D] Level Unlocked | [E] Category | [F] Source | [G] Submitter
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var timestamp = data.timestamp || data.createdAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    var contact = String(data.contact || data.phone || data.email || data.experienceDescription || "");
    var city = String(data.city || data.suggestedCity || "Mumbai");
    var level = String(data.levelUnlocked || "All");
    var category = String(data.category || (data.source === "mumbai_offline_registration" ? "List 2: Mumbai Offline Bandhunt Registration" : "List 1: City Specific Invite Request"));
    var source = String(data.source || "web");
    var submitter = String(data.submittedBy || "Player");

    // Prepend single quote to phone numbers so Google Sheets preserves leading zeros and +
    var cleanContact = contact.startsWith("+") || contact.startsWith("0") ? "'" + contact : contact;

    sheet.appendRow([
      timestamp,
      cleanContact,
      city,
      level,
      category,
      source,
      submitter
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Registration appended to sheet successfully", 
        contact: contact,
        timestamp: timestamp 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Returns all sheet rows as JSON so the /admin dashboard can pull directly from the Google Sheet
 */
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    
    if (!rows || rows.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var list = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (r[1]) { // If contact column is present
        list.push({
          createdAt: String(r[0] || ""),
          contact: String(r[1]).replace(/^'/, ''),
          suggestedCity: String(r[2] || "Mumbai"),
          levelUnlocked: r[3] && !isNaN(parseInt(r[3])) ? parseInt(r[3]) : undefined,
          source: String(r[5] || r[4] || "google_sheets"),
          submittedBy: String(r[6] || "Player")
        });
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify(list))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Quick one-click function to grant OAuth permissions in the Apps Script editor
 */
function testAuthorize() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log("Authorized successfully! Active sheet: " + sheet.getName());
}

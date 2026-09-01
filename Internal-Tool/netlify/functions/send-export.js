/**
 * Netlify Function: send-export.js
 * Handles site visit data export and email delivery via SendGrid
 *
 * Usage: POST to /.netlify/functions/send-export
 * Body: { visitData, contextPhotos, floors }
 */

const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Simple XLSX generation for Netlify (using CSV as fallback)
function generateCSVContent(floors, building) {
  let csv = `SITE VISIT EXPORT\nBuilding,${building}\n\n`;
  csv += `Floor,Type,Label,Location,X%,Y%,Notes\n`;

  floors.forEach((f) => {
    f.stations?.forEach((st) => {
      if (st.x !== null && st.y !== null) {
        csv += `${f.number},Station,${st.letter},${st.name || ""},${st.x.toFixed(2)},${st.y.toFixed(2)},${st.notes || ""}\n`;
      }
    });

    f.gateways?.forEach((gw) => {
      if (gw.x !== null && gw.y !== null) {
        csv += `${f.number},Gateway,${gw.label},${gw.location || ""},${gw.x.toFixed(2)},${gw.y.toFixed(2)},${gw.notes || ""}\n`;
      }
    });

    f.displays?.forEach((d) => {
      if (d.x !== null && d.y !== null) {
        csv += `${f.number},Display,${d.label},${d.location || ""},${d.x.toFixed(2)},${d.y.toFixed(2)},${d.notes || ""}\n`;
      }
    });
  });

  return csv;
}

// Generate photo attachment list with proper naming
function generatePhotoAttachments(contextPhotos, floors) {
  const attachments = [];
  let photoCount = 0;

  // Context photos
  if (contextPhotos && contextPhotos.length > 0) {
    contextPhotos.forEach((p, i) => {
      const fname = `01_Context_${p.description || "Photo"}`.replace(/\s+/g, "_") + ".jpg";
      if (p.dataUrl) {
        const base64 = p.dataUrl.split(",")[1];
        attachments.push({
          filename: fname,
          content: base64,
          encoding: "base64",
          type: "image/jpeg",
        });
        photoCount++;
      }
    });
  }

  // Floor plan photos
  if (floors) {
    floors.forEach((f) => {
      if (f.markupDataUrl) {
        const fname = `02_FloorPlan_F${f.number}_Markup.jpg`;
        const base64 = f.markupDataUrl.split(",")[1];
        attachments.push({
          filename: fname,
          content: base64,
          encoding: "base64",
          type: "image/jpeg",
        });
        photoCount++;
      }

      // Station photos
      f.stations?.forEach((st) => {
        st.photos?.forEach((photo, idx) => {
          const fname = `03_Station_F${f.number}_${st.letter}_Photo${idx + 1}.jpg`;
          if (photo.data) {
            const base64 = photo.data.split(",")[1];
            attachments.push({
              filename: fname,
              content: base64,
              encoding: "base64",
              type: "image/jpeg",
            });
            photoCount++;
          }
        });
      });

      // Gateway photos
      f.gateways?.forEach((gw) => {
        if (gw.photoDataUrl) {
          const fname = `04_Gateway_F${f.number}_${gw.label}_Photo.jpg`;
          const base64 = gw.photoDataUrl.split(",")[1];
          attachments.push({
            filename: fname,
            content: base64,
            encoding: "base64",
            type: "image/jpeg",
          });
          photoCount++;
        }
      });

      // Display photos
      f.displays?.forEach((d) => {
        if (d.photoDataUrl) {
          const fname = `05_Display_F${f.number}_${d.label}_Photo.jpg`;
          const base64 = d.photoDataUrl.split(",")[1];
          attachments.push({
            filename: fname,
            content: base64,
            encoding: "base64",
            type: "image/jpeg",
          });
          photoCount++;
        }
      });
    });
  }

  return { attachments, photoCount };
}

// Main handler
exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Reject an oversized request before parsing it. The platform caps a function
  // request near 6MB; a payload past that must fail with a message the auditor
  // can act on, not a generic 500 at the end of a day of capture.
  const MAX_REQUEST_BYTES = 5.5 * 1024 * 1024;
  const requestBytes = Buffer.byteLength(event.body || "", "utf8");
  if (requestBytes > MAX_REQUEST_BYTES) {
    console.error(
      `[EXPORT EMAIL ERROR] payload too large: ${(requestBytes / 1048576).toFixed(1)}MB`
    );
    return {
      statusCode: 413,
      body: JSON.stringify({
        error:
          `Export too large (${(requestBytes / 1048576).toFixed(1)}MB). ` +
          `Use "Email floor by floor" to send one email per floor.`,
      }),
    };
  }

  try {
    // Parse request body
    const payload = JSON.parse(event.body);
    const { building, address, auditor, date, visitData, partLabel } = payload;

    if (!visitData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing visitData" }),
      };
    }

    const { contextPhotos, floors } = visitData;

    // Generate CSV content
    const csvContent = generateCSVContent(floors, building);

    // Generate photo attachments
    const { attachments, photoCount } = generatePhotoAttachments(
      contextPhotos,
      floors
    );

    // Add CSV as attachment
    attachments.push({
      filename: "Site_Visit_Summary.csv",
      content: Buffer.from(csvContent).toString("base64"),
      encoding: "base64",
      type: "text/csv",
    });

    // Prepare email
    const emailSubject = `Site Visit Export - ${building}${partLabel ? " - " + partLabel : ""} (${date || "Draft"})`;
    const emailBody = `
Site Visit Export
================

Building: ${building}
Address: ${address || "N/A"}
Auditor: ${auditor || "N/A"}
Visit Date: ${date || "Draft"}

Floor Plans: ${floors?.length || 0}
Stations: ${floors?.reduce((acc, f) => acc + (f.stations?.length || 0), 0) || 0}
Gateways: ${floors?.reduce((acc, f) => acc + (f.gateways?.length || 0), 0) || 0}
Displays: ${floors?.reduce((acc, f) => acc + (f.displays?.length || 0), 0) || 0}
Photos Captured: ${photoCount}

Attachments:
- Site_Visit_Summary.csv (Site visit details)
- Photos (${photoCount} images with standard naming)

This is an automated export from the Spare-it Site Visit Form.
`;

    const msg = {
      to: process.env.OPERATIONS_EMAIL || "support@spare-it.com",
      from: "noreply@spare-it.com", // Update with your Spare-it sender email
      subject: emailSubject,
      text: emailBody,
      html: `<pre>${emailBody}</pre>`,
      attachments: attachments,
    };

    // Send email
    await sgMail.send(msg);

    console.log(`[EXPORT EMAIL] Sent to ${msg.to} with ${photoCount} photos`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Export emailed to ${process.env.OPERATIONS_EMAIL}`,
        details: {
          building,
          photosIncluded: photoCount,
          recipients: process.env.OPERATIONS_EMAIL,
        },
      }),
    };
  } catch (error) {
    console.error("[EXPORT EMAIL ERROR]", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to send export",
        details: error.message,
      }),
    };
  }
};

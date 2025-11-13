import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { 
      name, 
      surname, 
      companyName, 
      companyEmail, 
      phoneNumber, 
      businessCertificate,
      businessCertificateName,
      personalDocument,
      personalDocumentName,
      selectedSpace
    } = await req.json();

    // Decode the base64 file strings into buffers
    const businessCertBase64 = businessCertificate.split('base64,')[1];
    const businessCertBuffer = Buffer.from(businessCertBase64, 'base64');

    const personalDocBase64 = personalDocument.split('base64,')[1];
    const personalDocBuffer = Buffer.from(personalDocBase64, 'base64');

    // Determine the file types from the data URLs
    const businessCertMimeMatch = businessCertificate.match(/data:(.*?);base64,/);
    const businessCertMimeType = businessCertMimeMatch ? businessCertMimeMatch[1] : 'application/octet-stream';

    const personalDocMimeMatch = personalDocument.match(/data:(.*?);base64,/);
    const personalDocMimeType = personalDocMimeMatch ? personalDocMimeMatch[1] : 'application/octet-stream';

    // Get file extensions from the MIME types
    const businessCertExtension = businessCertMimeType.split('/')[1] || 'bin';
    const fullBusinessCertName = `${businessCertificateName}.${businessCertExtension}`;

    const personalDocExtension = personalDocMimeType.split('/')[1] || 'bin';
    const fullPersonalDocName = `${personalDocumentName}.${personalDocExtension}`;

    // Create a transporter using Gmail service
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: "donotreply.sportmarketing@gmail.com",
        pass: "zrkb ttes xdom epoy", 
      },
    });

    // Simple HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="sq">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aplikim i Ri - Prishtina Festive</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
          }
          h1 {
            color: #367a3b;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .info-row {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e0e0e0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
          }
          .value {
            color: #333;
            font-size: 16px;
          }
          .attachments {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #367a3b;
          }
          .attachments-title {
            font-weight: bold;
            color: #367a3b;
            margin-bottom: 10px;
          }
          .attachment-item {
            margin-bottom: 8px;
            color: #666;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h1>Aplikim i Ri - Prishtina Festive</h1>
          
          <div class="info-row">
            <div class="label">Emri i Kompanisë</div>
            <div class="value">${companyName}</div>
          </div>
          
          <div class="info-row">
            <div class="label">Email i Kompanisë</div>
            <div class="value">${companyEmail}</div>
          </div>
          
          <div class="info-row">
            <div class="label">Numri i Telefonit</div>
            <div class="value">${phoneNumber}</div>
          </div>
          
          <div class="info-row">
            <div class="label">Emri i Plotë</div>
            <div class="value">${name} ${surname}</div>
          </div>
          
          <div class="info-row">
            <div class="label">Hapësira e Zgjedhur</div>
            <div class="value">${selectedSpace}</div>
          </div>
          
          <div class="attachments">
            <div class="attachments-title">Dokumentet e Bashkangjitura</div>
            <div class="attachment-item">• Certifikata e biznesit të regjistruar në ARBK</div>
            <div class="attachment-item">• Dokumenti personal i identifikimit</div>
          </div>
          
          <div class="footer">
            <p>Ky email u gjenerua automatikisht nga sistemi i aplikimit të Prishtina Festive.</p>
            <p>© 2025 Prishtina Festive</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version for email clients that don't support HTML
    const textContent = `
APLIKIM I RI - PRISHTINA FESTIVE
================================

INFORMACIONI I APLIKUESIT:
Emri i Kompanisë: ${companyName}
Email i Kompanisë: ${companyEmail}
Numri i Telefonit: ${phoneNumber}
Emri i Plotë: ${name} ${surname}
Hapësira e Zgjedhur: ${selectedSpace}

DOKUMENTET E BASHKANGJITURA:
• Certifikata e biznesit të regjistruar në ARBK
• Dokumenti personal i identifikimit

---
Ky email u gjenerua automatikisht nga sistemi i aplikimit të Prishtina Festive.
© 2025 Prishtina Festive. Të gjitha të drejtat e rezervuara.
www.prishtinafestive.com
    `;

    // Prepare the mail options
    const mailOptions = {
      from: "Aplikimi i Ri - Prishtina Festive <donotreply.sportmarketing@gmail.com>",
      to: 'kreshnik.kelmendi1994@gmail.com, info@prishtinafestive.com',
      subject: `Aplikim i Ri: ${name} ${surname} - ${companyName}`,
      text: textContent,
      html: htmlContent,
      attachments: [
        {
          filename: fullBusinessCertName,
          content: businessCertBuffer,
          encoding: 'base64',
          contentType: businessCertMimeType,
        },
        {
          filename: fullPersonalDocName,
          content: personalDocBuffer,
          encoding: 'base64',
          contentType: personalDocMimeType,
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error sending email' }), {
      status: 500,
    });
  }
}

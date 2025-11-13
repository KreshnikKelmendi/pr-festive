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

    // Professional HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="sq">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aplikim i Ri - Prishtina Festive</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 80rem;
            margin: 0 auto;
            background-color: #f5f5f5;
            padding: 20px;
          }
          .email-container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
            max-width: 72rem;
            margin: 0 auto;
          }
          .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .header p {
            margin: 0;
            opacity: 0.9;
            font-size: 16px;
            font-weight: 400;
          }
          .content {
            padding: 40px 30px;
          }
          .section {
            margin-bottom: 35px;
          }
          .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #3498db;
          }
          .info-item {
            background-color: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
          }
          .info-label {
            font-weight: 700;
            color: #2c3e50;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .info-value {
            color: #34495e;
            font-size: 16px;
            font-weight: 500;
            line-height: 1.4;
          }
          .status-badge {
            display: inline-block;
            padding: 10px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: none;
            letter-spacing: 0.3px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .status-yes {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border: none;
          }
          .status-no {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }
          .motor-tools-section {
            background-color: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            margin-top: 25px;
          }
          .motor-tools-title {
            font-size: 18px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .motor-tools-title:before {
            content: "🚗";
            font-size: 20px;
          }
          .motor-tools-status {
            font-size: 16px;
            color: #34495e;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .motor-tools-tick {
            color: #28a745;
            font-size: 18px;
            font-weight: bold;
          }
          .attachments-section {
            background-color: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            margin-top: 25px;
          }
          .attachments-title {
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .attachments-title:before {
            content: "📎";
            font-size: 20px;
          }
          .attachment-item {
            background-color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            color: #495057;
            font-size: 15px;
            font-weight: 500;
          }
          .attachment-item:last-child {
            margin-bottom: 0;
          }
          .footer {
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
          }
          .footer p {
            margin: 0 0 8px 0;
            color: #bdc3c7;
            font-size: 14px;
          }
          .footer p:last-child {
            margin-bottom: 0;
            font-weight: 600;
            color: #ecf0f1;
          }
          @media (max-width: 600px) {
            body {
              padding: 15px;
              max-width: 100%;
            }
            .email-container {
              max-width: 100%;
              margin: 0;
            }
            .content {
              padding: 30px 20px;
            }
            .info-item {
              padding: 18px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Aplikim i Ri</h1>
            <p>Akull n'Verë - Prishtina Festive</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">Informacioni i Aplikuesit</div>
              <div class="info-item">
                <div class="info-label">Emri i Kompanisë</div>
                <div class="info-value">${companyName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email i Kompanisë</div>
                <div class="info-value">${companyEmail}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Numri i Telefonit</div>
                <div class="info-value">${phoneNumber}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Emri i Plotë</div>
                <div class="info-value">${name} ${surname}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Hapësira e Zgjedhur</div>
                <div class="info-value">${selectedSpace}</div>
              </div>
            </div>
            
            <div class="attachments-section">
              <div class="attachments-title">Dokumentet e Bashkangjitura</div>
              <div class="attachment-item">📎 Certifikata e biznesit të regjistruar në ARBK</div>
              <div class="attachment-item">📎 Dokumenti personal i identifikimit</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Ky email u gjenerua automatikisht nga sistemi i aplikimit të Prishtina Festive.</p>
            <p>© 2025 Prishtina Festive. Të gjitha të drejtat e rezervuara.</p>
            <p>www.prishtinafestive.com</p>
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
      to: 'kreshnik.kelmendi1994@gmail.com',
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

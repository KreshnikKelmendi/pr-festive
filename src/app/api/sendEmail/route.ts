import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, surname, file, fileName = 'attachment' } = await req.json();

    // Decode the base64 file string into a buffer
    const base64Data = file.split('base64,')[1];  // Extract the base64 part
    const buffer = Buffer.from(base64Data, 'base64'); // Convert to buffer

    // Determine the file type from the data URL
    const mimeTypeMatch = file.match(/data:(.*?);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/octet-stream';

    // Get file extension from the MIME type
    const extension = mimeType.split('/')[1] || 'bin';
    const fullFileName = `${fileName}.${extension}`;

    // Create a transporter using Gmail service
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: "noreplynplsport@gmail.com",
        pass: "vhmb lrkt xzrj fwof", // Use your Gmail app-specific password
      },
    });

    // Prepare the mail options
    const mailOptions = {
      from: "noreplynplsport@gmail.com",
      to: 'kreshnik.kelmendi@trekuartista.com, kreshnik.kelmendi1994@gmail.com',
      subject: 'New Message with Attachment',
      text: `You have a new message from ${name} ${surname}.`,
      attachments: [
        {
          filename: fullFileName,
          content: buffer,
          contentType: mimeType,   
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'Email sent successfully!' }), {
      status: 200,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error.message }),
        { status: 500 }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'An unknown error occurred' }),
        { status: 500 }
      );
    }
  }
}

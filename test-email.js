
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log("Host:", process.env.EMAIL_HOST);
    console.log("Port:", process.env.EMAIL_PORT);
    console.log("User:", process.env.EMAIL_HOST_USER);
    console.log("Pass:", process.env.EMAIL_HOST_PASSWORD ? "Set" : "Not Set");
    console.log("SSL:", process.env.EMAIL_USE_SSL);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '465'),
        secure: process.env.EMAIL_USE_SSL === 'True',
        auth: {
            user: process.env.EMAIL_HOST_USER,
            pass: process.env.EMAIL_HOST_PASSWORD,
        },
    });

    try {
        console.log("Verifying connection...");
        await transporter.verify();
        console.log("Connection successful!");
        
        console.log("Sending test email...");
        const info = await transporter.sendMail({
            from: process.env.EMAIL_HOST_USER,
            to: 'business@al-mawa.international',
            subject: 'Test Email from Nodemailer',
            text: 'This is a test email to verify SMTP settings.'
        });
        console.log("Email sent successfully! Message ID:", info.messageId);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testEmail();

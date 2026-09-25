import { NextResponse } from "next/server";
import { connectDB } from "../libs/db";
import { ContactModel } from "../models/contact_schema";
import { corsHeaders, handleOptions } from "@/lib/cors";
import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST?.replace(/'/g, ''),
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_USE_SSL?.toLowerCase() === 'true',
  auth: {
    user: process.env.EMAIL_HOST_USER?.replace(/'/g, ''),
    pass: process.env.EMAIL_HOST_PASSWORD?.replace(/'/g, ''),
  },
});

// Send email to director with contact details including mobile number
async function sendContactToDirector(contactData) {
  try {
    const directorEmail = process.env.DIRECTOR_EMAIL;
    if (!directorEmail) {
      console.warn('⚠️ DIRECTOR_EMAIL not configured in .env');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to: directorEmail,
      subject: `📋 New Contact Form Submission - ${contactData.firstname} ${contactData.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h1 style="color: #1f2937; margin-bottom: 20px;">📋 New Contact Form Submission</h1>
            
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
              A new contact inquiry has been received and requires your attention.
            </p>
            
            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #6b7280; margin: 10px 0;"><strong>First Name:</strong> ${contactData.firstname || 'N/A'}</p>
              <p style="color: #6b7280; margin: 10px 0;"><strong>Last Name:</strong> ${contactData.lastName || 'N/A'}</p>
              <p style="color: #6b7280; margin: 10px 0;"><strong>Email Address:</strong> ${contactData.emailAddress || 'N/A'}</p>
              <p style="color: #6b7280; margin: 10px 0;"><strong>Phone Number:</strong> ${contactData.phoneNumber || 'N/A'}</p>
              <p style="color: #6b7280; margin: 10px 0;"><strong>Mobile Number:</strong> ${contactData.mobileNumber || 'N/A'}</p>
              <p style="color: #6b7280; margin: 10px 0;"><strong>Country:</strong> ${contactData.selecetCountry || 'N/A'}</p>
              <p style="color: #6b7280; margin: 10px 0;"><strong>Subject:</strong> ${contactData.subject || 'N/A'}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
              <p style="color: #1f2937; margin: 10px 0;"><strong>Message:</strong></p>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${contactData.tellUSAboutYou || 'N/A'}</p>
            </div>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              <strong>Submitted on:</strong> ${new Date().toLocaleString()}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Al-Mawa International &copy; 2026 - All rights reserved
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Contact notification email sent to director');
    return true;
  } catch (error) {
    console.error('❌ Error sending contact notification to director:', error);
    return false;
  }
}

// Send thank you email to client
async function sendThankYouEmailToClient(clientEmail, clientName) {
  try {
    if (!clientEmail) {
      console.warn('Client email not provided');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to: clientEmail,
      subject: `Thank You for Contacting Al-Mawa International! 🙏`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-align: center;">🙏 Thank You!</h1>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 30px 20px; border-radius: 0 0 12px 12px;">
            <p style="color: #1f2937; font-size: 16px; margin: 0 0 20px 0;">
              Dear ${clientName || 'Valued Client'},
            </p>
            
            <p style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 0 0 20px 0;">
              Thank you for reaching out to Al-Mawa International! We have received your contact inquiry and appreciate your interest in our services.
            </p>
            
            <div style="background-color: #ffffff; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #4b5563; font-size: 14px; margin: 0; font-style: italic;">
                "We are committed to responding to all inquiries within 24 hours."
              </p>
            </div>
            
            <p style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 20px 0;">
              Our team will review your message and get back to you as soon as possible with information tailored to your needs.
            </p>
            
            <div style="background-color: #f0f9ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #1e40af; font-size: 13px; margin: 0;">
                <strong>Our Contact Details:</strong><br>
                📞 Phone: +91 9561179693, +91 9511991736, +91 9028322363<br>
                ✉️ Email: legal@al-mawa.international, sales@al-mawa.international<br>
                🕐 Hours: 10:00 AM - 06:00 PM
              </p>
            </div>
            
            <p style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 20px 0;">
              In the meantime, feel free to explore our services or contact us directly if you have any urgent questions.
            </p>
            
            <p style="color: #4b5563; font-size: 15px; margin: 20px 0;">
              Best regards,<br>
              <strong style="color: #1f2937;">Al-Mawa International Team</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <div style="text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                <strong>Al-Mawa International</strong><br>
                &copy; 2026 - All rights reserved
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Thank you email sent to client');
    return true;
  } catch (error) {
    console.error('❌ Error sending thank you email to client:', error);
    return false;
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request) {
    console.log("🔄 Contact form API called");
    
    try {
        await connectDB();
        console.log("✅ Database connected");
        
        const reqBody = await request.json();
        console.log("📝 Request body:", reqBody);
        
        // Validate required fields
        const { firstname, lastName, emailAddress, phoneNumber, mobileNumber, selecetCountry, subject, tellUSAboutYou } = reqBody;
        
        if (!firstname || !lastName || !emailAddress || !phoneNumber || !mobileNumber || !selecetCountry || !subject || !tellUSAboutYou) {
            console.log("❌ Missing required fields");
            return NextResponse.json({
                success: false,
                message: "All required fields must be provided"
            }, { status: 400, headers: corsHeaders });
        }
        
        console.log("✅ All fields validated");
        
        const contactData = new ContactModel(reqBody);
        console.log("📄 Contact model created:", contactData);
        
        const savedData = await contactData.save();
        console.log("💾 Data saved successfully:", savedData._id);
        
        // Send email to director
        await sendContactToDirector(reqBody);
        
        // Send thank you email to client
        await sendThankYouEmailToClient(emailAddress, firstname);
        
        return NextResponse.json({
            success: true,
            message: "Contact form submitted successfully",
            data: savedData
        }, { headers: corsHeaders });
    } catch (error) {
        console.error("❌ Contact form error:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to submit contact form"
        }, { status: 500, headers: corsHeaders });
    }
}

export async function GET() {
    await connectDB();
    try {
        const contacts = await ContactModel.find();
        if (contacts.length === 0) {
            return NextResponse.json({
                message: "No contact data available"
            }, { headers: corsHeaders });
        }
        return NextResponse.json({
            success: true,
            data: contacts
        }, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500, headers: corsHeaders });
    }
}

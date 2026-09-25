//route for jobs POST , GET and DELETE

import {NextResponse} from "next/server"
import {connectDB} from "@/app/api/libs/db"
import { OptModel } from "../models/opt-schema"
import nodemailer from 'nodemailer'

export async function POST(request){
    try {
        await connectDB()
        const body = await request.json()
        const job = new OptModel(body)
        await job.save()

        // Setup Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST?.replace(/'/g, ''), // Strip quotes just in case
            port: parseInt(process.env.EMAIL_PORT || '465'),
            secure: process.env.EMAIL_USE_SSL?.toLowerCase() === 'true',
            auth: {
                user: process.env.EMAIL_HOST_USER?.replace(/'/g, ''),
                pass: process.env.EMAIL_HOST_PASSWORD?.replace(/'/g, ''),
            },
        });

        // Email to Business
        const mailOptions = {
            from: process.env.EMAIL_HOST_USER,
            to: 'business@al-mawa.international',
            subject: '🔔 New Lead: Opt-In Popup Form Submission',
            html: `
                <h3>New Lead Details</h3>
                <p><strong>Name:</strong> ${body.name}</p>
                <p><strong>Phone Number:</strong> ${body.number}</p>
                <p><strong>Company Name:</strong> ${body.company}</p>
                <p><strong>Message:</strong> ${body.message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({success:true,message:"Submitted successfully"})
    } catch (error) {
        console.log("Error processing opt-in submission:", error)
        return NextResponse.json({success:false,message:"Failed to add"})
    }
}


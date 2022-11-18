import * as nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

// Create email transporter from config (env var)
function createTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user === undefined || pass === undefined) {
        throw new Error("No SMTP config");
    }

    return nodemailer.createTransport({
        host: "mail.gandi.net",
        secure: true,
        port: 465,
        auth: {
            user,
            pass
        }
    });
}

export async function sendMail(
    to: string, subject: string, body: string
): Promise<SMTPTransport.SentMessageInfo> {
    const transporter = createTransporter();
    return transporter.sendMail({
        from: "noreply@unicourse.tw",
        to,
        subject,
        html: body
    });
}

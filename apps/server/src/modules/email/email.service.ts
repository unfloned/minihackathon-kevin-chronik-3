import nodemailer from 'nodemailer';

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        const host = process.env.SMTP_HOST;
        const port = parseInt(process.env.SMTP_PORT || '587');
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (host && user && pass) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
        }
    }

    isConfigured(): boolean {
        return this.transporter !== null;
    }

    async sendEmail(options: {
        to: string;
        subject: string;
        text: string;
        html?: string;
        attachments?: Array<{
            filename: string;
            content: Buffer | string;
            contentType?: string;
        }>;
    }): Promise<boolean> {
        if (!this.transporter) {
            console.warn('Email service not configured. Set SMTP_* environment variables.');
            return false;
        }

        const from = process.env.SMTP_FROM || process.env.SMTP_USER;

        await this.transporter.sendMail({
            from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            attachments: options.attachments,
        });

        return true;
    }
}

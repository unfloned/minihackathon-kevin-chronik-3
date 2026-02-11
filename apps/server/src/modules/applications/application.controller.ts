import { http, HttpBody, HttpNotFoundError } from '@deepkit/http';
import { ApplicationService, CreateApplicationDto, UpdateApplicationDto, AddInterviewDto, UpdateInterviewDto } from './application.service';
import { User, ApplicationStatus } from '@ycmm/core';
import { ProfileService } from '../profile/profile.service';
import { EmailService } from '../email/email.service';

@http.controller('/api/applications')
export class ApplicationController {
    constructor(
        private applicationService: ApplicationService,
        private profileService: ProfileService,
        private emailService: EmailService,
    ) {}

    @(http.GET('').group('auth-required'))
    async getAll(user: User) {
        return this.applicationService.getAll(user.id);
    }

    @(http.GET('/stats').group('auth-required'))
    async getStats(user: User) {
        return this.applicationService.getStats(user.id);
    }

    @(http.GET('/status/:status').group('auth-required'))
    async getByStatus(status: ApplicationStatus, user: User) {
        return this.applicationService.getByStatus(user.id, status);
    }

    @(http.GET('/:id').group('auth-required'))
    async getById(id: string, user: User) {
        const app = await this.applicationService.getById(id, user.id);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung nicht gefunden');
        }
        return app;
    }

    @(http.POST('').group('auth-required'))
    async create(body: HttpBody<CreateApplicationDto>, user: User) {
        return await this.applicationService.create(user.id, body);
    }

    @(http.PATCH('/:id').group('auth-required'))
    async update(id: string, body: HttpBody<UpdateApplicationDto>, user: User) {
        const app = await this.applicationService.update(id, user.id, body);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung nicht gefunden');
        }
        return app;
    }

    @(http.DELETE('/:id').group('auth-required'))
    async delete(id: string, user: User) {
        const success = await this.applicationService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Bewerbung nicht gefunden');
        }
    }

    @(http.POST('/:id/status').group('auth-required'))
    async updateStatus(
        id: string,
        body: HttpBody<{ status: ApplicationStatus; note?: string }>,
        user: User
    ) {
        const app = await this.applicationService.updateStatus(id, user.id, body.status, body.note);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung nicht gefunden');
        }
        return app;
    }

    // Interview endpoints
    @(http.POST('/:id/interviews').group('auth-required'))
    async addInterview(id: string, body: HttpBody<AddInterviewDto>, user: User) {
        const app = await this.applicationService.addInterview(id, user.id, body);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung nicht gefunden');
        }
        return app;
    }

    @(http.PATCH('/:appId/interviews/:interviewId').group('auth-required'))
    async updateInterview(
        appId: string,
        interviewId: string,
        body: HttpBody<UpdateInterviewDto>,
        user: User
    ) {
        const app = await this.applicationService.updateInterview(appId, user.id, interviewId, body);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung oder Interview nicht gefunden');
        }
        return app;
    }

    @(http.DELETE('/:appId/interviews/:interviewId').group('auth-required'))
    async deleteInterview(appId: string, interviewId: string, user: User) {
        const app = await this.applicationService.deleteInterview(appId, user.id, interviewId);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung oder Interview nicht gefunden');
        }
        return app;
    }

    @(http.POST('/:id/apply').group('auth-required'))
    async applyByEmail(
        id: string,
        body: HttpBody<{ emailBody: string }>,
        user: User
    ) {
        const app = await this.applicationService.getById(id, user.id);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung nicht gefunden');
        }

        if (!app.contactEmail) {
            throw new Error('Keine Kontakt-E-Mail hinterlegt');
        }

        // Generate CV PDF as buffer
        const cvData = await this.profileService.generateCvData(user.id);
        let pdfBuffer: Buffer | undefined;

        if (cvData) {
            const PDFDocument = (await import('pdfkit')).default;
            const chunks: Buffer[] = [];

            pdfBuffer = await new Promise<Buffer>((resolve) => {
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                doc.on('data', (chunk: Buffer) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Header
                doc.fontSize(24).font('Helvetica-Bold').text(cvData.name, { align: 'center' });
                doc.moveDown(0.3);

                const contactParts: string[] = [];
                if (cvData.email) contactParts.push(cvData.email);
                if (cvData.phone) contactParts.push(cvData.phone);
                if (cvData.address) contactParts.push(cvData.address);
                if (contactParts.length > 0) {
                    doc.fontSize(10).font('Helvetica').text(contactParts.join(' | '), { align: 'center' });
                }
                doc.moveDown(1);

                if (cvData.bio) {
                    doc.fontSize(14).font('Helvetica-Bold').text('Profil');
                    doc.moveDown(0.3);
                    doc.fontSize(10).font('Helvetica').text(cvData.bio);
                    doc.moveDown(1);
                }

                if (cvData.experience && cvData.experience.length > 0) {
                    doc.fontSize(14).font('Helvetica-Bold').text('Berufserfahrung');
                    doc.moveDown(0.3);
                    for (const exp of cvData.experience) {
                        doc.fontSize(11).font('Helvetica-Bold').text(exp.position);
                        doc.fontSize(10).font('Helvetica').text(`${exp.company}`);
                        if (exp.description) doc.fontSize(10).font('Helvetica').text(exp.description);
                        doc.moveDown(0.5);
                    }
                    doc.moveDown(0.5);
                }

                if (cvData.education && cvData.education.length > 0) {
                    doc.fontSize(14).font('Helvetica-Bold').text('Ausbildung');
                    doc.moveDown(0.3);
                    for (const edu of cvData.education) {
                        doc.fontSize(11).font('Helvetica-Bold').text(`${edu.degree} - ${edu.field}`);
                        doc.fontSize(10).font('Helvetica').text(edu.institution);
                        doc.moveDown(0.5);
                    }
                    doc.moveDown(0.5);
                }

                if (cvData.skills && cvData.skills.length > 0) {
                    doc.fontSize(14).font('Helvetica-Bold').text('Kenntnisse');
                    doc.moveDown(0.3);
                    doc.fontSize(10).font('Helvetica').text(cvData.skills.join(' • '));
                    doc.moveDown(1);
                }

                if (cvData.languages && cvData.languages.length > 0) {
                    doc.fontSize(14).font('Helvetica-Bold').text('Sprachen');
                    doc.moveDown(0.3);
                    for (const lang of cvData.languages) {
                        doc.fontSize(10).font('Helvetica').text(`${lang.language}: ${lang.level === 'native' ? 'Muttersprache' : lang.level}`);
                    }
                }

                doc.end();
            });
        }

        // Send email
        const userName = user.displayName || 'Bewerber';
        const subject = `Bewerbung als ${app.jobTitle} - ${userName}`;

        const attachments = pdfBuffer ? [{
            filename: `CV_${userName.replace(/\s+/g, '_')}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf' as string,
        }] : [];

        const sent = await this.emailService.sendEmail({
            to: app.contactEmail,
            subject,
            text: body.emailBody || '',
            attachments,
        });

        if (!sent) {
            throw new Error('E-Mail konnte nicht gesendet werden. SMTP nicht konfiguriert.');
        }

        // Update status to applied
        await this.applicationService.updateStatus(id, user.id, 'applied');

        return { success: true };
    }
}

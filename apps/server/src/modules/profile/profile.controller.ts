import { http, HttpBody, HttpNotFoundError } from '@deepkit/http';
import { HttpResponse } from '@deepkit/http';
import { ProfileService, UpdateProfileDto } from './profile.service';
import { User, CvSectionConfig, CvSectionId } from '@ycmm/core';
import type PDFDocumentType from 'pdfkit';

const DEFAULT_SECTION_ORDER: CvSectionConfig[] = [
    { id: 'experience', visible: true, order: 0 },
    { id: 'education', visible: true, order: 1 },
    { id: 'skills', visible: true, order: 2 },
    { id: 'languages', visible: true, order: 3 },
    { id: 'projects', visible: true, order: 4 },
    { id: 'certifications', visible: true, order: 5 },
    { id: 'hobbies', visible: true, order: 6 },
];

@http.controller('/api/profile')
export class ProfileController {
    constructor(private profileService: ProfileService) {}

    @(http.GET('').group('auth-required'))
    async getProfile(user: User) {
        const profile = await this.profileService.getProfile(user.id);
        if (!profile) {
            throw new HttpNotFoundError('Profil nicht gefunden');
        }
        return profile;
    }

    @(http.PATCH('').group('auth-required'))
    async updateProfile(body: HttpBody<UpdateProfileDto>, user: User) {
        const profile = await this.profileService.updateProfile(user.id, body);
        if (!profile) {
            throw new HttpNotFoundError('Profil nicht gefunden');
        }
        return profile;
    }

    @(http.GET('/cv/pdf').group('auth-required'))
    async generateCvPdf(user: User, response: HttpResponse) {
        const cvData = await this.profileService.generateCvData(user.id);
        if (!cvData) {
            throw new HttpNotFoundError('Profil nicht gefunden');
        }

        const PDFDocument = (await import('pdfkit')).default;

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Collect PDF into buffer to avoid Deepkit interfering with the stream
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header - always present
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

            // Bio - always first section
            if (cvData.bio) {
                doc.fontSize(14).font('Helvetica-Bold').text('Profil');
                doc.moveDown(0.3);
                drawLine(doc);
                doc.moveDown(0.3);
                doc.fontSize(10).font('Helvetica').text(cvData.bio);
                doc.moveDown(1);
            }

            // Config-driven sections
            const sections = cvData.cvConfig?.sections
                ? [...cvData.cvConfig.sections].filter(s => s.visible).sort((a, b) => a.order - b.order)
                : DEFAULT_SECTION_ORDER;

            const sectionRenderers: Record<CvSectionId, () => void> = {
                experience: () => renderExperience(doc, cvData),
                education: () => renderEducation(doc, cvData),
                skills: () => renderSkills(doc, cvData),
                languages: () => renderLanguages(doc, cvData),
                projects: () => renderProjects(doc, cvData),
                certifications: () => renderCertifications(doc, cvData),
                hobbies: () => renderHobbies(doc, cvData),
            };

            for (const section of sections) {
                const renderer = sectionRenderers[section.id];
                if (renderer) renderer();
            }

            doc.end();
        });

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename="CV_${cvData.name.replace(/\s+/g, '_')}.pdf"`);
        response.setHeader('Content-Length', String(pdfBuffer.length));
        response.end(pdfBuffer);
    }
}

function drawLine(doc: any) {
    const x = doc.x;
    doc.moveTo(x, doc.y).lineTo(545, doc.y).stroke('#cccccc');
}

function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function renderExperience(doc: any, cvData: any) {
    if (!cvData.experience || cvData.experience.length === 0) return;
    doc.fontSize(14).font('Helvetica-Bold').text('Berufserfahrung');
    doc.moveDown(0.3);
    drawLine(doc);
    doc.moveDown(0.3);
    for (const exp of cvData.experience) {
        doc.fontSize(11).font('Helvetica-Bold').text(exp.position);
        doc.fontSize(10).font('Helvetica').text(
            `${exp.company} | ${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : 'Aktuell'}`
        );
        if (exp.description) {
            doc.moveDown(0.2);
            doc.fontSize(10).font('Helvetica').text(exp.description);
        }
        doc.moveDown(0.5);
    }
    doc.moveDown(0.5);
}

function renderEducation(doc: any, cvData: any) {
    if (!cvData.education || cvData.education.length === 0) return;
    doc.fontSize(14).font('Helvetica-Bold').text('Ausbildung');
    doc.moveDown(0.3);
    drawLine(doc);
    doc.moveDown(0.3);
    for (const edu of cvData.education) {
        doc.fontSize(11).font('Helvetica-Bold').text(`${edu.degree} - ${edu.field}`);
        doc.fontSize(10).font('Helvetica').text(
            `${edu.institution} | ${formatDate(edu.startDate)} - ${edu.endDate ? formatDate(edu.endDate) : 'Aktuell'}`
        );
        doc.moveDown(0.5);
    }
    doc.moveDown(0.5);
}

function renderSkills(doc: any, cvData: any) {
    if (!cvData.skills || cvData.skills.length === 0) return;
    doc.fontSize(14).font('Helvetica-Bold').text('Kenntnisse');
    doc.moveDown(0.3);
    drawLine(doc);
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').text(cvData.skills.join(' • '));
    doc.moveDown(1);
}

function renderLanguages(doc: any, cvData: any) {
    if (!cvData.languages || cvData.languages.length === 0) return;
    doc.fontSize(14).font('Helvetica-Bold').text('Sprachen');
    doc.moveDown(0.3);
    drawLine(doc);
    doc.moveDown(0.3);
    for (const lang of cvData.languages) {
        const levelLabel = lang.level === 'native' ? 'Muttersprache' : lang.level;
        doc.fontSize(10).font('Helvetica').text(`${lang.language}: ${levelLabel}`);
    }
    doc.moveDown(1);
}

function renderProjects(doc: any, cvData: any) {
    if (!cvData.projects || cvData.projects.length === 0) return;
    doc.fontSize(14).font('Helvetica-Bold').text('Projekte');
    doc.moveDown(0.3);
    drawLine(doc);
    doc.moveDown(0.3);
    for (const proj of cvData.projects) {
        doc.fontSize(11).font('Helvetica-Bold').text(proj.title);
        if (proj.description) {
            doc.fontSize(10).font('Helvetica').text(proj.description);
        }
        if (proj.technologies && proj.technologies.length > 0) {
            doc.moveDown(0.2);
            doc.fontSize(9).font('Helvetica-Oblique').text(`Technologien: ${proj.technologies.join(', ')}`);
        }
        if (proj.url) {
            doc.moveDown(0.1);
            doc.fontSize(9).font('Helvetica').fillColor('#0066cc').text(proj.url, { link: proj.url }).fillColor('#000000');
        }
        doc.moveDown(0.5);
    }
    doc.moveDown(0.5);
}

function renderCertifications(doc: any, cvData: any) {
    if (!cvData.certifications || cvData.certifications.length === 0) return;
    doc.fontSize(14).font('Helvetica-Bold').text('Zertifikate');
    doc.moveDown(0.3);
    drawLine(doc);
    doc.moveDown(0.3);
    for (const cert of cvData.certifications) {
        doc.fontSize(11).font('Helvetica-Bold').text(cert.name);
        const parts: string[] = [cert.issuer];
        if (cert.date) parts.push(formatDate(cert.date));
        doc.fontSize(10).font('Helvetica').text(parts.join(' | '));
        if (cert.url) {
            doc.moveDown(0.1);
            doc.fontSize(9).font('Helvetica').fillColor('#0066cc').text(cert.url, { link: cert.url }).fillColor('#000000');
        }
        doc.moveDown(0.5);
    }
    doc.moveDown(0.5);
}

function renderHobbies(doc: any, cvData: any) {
    if (!cvData.hobbies || cvData.hobbies.length === 0) return;
    doc.fontSize(14).font('Helvetica-Bold').text('Hobbys');
    doc.moveDown(0.3);
    drawLine(doc);
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').text(cvData.hobbies.join(' • '));
    doc.moveDown(1);
}

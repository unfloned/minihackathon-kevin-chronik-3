import { User, WorkExperience, Education, Language, CvProject, CvCertification, CvConfig } from '@ycmm/core';
import { AppDatabase } from '../../app/database';

export interface UpdateProfileDto {
    profileBio?: string;
    profilePhone?: string;
    profileAddress?: string;
    profileSkills?: string[];
    profileExperience?: WorkExperience[];
    profileEducation?: Education[];
    profileLanguages?: Language[];
    profileProjects?: CvProject[];
    profileCertifications?: CvCertification[];
    profileHobbies?: string[];
    profileCvConfig?: CvConfig | null;
}

export class ProfileService {
    constructor(private database: AppDatabase) {}

    async getProfile(userId: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.database.query(User)
            .filter({ id: userId })
            .findOneOrUndefined();

        if (!user) return null;

        const { password: _, ...profile } = user;
        return profile as Omit<User, 'password'>;
    }

    async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Omit<User, 'password'> | null> {
        const user = await this.database.query(User)
            .filter({ id: userId })
            .findOneOrUndefined();

        if (!user) return null;

        if (dto.profileBio !== undefined) user.profileBio = dto.profileBio;
        if (dto.profilePhone !== undefined) user.profilePhone = dto.profilePhone;
        if (dto.profileAddress !== undefined) user.profileAddress = dto.profileAddress;
        if (dto.profileSkills !== undefined) user.profileSkills = dto.profileSkills;
        if (dto.profileExperience !== undefined) user.profileExperience = dto.profileExperience;
        if (dto.profileEducation !== undefined) user.profileEducation = dto.profileEducation;
        if (dto.profileLanguages !== undefined) user.profileLanguages = dto.profileLanguages;
        if (dto.profileProjects !== undefined) user.profileProjects = dto.profileProjects;
        if (dto.profileCertifications !== undefined) user.profileCertifications = dto.profileCertifications;
        if (dto.profileHobbies !== undefined) user.profileHobbies = dto.profileHobbies;
        if (dto.profileCvConfig !== undefined) user.profileCvConfig = dto.profileCvConfig;
        user.updatedAt = new Date();

        await this.database.persist(user);

        const { password: _, ...profile } = user;
        return profile as Omit<User, 'password'>;
    }

    async generateCvData(userId: string) {
        const user = await this.database.query(User)
            .filter({ id: userId })
            .findOneOrUndefined();

        if (!user) return null;

        return {
            name: user.displayName,
            email: user.email,
            phone: user.profilePhone,
            address: user.profileAddress,
            bio: user.profileBio,
            skills: user.profileSkills,
            experience: user.profileExperience,
            education: user.profileEducation,
            languages: user.profileLanguages,
            projects: user.profileProjects,
            certifications: user.profileCertifications,
            hobbies: user.profileHobbies,
            cvConfig: user.profileCvConfig,
        };
    }
}

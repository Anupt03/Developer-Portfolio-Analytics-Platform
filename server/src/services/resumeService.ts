import fs from 'fs';
import pdfParse from 'pdf-parse';
import ResumeData, { IResumeData } from '../models/ResumeData.js';
import Profile from '../models/Profile.js';
import { BadRequestError } from '../utils/AppError.js';

// In-demand skills database
const IN_DEMAND_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
  'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express',
  'Django', 'Flask', 'Spring Boot', 'FastAPI',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
  'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
  'REST API', 'GraphQL', 'gRPC', 'WebSocket',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
  'System Design', 'Microservices', 'Event-Driven',
  'Agile', 'Scrum', 'JIRA',
  'HTML', 'CSS', 'Tailwind CSS', 'SASS',
  'Linux', 'Bash', 'Shell Scripting',
  'Data Structures', 'Algorithms', 'OOP', 'Design Patterns',
  'Testing', 'Jest', 'Cypress', 'Selenium',
];

const ACTION_VERBS = [
  'developed', 'built', 'designed', 'implemented', 'created', 'engineered',
  'architected', 'optimized', 'improved', 'reduced', 'increased', 'led',
  'managed', 'deployed', 'automated', 'integrated', 'migrated', 'scaled',
  'launched', 'maintained', 'refactored', 'collaborated', 'mentored',
];

class ResumeService {
  async analyzeResume(userId: string, filePath: string, fileName: string): Promise<IResumeData> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const rawText = pdfData.text;

      if (!rawText || rawText.trim().length < 50) {
        throw new BadRequestError('Could not extract text from PDF. Please ensure the PDF is not image-based.');
      }

      // Extract structured data
      const skills = this.extractSkills(rawText);
      const projects = this.extractProjects(rawText);
      const education = this.extractEducation(rawText);
      const experience = this.extractExperience(rawText);
      const contactInfo = this.extractContactInfo(rawText);

      // Calculate scores
      const atsScore = this.calculateATSScore(rawText, skills, projects, education, experience);
      const resumeQualityScore = this.calculateQualityScore(rawText, skills, projects, experience);
      const missingSkills = this.findMissingSkills(skills);
      const improvementTips = this.generateImprovementTips(rawText, skills, projects, experience, atsScore);

      const resumeData = {
        userId,
        fileName,
        rawText: rawText.substring(0, 10000), // Limit stored text
        skills,
        projects,
        education,
        experience,
        contactInfo,
        atsScore,
        resumeQualityScore,
        missingSkills,
        improvementTips,
        analyzedAt: new Date(),
      };

      const result = await ResumeData.findOneAndUpdate(
        { userId },
        resumeData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Update profile
      await Profile.findOneAndUpdate(
        { userId },
        {
          resumeScore: resumeQualityScore,
          skills: [...new Set([...skills])],
        }
      );

      // Clean up uploaded file
      try { fs.unlinkSync(filePath); } catch {}

      return result;
    } catch (error: any) {
      // Clean up on error
      try { fs.unlinkSync(filePath); } catch {}
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('Failed to analyze resume. Please try a different PDF.');
    }
  }

  async getAnalysis(userId: string): Promise<IResumeData | null> {
    return ResumeData.findOne({ userId });
  }

  private extractSkills(text: string): string[] {
    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();

    for (const skill of IN_DEMAND_SKILLS) {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }

    // Also extract from skills section
    const skillsSectionMatch = text.match(
      /(?:skills|technical skills|technologies|tech stack)[:\s]*([^\n]*(?:\n(?![A-Z][a-z]*:)[^\n]*)*)/i
    );
    if (skillsSectionMatch) {
      const skillsText = skillsSectionMatch[1];
      const words = skillsText.split(/[,|•·\-\n]+/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 30);
      for (const word of words) {
        if (!foundSkills.includes(word) && word.match(/^[A-Za-z0-9.#+\s/]+$/)) {
          foundSkills.push(word);
        }
      }
    }

    return [...new Set(foundSkills)].slice(0, 30);
  }

  private extractProjects(text: string): Array<{ name: string; description: string; technologies: string[] }> {
    const projects: Array<{ name: string; description: string; technologies: string[] }> = [];
    
    const projectSection = text.match(
      /(?:projects|personal projects|key projects)[:\s]*\n([\s\S]*?)(?=\n(?:education|experience|skills|certif|award|hobbies|interest|reference)|$)/i
    );

    if (projectSection) {
      const lines = projectSection[1].split('\n').filter((l) => l.trim());
      let currentProject: { name: string; description: string; technologies: string[] } | null = null;

      for (const line of lines) {
        const trimmed = line.trim();
        // Check if it's a project title (usually starts with bullet or is bold)
        if (trimmed.match(/^[•\-\*]?\s*[A-Z]/) && trimmed.length < 80 && !trimmed.includes(':')) {
          if (currentProject) projects.push(currentProject);
          currentProject = { name: trimmed.replace(/^[•\-\*]\s*/, ''), description: '', technologies: [] };
        } else if (currentProject) {
          currentProject.description += trimmed + ' ';
          // Extract technologies mentioned
          for (const skill of IN_DEMAND_SKILLS) {
            if (trimmed.toLowerCase().includes(skill.toLowerCase()) && !currentProject.technologies.includes(skill)) {
              currentProject.technologies.push(skill);
            }
          }
        }
      }
      if (currentProject) projects.push(currentProject);
    }

    return projects.slice(0, 10);
  }

  private extractEducation(text: string): Array<{ institution: string; degree: string; field: string; year: string }> {
    const education: Array<{ institution: string; degree: string; field: string; year: string }> = [];
    
    const eduSection = text.match(
      /(?:education|academic|qualification)[:\s]*\n([\s\S]*?)(?=\n(?:experience|projects|skills|certif|work|employment)|$)/i
    );

    if (eduSection) {
      const lines = eduSection[1].split('\n').filter((l) => l.trim());
      let currentEdu: { institution: string; degree: string; field: string; year: string } = {
        institution: '', degree: '', field: '', year: ''
      };

      for (const line of lines) {
        const trimmed = line.trim();
        const yearMatch = trimmed.match(/20\d{2}/);
        const degreeMatch = trimmed.match(/(?:B\.?(?:Tech|Sc|E|A)|M\.?(?:Tech|Sc|S|A)|Ph\.?D|Bachelor|Master|MBA|Diploma)/i);

        if (degreeMatch) {
          if (currentEdu.degree) {
            education.push({ ...currentEdu });
            currentEdu = { institution: '', degree: '', field: '', year: '' };
          }
          currentEdu.degree = degreeMatch[0];
          currentEdu.field = trimmed.replace(degreeMatch[0], '').replace(/[,\-|]/g, '').trim();
        }
        if (yearMatch) {
          currentEdu.year = yearMatch[0];
        }
        if (!degreeMatch && !yearMatch && trimmed.length > 5 && !currentEdu.institution) {
          currentEdu.institution = trimmed.replace(/^[•\-\*]\s*/, '');
        }
      }
      if (currentEdu.degree || currentEdu.institution) {
        education.push(currentEdu);
      }
    }

    return education.slice(0, 5);
  }

  private extractExperience(text: string): Array<{ company: string; role: string; duration: string; description: string }> {
    const experiences: Array<{ company: string; role: string; duration: string; description: string }> = [];

    const expSection = text.match(
      /(?:experience|work experience|employment|professional experience)[:\s]*\n([\s\S]*?)(?=\n(?:education|projects|skills|certif|award)|$)/i
    );

    if (expSection) {
      const lines = expSection[1].split('\n').filter((l) => l.trim());
      let currentExp: { company: string; role: string; duration: string; description: string } | null = null;

      for (const line of lines) {
        const trimmed = line.trim();
        const dateMatch = trimmed.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d{2})/i);
        const roleMatch = trimmed.match(
          /(?:engineer|developer|intern|analyst|manager|designer|architect|consultant|lead|senior|junior)/i
        );

        if (roleMatch && trimmed.length < 100) {
          if (currentExp) experiences.push(currentExp);
          currentExp = {
            company: '',
            role: trimmed.replace(/^[•\-\*]\s*/, ''),
            duration: '',
            description: '',
          };
        } else if (currentExp) {
          if (dateMatch && !currentExp.duration) {
            currentExp.duration = trimmed;
          } else if (!currentExp.company && trimmed.length < 60) {
            currentExp.company = trimmed.replace(/^[•\-\*]\s*/, '');
          } else {
            currentExp.description += trimmed + ' ';
          }
        }
      }
      if (currentExp) experiences.push(currentExp);
    }

    return experiences.slice(0, 10);
  }

  private extractContactInfo(text: string): Record<string, string> {
    const contact: Record<string, string> = {};
    
    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    if (emailMatch) contact.email = emailMatch[0];

    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) contact.phone = phoneMatch[0];

    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) contact.linkedin = `https://${linkedinMatch[0]}`;

    const githubMatch = text.match(/github\.com\/[\w-]+/i);
    if (githubMatch) contact.github = `https://${githubMatch[0]}`;

    const portfolioMatch = text.match(/(?:portfolio|website)[:\s]*(https?:\/\/[\w.-]+\.\w+[\w/]*)/i);
    if (portfolioMatch) contact.portfolio = portfolioMatch[1];

    return contact;
  }

  private calculateATSScore(
    text: string, skills: string[], projects: any[], education: any[], experience: any[]
  ): number {
    let score = 0;

    // Has contact info (max 15 pts)
    const contact = this.extractContactInfo(text);
    score += Object.keys(contact).length * 3;
    score = Math.min(score, 15);

    // Skills count (max 20 pts)
    score += Math.min(skills.length * 2, 20);

    // Sections completeness (max 20 pts)
    if (skills.length > 0) score += 5;
    if (projects.length > 0) score += 5;
    if (education.length > 0) score += 5;
    if (experience.length > 0) score += 5;

    // Keywords density (max 15 pts)
    const keywordCount = IN_DEMAND_SKILLS.filter((s) =>
      text.toLowerCase().includes(s.toLowerCase())
    ).length;
    score += Math.min(keywordCount, 15);

    // Length appropriateness (max 15 pts) — ideal: 400-1500 words
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 1500) score += 15;
    else if (wordCount >= 200 && wordCount <= 2000) score += 10;
    else score += 5;

    // Action verbs (max 15 pts)
    const actionVerbCount = ACTION_VERBS.filter((v) =>
      text.toLowerCase().includes(v)
    ).length;
    score += Math.min(actionVerbCount * 2, 15);

    return Math.min(Math.round(score), 100);
  }

  private calculateQualityScore(
    text: string, skills: string[], projects: any[], experience: any[]
  ): number {
    let score = 0;

    // Quantified achievements (max 25 pts)
    const numbers = text.match(/\d+%|\d+x|\$\d+|\d+\+/g) || [];
    score += Math.min(numbers.length * 5, 25);

    // Action verbs usage (max 20 pts)
    const actionCount = ACTION_VERBS.filter((v) => text.toLowerCase().includes(v)).length;
    score += Math.min(actionCount * 3, 20);

    // Technical depth (max 20 pts)
    score += Math.min(skills.length * 1.5, 20);

    // Projects quality (max 20 pts)
    const projectsWithTech = projects.filter((p) => p.technologies.length > 0);
    score += Math.min(projectsWithTech.length * 5, 20);

    // Experience quality (max 15 pts)
    const expWithDesc = experience.filter((e) => e.description.length > 20);
    score += Math.min(expWithDesc.length * 5, 15);

    return Math.min(Math.round(score), 100);
  }

  private findMissingSkills(foundSkills: string[]): string[] {
    const highPrioritySkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
      'Git', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL',
      'REST API', 'CI/CD', 'System Design', 'Testing',
    ];

    return highPrioritySkills.filter(
      (skill) => !foundSkills.some((s) => s.toLowerCase() === skill.toLowerCase())
    );
  }

  private generateImprovementTips(
    text: string, skills: string[], projects: any[], experience: any[], atsScore: number
  ): string[] {
    const tips: string[] = [];

    if (atsScore < 60) {
      tips.push('Add more industry-relevant keywords to improve ATS compatibility');
    }

    const wordCount = text.split(/\s+/).length;
    if (wordCount < 300) {
      tips.push('Resume is too short. Add more details about your projects and experience');
    }
    if (wordCount > 1500) {
      tips.push('Resume is too long. Keep it concise — ideally 1-2 pages');
    }

    if (projects.length === 0) {
      tips.push('Add a Projects section to showcase your practical skills');
    }
    if (projects.length < 3) {
      tips.push('Add more projects (at least 3-4) to demonstrate your capabilities');
    }

    const actionCount = ACTION_VERBS.filter((v) => text.toLowerCase().includes(v)).length;
    if (actionCount < 5) {
      tips.push('Use more action verbs (e.g., "developed", "optimized", "deployed") to describe your work');
    }

    const numbers = text.match(/\d+%|\d+x|\$\d+|\d+\+/g) || [];
    if (numbers.length < 3) {
      tips.push('Quantify your achievements with numbers (e.g., "reduced load time by 40%")');
    }

    if (skills.length < 8) {
      tips.push('List more technical skills — aim for at least 8-12 relevant technologies');
    }

    if (!text.toLowerCase().includes('github') && !text.toLowerCase().includes('portfolio')) {
      tips.push('Add links to your GitHub profile and portfolio website');
    }

    if (experience.length === 0) {
      tips.push('Add internship or freelance experience to strengthen your profile');
    }

    return tips.slice(0, 8);
  }
}

export default new ResumeService();

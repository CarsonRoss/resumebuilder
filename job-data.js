// Job classification and suggestion data
const JOB_DATA = {
    // Job categories and their keywords
    categories: {
        technology: {
            keywords: ['software', 'developer', 'engineer', 'programmer', 'tech', 'data', 'web', 'mobile', 'full stack', 'frontend', 'backend', 'devops', 'cybersecurity', 'ai', 'machine learning', 'cloud'],
            sectionPriority: ['header', 'summary', 'skills', 'experience', 'education'],
            skills: [
                'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 
                'Docker', 'Kubernetes', 'HTML', 'CSS', 'MongoDB', 'PostgreSQL', 'REST APIs',
                'GraphQL', 'TypeScript', 'Vue.js', 'Angular', 'Express.js', 'Redis', 'Jenkins'
            ],
            summaryTemplates: [
                'Experienced {title} with {years}+ years developing scalable applications and solving complex technical challenges.',
                'Results-driven {title} specializing in {specialty} with expertise in modern development frameworks and agile methodologies.',
                'Innovative {title} passionate about creating efficient, user-friendly solutions using cutting-edge technologies.'
            ],
            bulletSuggestions: [
                'Developed and maintained {type} applications using {technologies}',
                'Improved application performance by {percentage}% through code optimization',
                'Led migration from legacy systems to modern {platform} architecture',
                'Collaborated with cross-functional teams to deliver {number} projects on time',
                'Implemented automated testing reducing bugs by {percentage}%',
                'Mentored {number} junior developers and conducted code reviews'
            ]
        },
        
        healthcare: {
            keywords: ['nurse', 'doctor', 'medical', 'healthcare', 'physician', 'therapist', 'clinical', 'hospital', 'patient', 'rn', 'md', 'healthcare', 'pharmacy', 'radiology'],
            sectionPriority: ['header', 'summary', 'education', 'experience', 'skills'],
            skills: [
                'Patient Care', 'Electronic Health Records (EHR)', 'CPR Certified', 'Medical Terminology',
                'IV Therapy', 'Wound Care', 'Medication Administration', 'Patient Assessment',
                'HIPAA Compliance', 'Clinical Documentation', 'Emergency Response', 'Team Collaboration'
            ],
            summaryTemplates: [
                'Compassionate {title} with {years}+ years providing exceptional patient care in {setting} environments.',
                'Dedicated {title} committed to improving patient outcomes through evidence-based practice and continuous professional development.',
                'Licensed {title} with expertise in {specialty} and strong clinical assessment skills.'
            ],
            bulletSuggestions: [
                'Provided comprehensive care to {number} patients daily in {unit} setting',
                'Maintained {percentage}% patient satisfaction scores through attentive care',
                'Collaborated with multidisciplinary teams to develop treatment plans',
                'Administered medications and monitored patient responses following protocols',
                'Educated patients and families on care procedures and discharge planning',
                'Maintained accurate documentation in compliance with healthcare regulations'
            ]
        },
        
        education: {
            keywords: ['teacher', 'educator', 'professor', 'instructor', 'tutor', 'principal', 'academic', 'curriculum', 'classroom', 'school', 'university', 'college'],
            sectionPriority: ['header', 'summary', 'education', 'experience', 'skills'],
            skills: [
                'Curriculum Development', 'Classroom Management', 'Student Assessment', 'Educational Technology',
                'Differentiated Instruction', 'Parent Communication', 'Lesson Planning', 'Google Classroom',
                'Microsoft Office', 'Learning Management Systems', 'Special Education', 'ESL Instruction'
            ],
            summaryTemplates: [
                'Passionate {title} with {years}+ years inspiring students and fostering academic growth in diverse learning environments.',
                'Dedicated {title} committed to creating engaging, inclusive classrooms that support all learners.',
                'Experienced {title} specializing in {subject} with proven ability to improve student outcomes.'
            ],
            bulletSuggestions: [
                'Taught {subject} to {number} students across {grades} grade levels',
                'Improved student test scores by {percentage}% through innovative teaching methods',
                'Developed and implemented curriculum aligned with state standards',
                'Collaborated with parents and administrators to support student success',
                'Integrated technology tools to enhance student engagement and learning',
                'Mentored new teachers and participated in professional development programs'
            ]
        },
        
        business: {
            keywords: ['manager', 'analyst', 'consultant', 'coordinator', 'administrator', 'executive', 'director', 'sales', 'marketing', 'finance', 'operations', 'project manager'],
            sectionPriority: ['header', 'summary', 'experience', 'education', 'skills'],
            skills: [
                'Project Management', 'Data Analysis', 'Microsoft Excel', 'PowerPoint', 'Strategic Planning',
                'Team Leadership', 'Budget Management', 'Process Improvement', 'Customer Relations',
                'Market Research', 'CRM Software', 'Financial Modeling', 'Agile Methodology'
            ],
            summaryTemplates: [
                'Results-oriented {title} with {years}+ years driving business growth and operational excellence.',
                'Strategic {title} with proven track record of leading teams and delivering measurable results.',
                'Dynamic {title} specializing in {area} with expertise in process optimization and stakeholder management.'
            ],
            bulletSuggestions: [
                'Managed {type} projects with budgets up to ${amount} and teams of {number}',
                'Increased {metric} by {percentage}% through strategic initiatives and process improvements',
                'Led cross-functional teams to deliver {number} successful projects on time and under budget',
                'Developed and implemented strategies that resulted in ${amount} in cost savings',
                'Analyzed market trends and customer data to inform business decisions',
                'Built and maintained relationships with key stakeholders and clients'
            ]
        },
        
        creative: {
            keywords: ['designer', 'artist', 'creative', 'marketing', 'graphic', 'ui', 'ux', 'brand', 'content', 'writer', 'photographer', 'video', 'social media'],
            sectionPriority: ['header', 'summary', 'experience', 'skills', 'education'],
            skills: [
                'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Sketch',
                'UI/UX Design', 'Branding', 'Typography', 'Content Creation', 'Social Media Marketing',
                'Video Editing', 'Photography', 'HTML/CSS', 'Wireframing', 'Prototyping'
            ],
            summaryTemplates: [
                'Creative {title} with {years}+ years designing compelling visual experiences and brand solutions.',
                'Innovative {title} passionate about creating user-centered designs that drive engagement and results.',
                'Versatile {title} combining artistic vision with strategic thinking to deliver impactful creative solutions.'
            ],
            bulletSuggestions: [
                'Designed {number} creative campaigns resulting in {percentage}% increase in engagement',
                'Created brand identity and visual assets for {number} clients across diverse industries',
                'Collaborated with marketing teams to develop multimedia content for digital platforms',
                'Managed design projects from concept to completion within tight deadlines',
                'Conducted user research and usability testing to inform design decisions',
                'Maintained brand consistency across all marketing materials and touchpoints'
            ]
        },
        
        sales: {
            keywords: ['sales', 'account', 'business development', 'relationship', 'revenue', 'client', 'customer', 'representative', 'account executive'],
            sectionPriority: ['header', 'summary', 'experience', 'skills', 'education'],
            skills: [
                'Relationship Building', 'Lead Generation', 'Sales Forecasting', 'CRM (Salesforce, HubSpot)',
                'Negotiation', 'Presentation Skills', 'Account Management', 'Pipeline Management',
                'Cold Calling', 'Market Analysis', 'Customer Retention', 'Territory Management'
            ],
            summaryTemplates: [
                'High-performing {title} with {years}+ years exceeding sales targets and building lasting client relationships.',
                'Results-driven {title} with proven ability to drive revenue growth and expand market presence.',
                'Dynamic {title} specializing in {industry} sales with expertise in consultative selling and account development.'
            ],
            bulletSuggestions: [
                'Exceeded sales quotas by {percentage}% for {number} consecutive years',
                'Generated ${amount} in new business revenue through strategic prospecting',
                'Built and maintained a pipeline of {number}+ qualified prospects',
                'Developed key accounts resulting in {percentage}% increase in customer retention',
                'Collaborated with marketing team to develop targeted sales campaigns',
                'Mentored new sales team members and shared best practices'
            ]
        },
        
        engineering: {
            keywords: ['mechanical', 'civil', 'electrical', 'chemical', 'industrial', 'aerospace', 'biomedical', 'environmental', 'structural', 'manufacturing'],
            sectionPriority: ['header', 'summary', 'experience', 'skills', 'education'],
            skills: [
                'AutoCAD', 'SolidWorks', 'MATLAB', 'Project Management', 'Technical Documentation',
                'Quality Assurance', 'Six Sigma', 'Lean Manufacturing', 'Risk Assessment',
                'Design Optimization', 'Regulatory Compliance', 'Problem Solving', 'Data Analysis'
            ],
            summaryTemplates: [
                'Licensed {title} with {years}+ years designing innovative solutions and managing complex technical projects.',
                'Experienced {title} specializing in {specialty} with expertise in design optimization and regulatory compliance.',
                'Detail-oriented {title} committed to delivering high-quality engineering solutions that meet client specifications.'
            ],
            bulletSuggestions: [
                'Designed and analyzed {type} systems for {number} major projects',
                'Reduced production costs by {percentage}% through process optimization',
                'Led multidisciplinary engineering teams to deliver projects on schedule',
                'Ensured compliance with industry standards and safety regulations',
                'Conducted feasibility studies and risk assessments for new projects',
                'Collaborated with clients and stakeholders to define technical requirements'
            ]
        }
    },
    
    // Function to classify job title
    classifyJob: function(jobTitle) {
        if (!jobTitle) return null;
        
        const title = jobTitle.toLowerCase();
        
        for (const [category, data] of Object.entries(this.categories)) {
            if (data.keywords.some(keyword => title.includes(keyword))) {
                return {
                    category,
                    data
                };
            }
        }
        
        // Default to business category if no match
        return {
            category: 'business',
            data: this.categories.business
        };
    },
    
    // Generate personalized summary suggestions
    getSummaryTemplates: function(jobTitle, category) {
        const categoryData = this.categories[category];
        if (!categoryData) return [];
        
        return categoryData.summaryTemplates.map(template => 
            template.replace('{title}', jobTitle)
        );
    },
    
    // Generate skill suggestions
    getSkillSuggestions: function(category) {
        const categoryData = this.categories[category];
        return categoryData ? categoryData.skills : [];
    },
    
    // Generate bullet point suggestions for experience
    getBulletSuggestions: function(category) {
        const categoryData = this.categories[category];
        return categoryData ? categoryData.bulletSuggestions : [];
    },
    
    // Get section priority order for resume layout
    getSectionPriority: function(category) {
        const categoryData = this.categories[category];
        return categoryData ? categoryData.sectionPriority : ['header', 'summary', 'experience', 'education', 'skills'];
    }
};

// Export for use in main script
window.JOB_DATA = JOB_DATA;

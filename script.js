// Global variables
let currentJobClassification = null;
let experienceCount = 1;
let educationCount = 1;
// AI suggestions state
let aiBulletSuggestions = [];
let aiSuggestionsLoading = false;

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
    initializeEventListeners();
    initializeTooltips();
    // Character counter setup removed with summary section

    // Track page load for analytics
    gtag("event", "page_view", {
        page_title: "Resume Generator",
        page_location: window.location.href,
    });
});

// Initialize all event listeners
function initializeEventListeners() {
    // Job title input - key feature
    const jobTitleInput = document.getElementById("jobTitle");
    jobTitleInput.addEventListener("input", handleJobTitleChange);

    // Form inputs for real-time preview and validation
    const formInputs = document.querySelectorAll("input, textarea, select");
    formInputs.forEach((input) => {
        input.addEventListener("input", () => {
            updateResumePreview();
            clearValidationErrors();
            updateCarousel(); // Update button state based on validation
        });
    });

    // Template selector
    const templateSelector = document.getElementById("template");
    templateSelector.addEventListener("change", updateResumeTemplate);

    // Action buttons
    // Download PDF event listener is set after html2canvas loads
    document.getElementById("clearForm").addEventListener("click", clearForm);

    // Add/Remove buttons
    document
        .getElementById("addExperience")
        .addEventListener("click", addExperience);
    document
        .getElementById("addEducation")
        .addEventListener("click", addEducation);

    // Character counters
    document
        .getElementById("summary")
        .addEventListener("input", updateCharacterCount);

    // GPA input handlers
    document.querySelectorAll(".gpa").forEach((input) => {
        input.addEventListener("input", handleGPAInput);
    });

    // Phone number formatting
    document
        .getElementById("phone")
        .addEventListener("input", handlePhoneInput);

    // Email validation
    document
        .getElementById("email")
        .addEventListener("input", handleEmailInput);

    // Removed resize handler - no dynamic sizing
}

// Handle job title changes - core functionality
function handleJobTitleChange(event) {
    const jobTitle = event.target.value.trim();

    if (jobTitle.length < 2) {
        currentJobClassification = null;
        document.getElementById("jobCategory").textContent = "";
        clearSuggestions();
        updateResumePreview();
        return;
    }

    // Classify the job
    currentJobClassification = JOB_DATA.classifyJob(jobTitle);

    if (currentJobClassification) {
        // Display job category
        const categoryDisplay = document.getElementById("jobCategory");
        categoryDisplay.textContent = `Category: ${currentJobClassification.category.charAt(0).toUpperCase() + currentJobClassification.category.slice(1)}`;

        // Update suggestions based on job classification
        updateSuggestions(jobTitle);

        // Track job classification for analytics
        gtag("event", "job_classified", {
            job_title: jobTitle,
            category: currentJobClassification.category,
        });
    }

    updateResumePreview();
    // Trigger AI bullet suggestions based on the entered job title
    requestAIBullets(jobTitle);
}

// Update suggestions based on job classification
function updateSuggestions(jobTitle) {
    if (!currentJobClassification) return;

    const category = currentJobClassification.category;

    // Update summary suggestions
    updateSummarySuggestions(jobTitle, category);

    // Update skills suggestions
    updateSkillsSuggestions(category);

    // Update experience bullet suggestions
    updateExperienceSuggestions(category);
}

// Professional summary section removed - function disabled
function updateSummarySuggestions(jobTitle, category) {
    // Summary suggestions disabled
    return;
}

// Update skills suggestions
function updateSkillsSuggestions(category) {
    const suggestionsContainer = document.getElementById("skillsSuggestions");
    const skills = JOB_DATA.getSkillSuggestions(category);

    if (skills.length === 0) {
        suggestionsContainer.innerHTML = "";
        return;
    }

    let html = '<h4>Recommended Skills:</h4><div class="suggestion-tags">';
    skills.forEach((skill) => {
        html += `<span class="suggestion-tag" onclick="addSkill('${skill}')">${skill}</span>`;
    });
    html += "</div>";

    suggestionsContainer.innerHTML = html;
}

// Update experience bullet suggestions
function updateExperienceSuggestions(category) {
    const bullets = JOB_DATA.getBulletSuggestions(category);

    document
        .querySelectorAll(".achievements-suggestions")
        .forEach((container, index) => {
            if (bullets.length === 0) {
                container.innerHTML = "";
                return;
            }

            // Get currently used bullet points for this experience
            const usedBullets = getUsedBulletPoints(index);

            // Filter out already used bullets
            const availableBullets = bullets.filter(
                (bullet) => !usedBullets.includes(bullet),
            );

            if (availableBullets.length === 0) {
                container.innerHTML =
                    '<h4>Bullet Point Suggestions:</h4><p class="no-suggestions">All suggestions have been added. Delete bullet points to see more suggestions.</p>';
                return;
            }

            let html = "<h4>Bullet Point Suggestions:</h4>";
            // AI suggestions section
            if (aiSuggestionsLoading) {
                html += '<div class="suggestion-item loading">Generating AI suggestions…</div>';
            } else if (aiBulletSuggestions.length > 0) {
                html += '<div class="suggestion-group"><div class="suggestion-group-title">AI Suggestions</div>';
                aiBulletSuggestions.slice(0, 4).forEach((bullet) => {
                    html += `<div class="suggestion-item" onclick="addBulletPoint(${index}, '${bullet.replace(/'/g, "\\'")}')">• ${bullet}</div>`;
                });
                html += '</div>';
            }
            // Static suggestions section
            html += '<div class="suggestion-group"><div class="suggestion-group-title">More Suggestions</div>';
            availableBullets.slice(0, 6).forEach((bullet) => {
                html += `<div class="suggestion-item" onclick="addBulletPoint(${index}, '${bullet.replace(/'/g, "\\'")}')">
                • ${bullet}
            </div>`;
            });
            html += '</div>';

            container.innerHTML = html;
        });
}

// Clear all suggestions
function clearSuggestions() {
    document.getElementById("summarySuggestions").innerHTML = "";
    document.getElementById("skillsSuggestions").innerHTML = "";
    document
        .querySelectorAll(".achievements-suggestions")
        .forEach((container) => {
            container.innerHTML = "";
        });
    aiBulletSuggestions = [];
}

// Handle GPA input to provide visual feedback
function handleGPAInput(event) {
    const input = event.target;
    const value = input.value.trim();

    // Remove any existing warning
    const existingWarning = input.parentNode.querySelector(".gpa-warning");
    if (existingWarning) {
        existingWarning.remove();
    }

    if (value) {
        // Extract numeric GPA value
        const gpaMatch = value.match(/(\d+\.?\d*)/);
        if (gpaMatch) {
            const numericGPA = parseFloat(gpaMatch[1]);
            if (numericGPA < 3.5) {
                // Add warning message
                const warning = document.createElement("div");
                warning.className = "gpa-warning";
                warning.innerHTML =
                    '<i class="fas fa-info-circle"></i> GPA under 3.5 will not appear on resume';
                input.parentNode.appendChild(warning);
            }
        }
    }
}

// Handle phone number formatting and validation
function handlePhoneInput(event) {
    console.log("Phone input handler called");
    const input = event.target;
    let value = input.value;
    console.log("Input value:", value);

    // Remove any existing validation message
    const existingValidation =
        input.parentNode.querySelector(".phone-validation");
    if (existingValidation) {
        existingValidation.remove();
    }

    // Strip all non-numeric characters
    const numericOnly = value.replace(/\D/g, "");
    console.log("Numeric only:", numericOnly);

    // Format the phone number
    let formattedValue = "";
    if (numericOnly.length > 0) {
        if (numericOnly.length <= 3) {
            formattedValue = numericOnly;
        } else if (numericOnly.length <= 6) {
            formattedValue =
                numericOnly.slice(0, 3) + "-" + numericOnly.slice(3);
        } else if (numericOnly.length <= 10) {
            formattedValue =
                numericOnly.slice(0, 3) +
                "-" +
                numericOnly.slice(3, 6) +
                "-" +
                numericOnly.slice(6);
        } else {
            // Limit to 10 digits
            formattedValue =
                numericOnly.slice(0, 3) +
                "-" +
                numericOnly.slice(3, 6) +
                "-" +
                numericOnly.slice(6, 10);
        }
    }

    console.log("Formatted value:", formattedValue);

    // Set cursor position before updating value
    const cursorPosition = getCursorPosition(
        input.value,
        formattedValue,
        input.selectionStart,
    );

    // Update input value
    input.value = formattedValue;

    // Restore cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);

    // Validate phone number
    if (numericOnly.length > 0 && numericOnly.length !== 10) {
        // Show validation warning
        const validation = document.createElement("div");
        validation.className = "phone-validation";
        validation.innerHTML =
            '<i class="fas fa-exclamation-triangle"></i> Phone number must be exactly 10 digits';
        input.parentNode.appendChild(validation);
    } else if (numericOnly.length === 10) {
        // Show success indicator
        const validation = document.createElement("div");
        validation.className = "phone-validation phone-valid";
        validation.innerHTML =
            '<i class="fas fa-check-circle"></i> Valid phone number format';
        input.parentNode.appendChild(validation);
    }
}

// Helper function to calculate cursor position after formatting
function getCursorPosition(oldValue, newValue, oldCursor) {
    // Count how many digits are before the cursor in the old value
    const digitsBeforeCursor = (
        oldValue.substring(0, oldCursor).match(/\d/g) || []
    ).length;

    // Find the position in the new value where we have the same number of digits
    let newCursor = 0;
    let digitCount = 0;

    for (let i = 0; i < newValue.length; i++) {
        if (/\d/.test(newValue[i])) {
            digitCount++;
            if (digitCount === digitsBeforeCursor) {
                newCursor = i + 1;
                break;
            }
        }
        if (digitCount < digitsBeforeCursor) {
            newCursor = i + 1;
        }
    }

    return Math.min(newCursor, newValue.length);
}

// Contact font size is now fixed - no dynamic adjustment

// Apply suggestion functions
// Professional summary function removed - no longer needed

function addSkill(skill) {
    const skillsTextarea = document.getElementById("skills");
    const currentSkills = skillsTextarea.value.trim();

    if (currentSkills === "") {
        skillsTextarea.value = skill;
    } else {
        const skillsArray = currentSkills.split(",").map((s) => s.trim());
        if (!skillsArray.includes(skill)) {
            skillsTextarea.value = currentSkills + ", " + skill;
        }
    }

    updateResumePreview();
}

// Helper function to get used bullet points for an experience entry
function getUsedBulletPoints(experienceIndex) {
    const achievementsTextarea = document.querySelector(
        `.experience-item[data-index="${experienceIndex}"] .achievements`,
    );
    if (!achievementsTextarea || !achievementsTextarea.value) {
        return [];
    }

    // Extract bullet points, removing the bullet symbols and trimming whitespace
    const bulletLines = achievementsTextarea.value
        .split("\n")
        .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
        .filter((line) => line.length > 0);

    return bulletLines;
}

function addBulletPoint(experienceIndex, bullet) {
    const achievementsTextarea = document.querySelector(
        `.experience-item[data-index="${experienceIndex}"] .achievements`,
    );
    const currentAchievements = achievementsTextarea.value.trim();

    // Check if the bullet point already exists
    const usedBullets = getUsedBulletPoints(experienceIndex);
    if (usedBullets.includes(bullet)) {
        return; // Don't add duplicate bullet points
    }

    if (currentAchievements === "") {
        achievementsTextarea.value = "• " + bullet;
    } else {
        achievementsTextarea.value = currentAchievements + "\n• " + bullet;
    }

    updateResumePreview();

    // Refresh suggestions to remove the added bullet point
    if (currentJobClassification) {
        updateExperienceSuggestions(currentJobClassification.category);
    }
}

// Experience management
function addExperience() {
    if (experienceCount >= 3) {
        alert("Maximum 3 work experiences allowed.");
        return;
    }

    const container = document.getElementById("experienceContainer");
    const experienceItem = createExperienceItem(experienceCount);
    container.appendChild(experienceItem);
    experienceCount++;

    // Add event listeners to new inputs
    const newInputs = experienceItem.querySelectorAll("input, textarea");
    newInputs.forEach((input) => {
        input.addEventListener("input", function () {
            updateResumePreview();
            // Refresh suggestions when achievements textarea changes
            if (
                input.classList.contains("achievements") &&
                currentJobClassification
            ) {
                setTimeout(
                    () =>
                        updateExperienceSuggestions(
                            currentJobClassification.category,
                        ),
                    100,
                );
            }
            // Add date validation for start dates
            if (input.classList.contains("startDate")) {
                handleStartDateInput(event);
            }
            // Add date validation for end dates
            if (input.classList.contains("endDate")) {
                handleEndDateInput(event);
            }
        });
    });

    // Update suggestions for new experience
    if (currentJobClassification) {
        updateExperienceSuggestions(currentJobClassification.category);
    }
}

function createExperienceItem(index) {
    const div = document.createElement("div");
    div.className = "experience-item";
    div.setAttribute("data-index", index);

    div.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" class="company" placeholder="Tech Corp">
            </div>
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" class="jobTitle" placeholder="Software Developer">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Start Date</label>
                <input type="text" class="startDate" placeholder="Jan 2022">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="text" class="endDate" placeholder="Present">
            </div>
        </div>
        <div class="form-group">
            <label>Location</label>
            <input type="text" class="jobLocation" placeholder="San Francisco, CA">
        </div>
        <div class="form-group">
            <label>Key Achievements (3-4 bullet points)</label>
            <textarea class="achievements" rows="4" placeholder="• Developed web applications using React and Node.js&#10;• Improved system performance by 40%&#10;• Led a team of 3 junior developers&#10;• Implemented CI/CD pipelines"></textarea>
            <div class="suggestions achievements-suggestions" data-index="${index}"></div>
        </div>
        <button type="button" class="remove-btn" onclick="removeExperience(${index})">
            <i class="fas fa-trash"></i> Remove
        </button>
    `;

    return div;
}

function removeExperience(index) {
    const item = document.querySelector(
        `.experience-item[data-index="${index}"]`,
    );
    if (item) {
        item.remove();
        updateResumePreview();
    }
}

// Education management
function addEducation() {
    if (educationCount >= 2) {
        alert("Maximum 2 education entries allowed.");
        return;
    }

    const container = document.getElementById("educationContainer");
    const educationItem = createEducationItem(educationCount);
    container.appendChild(educationItem);
    educationCount++;

    // Add event listeners to new inputs
    const newInputs = educationItem.querySelectorAll("input");
    newInputs.forEach((input) => {
        input.addEventListener("input", function (event) {
            updateResumePreview();
            // Add date validation for graduation year
            if (input.classList.contains("gradYear")) {
                handleStartDateInput(event);
            }
        });
        if (input.classList.contains("gpa")) {
            input.addEventListener("input", handleGPAInput);
        }
    });
}

function createEducationItem(index) {
    const div = document.createElement("div");
    div.className = "education-item";
    div.setAttribute("data-index", index);

    div.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>School Name</label>
                <input type="text" class="school" placeholder="University of California">
            </div>
            <div class="form-group">
                <label>Degree</label>
                <input type="text" class="degree" placeholder="Bachelor of Science in Computer Science">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Graduation Year</label>
                <input type="text" class="gradYear" placeholder="2021">
            </div>
            <div class="form-group">
                <label>
                    GPA (Optional)
                    <span class="tooltip" data-tip="Only included if 3.5 or higher - lower GPAs are automatically hidden">?</span>
                </label>
                <input type="text" class="gpa" placeholder="3.8/4.0">
            </div>
        </div>
        <button type="button" class="remove-btn" onclick="removeEducation(${index})">
            <i class="fas fa-trash"></i> Remove
        </button>
    `;

    return div;
}

function removeEducation(index) {
    const item = document.querySelector(
        `.education-item[data-index="${index}"]`,
    );
    if (item) {
        item.remove();
        updateResumePreview();
    }
}

// Resume preview update - core functionality
function updateResumePreview() {
    const formData = collectFormData();

    if (!formData.fullName && !formData.jobTitle) {
        showPreviewPlaceholder();
        return;
    }

    const resumeHtml = generateResumeHTML(formData);
    const previewContainer = document.getElementById("resumePreview");
    previewContainer.innerHTML = `<div class="resume-content ${formData.template}">${resumeHtml}</div>`;

    // Adjust contact font size after rendering
    // No dynamic adjustments - fixed layout only
}

// Collect all form data
function collectFormData() {
    const formData = {
        // Header
        fullName: document.getElementById("fullName").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        linkedin: document.getElementById("linkedin").value.trim(),
        location: document.getElementById("location").value.trim(),

        // Job and template
        jobTitle: document.getElementById("jobTitle").value.trim(),
        template: document.getElementById("template").value,

        // Summary
        // summary field removed

        // Skills
        skills: document.getElementById("skills").value.trim(),

        // Experience
        experience: [],

        // Education
        education: [],
    };

    // Collect experience data
    document.querySelectorAll(".experience-item").forEach((item) => {
        const company = item.querySelector(".company").value.trim();
        const jobTitle = item.querySelector(".jobTitle").value.trim();
        const startDate = item.querySelector(".startDate").value.trim();
        const endDate = item.querySelector(".endDate").value.trim();
        const jobLocation = item.querySelector(".jobLocation").value.trim();
        const achievements = item.querySelector(".achievements").value.trim();

        if (company || jobTitle) {
            formData.experience.push({
                company,
                jobTitle,
                startDate,
                endDate,
                location: jobLocation,
                achievements: achievements
                    .split("\n")
                    .filter((line) => line.trim()),
            });
        }
    });

    // Collect education data
    document.querySelectorAll(".education-item").forEach((item) => {
        const school = item.querySelector(".school").value.trim();
        const degree = item.querySelector(".degree").value.trim();
        const gradYear = item.querySelector(".gradYear").value.trim();
        const gpa = item.querySelector(".gpa").value.trim();

        if (school || degree) {
            formData.education.push({
                school,
                degree,
                gradYear,
                gpa,
            });
        }
    });

    return formData;
}

// Generate resume HTML based on job classification
function generateResumeHTML(formData) {
    let html = "";

    // Get section priority based on job classification
    let sectionPriority = [
        "header",
        "summary",
        "experience",
        "education",
        "skills",
    ];
    if (currentJobClassification) {
        sectionPriority = JOB_DATA.getSectionPriority(
            currentJobClassification.category,
        );
    }

    // Generate sections in priority order
    sectionPriority.forEach((section) => {
        switch (section) {
            case "header":
                html += generateHeader(formData);
                break;
            case "summary":
                if (formData.summary) {
                    html += generateSummary(formData);
                }
                break;
            case "experience":
                if (formData.experience.length > 0) {
                    html += generateExperience(formData);
                }
                break;
            case "education":
                if (formData.education.length > 0) {
                    html += generateEducation(formData);
                }
                break;
            case "skills":
                if (formData.skills) {
                    html += generateSkills(formData);
                }
                break;
        }
    });

    return html;
}

// Generate resume sections
function generateHeader(formData) {
    const hasLinkedIn = !!formData.linkedin;
    const contactParts = [];
    if (formData.email) contactParts.push(formData.email);
    if (formData.phone) contactParts.push(formData.phone);
    const hasRight = !!(formData.location || contactParts.length > 0);

    return `
        <div class="resume-header">
            <div class="header-left">
                <div class="resume-name">${formData.fullName || "Your Name"}</div>
                ${hasLinkedIn ? `<div class="resume-linkedin">${formData.linkedin}</div>` : ""}
            </div>
            ${hasRight ? `
            <div class="header-right">
                ${formData.location ? `<div class="resume-location">${formData.location}</div>` : ""}
                ${contactParts.length ? `<div class="resume-contact-line">${contactParts.join("  •  ")}</div>` : ""}
            </div>
            ` : ""}
        </div>
    `;
}

function generateSummary(formData) {
    // Professional summary section removed - return empty string
    return "";
}

function generateExperience(formData) {
    let html = `
        <div class="resume-section">
            <div class="resume-section-title">Work Experience</div>
    `;

    formData.experience.forEach((exp) => {
        const dateRange =
            exp.startDate && exp.endDate
                ? `${exp.startDate} - ${exp.endDate}`
                : "";

        html += `
            <div class="experience-entry">
                <div class="entry-header">
                    <div>
                        <div class="entry-title">${exp.jobTitle}</div>
                        <div class="entry-company">${exp.company}</div>
                    </div>
                    <div class="entry-date">${dateRange}</div>
                </div>
                ${exp.location ? `<div class="entry-location">${exp.location}</div>` : ""}
                <div class="entry-achievements">
                    <ul>
                        ${exp.achievements.map((achievement) => `<li>${achievement.replace(/^•\s*/, "")}</li>`).join("")}
                    </ul>
                </div>
            </div>
        `;
    });

    html += "</div>";
    return html;
}

function generateEducation(formData) {
    let html = `
        <div class="resume-section">
            <div class="resume-section-title">Education</div>
    `;

    formData.education.forEach((edu) => {
        // Parse GPA to check if it should be displayed
        let showGPA = false;
        let gpaValue = "";

        if (edu.gpa) {
            // Extract numeric GPA value (handles formats like "3.7", "3.8/4.0", "3.9 / 4.0")
            const gpaMatch = edu.gpa.match(/(\d+\.?\d*)/);
            if (gpaMatch) {
                const numericGPA = parseFloat(gpaMatch[1]);
                if (numericGPA >= 3.5) {
                    showGPA = true;
                    gpaValue = edu.gpa;
                }
            }
        }

        html += `
            <div class="education-entry">
                <div class="entry-header">
                    <div>
                        <div class="entry-title">${edu.degree}</div>
                        <div class="entry-company">${edu.school}</div>
                    </div>
                    <div class="entry-date">${edu.gradYear}</div>
                </div>
                ${showGPA ? `<div class="entry-location">GPA: ${gpaValue}</div>` : ""}
            </div>
        `;
    });

    html += "</div>";
    return html;
}

function generateSkills(formData) {
    const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill);

    return `
        <div class="resume-section">
            <div class="resume-section-title">Skills</div>
            <div class="skills-list">
                ${skillsArray.map((skill) => `<span class="skill-item">${skill}</span>`).join("")}
            </div>
        </div>
    `;
}

// Show placeholder when no data
function showPreviewPlaceholder() {
    const previewContainer = document.getElementById("resumePreview");
    previewContainer.innerHTML = `
        <div class="resume-content">
            <div class="preview-placeholder">
                <i class="fas fa-file-alt"></i>
                <p>Enter your job title to see a tailored resume preview</p>
            </div>
        </div>
    `;
}

// Template switching
function updateResumeTemplate() {
    console.log("Template changed to:", document.getElementById("template").value);
    updateResumePreview();
}

// High-Quality PDF Download functionality at 150 DPI
function downloadPDF() {
    const formData = collectFormData();

    if (!formData.fullName) {
        alert("Please enter your full name before downloading.");
        return;
    }

    // Track download event
    gtag("event", "resume_download", {
        job_title: formData.jobTitle,
        category: currentJobClassification
            ? currentJobClassification.category
            : "unknown",
        template: formData.template,
    });

    const { jsPDF } = window.jspdf;

    // Create PDF at higher resolution for 150 DPI
    // Letter size: 8.5" x 11" = 1275 x 1650 pixels at 150 DPI
    const dpiScale = 150 / 72; // 2.08 scale factor
    const letterWidth = 8.5 * 150; // 1275 pixels at 150 DPI
    const letterHeight = 11 * 150; // 1650 pixels at 150 DPI

    // Initialize PDF with 150 DPI equivalent settings
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [letterWidth / dpiScale, letterHeight / dpiScale], // Convert back to 72 DPI units for jsPDF
    });

    // Get resume content
    const resumeHtml = generateResumeHTML(formData);

    // Create a temporary div for PDF generation with precise sizing
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = resumeHtml;
    tempDiv.className = `resume-content ${formData.template}`;

    // Set container styles for optimal PDF rendering
    tempDiv.style.position = "absolute";
    tempDiv.style.top = "-9999px";
    tempDiv.style.left = "0";
    tempDiv.style.width = `${letterWidth}px`; // Full width at 150 DPI
    tempDiv.style.minHeight = `${letterHeight}px`; // Full height at 150 DPI
    tempDiv.style.padding = `${0.5 * 150}px`; // 0.5 inch margins = 75px at 150 DPI
    tempDiv.style.fontFamily = "Inter, Arial, sans-serif";
    tempDiv.style.fontSize = `${10 * dpiScale}px`; // Match preview base 10pt at 150 DPI
    tempDiv.style.lineHeight = "1.4";
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.boxSizing = "border-box";
    tempDiv.style.overflow = "hidden";

    // Apply high-resolution styles with proper color definitions
    const style = document.createElement("style");
    style.textContent = `
        .temp-pdf-container * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        }
        .temp-pdf-container {
            background-color: #ffffff !important;
            padding: 75px !important; /* 0.5 inch margins at 150 DPI */
        }
        .temp-pdf-container .resume-header { display: flex; justify-content: space-between; align-items: flex-start; gap: ${16 * dpiScale}px; border-bottom-width: ${2 * dpiScale}px; padding-bottom: ${20 * dpiScale}px; margin-bottom: ${30 * dpiScale}px; }
        .temp-pdf-container .header-left { display: flex; flex-direction: column; gap: ${6 * dpiScale}px; }
        .temp-pdf-container .header-right { display: flex; flex-direction: column; gap: ${6 * dpiScale}px; text-align: right; align-items: flex-end; }
        .temp-pdf-container .resume-name { font-size: ${11 * dpiScale}px !important; font-weight: 600; }
        .temp-pdf-container .resume-linkedin { font-size: ${11 * dpiScale}px !important; }
        .temp-pdf-container .resume-email, .temp-pdf-container .resume-phone { font-size: ${11 * dpiScale}px !important; }
        .temp-pdf-container .resume-location { font-size: ${11 * dpiScale}px !important; }
        .temp-pdf-container .resume-contact-line { font-size: ${11 * dpiScale}px !important; }
        .temp-pdf-container .resume-section-title {
            font-size: ${11 * dpiScale}px !important; /* preview: 11pt */
            font-weight: 600;
            margin: ${20 * dpiScale}px 0 ${12 * dpiScale}px 0;
            padding-bottom: ${8 * dpiScale}px;
        }
        .temp-pdf-container .entry-header { margin-bottom: ${6 * dpiScale}px; }
        .temp-pdf-container .entry-title { font-weight: 600; font-size: ${10 * dpiScale}px !important; } /* preview: 10pt */
        /* Fix small fonts in PDF export */
        .temp-pdf-container .entry-company,
        .temp-pdf-container .entry-school { font-size: ${10 * dpiScale}px !important; font-weight: 500; } /* preview: 10pt */
        .temp-pdf-container .entry-date { font-size: ${9 * dpiScale}px !important; font-style: italic; } /* preview: 9pt */
        .temp-pdf-container .entry-location { font-size: ${11 * dpiScale}px !important; font-weight: 500; } /* preview: 11pt */
        .temp-pdf-container li { margin-bottom: ${4 * dpiScale}px; font-size: ${9.5 * dpiScale}px !important; line-height: 1.5; } /* preview: 9.5pt */
        .temp-pdf-container .skills-list { display: flex; flex-wrap: wrap; gap: ${8 * dpiScale}px; }
        .temp-pdf-container .skill-item { font-size: ${9 * dpiScale}px !important; padding: ${4 * dpiScale}px ${8 * dpiScale}px; border-radius: ${4 * dpiScale}px; }
    `;
    // Preserve existing template classes and add the temp container class
    tempDiv.classList.add("temp-pdf-container");
    document.head.appendChild(style);
    document.body.appendChild(tempDiv);

    // Wait for fonts and rendering to complete
    setTimeout(() => {
        // Use html2canvas with maximum quality settings and color preservation
        html2canvas(tempDiv, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            width: letterWidth,
            height: tempDiv.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: letterWidth,
            windowHeight: tempDiv.scrollHeight,
            logging: false,
            removeContainer: true,
            imageTimeout: 0,
            onclone: (clonedDoc) => {
                // Ensure fonts and PDF sizing helpers are loaded in cloned document
                const clonedStyle = clonedDoc.createElement("style");
                clonedStyle.textContent = style.textContent;
                clonedDoc.head.appendChild(clonedStyle);
            },
        })
            .then((canvas) => {
                // Convert canvas to high-quality PNG to preserve colors
                const imgData = canvas.toDataURL("image/png", 1.0); // Use PNG for better color preservation

                // Calculate dimensions for PDF
                const pdfWidth = letterWidth / dpiScale; // Convert back to 72 DPI for jsPDF
                const pdfHeight = letterHeight / dpiScale;
                const imgAspectRatio = canvas.height / canvas.width;
                const imgHeight = pdfWidth * imgAspectRatio;

                // Add image to PDF with color preservation
                if (imgHeight <= pdfHeight) {
                    // Single page
                    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
                } else {
                    // Multiple pages
                    let yOffset = 0;
                    const pageHeight = pdfHeight;

                    while (yOffset < imgHeight) {
                        if (yOffset > 0) pdf.addPage();

                        const sourceY = (yOffset / imgHeight) * canvas.height;
                        const sourceHeight = Math.min(
                            (pageHeight / imgHeight) * canvas.height,
                            canvas.height - sourceY,
                        );

                        // Create temporary canvas for this page with proper color space
                        const pageCanvas = document.createElement("canvas");
                        pageCanvas.width = canvas.width;
                        pageCanvas.height = sourceHeight;
                        const pageCtx = pageCanvas.getContext("2d");

                        // Set white background to ensure proper color rendering
                        pageCtx.fillStyle = "#ffffff";
                        pageCtx.fillRect(
                            0,
                            0,
                            pageCanvas.width,
                            pageCanvas.height,
                        );

                        pageCtx.drawImage(
                            canvas,
                            0,
                            sourceY,
                            canvas.width,
                            sourceHeight,
                            0,
                            0,
                            canvas.width,
                            sourceHeight,
                        );
                        const pageImgData = pageCanvas.toDataURL(
                            "image/png",
                            1.0,
                        );

                        const pageImgHeight =
                            (sourceHeight / canvas.width) * pdfWidth;
                        pdf.addImage(
                            pageImgData,
                            "PNG",
                            0,
                            0,
                            pdfWidth,
                            pageImgHeight,
                        );

                        yOffset += pageHeight;
                    }
                }

                // Generate filename and save
                const fileName = `${formData.fullName.replace(/\s+/g, "_")}_Resume_${formData.jobTitle.replace(/\s+/g, "_")}.pdf`;
                pdf.save(fileName);

                // Cleanup
                document.body.removeChild(tempDiv);
                document.head.removeChild(style);
            })
            .catch((error) => {
                console.error("Error generating PDF:", error);
                alert("Error generating PDF. Please try again.");
                // Cleanup on error
                if (document.body.contains(tempDiv)) {
                    document.body.removeChild(tempDiv);
                }
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            });
    }, 1000); // Give extra time for font loading
}

// Alternative PDF download using jsPDF text methods
function downloadPDFText() {
    const formData = collectFormData();

    if (!formData.fullName) {
        alert("Please enter your full name before downloading.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    let yPos = 40;
    const lineHeight = 15;
    const margin = 36; // 0.5 inch margin at 72 DPI (0.5 * 72 = 36)

    // Header
    pdf.setFontSize(20);
    pdf.setFont(undefined, "bold");
    pdf.text(formData.fullName, margin, yPos);
    yPos += 20;

    // Contact info
    pdf.setFontSize(10);
    pdf.setFont(undefined, "normal");
    let contactInfo = [];
    if (formData.phone) contactInfo.push(formData.phone);
    if (formData.email) contactInfo.push(formData.email);
    if (formData.linkedin) contactInfo.push(formData.linkedin);
    if (formData.location) contactInfo.push(formData.location);

    pdf.text(contactInfo.join(" • "), margin, yPos);
    yPos += 25;

    // Summary
    if (formData.summary) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text("PROFESSIONAL SUMMARY", margin, yPos);
        yPos += lineHeight;

        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");
        const summaryLines = pdf.splitTextToSize(formData.summary, 170);
        pdf.text(summaryLines, margin, yPos);
        yPos += summaryLines.length * 12 + 10;
    }

    // Experience
    if (formData.experience.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text("WORK EXPERIENCE", margin, yPos);
        yPos += lineHeight + 5;

        formData.experience.forEach((exp) => {
            pdf.setFontSize(11);
            pdf.setFont(undefined, "bold");
            pdf.text(exp.jobTitle, margin, yPos);

            const dateRange =
                exp.startDate && exp.endDate
                    ? `${exp.startDate} - ${exp.endDate}`
                    : "";
            if (dateRange) {
                pdf.text(dateRange, 170, yPos);
            }
            yPos += 12;

            pdf.setFont(undefined, "normal");
            pdf.text(
                exp.company + (exp.location ? `, ${exp.location}` : ""),
                margin,
                yPos,
            );
            yPos += 15;

            // Achievements
            exp.achievements.forEach((achievement) => {
                const bulletText = "• " + achievement.replace(/^•\s*/, "");
                const achievementLines = pdf.splitTextToSize(bulletText, 170);
                pdf.text(achievementLines, margin, yPos);
                yPos += achievementLines.length * 10 + 2;
            });

            yPos += 10;
        });
    }

    // Education
    if (formData.education.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text("EDUCATION", margin, yPos);
        yPos += lineHeight + 5;

        formData.education.forEach((edu) => {
            pdf.setFontSize(10);
            pdf.setFont(undefined, "bold");
            pdf.text(edu.degree, margin, yPos);

            if (edu.gradYear) {
                pdf.text(edu.gradYear, 170, yPos);
            }
            yPos += 12;

            pdf.setFont(undefined, "normal");
            pdf.text(
                edu.school + (edu.gpa ? ` • GPA: ${edu.gpa}` : ""),
                margin,
                yPos,
            );
            yPos += 15;
        });
    }

    // Skills
    if (formData.skills) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text("SKILLS", margin, yPos);
        yPos += lineHeight;

        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");
        const skillsLines = pdf.splitTextToSize(formData.skills, 170);
        pdf.text(skillsLines, margin, yPos);
    }

    const fileName = `${formData.fullName.replace(/\s+/g, "_")}_Resume.pdf`;
    pdf.save(fileName);
}

// Event listener management
function addExperienceListeners() {
    document
        .querySelectorAll(".experience-item input, .experience-item textarea")
        .forEach((input) => {
            input.addEventListener("input", updateResumePreview);
        });
}

function addEducationListeners() {
    document.querySelectorAll(".education-item input").forEach((input) => {
        input.addEventListener("input", updateResumePreview);
    });
}

// Utility functions for character counters (summary functionality removed)

function clearForm() {
    if (confirm("Are you sure you want to clear all form data?")) {
        document.querySelectorAll("input, textarea").forEach((field) => {
            field.value = "";
        });

        // Reset selects
        document.getElementById("template").value = "modern";

        // Reset counters
        experienceCount = 1;
        educationCount = 1;

        // Remove extra experience/education items
        document
            .querySelectorAll('.experience-item:not([data-index="0"])')
            .forEach((item) => item.remove());
        document
            .querySelectorAll('.education-item:not([data-index="0"])')
            .forEach((item) => item.remove());

        // Clear suggestions and classification
        currentJobClassification = null;
        clearSuggestions();
        document.getElementById("jobCategory").textContent = "";

        updateResumePreview();
        updateCharacterCount();
    }
}

function initializeTooltips() {
    // Tooltip functionality is handled via CSS hover states
    // This function can be extended for more complex tooltip behavior
}

// AI: Request bullet suggestions for a given job title
async function requestAIBullets(jobTitle) {
    if (!jobTitle || jobTitle.length < 2) {
        aiBulletSuggestions = [];
        aiSuggestionsLoading = false;
        updateExperienceSuggestions(currentJobClassification ? currentJobClassification.category : '');
        return;
    }
    try {
        aiSuggestionsLoading = true;
        updateExperienceSuggestions(currentJobClassification ? currentJobClassification.category : '');
		const response = await fetch('/.netlify/functions/generate-bullets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobTitle })
        });
        if (!response.ok) throw new Error('AI request failed');
        const data = await response.json();
        aiBulletSuggestions = Array.isArray(data.bullets) ? data.bullets.slice(0, 8) : [];
    } catch (e) {
        console.warn('AI suggestions error:', e.message);
        aiBulletSuggestions = [];
    } finally {
        aiSuggestionsLoading = false;
        updateExperienceSuggestions(currentJobClassification ? currentJobClassification.category : '');
    }
}

// Social sharing functions
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
        "Create professional, ATS-friendly resumes with this amazing tool!",
    );
    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
        "_blank",
    );
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
        "Just created my resume with this AI-powered resume generator! 🚀",
    );
    window.open(
        `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
        "_blank",
    );
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent("AI Resume Generator - Job Tailored");
    window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`,
        "_blank",
    );
}

// Add html2canvas for PDF generation
(function () {
    const script = document.createElement("script");
    script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = function () {
        // html2canvas loaded - set single event handler
        const downloadBtn = document.getElementById("downloadPdf");
        downloadBtn.onclick = downloadPDF;
    };
    script.onerror = function () {
        // Fallback to text-based PDF if html2canvas fails
        const downloadBtn = document.getElementById("downloadPdf");
        downloadBtn.onclick = downloadPDFText;
    };
    document.head.appendChild(script);
})();

// Carousel state
let currentStep = 0;
const totalSteps = 5;

// Carousel functionality
function initializeCarousel() {
    // Navigation buttons
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");

    if (nextBtn) nextBtn.addEventListener("click", nextStep);
    if (prevBtn) prevBtn.addEventListener("click", prevStep);

    // Step indicator clicks
    document.querySelectorAll(".step").forEach((step, index) => {
        step.addEventListener("click", () => goToStep(index));
    });

    updateCarousel();
}

// Form Validation Functions
function validateCurrentStep() {
    return validateStep(currentStep);
}

function validateStep(stepIndex) {
    switch (stepIndex) {
        case 0: // Job Title
            return validateJobTitleStep();
        case 1: // Contact Information
            return validateContactStep();
        case 2: // Work Experience
            return validateExperienceStep();
        case 3: // Education
            return validateEducationStep();
        case 4: // Skills
            return validateSkillsStep();
        default:
            return true;
    }
}

function canAdvanceToStep(targetStep) {
    for (let i = 0; i < targetStep; i++) {
        if (!validateStep(i)) {
            return false;
        }
    }
    return true;
}

function validateJobTitleStep() {
    const jobTitle = document.getElementById("jobTitle").value.trim();
    return jobTitle.length > 0;
}

function validateContactStep() {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    return fullName.length > 0 && email.length > 0 && isValidEmail(email);
}

// Professional summary step removed - function no longer needed

function validateExperienceStep() {
    const firstExperience = document.querySelector(
        '.experience-item[data-index="0"]',
    );
    if (!firstExperience) return false;

    const jobTitle = firstExperience.querySelector(".jobTitle").value.trim();
    const company = firstExperience.querySelector(".company").value.trim();
    const startDate = firstExperience.querySelector(".startDate").value.trim();
    const endDate = firstExperience.querySelector(".endDate").value.trim();

    // Basic required fields
    const hasRequiredFields = jobTitle.length > 0 && company.length > 0;

    // Check for validation errors in date fields
    const hasDateErrors =
        firstExperience.querySelector(
            ".date-validation:not(.date-valid):not(.date-future)",
        ) !== null;

    return hasRequiredFields && !hasDateErrors;
}

function validateEducationStep() {
    const firstEducation = document.querySelector(
        '.education-item[data-index="0"]',
    );
    if (!firstEducation) return false;

    const degree = firstEducation.querySelector(".degree").value.trim();
    const school = firstEducation.querySelector(".school").value.trim();
    return degree.length > 0 && school.length > 0;
}

function validateSkillsStep() {
    const skills = document.getElementById("skills").value.trim();
    return skills.length > 0;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function handleEmailInput(event) {
    const input = event.target;
    const value = input.value.trim();

    // Remove any existing validation message
    const existingValidation =
        input.parentNode.querySelector(".email-validation");
    if (existingValidation) {
        existingValidation.remove();
    }

    // Only validate if there's content
    if (value.length > 0) {
        if (isValidEmail(value)) {
            // Show success indicator
            const validation = document.createElement("div");
            validation.className = "email-validation email-valid";
            validation.innerHTML =
                '<i class="fas fa-check-circle"></i> Valid email format';
            input.parentNode.appendChild(validation);
        } else {
            // Show validation warning
            const validation = document.createElement("div");
            validation.className = "email-validation";
            validation.innerHTML =
                '<i class="fas fa-exclamation-triangle"></i> Please enter a valid email address';
            input.parentNode.appendChild(validation);
        }
    }
}

// Date validation functions
function parseDate(dateString) {
    const cleanDate = dateString.trim().toLowerCase();

    // Handle "Present" or similar
    if (
        cleanDate === "present" ||
        cleanDate === "current" ||
        cleanDate === "now"
    ) {
        return new Date(); // Current date
    }

    // Try various date formats
    const formats = [
        // Month Year (June 2023, Jun 2023)
        /^(\w+)\s+(\d{4})$/,
        // Month/Year (06/2023, 6/2023)
        /^(\d{1,2})\/(\d{4})$/,
        // Year only (2023)
        /^(\d{4})$/,
        // MM-YYYY (06-2023)
        /^(\d{1,2})-(\d{4})$/,
    ];

    const monthNames = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
    ];

    const monthAbbrev = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
    ];

    // Month Year format
    const monthYearMatch = cleanDate.match(formats[0]);
    if (monthYearMatch) {
        const monthStr = monthYearMatch[1].toLowerCase();
        const year = parseInt(monthYearMatch[2]);
        let month = monthNames.indexOf(monthStr);
        if (month === -1) {
            month = monthAbbrev.indexOf(monthStr);
        }
        if (month !== -1) {
            return new Date(year, month, 1);
        }
    }

    // Numeric formats
    const numericMatch =
        cleanDate.match(formats[1]) || cleanDate.match(formats[3]);
    if (numericMatch) {
        const month = parseInt(numericMatch[1]) - 1; // 0-based months
        const year = parseInt(numericMatch[2]);
        return new Date(year, month, 1);
    }

    // Year only
    const yearMatch = cleanDate.match(formats[2]);
    if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        return new Date(year, 0, 1); // January 1st of that year
    }

    // If all else fails, try Date constructor
    const fallbackDate = new Date(dateString);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

function isDateInFuture(dateString) {
    if (!dateString || dateString.trim() === "") return false;

    const inputDate = parseDate(dateString);
    if (!inputDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    return inputDate > today;
}

function handleStartDateInput(event) {
    const input = event.target;
    const value = input.value.trim();

    // Remove any existing validation message
    const existingValidation =
        input.parentNode.querySelector(".date-validation");
    if (existingValidation) {
        existingValidation.remove();
    }

    // Only validate if there's content
    if (value.length > 0) {
        const parsedDate = parseDate(value);

        if (!parsedDate) {
            // Invalid date format
            const validation = document.createElement("div");
            validation.className = "date-validation";
            validation.innerHTML =
                '<i class="fas fa-exclamation-triangle"></i> Please use a valid date format (e.g., "June 2024", "06/2024")';
            input.parentNode.appendChild(validation);
        } else if (isDateInFuture(value)) {
            // Date is in the future - show warning
            const validation = document.createElement("div");
            validation.className = "date-validation date-future";
            validation.innerHTML =
                '<i class="fas fa-info-circle"></i> This appears to be a future date. Consider using "Expected" if this is a planned start date.';
            input.parentNode.appendChild(validation);
        } else {
            // Valid past/present date
            const validation = document.createElement("div");
            validation.className = "date-validation date-valid";
            validation.innerHTML =
                '<i class="fas fa-check-circle"></i> Valid date format';
            input.parentNode.appendChild(validation);
        }
    }

    // Also validate the corresponding end date if it exists
    validateEndDatePair(input);
}

function handleEndDateInput(event) {
    const input = event.target;
    const value = input.value.trim();

    // Remove any existing validation message
    const existingValidation =
        input.parentNode.querySelector(".date-validation");
    if (existingValidation) {
        existingValidation.remove();
    }

    // Only validate if there's content
    if (value.length > 0) {
        const lowerValue = value.toLowerCase();
        const isPresentValue =
            lowerValue === "present" ||
            lowerValue === "current" ||
            lowerValue === "now";
        const parsedDate = parseDate(value);

        if (!parsedDate && !isPresentValue) {
            // Invalid date format (but allow "Present")
            const validation = document.createElement("div");
            validation.className = "date-validation";
            validation.innerHTML =
                '<i class="fas fa-exclamation-triangle"></i> Please use a valid date format or "Present"';
            input.parentNode.appendChild(validation);
        } else if (!isPresentValue && isDateInFuture(value)) {
            // End date is in the future (but not "Present")
            const validation = document.createElement("div");
            validation.className = "date-validation";
            validation.innerHTML =
                '<i class="fas fa-exclamation-triangle"></i> End date cannot be in the future. Use "Present" for ongoing positions.';
            input.parentNode.appendChild(validation);
        } else {
            // Valid date - check if end date is after start date
            validateEndDatePair(input);
        }
    }
}

function validateEndDatePair(changedInput) {
    // Find the parent container (experience or education item)
    const container = changedInput.closest(".experience-item, .education-item");
    if (!container) return;

    const startDateInput = container.querySelector(".startDate, .gradYear");
    const endDateInput = container.querySelector(".endDate");

    if (!startDateInput || !endDateInput) return;

    const startValue = startDateInput.value.trim();
    const endValue = endDateInput.value.trim();

    if (startValue && endValue) {
        const startDate = parseDate(startValue);
        const endDate = parseDate(endValue);

        // Skip validation if either date is invalid or end is "Present"
        if (!startDate || !endDate) return;
        const lowerEndValue = endValue.toLowerCase();
        if (
            lowerEndValue === "present" ||
            lowerEndValue === "current" ||
            lowerEndValue === "now"
        )
            return;

        // Check if end date is before start date
        if (endDate < startDate) {
            // Remove existing validation from end date
            const existingValidation =
                endDateInput.parentNode.querySelector(".date-validation");
            if (existingValidation) {
                existingValidation.remove();
            }

            // Show error on end date
            const validation = document.createElement("div");
            validation.className = "date-validation";
            validation.innerHTML =
                '<i class="fas fa-exclamation-triangle"></i> End date cannot be before start date';
            endDateInput.parentNode.appendChild(validation);
        } else {
            // Valid date range - show success on end date if it was the changed input
            if (changedInput === endDateInput) {
                const validation = document.createElement("div");
                validation.className = "date-validation date-valid";
                validation.innerHTML =
                    '<i class="fas fa-check-circle"></i> Valid date range';
                endDateInput.parentNode.appendChild(validation);
            }
        }
    }
}

function showValidationErrors() {
    clearValidationErrors();

    const invalidFields = getInvalidFields(currentStep);
    invalidFields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add("error");
            field.style.borderColor = "#ef4444";
        }
    });

    // Show error message
    showErrorMessage();
}

function clearValidationErrors() {
    document.querySelectorAll(".error").forEach((field) => {
        field.classList.remove("error");
        field.style.borderColor = "";
    });
    hideErrorMessage();
}

// Dynamic sizing functions removed - using fixed fonts and layout only
function calculateOptimalFontSize() {
    // Always return fits=true with fixed 10pt font
    return { fits: true, scaledFontSize: 10 };
}

// Removed calculatePageCount function - always single page
function calculatePageCount() {
    return 1; // Fixed single page only
}

// Removed createMultiPageLayout function - single fixed page only
function createMultiPageLayout(pageCount) {
    // No multi-page layout - always single fixed page
}

function addPageBreaks(pageCount) {
    const resumeContent = document.querySelector(".resume-content");
    const pageHeight = 792;
    const children = Array.from(resumeContent.children);

    let currentHeight = 0;
    let currentPage = 1;

    children.forEach((child, index) => {
        const childHeight =
            child.offsetHeight +
            parseFloat(getComputedStyle(child).marginTop) +
            parseFloat(getComputedStyle(child).marginBottom);

        currentHeight += childHeight;

        // Check if we need a page break before this element
        if (
            currentHeight > pageHeight * currentPage &&
            currentPage < pageCount
        ) {
            // Insert page break before this element
            const pageBreak = document.createElement("div");
            pageBreak.className = "page-break";
            pageBreak.setAttribute("data-page", currentPage + 1);
            child.parentNode.insertBefore(pageBreak, child);

            currentPage++;
            currentHeight = childHeight; // Reset height for new page
        }
    });
}

function removePageBreaks() {
    const pageBreaks = document.querySelectorAll(".page-break");
    pageBreaks.forEach((pageBreak) => pageBreak.remove());
}

function getInvalidFields(stepIndex) {
    const invalidFields = [];

    switch (stepIndex) {
        case 0:
            if (!document.getElementById("jobTitle").value.trim()) {
                invalidFields.push("jobTitle");
            }
            break;
        case 1:
            if (!document.getElementById("fullName").value.trim()) {
                invalidFields.push("fullName");
            }
            if (
                !document.getElementById("email").value.trim() ||
                !isValidEmail(document.getElementById("email").value.trim())
            ) {
                invalidFields.push("email");
            }
            break;
        case 2:
            const firstExperience = document.querySelector(
                '.experience-item[data-index="0"]',
            );
            if (firstExperience) {
                if (!firstExperience.querySelector(".jobTitle").value.trim()) {
                    const jobTitleField =
                        firstExperience.querySelector(".jobTitle");
                    jobTitleField.id = "exp-jobTitle-0"; // Add temporary ID for error marking
                    invalidFields.push("exp-jobTitle-0");
                }
                if (!firstExperience.querySelector(".company").value.trim()) {
                    const companyField =
                        firstExperience.querySelector(".company");
                    companyField.id = "exp-company-0"; // Add temporary ID for error marking
                    invalidFields.push("exp-company-0");
                }
            }
            break;
        case 3:
            const firstEducation = document.querySelector(
                '.education-item[data-index="0"]',
            );
            if (firstEducation) {
                if (!firstEducation.querySelector(".degree").value.trim()) {
                    const degreeField = firstEducation.querySelector(".degree");
                    degreeField.id = "edu-degree-0"; // Add temporary ID for error marking
                    invalidFields.push("edu-degree-0");
                }
                if (!firstEducation.querySelector(".school").value.trim()) {
                    const schoolField = firstEducation.querySelector(".school");
                    schoolField.id = "edu-school-0"; // Add temporary ID for error marking
                    invalidFields.push("edu-school-0");
                }
            }
            break;
        case 4:
            if (!document.getElementById("skills").value.trim()) {
                invalidFields.push("skills");
            }
            break;
    }

    return invalidFields;
}

function showErrorMessage() {
    let errorDiv = document.getElementById("validation-error");
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.id = "validation-error";
        errorDiv.className = "validation-error";
        errorDiv.innerHTML =
            '<i class="fas fa-exclamation-triangle"></i> Please fill in all required fields to continue.';

        const navigationDiv = document.querySelector(".carousel-navigation");
        navigationDiv.parentNode.insertBefore(errorDiv, navigationDiv);
    }
    errorDiv.style.display = "block";
}

function hideErrorMessage() {
    const errorDiv = document.getElementById("validation-error");
    if (errorDiv) {
        errorDiv.style.display = "none";
    }
}

function nextStep() {
    if (currentStep < totalSteps - 1 && validateCurrentStep()) {
        currentStep++;
        updateCarousel();
    } else if (!validateCurrentStep()) {
        showValidationErrors();
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        updateCarousel();
    }
}

function goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
        // Allow going backwards or to the same step
        if (stepIndex <= currentStep) {
            currentStep = stepIndex;
            updateCarousel();
        }
        // Only allow going forward if all previous steps are valid
        else if (canAdvanceToStep(stepIndex)) {
            currentStep = stepIndex;
            updateCarousel();
        }
    }
}

function updateCarousel() {
    // Update carousel steps
    document.querySelectorAll(".carousel-step").forEach((step, index) => {
        step.classList.toggle("active", index === currentStep);
    });

    // Update progress indicator
    document.querySelectorAll(".step").forEach((step, index) => {
        step.classList.remove("active", "completed");
        if (index === currentStep) {
            step.classList.add("active");
        } else if (index < currentStep) {
            step.classList.add("completed");
        }
    });

    // Update progress bar
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
    const progressFill = document.querySelector(".progress-fill");
    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
    }

    // Update navigation buttons
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");

    if (prevBtn) prevBtn.disabled = currentStep === 0;

    // Update next button text and state based on validation
    if (nextBtn) {
        const isCurrentStepValid = validateCurrentStep();

        if (currentStep === totalSteps - 1) {
            nextBtn.innerHTML = '<i class="fas fa-check"></i> Complete';
            nextBtn.disabled = true;
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
            nextBtn.disabled = !isCurrentStepValid;
        }

        // Visual feedback for disabled state
        if (!isCurrentStepValid) {
            nextBtn.classList.add("disabled-validation");
        } else {
            nextBtn.classList.remove("disabled-validation");
        }
    }
}

// Enhanced initialization
document.addEventListener("DOMContentLoaded", function () {
    console.log("Resume Generator loaded with carousel");

    // Initialize carousel
    initializeCarousel();

    // Initialize other components
    updateResumePreview();
    initializeTooltips();

    // Initialize template selector
    const templateSelector = document.getElementById("template");
    if (templateSelector) {
        templateSelector.addEventListener("change", updateResumeTemplate);
    }



    // Add event listeners
    const jobTitleInput = document.getElementById("jobTitle");
    if (jobTitleInput) {
        jobTitleInput.addEventListener("input", function () {
            const jobTitle = this.value;
            classifyJob(jobTitle);
            updateResumePreview();
        });
    }

    ["fullName", "linkedin", "location", "skills"].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("input", updateResumePreview);
        }
    });

    // GPA validation
    document.querySelectorAll(".gpa").forEach((input) => {
        input.addEventListener("input", handleGPAInput);
    });

    // Phone number formatting with validation
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
        phoneInput.addEventListener("input", function (event) {
            handlePhoneInput(event);
            updateResumePreview();
        });
    }

    // Email validation
    const emailInput = document.getElementById("email");
    if (emailInput) {
        emailInput.addEventListener("input", function (event) {
            handleEmailInput(event);
            updateResumePreview();
        });
    }

    // Date validation for existing date inputs
    document.querySelectorAll(".startDate, .gradYear").forEach((input) => {
        input.addEventListener("input", handleStartDateInput);
    });

    document.querySelectorAll(".endDate").forEach((input) => {
        input.addEventListener("input", handleEndDateInput);
    });

    // Removed second resize handler - no dynamic sizing

    // Add experience button
    const addExpBtn = document.getElementById("addExperience");
    if (addExpBtn) {
        addExpBtn.addEventListener("click", addExperience);
    }

    // Add education button
    const addEduBtn = document.getElementById("addEducation");
    if (addEduBtn) {
        addEduBtn.addEventListener("click", addEducation);
    }

    // Clear form button
    const clearBtn = document.getElementById("clearForm");
    if (clearBtn) {
        clearBtn.addEventListener("click", clearForm);
    }

    // Add event listeners for experience and education fields
    addExperienceListeners();
    addEducationListeners();

    // Removed dynamic font sizing initialization
});

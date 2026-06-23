const Groq = require("groq-sdk");
const Skill = require("../models/Skills");
const Project = require("../models/Project");
const Experience = require("../models/Experience");
const Education = require("../models/Education");
const Certificate = require("../models/Certificate");
const Recognition = require("../models/Recognition");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

const SYSTEM_PROMPT = `You are a friendly portfolio assistant for Venkata Naveen. Answer questions about Venkata Naveen's skills, projects, experience, education, certificates, and achievements.

Rules:
1. Use ONLY the data provided in the context below. If the answer isn't in the context, say "I don't have that information. Try asking about skills, projects, or experience."
2. Keep responses concise (2-4 paragraphs max).
3. Be enthusiastic and professional.
4. Format with *bold* for emphasis where helpful.
5. Include relevant URLs (GitHub, LinkedIn, live project links) when appropriate from the data.
6. For skills questions, mention proficiency levels when available.
7. For project questions, highlight key technologies used.`;

async function buildContext() {
  const [skills, projects, experiences, education, certificates, recognitions] = await Promise.all([
    Skill.find().sort({ percentage: -1 }).lean(),
    Project.find().sort({ createdAt: -1 }).lean(),
    Experience.find().sort({ startDate: -1 }).lean(),
    Education.find().sort({ startYear: -1 }).lean(),
    Certificate.find().sort({ issueDate: -1 }).lean(),
    Recognition.find().sort({ createdAt: -1 }).lean(),
  ]);

  let ctx = "## PORTFOLIO DATA\n\n";

  if (skills.length) {
    ctx += "### Skills\n";
    const grouped = {};
    for (const s of skills) {
      const cat = s.category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(`${s.skillName} (${s.percentage}%)`);
    }
    for (const [cat, items] of Object.entries(grouped)) {
      ctx += `${cat}: ${items.join(", ")}\n`;
    }
    ctx += "\n";
  }

  if (projects.length) {
    ctx += "### Projects\n";
    for (const p of projects) {
      ctx += `- ${p.title}: ${(p.description || "").substring(0, 200)}`;
      if (p.technologies?.length) ctx += ` [${p.technologies.join(", ")}]`;
      if (p.githubUrl) ctx += ` GitHub: ${p.githubUrl}`;
      if (p.liveUrl) ctx += ` Live: ${p.liveUrl}`;
      ctx += "\n";
    }
    ctx += "\n";
  }

  if (experiences.length) {
    ctx += "### Work Experience\n";
    for (const e of experiences) {
      ctx += `- ${e.designation} at ${e.companyName}`;
      if (e.location) ctx += ` (${e.location})`;
      ctx += ` | ${e.startDate || ""} - ${e.endDate || "Present"}`;
      if (e.description) ctx += ` | ${e.description.substring(0, 200)}`;
      ctx += "\n";
    }
    ctx += "\n";
  }

  if (education.length) {
    ctx += "### Education\n";
    for (const e of education) {
      ctx += `- ${e.degree} in ${e.fieldOfStudy || ""} from ${e.instituteName}`;
      ctx += ` | ${e.startYear || ""} - ${e.endYear || "Present"}`;
      if (e.percentage) ctx += ` | Score: ${e.percentage}`;
      ctx += "\n";
    }
    ctx += "\n";
  }

  if (certificates.length) {
    ctx += "### Certifications\n";
    for (const c of certificates) {
      ctx += `- ${c.title}`;
      if (c.issuer) ctx += ` by ${c.issuer}`;
      if (c.issueDate) ctx += ` (${c.issueDate})`;
      if (c.certificateUrl) ctx += ` URL: ${c.certificateUrl}`;
      ctx += "\n";
    }
    ctx += "\n";
  }

  if (recognitions.length) {
    ctx += "### Recognition & Achievements\n";
    for (const r of recognitions) {
      ctx += `- ${r.title}`;
      if (r.description) ctx += `: ${r.description.substring(0, 200)}`;
      ctx += "\n";
    }
    ctx += "\n";
  }

  ctx += "## Contact\n";
  ctx += "For direct inquiries, users should use the Contact form on the portfolio.\n";

  return ctx;
}

const fallbackResponses = [
  "Hi! I'm Venkata Naveen's portfolio assistant. Ask me about skills, projects, experience, or anything else about Venkata Naveen!",
  "I can help you explore this portfolio! Try: \"What skills do you have?\", \"Show me projects\", or \"Tell me about your experience\".",
  "Not sure about that. Try asking about skills, projects, experience, education, certificates, or recognition.",
  "I'm here to help you learn about Venkata Naveen's work. Ask me anything about the portfolio!",
];

async function generateResponse(message) {
  const lower = message.toLowerCase().trim();

  if (!lower || ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "howdy", "helo"].includes(lower)) {
    const greetings = [
      "Hi! I'm Venkata Naveen's portfolio assistant. Ask me about skills, projects, experience, or anything else!",
      "Hello! Welcome to the portfolio. I can help you explore Venkata Naveen's work. What would you like to know?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (process.env.GROQ_API_KEY) {
    try {
      const context = await buildContext();

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n\n" + context },
          { role: "user", content: message },
        ],
        model: "llama-3.3-70b-versatile",
      });

      const response = chatCompletion.choices[0]?.message?.content;
      if (response && response.length > 10) return response;
    } catch (err) {
      console.error("Groq API error:", err.message);
    }
  }

  try {
    const Skill = require("../models/Skills");
    const Project = require("../models/Project");
    const Experience = require("../models/Experience");
    const Education = require("../models/Education");
    const Certificate = require("../models/Certificate");
    const Recognition = require("../models/Recognition");
    const Fuse = require("fuse.js");

    const keywordMap = [
      { category: "skills", keywords: ["skills", "technologies", "programming", "coding", "languages", "tech", "stack", "expertise", "proficient", "know"] },
      { category: "projects", keywords: ["projects", "work", "portfolio", "applications", "apps", "built", "developed", "create", "make"] },
      { category: "experience", keywords: ["experience", "work history", "job", "professional", "career", "worked", "employed", "company", "role", "position"] },
      { category: "education", keywords: ["education", "degree", "qualification", "study", "studied", "college", "university", "academic", "school", "learned"] },
      { category: "certificates", keywords: ["certificates", "certification", "certified", "credentials", "courses", "course"] },
      { category: "recognition", keywords: ["recognition", "award", "honor", "achievement", "accomplishment", "milestone"] },
      { category: "contact", keywords: ["contact", "email", "reach", "connect", "message", "hire", "phone"] },
      { category: "about", keywords: ["about", "who is", "tell me about yourself", "introduce", "bio", "background", "summary"] },
    ];

    const extractCategory = (msg) => {
      const l = msg.toLowerCase();
      for (const entry of keywordMap) {
        for (const word of entry.keywords) {
          if (l.includes(word)) return entry.category;
        }
      }
      return "default";
    };

    const formatSkillList = (skills) => {
      if (!skills.length) return null;
      const grouped = {};
      for (const s of skills) {
        const cat = s.category || "Other";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(`${s.skillName} (${s.percentage}%)`);
      }
      let text = "Here are Venkata Naveen's technical skills:\n\n";
      for (const [cat, items] of Object.entries(grouped)) {
        text += `*${cat}*\n${items.join("\n")}\n\n`;
      }
      text += "Total skills listed: " + skills.length;
      return text;
    };

    const formatProjectList = (projects) => {
      if (!projects.length) return null;
      let text = `Here are the projects Venkata Naveen has worked on (${projects.length} total):\n\n`;
      for (let i = 0; i < Math.min(5, projects.length); i++) {
        const p = projects[i];
        text += `${i + 1}. *${p.title}*\n   ${(p.description || "No description").substring(0, 120)}...\n`;
        if (p.technologies?.length) text += `   Tech: ${p.technologies.join(", ")}\n`;
        if (p.githubUrl) text += `   GitHub: ${p.githubUrl}\n`;
        if (p.liveUrl) text += `   Live: ${p.liveUrl}\n\n`;
      }
      if (projects.length > 5) text += `...and ${projects.length - 5} more projects.`;
      return text;
    };

    const formatExperienceList = (experiences) => {
      if (!experiences.length) return null;
      let text = `Work experience (${experiences.length} positions):\n\n`;
      for (const exp of experiences) {
        text += `*${exp.designation}* at ${exp.companyName}\n`;
        if (exp.location) text += `   Location: ${exp.location}\n`;
        if (exp.startDate) text += `   ${exp.startDate} - ${exp.endDate || "Present"}\n`;
        if (exp.description) text += `   ${exp.description.substring(0, 200)}\n\n`;
      }
      return text;
    };

    const formatEducationList = (education) => {
      if (!education.length) return null;
      let text = "Educational background:\n\n";
      for (const edu of education) {
        text += `*${edu.degree}* in ${edu.fieldOfStudy || "—"}\n   ${edu.instituteName}\n`;
        if (edu.startYear) text += `   ${edu.startYear} - ${edu.endYear || "Present"}\n`;
        if (edu.percentage) text += `   Score: ${edu.percentage}\n\n`;
      }
      return text;
    };

    const formatCertificateList = (certificates) => {
      if (!certificates.length) return null;
      let text = `Certifications (${certificates.length} total):\n\n`;
      for (const cert of certificates) {
        text += `*${cert.title}*\n`;
        if (cert.issuer) text += `   Issuer: ${cert.issuer}\n`;
        if (cert.issueDate) text += `   Date: ${cert.issueDate}\n\n`;
      }
      return text;
    };

    const formatRecognitionList = (recognitions) => {
      if (!recognitions.length) return null;
      let text = "Recognition & awards:\n\n";
      for (const rec of recognitions) {
        text += `*${rec.title}*\n`;
        if (rec.description) text += `   ${rec.description.substring(0, 200)}\n\n`;
      }
      return text;
    };

    const category = extractCategory(message);

    if (["contact"].includes(category)) {
      return "You can reach out via the Contact form on this portfolio. Venkata Naveen typically responds within 24 hours.";
    }
    if (["about"].includes(category)) {
      return "Venkata Naveen is a passionate developer. Check the About section on the homepage for a detailed introduction.";
    }

    let formatted = null;
    if (category === "skills") {
      const skills = await Skill.find().sort({ percentage: -1 }).lean();
      const lower = message.toLowerCase();
      const catWords = ["frontend", "backend", "fullstack", "mobile", "devops", "database"];
      const mentionedCat = catWords.find(w => lower.includes(w));
      if (mentionedCat) {
        const filtered = skills.filter(s => s.category?.toLowerCase().includes(mentionedCat.replace(/\s+/g, "")));
        if (filtered.length) formatted = formatSkillList(filtered);
      } else {
        const mentionedSkill = skills.find(s => lower.includes(s.skillName?.toLowerCase()));
        if (mentionedSkill) formatted = formatSkillList([mentionedSkill]);
      }
      if (!formatted) formatted = formatSkillList(skills);
    } else if (category === "projects") {
      const projects = await Project.find().sort({ createdAt: -1 }).lean();
      const lower = message.toLowerCase();
      const mentioned = projects.find(p => lower.includes(p.title?.toLowerCase()) || (p.technologies || []).some(t => lower.includes(t.toLowerCase())));
      if (mentioned) formatted = formatProjectList([mentioned]);
      if (!formatted) formatted = formatProjectList(projects);
    } else if (category === "experience") {
      const experiences = await Experience.find().sort({ startDate: -1 }).lean();
      const lower = message.toLowerCase();
      const mentioned = experiences.find(e => lower.includes(e.companyName?.toLowerCase()) || lower.includes(e.designation?.toLowerCase()));
      if (mentioned) formatted = formatExperienceList([mentioned]);
      if (!formatted) formatted = formatExperienceList(experiences);
    } else if (category === "education") {
      const education = await Education.find().sort({ startYear: -1 }).lean();
      const lower = message.toLowerCase();
      const mentioned = education.find(e => lower.includes(e.instituteName?.toLowerCase()) || lower.includes(e.degree?.toLowerCase()));
      if (mentioned) formatted = formatEducationList([mentioned]);
      if (!formatted) formatted = formatEducationList(education);
    } else if (category === "certificates") {
      const certificates = await Certificate.find().sort({ issueDate: -1 }).lean();
      const lower = message.toLowerCase();
      const mentioned = certificates.find(c => lower.includes(c.title?.toLowerCase()) || lower.includes(c.issuer?.toLowerCase()));
      if (mentioned) formatted = formatCertificateList([mentioned]);
      if (!formatted) formatted = formatCertificateList(certificates);
    } else if (category === "recognition") {
      const recognitions = await Recognition.find().sort({ createdAt: -1 }).lean();
      const lower = message.toLowerCase();
      const mentioned = recognitions.find(r => lower.includes(r.title?.toLowerCase()));
      if (mentioned) formatted = formatRecognitionList([mentioned]);
      if (!formatted) formatted = formatRecognitionList(recognitions);
    }

    if (formatted) return formatted;

    const items = [];
    const [allSkills, allProjects, allExp, allEdu, allCert, allRec] = await Promise.all([
      Skill.find().lean(), Project.find().lean(), Experience.find().lean(),
      Education.find().lean(), Certificate.find().lean(), Recognition.find().lean(),
    ]);
    for (const s of allSkills) items.push({ _type: "skill", _title: s.skillName, _detail: `${s.category || ""} | ${s.percentage}%`, _searchText: `${s.skillName} ${s.category || ""}` });
    for (const p of allProjects) items.push({ _type: "project", _title: p.title, _detail: (p.technologies || []).join(", "), _searchText: `${p.title} ${p.description || ""} ${(p.technologies || []).join(" ")}` });
    for (const e of allExp) items.push({ _type: "experience", _title: e.designation, _detail: `${e.companyName}${e.location ? ` - ${e.location}` : ""}`, _searchText: `${e.designation} ${e.companyName} ${e.description || ""}` });
    for (const e of allEdu) items.push({ _type: "education", _title: e.degree, _detail: `${e.instituteName}`, _searchText: `${e.degree} ${e.instituteName}` });
    for (const c of allCert) items.push({ _type: "certificate", _title: c.title, _detail: c.issuer || "", _searchText: `${c.title} ${c.issuer || ""}` });
    for (const r of allRec) items.push({ _type: "recognition", _title: r.title, _detail: (r.description || "").substring(0, 100), _searchText: `${r.title} ${r.description || ""}` });

    const fuse = new Fuse(items, { keys: ["_searchText", "_title", "_detail"], threshold: 0.45, includeScore: true, minMatchCharLength: 2 });
    const results = fuse.search(message, { limit: 5 }).filter(r => r.score < 0.5);

    if (results.length) {
      const grouped = {};
      const labels = { skill: "Skills", project: "Projects", experience: "Experience", education: "Education", certificate: "Certificates", recognition: "Recognition" };
      for (const r of results) {
        if (!grouped[r.item._type]) grouped[r.item._type] = [];
        grouped[r.item._type].push(r.item);
      }
      let text = "Here is what I found:\n\n";
      for (const [type, items] of Object.entries(grouped)) {
        text += `*${labels[type] || type}*\n`;
        for (const item of items.slice(0, 3)) text += `   • ${item._title}${item._detail ? ` — ${item._detail}` : ""}\n`;
        text += "\n";
      }
      return text.trim();
    }

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  } catch (err) {
    console.error("Chat service fallback error:", err);
    return "Sorry, I encountered an error. Please try again.";
  }
}

module.exports = { generateResponse };

// Script to generate responses for all missing submissions
const fs = require('fs');

const submissionsData = fs.readFileSync('data/submissions.js', 'utf8');

// Extract submission info
const submissions = [];
const subMatches = submissionsData.matchAll(/submissionId: (\d+),[\s\S]*?unitId: (\d+), \/\/ ([^\n]+)[\s\S]*?submissionStatus: SUBMISSION_STATUS\.(\w+),[\s\S]*?submittedDate: '([^']+)',/g);
for (const match of subMatches) {
  submissions.push({
    id: parseInt(match[1]),
    unitId: parseInt(match[2]),
    unitName: match[3].trim(),
    status: match[4],
    submittedDate: match[5]
  });
}

// Determine unit type
function getUnitType(unitName) {
  if (unitName.includes('Region') || unitName.includes('City Administration') || unitName.includes('Ministry')) {
    return 'Region/City';
  } else if (unitName.includes('Sub-city') || unitName.includes('Woreda')) {
    return 'Sub-city/Woreda';
  } else if (unitName.includes('Zone')) {
    return 'Zone';
  }
  return 'Region/City';
}

// Get existing response IDs
const existingResponseIds = [];
const responseMatches = submissionsData.matchAll(/responseId: (\d+),/g);
for (const match of responseMatches) {
  existingResponseIds.push(parseInt(match[1]));
}
const maxResponseId = Math.max(...existingResponseIds, 0);

// Missing submissions
const missing = [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,37,38,39,40,41,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83];

let responseId = maxResponseId + 1;
const responses = [];

// Region/City questions: 1-14, 26-28, 33-34, 42-44, 48-49, 53-54, 62-63, 64-67, 68-69, 79-80
const regionCityQuestions = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,26,27,28,33,34,42,43,44,48,49,53,54,62,63,64,65,66,67,68,69,79,80];

// Sub-city/Woreda questions: 15-25, 29-32, 35-37, 38-41, 45-47, 50-52, 70-75
const subcityWoredaQuestions = [15,16,17,18,19,20,21,22,23,24,25,29,30,31,32,35,36,37,38,39,40,41,45,46,47,50,51,52,70,71,72,73,74,75];

// Zone questions - same as Region/City for now
const zoneQuestions = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,26,27,28,33,34,42,43,44,48,49,53,54,62,63,64,65,66,67,68,69,79,80];

// Sample answers for different question types
const sampleAnswers = {
  1: 'Yes, we have a comprehensive e-government policy document.',
  2: 'Our strategy focuses on digital service delivery and citizen engagement.',
  3: 'Partially Implemented',
  4: 'Our e-government strategy aims to digitize services, improve citizen access, and enhance transparency.',
  5: 'Yes, we have electronic transaction laws in place.',
  6: 'Yes, we have data protection and privacy legislation.',
  7: 'Our legal framework includes electronic transaction laws, data protection policies, and cybersecurity legislation.',
  8: 'Yes, we have a dedicated e-government unit.',
  9: 'Regular Meetings, Shared Platforms, Joint Committees',
  10: 'Adequate',
  11: 'Our e-government management structure includes coordination teams and technical support staff.',
  12: 'Yes, we have a comprehensive data governance policy.',
  13: 'Yes, we implement privacy protection measures including encryption and access controls.',
  14: 'Our data security measures include multi-factor authentication, regular backups, and intrusion detection systems.',
  15: 'Yes, we maintain an official website for our administration.',
  16: 'Fully Operational',
  17: 'Yes, organizational information is publicly accessible online.',
  18: 'Contact Information, Organizational Structure, Service Information, Annual Reports',
  19: 'Yes, citizens can request information through our online contact form.',
  20: 'We maintain transparency by publishing service information and organizational structure regularly.',
  21: 'Yes, our website is available in multiple languages.',
  22: 'English, Amharic',
  23: 'We provide bilingual content to ensure accessibility for all citizens.',
  24: 'Weekly',
  25: 'Yes, we use a content management system.',
  26: 'Yes, we maintain an open data portal.',
  27: 'Statistical Data, Budget Data, Service Data',
  28: 'Our open data initiative publishes datasets in CSV and JSON formats.',
  29: '6-10 services',
  30: 'Information Services, Download Forms, Online Applications, Status Tracking',
  31: 'Yes, citizens can complete transactions fully online.',
  32: 'We offer online services for permits, service requests, and information access.',
  33: 'Yes, we have a one-stop portal for government services.',
  34: 'We have integrated services across multiple departments through a single portal.',
  35: 'Yes, our services are accessible via mobile devices.',
  36: 'Mobile Website, SMS Services',
  37: 'We provide mobile-optimized website access and SMS notifications.',
  38: 'Yes, we have online feedback forms and surveys.',
  39: '1-3 Days',
  40: 'Yes, our services are designed with user-centered principles.',
  41: 'Our services feature intuitive navigation and accessibility features.',
  42: 'Yes, digital payment options are available.',
  43: 'Mobile Money, Bank Transfer',
  44: 'Our payment integration supports secure transactions through multiple payment gateways.',
  45: 'Yes, we have online feedback forms and surveys.',
  46: 'Online Forms, Email, Phone, Social Media',
  47: 'We collect citizen feedback through multiple channels and respond within 3-5 business days.',
  48: 'Yes, we have online platforms for public consultation.',
  49: 'We conduct regular online consultations on policies and service improvements.',
  50: 'Yes, we use social media platforms to engage with citizens.',
  51: 'Facebook, Twitter, Telegram',
  52: 'We actively engage with citizens through social media, sharing updates and responding to inquiries.',
  53: 'Yes, we have a comprehensive complaint management system.',
  54: 'Our complaint system allows citizens to submit complaints online and track status.',
  62: 'Yes, we have robust network infrastructure.',
  63: 'Our network infrastructure includes redundant connections and cloud-based services.',
  64: 'Yes, we have a centralized data center.',
  65: 'Our data center includes redundant power systems and 24/7 monitoring.',
  66: 'Yes, we have comprehensive backup and disaster recovery procedures.',
  67: 'Our disaster recovery plan includes daily backups and documented recovery procedures.',
  68: 'Yes, we have cybersecurity measures in place.',
  69: 'Our cybersecurity framework includes network security and regular security audits.',
  70: 'Yes, we offer digital literacy programs for citizens.',
  71: 'Basic Computer Skills, Internet Usage, Online Service Access',
  72: 'We conduct digital literacy workshops covering basic computer skills and internet usage.',
  73: 'Yes, our services are designed to be accessible for persons with disabilities.',
  74: 'Screen Reader Support, Keyboard Navigation, High Contrast Mode',
  75: 'We implement WCAG 2.1 Level AA accessibility standards.',
  79: 'Yes, we have a digital skills training program for staff.',
  80: 'Our training program includes digital literacy and e-government tools.'
};

function generateEvidenceLink(submissionId, unitName, questionId) {
  const domain = unitName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://${domain}.gov.et/question-${questionId}`;
}

// Generate responses for missing submissions
for (const sub of submissions.filter(s => missing.includes(s.id))) {
  const unitType = getUnitType(sub.unitName);
  let questions = [];
  
  if (unitType === 'Region/City') {
    questions = regionCityQuestions;
  } else if (unitType === 'Sub-city/Woreda') {
    questions = subcityWoredaQuestions;
  } else if (unitType === 'Zone') {
    questions = zoneQuestions;
  }
  
  // Determine validation status based on submission status
  let validationStatus = 'VALIDATION_STATUS.PENDING';
  let regionalApprovalStatus = 'VALIDATION_STATUS.APPROVED';
  let regionalNote = null;
  
  if (sub.status === 'VALIDATED') {
    validationStatus = 'VALIDATION_STATUS.APPROVED';
  } else if (sub.status === 'REJECTED_BY_CENTRAL_COMMITTEE') {
    validationStatus = 'VALIDATION_STATUS.REJECTED';
  }
  
  const baseDate = new Date(sub.submittedDate);
  
  for (let i = 0; i < questions.length; i++) {
    const questionId = questions[i];
    const answer = sampleAnswers[questionId] || 'Sample answer for question ' + questionId;
    const evidenceLink = generateEvidenceLink(sub.id, sub.unitName, questionId);
    
    const responseDate = new Date(baseDate);
    responseDate.setMinutes(responseDate.getMinutes() + i * 5);
    
    responses.push({
      responseId: responseId++,
      submissionId: sub.id,
      subQuestionId: questionId,
      responseValue: answer,
      evidenceLink: evidenceLink,
      evidenceFilePath: null,
      validationStatus: validationStatus,
      centralRejectionReason: null,
      generalNote: null,
      regionalApprovalStatus: regionalApprovalStatus,
      regionalRejectionReason: null,
      regionalNote: regionalNote,
      createdAt: responseDate.toISOString(),
      updatedAt: responseDate.toISOString()
    });
  }
}

// Format as JavaScript array
let output = '\n  // Auto-generated responses for missing submissions\n';
for (const resp of responses) {
  output += `  {\n`;
  output += `    responseId: ${resp.responseId},\n`;
  output += `    submissionId: ${resp.submissionId},\n`;
  output += `    subQuestionId: ${resp.subQuestionId},\n`;
  output += `    responseValue: '${resp.responseValue.replace(/'/g, "\\'")}',\n`;
  output += `    evidenceLink: '${resp.evidenceLink}',\n`;
  output += `    evidenceFilePath: null,\n`;
  output += `    validationStatus: ${resp.validationStatus},\n`;
  output += `    centralRejectionReason: null,\n`;
  output += `    generalNote: null,\n`;
  output += `    regionalApprovalStatus: ${resp.regionalApprovalStatus},\n`;
  output += `    regionalRejectionReason: null,\n`;
  output += `    regionalNote: null,\n`;
  output += `    createdAt: '${resp.createdAt}',\n`;
  output += `    updatedAt: '${resp.updatedAt}'\n`;
  output += `  },\n`;
}

console.log(output);

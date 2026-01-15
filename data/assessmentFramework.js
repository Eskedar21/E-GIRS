// Assessment Framework Data Store with localStorage persistence
// This will be replaced with a database in production

const STORAGE_KEYS = {
  ASSESSMENT_YEARS: 'egirs_assessment_years',
  DIMENSIONS: 'egirs_dimensions',
  INDICATORS: 'egirs_indicators',
  SUB_QUESTIONS: 'egirs_sub_questions'
};

// Default assessment years (only used if localStorage is empty)
const defaultAssessmentYears = [
  // Example data
  {
    assessmentYearId: 1,
    yearName: '2024 Assessment',
    status: 'Active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    assessmentYearId: 2,
    yearName: '2025 Assessment',
    status: 'Draft',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// Default dimensions (only used if localStorage is empty)
const defaultDimensions = [
  // Dimensions for 2024 Assessment (based on UN EGDI)
  {
    dimensionId: 1,
    assessmentYearId: 1,
    dimensionName: 'Institutional Framework',
    dimensionWeight: 16.67,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    dimensionId: 2,
    assessmentYearId: 1,
    dimensionName: 'Content Provision',
    dimensionWeight: 16.67,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    dimensionId: 3,
    assessmentYearId: 1,
    dimensionName: 'Service Delivery',
    dimensionWeight: 16.67,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    dimensionId: 4,
    assessmentYearId: 1,
    dimensionName: 'Participation & Citizen Engagement',
    dimensionWeight: 16.67,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    dimensionId: 5,
    assessmentYearId: 1,
    dimensionName: 'Technology Enablement',
    dimensionWeight: 16.67,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    dimensionId: 6,
    assessmentYearId: 1,
    dimensionName: 'Digital Inclusion',
    dimensionWeight: 16.65,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// Default indicators (only used if localStorage is empty)
const defaultIndicators = [
  // Institutional Framework Indicators
  {
    indicatorId: 1,
    dimensionId: 1,
    indicatorName: 'E-Government Policy and Strategy',
    indicatorWeight: 25.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 2,
    dimensionId: 1,
    indicatorName: 'Legal and Regulatory Framework',
    indicatorWeight: 25.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 3,
    dimensionId: 1,
    indicatorName: 'Institutional Capacity and Coordination',
    indicatorWeight: 25.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 4,
    dimensionId: 1,
    indicatorName: 'Data Governance and Privacy',
    indicatorWeight: 25.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Content Provision Indicators
  {
    indicatorId: 5,
    dimensionId: 2,
    indicatorName: 'Government Website Availability',
    indicatorWeight: 20.00,
    applicableUnitType: 'Woreda',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 6,
    dimensionId: 2,
    indicatorName: 'Information Accessibility and Transparency',
    indicatorWeight: 20.00,
    applicableUnitType: 'Woreda',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 7,
    dimensionId: 2,
    indicatorName: 'Multilingual Content',
    indicatorWeight: 20.00,
    applicableUnitType: 'Woreda',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 8,
    dimensionId: 2,
    indicatorName: 'Content Currency and Updates',
    indicatorWeight: 20.00,
    applicableUnitType: 'Woreda',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 9,
    dimensionId: 2,
    indicatorName: 'Open Data Availability',
    indicatorWeight: 20.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Service Delivery Indicators
  {
    indicatorId: 10,
    dimensionId: 3,
    indicatorName: 'Online Service Availability',
    indicatorWeight: 20.00,
    applicableUnitType: 'Woreda',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 11,
    dimensionId: 3,
    indicatorName: 'Service Integration and One-Stop Portal',
    indicatorWeight: 20.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 12,
    dimensionId: 3,
    indicatorName: 'Mobile Service Delivery',
    indicatorWeight: 20.00,
    applicableUnitType: 'Woreda',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 13,
    dimensionId: 3,
    indicatorName: 'Service Quality and User Experience',
    indicatorWeight: 20.00,
    applicableUnitType: 'Woreda',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 14,
    dimensionId: 3,
    indicatorName: 'Digital Payment Integration',
    indicatorWeight: 20.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Participation & Citizen Engagement Indicators
  {
    indicatorId: 15,
    dimensionId: 4,
    indicatorName: 'Citizen Feedback Mechanisms',
    indicatorWeight: 25.00,
    applicableUnitType: 'Woreda',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 16,
    dimensionId: 4,
    indicatorName: 'Public Consultation Platforms',
    indicatorWeight: 25.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 17,
    dimensionId: 4,
    indicatorName: 'Social Media Engagement',
    indicatorWeight: 25.00,
    applicableUnitType: 'Woreda',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 18,
    dimensionId: 4,
    indicatorName: 'E-Participation Tools',
    indicatorWeight: 25.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Technology Enablement Indicators
  {
    indicatorId: 19,
    dimensionId: 5,
    indicatorName: 'ICT Infrastructure',
    indicatorWeight: 20.00,
    applicableUnitType: 'Zone',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 20,
    dimensionId: 5,
    indicatorName: 'Network Connectivity and Bandwidth',
    indicatorWeight: 20.00,
    applicableUnitType: 'Zone',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 21,
    dimensionId: 5,
    indicatorName: 'Data Center and Cloud Services',
    indicatorWeight: 20.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 22,
    dimensionId: 5,
    indicatorName: 'Cybersecurity Measures',
    indicatorWeight: 20.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 23,
    dimensionId: 5,
    indicatorName: 'System Interoperability',
    indicatorWeight: 20.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Digital Inclusion Indicators
  {
    indicatorId: 24,
    dimensionId: 6,
    indicatorName: 'Digital Literacy Programs',
    indicatorWeight: 25.00,
    applicableUnitType: 'Woreda',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 25,
    dimensionId: 6,
    indicatorName: 'Accessibility for Persons with Disabilities',
    indicatorWeight: 25.00,
    applicableUnitType: 'Woreda',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 26,
    dimensionId: 6,
    indicatorName: 'Rural and Remote Access',
    indicatorWeight: 25.00,
    applicableUnitType: 'Zone',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    indicatorId: 27,
    dimensionId: 6,
    indicatorName: 'Affordable Access Initiatives',
    indicatorWeight: 25.00,
    applicableUnitType: 'Region',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// Default sub questions (only used if localStorage is empty)
const defaultSubQuestions = [
  // E-Government Policy and Strategy (Indicator 1)
  {
    subQuestionId: 1,
    parentIndicatorId: 1,
    subQuestionText: 'Does the organization have a documented e-government policy?',
    subWeightPercentage: 25.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 2,
    parentIndicatorId: 1,
    subQuestionText: 'Is there a dedicated e-government strategy document?',
    subWeightPercentage: 25.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 3,
    parentIndicatorId: 1,
    subQuestionText: 'What is the implementation status of the e-government strategy?',
    subWeightPercentage: 25.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Not Started, In Planning, Partially Implemented, Fully Implemented',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 4,
    parentIndicatorId: 1,
    subQuestionText: 'Describe the key objectives and targets of the e-government strategy.',
    subWeightPercentage: 25.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Legal and Regulatory Framework (Indicator 2)
  {
    subQuestionId: 5,
    parentIndicatorId: 2,
    subQuestionText: 'Are there laws governing electronic transactions and digital signatures?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 6,
    parentIndicatorId: 2,
    subQuestionText: 'Is there data protection and privacy legislation in place?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 7,
    parentIndicatorId: 2,
    subQuestionText: 'Describe the legal framework supporting e-government initiatives.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Institutional Capacity and Coordination (Indicator 3)
  {
    subQuestionId: 8,
    parentIndicatorId: 3,
    subQuestionText: 'Is there a dedicated e-government unit or department?',
    subWeightPercentage: 25.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 9,
    parentIndicatorId: 3,
    subQuestionText: 'What mechanisms exist for inter-agency coordination?',
    subWeightPercentage: 25.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Regular Meetings, Shared Platforms, Joint Committees, No Coordination',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 10,
    parentIndicatorId: 3,
    subQuestionText: 'What is the level of technical staff capacity?',
    subWeightPercentage: 25.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Insufficient, Basic, Adequate, Advanced',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 11,
    parentIndicatorId: 3,
    subQuestionText: 'Describe the organizational structure for e-government management.',
    subWeightPercentage: 25.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Data Governance and Privacy (Indicator 4)
  {
    subQuestionId: 12,
    parentIndicatorId: 4,
    subQuestionText: 'Is there a data governance policy in place?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 13,
    parentIndicatorId: 4,
    subQuestionText: 'Are privacy protection measures implemented?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 14,
    parentIndicatorId: 4,
    subQuestionText: 'Describe the data security and privacy measures implemented.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Government Website Availability (Indicator 5)
  {
    subQuestionId: 15,
    parentIndicatorId: 5,
    subQuestionText: 'Does the administrative unit have an official website?',
    subWeightPercentage: 50.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 16,
    parentIndicatorId: 5,
    subQuestionText: 'What is the website availability status?',
    subWeightPercentage: 50.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Fully Operational, Partially Operational, Under Development, Not Available',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Information Accessibility and Transparency (Indicator 6)
  {
    subQuestionId: 17,
    parentIndicatorId: 6,
    subQuestionText: 'Is organizational information publicly accessible online?',
    subWeightPercentage: 25.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 18,
    parentIndicatorId: 6,
    subQuestionText: 'What types of information are published online?',
    subWeightPercentage: 25.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Contact Information, Organizational Structure, Budget and Finance, Policies and Regulations, Service Information, Annual Reports',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 19,
    parentIndicatorId: 6,
    subQuestionText: 'Is there a freedom of information mechanism?',
    subWeightPercentage: 25.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 20,
    parentIndicatorId: 6,
    subQuestionText: 'Describe the transparency and information disclosure practices.',
    subWeightPercentage: 25.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Multilingual Content (Indicator 7)
  {
    subQuestionId: 21,
    parentIndicatorId: 7,
    subQuestionText: 'Is the website available in multiple languages?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 22,
    parentIndicatorId: 7,
    subQuestionText: 'Which languages are supported?',
    subWeightPercentage: 33.33,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'English, Amharic, Oromifa, Tigrinya, Somali, Afar, Other Local Languages',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 23,
    parentIndicatorId: 7,
    subQuestionText: 'Describe the multilingual content strategy and implementation.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Content Currency and Updates (Indicator 8)
  {
    subQuestionId: 24,
    parentIndicatorId: 8,
    subQuestionText: 'How frequently is the website content updated?',
    subWeightPercentage: 50.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Daily, Weekly, Monthly, Quarterly, Annually, Rarely or Never',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 25,
    parentIndicatorId: 8,
    subQuestionText: 'Is there a content management system in place?',
    subWeightPercentage: 50.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Open Data Availability (Indicator 9)
  {
    subQuestionId: 26,
    parentIndicatorId: 9,
    subQuestionText: 'Is there an open data portal or platform?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 27,
    parentIndicatorId: 9,
    subQuestionText: 'What types of datasets are published?',
    subWeightPercentage: 33.33,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Statistical Data, Budget Data, Service Data, Geographic Data, Administrative Data, Other',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 28,
    parentIndicatorId: 9,
    subQuestionText: 'Describe the open data initiative and data formats used.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Online Service Availability (Indicator 10)
  {
    subQuestionId: 29,
    parentIndicatorId: 10,
    subQuestionText: 'How many government services are available online?',
    subWeightPercentage: 25.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'None, 1-5 services, 6-10 services, 11-20 services, More than 20 services',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 30,
    parentIndicatorId: 10,
    subQuestionText: 'What types of services are provided online?',
    subWeightPercentage: 25.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Information Services, Download Forms, Online Applications, Payment Services, Status Tracking, Complaint Handling',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 31,
    parentIndicatorId: 10,
    subQuestionText: 'Can citizens complete transactions fully online?',
    subWeightPercentage: 25.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 32,
    parentIndicatorId: 10,
    subQuestionText: 'Describe the online service delivery capabilities and examples.',
    subWeightPercentage: 25.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Service Integration and One-Stop Portal (Indicator 11)
  {
    subQuestionId: 33,
    parentIndicatorId: 11,
    subQuestionText: 'Is there a one-stop portal for government services?',
    subWeightPercentage: 50.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 34,
    parentIndicatorId: 11,
    subQuestionText: 'Describe the level of service integration across agencies.',
    subWeightPercentage: 50.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Mobile Service Delivery (Indicator 12)
  {
    subQuestionId: 35,
    parentIndicatorId: 12,
    subQuestionText: 'Are services accessible via mobile devices?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 36,
    parentIndicatorId: 12,
    subQuestionText: 'What mobile platforms are supported?',
    subWeightPercentage: 33.33,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Mobile Website, Android App, iOS App, SMS Services, USSD Services',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 37,
    parentIndicatorId: 12,
    subQuestionText: 'Describe mobile service delivery initiatives.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Service Quality and User Experience (Indicator 13)
  {
    subQuestionId: 38,
    parentIndicatorId: 13,
    subQuestionText: 'Is there a user feedback mechanism for online services?',
    subWeightPercentage: 25.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 39,
    parentIndicatorId: 13,
    subQuestionText: 'What is the average service response time?',
    subWeightPercentage: 25.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Same Day, 1-3 Days, 4-7 Days, 1-2 Weeks, More than 2 Weeks',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 40,
    parentIndicatorId: 13,
    subQuestionText: 'Are services designed with user-centered principles?',
    subWeightPercentage: 25.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 41,
    parentIndicatorId: 13,
    subQuestionText: 'Describe user experience design and accessibility features.',
    subWeightPercentage: 25.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Digital Payment Integration (Indicator 14)
  {
    subQuestionId: 42,
    parentIndicatorId: 14,
    subQuestionText: 'Are digital payment options available for government services?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 43,
    parentIndicatorId: 14,
    subQuestionText: 'What payment methods are supported?',
    subWeightPercentage: 33.33,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Credit/Debit Cards, Mobile Money, Bank Transfer, Digital Wallets, Other',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 44,
    parentIndicatorId: 14,
    subQuestionText: 'Describe the digital payment infrastructure and security measures.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Citizen Feedback Mechanisms (Indicator 15)
  {
    subQuestionId: 45,
    parentIndicatorId: 15,
    subQuestionText: 'Are there online feedback forms or surveys?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 46,
    parentIndicatorId: 15,
    subQuestionText: 'What feedback channels are available?',
    subWeightPercentage: 33.33,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Online Forms, Email, Phone, Social Media, In-Person, Other',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 47,
    parentIndicatorId: 15,
    subQuestionText: 'Describe how citizen feedback is collected and acted upon.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Public Consultation Platforms (Indicator 16)
  {
    subQuestionId: 48,
    parentIndicatorId: 16,
    subQuestionText: 'Are there online platforms for public consultation?',
    subWeightPercentage: 50.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 49,
    parentIndicatorId: 16,
    subQuestionText: 'Describe public consultation mechanisms and participation levels.',
    subWeightPercentage: 50.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Social Media Engagement (Indicator 17)
  {
    subQuestionId: 50,
    parentIndicatorId: 17,
    subQuestionText: 'Does the organization use social media for citizen engagement?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 51,
    parentIndicatorId: 17,
    subQuestionText: 'Which social media platforms are used?',
    subWeightPercentage: 33.33,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Facebook, Twitter, Instagram, LinkedIn, YouTube, Telegram, Other',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 52,
    parentIndicatorId: 17,
    subQuestionText: 'Describe social media engagement strategy and activity levels.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // E-Participation Tools (Indicator 18)
  {
    subQuestionId: 53,
    parentIndicatorId: 18,
    subQuestionText: 'Are e-participation tools available for citizens?',
    subWeightPercentage: 50.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 54,
    parentIndicatorId: 18,
    subQuestionText: 'Describe e-participation initiatives and citizen involvement.',
    subWeightPercentage: 50.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // ICT Infrastructure (Indicator 19)
  {
    subQuestionId: 55,
    parentIndicatorId: 19,
    subQuestionText: 'What is the level of ICT infrastructure development?',
    subWeightPercentage: 25.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Basic, Developing, Advanced, State-of-the-Art',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 56,
    parentIndicatorId: 19,
    subQuestionText: 'Are computer systems available for staff?',
    subWeightPercentage: 25.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 57,
    parentIndicatorId: 19,
    subQuestionText: 'What percentage of staff have access to computers?',
    subWeightPercentage: 25.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Less than 25%, 25-50%, 51-75%, 76-100%',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 58,
    parentIndicatorId: 19,
    subQuestionText: 'Describe the ICT infrastructure and hardware availability.',
    subWeightPercentage: 25.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Network Connectivity and Bandwidth (Indicator 20)
  {
    subQuestionId: 59,
    parentIndicatorId: 20,
    subQuestionText: 'What is the internet connectivity status?',
    subWeightPercentage: 33.33,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'No Internet, Dial-up, Broadband, Fiber Optic, Satellite',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 60,
    parentIndicatorId: 20,
    subQuestionText: 'What is the average internet bandwidth?',
    subWeightPercentage: 33.33,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Less than 1 Mbps, 1-5 Mbps, 6-10 Mbps, 11-50 Mbps, More than 50 Mbps',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 61,
    parentIndicatorId: 20,
    subQuestionText: 'Describe network infrastructure and connectivity reliability.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Data Center and Cloud Services (Indicator 21)
  {
    subQuestionId: 62,
    parentIndicatorId: 21,
    subQuestionText: 'Is there a data center or cloud infrastructure?',
    subWeightPercentage: 50.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 63,
    parentIndicatorId: 21,
    subQuestionText: 'Describe data center facilities and cloud service utilization.',
    subWeightPercentage: 50.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Cybersecurity Measures (Indicator 22)
  {
    subQuestionId: 64,
    parentIndicatorId: 22,
    subQuestionText: 'Are cybersecurity measures implemented?',
    subWeightPercentage: 25.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 65,
    parentIndicatorId: 22,
    subQuestionText: 'What cybersecurity measures are in place?',
    subWeightPercentage: 25.00,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Firewall, Antivirus, Encryption, Access Controls, Security Audits, Incident Response Plan',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 66,
    parentIndicatorId: 22,
    subQuestionText: 'Is there a cybersecurity policy?',
    subWeightPercentage: 25.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 67,
    parentIndicatorId: 22,
    subQuestionText: 'Describe cybersecurity framework and incident management.',
    subWeightPercentage: 25.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // System Interoperability (Indicator 23)
  {
    subQuestionId: 68,
    parentIndicatorId: 23,
    subQuestionText: 'Are systems interoperable with other government systems?',
    subWeightPercentage: 50.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 69,
    parentIndicatorId: 23,
    subQuestionText: 'Describe system interoperability standards and data exchange mechanisms.',
    subWeightPercentage: 50.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Digital Literacy Programs (Indicator 24)
  {
    subQuestionId: 70,
    parentIndicatorId: 24,
    subQuestionText: 'Are digital literacy programs offered?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 71,
    parentIndicatorId: 24,
    subQuestionText: 'What types of digital literacy programs are available?',
    subWeightPercentage: 33.33,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Basic Computer Skills, Internet Usage, E-Government Services, Mobile Applications, Online Safety',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 72,
    parentIndicatorId: 24,
    subQuestionText: 'Describe digital literacy initiatives and participation rates.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Accessibility for Persons with Disabilities (Indicator 25)
  {
    subQuestionId: 73,
    parentIndicatorId: 25,
    subQuestionText: 'Are websites and services accessible to persons with disabilities?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 74,
    parentIndicatorId: 25,
    subQuestionText: 'What accessibility features are implemented?',
    subWeightPercentage: 33.33,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Screen Reader Support, Keyboard Navigation, Text Alternatives, High Contrast, Font Size Options, Sign Language Videos',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 75,
    parentIndicatorId: 25,
    subQuestionText: 'Describe accessibility measures and compliance with standards.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Rural and Remote Access (Indicator 26)
  {
    subQuestionId: 76,
    parentIndicatorId: 26,
    subQuestionText: 'Are services accessible in rural and remote areas?',
    subWeightPercentage: 33.33,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 77,
    parentIndicatorId: 26,
    subQuestionText: 'What mechanisms exist for rural access?',
    subWeightPercentage: 33.33,
    responseType: 'MultipleSelectCheckbox',
    checkboxOptions: 'Community Access Points, Mobile Units, Satellite Connectivity, Offline Capabilities, Local Service Centers',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 78,
    parentIndicatorId: 26,
    subQuestionText: 'Describe initiatives for extending services to rural and remote areas.',
    subWeightPercentage: 33.34,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Affordable Access Initiatives (Indicator 27)
  {
    subQuestionId: 79,
    parentIndicatorId: 27,
    subQuestionText: 'Are there initiatives to make digital services affordable?',
    subWeightPercentage: 50.00,
    responseType: 'Yes/No',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    subQuestionId: 80,
    parentIndicatorId: 27,
    subQuestionText: 'Describe affordable access programs and subsidies.',
    subWeightPercentage: 50.00,
    responseType: 'TextExplanation',
    checkboxOptions: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// Load functions for localStorage
const loadAssessmentYears = () => {
  if (typeof window === 'undefined') return [...defaultAssessmentYears];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_YEARS);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading assessment years from localStorage:', error);
  }
  saveAssessmentYears(defaultAssessmentYears);
  return [...defaultAssessmentYears];
};

const loadDimensions = () => {
  if (typeof window === 'undefined') return [...defaultDimensions];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DIMENSIONS);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading dimensions from localStorage:', error);
  }
  saveDimensions(defaultDimensions);
  return [...defaultDimensions];
};

const loadIndicators = () => {
  if (typeof window === 'undefined') return [...defaultIndicators];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INDICATORS);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading indicators from localStorage:', error);
  }
  saveIndicators(defaultIndicators);
  return [...defaultIndicators];
};

const loadSubQuestions = () => {
  if (typeof window === 'undefined') return [...defaultSubQuestions];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUB_QUESTIONS);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading sub questions from localStorage:', error);
  }
  saveSubQuestions(defaultSubQuestions);
  return [...defaultSubQuestions];
};

// Save functions for localStorage
const saveAssessmentYears = (yearsToSave) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_YEARS, JSON.stringify(yearsToSave));
  } catch (error) {
    console.error('Error saving assessment years to localStorage:', error);
  }
};

const saveDimensions = (dimensionsToSave) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.DIMENSIONS, JSON.stringify(dimensionsToSave));
  } catch (error) {
    console.error('Error saving dimensions to localStorage:', error);
  }
};

const saveIndicators = (indicatorsToSave) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(indicatorsToSave));
  } catch (error) {
    console.error('Error saving indicators to localStorage:', error);
  }
};

const saveSubQuestions = (subQuestionsToSave) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SUB_QUESTIONS, JSON.stringify(subQuestionsToSave));
  } catch (error) {
    console.error('Error saving sub questions to localStorage:', error);
  }
};

// Initialize arrays from localStorage
let assessmentYears = loadAssessmentYears();
let dimensions = loadDimensions();
let indicators = loadIndicators();
let subQuestions = loadSubQuestions();

// Assessment Year Status
export const ASSESSMENT_STATUS = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ARCHIVED: 'Archived'
};

// Response Types
export const RESPONSE_TYPES = {
  YES_NO: 'Yes/No',
  MULTIPLE_SELECT_CHECKBOX: 'MultipleSelectCheckbox',
  TEXT_EXPLANATION: 'TextExplanation'
};

// Unit Types for ApplicableUnitType
export const APPLICABLE_UNIT_TYPES = [
  'Federal Institute',
  'Region',
  'City Administration',
  'Zone',
  'Sub-city',
  'Woreda'
];

// Assessment Years
export const getAllAssessmentYears = () => {
  assessmentYears = loadAssessmentYears(); // Reload to ensure latest data
  return [...assessmentYears];
};
export const getAssessmentYearById = (id) => {
  assessmentYears = loadAssessmentYears(); // Reload to ensure latest data
  return assessmentYears.find(y => y.assessmentYearId === id);
};
export const createAssessmentYear = (yearData) => {
  assessmentYears = loadAssessmentYears(); // Reload to ensure latest data
  const newYear = {
    assessmentYearId: assessmentYears.length > 0 
      ? Math.max(...assessmentYears.map(y => y.assessmentYearId)) + 1 
      : 1,
    yearName: yearData.yearName,
    status: yearData.status || ASSESSMENT_STATUS.DRAFT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  assessmentYears.push(newYear);
  saveAssessmentYears(assessmentYears);
  return newYear;
};
export const updateAssessmentYear = (id, yearData) => {
  assessmentYears = loadAssessmentYears(); // Reload to ensure latest data
  const index = assessmentYears.findIndex(y => y.assessmentYearId === id);
  if (index !== -1) {
    assessmentYears[index] = {
      ...assessmentYears[index],
      ...yearData,
      updatedAt: new Date().toISOString()
    };
    saveAssessmentYears(assessmentYears);
    return assessmentYears[index];
  }
  return null;
};

// Dimensions
export const getDimensionsByYear = (yearId) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  return dimensions.filter(d => d.assessmentYearId === yearId);
};
export const getDimensionById = (id) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  return dimensions.find(d => d.dimensionId === id);
};
export const getTotalDimensionWeight = (yearId) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  return dimensions
    .filter(d => d.assessmentYearId === yearId)
    .reduce((sum, d) => sum + d.dimensionWeight, 0);
};
export const createDimension = (dimensionData) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  const newDimension = {
    dimensionId: dimensions.length > 0 
      ? Math.max(...dimensions.map(d => d.dimensionId)) + 1 
      : 1,
    assessmentYearId: dimensionData.assessmentYearId,
    dimensionName: dimensionData.dimensionName,
    dimensionWeight: parseFloat(dimensionData.dimensionWeight),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  dimensions.push(newDimension);
  saveDimensions(dimensions);
  return newDimension;
};
export const updateDimension = (id, dimensionData) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  const index = dimensions.findIndex(d => d.dimensionId === id);
  if (index !== -1) {
    dimensions[index] = {
      ...dimensions[index],
      ...dimensionData,
      dimensionWeight: parseFloat(dimensionData.dimensionWeight || dimensions[index].dimensionWeight),
      updatedAt: new Date().toISOString()
    };
    saveDimensions(dimensions);
    return dimensions[index];
  }
  return null;
};
export const deleteDimension = (id) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  const index = dimensions.findIndex(d => d.dimensionId === id);
  if (index !== -1) {
    const deleted = dimensions.splice(index, 1)[0];
    saveDimensions(dimensions);
    return deleted;
  }
  return null;
};

// Indicators
export const getIndicatorsByDimension = (dimensionId) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  return indicators.filter(i => i.dimensionId === dimensionId);
};
export const getIndicatorById = (id) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  return indicators.find(i => i.indicatorId === id);
};
export const getTotalIndicatorWeight = (dimensionId) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  return indicators
    .filter(i => i.dimensionId === dimensionId)
    .reduce((sum, i) => sum + i.indicatorWeight, 0);
};
export const createIndicator = (indicatorData) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  const newIndicator = {
    indicatorId: indicators.length > 0 
      ? Math.max(...indicators.map(i => i.indicatorId)) + 1 
      : 1,
    dimensionId: indicatorData.dimensionId,
    indicatorName: indicatorData.indicatorName,
    indicatorWeight: parseFloat(indicatorData.indicatorWeight),
    applicableUnitType: indicatorData.applicableUnitType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  indicators.push(newIndicator);
  saveIndicators(indicators);
  return newIndicator;
};
export const updateIndicator = (id, indicatorData) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  const index = indicators.findIndex(i => i.indicatorId === id);
  if (index !== -1) {
    indicators[index] = {
      ...indicators[index],
      ...indicatorData,
      indicatorWeight: parseFloat(indicatorData.indicatorWeight || indicators[index].indicatorWeight),
      updatedAt: new Date().toISOString()
    };
    saveIndicators(indicators);
    return indicators[index];
  }
  return null;
};
export const deleteIndicator = (id) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  const index = indicators.findIndex(i => i.indicatorId === id);
  if (index !== -1) {
    const deleted = indicators.splice(index, 1)[0];
    saveIndicators(indicators);
    return deleted;
  }
  return null;
};

// Sub-Questions
export const getSubQuestionsByIndicator = (indicatorId) => {
  subQuestions = loadSubQuestions(); // Reload to ensure latest data
  return subQuestions.filter(sq => sq.parentIndicatorId === indicatorId);
};
export const getSubQuestionById = (id) => {
  subQuestions = loadSubQuestions(); // Reload to ensure latest data
  return subQuestions.find(sq => sq.subQuestionId === id);
};
export const getTotalSubQuestionWeight = (indicatorId) => {
  subQuestions = loadSubQuestions(); // Reload to ensure latest data
  return subQuestions
    .filter(sq => sq.parentIndicatorId === indicatorId)
    .reduce((sum, sq) => sum + sq.subWeightPercentage, 0);
};
export const createSubQuestion = (subQuestionData) => {
  subQuestions = loadSubQuestions(); // Reload to ensure latest data
  const newSubQuestion = {
    subQuestionId: subQuestions.length > 0 
      ? Math.max(...subQuestions.map(sq => sq.subQuestionId)) + 1 
      : 1,
    parentIndicatorId: subQuestionData.parentIndicatorId,
    subQuestionText: subQuestionData.subQuestionText,
    subWeightPercentage: parseFloat(subQuestionData.subWeightPercentage),
    responseType: subQuestionData.responseType,
    checkboxOptions: subQuestionData.checkboxOptions || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  subQuestions.push(newSubQuestion);
  saveSubQuestions(subQuestions);
  return newSubQuestion;
};
export const updateSubQuestion = (id, subQuestionData) => {
  subQuestions = loadSubQuestions(); // Reload to ensure latest data
  const index = subQuestions.findIndex(sq => sq.subQuestionId === id);
  if (index !== -1) {
    subQuestions[index] = {
      ...subQuestions[index],
      ...subQuestionData,
      subWeightPercentage: parseFloat(subQuestionData.subWeightPercentage || subQuestions[index].subWeightPercentage),
      updatedAt: new Date().toISOString()
    };
    saveSubQuestions(subQuestions);
    return subQuestions[index];
  }
  return null;
};
export const deleteSubQuestion = (id) => {
  subQuestions = loadSubQuestions(); // Reload to ensure latest data
  const index = subQuestions.findIndex(sq => sq.subQuestionId === id);
  if (index !== -1) {
    const deleted = subQuestions.splice(index, 1)[0];
    saveSubQuestions(subQuestions);
    return deleted;
  }
  return null;
};


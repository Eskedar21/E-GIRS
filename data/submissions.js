// Submissions Data Store
// This will be replaced with a database in production

// Submission Status
export const SUBMISSION_STATUS = {
  DRAFT: 'Draft',
  PENDING_INITIAL_APPROVAL: 'Pending Initial Approval',
  PENDING_CENTRAL_VALIDATION: 'Pending Central Validation',
  REJECTED_BY_INITIAL_APPROVER: 'Rejected by Initial Approver',
  REJECTED_BY_CENTRAL_COMMITTEE: 'Rejected by Central Committee',
  VALIDATED: 'Validated',
  SCORING_COMPLETE: 'Scoring Complete'
};

// Validation Status
export const VALIDATION_STATUS = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PENDING: 'Pending'
};

let submissions = [
  // Example submissions for Central Validation (already approved by Regional Approvers)
  {
    submissionId: 1,
    submissionName: 'Ministry of Health - 2024 Q4 Assessment',
    unitId: 1, // Ministry of Health
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-15T10:30:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-16T14:20:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-10T08:00:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    submissionId: 2,
    submissionName: 'Ministry of Education - 2024 Annual Report',
    unitId: 2, // Ministry of Education
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-14T09:15:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-15T16:45:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-08T08:00:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    submissionId: 3,
    submissionName: 'Addis Ababa City Administration - Digital Transformation 2024',
    unitId: 10, // Addis Ababa City Administration
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-13T11:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-14T10:30:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-05T08:00:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  // Sample submissions for Regional Approvers (Pending Initial Approval - just submitted)
  {
    submissionId: 4,
    submissionName: 'Addis Ababa City Administration - Q4 2024 Submission',
    unitId: 10, // Addis Ababa City Administration
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-18T09:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-15T08:00:00.000Z',
    updatedAt: '2024-12-18T09:00:00.000Z'
  },
  {
    submissionId: 5,
    submissionName: 'Addis Ketema Sub-city - 2024 Assessment',
    unitId: 100, // Addis Ketema Sub-city (under Addis Ababa)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-17T14:30:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-12T08:00:00.000Z',
    updatedAt: '2024-12-17T14:30:00.000Z'
  },
  {
    submissionId: 6,
    submissionName: 'Akaki Kality Sub-city - 2024 Assessment',
    unitId: 101, // Akaki Kality Sub-city (under Addis Ababa)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-16T11:15:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-10T08:00:00.000Z',
    updatedAt: '2024-12-16T11:15:00.000Z'
  },
  {
    submissionId: 7,
    submissionName: 'Oromia Region - 2024 Annual Assessment',
    unitId: 20, // Oromia Region
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-19T10:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-14T08:00:00.000Z',
    updatedAt: '2024-12-19T10:00:00.000Z'
  },
  // Sample submission rejected by Central Committee
  {
    submissionId: 8,
    submissionName: 'Addis Ababa City Administration - 2024 Q3 Assessment',
    unitId: 10, // Addis Ababa City Administration
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-11-20T09:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-11-25T14:30:00.000Z',
    rejectionReason: 'Central Committee found several responses insufficient. Please review and resubmit.',
    createdAt: '2024-11-15T08:00:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  // Sample validated submission
  {
    submissionId: 9,
    submissionName: 'Arada Sub-city - 2024 Q2 Assessment',
    unitId: 102, // Arada Sub-city (under Addis Ababa)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.VALIDATED,
    submittedDate: '2024-10-15T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-10-20T14:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-10-10T08:00:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  // Region submissions with different statuses
  {
    submissionId: 10,
    submissionName: 'Oromia Region - 2024 Q4 Assessment',
    unitId: 20, // Oromia Region
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-23T10:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-18T08:00:00.000Z',
    updatedAt: '2024-12-23T10:00:00.000Z'
  },
  {
    submissionId: 11,
    submissionName: 'Amhara Region - 2024 Annual Assessment',
    unitId: 21, // Amhara Region
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-20T11:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-21T15:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-15T08:00:00.000Z',
    updatedAt: '2024-12-21T15:00:00.000Z'
  },
  {
    submissionId: 12,
    submissionName: 'Oromia Region - 2024 Q3 Assessment',
    unitId: 20, // Oromia Region
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-11-30T09:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-05T14:00:00.000Z',
    rejectionReason: 'Central Committee requires additional evidence for service delivery indicators.',
    createdAt: '2024-11-25T08:00:00.000Z',
    updatedAt: '2024-12-10T10:00:00.000Z'
  },
  {
    submissionId: 13,
    submissionName: 'Amhara Region - 2024 Q2 Assessment',
    unitId: 21, // Amhara Region
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.VALIDATED,
    submittedDate: '2024-10-20T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-10-25T14:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-10-15T08:00:00.000Z',
    updatedAt: '2024-10-30T16:00:00.000Z'
  },
  {
    submissionId: 14,
    submissionName: 'Tigray Region - 2024 Assessment',
    unitId: 22, // Tigray Region
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-24T08:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-19T08:00:00.000Z',
    updatedAt: '2024-12-24T08:00:00.000Z'
  },
  // Zone submissions with different statuses
  {
    submissionId: 15,
    submissionName: 'West Arsi Zone - 2024 Annual Assessment',
    unitId: 200, // West Arsi Zone (under Oromia Region)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-20T09:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-15T08:00:00.000Z',
    updatedAt: '2024-12-20T09:00:00.000Z'
  },
  {
    submissionId: 16,
    submissionName: 'East Shewa Zone - 2024 Q4 Assessment',
    unitId: 201, // East Shewa Zone (under Oromia Region)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-18T11:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-19T15:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-12T08:00:00.000Z',
    updatedAt: '2024-12-19T15:00:00.000Z'
  },
  {
    submissionId: 17,
    submissionName: 'North Gondar Zone - 2024 Assessment',
    unitId: 300, // North Gondar Zone (under Amhara Region)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-11-25T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-11-28T14:00:00.000Z',
    rejectionReason: 'Central Committee found insufficient evidence for several responses.',
    createdAt: '2024-11-20T08:00:00.000Z',
    updatedAt: '2024-12-05T10:00:00.000Z'
  },
  {
    submissionId: 18,
    submissionName: 'Jimma Zone - 2024 Assessment',
    unitId: 204, // Jimma Zone (under Oromia Region)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.VALIDATED,
    submittedDate: '2024-11-10T09:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-11-15T13:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-11-05T08:00:00.000Z',
    updatedAt: '2024-11-20T16:00:00.000Z'
  },
  {
    submissionId: 19,
    submissionName: 'North Shewa Zone - 2024 Assessment',
    unitId: 202, // North Shewa Zone (under Oromia Region)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-24T08:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-19T08:00:00.000Z',
    updatedAt: '2024-12-24T08:00:00.000Z'
  },
  {
    submissionId: 20,
    submissionName: 'West Shewa Zone - 2024 Q4 Assessment',
    unitId: 203, // West Shewa Zone (under Oromia Region)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-21T09:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-22T13:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-16T08:00:00.000Z',
    updatedAt: '2024-12-22T13:00:00.000Z'
  },
  {
    submissionId: 21,
    submissionName: 'Bale Zone - 2024 Assessment',
    unitId: 205, // Bale Zone (under Oromia Region)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-12-01T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-06T11:00:00.000Z',
    rejectionReason: 'Insufficient documentation for technology enablement dimension.',
    createdAt: '2024-11-28T08:00:00.000Z',
    updatedAt: '2024-12-10T10:00:00.000Z'
  },
  {
    submissionId: 22,
    submissionName: 'South Gondar Zone - 2024 Assessment',
    unitId: 301, // South Gondar Zone (under Amhara Region)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-25T09:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-20T08:00:00.000Z',
    updatedAt: '2024-12-25T09:00:00.000Z'
  },
  {
    submissionId: 23,
    submissionName: 'North Wollo Zone - 2024 Q4 Assessment',
    unitId: 302, // North Wollo Zone (under Amhara Region)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.VALIDATED,
    submittedDate: '2024-11-15T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-11-20T14:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-11-10T08:00:00.000Z',
    updatedAt: '2024-11-25T16:00:00.000Z'
  },
  // Woreda submissions with different statuses
  {
    submissionId: 24,
    submissionName: 'Shashemene Woreda - 2024 Assessment',
    unitId: 2000, // Shashemene Woreda (under West Arsi Zone)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-21T08:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-16T08:00:00.000Z',
    updatedAt: '2024-12-21T08:00:00.000Z'
  },
  {
    submissionId: 25,
    submissionName: 'Kofele Woreda - 2024 Q4 Assessment',
    unitId: 2001, // Kofele Woreda (under West Arsi Zone)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-19T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-20T14:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-14T08:00:00.000Z',
    updatedAt: '2024-12-20T14:00:00.000Z'
  },
  {
    submissionId: 26,
    submissionName: 'Gondar Woreda - 2024 Assessment',
    unitId: 3000, // Gondar Woreda (under North Gondar Zone)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-11-28T09:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-01T11:00:00.000Z',
    rejectionReason: 'Central Committee requires additional documentation for policy framework questions.',
    createdAt: '2024-11-25T08:00:00.000Z',
    updatedAt: '2024-12-05T10:00:00.000Z'
  },
  {
    submissionId: 27,
    submissionName: 'Bishoftu Woreda - 2024 Assessment',
    unitId: 2010, // Bishoftu Woreda (under East Shewa Zone)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.VALIDATED,
    submittedDate: '2024-11-12T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-11-18T15:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-11-08T08:00:00.000Z',
    updatedAt: '2024-11-25T16:00:00.000Z'
  },
  {
    submissionId: 28,
    submissionName: 'Adama Woreda - 2024 Q4 Assessment',
    unitId: 2011, // Adama Woreda (under East Shewa Zone)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-22T09:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-17T08:00:00.000Z',
    updatedAt: '2024-12-22T09:00:00.000Z'
  },
  {
    submissionId: 29,
    submissionName: 'Kokosa Woreda - 2024 Assessment',
    unitId: 2002, // Kokosa Woreda (under West Arsi Zone)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-26T08:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-21T08:00:00.000Z',
    updatedAt: '2024-12-26T08:00:00.000Z'
  },
  {
    submissionId: 30,
    submissionName: 'Debark Woreda - 2024 Assessment',
    unitId: 3001, // Debark Woreda (under North Gondar Zone)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-12-02T09:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-07T12:00:00.000Z',
    rejectionReason: 'Policy framework documentation needs to be more comprehensive.',
    createdAt: '2024-11-29T08:00:00.000Z',
    updatedAt: '2024-12-10T10:00:00.000Z'
  },
  // City Administration submissions with different statuses
  {
    submissionId: 31,
    submissionName: 'Addis Ababa City Administration - 2024 Q1 Assessment',
    unitId: 10, // Addis Ababa City Administration
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-29T09:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-24T08:00:00.000Z',
    updatedAt: '2024-12-29T09:00:00.000Z'
  },
  {
    submissionId: 32,
    submissionName: 'Addis Ababa City Administration - 2024 Q2 Assessment',
    unitId: 10, // Addis Ababa City Administration
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-25T11:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-26T15:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-20T08:00:00.000Z',
    updatedAt: '2024-12-26T15:00:00.000Z'
  },
  {
    submissionId: 33,
    submissionName: 'Addis Ababa City Administration - 2024 Annual Report',
    unitId: 10, // Addis Ababa City Administration
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.VALIDATED,
    submittedDate: '2024-11-25T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-11-30T14:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-11-20T08:00:00.000Z',
    updatedAt: '2024-12-05T16:00:00.000Z'
  },
  {
    submissionId: 34,
    submissionName: 'Dire Dawa City Administration - 2024 Assessment',
    unitId: 11, // Dire Dawa City Administration
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-27T08:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-22T08:00:00.000Z',
    updatedAt: '2024-12-27T08:00:00.000Z'
  },
  // Sub-city submissions with different statuses
  {
    submissionId: 35,
    submissionName: 'Bole Sub-city - 2024 Assessment',
    unitId: 103, // Bole Sub-city (under Addis Ababa)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-28T08:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-23T08:00:00.000Z',
    updatedAt: '2024-12-28T08:00:00.000Z'
  },
  {
    submissionId: 36,
    submissionName: 'Gullele Sub-city - 2024 Q4 Assessment',
    unitId: 104, // Gullele Sub-city (under Addis Ababa)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-24T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-25T14:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-19T08:00:00.000Z',
    updatedAt: '2024-12-25T14:00:00.000Z'
  },
  {
    submissionId: 37,
    submissionName: 'Kirkos Sub-city - 2024 Assessment',
    unitId: 105, // Kirkos Sub-city (under Addis Ababa)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-12-03T09:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-08T12:00:00.000Z',
    rejectionReason: 'Central Committee found gaps in digital inclusion documentation.',
    createdAt: '2024-11-30T08:00:00.000Z',
    updatedAt: '2024-12-10T10:00:00.000Z'
  },
  {
    submissionId: 38,
    submissionName: 'Kolfe Keranio Sub-city - 2024 Assessment',
    unitId: 106, // Kolfe Keranio Sub-city (under Addis Ababa)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.VALIDATED,
    submittedDate: '2024-11-20T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-11-25T15:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-11-15T08:00:00.000Z',
    updatedAt: '2024-11-30T16:00:00.000Z'
  },
  {
    submissionId: 39,
    submissionName: 'Lideta Sub-city - 2024 Assessment',
    unitId: 107, // Lideta Sub-city (under Addis Ababa)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-30T08:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-25T08:00:00.000Z',
    updatedAt: '2024-12-30T08:00:00.000Z'
  },
  {
    submissionId: 40,
    submissionName: 'Nifas Silk-Lafto Sub-city - 2024 Q4 Assessment',
    unitId: 108, // Nifas Silk-Lafto Sub-city (under Addis Ababa)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-26T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-12-27T14:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-21T08:00:00.000Z',
    updatedAt: '2024-12-27T14:00:00.000Z'
  },
  {
    submissionId: 41,
    submissionName: 'Yeka Sub-city - 2024 Assessment',
    unitId: 109, // Yeka Sub-city (under Addis Ababa)
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.VALIDATED,
    submittedDate: '2024-11-22T10:00:00.000Z',
    approverUserId: 3, // approver1
    approvalDate: '2024-11-27T15:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-11-17T08:00:00.000Z',
    updatedAt: '2024-12-02T16:00:00.000Z'
  }
];

let responses = [
  // Example responses for Submission 1 (Ministry of Health) - All questions answered, approved by Regional Approver
  {
    responseId: 1,
    submissionId: 1,
    subQuestionId: 1,
    responseValue: 'Yes, we have a comprehensive e-government policy document that was approved in 2023.',
    evidenceLink: 'https://moh.gov.et/policies/e-government-policy-2023.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: 'Policy document reviewed and approved.',
    createdAt: '2024-12-10T08:30:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 2,
    submissionId: 1,
    subQuestionId: 2,
    responseValue: 'The policy includes specific targets for digital service delivery, citizen engagement, and infrastructure development.',
    evidenceLink: 'https://moh.gov.et/policies/e-government-policy-2023.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T08:35:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 3,
    submissionId: 1,
    subQuestionId: 3,
    responseValue: 'Yes, we have a dedicated e-government unit with 15 staff members.',
    evidenceLink: 'https://moh.gov.et/organizational-structure',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T08:40:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 4,
    submissionId: 1,
    subQuestionId: 4,
    responseValue: 'Our website provides information on health services, policies, and public health announcements.',
    evidenceLink: 'https://moh.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T08:45:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 5,
    submissionId: 1,
    subQuestionId: 5,
    responseValue: 'Yes, we have electronic transaction laws and digital signature regulations in place.',
    evidenceLink: 'https://moh.gov.et/legal-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T08:50:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 36,
    submissionId: 1,
    subQuestionId: 6,
    responseValue: 'Yes, we have data protection and privacy legislation that governs our operations.',
    evidenceLink: 'https://moh.gov.et/privacy-policy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T08:55:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 37,
    submissionId: 1,
    subQuestionId: 7,
    responseValue: 'Our legal framework includes the Electronic Transactions Proclamation, Data Protection Law, and specific health data privacy regulations that support our e-government initiatives.',
    evidenceLink: 'https://moh.gov.et/legal-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:00:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 38,
    submissionId: 1,
    subQuestionId: 8,
    responseValue: 'Yes, we have a dedicated e-government unit with 15 staff members.',
    evidenceLink: 'https://moh.gov.et/organizational-structure',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:05:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 39,
    submissionId: 1,
    subQuestionId: 9,
    responseValue: 'Regular Meetings, Shared Platforms, Joint Committees',
    evidenceLink: 'https://moh.gov.et/coordination',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:10:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 40,
    submissionId: 1,
    subQuestionId: 10,
    responseValue: 'Adequate',
    evidenceLink: 'https://moh.gov.et/staff-capacity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:15:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 41,
    submissionId: 1,
    subQuestionId: 11,
    responseValue: 'Our e-government management structure includes a Director of Digital Services, supported by teams for policy, technical implementation, and user support. We coordinate with other ministries through the National E-Government Steering Committee.',
    evidenceLink: 'https://moh.gov.et/organizational-structure',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:20:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 42,
    submissionId: 1,
    subQuestionId: 12,
    responseValue: 'Yes, we have a comprehensive data governance policy that defines data classification, access controls, and management procedures.',
    evidenceLink: 'https://moh.gov.et/data-governance-policy.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:25:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 43,
    submissionId: 1,
    subQuestionId: 13,
    responseValue: 'Yes, we implement privacy protection measures including encryption, access controls, and regular security audits.',
    evidenceLink: 'https://moh.gov.et/privacy-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:30:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 44,
    submissionId: 1,
    subQuestionId: 14,
    responseValue: 'We implement comprehensive data security measures including SSL encryption for data in transit, AES-256 encryption for data at rest, role-based access controls, regular security audits, and compliance with health data privacy regulations. All staff undergo privacy training annually.',
    evidenceLink: 'https://moh.gov.et/security-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:35:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 45,
    submissionId: 1,
    subQuestionId: 26,
    responseValue: 'Yes, we maintain an open data portal where we publish health statistics, service data, and administrative information.',
    evidenceLink: 'https://moh.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:40:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 46,
    submissionId: 1,
    subQuestionId: 27,
    responseValue: 'Statistical Data, Service Data, Administrative Data',
    evidenceLink: 'https://moh.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:45:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 47,
    submissionId: 1,
    subQuestionId: 28,
    responseValue: 'Our open data initiative publishes health statistics, service utilization data, and administrative information in CSV, JSON, and PDF formats. Data is updated monthly and includes metadata for transparency.',
    evidenceLink: 'https://moh.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:50:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 48,
    submissionId: 1,
    subQuestionId: 33,
    responseValue: 'Yes, we have a one-stop portal that integrates multiple health services including appointments, records access, and information services.',
    evidenceLink: 'https://moh.gov.et/portal',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T09:55:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 49,
    submissionId: 1,
    subQuestionId: 34,
    responseValue: 'We have integrated services across multiple health facilities and departments. Citizens can access services from different units through a single portal with unified authentication and service tracking.',
    evidenceLink: 'https://moh.gov.et/portal',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:00:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 50,
    submissionId: 1,
    subQuestionId: 42,
    responseValue: 'Yes, we offer digital payment options for service fees, permit applications, and other transactions.',
    evidenceLink: 'https://moh.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:05:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 51,
    submissionId: 1,
    subQuestionId: 43,
    responseValue: 'Mobile Money, Bank Transfer, Digital Wallets',
    evidenceLink: 'https://moh.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:10:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 52,
    submissionId: 1,
    subQuestionId: 44,
    responseValue: 'Our digital payment infrastructure uses PCI-DSS compliant payment gateways, SSL encryption for all transactions, and integration with major mobile money providers and banks. All transactions are logged and audited for security.',
    evidenceLink: 'https://moh.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:15:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 53,
    submissionId: 1,
    subQuestionId: 48,
    responseValue: 'Yes, we have online platforms for public consultation on health policies and service improvements.',
    evidenceLink: 'https://moh.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:20:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 54,
    submissionId: 1,
    subQuestionId: 49,
    responseValue: 'We conduct regular online consultations on health policies, service improvements, and budget priorities. Participation levels average 500-1000 responses per consultation, with feedback incorporated into policy decisions.',
    evidenceLink: 'https://moh.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:25:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 55,
    submissionId: 1,
    subQuestionId: 53,
    responseValue: 'Yes, we provide e-participation tools including online forums, policy feedback forms, and virtual town halls.',
    evidenceLink: 'https://moh.gov.et/participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:30:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 56,
    submissionId: 1,
    subQuestionId: 54,
    responseValue: 'Our e-participation initiatives include online policy discussions, citizen surveys, and virtual public meetings. We actively involve citizens in health policy development and service planning, with over 2000 participants in the last year.',
    evidenceLink: 'https://moh.gov.et/participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:35:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 57,
    submissionId: 1,
    subQuestionId: 62,
    responseValue: 'Yes, we operate a data center with cloud infrastructure for hosting our services and data.',
    evidenceLink: 'https://moh.gov.et/datacenter',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:40:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 58,
    submissionId: 1,
    subQuestionId: 63,
    responseValue: 'Our data center includes redundant servers, backup systems, and disaster recovery capabilities. We utilize cloud services for scalable hosting and leverage both on-premises and cloud infrastructure for optimal performance and security.',
    evidenceLink: 'https://moh.gov.et/datacenter',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:45:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 59,
    submissionId: 1,
    subQuestionId: 64,
    responseValue: 'Yes, we have comprehensive cybersecurity measures in place including firewalls, intrusion detection, and regular security audits.',
    evidenceLink: 'https://moh.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:50:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 60,
    submissionId: 1,
    subQuestionId: 65,
    responseValue: 'Firewalls, Intrusion Detection Systems, Encryption, Regular Security Audits, Incident Response Plan',
    evidenceLink: 'https://moh.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T10:55:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 61,
    submissionId: 1,
    subQuestionId: 66,
    responseValue: 'We conduct security audits quarterly and have a dedicated cybersecurity team that monitors threats 24/7.',
    evidenceLink: 'https://moh.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T11:00:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 62,
    submissionId: 1,
    subQuestionId: 67,
    responseValue: 'Our cybersecurity strategy includes multi-layered defense, regular penetration testing, staff training, and compliance with national cybersecurity standards. We have an incident response team ready to address any security threats.',
    evidenceLink: 'https://moh.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T11:05:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 63,
    submissionId: 1,
    subQuestionId: 68,
    responseValue: 'Yes, our systems are interoperable with other government systems through standardized APIs and data exchange protocols.',
    evidenceLink: 'https://moh.gov.et/interoperability',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T11:10:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 64,
    submissionId: 1,
    subQuestionId: 69,
    responseValue: 'We use RESTful APIs, SOAP services, and standardized data formats (JSON, XML) to enable interoperability. Our systems integrate with national ID systems, payment gateways, and other ministry databases for seamless data exchange.',
    evidenceLink: 'https://moh.gov.et/interoperability',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T11:15:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 65,
    submissionId: 1,
    subQuestionId: 79,
    responseValue: 'Yes, we have initiatives to make digital services more affordable and accessible.',
    evidenceLink: 'https://moh.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T11:20:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  {
    responseId: 66,
    submissionId: 1,
    subQuestionId: 80,
    responseValue: 'We provide free Wi-Fi at health facilities, offer discounted data packages for health service access, and maintain low-cost service fees. We also partner with telecom providers to offer subsidized access for health-related digital services.',
    evidenceLink: 'https://moh.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-10T11:25:00.000Z',
    updatedAt: '2024-12-16T14:20:00.000Z'
  },
  // Example responses for Submission 2 (Ministry of Education) - All approved by Regional Approver
  {
    responseId: 6,
    submissionId: 2,
    subQuestionId: 1,
    responseValue: 'Yes, we have an e-government strategy document that was developed in collaboration with stakeholders.',
    evidenceLink: 'https://moe.gov.et/strategies/digital-transformation-2024.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:00:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 7,
    submissionId: 2,
    subQuestionId: 2,
    responseValue: 'Our strategy focuses on digitalizing educational services, student information systems, and teacher training platforms.',
    evidenceLink: 'https://moe.gov.et/strategies/digital-transformation-2024.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:05:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 8,
    submissionId: 2,
    subQuestionId: 3,
    responseValue: 'We have an ICT department with 20 staff members responsible for e-government initiatives.',
    evidenceLink: 'https://moe.gov.et/departments/ict',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:10:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 9,
    submissionId: 2,
    subQuestionId: 4,
    responseValue: 'Our website provides information on educational policies, curriculum, exam results, and scholarship opportunities.',
    evidenceLink: 'https://moe.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:15:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 10,
    submissionId: 2,
    subQuestionId: 5,
    responseValue: 'Yes, we have electronic transaction laws and digital signature regulations that support our e-government services.',
    evidenceLink: 'https://moe.gov.et/legal-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:20:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 67,
    submissionId: 2,
    subQuestionId: 6,
    responseValue: 'Yes, we comply with data protection and privacy legislation for student and educational data.',
    evidenceLink: 'https://moe.gov.et/privacy-policy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:25:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 68,
    submissionId: 2,
    subQuestionId: 7,
    responseValue: 'Our legal framework includes the Electronic Transactions Proclamation, Data Protection Law, and Education Data Privacy Regulations that govern how we handle student and institutional data in our e-government systems.',
    evidenceLink: 'https://moe.gov.et/legal-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:30:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 69,
    submissionId: 2,
    subQuestionId: 8,
    responseValue: 'Yes, we have an ICT department with 20 staff members responsible for e-government initiatives.',
    evidenceLink: 'https://moe.gov.et/departments/ict',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:35:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 70,
    submissionId: 2,
    subQuestionId: 9,
    responseValue: 'Regular Meetings, Shared Platforms, Joint Committees',
    evidenceLink: 'https://moe.gov.et/coordination',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:40:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 71,
    submissionId: 2,
    subQuestionId: 10,
    responseValue: 'Adequate',
    evidenceLink: 'https://moe.gov.et/staff-capacity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:45:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 72,
    submissionId: 2,
    subQuestionId: 11,
    responseValue: 'Our organizational structure includes a Director of ICT and Digital Services, with teams for system development, infrastructure management, and user support. We coordinate with regional education bureaus through monthly meetings and shared platforms.',
    evidenceLink: 'https://moe.gov.et/organizational-structure',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:50:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 73,
    submissionId: 2,
    subQuestionId: 12,
    responseValue: 'Yes, we have a data governance policy that defines how educational data is collected, stored, and managed.',
    evidenceLink: 'https://moe.gov.et/data-governance-policy.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T09:55:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 74,
    submissionId: 2,
    subQuestionId: 13,
    responseValue: 'Yes, we implement privacy protection measures including data encryption, access controls, and regular privacy audits.',
    evidenceLink: 'https://moe.gov.et/privacy-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:00:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 75,
    submissionId: 2,
    subQuestionId: 14,
    responseValue: 'We implement comprehensive data security measures including SSL encryption, role-based access controls, regular security audits, and compliance with student data privacy regulations. All staff receive annual privacy and security training.',
    evidenceLink: 'https://moe.gov.et/security-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:05:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 76,
    submissionId: 2,
    subQuestionId: 26,
    responseValue: 'Yes, we maintain an open data portal publishing educational statistics, exam results, and administrative data.',
    evidenceLink: 'https://moe.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:10:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 77,
    submissionId: 2,
    subQuestionId: 27,
    responseValue: 'Statistical Data, Service Data, Administrative Data',
    evidenceLink: 'https://moe.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:15:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 78,
    submissionId: 2,
    subQuestionId: 28,
    responseValue: 'Our open data initiative publishes educational statistics, exam results, enrollment data, and administrative information in CSV and JSON formats. Data is updated quarterly with comprehensive metadata.',
    evidenceLink: 'https://moe.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:20:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 79,
    submissionId: 2,
    subQuestionId: 33,
    responseValue: 'Yes, we have a one-stop portal that integrates student services, exam results, scholarship applications, and information access.',
    evidenceLink: 'https://moe.gov.et/portal',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:25:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 80,
    submissionId: 2,
    subQuestionId: 34,
    responseValue: 'We have integrated services across regional education bureaus and schools. Students and parents can access services from different educational units through a single portal with unified authentication.',
    evidenceLink: 'https://moe.gov.et/portal',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:30:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 81,
    submissionId: 2,
    subQuestionId: 42,
    responseValue: 'Yes, we offer digital payment options for exam fees, certificate applications, and other educational services.',
    evidenceLink: 'https://moe.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:35:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 82,
    submissionId: 2,
    subQuestionId: 43,
    responseValue: 'Mobile Money, Bank Transfer, Digital Wallets',
    evidenceLink: 'https://moe.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:40:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 83,
    submissionId: 2,
    subQuestionId: 44,
    responseValue: 'Our digital payment infrastructure uses secure payment gateways, SSL encryption for all transactions, and integration with mobile money providers and banks. All payment transactions are logged and audited.',
    evidenceLink: 'https://moe.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:45:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 84,
    submissionId: 2,
    subQuestionId: 48,
    responseValue: 'Yes, we have online platforms for public consultation on educational policies and curriculum development.',
    evidenceLink: 'https://moe.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:50:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 85,
    submissionId: 2,
    subQuestionId: 49,
    responseValue: 'We conduct regular online consultations on curriculum changes, educational policies, and service improvements. Participation levels average 800-1500 responses per consultation, with feedback incorporated into policy decisions.',
    evidenceLink: 'https://moe.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T10:55:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 86,
    submissionId: 2,
    subQuestionId: 53,
    responseValue: 'Yes, we provide e-participation tools including online forums, policy feedback forms, and virtual stakeholder meetings.',
    evidenceLink: 'https://moe.gov.et/participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:00:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 87,
    submissionId: 2,
    subQuestionId: 54,
    responseValue: 'Our e-participation initiatives include online policy discussions, stakeholder surveys, and virtual public meetings. We actively involve teachers, parents, and students in educational policy development, with over 3000 participants in the last year.',
    evidenceLink: 'https://moe.gov.et/participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:05:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 88,
    submissionId: 2,
    subQuestionId: 62,
    responseValue: 'Yes, we operate a data center with cloud infrastructure for hosting our educational systems and data.',
    evidenceLink: 'https://moe.gov.et/datacenter',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:10:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 89,
    submissionId: 2,
    subQuestionId: 63,
    responseValue: 'Our data center includes redundant servers, backup systems, and disaster recovery capabilities. We utilize cloud services for scalable hosting of student information systems and leverage both on-premises and cloud infrastructure.',
    evidenceLink: 'https://moe.gov.et/datacenter',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:15:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 90,
    submissionId: 2,
    subQuestionId: 64,
    responseValue: 'Yes, we have comprehensive cybersecurity measures including firewalls, intrusion detection, and regular security audits.',
    evidenceLink: 'https://moe.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:20:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 91,
    submissionId: 2,
    subQuestionId: 65,
    responseValue: 'Firewalls, Intrusion Detection Systems, Encryption, Access Controls, Security Audits, Incident Response Plan',
    evidenceLink: 'https://moe.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:25:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 92,
    submissionId: 2,
    subQuestionId: 66,
    responseValue: 'Yes, we have a cybersecurity policy that defines security standards, incident response procedures, and staff responsibilities.',
    evidenceLink: 'https://moe.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:30:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 93,
    submissionId: 2,
    subQuestionId: 67,
    responseValue: 'Our cybersecurity framework includes multi-layered defense, regular penetration testing, staff training, and compliance with national cybersecurity standards. We have an incident response team that monitors threats and responds to security incidents.',
    evidenceLink: 'https://moe.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:35:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 94,
    submissionId: 2,
    subQuestionId: 68,
    responseValue: 'Yes, our systems are interoperable with other government systems through standardized APIs and data exchange protocols.',
    evidenceLink: 'https://moe.gov.et/interoperability',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:40:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 95,
    submissionId: 2,
    subQuestionId: 69,
    responseValue: 'We use RESTful APIs, SOAP services, and standardized data formats (JSON, XML) to enable interoperability. Our systems integrate with national ID systems, payment gateways, and other ministry databases for seamless data exchange.',
    evidenceLink: 'https://moe.gov.et/interoperability',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:45:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 96,
    submissionId: 2,
    subQuestionId: 79,
    responseValue: 'Yes, we have initiatives to make digital educational services more affordable and accessible.',
    evidenceLink: 'https://moe.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:50:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  {
    responseId: 97,
    submissionId: 2,
    subQuestionId: 80,
    responseValue: 'We provide free Wi-Fi at schools, offer discounted data packages for educational service access, and maintain low-cost service fees. We also partner with telecom providers to offer subsidized access for students and educational institutions.',
    evidenceLink: 'https://moe.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-08T11:55:00.000Z',
    updatedAt: '2024-12-15T16:45:00.000Z'
  },
  // Example responses for Submission 3 (Addis Ababa City Administration) - All approved by Regional Approver
  {
    responseId: 11,
    submissionId: 3,
    subQuestionId: 1,
    responseValue: 'Yes, we have a comprehensive digital transformation strategy approved by the city council.',
    evidenceLink: 'https://addisababa.gov.et/digital-strategy-2024.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:00:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 12,
    submissionId: 3,
    subQuestionId: 2,
    responseValue: 'The strategy includes targets for smart city initiatives, citizen services, and infrastructure modernization.',
    evidenceLink: 'https://addisababa.gov.et/digital-strategy-2024.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:05:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 13,
    submissionId: 3,
    subQuestionId: 3,
    responseValue: 'We have a dedicated Smart City Office with 25 staff members coordinating all digital initiatives.',
    evidenceLink: 'https://addisababa.gov.et/smart-city-office',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:10:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 14,
    submissionId: 3,
    subQuestionId: 4,
    responseValue: 'Our website provides comprehensive information on city services, permits, taxes, and public announcements.',
    evidenceLink: 'https://addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:15:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 15,
    submissionId: 3,
    subQuestionId: 5,
    responseValue: 'Yes, we have electronic transaction laws and digital signature regulations that support our e-government services.',
    evidenceLink: 'https://addisababa.gov.et/legal-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:20:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 88,
    submissionId: 3,
    subQuestionId: 6,
    responseValue: 'Yes, we have data protection and privacy legislation in place that governs our digital services.',
    evidenceLink: 'https://addisababa.gov.et/privacy-policy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:25:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 89,
    submissionId: 3,
    subQuestionId: 7,
    responseValue: 'Our legal framework includes the Electronic Transactions Proclamation, Data Protection Law, and City Administration Digital Services Regulations that support our e-government initiatives and protect citizen data.',
    evidenceLink: 'https://addisababa.gov.et/legal-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:30:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 90,
    submissionId: 3,
    subQuestionId: 8,
    responseValue: 'Yes, we have a dedicated Smart City Office with 25 staff members coordinating all digital initiatives.',
    evidenceLink: 'https://addisababa.gov.et/smart-city-office',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:35:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 91,
    submissionId: 3,
    subQuestionId: 9,
    responseValue: 'Regular Meetings, Shared Platforms, Joint Committees',
    evidenceLink: 'https://addisababa.gov.et/coordination',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:40:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 92,
    submissionId: 3,
    subQuestionId: 10,
    responseValue: 'Adequate',
    evidenceLink: 'https://addisababa.gov.et/staff-capacity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:45:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 93,
    submissionId: 3,
    subQuestionId: 11,
    responseValue: 'Our organizational structure includes a Director of Smart City Services, with teams for system development, infrastructure management, and citizen support. We coordinate with sub-cities and other city departments through monthly meetings and shared digital platforms.',
    evidenceLink: 'https://addisababa.gov.et/organizational-structure',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:50:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 94,
    submissionId: 3,
    subQuestionId: 12,
    responseValue: 'Yes, we have a comprehensive data governance policy that defines data classification, access controls, and management procedures for city data.',
    evidenceLink: 'https://addisababa.gov.et/data-governance-policy.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:55:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 95,
    submissionId: 3,
    subQuestionId: 13,
    responseValue: 'Yes, we implement privacy protection measures including encryption, access controls, and regular privacy audits for all citizen data.',
    evidenceLink: 'https://addisababa.gov.et/privacy-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:00:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 96,
    submissionId: 3,
    subQuestionId: 14,
    responseValue: 'We implement comprehensive data security measures including SSL encryption for data in transit, AES-256 encryption for data at rest, role-based access controls, regular security audits, and compliance with data privacy regulations. All staff undergo privacy and security training annually.',
    evidenceLink: 'https://addisababa.gov.et/security-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:05:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 97,
    submissionId: 3,
    subQuestionId: 26,
    responseValue: 'Yes, we maintain an open data portal where we publish city statistics, service data, and administrative information.',
    evidenceLink: 'https://addisababa.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:10:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 98,
    submissionId: 3,
    subQuestionId: 27,
    responseValue: 'Statistical Data, Service Data, Administrative Data',
    evidenceLink: 'https://addisababa.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:15:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 99,
    submissionId: 3,
    subQuestionId: 28,
    responseValue: 'Our open data initiative publishes city statistics, service utilization data, budget information, and administrative data in CSV, JSON, and PDF formats. Data is updated monthly and includes comprehensive metadata for transparency.',
    evidenceLink: 'https://addisababa.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:20:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 100,
    submissionId: 3,
    subQuestionId: 33,
    responseValue: 'Yes, we have a one-stop portal that integrates multiple city services including bill payments, permit applications, and citizen complaints.',
    evidenceLink: 'https://addisababa.gov.et/portal',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:25:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 101,
    submissionId: 3,
    subQuestionId: 34,
    responseValue: 'We have integrated services across all city departments and sub-cities. Citizens can access services from different units through a single portal with unified authentication and service tracking.',
    evidenceLink: 'https://addisababa.gov.et/portal',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:30:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 102,
    submissionId: 3,
    subQuestionId: 42,
    responseValue: 'Yes, we offer digital payment options for utility bills, permit fees, and other city services.',
    evidenceLink: 'https://addisababa.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:35:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 103,
    submissionId: 3,
    subQuestionId: 43,
    responseValue: 'Mobile Money, Bank Transfer, Digital Wallets',
    evidenceLink: 'https://addisababa.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:40:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 104,
    submissionId: 3,
    subQuestionId: 44,
    responseValue: 'Our digital payment infrastructure uses PCI-DSS compliant payment gateways, SSL encryption for all transactions, and integration with major mobile money providers and banks. All transactions are logged and audited for security and transparency.',
    evidenceLink: 'https://addisababa.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:45:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 105,
    submissionId: 3,
    subQuestionId: 48,
    responseValue: 'Yes, we have online platforms for public consultation on city policies, service improvements, and budget priorities.',
    evidenceLink: 'https://addisababa.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:50:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 106,
    submissionId: 3,
    subQuestionId: 49,
    responseValue: 'We conduct regular online consultations on city policies, service improvements, and budget priorities. Participation levels average 1000-2000 responses per consultation, with feedback incorporated into policy decisions and service planning.',
    evidenceLink: 'https://addisababa.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:55:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 107,
    submissionId: 3,
    subQuestionId: 53,
    responseValue: 'Yes, we provide e-participation tools including online forums, policy feedback forms, and virtual town halls.',
    evidenceLink: 'https://addisababa.gov.et/participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:00:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 108,
    submissionId: 3,
    subQuestionId: 54,
    responseValue: 'Our e-participation initiatives include online policy discussions, citizen surveys, and virtual public meetings. We actively involve citizens in city policy development and service planning, with over 5000 participants in the last year.',
    evidenceLink: 'https://addisababa.gov.et/participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:05:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 109,
    submissionId: 3,
    subQuestionId: 62,
    responseValue: 'Yes, we operate a data center with cloud infrastructure for hosting our services and data.',
    evidenceLink: 'https://addisababa.gov.et/datacenter',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:10:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 110,
    submissionId: 3,
    subQuestionId: 63,
    responseValue: 'Our data center includes redundant servers, backup systems, and disaster recovery capabilities. We utilize cloud services for scalable hosting and leverage both on-premises and cloud infrastructure for optimal performance and security.',
    evidenceLink: 'https://addisababa.gov.et/datacenter',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:15:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 111,
    submissionId: 3,
    subQuestionId: 64,
    responseValue: 'Yes, we have comprehensive cybersecurity measures in place including firewalls, intrusion detection, and regular security audits.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:20:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 112,
    submissionId: 3,
    subQuestionId: 65,
    responseValue: 'Firewalls, Intrusion Detection Systems, Encryption, Regular Security Audits, Incident Response Plan',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:25:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 113,
    submissionId: 3,
    subQuestionId: 66,
    responseValue: 'We conduct security audits quarterly and have a dedicated cybersecurity team that monitors threats 24/7. Our incident response plan is tested annually and includes coordination with national cybersecurity authorities.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:30:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 114,
    submissionId: 3,
    subQuestionId: 67,
    responseValue: 'Our cybersecurity strategy includes multi-layered defense, regular penetration testing, staff training, and compliance with national cybersecurity standards. We have an incident response team ready to address any security threats.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:35:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 115,
    submissionId: 3,
    subQuestionId: 68,
    responseValue: 'Yes, our systems are interoperable with other government systems through standardized APIs and data exchange protocols.',
    evidenceLink: 'https://addisababa.gov.et/interoperability',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:40:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 116,
    submissionId: 3,
    subQuestionId: 69,
    responseValue: 'We use RESTful APIs, SOAP services, and standardized data formats (JSON, XML) to enable interoperability. Our systems integrate with national ID systems, payment gateways, and other city databases for seamless data exchange.',
    evidenceLink: 'https://addisababa.gov.et/interoperability',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:45:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 117,
    submissionId: 3,
    subQuestionId: 79,
    responseValue: 'Yes, we have initiatives to make digital services more affordable and accessible to all citizens.',
    evidenceLink: 'https://addisababa.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:50:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 118,
    submissionId: 3,
    subQuestionId: 80,
    responseValue: 'We provide free Wi-Fi at city facilities, offer discounted data packages for city service access, and maintain low-cost service fees. We also partner with telecom providers to offer subsidized access for city-related digital services.',
    evidenceLink: 'https://addisababa.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:55:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  // Responses for Submission 4 (Addis Ababa City Administration - Pending Initial Approval)
  {
    responseId: 16,
    submissionId: 4,
    subQuestionId: 1,
    responseValue: 'Yes, we have a digital transformation strategy that was approved in 2024.',
    evidenceLink: 'https://addisababa.gov.et/strategy/digital-2024.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T08:30:00.000Z',
    updatedAt: '2024-12-15T08:30:00.000Z'
  },
  {
    responseId: 17,
    submissionId: 4,
    subQuestionId: 2,
    responseValue: 'Our strategy focuses on smart city infrastructure, citizen engagement platforms, and digital service delivery.',
    evidenceLink: 'https://addisababa.gov.et/strategy/digital-2024.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T08:35:00.000Z',
    updatedAt: '2024-12-15T08:35:00.000Z'
  },
  {
    responseId: 18,
    submissionId: 4,
    subQuestionId: 3,
    responseValue: 'We have a Smart City Office with 30 staff members dedicated to digital initiatives.',
    evidenceLink: 'https://addisababa.gov.et/smart-city-office',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T08:40:00.000Z',
    updatedAt: '2024-12-15T08:40:00.000Z'
  },
  {
    responseId: 19,
    submissionId: 4,
    subQuestionId: 4,
    responseValue: 'Our website provides comprehensive information on city services, events, permits, and public announcements.',
    evidenceLink: 'https://addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T08:45:00.000Z',
    updatedAt: '2024-12-15T08:45:00.000Z'
  },
  {
    responseId: 20,
    submissionId: 4,
    subQuestionId: 5,
    responseValue: 'Yes, we offer online services for bill payments, permit applications, and citizen complaints.',
    evidenceLink: 'https://addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T08:50:00.000Z',
    updatedAt: '2024-12-15T08:50:00.000Z'
  },
  // Responses for Submission 5 (Sub-city 1 - Pending Initial Approval)
  // Sub-city applicable questions: 15-25, 29-32, 35-37, 38-41, 45-47, 50-52, 70-75
  {
    responseId: 193,
    submissionId: 5,
    subQuestionId: 15,
    responseValue: 'Yes, we maintain an official website for our sub-city administration.',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T09:25:00.000Z',
    updatedAt: '2024-12-12T09:25:00.000Z'
  },
  {
    responseId: 194,
    submissionId: 5,
    subQuestionId: 16,
    responseValue: 'Fully Operational',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T09:30:00.000Z',
    updatedAt: '2024-12-12T09:30:00.000Z'
  },
  {
    responseId: 195,
    submissionId: 5,
    subQuestionId: 17,
    responseValue: 'Yes, organizational information including structure, services, and contact details are publicly accessible online.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/about',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T09:35:00.000Z',
    updatedAt: '2024-12-12T09:35:00.000Z'
  },
  {
    responseId: 196,
    submissionId: 5,
    subQuestionId: 18,
    responseValue: 'Contact Information, Organizational Structure, Service Information, Annual Reports',
    evidenceLink: 'https://subcity1.addisababa.gov.et/information',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T09:40:00.000Z',
    updatedAt: '2024-12-12T09:40:00.000Z'
  },
  {
    responseId: 197,
    submissionId: 5,
    subQuestionId: 19,
    responseValue: 'Yes, citizens can request information through our online contact form and email.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/contact',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T09:45:00.000Z',
    updatedAt: '2024-12-12T09:45:00.000Z'
  },
  {
    responseId: 198,
    submissionId: 5,
    subQuestionId: 20,
    responseValue: 'We maintain transparency by publishing service information, organizational structure, and annual reports. All information is updated regularly and accessible to the public.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/transparency',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T09:50:00.000Z',
    updatedAt: '2024-12-12T09:50:00.000Z'
  },
  {
    responseId: 199,
    submissionId: 5,
    subQuestionId: 21,
    responseValue: 'Yes, our website is available in Amharic and English.',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T09:55:00.000Z',
    updatedAt: '2024-12-12T09:55:00.000Z'
  },
  {
    responseId: 200,
    submissionId: 5,
    subQuestionId: 22,
    responseValue: 'English, Amharic',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:00:00.000Z',
    updatedAt: '2024-12-12T10:00:00.000Z'
  },
  {
    responseId: 201,
    submissionId: 5,
    subQuestionId: 23,
    responseValue: 'We provide bilingual content (Amharic and English) to ensure accessibility for all citizens. All key information is translated and maintained in both languages.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/languages',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:05:00.000Z',
    updatedAt: '2024-12-12T10:05:00.000Z'
  },
  {
    responseId: 202,
    submissionId: 5,
    subQuestionId: 24,
    responseValue: 'Weekly',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:10:00.000Z',
    updatedAt: '2024-12-12T10:10:00.000Z'
  },
  {
    responseId: 203,
    submissionId: 5,
    subQuestionId: 25,
    responseValue: 'Yes, we use a content management system to regularly update website content and announcements.',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:15:00.000Z',
    updatedAt: '2024-12-12T10:15:00.000Z'
  },
  {
    responseId: 204,
    submissionId: 5,
    subQuestionId: 29,
    responseValue: '6-10 services',
    evidenceLink: 'https://subcity1.addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:20:00.000Z',
    updatedAt: '2024-12-12T10:20:00.000Z'
  },
  {
    responseId: 205,
    submissionId: 5,
    subQuestionId: 30,
    responseValue: 'Information Services, Download Forms, Online Applications, Status Tracking',
    evidenceLink: 'https://subcity1.addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:25:00.000Z',
    updatedAt: '2024-12-12T10:25:00.000Z'
  },
  {
    responseId: 206,
    submissionId: 5,
    subQuestionId: 31,
    responseValue: 'Yes, citizens can complete permit applications and service requests fully online.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/online-services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:30:00.000Z',
    updatedAt: '2024-12-12T10:30:00.000Z'
  },
  {
    responseId: 207,
    submissionId: 5,
    subQuestionId: 32,
    responseValue: 'We offer online services for local permits, service requests, and information access. Citizens can apply, track status, and receive notifications through our portal.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/online-services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:35:00.000Z',
    updatedAt: '2024-12-12T10:35:00.000Z'
  },
  {
    responseId: 208,
    submissionId: 5,
    subQuestionId: 35,
    responseValue: 'Yes, our services are accessible via mobile devices through a responsive website design.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/mobile',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:40:00.000Z',
    updatedAt: '2024-12-12T10:40:00.000Z'
  },
  {
    responseId: 209,
    submissionId: 5,
    subQuestionId: 36,
    responseValue: 'Mobile Website, SMS Services',
    evidenceLink: 'https://subcity1.addisababa.gov.et/mobile',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:45:00.000Z',
    updatedAt: '2024-12-12T10:45:00.000Z'
  },
  {
    responseId: 210,
    submissionId: 5,
    subQuestionId: 37,
    responseValue: 'We provide mobile-optimized website access and SMS notifications for service updates and status changes.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/mobile',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:50:00.000Z',
    updatedAt: '2024-12-12T10:50:00.000Z'
  },
  {
    responseId: 211,
    submissionId: 5,
    subQuestionId: 38,
    responseValue: 'Yes, we have online feedback forms and surveys for citizen input.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/feedback',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T10:55:00.000Z',
    updatedAt: '2024-12-12T10:55:00.000Z'
  },
  {
    responseId: 212,
    submissionId: 5,
    subQuestionId: 39,
    responseValue: '1-3 Days',
    evidenceLink: 'https://subcity1.addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:00:00.000Z',
    updatedAt: '2024-12-12T11:00:00.000Z'
  },
  {
    responseId: 213,
    submissionId: 5,
    subQuestionId: 40,
    responseValue: 'Yes, our services are designed with user-centered principles focusing on ease of use and accessibility.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/ux',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:05:00.000Z',
    updatedAt: '2024-12-12T11:05:00.000Z'
  },
  {
    responseId: 214,
    submissionId: 5,
    subQuestionId: 41,
    responseValue: 'Our services feature intuitive navigation, clear instructions, and accessibility features including screen reader support and keyboard navigation.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/accessibility',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:10:00.000Z',
    updatedAt: '2024-12-12T11:10:00.000Z'
  },
  {
    responseId: 215,
    submissionId: 5,
    subQuestionId: 45,
    responseValue: 'Yes, we have online feedback forms and surveys for citizen input.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/feedback',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:15:00.000Z',
    updatedAt: '2024-12-12T11:15:00.000Z'
  },
  {
    responseId: 216,
    submissionId: 5,
    subQuestionId: 46,
    responseValue: 'Online Forms, Email, Phone, Social Media',
    evidenceLink: 'https://subcity1.addisababa.gov.et/feedback',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:20:00.000Z',
    updatedAt: '2024-12-12T11:20:00.000Z'
  },
  {
    responseId: 217,
    submissionId: 5,
    subQuestionId: 47,
    responseValue: 'We collect citizen feedback through multiple channels including online forms, email, phone, and social media. All feedback is reviewed weekly and responses are provided within 3-5 business days.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/feedback-process',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:25:00.000Z',
    updatedAt: '2024-12-12T11:25:00.000Z'
  },
  {
    responseId: 218,
    submissionId: 5,
    subQuestionId: 50,
    responseValue: 'Yes, we use social media platforms to engage with citizens and share information.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/social-media',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:30:00.000Z',
    updatedAt: '2024-12-12T11:30:00.000Z'
  },
  {
    responseId: 219,
    submissionId: 5,
    subQuestionId: 51,
    responseValue: 'Facebook, Twitter, Telegram',
    evidenceLink: 'https://subcity1.addisababa.gov.et/social-media',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:35:00.000Z',
    updatedAt: '2024-12-12T11:35:00.000Z'
  },
  {
    responseId: 220,
    submissionId: 5,
    subQuestionId: 52,
    responseValue: 'We actively engage with citizens through Facebook, Twitter, and Telegram, sharing service updates, announcements, and responding to inquiries. We post daily updates and respond to messages within 24 hours.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/social-media',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:40:00.000Z',
    updatedAt: '2024-12-12T11:40:00.000Z'
  },
  {
    responseId: 221,
    submissionId: 5,
    subQuestionId: 70,
    responseValue: 'Yes, we offer digital literacy programs for citizens.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/digital-literacy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:45:00.000Z',
    updatedAt: '2024-12-12T11:45:00.000Z'
  },
  {
    responseId: 222,
    submissionId: 5,
    subQuestionId: 71,
    responseValue: 'Basic Computer Skills, Internet Usage, Online Service Access, Mobile App Usage',
    evidenceLink: 'https://subcity1.addisababa.gov.et/digital-literacy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:50:00.000Z',
    updatedAt: '2024-12-12T11:50:00.000Z'
  },
  {
    responseId: 223,
    submissionId: 5,
    subQuestionId: 72,
    responseValue: 'We conduct monthly digital literacy workshops covering basic computer skills, internet usage, and how to access online government services. Over 200 citizens have participated in our programs this year.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/digital-literacy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T11:55:00.000Z',
    updatedAt: '2024-12-12T11:55:00.000Z'
  },
  {
    responseId: 224,
    submissionId: 5,
    subQuestionId: 73,
    responseValue: 'Yes, our services are designed to be accessible for persons with disabilities.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/accessibility',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T12:00:00.000Z',
    updatedAt: '2024-12-12T12:00:00.000Z'
  },
  {
    responseId: 225,
    submissionId: 5,
    subQuestionId: 74,
    responseValue: 'Screen Reader Support, Keyboard Navigation, High Contrast Mode, Text Size Adjustment',
    evidenceLink: 'https://subcity1.addisababa.gov.et/accessibility',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T12:05:00.000Z',
    updatedAt: '2024-12-12T12:05:00.000Z'
  },
  {
    responseId: 226,
    submissionId: 5,
    subQuestionId: 75,
    responseValue: 'We implement WCAG 2.1 Level AA accessibility standards, including screen reader compatibility, keyboard navigation, high contrast options, and adjustable text sizes. Our physical service centers also have accessibility features.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/accessibility',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-12T12:10:00.000Z',
    updatedAt: '2024-12-12T12:10:00.000Z'
  },
  // Responses for Submission 6 (Sub-city 2 - Pending Initial Approval)
  {
    responseId: 26,
    submissionId: 6,
    subQuestionId: 1,
    responseValue: 'Yes, we have developed a digital services roadmap for 2024-2025.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/roadmap-2024.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:00:00.000Z',
    updatedAt: '2024-12-10T10:00:00.000Z'
  },
  {
    responseId: 27,
    submissionId: 6,
    subQuestionId: 2,
    responseValue: 'The roadmap focuses on digitizing local government services and improving citizen access.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/roadmap-2024.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:05:00.000Z',
    updatedAt: '2024-12-10T10:05:00.000Z'
  },
  {
    responseId: 28,
    submissionId: 6,
    subQuestionId: 3,
    responseValue: 'We have a Digital Services Team with 6 staff members.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/digital-team',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:10:00.000Z',
    updatedAt: '2024-12-10T10:10:00.000Z'
  },
  {
    responseId: 29,
    submissionId: 6,
    subQuestionId: 4,
    responseValue: 'Our website provides information on local government services, announcements, and community resources.',
    evidenceLink: 'https://subcity2.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:15:00.000Z',
    updatedAt: '2024-12-10T10:15:00.000Z'
  },
  {
    responseId: 30,
    submissionId: 6,
    subQuestionId: 5,
    responseValue: 'Yes, we offer online services for local permits, service requests, and information access.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/online-services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:20:00.000Z',
    updatedAt: '2024-12-10T10:20:00.000Z'
  },
  // Additional responses for Submission 6 (Sub-city 2) - All Woreda applicable questions
  {
    responseId: 36,
    submissionId: 6,
    subQuestionId: 15,
    responseValue: 'Yes, we maintain an official website for our sub-city administration.',
    evidenceLink: 'https://subcity2.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:25:00.000Z',
    updatedAt: '2024-12-10T10:25:00.000Z'
  },
  {
    responseId: 37,
    submissionId: 6,
    subQuestionId: 16,
    responseValue: 'Our website provides information on local services, announcements, contact details, and community resources.',
    evidenceLink: 'https://subcity2.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:30:00.000Z',
    updatedAt: '2024-12-10T10:30:00.000Z'
  },
  {
    responseId: 38,
    submissionId: 6,
    subQuestionId: 17,
    responseValue: 'Yes, organizational information including structure, services, and contact details are publicly accessible online.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/about',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:35:00.000Z',
    updatedAt: '2024-12-10T10:35:00.000Z'
  },
  {
    responseId: 39,
    submissionId: 6,
    subQuestionId: 18,
    responseValue: 'Contact Information, Organizational Structure, Service Information, Annual Reports',
    evidenceLink: 'https://subcity2.addisababa.gov.et/information',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:40:00.000Z',
    updatedAt: '2024-12-10T10:40:00.000Z'
  },
  {
    responseId: 40,
    submissionId: 6,
    subQuestionId: 19,
    responseValue: 'Yes, citizens can request information through our online contact form and email.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/contact',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:45:00.000Z',
    updatedAt: '2024-12-10T10:45:00.000Z'
  },
  {
    responseId: 41,
    submissionId: 6,
    subQuestionId: 20,
    responseValue: 'We maintain transparency by publishing service information, organizational structure, and annual reports. All information is updated regularly and accessible to the public.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/transparency',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:50:00.000Z',
    updatedAt: '2024-12-10T10:50:00.000Z'
  },
  {
    responseId: 42,
    submissionId: 6,
    subQuestionId: 21,
    responseValue: 'Yes, our website is available in Amharic and English.',
    evidenceLink: 'https://subcity2.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T10:55:00.000Z',
    updatedAt: '2024-12-10T10:55:00.000Z'
  },
  {
    responseId: 43,
    submissionId: 6,
    subQuestionId: 22,
    responseValue: 'English, Amharic',
    evidenceLink: 'https://subcity2.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:00:00.000Z',
    updatedAt: '2024-12-10T11:00:00.000Z'
  },
  {
    responseId: 44,
    submissionId: 6,
    subQuestionId: 23,
    responseValue: 'We provide bilingual content (Amharic and English) to ensure accessibility for all citizens. All key information is translated and maintained in both languages.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/languages',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:05:00.000Z',
    updatedAt: '2024-12-10T11:05:00.000Z'
  },
  {
    responseId: 45,
    submissionId: 6,
    subQuestionId: 24,
    responseValue: 'Weekly',
    evidenceLink: 'https://subcity2.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:10:00.000Z',
    updatedAt: '2024-12-10T11:10:00.000Z'
  },
  {
    responseId: 46,
    submissionId: 6,
    subQuestionId: 25,
    responseValue: 'Yes, we use a content management system to regularly update website content and announcements.',
    evidenceLink: 'https://subcity2.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:15:00.000Z',
    updatedAt: '2024-12-10T11:15:00.000Z'
  },
  {
    responseId: 47,
    submissionId: 6,
    subQuestionId: 29,
    responseValue: '6-10 services',
    evidenceLink: 'https://subcity2.addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:20:00.000Z',
    updatedAt: '2024-12-10T11:20:00.000Z'
  },
  {
    responseId: 48,
    submissionId: 6,
    subQuestionId: 30,
    responseValue: 'Information Services, Download Forms, Online Applications, Status Tracking',
    evidenceLink: 'https://subcity2.addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:25:00.000Z',
    updatedAt: '2024-12-10T11:25:00.000Z'
  },
  {
    responseId: 49,
    submissionId: 6,
    subQuestionId: 31,
    responseValue: 'Yes, citizens can complete permit applications and service requests fully online.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/online-services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:30:00.000Z',
    updatedAt: '2024-12-10T11:30:00.000Z'
  },
  {
    responseId: 50,
    submissionId: 6,
    subQuestionId: 32,
    responseValue: 'We offer online services for local permits, service requests, and information access. Citizens can apply, track status, and receive notifications through our portal.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/online-services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:35:00.000Z',
    updatedAt: '2024-12-10T11:35:00.000Z'
  },
  {
    responseId: 51,
    submissionId: 6,
    subQuestionId: 35,
    responseValue: 'Yes, our services are accessible via mobile devices through a responsive website design.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/mobile',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:40:00.000Z',
    updatedAt: '2024-12-10T11:40:00.000Z'
  },
  {
    responseId: 52,
    submissionId: 6,
    subQuestionId: 36,
    responseValue: 'Mobile Website, SMS Services',
    evidenceLink: 'https://subcity2.addisababa.gov.et/mobile',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:45:00.000Z',
    updatedAt: '2024-12-10T11:45:00.000Z'
  },
  {
    responseId: 53,
    submissionId: 6,
    subQuestionId: 37,
    responseValue: 'We provide mobile-optimized website access and SMS notifications for service updates and status changes.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/mobile',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:50:00.000Z',
    updatedAt: '2024-12-10T11:50:00.000Z'
  },
  {
    responseId: 54,
    submissionId: 6,
    subQuestionId: 38,
    responseValue: 'Yes, we have online feedback forms and surveys available on our website.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/feedback',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T11:55:00.000Z',
    updatedAt: '2024-12-10T11:55:00.000Z'
  },
  {
    responseId: 55,
    submissionId: 6,
    subQuestionId: 39,
    responseValue: '1-3 Days',
    evidenceLink: 'https://subcity2.addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:00:00.000Z',
    updatedAt: '2024-12-10T12:00:00.000Z'
  },
  {
    responseId: 56,
    submissionId: 6,
    subQuestionId: 40,
    responseValue: 'Yes, our services are designed with user-centered principles focusing on simplicity and accessibility.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:05:00.000Z',
    updatedAt: '2024-12-10T12:05:00.000Z'
  },
  {
    responseId: 57,
    submissionId: 6,
    subQuestionId: 41,
    responseValue: 'Our services feature intuitive navigation, clear instructions, and accessibility features including text size options and keyboard navigation support.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:10:00.000Z',
    updatedAt: '2024-12-10T12:10:00.000Z'
  },
  {
    responseId: 58,
    submissionId: 6,
    subQuestionId: 45,
    responseValue: 'Yes, we have online feedback forms and surveys available for citizens.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/feedback',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:15:00.000Z',
    updatedAt: '2024-12-10T12:15:00.000Z'
  },
  {
    responseId: 59,
    submissionId: 6,
    subQuestionId: 46,
    responseValue: 'Online Forms, Email, Phone, In-Person',
    evidenceLink: 'https://subcity2.addisababa.gov.et/feedback',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:20:00.000Z',
    updatedAt: '2024-12-10T12:20:00.000Z'
  },
  {
    responseId: 60,
    submissionId: 6,
    subQuestionId: 47,
    responseValue: 'We collect feedback through multiple channels and review all submissions weekly. Action items are tracked and citizens receive responses within 3-5 business days.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/feedback',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:25:00.000Z',
    updatedAt: '2024-12-10T12:25:00.000Z'
  },
  {
    responseId: 61,
    submissionId: 6,
    subQuestionId: 50,
    responseValue: 'Yes, we use social media platforms for citizen engagement and information sharing.',
    evidenceLink: 'https://facebook.com/subcity2addis',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:30:00.000Z',
    updatedAt: '2024-12-10T12:30:00.000Z'
  },
  {
    responseId: 62,
    submissionId: 6,
    subQuestionId: 51,
    responseValue: 'Facebook, Telegram',
    evidenceLink: 'https://facebook.com/subcity2addis',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:35:00.000Z',
    updatedAt: '2024-12-10T12:35:00.000Z'
  },
  {
    responseId: 63,
    submissionId: 6,
    subQuestionId: 52,
    responseValue: 'We maintain active social media presence on Facebook and Telegram, sharing announcements, service updates, and responding to citizen inquiries daily.',
    evidenceLink: 'https://facebook.com/subcity2addis',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:40:00.000Z',
    updatedAt: '2024-12-10T12:40:00.000Z'
  },
  {
    responseId: 64,
    submissionId: 6,
    subQuestionId: 70,
    responseValue: 'Yes, we offer basic digital literacy programs for citizens.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/digital-literacy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:45:00.000Z',
    updatedAt: '2024-12-10T12:45:00.000Z'
  },
  {
    responseId: 65,
    submissionId: 6,
    subQuestionId: 71,
    responseValue: 'Basic Computer Skills, Internet Usage, E-Government Services',
    evidenceLink: 'https://subcity2.addisababa.gov.et/digital-literacy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:50:00.000Z',
    updatedAt: '2024-12-10T12:50:00.000Z'
  },
  {
    responseId: 66,
    submissionId: 6,
    subQuestionId: 72,
    responseValue: 'We conduct monthly digital literacy workshops covering basic computer skills, internet usage, and accessing e-government services. Over 200 citizens participated in the last year.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/digital-literacy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T12:55:00.000Z',
    updatedAt: '2024-12-10T12:55:00.000Z'
  },
  {
    responseId: 67,
    submissionId: 6,
    subQuestionId: 73,
    responseValue: 'Yes, our website and services include accessibility features for persons with disabilities.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/accessibility',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T13:00:00.000Z',
    updatedAt: '2024-12-10T13:00:00.000Z'
  },
  {
    responseId: 68,
    submissionId: 6,
    subQuestionId: 74,
    responseValue: 'Screen Reader Support, Keyboard Navigation, Text Size Options, High Contrast Mode',
    evidenceLink: 'https://subcity2.addisababa.gov.et/accessibility',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T13:05:00.000Z',
    updatedAt: '2024-12-10T13:05:00.000Z'
  },
  {
    responseId: 69,
    submissionId: 6,
    subQuestionId: 75,
    responseValue: 'We have implemented WCAG 2.1 Level AA accessibility standards, including screen reader compatibility, keyboard navigation, and adjustable text sizes. Our service centers also provide assistive technologies.',
    evidenceLink: 'https://subcity2.addisababa.gov.et/accessibility',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-10T13:10:00.000Z',
    updatedAt: '2024-12-10T13:10:00.000Z'
  },
  // Responses for Submission 7 (Oromia Region - Pending Initial Approval)
  {
    responseId: 31,
    submissionId: 7,
    subQuestionId: 1,
    responseValue: 'Yes, we have a regional e-government strategy document approved by the regional council.',
    evidenceLink: 'https://oromia.gov.et/strategy/e-government-2024.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T08:30:00.000Z',
    updatedAt: '2024-12-14T08:30:00.000Z'
  },
  {
    responseId: 32,
    submissionId: 7,
    subQuestionId: 2,
    responseValue: 'The strategy includes targets for regional service digitization, infrastructure development, and citizen engagement.',
    evidenceLink: 'https://oromia.gov.et/strategy/e-government-2024.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T08:35:00.000Z',
    updatedAt: '2024-12-14T08:35:00.000Z'
  },
  {
    responseId: 33,
    submissionId: 7,
    subQuestionId: 3,
    responseValue: 'We have a Regional ICT Bureau with 25 staff members coordinating digital initiatives.',
    evidenceLink: 'https://oromia.gov.et/ict-bureau',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T08:40:00.000Z',
    updatedAt: '2024-12-14T08:40:00.000Z'
  },
  {
    responseId: 34,
    submissionId: 7,
    subQuestionId: 4,
    responseValue: 'Our website provides comprehensive information on regional services, policies, programs, and public announcements.',
    evidenceLink: 'https://oromia.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T08:45:00.000Z',
    updatedAt: '2024-12-14T08:45:00.000Z'
  },
  {
    responseId: 35,
    submissionId: 7,
    subQuestionId: 5,
    responseValue: 'Yes, we offer online services for regional permits, certificates, and information access through our portal.',
    evidenceLink: 'https://oromia.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T08:50:00.000Z',
    updatedAt: '2024-12-14T08:50:00.000Z'
  },
  // Additional responses for Submission 3 (Addis Ababa City Administration) - Completing all applicable questions
  {
    responseId: 100,
    submissionId: 3,
    subQuestionId: 6,
    responseValue: 'Yes, we have comprehensive data protection and privacy legislation that complies with national standards.',
    evidenceLink: 'https://addisababa.gov.et/privacy-policy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:25:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 101,
    submissionId: 3,
    subQuestionId: 7,
    responseValue: 'Our legal framework includes electronic transaction laws, digital signature regulations, data protection policies, and cybersecurity legislation that support all e-government initiatives.',
    evidenceLink: 'https://addisababa.gov.et/legal-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:30:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 102,
    submissionId: 3,
    subQuestionId: 8,
    responseValue: 'Yes, we have a dedicated Smart City Office with 25 staff members.',
    evidenceLink: 'https://addisababa.gov.et/smart-city-office',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:35:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 103,
    submissionId: 3,
    subQuestionId: 9,
    responseValue: 'Regular Meetings, Shared Platforms, Joint Committees',
    evidenceLink: 'https://addisababa.gov.et/coordination',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:40:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 104,
    submissionId: 3,
    subQuestionId: 10,
    responseValue: 'Advanced',
    evidenceLink: 'https://addisababa.gov.et/staff-capacity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:45:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 105,
    submissionId: 3,
    subQuestionId: 11,
    responseValue: 'Our organizational structure includes a Smart City Office reporting directly to the Mayor, with dedicated teams for digital services, infrastructure, and citizen engagement.',
    evidenceLink: 'https://addisababa.gov.et/organizational-structure',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:50:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 106,
    submissionId: 3,
    subQuestionId: 12,
    responseValue: 'Yes, we have a comprehensive data governance policy that defines data ownership, access controls, and usage guidelines.',
    evidenceLink: 'https://addisababa.gov.et/data-governance',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T10:55:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 107,
    submissionId: 3,
    subQuestionId: 13,
    responseValue: 'Yes, we implement comprehensive privacy protection measures including encryption, access controls, and regular security audits.',
    evidenceLink: 'https://addisababa.gov.et/privacy-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:00:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 108,
    submissionId: 3,
    subQuestionId: 14,
    responseValue: 'We implement multi-layered security including firewalls, encryption, regular security audits, access controls, and incident response procedures to protect citizen data and ensure privacy.',
    evidenceLink: 'https://addisababa.gov.et/security-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:05:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 109,
    submissionId: 3,
    subQuestionId: 26,
    responseValue: 'Yes, we maintain an open data portal where citizens can access various datasets.',
    evidenceLink: 'https://addisababa.gov.et/open-data',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:10:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 110,
    submissionId: 3,
    subQuestionId: 27,
    responseValue: 'Statistical Data, Budget Data, Service Data, Geographic Data, Administrative Data',
    evidenceLink: 'https://addisababa.gov.et/open-data',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:15:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 111,
    submissionId: 3,
    subQuestionId: 28,
    responseValue: 'Our open data initiative publishes datasets in machine-readable formats (CSV, JSON, XML) covering budget, service delivery, demographics, and geographic information to promote transparency and innovation.',
    evidenceLink: 'https://addisababa.gov.et/open-data',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:20:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 112,
    submissionId: 3,
    subQuestionId: 33,
    responseValue: 'Yes, we have a one-stop portal that integrates services from multiple city departments.',
    evidenceLink: 'https://addisababa.gov.et/one-stop-portal',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:25:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 113,
    submissionId: 3,
    subQuestionId: 34,
    responseValue: 'We have achieved high-level service integration across city departments, allowing citizens to access multiple services through a single portal with unified authentication and payment systems.',
    evidenceLink: 'https://addisababa.gov.et/service-integration',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:30:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 114,
    submissionId: 3,
    subQuestionId: 42,
    responseValue: 'Yes, we offer multiple digital payment options for government services.',
    evidenceLink: 'https://addisababa.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:35:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 115,
    submissionId: 3,
    subQuestionId: 43,
    responseValue: 'Credit/Debit Cards, Mobile Money, Bank Transfer, Digital Wallets',
    evidenceLink: 'https://addisababa.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:40:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 116,
    submissionId: 3,
    subQuestionId: 44,
    responseValue: 'Our digital payment infrastructure uses secure payment gateways with SSL encryption, PCI-DSS compliance, and real-time transaction monitoring to ensure secure and reliable payment processing.',
    evidenceLink: 'https://addisababa.gov.et/payment-security',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:45:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 117,
    submissionId: 3,
    subQuestionId: 48,
    responseValue: 'Yes, we have online platforms for public consultation on policy matters and city planning.',
    evidenceLink: 'https://addisababa.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:50:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 118,
    submissionId: 3,
    subQuestionId: 49,
    responseValue: 'We conduct regular public consultations through online platforms, public meetings, and surveys, with active participation from thousands of citizens in policy development and city planning processes.',
    evidenceLink: 'https://addisababa.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T11:55:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 119,
    submissionId: 3,
    subQuestionId: 53,
    responseValue: 'Yes, we provide various e-participation tools including online voting, surveys, and discussion forums.',
    evidenceLink: 'https://addisababa.gov.et/e-participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:00:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 120,
    submissionId: 3,
    subQuestionId: 54,
    responseValue: 'Our e-participation initiatives include online policy consultations, citizen voting on budget priorities, digital suggestion boxes, and interactive forums that have engaged over 50,000 citizens in decision-making processes.',
    evidenceLink: 'https://addisababa.gov.et/e-participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:05:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 121,
    submissionId: 3,
    subQuestionId: 62,
    responseValue: 'Yes, we operate a modern data center and utilize cloud services for scalability and reliability.',
    evidenceLink: 'https://addisababa.gov.et/data-center',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:10:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 122,
    submissionId: 3,
    subQuestionId: 63,
    responseValue: 'We maintain a Tier 3 data center with redundant power, cooling, and network infrastructure, and utilize hybrid cloud services for non-sensitive applications to ensure high availability and scalability.',
    evidenceLink: 'https://addisababa.gov.et/data-center',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:15:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 123,
    submissionId: 3,
    subQuestionId: 64,
    responseValue: 'Yes, we have comprehensive cybersecurity measures in place.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:20:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 124,
    submissionId: 3,
    subQuestionId: 65,
    responseValue: 'Firewall, Antivirus, Encryption, Access Controls, Security Audits, Incident Response Plan',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:25:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 125,
    submissionId: 3,
    subQuestionId: 66,
    responseValue: 'Yes, we have a comprehensive cybersecurity policy that is regularly updated.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity-policy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:30:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 126,
    submissionId: 3,
    subQuestionId: 67,
    responseValue: 'Our cybersecurity framework includes regular risk assessments, penetration testing, security awareness training, and a well-defined incident response plan with 24/7 monitoring and rapid response capabilities.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:35:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 127,
    submissionId: 3,
    subQuestionId: 68,
    responseValue: 'Yes, our systems are interoperable with other government systems through standardized APIs and data exchange protocols.',
    evidenceLink: 'https://addisababa.gov.et/interoperability',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:40:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 128,
    submissionId: 3,
    subQuestionId: 69,
    responseValue: 'We use RESTful APIs, SOAP services, and standardized data formats (JSON, XML) to enable interoperability. Our systems integrate with national ID systems, payment gateways, and other city databases for seamless data exchange. We follow national interoperability standards and maintain API documentation for third-party integrations.',
    evidenceLink: 'https://addisababa.gov.et/interoperability-standards',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:45:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 129,
    submissionId: 3,
    subQuestionId: 79,
    responseValue: 'Yes, we have initiatives to make digital services more affordable and accessible to all citizens.',
    evidenceLink: 'https://addisababa.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:50:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 130,
    submissionId: 3,
    subQuestionId: 80,
    responseValue: 'We provide free Wi-Fi at public facilities, offer discounted data packages for government service access, maintain low-cost service fees, and partner with telecom providers to offer subsidized access for low-income citizens.',
    evidenceLink: 'https://addisababa.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-12-05T12:55:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  // Additional responses for Submission 4 (Addis Ababa City Administration - Pending Initial Approval) - Completing all applicable questions
  {
    responseId: 131,
    submissionId: 4,
    subQuestionId: 6,
    responseValue: 'Yes, we have comprehensive data protection and privacy legislation that complies with national standards.',
    evidenceLink: 'https://addisababa.gov.et/privacy-policy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T08:55:00.000Z',
    updatedAt: '2024-12-15T08:55:00.000Z'
  },
  {
    responseId: 132,
    submissionId: 4,
    subQuestionId: 7,
    responseValue: 'Our legal framework includes electronic transaction laws, digital signature regulations, data protection policies, and cybersecurity legislation that support all e-government initiatives.',
    evidenceLink: 'https://addisababa.gov.et/legal-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:00:00.000Z',
    updatedAt: '2024-12-15T09:00:00.000Z'
  },
  {
    responseId: 133,
    submissionId: 4,
    subQuestionId: 8,
    responseValue: 'Yes, we have a dedicated Smart City Office with 30 staff members.',
    evidenceLink: 'https://addisababa.gov.et/smart-city-office',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:05:00.000Z',
    updatedAt: '2024-12-15T09:05:00.000Z'
  },
  {
    responseId: 134,
    submissionId: 4,
    subQuestionId: 9,
    responseValue: 'Regular Meetings, Shared Platforms, Joint Committees',
    evidenceLink: 'https://addisababa.gov.et/coordination',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:10:00.000Z',
    updatedAt: '2024-12-15T09:10:00.000Z'
  },
  {
    responseId: 135,
    submissionId: 4,
    subQuestionId: 10,
    responseValue: 'Advanced',
    evidenceLink: 'https://addisababa.gov.et/staff-capacity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:15:00.000Z',
    updatedAt: '2024-12-15T09:15:00.000Z'
  },
  {
    responseId: 136,
    submissionId: 4,
    subQuestionId: 11,
    responseValue: 'Our organizational structure includes a Smart City Office reporting directly to the Mayor, with dedicated teams for digital services, infrastructure, and citizen engagement.',
    evidenceLink: 'https://addisababa.gov.et/organizational-structure',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:20:00.000Z',
    updatedAt: '2024-12-15T09:20:00.000Z'
  },
  {
    responseId: 137,
    submissionId: 4,
    subQuestionId: 12,
    responseValue: 'Yes, we have a comprehensive data governance policy that defines data ownership, access controls, and usage guidelines.',
    evidenceLink: 'https://addisababa.gov.et/data-governance',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:25:00.000Z',
    updatedAt: '2024-12-15T09:25:00.000Z'
  },
  {
    responseId: 138,
    submissionId: 4,
    subQuestionId: 13,
    responseValue: 'Yes, we implement comprehensive privacy protection measures including encryption, access controls, and regular security audits.',
    evidenceLink: 'https://addisababa.gov.et/privacy-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:30:00.000Z',
    updatedAt: '2024-12-15T09:30:00.000Z'
  },
  {
    responseId: 139,
    submissionId: 4,
    subQuestionId: 14,
    responseValue: 'We implement multi-layered security including firewalls, encryption, regular security audits, access controls, and incident response procedures to protect citizen data and ensure privacy.',
    evidenceLink: 'https://addisababa.gov.et/security-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:35:00.000Z',
    updatedAt: '2024-12-15T09:35:00.000Z'
  },
  {
    responseId: 140,
    submissionId: 4,
    subQuestionId: 26,
    responseValue: 'Yes, we maintain an open data portal where citizens can access various datasets.',
    evidenceLink: 'https://addisababa.gov.et/open-data',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:40:00.000Z',
    updatedAt: '2024-12-15T09:40:00.000Z'
  },
  {
    responseId: 141,
    submissionId: 4,
    subQuestionId: 27,
    responseValue: 'Statistical Data, Budget Data, Service Data, Geographic Data, Administrative Data',
    evidenceLink: 'https://addisababa.gov.et/open-data',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:45:00.000Z',
    updatedAt: '2024-12-15T09:45:00.000Z'
  },
  {
    responseId: 142,
    submissionId: 4,
    subQuestionId: 28,
    responseValue: 'Our open data initiative publishes datasets in machine-readable formats (CSV, JSON, XML) covering budget, service delivery, demographics, and geographic information to promote transparency and innovation.',
    evidenceLink: 'https://addisababa.gov.et/open-data',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:50:00.000Z',
    updatedAt: '2024-12-15T09:50:00.000Z'
  },
  {
    responseId: 143,
    submissionId: 4,
    subQuestionId: 33,
    responseValue: 'Yes, we have a one-stop portal that integrates services from multiple city departments.',
    evidenceLink: 'https://addisababa.gov.et/one-stop-portal',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T09:55:00.000Z',
    updatedAt: '2024-12-15T09:55:00.000Z'
  },
  {
    responseId: 144,
    submissionId: 4,
    subQuestionId: 34,
    responseValue: 'We have achieved high-level service integration across city departments, allowing citizens to access multiple services through a single portal with unified authentication and payment systems.',
    evidenceLink: 'https://addisababa.gov.et/service-integration',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:00:00.000Z',
    updatedAt: '2024-12-15T10:00:00.000Z'
  },
  {
    responseId: 145,
    submissionId: 4,
    subQuestionId: 42,
    responseValue: 'Yes, we offer multiple digital payment options for government services.',
    evidenceLink: 'https://addisababa.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:05:00.000Z',
    updatedAt: '2024-12-15T10:05:00.000Z'
  },
  {
    responseId: 146,
    submissionId: 4,
    subQuestionId: 43,
    responseValue: 'Credit/Debit Cards, Mobile Money, Bank Transfer, Digital Wallets',
    evidenceLink: 'https://addisababa.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:10:00.000Z',
    updatedAt: '2024-12-15T10:10:00.000Z'
  },
  {
    responseId: 147,
    submissionId: 4,
    subQuestionId: 44,
    responseValue: 'Our digital payment infrastructure uses secure payment gateways with SSL encryption, PCI-DSS compliance, and real-time transaction monitoring to ensure secure and reliable payment processing.',
    evidenceLink: 'https://addisababa.gov.et/payment-security',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:15:00.000Z',
    updatedAt: '2024-12-15T10:15:00.000Z'
  },
  {
    responseId: 148,
    submissionId: 4,
    subQuestionId: 48,
    responseValue: 'Yes, we have online platforms for public consultation on policy matters and city planning.',
    evidenceLink: 'https://addisababa.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:20:00.000Z',
    updatedAt: '2024-12-15T10:20:00.000Z'
  },
  {
    responseId: 149,
    submissionId: 4,
    subQuestionId: 49,
    responseValue: 'We conduct regular public consultations through online platforms, public meetings, and surveys, with active participation from thousands of citizens in policy development and city planning processes.',
    evidenceLink: 'https://addisababa.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:25:00.000Z',
    updatedAt: '2024-12-15T10:25:00.000Z'
  },
  {
    responseId: 150,
    submissionId: 4,
    subQuestionId: 53,
    responseValue: 'Yes, we provide various e-participation tools including online voting, surveys, and discussion forums.',
    evidenceLink: 'https://addisababa.gov.et/e-participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:30:00.000Z',
    updatedAt: '2024-12-15T10:30:00.000Z'
  },
  {
    responseId: 151,
    submissionId: 4,
    subQuestionId: 54,
    responseValue: 'Our e-participation initiatives include online policy consultations, citizen voting on budget priorities, digital suggestion boxes, and interactive forums that have engaged over 50,000 citizens in decision-making processes.',
    evidenceLink: 'https://addisababa.gov.et/e-participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:35:00.000Z',
    updatedAt: '2024-12-15T10:35:00.000Z'
  },
  {
    responseId: 152,
    submissionId: 4,
    subQuestionId: 62,
    responseValue: 'Yes, we operate a modern data center and utilize cloud services for scalability and reliability.',
    evidenceLink: 'https://addisababa.gov.et/data-center',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:40:00.000Z',
    updatedAt: '2024-12-15T10:40:00.000Z'
  },
  {
    responseId: 153,
    submissionId: 4,
    subQuestionId: 63,
    responseValue: 'We maintain a Tier 3 data center with redundant power, cooling, and network infrastructure, and utilize hybrid cloud services for non-sensitive applications to ensure high availability and scalability.',
    evidenceLink: 'https://addisababa.gov.et/data-center',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:45:00.000Z',
    updatedAt: '2024-12-15T10:45:00.000Z'
  },
  {
    responseId: 154,
    submissionId: 4,
    subQuestionId: 64,
    responseValue: 'Yes, we have comprehensive cybersecurity measures in place.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:50:00.000Z',
    updatedAt: '2024-12-15T10:50:00.000Z'
  },
  {
    responseId: 155,
    submissionId: 4,
    subQuestionId: 65,
    responseValue: 'Firewall, Antivirus, Encryption, Access Controls, Security Audits, Incident Response Plan',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T10:55:00.000Z',
    updatedAt: '2024-12-15T10:55:00.000Z'
  },
  {
    responseId: 156,
    submissionId: 4,
    subQuestionId: 66,
    responseValue: 'Yes, we have a comprehensive cybersecurity policy that is regularly updated.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity-policy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T11:00:00.000Z',
    updatedAt: '2024-12-15T11:00:00.000Z'
  },
  {
    responseId: 157,
    submissionId: 4,
    subQuestionId: 67,
    responseValue: 'Our cybersecurity framework includes regular risk assessments, penetration testing, security awareness training, and a well-defined incident response plan with 24/7 monitoring and rapid response capabilities.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T11:05:00.000Z',
    updatedAt: '2024-12-15T11:05:00.000Z'
  },
  {
    responseId: 158,
    submissionId: 4,
    subQuestionId: 68,
    responseValue: 'Yes, our systems are interoperable with other government systems through standardized APIs and data exchange protocols.',
    evidenceLink: 'https://addisababa.gov.et/interoperability',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T11:10:00.000Z',
    updatedAt: '2024-12-15T11:10:00.000Z'
  },
  {
    responseId: 159,
    submissionId: 4,
    subQuestionId: 69,
    responseValue: 'We use RESTful APIs, SOAP services, and standardized data formats (JSON, XML) to enable interoperability. Our systems integrate with national ID systems, payment gateways, and other city databases for seamless data exchange. We follow national interoperability standards and maintain API documentation for third-party integrations.',
    evidenceLink: 'https://addisababa.gov.et/interoperability-standards',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T11:15:00.000Z',
    updatedAt: '2024-12-15T11:15:00.000Z'
  },
  {
    responseId: 160,
    submissionId: 4,
    subQuestionId: 79,
    responseValue: 'Yes, we have initiatives to make digital services more affordable and accessible to all citizens.',
    evidenceLink: 'https://addisababa.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T11:20:00.000Z',
    updatedAt: '2024-12-15T11:20:00.000Z'
  },
  {
    responseId: 161,
    submissionId: 4,
    subQuestionId: 80,
    responseValue: 'We provide free Wi-Fi at public facilities, offer discounted data packages for government service access, maintain low-cost service fees, and partner with telecom providers to offer subsidized access for low-income citizens.',
    evidenceLink: 'https://addisababa.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-15T11:25:00.000Z',
    updatedAt: '2024-12-15T11:25:00.000Z'
  },
  // Additional responses for Submission 7 (Oromia Region - Pending Initial Approval) - Completing all applicable questions
  {
    responseId: 162,
    submissionId: 7,
    subQuestionId: 6,
    responseValue: 'Yes, we have comprehensive data protection and privacy legislation that complies with national standards.',
    evidenceLink: 'https://oromia.gov.et/privacy-policy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T08:55:00.000Z',
    updatedAt: '2024-12-14T08:55:00.000Z'
  },
  {
    responseId: 163,
    submissionId: 7,
    subQuestionId: 7,
    responseValue: 'Our legal framework includes electronic transaction laws, digital signature regulations, data protection policies, and cybersecurity legislation that support all e-government initiatives.',
    evidenceLink: 'https://oromia.gov.et/legal-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:00:00.000Z',
    updatedAt: '2024-12-14T09:00:00.000Z'
  },
  {
    responseId: 164,
    submissionId: 7,
    subQuestionId: 8,
    responseValue: 'Yes, we have a Regional ICT Bureau with 25 staff members.',
    evidenceLink: 'https://oromia.gov.et/ict-bureau',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:05:00.000Z',
    updatedAt: '2024-12-14T09:05:00.000Z'
  },
  {
    responseId: 165,
    submissionId: 7,
    subQuestionId: 9,
    responseValue: 'Regular Meetings, Shared Platforms, Joint Committees',
    evidenceLink: 'https://oromia.gov.et/coordination',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:10:00.000Z',
    updatedAt: '2024-12-14T09:10:00.000Z'
  },
  {
    responseId: 166,
    submissionId: 7,
    subQuestionId: 10,
    responseValue: 'Advanced',
    evidenceLink: 'https://oromia.gov.et/staff-capacity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:15:00.000Z',
    updatedAt: '2024-12-14T09:15:00.000Z'
  },
  {
    responseId: 167,
    submissionId: 7,
    subQuestionId: 11,
    responseValue: 'Our organizational structure includes a Regional ICT Bureau reporting to the Regional Administrator, with dedicated teams for digital services, infrastructure, and citizen engagement.',
    evidenceLink: 'https://oromia.gov.et/organizational-structure',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:20:00.000Z',
    updatedAt: '2024-12-14T09:20:00.000Z'
  },
  {
    responseId: 168,
    submissionId: 7,
    subQuestionId: 12,
    responseValue: 'Yes, we have a comprehensive data governance policy that defines data ownership, access controls, and usage guidelines.',
    evidenceLink: 'https://oromia.gov.et/data-governance',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:25:00.000Z',
    updatedAt: '2024-12-14T09:25:00.000Z'
  },
  {
    responseId: 169,
    submissionId: 7,
    subQuestionId: 13,
    responseValue: 'Yes, we implement comprehensive privacy protection measures including encryption, access controls, and regular security audits.',
    evidenceLink: 'https://oromia.gov.et/privacy-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:30:00.000Z',
    updatedAt: '2024-12-14T09:30:00.000Z'
  },
  {
    responseId: 170,
    submissionId: 7,
    subQuestionId: 14,
    responseValue: 'We implement multi-layered security including firewalls, encryption, regular security audits, access controls, and incident response procedures to protect citizen data and ensure privacy.',
    evidenceLink: 'https://oromia.gov.et/security-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:35:00.000Z',
    updatedAt: '2024-12-14T09:35:00.000Z'
  },
  {
    responseId: 171,
    submissionId: 7,
    subQuestionId: 26,
    responseValue: 'Yes, we maintain an open data portal where citizens can access various datasets.',
    evidenceLink: 'https://oromia.gov.et/open-data',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:40:00.000Z',
    updatedAt: '2024-12-14T09:40:00.000Z'
  },
  {
    responseId: 172,
    submissionId: 7,
    subQuestionId: 27,
    responseValue: 'Statistical Data, Budget Data, Service Data, Geographic Data, Administrative Data',
    evidenceLink: 'https://oromia.gov.et/open-data',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:45:00.000Z',
    updatedAt: '2024-12-14T09:45:00.000Z'
  },
  {
    responseId: 173,
    submissionId: 7,
    subQuestionId: 28,
    responseValue: 'Our open data initiative publishes datasets in machine-readable formats (CSV, JSON, XML) covering budget, service delivery, demographics, and geographic information to promote transparency and innovation.',
    evidenceLink: 'https://oromia.gov.et/open-data',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:50:00.000Z',
    updatedAt: '2024-12-14T09:50:00.000Z'
  },
  {
    responseId: 174,
    submissionId: 7,
    subQuestionId: 33,
    responseValue: 'Yes, we have a one-stop portal that integrates services from multiple regional departments.',
    evidenceLink: 'https://oromia.gov.et/one-stop-portal',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T09:55:00.000Z',
    updatedAt: '2024-12-14T09:55:00.000Z'
  },
  {
    responseId: 175,
    submissionId: 7,
    subQuestionId: 34,
    responseValue: 'We have achieved high-level service integration across regional departments, allowing citizens to access multiple services through a single portal with unified authentication and payment systems.',
    evidenceLink: 'https://oromia.gov.et/service-integration',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:00:00.000Z',
    updatedAt: '2024-12-14T10:00:00.000Z'
  },
  {
    responseId: 176,
    submissionId: 7,
    subQuestionId: 42,
    responseValue: 'Yes, we offer multiple digital payment options for government services.',
    evidenceLink: 'https://oromia.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:05:00.000Z',
    updatedAt: '2024-12-14T10:05:00.000Z'
  },
  {
    responseId: 177,
    submissionId: 7,
    subQuestionId: 43,
    responseValue: 'Credit/Debit Cards, Mobile Money, Bank Transfer, Digital Wallets',
    evidenceLink: 'https://oromia.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:10:00.000Z',
    updatedAt: '2024-12-14T10:10:00.000Z'
  },
  {
    responseId: 178,
    submissionId: 7,
    subQuestionId: 44,
    responseValue: 'Our digital payment infrastructure uses secure payment gateways with SSL encryption, PCI-DSS compliance, and real-time transaction monitoring to ensure secure and reliable payment processing.',
    evidenceLink: 'https://oromia.gov.et/payment-security',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:15:00.000Z',
    updatedAt: '2024-12-14T10:15:00.000Z'
  },
  {
    responseId: 179,
    submissionId: 7,
    subQuestionId: 48,
    responseValue: 'Yes, we have online platforms for public consultation on policy matters and regional planning.',
    evidenceLink: 'https://oromia.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:20:00.000Z',
    updatedAt: '2024-12-14T10:20:00.000Z'
  },
  {
    responseId: 180,
    submissionId: 7,
    subQuestionId: 49,
    responseValue: 'We conduct regular public consultations through online platforms, public meetings, and surveys, with active participation from thousands of citizens in policy development and regional planning processes.',
    evidenceLink: 'https://oromia.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:25:00.000Z',
    updatedAt: '2024-12-14T10:25:00.000Z'
  },
  {
    responseId: 181,
    submissionId: 7,
    subQuestionId: 53,
    responseValue: 'Yes, we provide various e-participation tools including online voting, surveys, and discussion forums.',
    evidenceLink: 'https://oromia.gov.et/e-participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:30:00.000Z',
    updatedAt: '2024-12-14T10:30:00.000Z'
  },
  {
    responseId: 182,
    submissionId: 7,
    subQuestionId: 54,
    responseValue: 'Our e-participation initiatives include online policy consultations, citizen voting on budget priorities, digital suggestion boxes, and interactive forums that have engaged over 30,000 citizens in decision-making processes.',
    evidenceLink: 'https://oromia.gov.et/e-participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:35:00.000Z',
    updatedAt: '2024-12-14T10:35:00.000Z'
  },
  {
    responseId: 183,
    submissionId: 7,
    subQuestionId: 62,
    responseValue: 'Yes, we operate a modern data center and utilize cloud services for scalability and reliability.',
    evidenceLink: 'https://oromia.gov.et/data-center',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:40:00.000Z',
    updatedAt: '2024-12-14T10:40:00.000Z'
  },
  {
    responseId: 184,
    submissionId: 7,
    subQuestionId: 63,
    responseValue: 'We maintain a Tier 3 data center with redundant power, cooling, and network infrastructure, and utilize hybrid cloud services for non-sensitive applications to ensure high availability and scalability.',
    evidenceLink: 'https://oromia.gov.et/data-center',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:45:00.000Z',
    updatedAt: '2024-12-14T10:45:00.000Z'
  },
  {
    responseId: 185,
    submissionId: 7,
    subQuestionId: 64,
    responseValue: 'Yes, we have comprehensive cybersecurity measures in place.',
    evidenceLink: 'https://oromia.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:50:00.000Z',
    updatedAt: '2024-12-14T10:50:00.000Z'
  },
  {
    responseId: 186,
    submissionId: 7,
    subQuestionId: 65,
    responseValue: 'Firewall, Antivirus, Encryption, Access Controls, Security Audits, Incident Response Plan',
    evidenceLink: 'https://oromia.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T10:55:00.000Z',
    updatedAt: '2024-12-14T10:55:00.000Z'
  },
  {
    responseId: 187,
    submissionId: 7,
    subQuestionId: 66,
    responseValue: 'Yes, we have a comprehensive cybersecurity policy that is regularly updated.',
    evidenceLink: 'https://oromia.gov.et/cybersecurity-policy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T11:00:00.000Z',
    updatedAt: '2024-12-14T11:00:00.000Z'
  },
  {
    responseId: 188,
    submissionId: 7,
    subQuestionId: 67,
    responseValue: 'Our cybersecurity framework includes regular risk assessments, penetration testing, security awareness training, and a well-defined incident response plan with 24/7 monitoring and rapid response capabilities.',
    evidenceLink: 'https://oromia.gov.et/cybersecurity-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T11:05:00.000Z',
    updatedAt: '2024-12-14T11:05:00.000Z'
  },
  {
    responseId: 189,
    submissionId: 7,
    subQuestionId: 68,
    responseValue: 'Yes, our systems are interoperable with other government systems through standardized APIs and data exchange protocols.',
    evidenceLink: 'https://oromia.gov.et/interoperability',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T11:10:00.000Z',
    updatedAt: '2024-12-14T11:10:00.000Z'
  },
  {
    responseId: 190,
    submissionId: 7,
    subQuestionId: 69,
    responseValue: 'We use RESTful APIs, SOAP services, and standardized data formats (JSON, XML) to enable interoperability. Our systems integrate with national ID systems, payment gateways, and other regional databases for seamless data exchange. We follow national interoperability standards and maintain API documentation for third-party integrations.',
    evidenceLink: 'https://oromia.gov.et/interoperability-standards',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T11:15:00.000Z',
    updatedAt: '2024-12-14T11:15:00.000Z'
  },
  {
    responseId: 191,
    submissionId: 7,
    subQuestionId: 79,
    responseValue: 'Yes, we have initiatives to make digital services more affordable and accessible to all citizens.',
    evidenceLink: 'https://oromia.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T11:20:00.000Z',
    updatedAt: '2024-12-14T11:20:00.000Z'
  },
  {
    responseId: 192,
    submissionId: 7,
    subQuestionId: 80,
    responseValue: 'We provide free Wi-Fi at public facilities, offer discounted data packages for government service access, maintain low-cost service fees, and partner with telecom providers to offer subsidized access for low-income citizens.',
    evidenceLink: 'https://oromia.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.PENDING,
    centralRejectionReason: null,
    generalNote: null,
    createdAt: '2024-12-14T11:25:00.000Z',
    updatedAt: '2024-12-14T11:25:00.000Z'
  },
  // Responses for Submission 8 (Addis Ababa City Administration - Rejected by Central Committee)
  // City Administration applicable questions: 1-14, 26-28, 33-34, 42-44, 48-49, 53-54, 62-63, 64-67, 68-69, 79-80
  {
    responseId: 227,
    submissionId: 8,
    subQuestionId: 1,
    responseValue: 'Yes, we have an e-government policy document that was approved in 2023.',
    evidenceLink: 'https://addisababa.gov.et/policies/e-government-policy-2023.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: 'Policy document is comprehensive and well-structured.',
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:00:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 228,
    submissionId: 8,
    subQuestionId: 2,
    responseValue: 'The policy includes targets for digital service delivery.',
    evidenceLink: 'https://addisababa.gov.et/policies/e-government-policy-2023.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.REJECTED,
    centralRejectionReason: 'The response lacks sufficient detail about specific targets and implementation timelines. Please provide more comprehensive information about the strategy objectives.',
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:05:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 229,
    submissionId: 8,
    subQuestionId: 3,
    responseValue: 'Yes, we have a dedicated e-government unit with 12 staff members.',
    evidenceLink: 'https://addisababa.gov.et/organizational-structure',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: 'Good organizational structure.',
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:10:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 230,
    submissionId: 8,
    subQuestionId: 4,
    responseValue: 'Our website provides information on regional services and policies.',
    evidenceLink: 'https://amhara.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.REJECTED,
    centralRejectionReason: 'The description is too vague. Please provide specific details about what information is available and how it is organized.',
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:15:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 231,
    submissionId: 8,
    subQuestionId: 5,
    responseValue: 'Yes, we have electronic transaction laws in place.',
    evidenceLink: 'https://addisababa.gov.et/legal-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:20:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 232,
    submissionId: 8,
    subQuestionId: 6,
    responseValue: 'Yes, we have data protection legislation.',
    evidenceLink: 'https://addisababa.gov.et/privacy-policy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:25:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 233,
    submissionId: 8,
    subQuestionId: 7,
    responseValue: 'Our legal framework includes electronic transaction laws and data protection policies.',
    evidenceLink: 'https://addisababa.gov.et/legal-framework',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:30:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 234,
    submissionId: 8,
    subQuestionId: 8,
    responseValue: 'Yes, we have a dedicated e-government unit with 12 staff members.',
    evidenceLink: 'https://addisababa.gov.et/organizational-structure',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:35:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 235,
    submissionId: 8,
    subQuestionId: 9,
    responseValue: 'Regular Meetings, Shared Platforms',
    evidenceLink: 'https://addisababa.gov.et/coordination',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:40:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 236,
    submissionId: 8,
    subQuestionId: 10,
    responseValue: 'Adequate',
    evidenceLink: 'https://addisababa.gov.et/staff-capacity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:45:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 237,
    submissionId: 8,
    subQuestionId: 11,
    responseValue: 'Our e-government management structure includes a Director of Digital Services and coordination teams.',
    evidenceLink: 'https://addisababa.gov.et/organizational-structure',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:50:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 238,
    submissionId: 8,
    subQuestionId: 12,
    responseValue: 'Yes, we have a data governance policy.',
    evidenceLink: 'https://addisababa.gov.et/data-governance-policy.pdf',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T09:55:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 239,
    submissionId: 8,
    subQuestionId: 13,
    responseValue: 'Yes, we implement privacy protection measures.',
    evidenceLink: 'https://addisababa.gov.et/privacy-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:00:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 240,
    submissionId: 8,
    subQuestionId: 14,
    responseValue: 'We implement data security measures including encryption and access controls.',
    evidenceLink: 'https://addisababa.gov.et/security-measures',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:05:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 241,
    submissionId: 8,
    subQuestionId: 26,
    responseValue: 'Yes, we maintain an open data portal.',
    evidenceLink: 'https://addisababa.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:10:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 242,
    submissionId: 8,
    subQuestionId: 27,
    responseValue: 'Statistical Data, Service Data',
    evidenceLink: 'https://addisababa.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:15:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 243,
    submissionId: 8,
    subQuestionId: 28,
    responseValue: 'Our open data initiative publishes regional statistics and service data in CSV and JSON formats.',
    evidenceLink: 'https://addisababa.gov.et/opendata',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:20:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 244,
    submissionId: 8,
    subQuestionId: 33,
    responseValue: 'Yes, we have a one-stop portal for regional services.',
    evidenceLink: 'https://addisababa.gov.et/portal',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:25:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 245,
    submissionId: 8,
    subQuestionId: 34,
    responseValue: 'We have integrated services across multiple departments through a single portal.',
    evidenceLink: 'https://addisababa.gov.et/portal',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:30:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 246,
    submissionId: 8,
    subQuestionId: 42,
    responseValue: 'Yes, we offer digital payment options.',
    evidenceLink: 'https://addisababa.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:35:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 247,
    submissionId: 8,
    subQuestionId: 43,
    responseValue: 'Mobile Money, Bank Transfer',
    evidenceLink: 'https://addisababa.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:40:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 248,
    submissionId: 8,
    subQuestionId: 44,
    responseValue: 'Our digital payment infrastructure uses secure payment gateways and SSL encryption.',
    evidenceLink: 'https://addisababa.gov.et/payments',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:45:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 249,
    submissionId: 8,
    subQuestionId: 48,
    responseValue: 'Yes, we have online platforms for public consultation.',
    evidenceLink: 'https://addisababa.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:50:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 250,
    submissionId: 8,
    subQuestionId: 49,
    responseValue: 'We conduct regular online consultations on regional policies and service improvements.',
    evidenceLink: 'https://addisababa.gov.et/consultation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T10:55:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 251,
    submissionId: 8,
    subQuestionId: 53,
    responseValue: 'Yes, we provide e-participation tools.',
    evidenceLink: 'https://addisababa.gov.et/participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:00:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 252,
    submissionId: 8,
    subQuestionId: 54,
    responseValue: 'Our e-participation initiatives include online policy discussions and citizen surveys.',
    evidenceLink: 'https://addisababa.gov.et/participation',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:05:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 253,
    submissionId: 8,
    subQuestionId: 62,
    responseValue: 'Yes, we operate a data center with cloud infrastructure.',
    evidenceLink: 'https://addisababa.gov.et/datacenter',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:10:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 254,
    submissionId: 8,
    subQuestionId: 63,
    responseValue: 'Our data center includes redundant servers and backup systems.',
    evidenceLink: 'https://addisababa.gov.et/datacenter',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:15:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 255,
    submissionId: 8,
    subQuestionId: 64,
    responseValue: 'Yes, we have comprehensive cybersecurity measures.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:20:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 256,
    submissionId: 8,
    subQuestionId: 65,
    responseValue: 'Firewalls, Encryption, Security Audits',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:25:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 257,
    submissionId: 8,
    subQuestionId: 66,
    responseValue: 'We conduct security audits quarterly.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:30:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 258,
    submissionId: 8,
    subQuestionId: 67,
    responseValue: 'Our cybersecurity strategy includes multi-layered defense and regular penetration testing.',
    evidenceLink: 'https://addisababa.gov.et/cybersecurity',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:35:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 259,
    submissionId: 8,
    subQuestionId: 68,
    responseValue: 'Yes, our systems are interoperable with other government systems.',
    evidenceLink: 'https://addisababa.gov.et/interoperability',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:40:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 260,
    submissionId: 8,
    subQuestionId: 69,
    responseValue: 'We use RESTful APIs and standardized data formats for interoperability.',
    evidenceLink: 'https://addisababa.gov.et/interoperability',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:45:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 261,
    submissionId: 8,
    subQuestionId: 79,
    responseValue: 'Yes, we have initiatives to make digital services more affordable.',
    evidenceLink: 'https://addisababa.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:50:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    responseId: 262,
    submissionId: 8,
    subQuestionId: 80,
    responseValue: 'We provide free Wi-Fi at public facilities and maintain low-cost service fees.',
    evidenceLink: 'https://addisababa.gov.et/affordable-access',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-11-15T11:55:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  // Responses for Submission 9 (Sub-city 1 - Validated)
  // Sub-city applicable questions: 15-25, 29-32, 35-37, 38-41, 45-47, 50-52, 70-75
  {
    responseId: 263,
    submissionId: 9,
    subQuestionId: 15,
    responseValue: 'Yes, we maintain an official website for our sub-city administration.',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: 'Well-maintained website with good accessibility.',
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:00:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 264,
    submissionId: 9,
    subQuestionId: 16,
    responseValue: 'Fully Operational',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:05:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 265,
    submissionId: 9,
    subQuestionId: 17,
    responseValue: 'Yes, organizational information including structure, services, and contact details are publicly accessible online.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/about',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:10:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 266,
    submissionId: 9,
    subQuestionId: 18,
    responseValue: 'Contact Information, Organizational Structure, Service Information, Annual Reports',
    evidenceLink: 'https://subcity1.addisababa.gov.et/information',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:15:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 267,
    submissionId: 9,
    subQuestionId: 19,
    responseValue: 'Yes, citizens can request information through our online contact form and email.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/contact',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:20:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 268,
    submissionId: 9,
    subQuestionId: 20,
    responseValue: 'We maintain transparency by publishing service information, organizational structure, and annual reports. All information is updated regularly and accessible to the public.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/transparency',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: 'Good transparency practices.',
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:25:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 269,
    submissionId: 9,
    subQuestionId: 21,
    responseValue: 'Yes, our website is available in Amharic and English.',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:30:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 270,
    submissionId: 9,
    subQuestionId: 22,
    responseValue: 'English, Amharic',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:35:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 271,
    submissionId: 9,
    subQuestionId: 23,
    responseValue: 'We provide bilingual content (Amharic and English) to ensure accessibility for all citizens. All key information is translated and maintained in both languages.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/languages',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:40:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 272,
    submissionId: 9,
    subQuestionId: 24,
    responseValue: 'Weekly',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:45:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 273,
    submissionId: 9,
    subQuestionId: 25,
    responseValue: 'Yes, we use a content management system to regularly update website content and announcements.',
    evidenceLink: 'https://subcity1.addisababa.gov.et',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:50:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 274,
    submissionId: 9,
    subQuestionId: 29,
    responseValue: '6-10 services',
    evidenceLink: 'https://subcity1.addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T09:55:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 275,
    submissionId: 9,
    subQuestionId: 30,
    responseValue: 'Information Services, Download Forms, Online Applications, Status Tracking',
    evidenceLink: 'https://subcity1.addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:00:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 276,
    submissionId: 9,
    subQuestionId: 31,
    responseValue: 'Yes, citizens can complete permit applications and service requests fully online.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/online-services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:05:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 277,
    submissionId: 9,
    subQuestionId: 32,
    responseValue: 'We offer online services for local permits, service requests, and information access. Citizens can apply, track status, and receive notifications through our portal.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/online-services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: 'Comprehensive online service offerings.',
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:10:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 278,
    submissionId: 9,
    subQuestionId: 35,
    responseValue: 'Yes, our services are accessible via mobile devices through a responsive website design.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/mobile',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:15:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 279,
    submissionId: 9,
    subQuestionId: 36,
    responseValue: 'Mobile Website, SMS Services',
    evidenceLink: 'https://subcity1.addisababa.gov.et/mobile',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:20:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 280,
    submissionId: 9,
    subQuestionId: 37,
    responseValue: 'We provide mobile-optimized website access and SMS notifications for service updates and status changes.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/mobile',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:25:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 281,
    submissionId: 9,
    subQuestionId: 38,
    responseValue: 'Yes, we have online feedback forms and surveys for citizen input.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/feedback',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:30:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 282,
    submissionId: 9,
    subQuestionId: 39,
    responseValue: '1-3 Days',
    evidenceLink: 'https://subcity1.addisababa.gov.et/services',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:35:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 283,
    submissionId: 9,
    subQuestionId: 40,
    responseValue: 'Yes, our services are designed with user-centered principles focusing on ease of use and accessibility.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/ux',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:40:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 284,
    submissionId: 9,
    subQuestionId: 41,
    responseValue: 'Our services feature intuitive navigation, clear instructions, and accessibility features including screen reader support and keyboard navigation.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/accessibility',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:45:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 285,
    submissionId: 9,
    subQuestionId: 45,
    responseValue: 'Yes, we have online feedback forms and surveys for citizen input.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/feedback',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:50:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 286,
    submissionId: 9,
    subQuestionId: 46,
    responseValue: 'Online Forms, Email, Phone, Social Media',
    evidenceLink: 'https://subcity1.addisababa.gov.et/feedback',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T10:55:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 287,
    submissionId: 9,
    subQuestionId: 47,
    responseValue: 'We collect citizen feedback through multiple channels including online forms, email, phone, and social media. All feedback is reviewed weekly and responses are provided within 3-5 business days.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/feedback-process',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: 'Effective feedback collection system.',
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T11:00:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 288,
    submissionId: 9,
    subQuestionId: 50,
    responseValue: 'Yes, we use social media platforms to engage with citizens and share information.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/social-media',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T11:05:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 289,
    submissionId: 9,
    subQuestionId: 51,
    responseValue: 'Facebook, Twitter, Telegram',
    evidenceLink: 'https://subcity1.addisababa.gov.et/social-media',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T11:10:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 290,
    submissionId: 9,
    subQuestionId: 52,
    responseValue: 'We actively engage with citizens through Facebook, Twitter, and Telegram, sharing service updates, announcements, and responding to inquiries. We post daily updates and respond to messages within 24 hours.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/social-media',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: 'Active social media engagement.',
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T11:15:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 291,
    submissionId: 9,
    subQuestionId: 70,
    responseValue: 'Yes, we offer digital literacy programs for citizens.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/digital-literacy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T11:20:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 292,
    submissionId: 9,
    subQuestionId: 71,
    responseValue: 'Basic Computer Skills, Internet Usage, Online Service Access, Mobile App Usage',
    evidenceLink: 'https://subcity1.addisababa.gov.et/digital-literacy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T11:25:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 293,
    submissionId: 9,
    subQuestionId: 72,
    responseValue: 'We conduct monthly digital literacy workshops covering basic computer skills, internet usage, and how to access online government services. Over 200 citizens have participated in our programs this year.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/digital-literacy',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: 'Good digital literacy program.',
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T11:30:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 294,
    submissionId: 9,
    subQuestionId: 73,
    responseValue: 'Yes, our services are designed to be accessible for persons with disabilities.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/accessibility',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T11:35:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 295,
    submissionId: 9,
    subQuestionId: 74,
    responseValue: 'Screen Reader Support, Keyboard Navigation, High Contrast Mode, Text Size Adjustment',
    evidenceLink: 'https://subcity1.addisababa.gov.et/accessibility',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: null,
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T11:40:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  {
    responseId: 296,
    submissionId: 9,
    subQuestionId: 75,
    responseValue: 'We implement WCAG 2.1 Level AA accessibility standards, including screen reader compatibility, keyboard navigation, high contrast options, and adjustable text sizes. Our physical service centers also have accessibility features.',
    evidenceLink: 'https://subcity1.addisababa.gov.et/accessibility',
    evidenceFilePath: null,
    validationStatus: VALIDATION_STATUS.APPROVED,
    centralRejectionReason: null,
    generalNote: 'Excellent accessibility implementation.',
    regionalApprovalStatus: VALIDATION_STATUS.APPROVED,
    regionalRejectionReason: null,
    regionalNote: null,
    createdAt: '2024-10-10T11:45:00.000Z',
    updatedAt: '2024-10-25T16:00:00.000Z'
  },
  
  // Amhara Region Submissions
  // Amhara Region itself
  {
    submissionId: 42,
    submissionName: 'Amhara Region - 2024 Annual Assessment',
    unitId: 21, // Amhara Region
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-20T09:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-18T08:00:00.000Z',
    updatedAt: '2024-12-20T09:00:00.000Z'
  },
  {
    submissionId: 43,
    submissionName: 'Amhara Region - Q4 2024 Submission',
    unitId: 21, // Amhara Region
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-15T10:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-16T14:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-10T08:00:00.000Z',
    updatedAt: '2024-12-16T14:00:00.000Z'
  },
  {
    submissionId: 44,
    submissionName: 'Amhara Region - Digital Services 2024',
    unitId: 21, // Amhara Region
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-11-28T09:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-01T15:00:00.000Z',
    rejectionReason: 'Incomplete data submission. Please provide additional evidence for digital transformation initiatives.',
    createdAt: '2024-11-25T08:00:00.000Z',
    updatedAt: '2024-12-05T10:00:00.000Z'
  },
  
  // North Gondar Zone submissions
  {
    submissionId: 45,
    submissionName: 'North Gondar Zone - 2024 Assessment',
    unitId: 300, // North Gondar Zone
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-19T11:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-17T08:00:00.000Z',
    updatedAt: '2024-12-19T11:00:00.000Z'
  },
  {
    submissionId: 46,
    submissionName: 'North Gondar Zone - Q3 2024 Report',
    unitId: 300, // North Gondar Zone
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-10T14:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-12T16:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-05T08:00:00.000Z',
    updatedAt: '2024-12-12T16:00:00.000Z'
  },
  
  // South Gondar Zone submissions
  {
    submissionId: 47,
    submissionName: 'South Gondar Zone - 2024 Annual Report',
    unitId: 301, // South Gondar Zone
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-18T10:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-15T08:00:00.000Z',
    updatedAt: '2024-12-18T10:00:00.000Z'
  },
  {
    submissionId: 48,
    submissionName: 'South Gondar Zone - E-Government Services',
    unitId: 301, // South Gondar Zone
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-11-30T09:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-03T14:00:00.000Z',
    rejectionReason: 'Missing documentation for citizen engagement platforms. Please resubmit with complete evidence.',
    createdAt: '2024-11-28T08:00:00.000Z',
    updatedAt: '2024-12-08T11:00:00.000Z'
  },
  
  // North Wollo Zone submissions
  {
    submissionId: 49,
    submissionName: 'North Wollo Zone - 2024 Assessment',
    unitId: 302, // North Wollo Zone
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-21T08:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-19T08:00:00.000Z',
    updatedAt: '2024-12-21T08:00:00.000Z'
  },
  {
    submissionId: 50,
    submissionName: 'North Wollo Zone - Digital Infrastructure',
    unitId: 302, // North Wollo Zone
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-14T12:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-15T15:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-10T08:00:00.000Z',
    updatedAt: '2024-12-15T15:00:00.000Z'
  },
  
  // South Wollo Zone submissions
  {
    submissionId: 51,
    submissionName: 'South Wollo Zone - 2024 Q4 Submission',
    unitId: 303, // South Wollo Zone
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-22T09:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-20T08:00:00.000Z',
    updatedAt: '2024-12-22T09:00:00.000Z'
  },
  {
    submissionId: 52,
    submissionName: 'South Wollo Zone - Citizen Services 2024',
    unitId: 303, // South Wollo Zone
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-13T11:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-14T16:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-08T08:00:00.000Z',
    updatedAt: '2024-12-14T16:00:00.000Z'
  },
  
  // East Gojjam Zone submissions
  {
    submissionId: 53,
    submissionName: 'East Gojjam Zone - 2024 Assessment',
    unitId: 304, // East Gojjam Zone
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-17T10:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-15T08:00:00.000Z',
    updatedAt: '2024-12-17T10:00:00.000Z'
  },
  
  // West Gojjam Zone submissions
  {
    submissionId: 54,
    submissionName: 'West Gojjam Zone - 2024 Annual Report',
    unitId: 305, // West Gojjam Zone
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-11T13:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-13T14:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-08T08:00:00.000Z',
    updatedAt: '2024-12-13T14:00:00.000Z'
  },
  {
    submissionId: 55,
    submissionName: 'West Gojjam Zone - E-Services Implementation',
    unitId: 305, // West Gojjam Zone
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-11-25T09:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-11-28T15:00:00.000Z',
    rejectionReason: 'Insufficient evidence for online service delivery. Please provide detailed documentation.',
    createdAt: '2024-11-22T08:00:00.000Z',
    updatedAt: '2024-12-02T10:00:00.000Z'
  },
  
  // Woreda submissions - North Gondar Zone
  {
    submissionId: 56,
    submissionName: 'Gondar Woreda - 2024 Assessment',
    unitId: 3000, // Gondar Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-20T08:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-18T08:00:00.000Z',
    updatedAt: '2024-12-20T08:00:00.000Z'
  },
  {
    submissionId: 57,
    submissionName: 'Debark Woreda - 2024 Q4 Report',
    unitId: 3001, // Debark Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-16T10:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-17T14:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-12T08:00:00.000Z',
    updatedAt: '2024-12-17T14:00:00.000Z'
  },
  {
    submissionId: 58,
    submissionName: 'Beyeda Woreda - 2024 Assessment',
    unitId: 3002, // Beyeda Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-19T09:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-17T08:00:00.000Z',
    updatedAt: '2024-12-19T09:00:00.000Z'
  },
  {
    submissionId: 59,
    submissionName: 'Janamora Woreda - Digital Services',
    unitId: 3003, // Janamora Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-12-01T08:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-04T13:00:00.000Z',
    rejectionReason: 'Missing information on citizen engagement platforms. Please provide complete documentation.',
    createdAt: '2024-11-28T08:00:00.000Z',
    updatedAt: '2024-12-06T10:00:00.000Z'
  },
  {
    submissionId: 60,
    submissionName: 'Dabat Woreda - 2024 Assessment',
    unitId: 3004, // Dabat Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-21T10:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-19T08:00:00.000Z',
    updatedAt: '2024-12-21T10:00:00.000Z'
  },
  {
    submissionId: 61,
    submissionName: 'Telemt Woreda - 2024 Q4 Submission',
    unitId: 3005, // Telemt Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-15T11:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-16T15:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-11T08:00:00.000Z',
    updatedAt: '2024-12-16T15:00:00.000Z'
  },
  
  // Woreda submissions - South Gondar Zone
  {
    submissionId: 62,
    submissionName: 'Ebenat Woreda - 2024 Assessment',
    unitId: 3010, // Ebenat Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-18T09:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-16T08:00:00.000Z',
    updatedAt: '2024-12-18T09:00:00.000Z'
  },
  {
    submissionId: 63,
    submissionName: 'Fogera Woreda - 2024 Annual Report',
    unitId: 3011, // Fogera Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-14T12:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-15T16:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-10T08:00:00.000Z',
    updatedAt: '2024-12-15T16:00:00.000Z'
  },
  {
    submissionId: 64,
    submissionName: 'Farta Woreda - E-Government Services',
    unitId: 3012, // Farta Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-11-29T10:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-02T14:00:00.000Z',
    rejectionReason: 'Incomplete data on online service delivery. Please resubmit with full documentation.',
    createdAt: '2024-11-26T08:00:00.000Z',
    updatedAt: '2024-12-05T11:00:00.000Z'
  },
  {
    submissionId: 65,
    submissionName: 'Lay Gayint Woreda - 2024 Assessment',
    unitId: 3013, // Lay Gayint Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-22T08:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-20T08:00:00.000Z',
    updatedAt: '2024-12-22T08:00:00.000Z'
  },
  {
    submissionId: 66,
    submissionName: 'Tach Gayint Woreda - 2024 Q4 Submission',
    unitId: 3014, // Tach Gayint Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-13T13:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-14T17:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-09T08:00:00.000Z',
    updatedAt: '2024-12-14T17:00:00.000Z'
  },
  {
    submissionId: 67,
    submissionName: 'Semada Woreda - Digital Infrastructure',
    unitId: 3015, // Semada Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-17T11:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-15T08:00:00.000Z',
    updatedAt: '2024-12-17T11:00:00.000Z'
  },
  
  // Woreda submissions - North Wollo Zone
  {
    submissionId: 68,
    submissionName: 'Woldiya Woreda - 2024 Assessment',
    unitId: 3020, // Woldiya Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-19T10:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-17T08:00:00.000Z',
    updatedAt: '2024-12-19T10:00:00.000Z'
  },
  {
    submissionId: 69,
    submissionName: 'Kobo Woreda - 2024 Annual Report',
    unitId: 3021, // Kobo Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-12T14:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-13T15:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-08T08:00:00.000Z',
    updatedAt: '2024-12-13T15:00:00.000Z'
  },
  {
    submissionId: 70,
    submissionName: 'Meket Woreda - E-Services 2024',
    unitId: 3022, // Meket Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-12-03T09:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-06T13:00:00.000Z',
    rejectionReason: 'Missing evidence for citizen engagement initiatives. Please provide complete documentation.',
    createdAt: '2024-11-30T08:00:00.000Z',
    updatedAt: '2024-12-09T10:00:00.000Z'
  },
  {
    submissionId: 71,
    submissionName: 'Bugna Woreda - 2024 Assessment',
    unitId: 3023, // Bugna Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-21T09:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-19T08:00:00.000Z',
    updatedAt: '2024-12-21T09:00:00.000Z'
  },
  {
    submissionId: 72,
    submissionName: 'Raya Kobo Woreda - 2024 Q4 Submission',
    unitId: 3024, // Raya Kobo Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-11T15:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-12T16:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-07T08:00:00.000Z',
    updatedAt: '2024-12-12T16:00:00.000Z'
  },
  
  // Woreda submissions - South Wollo Zone
  {
    submissionId: 73,
    submissionName: 'Dessie Woreda - 2024 Assessment',
    unitId: 3030, // Dessie Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-20T11:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-18T08:00:00.000Z',
    updatedAt: '2024-12-20T11:00:00.000Z'
  },
  {
    submissionId: 74,
    submissionName: 'Kombolcha Woreda - Digital Transformation',
    unitId: 3031, // Kombolcha Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-16T12:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-17T15:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-12T08:00:00.000Z',
    updatedAt: '2024-12-17T15:00:00.000Z'
  },
  {
    submissionId: 75,
    submissionName: 'Kutaber Woreda - 2024 Annual Report',
    unitId: 3032, // Kutaber Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-12-02T10:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-05T14:00:00.000Z',
    rejectionReason: 'Incomplete information on online service platforms. Please provide detailed evidence.',
    createdAt: '2024-11-29T08:00:00.000Z',
    updatedAt: '2024-12-07T11:00:00.000Z'
  },
  {
    submissionId: 76,
    submissionName: 'Ambasel Woreda - 2024 Assessment',
    unitId: 3033, // Ambasel Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-22T10:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-20T08:00:00.000Z',
    updatedAt: '2024-12-22T10:00:00.000Z'
  },
  {
    submissionId: 77,
    submissionName: 'Tenta Woreda - 2024 Q4 Submission',
    unitId: 3034, // Tenta Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-14T13:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-15T17:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-10T08:00:00.000Z',
    updatedAt: '2024-12-15T17:00:00.000Z'
  },
  
  // Woreda submissions - East Gojjam Zone
  {
    submissionId: 78,
    submissionName: 'Debre Markos Woreda - 2024 Assessment',
    unitId: 3040, // Debre Markos Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-18T12:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-16T08:00:00.000Z',
    updatedAt: '2024-12-18T12:00:00.000Z'
  },
  {
    submissionId: 79,
    submissionName: 'Dejen Woreda - E-Government Services',
    unitId: 3041, // Dejen Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-15T14:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-16T18:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-11T08:00:00.000Z',
    updatedAt: '2024-12-16T18:00:00.000Z'
  },
  {
    submissionId: 80,
    submissionName: 'Bure Woreda - 2024 Annual Report',
    unitId: 3042, // Bure Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    submittedDate: '2024-12-04T11:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-07T15:00:00.000Z',
    rejectionReason: 'Missing documentation for digital service delivery. Please resubmit with complete evidence.',
    createdAt: '2024-12-01T08:00:00.000Z',
    updatedAt: '2024-12-09T12:00:00.000Z'
  },
  
  // Woreda submissions - West Gojjam Zone
  {
    submissionId: 81,
    submissionName: 'Finote Selam Woreda - 2024 Assessment',
    unitId: 3050, // Finote Selam Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-19T13:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-17T08:00:00.000Z',
    updatedAt: '2024-12-19T13:00:00.000Z'
  },
  {
    submissionId: 82,
    submissionName: 'Dangila Woreda - Digital Infrastructure',
    unitId: 3051, // Dangila Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    submittedDate: '2024-12-17T15:00:00.000Z',
    approverUserId: 6, // amhara_approver
    approvalDate: '2024-12-18T19:00:00.000Z',
    rejectionReason: null,
    createdAt: '2024-12-13T08:00:00.000Z',
    updatedAt: '2024-12-18T19:00:00.000Z'
  },
  {
    submissionId: 83,
    submissionName: 'Motta Woreda - 2024 Q4 Submission',
    unitId: 3052, // Motta Woreda
    assessmentYearId: 1, // 2024 Assessment
    contributorUserId: 2, // contributor1
    submissionStatus: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    submittedDate: '2024-12-21T11:00:00.000Z',
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: '2024-12-19T08:00:00.000Z',
    updatedAt: '2024-12-21T11:00:00.000Z'
  }
  
  // NOTE: The above responses are sample data. In production, ALL applicable questions for each unit type
  // must be answered before submission. The system validation ensures this. For demonstration purposes,
  // we show a subset. To see complete data, all questions from indicators applicable to each unit type
  // should have responses. For Region/City: questions 1-14, 26-28, 33-34, 42-44, 48-49, 53-54, 62-63, 64-67, 68-69, 79-80.
  // For Sub-city/Woreda: questions 15-25, 29-32, 35-37, 38-41, 45-47, 50-52, 70-75.
];

// Get all submissions
export const getAllSubmissions = () => [...submissions];

// Get submission by ID
export const getSubmissionById = (submissionId) => {
  return submissions.find(s => s.submissionId === submissionId);
};

// Get submissions by unit
export const getSubmissionsByUnit = (unitId) => {
  return submissions.filter(s => s.unitId === unitId);
};

// Get submissions by status
export const getSubmissionsByStatus = (status) => {
  return submissions.filter(s => s.submissionStatus === status);
};

// Get submissions by user (for Data Contributors)
export const getSubmissionsByUser = (userId) => {
  return submissions.filter(s => s.contributorUserId === userId);
};

// Create a new submission
export const createSubmission = (submissionData) => {
  const newSubmission = {
    submissionId: submissions.length > 0 
      ? Math.max(...submissions.map(s => s.submissionId)) + 1 
      : 1,
    unitId: submissionData.unitId,
    assessmentYearId: submissionData.assessmentYearId,
    contributorUserId: submissionData.contributorUserId,
    submissionName: submissionData.submissionName || null,
    submissionStatus: SUBMISSION_STATUS.DRAFT,
    submittedDate: null,
    approverUserId: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  submissions.push(newSubmission);
  return newSubmission;
};

// Update submission
export const updateSubmission = (submissionId, submissionData) => {
  const index = submissions.findIndex(s => s.submissionId === submissionId);
  if (index !== -1) {
    submissions[index] = {
      ...submissions[index],
      ...submissionData,
      updatedAt: new Date().toISOString()
    };
    return submissions[index];
  }
  return null;
};

// Get responses for a submission
export const getResponsesBySubmission = (submissionId) => {
  return responses.filter(r => r.submissionId === submissionId);
};

// Get response by sub-question
export const getResponseBySubQuestion = (submissionId, subQuestionId) => {
  return responses.find(r => 
    r.submissionId === submissionId && r.subQuestionId === subQuestionId
  );
};

// Create or update a response (Real-time database operation)
export const saveResponse = (responseData) => {
  const existing = responses.find(r => 
    r.submissionId === responseData.submissionId && 
    r.subQuestionId === responseData.subQuestionId
  );
  
  if (existing) {
    // Update existing response in database
    existing.responseValue = responseData.responseValue;
    existing.evidenceLink = responseData.evidenceLink || null;
    existing.evidenceFilePath = responseData.evidenceFilePath || null;
    existing.updatedAt = new Date().toISOString();
    
    // Update submission timestamp to indicate activity
    const submission = getSubmissionById(responseData.submissionId);
    if (submission) {
      submission.updatedAt = new Date().toISOString();
    }
    
    return existing;
  } else {
    // Create new response in database
    const newResponse = {
      responseId: responses.length > 0 
        ? Math.max(...responses.map(r => r.responseId)) + 1 
        : 1,
      submissionId: responseData.submissionId,
      subQuestionId: responseData.subQuestionId,
      responseValue: responseData.responseValue,
      evidenceLink: responseData.evidenceLink || null,
      evidenceFilePath: responseData.evidenceFilePath || null,
      validationStatus: VALIDATION_STATUS.PENDING,
      centralRejectionReason: null,
      generalNote: null,
      regionalApprovalStatus: null,
      regionalRejectionReason: null,
      regionalNote: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    responses.push(newResponse);
    
    // Update submission timestamp
    const submission = getSubmissionById(responseData.submissionId);
    if (submission) {
      submission.updatedAt = new Date().toISOString();
    }
    
    return newResponse;
  }
};

// Submit for approval
export const submitForApproval = (submissionId) => {
  const submission = getSubmissionById(submissionId);
  if (submission) {
    submission.submissionStatus = SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL;
    submission.submittedDate = new Date().toISOString();
    submission.updatedAt = new Date().toISOString();
    
    // Send notification to approvers
    try {
      const { notifySubmissionReceived, notifyNewSubmissionsInQueue } = require('./notifications');
      const { getUnitById, getAllUnits } = require('./administrativeUnits');
      const { getAllUsers } = require('./users');
      const { isUnitInHierarchy } = require('../utils/permissions');
      
      const unit = getUnitById(submission.unitId);
      const unitName = unit ? unit.officialUnitName : 'Unknown Unit';
      const allUsers = getAllUsers();
      const allUnits = getAllUnits();
      
      // Find approvers who can access this unit
      const approvers = allUsers.filter(user => {
        if (!['Regional Approver', 'Federal Approver', 'Initial Approver'].includes(user.role)) {
          return false;
        }
        if (!user.officialUnitId) return false;
        
        // Check if submission unit is in approver's hierarchy
        return isUnitInHierarchy(user.officialUnitId, submission.unitId, allUnits);
      });
      
      // Notify all relevant approvers
      approvers.forEach(approver => {
        notifySubmissionReceived(submissionId, approver.userId, unitName);
      });
      
      // Also notify if there are new submissions in queue
      approvers.forEach(approver => {
        const pendingCount = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL)
          .filter(s => {
            const sUnit = getUnitById(s.unitId);
            return sUnit && isUnitInHierarchy(approver.officialUnitId, s.unitId, allUnits);
          }).length;
        if (pendingCount > 0) {
          notifyNewSubmissionsInQueue(approver.userId, pendingCount);
        }
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    
    return submission;
  }
  return null;
};

// Regional Approver per-question approval actions (does NOT auto-submit)
export const approveResponseByRegionalApprover = (responseId, approverUserId, note = null) => {
  const response = responses.find(r => r.responseId === responseId);
  if (response) {
    response.regionalApprovalStatus = VALIDATION_STATUS.APPROVED;
    response.regionalRejectionReason = null;
    response.regionalNote = note;
    response.updatedAt = new Date().toISOString();
    
    return response;
  }
  return null;
};

// Regional Approver per-question rejection (does NOT auto-submit)
export const rejectResponseByRegionalApprover = (responseId, approverUserId, rejectionReason) => {
  const response = responses.find(r => r.responseId === responseId);
  if (response) {
    response.regionalApprovalStatus = VALIDATION_STATUS.REJECTED;
    response.regionalRejectionReason = rejectionReason;
    response.updatedAt = new Date().toISOString();
    
    return response;
  }
  return null;
};

// Submit regional approval - sends to central or back to contributor
export const submitRegionalApproval = (submissionId, approverUserId) => {
  const submission = getSubmissionById(submissionId);
  if (!submission) return null;
  
  const submissionResponses = getResponsesBySubmission(submissionId);
  const allResponses = submissionResponses.filter(r => r.responseValue !== null && r.responseValue !== undefined);
  const reviewedResponses = allResponses.filter(r => r.regionalApprovalStatus !== null);
  
  // Check if all questions have been reviewed
  if (reviewedResponses.length !== allResponses.length) {
    throw new Error('Please review all questions before submitting approval.');
  }
  
  // Check if any response is rejected
  const hasRejections = reviewedResponses.some(r => r.regionalApprovalStatus === VALIDATION_STATUS.REJECTED);
  
  if (hasRejections) {
    // If any response is rejected, send submission back to contributor
    submission.submissionStatus = SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER;
    submission.approverUserId = approverUserId;
    submission.approvalDate = new Date().toISOString();
    
    // Collect all rejection reasons
    const rejectedResponses = reviewedResponses.filter(r => 
      r.regionalApprovalStatus === VALIDATION_STATUS.REJECTED && r.regionalRejectionReason
    );
    
    if (rejectedResponses.length > 0) {
      let rejectionText = 'Regional Approver Rejection Reasons:\n\n';
      rejectedResponses.forEach((resp, index) => {
        const subQ = getSubQuestionById(resp.subQuestionId);
        rejectionText += `${index + 1}. Question: ${subQ?.subQuestionText || `ID: ${resp.subQuestionId}`}\n`;
        rejectionText += `   Reason: ${resp.regionalRejectionReason}\n\n`;
      });
      submission.rejectionReason = rejectionText;
    }
    
    submission.updatedAt = new Date().toISOString();
    
    // Send notification to contributor
    try {
      const { notifySubmissionRejectedByApprover } = require('./notifications');
      const { getUnitById } = require('./administrativeUnits');
      const unit = getUnitById(submission.unitId);
      const unitName = unit ? unit.officialUnitName : 'Unknown Unit';
      notifySubmissionRejectedByApprover(submissionId, submission.contributorUserId, unitName, submission.rejectionReason);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  } else {
    // All responses approved - send to Central Committee
    submission.submissionStatus = SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION;
    submission.approverUserId = approverUserId;
    submission.approvalDate = new Date().toISOString();
    submission.rejectionReason = null;
    submission.updatedAt = new Date().toISOString();
    
    // Reset central validation status for fresh review
    submissionResponses.forEach(r => {
      r.validationStatus = VALIDATION_STATUS.PENDING;
      r.centralRejectionReason = null;
      r.generalNote = null;
    });
    
    // Send notification to contributor
    try {
      const { notifySubmissionApproved } = require('./notifications');
      const { getUnitById } = require('./administrativeUnits');
      const { getUserById } = require('./users');
      const unit = getUnitById(submission.unitId);
      const unitName = unit ? unit.officialUnitName : 'Unknown Unit';
      const approver = getUserById(approverUserId);
      const approverName = approver ? (approver.fullName || approver.username) : 'Regional Approver';
      notifySubmissionApproved(submissionId, submission.contributorUserId, unitName, approverName);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
  
  return submission;
};

// Legacy functions for backward compatibility (now use per-question approval)
export const approveByInitialApprover = (submissionId, approverUserId) => {
  const submission = getSubmissionById(submissionId);
  if (submission) {
    submission.submissionStatus = SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION;
    submission.approverUserId = approverUserId;
    submission.approvalDate = new Date().toISOString();
    submission.rejectionReason = null;
    submission.updatedAt = new Date().toISOString();
    return submission;
  }
  return null;
};

export const rejectByInitialApprover = (submissionId, approverUserId, rejectionReason) => {
  const submission = getSubmissionById(submissionId);
  if (submission) {
    submission.submissionStatus = SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER;
    submission.approverUserId = approverUserId;
    submission.approvalDate = new Date().toISOString();
    submission.rejectionReason = rejectionReason;
    submission.updatedAt = new Date().toISOString();
    return submission;
  }
  return null;
};

// Central Validation actions (does NOT auto-submit)
export const validateResponse = (responseId, validationStatus, rejectionReason = null, generalNote = null) => {
  const response = responses.find(r => r.responseId === responseId);
  if (response) {
    response.validationStatus = validationStatus;
    response.centralRejectionReason = rejectionReason;
    response.generalNote = generalNote;
    response.updatedAt = new Date().toISOString();
    
    return response;
  }
  return null;
};

// Submit central validation - sends to calculation or back to regional approver
export const submitCentralValidation = (submissionId, validatorUserId) => {
  const submission = getSubmissionById(submissionId);
  if (!submission) return null;
  
  // Dynamically import to avoid circular dependency
  const { getSubQuestionById } = require('./assessmentFramework');
  
  const submissionResponses = getResponsesBySubmission(submissionId);
  const allResponses = submissionResponses.filter(r => r.responseValue !== null && r.responseValue !== undefined);
  const reviewedResponses = allResponses.filter(r => r.validationStatus !== VALIDATION_STATUS.PENDING);
  
  // Check if all questions have been reviewed
  if (reviewedResponses.length !== allResponses.length) {
    throw new Error('Please review and validate all questions before submitting.');
  }
  
  // Check if any response is rejected
  const anyRejected = reviewedResponses.some(r => r.validationStatus === VALIDATION_STATUS.REJECTED);
  
  if (anyRejected) {
    // If any response is rejected, mark submission as rejected and send back to Regional Approver
    submission.submissionStatus = SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE;
    // Reset regional approval status so regional approver can review again
    submissionResponses.forEach(r => {
      if (r.validationStatus === VALIDATION_STATUS.REJECTED) {
        r.regionalApprovalStatus = null;
        r.regionalRejectionReason = null;
      }
    });
    // Collect all rejection reasons
    const rejectedResponses = reviewedResponses.filter(r => 
      r.validationStatus === VALIDATION_STATUS.REJECTED && r.centralRejectionReason
    );
    if (rejectedResponses.length > 0) {
      let rejectionText = 'Central Committee Rejection Reasons:\n\n';
      rejectedResponses.forEach((resp, index) => {
        const subQ = getSubQuestionById(resp.subQuestionId);
        rejectionText += `${index + 1}. Question: ${subQ?.subQuestionText || `ID: ${resp.subQuestionId}`}\n`;
        rejectionText += `   Reason: ${resp.centralRejectionReason}\n\n`;
      });
      submission.rejectionReason = rejectionText;
    }
    submission.updatedAt = new Date().toISOString();
    
    // Send notification to regional approver
    try {
      const { notifySubmissionRejectedByCentralCommittee } = require('./notifications');
      const { getUnitById } = require('./administrativeUnits');
      const unit = getUnitById(submission.unitId);
      const unitName = unit ? unit.officialUnitName : 'Unknown Unit';
      if (submission.approverUserId) {
        notifySubmissionRejectedByCentralCommittee(submissionId, submission.approverUserId, unitName, submission.rejectionReason);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  } else {
    // If all responses are approved, mark submission as validated (goes to calculation)
    submission.submissionStatus = SUBMISSION_STATUS.VALIDATED;
    submission.updatedAt = new Date().toISOString();
    
    // Send notification to regional approver
    try {
      const { notifySubmissionValidated } = require('./notifications');
      const { getUnitById } = require('./administrativeUnits');
      const unit = getUnitById(submission.unitId);
      const unitName = unit ? unit.officialUnitName : 'Unknown Unit';
      if (submission.approverUserId) {
        notifySubmissionValidated(submissionId, submission.approverUserId, unitName);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
  
  return submission;
};

// Resubmit after rejection
export const resubmitToCentralCommittee = (submissionId) => {
  const submission = getSubmissionById(submissionId);
  if (submission) {
    submission.submissionStatus = SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION;
    submission.updatedAt = new Date().toISOString();
    // Reset validation status for all responses
    const submissionResponses = getResponsesBySubmission(submissionId);
    submissionResponses.forEach(r => {
      r.validationStatus = VALIDATION_STATUS.PENDING;
      r.centralRejectionReason = null;
    });
    return submission;
  }
  return null;
};

// Reject to contributor
export const rejectToContributor = (submissionId, additionalComment) => {
  const submission = getSubmissionById(submissionId);
  if (submission) {
    submission.submissionStatus = SUBMISSION_STATUS.DRAFT;
    
    // Collect all Central Committee rejection reasons
    const submissionResponses = getResponsesBySubmission(submissionId);
    const rejectedResponses = submissionResponses.filter(r => 
      r.validationStatus === 'Rejected' && r.centralRejectionReason
    );
    
    let rejectionText = '';
    if (submission.rejectionReason) {
      rejectionText = submission.rejectionReason;
    }
    
    // Add Central Committee rejection reasons
    if (rejectedResponses.length > 0) {
      rejectionText += (rejectionText ? '\n\n' : '') + 'Central Committee Rejection Reasons:\n';
      rejectedResponses.forEach((response, index) => {
        rejectionText += `\n${index + 1}. ${response.centralRejectionReason}`;
      });
    }
    
    // Add additional comments from Initial Approver
    if (additionalComment) {
      rejectionText += (rejectionText ? '\n\n' : '') + 'Additional Comments from Approver: ' + additionalComment;
    }
    
    submission.rejectionReason = rejectionText;
    submission.updatedAt = new Date().toISOString();
    
    // Send notification to contributor
    try {
      const { notifySubmissionRejectedByApprover } = require('./notifications');
      const { getUnitById } = require('./administrativeUnits');
      const unit = getUnitById(submission.unitId);
      const unitName = unit ? unit.officialUnitName : 'Unknown Unit';
      notifySubmissionRejectedByApprover(submissionId, submission.contributorUserId, unitName, rejectionText);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    
    return submission;
  }
  return null;
};


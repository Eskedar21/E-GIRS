import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import {
  getAllAssessmentYears,
  getActiveAssessmentYears,
  getAssessmentYearById,
  getDimensionsByYear,
  getIndicatorsByDimension,
  getSubQuestionsByIndicator,
  getSubQuestionsInTreeOrder,
  RESPONSE_TYPES
} from '../../data/assessmentFramework';
import { getAllUnits, getUnitById } from '../../data/administrativeUnits';
import { canPerformAction } from '../../utils/permissions';
import {
  createSubmission,
  getSubmissionById,
  getSubmissionsByUnit,
  getResponsesBySubmission,
  saveResponse,
  submitForApproval,
  updateSubmission,
  SUBMISSION_STATUS
} from '../../data/submissions';
import { getSubQuestionById } from '../../data/assessmentFramework';

export default function DataSubmission() {
  const { user } = useAuth();
  const { isCollapsed, setCollapsed } = useSidebar();
  const router = useRouter();
  
  // All hooks must be called unconditionally at the top level
  const [assessmentYears, setAssessmentYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [dimensions, setDimensions] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [subQuestions, setSubQuestions] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [responses, setResponses] = useState({});
  const [evidenceLinks, setEvidenceLinks] = useState({});
  const [submissionName, setSubmissionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  const [incompleteDimensionIds, setIncompleteDimensionIds] = useState(new Set());

  // Memoize loadSubmission to avoid infinite loops - must be defined before conditional returns
  const loadSubmission = useCallback(() => {
    if (!user || !user.officialUnitId) return;
    
    // Check if there's a submissionId in the query parameters (for backward compatibility)
    const submissionIdParam = router.query.submissionId;
    
    if (submissionIdParam) {
      // Load specific submission by ID
      const specificSubmission = getSubmissionById(parseInt(submissionIdParam));
      
      if (specificSubmission) {
        // Verify user owns this submission
        if (specificSubmission.contributorUserId !== user.userId) {
          alert('You do not have permission to access this submission.');
          router.replace('/data/submission');
          return;
        }
        
        // Set the year for this submission (by id so it works even if year is no longer Active)
        const submissionYear = getAssessmentYearById(specificSubmission.assessmentYearId);
        if (submissionYear) {
          setSelectedYear(submissionYear);
        }
        
        setSubmission(specificSubmission);
        setSubmissionName(specificSubmission.submissionName || '');
        
        // Load existing responses
        const existingResponses = getResponsesBySubmission(specificSubmission.submissionId);
        const responseMap = {};
        const evidenceMap = {};
        existingResponses.forEach(r => {
          responseMap[r.subQuestionId] = r.responseValue;
          if (r.evidenceLink) {
            evidenceMap[r.subQuestionId] = r.evidenceLink;
          }
        });
        setResponses(responseMap);
        setEvidenceLinks(evidenceMap);
        return;
      } else {
        // Submission not found, clear query param and continue with auto-load logic
        router.replace('/data/submission', undefined, { shallow: true });
      }
    }
    
    // Auto-load submission for selected year if no specific submissionId in query
    if (!selectedYear) {
      // Clear form when no year is selected
      setSubmission(null);
      setSubmissionName('');
      setResponses({});
      setEvidenceLinks({});
      return;
    }
    
    // Find existing submission for this year and user
    const allSubmissions = getSubmissionsByUnit(user.officialUnitId);
    let existingSubmission = allSubmissions.find(s => 
      s.assessmentYearId === selectedYear.assessmentYearId &&
      s.contributorUserId === user.userId
    );
    
    if (existingSubmission) {
      // Load existing submission (real status, no demo rotation)
      setSubmission(existingSubmission);
      setSubmissionName(existingSubmission.submissionName || '');
      
      // Load existing responses
      const existingResponses = getResponsesBySubmission(existingSubmission.submissionId);
      const responseMap = {};
      const evidenceMap = {};
      existingResponses.forEach(r => {
        responseMap[r.subQuestionId] = r.responseValue;
        if (r.evidenceLink) {
          evidenceMap[r.subQuestionId] = r.evidenceLink;
        }
      });
      setResponses(responseMap);
      setEvidenceLinks(evidenceMap);
    } else {
      // No existing submission - start with clean form
      setSubmission(null);
      setSubmissionName('');
      setResponses({});
      setEvidenceLinks({});
    }
  }, [selectedYear, user, router]);

  useEffect(() => {
    // Only Active assessment years for data contributors
    const years = getActiveAssessmentYears();
    setAssessmentYears(years);

    // Check if year is passed in query params (must be Active to appear in list)
    const yearParam = router.query.year;
    if (yearParam) {
      const year = years.find(y => y.assessmentYearId === parseInt(yearParam));
      if (year) {
        setSelectedYear(year);
        return;
      }
    }

    // Auto-select first active year if no year is selected and no specific submission in query
    const submissionIdParam = router.query.submissionId;
    if (!selectedYear && !submissionIdParam && years.length > 0) {
      setSelectedYear(years[0]);
    }
  }, [router.query.submissionId, router.query.year]);

  // Listen for assessment framework updates
  useEffect(() => {
    const handleFrameworkUpdate = () => {
      const years = getActiveAssessmentYears();
      setAssessmentYears(years);

      if (selectedYear) {
        const updatedYear = years.find(y => y.assessmentYearId === selectedYear.assessmentYearId);
        if (updatedYear) {
          setSelectedYear(updatedYear);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('assessmentFrameworkUpdated', handleFrameworkUpdate);
      return () => {
        window.removeEventListener('assessmentFrameworkUpdated', handleFrameworkUpdate);
      };
    }
  }, [selectedYear]);

  // Listen for submission updates (e.g. approver rejected/approved) so submitter sees current status and rejection reasons
  useEffect(() => {
    const handleSubmissionUpdate = (e) => {
      const updatedId = e?.detail?.submissionId;
      if (!updatedId || !submission || submission.submissionId !== updatedId) return;
      const updated = getSubmissionById(updatedId);
      if (!updated) return;
      setSubmission(updated);
      const existingResponses = getResponsesBySubmission(updatedId);
      const responseMap = {};
      const evidenceMap = {};
      existingResponses.forEach(r => {
        responseMap[r.subQuestionId] = r.responseValue;
        if (r.evidenceLink) evidenceMap[r.subQuestionId] = r.evidenceLink;
      });
      setResponses(responseMap);
      setEvidenceLinks(evidenceMap);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('submissionUpdated', handleSubmissionUpdate);
      return () => window.removeEventListener('submissionUpdated', handleSubmissionUpdate);
    }
  }, [submission?.submissionId]);

  // Load submission when query param or selectedYear changes
  useEffect(() => {
    if (user && (router.query.submissionId || selectedYear)) {
      loadSubmission();
    }
  }, [router.query.submissionId, selectedYear, user, loadSubmission]);

  useEffect(() => {
    if (selectedYear && user?.unitType) {
      try {
        const yearDimensions = getDimensionsByYear(selectedYear.assessmentYearId);
        if (!yearDimensions || yearDimensions.length === 0) {
          setDimensions([]);
          setIndicators([]);
          setSubQuestions([]);
          return;
        }
        
        setDimensions(yearDimensions);
        
        // Load all indicators and sub-questions for this year
        const allIndicators = [];
        const allSubQuestions = [];
        
        yearDimensions.forEach(dim => {
          const dimIndicators = getIndicatorsByDimension(dim.dimensionId);
          // Map unit type to applicable unit types
          // Federal Institute and City Administration use Region indicators, Sub-city uses Woreda indicators
          const getApplicableUnitTypes = (ut) => {
            if (!ut) return [];
            if (ut === 'Federal Institute') return ['Region'];
            if (ut === 'City Administration') return ['Region'];
            if (ut === 'Sub-city') return ['Woreda'];
            return [ut];
          };
          const applicableUnitTypes = getApplicableUnitTypes(user?.unitType);
          // Filter indicators by applicable unit type
          const applicableIndicators = dimIndicators.filter(ind => 
            applicableUnitTypes.includes(ind.applicableUnitType)
          );
          allIndicators.push(...applicableIndicators);
          
          applicableIndicators.forEach(ind => {
            const sqs = getSubQuestionsByIndicator(ind.indicatorId);
            if (sqs && sqs.length > 0) {
              allSubQuestions.push(...sqs);
            }
          });
        });
        
        setIndicators(allIndicators);
        setSubQuestions(allSubQuestions);
        
        // Submission loading is handled by the separate effect that watches router.query.submissionId and selectedYear
      } catch (error) {
        console.error('Error loading assessment framework:', error);
        setSuccessMessage('Error loading assessment framework. Please refresh the page.');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } else if (selectedYear && !user?.unitType) {
      setDimensions([]);
      setIndicators([]);
      setSubQuestions([]);
    }
  }, [selectedYear, user, loadSubmission, router.query.submissionId]);

  // Group sub-questions by dimension and indicator (tree order: parent then nested children)
  const groupedQuestions = useMemo(() => {
    return dimensions.map(dimension => {
      const dimIndicators = indicators.filter(ind => ind.dimensionId === dimension.dimensionId);
      return {
        dimension,
        indicators: dimIndicators.map(indicator => ({
          indicator,
          subQuestions: getSubQuestionsInTreeOrder(indicator.indicatorId)
        }))
      };
    }).filter(group => group.indicators.length > 0);
  }, [dimensions, indicators, subQuestions]);

  // Update active section when dimension index changes
  useEffect(() => {
    if (groupedQuestions.length > 0 && currentDimensionIndex >= 0 && currentDimensionIndex < groupedQuestions.length) {
      const dimension = groupedQuestions[currentDimensionIndex].dimension;
      setActiveSection(dimension.dimensionId);
    }
  }, [currentDimensionIndex, groupedQuestions]);

  // Reset to first dimension when year or questions change
  useEffect(() => {
    if (groupedQuestions.length > 0) {
      setCurrentDimensionIndex(0);
    }
  }, [selectedYear?.assessmentYearId, groupedQuestions]);

  // Clear incomplete dimension flags when all questions are answered (evidence link is optional)
  const totalAnsweredQuestionsForEffect = subQuestions.filter(sq => {
    const response = responses[sq.subQuestionId];
    const hasAnswer = response && response !== '' && response.trim() !== '';
    return hasAnswer;
  }).length;
  useEffect(() => {
    if (subQuestions.length > 0 && totalAnsweredQuestionsForEffect === subQuestions.length) {
      setIncompleteDimensionIds(new Set());
    }
  }, [subQuestions.length, totalAnsweredQuestionsForEffect]);
  
  // Early return if no user - ProtectedRoute will handle redirect
  if (!user) {
    return (
      <ProtectedRoute allowedRoles={['Data Contributor', 'Institute Data Contributor']}>
        <div></div>
      </ProtectedRoute>
    );
  }
  
  const currentUser = {
    userId: user.userId,
    unitId: user.officialUnitId,
    unitType: user.unitType,
    role: user.role
  };
  const userRole = user.role;

  // Check if user has unit assigned
  if (!user.officialUnitId) {
    return (
      <ProtectedRoute allowedRoles={['Data Contributor', 'Institute Data Contributor']}>
        <Layout title="Data Submission">
          <div className="flex">
            <Sidebar />
            <main className={`flex-grow p-8 bg-white text-mint-dark-text min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
              <div className="w-full">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold">No Unit Assigned</p>
                  <p className="text-sm mt-1">Your account is not assigned to an administrative unit. Please contact your administrator.</p>
                </div>
              </div>
            </main>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const currentUnit = getUnitById(currentUser.unitId);

  const handleResponseChange = (subQuestionId, value) => {
    setResponses(prev => ({
      ...prev,
      [subQuestionId]: value
    }));
    
    // Create submission if it doesn't exist yet (first interaction)
    let currentSubmission = submission;
    if (!currentSubmission && selectedYear && user) {
      const unitId = user.officialUnitId;
      const userId = user.userId;
      
      if (canPerformAction(user, 'submit_data')) {
        currentSubmission = createSubmission({
          unitId: unitId,
          assessmentYearId: selectedYear.assessmentYearId,
          contributorUserId: userId,
          submissionName: submissionName || null
        });
        setSubmission(currentSubmission);
      }
    }
    
    // Auto-save to database in real-time
    if (currentSubmission) {
      const evidenceLink = evidenceLinks[subQuestionId] || null;
      saveResponse({
        submissionId: currentSubmission.submissionId,
        subQuestionId: subQuestionId,
        responseValue: value,
        evidenceLink: evidenceLink
      });
      
      // Trigger real-time update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('submissionUpdated', {
          detail: { submissionId: currentSubmission.submissionId }
        }));
      }
    }
  };

  const handleEvidenceChange = (subQuestionId, link) => {
    setEvidenceLinks(prev => ({
      ...prev,
      [subQuestionId]: link
    }));
    
    // Create submission if it doesn't exist yet (first interaction)
    let currentSubmission = submission;
    if (!currentSubmission && selectedYear && user) {
      const unitId = user.officialUnitId;
      const userId = user.userId;
      
      if (canPerformAction(user, 'submit_data')) {
        currentSubmission = createSubmission({
          unitId: unitId,
          assessmentYearId: selectedYear.assessmentYearId,
          contributorUserId: userId,
          submissionName: submissionName || null
        });
        setSubmission(currentSubmission);
      }
    }
    
    // Auto-save to database in real-time
    if (currentSubmission) {
      const responseValue = responses[subQuestionId] || '';
      saveResponse({
        submissionId: currentSubmission.submissionId,
        subQuestionId: subQuestionId,
        responseValue: responseValue,
        evidenceLink: link
      });
      
      // Trigger real-time update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('submissionUpdated', {
          detail: { submissionId: currentSubmission.submissionId }
        }));
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedYear || !user || !user.officialUnitId) {
      setErrorMessage('Please select an assessment year first.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Create submission if it doesn't exist
      let currentSubmission = submission;
      if (!currentSubmission) {
        if (canPerformAction(user, 'submit_data')) {
          currentSubmission = createSubmission({
            unitId: user.officialUnitId,
            assessmentYearId: selectedYear.assessmentYearId,
            contributorUserId: user.userId,
            submissionName: submissionName || null
          });
          setSubmission(currentSubmission);
        } else {
          setErrorMessage('You do not have permission to create submissions.');
          setTimeout(() => setErrorMessage(''), 5000);
          setIsSaving(false);
          return;
        }
      }
      
      // Save all responses (including empty ones to clear previous answers)
      if (subQuestions && subQuestions.length > 0) {
        subQuestions.forEach(sq => {
          saveResponse({
            submissionId: currentSubmission.submissionId,
            subQuestionId: sq.subQuestionId,
            responseValue: responses[sq.subQuestionId] || '',
            evidenceLink: evidenceLinks[sq.subQuestionId] || null
          });
        });
      } else {
        // Fallback: save any responses that exist
        Object.keys(responses).forEach(subQuestionId => {
          saveResponse({
            submissionId: currentSubmission.submissionId,
            subQuestionId: parseInt(subQuestionId),
            responseValue: responses[subQuestionId] || '',
            evidenceLink: evidenceLinks[subQuestionId] || null
          });
        });
        
        // Also save any evidence links that don't have responses yet
        Object.keys(evidenceLinks).forEach(subQuestionId => {
          if (!responses[subQuestionId] && evidenceLinks[subQuestionId]) {
            saveResponse({
              submissionId: currentSubmission.submissionId,
              subQuestionId: parseInt(subQuestionId),
              responseValue: '',
              evidenceLink: evidenceLinks[subQuestionId]
            });
          }
        });
      }
      
      // Update submission name if provided
      if (submissionName && submissionName.trim()) {
        updateSubmission(currentSubmission.submissionId, { submissionName: submissionName.trim() });
      }
      
      // Reload submission to get updated state
      const updatedSubmission = getSubmissionById(currentSubmission.submissionId);
      if (updatedSubmission) {
        setSubmission(updatedSubmission);
      }
      
      setSuccessMessage('✅ Draft saved successfully! Your progress has been saved. You can continue editing and submit when ready.');
      setTimeout(() => setSuccessMessage(''), 7000);
    } catch (error) {
      setErrorMessage('❌ Error saving draft. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForApproval = () => {
    if (!selectedYear || !user || !user.officialUnitId) {
      setErrorMessage('Please select an assessment year first.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    if (!subQuestions || subQuestions.length === 0) {
      setErrorMessage('Please wait for the form to load completely before submitting.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    // Create submission if it doesn't exist
    let currentSubmission = submission;
    if (!currentSubmission) {
      if (canPerformAction(user, 'submit_data')) {
        currentSubmission = createSubmission({
          unitId: user.officialUnitId,
          assessmentYearId: selectedYear.assessmentYearId,
          contributorUserId: user.userId,
          submissionName: submissionName || null
        });
        setSubmission(currentSubmission);
      } else {
        setErrorMessage('You do not have permission to create submissions.');
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }
    }
    
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validate that all required questions are answered (evidence link is optional)
    const unanswered = subQuestions.filter(sq => {
      const response = responses[sq.subQuestionId];
      const hasAnswer = response && response !== '' && response.trim() !== '';
      return !hasAnswer;
    });
    
    if (unanswered.length > 0) {
      // Flag dimensions that contain unanswered questions
      const dimensionIdsWithUnanswered = [...new Set(
        unanswered
          .map(sq => {
            const ind = indicators.find(i => i.indicatorId === sq.parentIndicatorId);
            return ind ? ind.dimensionId : null;
          })
          .filter(Boolean)
      )];
      setIncompleteDimensionIds(new Set(dimensionIdsWithUnanswered));
      // Show clear error message - do not allow submission
      setErrorMessage(
        `⚠️ Cannot submit: You have ${unanswered.length} incomplete question(s) out of ${subQuestions.length} total. ` +
        `Please ensure ALL questions have an answer selected before submitting. ` +
        `Dimensions with missing answers are flagged in the list on the left.`
      );
      // Scroll to first unanswered question
      if (unanswered.length > 0 && dimensions.length > 0) {
        const firstUnanswered = unanswered[0];
        const firstUnansweredSubQ = subQuestions.find(sq => sq.subQuestionId === firstUnanswered.subQuestionId);
        if (firstUnansweredSubQ) {
          const relatedIndicator = indicators.find(ind => ind.indicatorId === firstUnansweredSubQ.parentIndicatorId);
          if (relatedIndicator) {
            const relatedDimension = dimensions.find(d => d.dimensionId === relatedIndicator.dimensionId);
            if (relatedDimension) {
              const element = document.getElementById(`dimension-${relatedDimension.dimensionId}`);
              if (element) {
                setTimeout(() => {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }
          }
        }
      }
      return;
    }
    
    // All required fields are filled - show confirmation modal
    setShowSubmitModal(true);
  };

  const confirmSubmitForApproval = async () => {
    setShowSubmitModal(false);
    
    try {
      setIsSaving(true);
      
      if (!selectedYear || !user || !user.officialUnitId) {
        setErrorMessage('Please select an assessment year first.');
        setIsSaving(false);
        return;
      }
      
      // Create submission if it doesn't exist
      let currentSubmission = submission;
      if (!currentSubmission) {
        if (canPerformAction(user, 'submit_data')) {
          currentSubmission = createSubmission({
            unitId: user.officialUnitId,
            assessmentYearId: selectedYear.assessmentYearId,
            contributorUserId: user.userId,
            submissionName: submissionName || null
          });
          setSubmission(currentSubmission);
        } else {
          setErrorMessage('You do not have permission to create submissions.');
          setIsSaving(false);
          return;
        }
      }
      
      // Final validation - ensure ALL required questions are answered (evidence link is optional)
      const unanswered = subQuestions.filter(sq => {
        const response = responses[sq.subQuestionId];
        const hasAnswer = response && response !== '' && response.trim() !== '';
        return !hasAnswer;
      });
      
      if (unanswered.length > 0) {
        setErrorMessage(
          `⚠️ Cannot submit: You have ${unanswered.length} incomplete question(s). ` +
          `Please ensure ALL questions have an answer selected before submitting.`
        );
        setIsSaving(false);
        return;
      }
      
      // Save all responses first
      subQuestions.forEach(sq => {
        saveResponse({
          submissionId: currentSubmission.submissionId,
          subQuestionId: sq.subQuestionId,
          responseValue: responses[sq.subQuestionId] || '',
          evidenceLink: evidenceLinks[sq.subQuestionId] || null
        });
      });
      
      // Update submission name if provided
      if (submissionName && submissionName.trim()) {
        updateSubmission(currentSubmission.submissionId, { submissionName: submissionName.trim() });
      }
      
      // Submit for approval - this changes status to PENDING_INITIAL_APPROVAL
      submitForApproval(currentSubmission.submissionId);
      
      // Trigger real-time update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('submissionUpdated', {
          detail: { submissionId: currentSubmission.submissionId }
        }));
      }
      
      const updatedSubmission = getSubmissionById(currentSubmission.submissionId);
      if (updatedSubmission) {
        setSubmission(updatedSubmission);
        setIncompleteDimensionIds(new Set());
        setSuccessMessage(
          '✅ Submission sent for approval successfully!\n\n' +
          'Your submission has been sent to the Regional Approver for review.\n\n' +
          'After regional approval, it will proceed to the Central Committee for final validation.\n\n' +
          'You will be notified of any changes or rejections.'
        );
        setTimeout(() => setSuccessMessage(''), 10000);
      } else {
        throw new Error('Failed to update submission status');
      }
    } catch (error) {
      setErrorMessage('❌ Error submitting for approval. Please try again or contact support if the problem persists.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuestionInput = (subQuestion) => {
    const responseValue = responses[subQuestion.subQuestionId] || '';
    const evidenceLink = evidenceLinks[subQuestion.subQuestionId] || '';
    
    // Get the response object to access comments
    const existingResponses = submission ? getResponsesBySubmission(submission.submissionId) : [];
    const responseObj = existingResponses.find(r => r.subQuestionId === subQuestion.subQuestionId);
    
    // Determine if submission is locked (read-only)
    const isReadOnly = submission && (
      submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL ||
      submission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION ||
      submission.submissionStatus === SUBMISSION_STATUS.VALIDATED ||
      submission.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE ||
      (router.query.view === 'detail' && (
        submission.submissionStatus === SUBMISSION_STATUS.VALIDATED ||
        submission.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE
      ))
    );
    
    // Check if this question was rejected
    const isRejected = responseObj && (
      (submission?.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER && 
       responseObj.regionalApprovalStatus === 'Rejected') ||
      (submission?.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE && 
       responseObj.validationStatus === 'Rejected')
    );
    
    // Get rejection reason and approver comments
    const rejectionReason = responseObj ? (
      submission?.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER 
        ? responseObj.regionalRejectionReason 
        : responseObj.centralRejectionReason
    ) : null;
    
    // Get approver comments/notes (shown for all questions in rejected submissions)
    const approverComment = responseObj ? (
      submission?.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER 
        ? (responseObj.regionalNote || responseObj.regionalRejectionReason)
        : (responseObj.generalNote || responseObj.centralRejectionReason)
    ) : null;
    
    // Show approver comments if submission is rejected and comment exists
    const showApproverComment = (submission?.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER ||
                                  submission?.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) &&
                                  approverComment;
    
    const isSubmissionLocked = isReadOnly;

    // Show rejection comments if this question was rejected
    const showRejectionComment = isRejected && rejectionReason;
    
    switch (subQuestion.responseType) {
      case RESPONSE_TYPES.YES_NO:
      case 'Yes/No': // Fallback for backward compatibility
        return (
          <div className="space-y-4">
            {/* Show approver comment for rejected submissions */}
            {showApproverComment && (
              <div className={`p-4 border-2 rounded-lg ${isRejected ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start space-x-2">
                  <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isRejected ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-1 ${isRejected ? 'text-red-800' : 'text-blue-800'}`}>
                      {isRejected ? 'Rejection Reason:' : 'Approver Comment:'}
                    </p>
                    <p className={`text-sm whitespace-pre-wrap ${isRejected ? 'text-red-700' : 'text-blue-700'}`}>{approverComment}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show rejection comment if rejected (legacy support) */}
            {showRejectionComment && !showApproverComment && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-sm text-red-700 whitespace-pre-wrap">{rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show current answer if read-only */}
            {isReadOnly && responseValue && (
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-1">Current Answer:</p>
                <p className="text-sm text-gray-900">{responseValue}</p>
              </div>
            )}
            
            {/* Editable input */}
            {!isReadOnly && (
              <>
                <div className="flex space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`sq_${subQuestion.subQuestionId}`}
                      value="Yes"
                      checked={responseValue === 'Yes'}
                      onChange={(e) => handleResponseChange(subQuestion.subQuestionId, e.target.value)}
                      className="mr-2 w-4 h-4 text-[#0d6670] focus:ring-[#0d6670] border-gray-300"
                      disabled={isSubmissionLocked}
                    />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`sq_${subQuestion.subQuestionId}`}
                      value="No"
                      checked={responseValue === 'No'}
                      onChange={(e) => handleResponseChange(subQuestion.subQuestionId, e.target.value)}
                      className="mr-2 w-4 h-4 text-[#0d6670] focus:ring-[#0d6670] border-gray-300"
                      disabled={isSubmissionLocked}
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Evidence Link
                    <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={evidenceLink}
                    onChange={(e) => handleEvidenceChange(subQuestion.subQuestionId, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white"
                    placeholder="Enter Evidence Link"
                    disabled={isSubmissionLocked}
                  />
                </div>
              </>
            )}
            
            {/* Show evidence link if read-only */}
            {isReadOnly && evidenceLink && (
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-1">Evidence Link:</p>
                <a href={evidenceLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0d6670] hover:underline">
                  {evidenceLink}
                </a>
              </div>
            )}
          </div>
        );

      case RESPONSE_TYPES.MULTIPLE_SELECT_CHECKBOX:
      case 'MultipleSelectCheckbox': // Fallback for backward compatibility
        const options = subQuestion.checkboxOptions ? subQuestion.checkboxOptions.split(',').map(o => o.trim()) : [];
        const selectedOptions = responseValue ? responseValue.split(',').map(v => v.trim()).filter(v => v) : [];
        return (
          <div className="space-y-4">
            {/* Show approver comment for rejected submissions */}
            {showApproverComment && (
              <div className={`p-4 border-2 rounded-lg ${isRejected ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start space-x-2">
                  <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isRejected ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-1 ${isRejected ? 'text-red-800' : 'text-blue-800'}`}>
                      {isRejected ? 'Rejection Reason:' : 'Approver Comment:'}
                    </p>
                    <p className={`text-sm whitespace-pre-wrap ${isRejected ? 'text-red-700' : 'text-blue-700'}`}>{approverComment}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show rejection comment if rejected (legacy support) */}
            {showRejectionComment && !showApproverComment && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-sm text-red-700 whitespace-pre-wrap">{rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show current answer if read-only */}
            {isReadOnly && selectedOptions.length > 0 && (
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-1">Current Answer:</p>
                <p className="text-sm text-gray-900">{selectedOptions.join(', ')}</p>
              </div>
            )}
            
            {/* Editable input */}
            {!isReadOnly && (
              <>
                <div className="space-y-2 p-4 bg-white rounded-lg border border-gray-200">
                  {options.map((option, idx) => (
                    <label key={idx} className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...selectedOptions, option]
                            : selectedOptions.filter(v => v !== option);
                          handleResponseChange(subQuestion.subQuestionId, updated.join(', '));
                        }}
                        className="mr-3 w-4 h-4 text-[#0d6670] focus:ring-[#0d6670] border-gray-300 rounded"
                        disabled={isSubmissionLocked}
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Evidence Link
                    <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={evidenceLink}
                    onChange={(e) => handleEvidenceChange(subQuestion.subQuestionId, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white"
                    placeholder="Enter Evidence Link"
                    disabled={isSubmissionLocked}
                  />
                </div>
              </>
            )}
            
            {/* Show evidence link if read-only */}
            {isReadOnly && evidenceLink && (
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-1">Evidence Link:</p>
                <a href={evidenceLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0d6670] hover:underline">
                  {evidenceLink}
                </a>
              </div>
            )}
          </div>
        );

      case RESPONSE_TYPES.TEXT_EXPLANATION:
      case 'TextExplanation': // Fallback for backward compatibility
        return (
          <div className="space-y-4">
            {/* Show approver comment for rejected submissions */}
            {showApproverComment && (
              <div className={`p-4 border-2 rounded-lg ${isRejected ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start space-x-2">
                  <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isRejected ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-1 ${isRejected ? 'text-red-800' : 'text-blue-800'}`}>
                      {isRejected ? 'Rejection Reason:' : 'Approver Comment:'}
                    </p>
                    <p className={`text-sm whitespace-pre-wrap ${isRejected ? 'text-red-700' : 'text-blue-700'}`}>{approverComment}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show rejection comment if rejected (legacy support) */}
            {showRejectionComment && !showApproverComment && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-sm text-red-700 whitespace-pre-wrap">{rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show current answer if read-only */}
            {isReadOnly && responseValue && (
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-1">Current Answer:</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{responseValue}</p>
              </div>
            )}
            
            {/* Editable input */}
            {!isReadOnly && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Explanation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={responseValue}
                    onChange={(e) => handleResponseChange(subQuestion.subQuestionId, e.target.value)}
                    rows="6"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white resize-y"
                    placeholder="Enter your explanation..."
                    disabled={isSubmissionLocked}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Evidence Link
                    <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={evidenceLink}
                    onChange={(e) => handleEvidenceChange(subQuestion.subQuestionId, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white"
                    placeholder="Enter Evidence Link"
                    disabled={isSubmissionLocked}
                  />
                </div>
              </>
            )}
            
            {/* Show evidence link if read-only */}
            {isReadOnly && evidenceLink && (
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-1">Evidence Link:</p>
                <a href={evidenceLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0d6670] hover:underline">
                  {evidenceLink}
                </a>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Calculate progress - count questions with answer (evidence link is optional)
  const totalAnsweredQuestions = subQuestions.filter(sq => {
    const response = responses[sq.subQuestionId];
    const hasAnswer = response && response !== '' && response.trim() !== '';
    return hasAnswer;
  }).length;
  const totalQuestions = subQuestions.length;
  const progressPercentage = totalQuestions > 0 ? (totalAnsweredQuestions / totalQuestions) * 100 : 0;

  // Navigate to dimension by index
  const goToDimension = (index) => {
    if (index >= 0 && index < groupedQuestions.length) {
      setCurrentDimensionIndex(index);
      const dimension = groupedQuestions[index].dimension;
      setActiveSection(dimension.dimensionId);
    }
  };

  // Navigate to next dimension
  const goToNextDimension = () => {
    if (currentDimensionIndex < groupedQuestions.length - 1) {
      goToDimension(currentDimensionIndex + 1);
    }
  };

  // Navigate to previous dimension
  const goToPreviousDimension = () => {
    if (currentDimensionIndex > 0) {
      goToDimension(currentDimensionIndex - 1);
    }
  };

  // Scroll to section when clicked (for sidebar navigation)
  const scrollToSection = (dimensionId) => {
    const index = groupedQuestions.findIndex(g => g.dimension.dimensionId === dimensionId);
    if (index !== -1) {
      goToDimension(index);
      // Ensure the dimension content is visible after state update
      setTimeout(() => {
        const dimensionElement = document.getElementById(`dimension-${dimensionId}`);
        if (dimensionElement) {
          dimensionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback: scroll to top of main content area
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Data Contributor', 'Institute Data Contributor']}>
      <Layout title="Data Submission">
        <div className="flex bg-gray-50 min-h-screen">
          <Sidebar />
          {/* Assessment Dimensions Navigation Sidebar */}
          <aside className="w-80 bg-transparent fixed top-16 bottom-0 overflow-y-auto z-40 pl-4 pr-0 left-64 transition-all duration-300">
            <div className="pl-4 pr-0 pt-8 pb-4">
              {/* Progress Header */}
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Assessment Dimensions</h2>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-[#0d6670] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {totalAnsweredQuestions} of {totalQuestions} questions answered ({Math.round(progressPercentage)}%)
                </p>
              </div>

              {/* Dimensions Navigation */}
              {selectedYear && groupedQuestions.length > 0 ? (
                <div className="space-y-1">
                  {groupedQuestions.map((group, index) => {
                    const isIncomplete = incompleteDimensionIds.has(group.dimension.dimensionId);
                    return (
                      <div key={group.dimension.dimensionId}>
                        <button
                          onClick={() => scrollToSection(group.dimension.dimensionId)}
                          className={`w-full flex items-center text-left p-2 rounded-lg transition-all ${
                            activeSection === group.dimension.dimensionId
                              ? 'bg-[#0d6670]/10 text-[#0d6670] border-l-4 border-[#0d6670]'
                              : isIncomplete
                                ? 'bg-amber-50/80 text-amber-900 border-l-4 border-amber-500 hover:bg-amber-50'
                                : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0 ${
                            activeSection === group.dimension.dimensionId
                              ? 'bg-[#0d6670] text-white'
                              : isIncomplete
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium flex-1">{group.dimension.dimensionName}</span>
                          {isIncomplete && (
                            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex-shrink-0" title="Has unanswered questions">
                              Incomplete
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Select an assessment year to view dimensions</p>
                </div>
              )}

              {/* Action Button */}
              {submission && (submission.submissionStatus === SUBMISSION_STATUS.DRAFT || 
                submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER ||
                submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) && (
                <div className="pt-4 mt-4">
                  {totalAnsweredQuestions === totalQuestions && totalQuestions > 0 ? (
                    <button
                      onClick={handleSubmitForApproval}
                      disabled={isSaving}
                      className="w-full bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? '⏳ Submitting...' : 'Submit'}
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveDraft}
                      disabled={isSaving}
                      className="w-full bg-transparent border-2 border-[#0d6670] text-[#0d6670] hover:bg-[#0d6670]/10 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? '⏳ Saving...' : 'Save as Draft'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          <main className="flex-grow pl-2 pr-8 py-8 bg-gray-50 text-gray-900 min-h-screen ml-[calc(256px+320px)] transition-all duration-300">
          <div className="w-full max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Data Submission Form
              </h1>
              <p className="text-gray-600">
                Complete the assessment form for <span className="font-semibold">{currentUnit?.officialUnitName || currentUser.unitId || 'Your Unit'}</span>. 
                Only questions applicable to your unit type ({currentUser.unitType || 'N/A'}) are displayed.
              </p>
              {/* Progress: questions answered and remaining (updates in real time as user fills answers and evidence) */}
              {subQuestions.length > 0 && (
                <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-3" aria-live="polite" aria-atomic="true">
                    <span className="text-sm font-semibold text-gray-700">
                      {totalAnsweredQuestions} of {totalQuestions} questions answered
                      {totalQuestions > 0 && (
                        <span className="text-gray-500 font-normal ml-1">
                          ({totalQuestions - totalAnsweredQuestions} remaining)
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-[#0d6670]">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-[#0d6670] h-3 rounded-full transition-[width] duration-300 ease-out"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      role="progressbar"
                      aria-valuenow={totalAnsweredQuestions}
                      aria-valuemin={0}
                      aria-valuemax={totalQuestions}
                      aria-label={`${totalAnsweredQuestions} of ${totalQuestions} questions answered`}
                    />
                  </div>
                </div>
              )}
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg whitespace-pre-line">
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg whitespace-pre-line">
                {errorMessage}
              </div>
            )}

            {/* Assessment Year Selection */}
            <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Assessment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assessment Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedYear?.assessmentYearId || ''}
                    onChange={(e) => {
                      const year = getActiveAssessmentYears().find(y => y.assessmentYearId === parseInt(e.target.value));
                      setSelectedYear(year);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white"
                    disabled={submission && submission.submissionStatus !== SUBMISSION_STATUS.DRAFT && 
                      submission.submissionStatus !== SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER &&
                      submission.submissionStatus !== SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE}
                  >
                    <option value="">Select Assessment Year</option>
                    {(
                      selectedYear && !assessmentYears.some(y => y.assessmentYearId === selectedYear.assessmentYearId)
                        ? [selectedYear, ...assessmentYears]
                        : assessmentYears
                    ).map((year) => (
                      <option key={year.assessmentYearId} value={year.assessmentYearId}>
                        {year.yearName} ({year.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Submission Name <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={submissionName}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setSubmissionName(newName);
                      
                      // Create submission if it doesn't exist yet
                      let currentSubmission = submission;
                      if (!currentSubmission && selectedYear && user) {
                        const unitId = user.officialUnitId;
                        const userId = user.userId;
                        
                        if (canPerformAction(user, 'submit_data')) {
                          currentSubmission = createSubmission({
                            unitId: unitId,
                            assessmentYearId: selectedYear.assessmentYearId,
                            contributorUserId: userId,
                            submissionName: newName || null
                          });
                          setSubmission(currentSubmission);
                        }
                      }
                      
                      // Auto-save submission name
                      if (currentSubmission) {
                        updateSubmission(currentSubmission.submissionId, { submissionName: newName });
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('submissionUpdated', {
                            detail: { submissionId: currentSubmission.submissionId }
                          }));
                        }
                      }
                    }}
                    placeholder="e.g., Q1 2024 Assessment, Annual Review 2024"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white"
                    disabled={submission && submission.submissionStatus !== SUBMISSION_STATUS.DRAFT && 
                      submission.submissionStatus !== SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER &&
                      submission.submissionStatus !== SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE}
                  />
                  <p className="text-xs text-gray-500 mt-1">Give your submission a name to easily identify it later</p>
                </div>
              </div>
            </div>

            {/* Submission Status and Action Buttons */}
            {selectedYear && (
              <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    {submission ? (
                      <>
                        <span className="text-sm font-semibold text-gray-700">Submission Status: </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          submission.submissionStatus === SUBMISSION_STATUS.DRAFT
                            ? 'bg-yellow-100 text-yellow-800'
                            : submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL
                            ? 'bg-[#0d6670]/10 text-[#0d6670]'
                            : submission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION
                            ? 'bg-orange-100 text-orange-800'
                            : submission.submissionStatus === SUBMISSION_STATUS.VALIDATED
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {submission.submissionStatus}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-gray-700">New Submission - Ready to Start</span>
                    )}
                  </div>
                  {(() => {
                    // For fresh submissions (no submission exists yet), show buttons if user can submit
                    if (!submission) {
                      const canSubmit = canPerformAction(user, 'submit_data');
                      if (canSubmit) {
                        return (
                          <div className="flex space-x-3">
                            <button
                              onClick={handleSaveDraft}
                              disabled={isSaving}
                              className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSaving ? '⏳ Saving...' : 'Save Draft'}
                            </button>
                            <button
                              onClick={handleSubmitForApproval}
                              disabled={isSaving}
                              className="px-6 py-2.5 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Submit for Approval
                            </button>
                          </div>
                        );
                      }
                      return null;
                    }
                    
                    // For existing submissions, check if editable
                    const isEditable = submission.submissionStatus === SUBMISSION_STATUS.DRAFT || 
                      submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER ||
                      submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE;
                    const isReadOnly = !isEditable && (
                      submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL ||
                      submission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION ||
                      submission.submissionStatus === SUBMISSION_STATUS.VALIDATED ||
                      submission.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE ||
                      router.query.view === 'detail'
                    );
                    
                    if (isReadOnly) {
                      return (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Read-Only View</span>
                        </div>
                      );
                    }
                    
                    // Show buttons if editable AND user has submit_data permission (for data contributors)
                    const canSubmit = canPerformAction(user, 'submit_data');
                    if (isEditable && canSubmit) {
                      return (
                        <div className="flex space-x-3">
                          <button
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? '⏳ Saving...' : 'Save Draft'}
                          </button>
                          <button
                            onClick={handleSubmitForApproval}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Submit for Approval
                          </button>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
                </div>
                {/* Rejection Reasons Display */}
                {submission && (submission.rejectionReason || submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) && (
                  <div className="mt-4 p-5 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-2">⚠️</span>
                      <h3 className="text-lg font-bold text-red-800">Submission Rejected - Action Required</h3>
                    </div>
                    
                    {submission.rejectionReason && (
                      <div className="mb-4 p-3 bg-white border border-red-200 rounded">
                        <p className="font-semibold text-red-800 mb-2">Regional Approver Rejection Reasons:</p>
                        <p className="text-sm text-red-700 whitespace-pre-line">{submission.rejectionReason}</p>
                      </div>
                    )}
                    
                    {/* Show per-question rejection reasons from Regional Approver */}
                    {submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER && (
                      <div className="mb-4">
                        <p className="font-semibold text-red-800 mb-2">Question-Specific Rejection Reasons:</p>
                        <div className="space-y-2">
                          {(() => {
                            const submissionResponses = getResponsesBySubmission(submission.submissionId);
                            const rejectedResponses = submissionResponses.filter(r => 
                              r.regionalApprovalStatus === 'Rejected' && r.regionalRejectionReason
                            );
                            
                            if (rejectedResponses.length === 0) {
                              return null;
                            }
                            
                            return rejectedResponses.map((response) => {
                              const subQuestion = subQuestions.find(sq => sq.subQuestionId === response.subQuestionId);
                              const indicator = indicators.find(ind => 
                                subQuestions.some(sq => sq.subQuestionId === response.subQuestionId && sq.parentIndicatorId === ind.indicatorId)
                              );
                              return (
                                <div key={response.responseId} className="p-3 bg-white border border-red-200 rounded mb-2">
                                  <p className="text-sm font-semibold text-red-800 mb-1">
                                    {subQuestion?.subQuestionText || `Question ID: ${response.subQuestionId}`}
                                    {indicator && (
                                      <span className="text-xs text-red-600 font-normal ml-2">
                                        ({indicator.indicatorName})
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-red-700 mt-1">{response.regionalRejectionReason}</p>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE && (
                      <div className="mb-4">
                        <p className="font-semibold text-red-800 mb-2">Central Committee Rejection Reasons:</p>
                        <div className="space-y-2">
                          {(() => {
                            const submissionResponses = getResponsesBySubmission(submission.submissionId);
                            const rejectedResponses = submissionResponses.filter(r => 
                              r.validationStatus === 'Rejected' && r.centralRejectionReason
                            );
                            
                            if (rejectedResponses.length === 0) {
                              return (
                                <p className="text-sm text-red-700 italic">
                                  The Central Committee has rejected this submission. Please review and amend your responses.
                                </p>
                              );
                            }
                            
                   return rejectedResponses.map((response) => {
                     const subQuestion = subQuestions.find(sq => sq.subQuestionId === response.subQuestionId);
                     const indicator = indicators.find(ind => 
                       subQuestions.some(sq => sq.subQuestionId === response.subQuestionId && sq.parentIndicatorId === ind.indicatorId)
                     );
                     return (
                       <div key={response.responseId} className="p-3 bg-white border border-red-200 rounded mb-2">
                         <p className="text-sm font-semibold text-red-800 mb-1">
                           {subQuestion?.subQuestionText || `Question ID: ${response.subQuestionId}`}
                           {indicator && (
                             <span className="text-xs text-red-600 font-normal ml-2">
                               ({indicator.indicatorName})
                             </span>
                           )}
                         </p>
                         <p className="text-sm text-red-700 mt-1">{response.centralRejectionReason}</p>
                       </div>
                     );
                   });
                          })()}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
                      <p className="text-sm font-semibold text-yellow-800 mb-1">📝 Next Steps:</p>
                      <p className="text-sm text-yellow-700">
                        Please review the rejection reasons above, amend your submission accordingly, and resubmit for approval.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Questions Form - Dimensions as Pages */}
            {selectedYear && groupedQuestions.length > 0 ? (
              <div className="space-y-6">
                {groupedQuestions.map(({ dimension, indicators: dimIndicators }, dimIndex) => {
                  // Only show the current dimension
                  if (dimIndex !== currentDimensionIndex) return null;
                  
                  return (
                  <div key={dimension.dimensionId} id={`dimension-${dimension.dimensionId}`} className="scroll-mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="mb-6 pb-4 border-b border-gray-200">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#0d6670] text-white flex items-center justify-center font-bold text-sm mr-3">
                          {dimIndex + 1}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {dimension.dimensionName}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-600 ml-11">
                        Dimension Weight: {dimension.dimensionWeight}%
                      </p>
                    </div>

                    {dimIndicators.map(({ indicator, subQuestions: indicatorSubQuestions }) => (
                      <div key={indicator.indicatorId} className="mb-8 pb-8 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {indicator.indicatorName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Indicator Weight: {indicator.indicatorWeight}% | Applicable to: <span className="font-semibold">{indicator.applicableUnitType}</span>
                          </p>
                        </div>

                        <div className="space-y-6">
                          {indicatorSubQuestions.map((subQuestion) => {
                            const hasResponse = responses[subQuestion.subQuestionId] && responses[subQuestion.subQuestionId] !== '';
                            const depth = subQuestion.depth ?? (subQuestion.parentSubQuestionId != null ? 2 : 1);
                            const indentClass = depth === 2 ? 'ml-6 border-l-2 border-mint-primary-blue/30' : depth === 3 ? 'ml-10 border-l-2 border-mint-primary-blue/20' : '';
                            return (
                              <div
                                key={subQuestion.subQuestionId}
                                className={`p-6 rounded-lg border border-gray-200 bg-white transition-all ${indentClass}`}
                              >
                                <div className="mb-4">
                                  <label className="block text-base font-semibold text-gray-900 mb-3">
                                    {subQuestion.subQuestionText}
                                    <span className="text-red-500 ml-1">*</span>
                                    <span className="ml-2 text-xs text-gray-500 font-normal">
                                      (Weight: {subQuestion.subWeightPercentage}%)
                                    </span>
                                    {hasResponse && (
                                      <span className="ml-2 text-xs text-[#0d6670] font-semibold">✓ Answered</span>
                                    )}
                                  </label>
                                </div>
                                {renderQuestionInput(subQuestion)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  );
                })}
                
                {/* Navigation Buttons */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-6">
                  <button
                    onClick={goToPreviousDimension}
                    disabled={currentDimensionIndex === 0}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      currentDimensionIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#0d6670] hover:bg-[#0a4f57] text-white'
                    }`}
                  >
                    ← Previous
                  </button>
                  
                  <div className="text-sm text-gray-600">
                    Dimension {currentDimensionIndex + 1} of {groupedQuestions.length}
                  </div>
                  
                  <button
                    onClick={goToNextDimension}
                    disabled={currentDimensionIndex === groupedQuestions.length - 1}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      currentDimensionIndex === groupedQuestions.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#0d6670] hover:bg-[#0a4f57] text-white'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : selectedYear ? (
              <div className="bg-white rounded-lg shadow p-6 border border-gray-300 text-center">
                <p className="text-gray-700">No questions available for your unit type in this assessment year.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 border border-gray-300 text-center">
                <p className="text-gray-700">Please select an assessment year to begin.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred Background */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowSubmitModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#0d6670]/10 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-[#0d6670]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Submit for Approval</h3>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-5">
              <div className="space-y-4 text-gray-700">
                <p className="text-base leading-relaxed">
                  Your submission will be sent to the Regional Approver for review.
                </p>
                <p className="text-base leading-relaxed">
                  After approval, it will proceed to the Central Committee for final validation.
                </p>
                <p className="text-base leading-relaxed font-semibold text-gray-900">
                  Once submitted, you will NOT be able to edit until it is returned for revision.
                </p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-5 py-2.5 bg-[#E0F2F7] hover:bg-[#B8E6F0] text-[#0d6670] font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmitForApproval}
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Submitting...' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
    </ProtectedRoute>
  );
}


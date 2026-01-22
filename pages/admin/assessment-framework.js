import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import {
  getAllAssessmentYears,
  createAssessmentYear,
  updateAssessmentYear,
  getDimensionsByYear,
  createDimension,
  updateDimension,
  deleteDimension,
  getTotalDimensionWeight,
  getIndicatorsByDimension,
  createIndicator,
  updateIndicator,
  deleteIndicator,
  getTotalIndicatorWeight,
  getSubQuestionsByIndicator,
  createSubQuestion,
  updateSubQuestion,
  deleteSubQuestion,
  getTotalSubQuestionWeight,
  ASSESSMENT_STATUS,
  RESPONSE_TYPES,
  APPLICABLE_UNIT_TYPES
} from '../../data/assessmentFramework';

export default function AssessmentFramework() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  
  const [years, setYears] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [subQuestions, setSubQuestions] = useState([]);
  
  const [showYearForm, setShowYearForm] = useState(false);
  const [showDimensionForm, setShowDimensionForm] = useState(false);
  const [showIndicatorForm, setShowIndicatorForm] = useState(false);
  const [showSubQuestionForm, setShowSubQuestionForm] = useState(false);
  
  const [editingYearId, setEditingYearId] = useState(null);
  const [editingDimensionId, setEditingDimensionId] = useState(null);
  const [editingIndicatorId, setEditingIndicatorId] = useState(null);
  const [editingSubQuestionId, setEditingSubQuestionId] = useState(null);
  
  const [yearForm, setYearForm] = useState({ yearName: '', status: ASSESSMENT_STATUS.DRAFT });
  const [dimensionForm, setDimensionForm] = useState({ dimensionName: '', dimensionWeight: '' });
  const [indicatorForm, setIndicatorForm] = useState({ indicatorName: '', indicatorWeight: '', applicableUnitType: '' });
  const [subQuestionForm, setSubQuestionForm] = useState({ 
    subQuestionText: '', 
    subWeightPercentage: '', 
    responseType: RESPONSE_TYPES.YES_NO,
    checkboxOptions: []
  });
  const [newCheckboxOption, setNewCheckboxOption] = useState('');
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    refreshData();
  }, [selectedYear, selectedDimension, selectedIndicator]);

  const refreshData = () => {
    setYears(getAllAssessmentYears());
    if (selectedYear) {
      setDimensions(getDimensionsByYear(selectedYear.assessmentYearId));
    }
    if (selectedDimension) {
      setIndicators(getIndicatorsByDimension(selectedDimension.dimensionId));
    }
    if (selectedIndicator) {
      setSubQuestions(getSubQuestionsByIndicator(selectedIndicator.indicatorId));
    }
  };

  // Assessment Year Management
  const handleYearSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!yearForm.yearName.trim()) {
      newErrors.yearName = 'Year Name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingYearId) {
      updateAssessmentYear(editingYearId, yearForm);
      setSuccessMessage('Assessment Year updated successfully!');
      setEditingYearId(null);
    } else {
      createAssessmentYear(yearForm);
      setSuccessMessage('Assessment Year created successfully!');
    }
    refreshData();
    setShowYearForm(false);
    setYearForm({ yearName: '', status: ASSESSMENT_STATUS.DRAFT });
    setTimeout(() => setSuccessMessage(''), 5000);
    // Dispatch event to notify other pages
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assessmentFrameworkUpdated'));
    }
  };

  const handleEditYear = (year) => {
    setEditingYearId(year.assessmentYearId);
    setYearForm({ yearName: year.yearName, status: year.status });
    setShowYearForm(true);
    setShowDimensionForm(false);
    setShowIndicatorForm(false);
    setShowSubQuestionForm(false);
    setEditingDimensionId(null);
    setEditingIndicatorId(null);
    setEditingSubQuestionId(null);
    setErrors({});
  };

  const handleCancelYearEdit = () => {
    setEditingYearId(null);
    setShowYearForm(false);
    setYearForm({ yearName: '', status: ASSESSMENT_STATUS.DRAFT });
    setErrors({});
  };

  const handleCreateYear = () => {
    setEditingYearId(null);
    setYearForm({ yearName: '', status: ASSESSMENT_STATUS.DRAFT });
    setShowYearForm(true);
    setErrors({});
  };

  const handleStatusChange = (yearId, newStatus) => {
    updateAssessmentYear(yearId, { status: newStatus });
    refreshData();
    setSuccessMessage('Assessment Year status updated successfully!');
    setTimeout(() => setSuccessMessage(''), 5000);
    // Dispatch event to notify other pages
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assessmentFrameworkUpdated'));
    }
  };

  // Dimension Management
  const handleDimensionSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!dimensionForm.dimensionName.trim()) {
      newErrors.dimensionName = 'Dimension Name is required';
    }
    
    if (!dimensionForm.dimensionWeight) {
      newErrors.dimensionWeight = 'Dimension Weight is required';
    } else {
      const weight = parseFloat(dimensionForm.dimensionWeight);
      if (isNaN(weight) || weight < 0 || weight > 100) {
        newErrors.dimensionWeight = 'Weight must be between 0 and 100';
      } else {
        const currentTotal = getTotalDimensionWeight(selectedYear.assessmentYearId);
        const existingDimension = editingDimensionId 
          ? dimensions.find(d => d.dimensionId === editingDimensionId)
          : null;
        const existingWeight = existingDimension ? existingDimension.dimensionWeight : 0;
        if (currentTotal - existingWeight + weight > 100) {
          newErrors.dimensionWeight = `Total weight would exceed 100. Current total: ${(currentTotal - existingWeight).toFixed(2)}%`;
        }
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingDimensionId) {
      updateDimension(editingDimensionId, {
        ...dimensionForm,
        dimensionWeight: parseFloat(dimensionForm.dimensionWeight)
      });
      setSuccessMessage('Dimension updated successfully!');
      setEditingDimensionId(null);
    } else {
      createDimension({
        ...dimensionForm,
        assessmentYearId: selectedYear.assessmentYearId,
        dimensionWeight: parseFloat(dimensionForm.dimensionWeight)
      });
      setSuccessMessage('Dimension created successfully!');
    }
    refreshData();
    setShowDimensionForm(false);
    setDimensionForm({ dimensionName: '', dimensionWeight: '' });
    setErrors({});
    setTimeout(() => setSuccessMessage(''), 5000);
    // Dispatch event to notify other pages
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assessmentFrameworkUpdated'));
    }
  };

  const handleEditDimension = (dimension) => {
    setEditingDimensionId(dimension.dimensionId);
    setDimensionForm({ 
      dimensionName: dimension.dimensionName, 
      dimensionWeight: dimension.dimensionWeight.toString() 
    });
    setShowDimensionForm(true);
    setShowIndicatorForm(false);
    setShowSubQuestionForm(false);
    setEditingIndicatorId(null);
    setEditingSubQuestionId(null);
    setErrors({});
  };

  const handleCancelDimensionEdit = () => {
    setEditingDimensionId(null);
    setShowDimensionForm(false);
    setDimensionForm({ dimensionName: '', dimensionWeight: '' });
    setErrors({});
  };

  // Indicator Management
  const handleIndicatorSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!indicatorForm.indicatorName.trim()) {
      newErrors.indicatorName = 'Indicator Name is required';
    }
    
    if (!indicatorForm.indicatorWeight) {
      newErrors.indicatorWeight = 'Indicator Weight is required';
    } else {
      const weight = parseFloat(indicatorForm.indicatorWeight);
      if (isNaN(weight) || weight < 0 || weight > 100) {
        newErrors.indicatorWeight = 'Weight must be between 0 and 100';
      } else {
        const currentTotal = getTotalIndicatorWeight(selectedDimension.dimensionId);
        const existingIndicator = editingIndicatorId 
          ? indicators.find(i => i.indicatorId === editingIndicatorId)
          : null;
        const existingWeight = existingIndicator ? existingIndicator.indicatorWeight : 0;
        if (currentTotal - existingWeight + weight > 100) {
          newErrors.indicatorWeight = `Total weight would exceed 100. Current total: ${(currentTotal - existingWeight).toFixed(2)}%`;
        }
      }
    }
    
    if (!indicatorForm.applicableUnitType) {
      newErrors.applicableUnitType = 'Applicable Unit Type is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingIndicatorId) {
      updateIndicator(editingIndicatorId, {
        ...indicatorForm,
        indicatorWeight: parseFloat(indicatorForm.indicatorWeight)
      });
      setSuccessMessage('Indicator updated successfully!');
      setEditingIndicatorId(null);
    } else {
      createIndicator({
        ...indicatorForm,
        dimensionId: selectedDimension.dimensionId,
        indicatorWeight: parseFloat(indicatorForm.indicatorWeight)
      });
      setSuccessMessage('Indicator created successfully!');
    }
    refreshData();
    setShowIndicatorForm(false);
    setIndicatorForm({ indicatorName: '', indicatorWeight: '', applicableUnitType: '' });
    setErrors({});
    setTimeout(() => setSuccessMessage(''), 5000);
    // Dispatch event to notify other pages
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assessmentFrameworkUpdated'));
    }
  };

  const handleEditIndicator = (indicator) => {
    setEditingIndicatorId(indicator.indicatorId);
    setIndicatorForm({ 
      indicatorName: indicator.indicatorName, 
      indicatorWeight: indicator.indicatorWeight.toString(),
      applicableUnitType: indicator.applicableUnitType
    });
    setShowIndicatorForm(true);
    setShowSubQuestionForm(false);
    setEditingSubQuestionId(null);
    setErrors({});
  };

  const handleCancelIndicatorEdit = () => {
    setEditingIndicatorId(null);
    setShowIndicatorForm(false);
    setIndicatorForm({ indicatorName: '', indicatorWeight: '', applicableUnitType: '' });
    setErrors({});
  };

  // Sub-Question Management
  const handleSubQuestionSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!subQuestionForm.subQuestionText.trim()) {
      newErrors.subQuestionText = 'Sub-Question Text is required';
    }
    
    if (!subQuestionForm.subWeightPercentage) {
      newErrors.subWeightPercentage = 'Sub-Weight Percentage is required';
    } else {
      const weight = parseFloat(subQuestionForm.subWeightPercentage);
      if (isNaN(weight) || weight < 0 || weight > 100) {
        newErrors.subWeightPercentage = 'Weight must be between 0 and 100';
      } else {
        const currentTotal = getTotalSubQuestionWeight(selectedIndicator.indicatorId);
        const existingSubQuestion = editingSubQuestionId 
          ? subQuestions.find(sq => sq.subQuestionId === editingSubQuestionId)
          : null;
        const existingWeight = existingSubQuestion ? existingSubQuestion.subWeightPercentage : 0;
        if (currentTotal - existingWeight + weight > 100) {
          newErrors.subWeightPercentage = `Total weight would exceed 100. Current total: ${(currentTotal - existingWeight).toFixed(2)}%`;
        }
      }
    }
    
    if (!subQuestionForm.responseType) {
      newErrors.responseType = 'Response Type is required';
    }
    
    // Validate checkbox options for Multiple-Select Checkbox type
    if (subQuestionForm.responseType === RESPONSE_TYPES.MULTIPLE_SELECT_CHECKBOX) {
      if (!Array.isArray(subQuestionForm.checkboxOptions) || subQuestionForm.checkboxOptions.length === 0) {
        newErrors.checkboxOptions = 'At least one checkbox option is required';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingSubQuestionId) {
      updateSubQuestion(editingSubQuestionId, {
        ...subQuestionForm,
        subWeightPercentage: parseFloat(subQuestionForm.subWeightPercentage),
        checkboxOptions: subQuestionForm.responseType === RESPONSE_TYPES.MULTIPLE_SELECT_CHECKBOX 
          ? (Array.isArray(subQuestionForm.checkboxOptions) 
              ? subQuestionForm.checkboxOptions.join(',') 
              : subQuestionForm.checkboxOptions)
          : null
      });
      setSuccessMessage('Sub-Question updated successfully!');
      setEditingSubQuestionId(null);
    } else {
      createSubQuestion({
        ...subQuestionForm,
        parentIndicatorId: selectedIndicator.indicatorId,
        subWeightPercentage: parseFloat(subQuestionForm.subWeightPercentage),
        checkboxOptions: subQuestionForm.responseType === RESPONSE_TYPES.MULTIPLE_SELECT_CHECKBOX 
          ? (Array.isArray(subQuestionForm.checkboxOptions) 
              ? subQuestionForm.checkboxOptions.join(',') 
              : subQuestionForm.checkboxOptions)
          : null
      });
      setSuccessMessage('Sub-Question created successfully!');
    }
    refreshData();
    setShowSubQuestionForm(false);
    setSubQuestionForm({ 
      subQuestionText: '', 
      subWeightPercentage: '', 
      responseType: RESPONSE_TYPES.YES_NO,
      checkboxOptions: []
    });
    setNewCheckboxOption('');
    setErrors({});
    setTimeout(() => setSuccessMessage(''), 5000);
    // Dispatch event to notify other pages
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assessmentFrameworkUpdated'));
    }
  };

  const handleEditSubQuestion = (subQuestion) => {
    setEditingSubQuestionId(subQuestion.subQuestionId);
    const checkboxOptions = subQuestion.checkboxOptions 
      ? (typeof subQuestion.checkboxOptions === 'string' 
          ? subQuestion.checkboxOptions.split(',').map(opt => opt.trim())
          : subQuestion.checkboxOptions)
      : [];
    setSubQuestionForm({ 
      subQuestionText: subQuestion.subQuestionText, 
      subWeightPercentage: subQuestion.subWeightPercentage.toString(),
      responseType: subQuestion.responseType,
      checkboxOptions: checkboxOptions
    });
    setShowSubQuestionForm(true);
    setErrors({});
  };

  const handleCancelSubQuestionEdit = () => {
    setEditingSubQuestionId(null);
    setShowSubQuestionForm(false);
    setSubQuestionForm({ 
      subQuestionText: '', 
      subWeightPercentage: '', 
      responseType: RESPONSE_TYPES.YES_NO,
      checkboxOptions: []
    });
    setNewCheckboxOption('');
    setErrors({});
  };

  const dimensionTotalWeight = selectedYear ? getTotalDimensionWeight(selectedYear.assessmentYearId) : 0;
  const indicatorTotalWeight = selectedDimension ? getTotalIndicatorWeight(selectedDimension.dimensionId) : 0;
  const subQuestionTotalWeight = selectedIndicator ? getTotalSubQuestionWeight(selectedIndicator.indicatorId) : 0;

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'MInT Admin']}>
      <Layout title="Assessment Framework Management">
        <div className="flex">
          <Sidebar />
        <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                Assessment Framework Management
              </h1>
              <p className="text-mint-dark-text/70">Define and manage assessment years, dimensions, indicators, and sub-questions</p>
            </div>

            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Breadcrumb Navigation */}
            <div className="mb-6 flex items-center gap-2 text-sm">
              <button
                onClick={() => {
                  setSelectedYear(null);
                  setSelectedDimension(null);
                  setSelectedIndicator(null);
                }}
                className="text-mint-primary-blue hover:underline"
              >
                Assessment Years
              </button>
              {selectedYear && (
                <>
                  <span className="text-mint-dark-text/50">/</span>
                  <button
                    onClick={() => {
                      setSelectedDimension(null);
                      setSelectedIndicator(null);
                    }}
                    className="text-mint-primary-blue hover:underline"
                  >
                    {selectedYear.yearName}
                  </button>
                </>
              )}
              {selectedDimension && (
                <>
                  <span className="text-mint-dark-text/50">/</span>
                  <button
                    onClick={() => {
                      setSelectedIndicator(null);
                    }}
                    className="text-mint-primary-blue hover:underline"
                  >
                    {selectedDimension.dimensionName}
                  </button>
                </>
              )}
              {selectedIndicator && (
                <>
                  <span className="text-mint-dark-text/50">/</span>
                  <span className="text-mint-dark-text">{selectedIndicator.indicatorName}</span>
                </>
              )}
            </div>

            {/* Assessment Years View */}
            {!selectedYear && (
              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl text-mint-primary-blue">Assessment Years</CardTitle>
                        <CardDescription>Select or create an assessment year to manage dimensions</CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          if (showYearForm) {
                            handleCancelYearEdit();
                          } else {
                            handleCreateYear();
                          }
                        }}
                        variant={showYearForm ? "outline" : "default"}
                        className={showYearForm ? "" : "bg-mint-secondary-blue hover:bg-mint-primary-blue"}
                      >
                        {showYearForm ? 'Cancel' : '+ Create New Year'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>

                    {showYearForm && (
                      <form onSubmit={handleYearSubmit} className="mb-6 p-4 bg-mint-light-gray rounded-lg">
                        <h3 className="text-lg font-semibold text-mint-primary-blue mb-4">
                          {editingYearId ? 'Edit Assessment Year' : 'Create New Assessment Year'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="yearName" className="mb-2">
                              Year Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="text"
                              id="yearName"
                              value={yearForm.yearName}
                              onChange={(e) => setYearForm({ ...yearForm, yearName: e.target.value })}
                              className={errors.yearName ? 'border-red-500' : ''}
                              placeholder="e.g., 2025 Assessment"
                            />
                            {errors.yearName && <p className="mt-1 text-sm text-red-500">{errors.yearName}</p>}
                          </div>
                          <div>
                            <Label htmlFor="status" className="mb-2">
                              Status <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              id="status"
                              value={yearForm.status}
                              onChange={(e) => setYearForm({ ...yearForm, status: e.target.value })}
                            >
                              <option value={ASSESSMENT_STATUS.DRAFT}>Draft</option>
                              <option value={ASSESSMENT_STATUS.ACTIVE}>Active</option>
                              <option value={ASSESSMENT_STATUS.ARCHIVED}>Archived</option>
                            </Select>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="mt-4 bg-mint-secondary-blue hover:bg-mint-primary-blue"
                        >
                          {editingYearId ? 'Update Year' : 'Save Year'}
                        </Button>
                      </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {years.map((year) => (
                        <Card
                          key={year.assessmentYearId}
                          className="hover:border-mint-primary-blue hover:shadow-md transition-all"
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => setSelectedYear(year)}
                              >
                                <h3 className="font-semibold text-mint-dark-text mb-1">{year.yearName}</h3>
                                <p className="text-sm text-mint-dark-text/70">Status: {year.status}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                year.status === ASSESSMENT_STATUS.ACTIVE
                                  ? 'bg-green-100 text-green-800'
                                  : year.status === ASSESSMENT_STATUS.DRAFT
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {year.status}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Select
                                value={year.status}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(year.assessmentYearId, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 text-sm"
                              >
                                <option value={ASSESSMENT_STATUS.DRAFT}>Draft</option>
                                <option value={ASSESSMENT_STATUS.ACTIVE}>Active</option>
                                <option value={ASSESSMENT_STATUS.ARCHIVED}>Archived</option>
                              </Select>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditYear(year);
                                }}
                                variant="outline"
                                className="text-xs px-3"
                                title="Edit Year"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedYear(year);
                                }}
                                variant="outline"
                                className="text-xs px-3"
                              >
                                Manage
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Dimensions View */}
            {selectedYear && !selectedDimension && (
              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl text-mint-primary-blue">Assessment Dimensions</CardTitle>
                        <CardDescription>
                          Year: {selectedYear.yearName} | 
                          Total Weight: <span className={`font-bold ${dimensionTotalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                            {dimensionTotalWeight.toFixed(2)} / 100%
                          </span>
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          if (showDimensionForm) {
                            handleCancelDimensionEdit();
                          } else {
                            setEditingDimensionId(null);
                            setDimensionForm({ dimensionName: '', dimensionWeight: '' });
                            setShowDimensionForm(true);
                            setErrors({});
                          }
                        }}
                        variant={showDimensionForm ? "outline" : "default"}
                        className={showDimensionForm ? "" : "bg-mint-secondary-blue hover:bg-mint-primary-blue"}
                      >
                        {showDimensionForm ? 'Cancel' : '+ Add Dimension'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>

                    {showDimensionForm && (
                      <form onSubmit={handleDimensionSubmit} className="mb-6 p-4 bg-mint-light-gray rounded-lg">
                        <h3 className="text-lg font-semibold text-mint-primary-blue mb-4">
                          {editingDimensionId ? 'Edit Dimension' : 'Create New Dimension'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dimensionName" className="mb-2">
                              Dimension Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="text"
                              id="dimensionName"
                              value={dimensionForm.dimensionName}
                              onChange={(e) => setDimensionForm({ ...dimensionForm, dimensionName: e.target.value })}
                              className={errors.dimensionName ? 'border-red-500' : ''}
                              placeholder="e.g., Institutional Framework"
                            />
                            {errors.dimensionName && <p className="mt-1 text-sm text-red-500">{errors.dimensionName}</p>}
                          </div>
                          <div>
                            <Label htmlFor="dimensionWeight" className="mb-2">
                              Weight (%) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              id="dimensionWeight"
                              value={dimensionForm.dimensionWeight}
                              onChange={(e) => setDimensionForm({ ...dimensionForm, dimensionWeight: e.target.value })}
                              className={errors.dimensionWeight ? 'border-red-500' : ''}
                              placeholder="e.g., 20.00"
                            />
                            {errors.dimensionWeight && <p className="mt-1 text-sm text-red-500">{errors.dimensionWeight}</p>}
                            <p className="mt-1 text-xs text-mint-dark-text/60">
                              Remaining: {(100 - dimensionTotalWeight).toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="mt-4 bg-mint-secondary-blue hover:bg-mint-primary-blue"
                        >
                          {editingDimensionId ? 'Update Dimension' : 'Save Dimension'}
                        </Button>
                      </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dimensions.map((dimension) => (
                        <Card
                          key={dimension.dimensionId}
                          className="hover:border-mint-primary-blue hover:shadow-md transition-all"
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => setSelectedDimension(dimension)}
                              >
                                <h3 className="font-semibold text-mint-dark-text mb-1">{dimension.dimensionName}</h3>
                                <p className="text-sm text-mint-dark-text/70">Weight: {dimension.dimensionWeight}%</p>
                              </div>
                              <span className="px-2 py-1 bg-mint-primary-blue/10 text-mint-primary-blue rounded text-sm font-semibold">
                                {dimension.dimensionWeight}%
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDimension(dimension);
                                }}
                                variant="outline"
                                className="flex-1 text-xs px-3"
                                title="Edit Dimension"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDimension(dimension);
                                }}
                                variant="outline"
                                className="flex-1 text-xs px-3"
                              >
                                Manage
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Indicators View */}
            {selectedDimension && !selectedIndicator && (
              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl text-mint-primary-blue">Indicators</CardTitle>
                        <CardDescription>
                          Dimension: {selectedDimension.dimensionName} | 
                          Total Weight: <span className={`font-bold ${indicatorTotalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                            {indicatorTotalWeight.toFixed(2)} / 100%
                          </span>
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          if (showIndicatorForm) {
                            handleCancelIndicatorEdit();
                          } else {
                            setEditingIndicatorId(null);
                            setIndicatorForm({ indicatorName: '', indicatorWeight: '', applicableUnitType: '' });
                            setShowIndicatorForm(true);
                            setErrors({});
                          }
                        }}
                        variant={showIndicatorForm ? "outline" : "default"}
                        className={showIndicatorForm ? "" : "bg-mint-secondary-blue hover:bg-mint-primary-blue"}
                      >
                        {showIndicatorForm ? 'Cancel' : '+ Add Indicator'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>

                    {showIndicatorForm && (
                      <form onSubmit={handleIndicatorSubmit} className="mb-6 p-4 bg-mint-light-gray rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="indicatorName" className="mb-2">
                              Indicator Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="text"
                              id="indicatorName"
                              value={indicatorForm.indicatorName}
                              onChange={(e) => setIndicatorForm({ ...indicatorForm, indicatorName: e.target.value })}
                              className={errors.indicatorName ? 'border-red-500' : ''}
                              placeholder="e.g., Policy Framework"
                            />
                            {errors.indicatorName && <p className="mt-1 text-sm text-red-500">{errors.indicatorName}</p>}
                          </div>
                          <div>
                            <Label htmlFor="indicatorWeight" className="mb-2">
                              Weight (%) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              id="indicatorWeight"
                              value={indicatorForm.indicatorWeight}
                              onChange={(e) => setIndicatorForm({ ...indicatorForm, indicatorWeight: e.target.value })}
                              className={errors.indicatorWeight ? 'border-red-500' : ''}
                              placeholder="e.g., 30.00"
                            />
                            {errors.indicatorWeight && <p className="mt-1 text-sm text-red-500">{errors.indicatorWeight}</p>}
                            <p className="mt-1 text-xs text-mint-dark-text/60">
                              Remaining: {(100 - indicatorTotalWeight).toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="applicableUnitType" className="mb-2">
                              Applicable Unit Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              id="applicableUnitType"
                              value={indicatorForm.applicableUnitType}
                              onChange={(e) => setIndicatorForm({ ...indicatorForm, applicableUnitType: e.target.value })}
                              className={errors.applicableUnitType ? 'border-red-500' : ''}
                            >
                              <option value="">Select Unit Type</option>
                              {APPLICABLE_UNIT_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </Select>
                            {errors.applicableUnitType && <p className="mt-1 text-sm text-red-500">{errors.applicableUnitType}</p>}
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="mt-4 bg-mint-secondary-blue hover:bg-mint-primary-blue"
                        >
                          {editingIndicatorId ? 'Update Indicator' : 'Save Indicator'}
                        </Button>
                      </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {indicators.map((indicator) => (
                        <Card
                          key={indicator.indicatorId}
                          className="hover:border-mint-primary-blue hover:shadow-md transition-all"
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => setSelectedIndicator(indicator)}
                              >
                                <h3 className="font-semibold text-mint-dark-text mb-1">{indicator.indicatorName}</h3>
                                <p className="text-sm text-mint-dark-text/70">
                                  Weight: {indicator.indicatorWeight}% | Unit Type: {indicator.applicableUnitType}
                                </p>
                              </div>
                              <span className="px-2 py-1 bg-mint-primary-blue/10 text-mint-primary-blue rounded text-sm font-semibold">
                                {indicator.indicatorWeight}%
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditIndicator(indicator);
                                }}
                                variant="outline"
                                className="flex-1 text-xs px-3"
                                title="Edit Indicator"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIndicator(indicator);
                                }}
                                variant="outline"
                                className="flex-1 text-xs px-3"
                              >
                                Manage
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sub-Questions View */}
            {selectedIndicator && (
              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl text-mint-primary-blue">Sub-Questions</CardTitle>
                        <CardDescription>
                          Indicator: {selectedIndicator.indicatorName} | 
                          Total Weight: <span className={`font-bold ${subQuestionTotalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                            {subQuestionTotalWeight.toFixed(2)} / 100%
                          </span>
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          if (showSubQuestionForm) {
                            handleCancelSubQuestionEdit();
                          } else {
                            setEditingSubQuestionId(null);
                            setSubQuestionForm({ 
                              subQuestionText: '', 
                              subWeightPercentage: '', 
                              responseType: RESPONSE_TYPES.YES_NO,
                              checkboxOptions: []
                            });
                            setNewCheckboxOption('');
                            setShowSubQuestionForm(true);
                            setErrors({});
                          }
                        }}
                        variant={showSubQuestionForm ? "outline" : "default"}
                        className={showSubQuestionForm ? "" : "bg-mint-secondary-blue hover:bg-mint-primary-blue"}
                      >
                        {showSubQuestionForm ? 'Cancel' : '+ Add Sub-Question'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>

                    {showSubQuestionForm && (
                      <form onSubmit={handleSubQuestionSubmit} className="mb-6 p-4 bg-mint-light-gray rounded-lg">
                        <h3 className="text-lg font-semibold text-mint-primary-blue mb-4">
                          {editingSubQuestionId ? 'Edit Sub-Question' : 'Create New Sub-Question'}
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="subQuestionText" className="mb-2">
                              Sub-Question Text <span className="text-red-500">*</span>
                            </Label>
                            <textarea
                              id="subQuestionText"
                              value={subQuestionForm.subQuestionText}
                              onChange={(e) => setSubQuestionForm({ ...subQuestionForm, subQuestionText: e.target.value })}
                              className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                              rows="3"
                              placeholder="Enter the sub-question text"
                            />
                            {errors.subQuestionText && <p className="mt-1 text-sm text-red-500">{errors.subQuestionText}</p>}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="subWeightPercentage" className="mb-2">
                                Weight (%) <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                id="subWeightPercentage"
                                value={subQuestionForm.subWeightPercentage}
                                onChange={(e) => setSubQuestionForm({ ...subQuestionForm, subWeightPercentage: e.target.value })}
                                className={errors.subWeightPercentage ? 'border-red-500' : ''}
                                placeholder="e.g., 50.00"
                              />
                              {errors.subWeightPercentage && <p className="mt-1 text-sm text-red-500">{errors.subWeightPercentage}</p>}
                              <p className="mt-1 text-xs text-mint-dark-text/60">
                                Remaining: {(100 - subQuestionTotalWeight).toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="responseType" className="mb-2">
                                Response Type <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                id="responseType"
                                value={subQuestionForm.responseType}
                                onChange={(e) => setSubQuestionForm({ ...subQuestionForm, responseType: e.target.value, checkboxOptions: [] })}
                                className={errors.responseType ? 'border-red-500' : ''}
                              >
                                <option value={RESPONSE_TYPES.YES_NO}>Yes/No</option>
                                <option value={RESPONSE_TYPES.MULTIPLE_SELECT_CHECKBOX}>Multiple-Select Checkbox</option>
                                <option value={RESPONSE_TYPES.TEXT_EXPLANATION}>Text Explanation</option>
                              </Select>
                              {errors.responseType && <p className="mt-1 text-sm text-red-500">{errors.responseType}</p>}
                            </div>
                          </div>
                          {subQuestionForm.responseType === RESPONSE_TYPES.MULTIPLE_SELECT_CHECKBOX && (
                            <div>
                              <Label className="mb-2 block">
                                Checkbox Options <span className="text-red-500">*</span>
                              </Label>
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    type="text"
                                    value={newCheckboxOption}
                                    onChange={(e) => setNewCheckboxOption(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (newCheckboxOption.trim()) {
                                          const currentOptions = Array.isArray(subQuestionForm.checkboxOptions) 
                                            ? subQuestionForm.checkboxOptions 
                                            : [];
                                          setSubQuestionForm({
                                            ...subQuestionForm,
                                            checkboxOptions: [...currentOptions, newCheckboxOption.trim()]
                                          });
                                          setNewCheckboxOption('');
                                        }
                                      }
                                    }}
                                    placeholder="Enter option text"
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      if (newCheckboxOption.trim()) {
                                        const currentOptions = Array.isArray(subQuestionForm.checkboxOptions) 
                                          ? subQuestionForm.checkboxOptions 
                                          : [];
                                        setSubQuestionForm({
                                          ...subQuestionForm,
                                          checkboxOptions: [...currentOptions, newCheckboxOption.trim()]
                                        });
                                        setNewCheckboxOption('');
                                      }
                                    }}
                                    className="bg-mint-primary-blue hover:bg-mint-secondary-blue"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </Button>
                                </div>
                                {Array.isArray(subQuestionForm.checkboxOptions) && subQuestionForm.checkboxOptions.length > 0 && (
                                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                    <div className="space-y-2">
                                      {subQuestionForm.checkboxOptions.map((option, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                          <span className="text-sm text-gray-900">{option}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const currentOptions = Array.isArray(subQuestionForm.checkboxOptions) 
                                                ? subQuestionForm.checkboxOptions 
                                                : [];
                                              setSubQuestionForm({
                                                ...subQuestionForm,
                                                checkboxOptions: currentOptions.filter((_, i) => i !== index)
                                              });
                                            }}
                                            className="text-red-500 hover:text-red-700 ml-2"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {(!Array.isArray(subQuestionForm.checkboxOptions) || subQuestionForm.checkboxOptions.length === 0) && (
                                  <p className="text-xs text-mint-dark-text/60 italic">
                                    No options added yet. Add options using the input above.
                                  </p>
                                )}
                                {errors.checkboxOptions && (
                                  <p className="mt-1 text-sm text-red-500">{errors.checkboxOptions}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          type="submit"
                          className="mt-4 bg-mint-secondary-blue hover:bg-mint-primary-blue"
                        >
                          {editingSubQuestionId ? 'Update Sub-Question' : 'Save Sub-Question'}
                        </Button>
                      </form>
                    )}

                    <div className="space-y-2">
                      {subQuestions.map((sq) => (
                        <Card key={sq.subQuestionId} className="hover:bg-mint-light-gray">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-mint-dark-text mb-2">{sq.subQuestionText}</h3>
                                <div className="flex gap-4 text-sm text-mint-dark-text/70">
                                  <span>Weight: {sq.subWeightPercentage}%</span>
                                  <span>Type: {sq.responseType}</span>
                                  {sq.checkboxOptions && (
                                    <span>Options: {sq.checkboxOptions}</span>
                                  )}
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-mint-primary-blue/10 text-mint-primary-blue rounded text-sm font-semibold">
                                {sq.subWeightPercentage}%
                              </span>
                            </div>
                            <Button
                              onClick={() => handleEditSubQuestion(sq)}
                              variant="outline"
                              className="w-full text-xs px-3"
                              title="Edit Sub-Question"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}


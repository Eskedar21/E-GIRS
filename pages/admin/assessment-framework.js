import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
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
  const [activeView, setActiveView] = useState('years'); // years, dimensions, indicators, subQuestions
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
  
  const [yearForm, setYearForm] = useState({ yearName: '', status: ASSESSMENT_STATUS.DRAFT });
  const [dimensionForm, setDimensionForm] = useState({ dimensionName: '', dimensionWeight: '' });
  const [indicatorForm, setIndicatorForm] = useState({ indicatorName: '', indicatorWeight: '', applicableUnitType: '' });
  const [subQuestionForm, setSubQuestionForm] = useState({ 
    subQuestionText: '', 
    subWeightPercentage: '', 
    responseType: RESPONSE_TYPES.YES_NO,
    checkboxOptions: ''
  });
  
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

    createAssessmentYear(yearForm);
    refreshData();
    setShowYearForm(false);
    setYearForm({ yearName: '', status: ASSESSMENT_STATUS.DRAFT });
    setSuccessMessage('Assessment Year created successfully!');
    setTimeout(() => setSuccessMessage(''), 5000);
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
        if (currentTotal + weight > 100) {
          newErrors.dimensionWeight = `Total weight would exceed 100. Current total: ${currentTotal.toFixed(2)}%`;
        }
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createDimension({
      ...dimensionForm,
      assessmentYearId: selectedYear.assessmentYearId,
      dimensionWeight: parseFloat(dimensionForm.dimensionWeight)
    });
    refreshData();
    setShowDimensionForm(false);
    setDimensionForm({ dimensionName: '', dimensionWeight: '' });
    setErrors({});
    setSuccessMessage('Dimension created successfully!');
    setTimeout(() => setSuccessMessage(''), 5000);
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
        if (currentTotal + weight > 100) {
          newErrors.indicatorWeight = `Total weight would exceed 100. Current total: ${currentTotal.toFixed(2)}%`;
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

    createIndicator({
      ...indicatorForm,
      dimensionId: selectedDimension.dimensionId,
      indicatorWeight: parseFloat(indicatorForm.indicatorWeight)
    });
    refreshData();
    setShowIndicatorForm(false);
    setIndicatorForm({ indicatorName: '', indicatorWeight: '', applicableUnitType: '' });
    setErrors({});
    setSuccessMessage('Indicator created successfully!');
    setTimeout(() => setSuccessMessage(''), 5000);
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
        if (currentTotal + weight > 100) {
          newErrors.subWeightPercentage = `Total weight would exceed 100. Current total: ${currentTotal.toFixed(2)}%`;
        }
      }
    }
    
    if (!subQuestionForm.responseType) {
      newErrors.responseType = 'Response Type is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createSubQuestion({
      ...subQuestionForm,
      parentIndicatorId: selectedIndicator.indicatorId,
      subWeightPercentage: parseFloat(subQuestionForm.subWeightPercentage),
      checkboxOptions: subQuestionForm.responseType === RESPONSE_TYPES.MULTIPLE_SELECT_CHECKBOX 
        ? subQuestionForm.checkboxOptions 
        : null
    });
    refreshData();
    setShowSubQuestionForm(false);
    setSubQuestionForm({ 
      subQuestionText: '', 
      subWeightPercentage: '', 
      responseType: RESPONSE_TYPES.YES_NO,
      checkboxOptions: ''
    });
    setErrors({});
    setSuccessMessage('Sub-Question created successfully!');
    setTimeout(() => setSuccessMessage(''), 5000);
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
          <div className="max-w-7xl mx-auto">
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

            {/* Navigation Tabs */}
            <div className="mb-6 bg-white rounded-xl shadow-md p-2 border border-mint-medium-gray">
              <nav className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={() => {
                    setActiveView('years');
                    setSelectedYear(null);
                    setSelectedDimension(null);
                    setSelectedIndicator(null);
                  }}
                  className={`py-2.5 px-4 font-semibold rounded-lg whitespace-nowrap transition-all ${
                    activeView === 'years'
                      ? 'bg-mint-primary-blue text-white shadow-md'
                      : 'text-mint-dark-text hover:bg-mint-light-gray'
                  }`}
                >
                  📅 Assessment Years
                </button>
                <button
                  onClick={() => {
                    if (!selectedYear) {
                      alert('Please select an Assessment Year first');
                      return;
                    }
                    setActiveView('dimensions');
                  }}
                  disabled={!selectedYear}
                  className={`py-2.5 px-4 font-semibold rounded-lg whitespace-nowrap transition-all ${
                    activeView === 'dimensions'
                      ? 'bg-mint-primary-blue text-white shadow-md'
                      : 'text-mint-dark-text hover:bg-mint-light-gray'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  📊 Dimensions
                </button>
                <button
                  onClick={() => {
                    if (!selectedDimension) {
                      alert('Please select a Dimension first');
                      return;
                    }
                    setActiveView('indicators');
                  }}
                  disabled={!selectedDimension}
                  className={`py-2.5 px-4 font-semibold rounded-lg whitespace-nowrap transition-all ${
                    activeView === 'indicators'
                      ? 'bg-mint-primary-blue text-white shadow-md'
                      : 'text-mint-dark-text hover:bg-mint-light-gray'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  📋 Indicators
                </button>
                <button
                  onClick={() => {
                    if (!selectedIndicator) {
                      alert('Please select an Indicator first');
                      return;
                    }
                    setActiveView('subQuestions');
                  }}
                  disabled={!selectedIndicator}
                  className={`py-2.5 px-4 font-semibold rounded-lg whitespace-nowrap transition-all ${
                    activeView === 'subQuestions'
                      ? 'bg-mint-primary-blue text-white shadow-md'
                      : 'text-mint-dark-text hover:bg-mint-light-gray'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  ❓ Sub-Questions
                </button>
              </nav>
            </div>

            {/* Assessment Years View */}
            {activeView === 'years' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-mint-primary-blue">Assessment Years</h2>
                    <button
                      onClick={() => setShowYearForm(!showYearForm)}
                      className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {showYearForm ? 'Cancel' : '+ Create New Year'}
                    </button>
                  </div>

                  {showYearForm && (
                    <form onSubmit={handleYearSubmit} className="mb-6 p-4 bg-mint-light-gray rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                            Year Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={yearForm.yearName}
                            onChange={(e) => setYearForm({ ...yearForm, yearName: e.target.value })}
                            className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                            placeholder="e.g., 2025 Assessment"
                          />
                          {errors.yearName && <p className="mt-1 text-sm text-red-500">{errors.yearName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                            Status <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={yearForm.status}
                            onChange={(e) => setYearForm({ ...yearForm, status: e.target.value })}
                            className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                          >
                            <option value={ASSESSMENT_STATUS.DRAFT}>Draft</option>
                            <option value={ASSESSMENT_STATUS.ACTIVE}>Active</option>
                            <option value={ASSESSMENT_STATUS.ARCHIVED}>Archived</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="mt-4 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded-lg transition-colors"
                      >
                        Save Year
                      </button>
                    </form>
                  )}

                  <div className="space-y-2">
                    {years.map((year) => (
                      <div
                        key={year.assessmentYearId}
                        onClick={() => {
                          setSelectedYear(year);
                          setActiveView('dimensions');
                        }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedYear?.assessmentYearId === year.assessmentYearId
                            ? 'border-mint-primary-blue bg-mint-primary-blue/5'
                            : 'border-mint-medium-gray hover:border-mint-primary-blue hover:bg-mint-light-gray'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-mint-dark-text">{year.yearName}</h3>
                            <p className="text-sm text-mint-dark-text/70">Status: {year.status}</p>
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${
                            year.status === ASSESSMENT_STATUS.ACTIVE
                              ? 'bg-green-100 text-green-800'
                              : year.status === ASSESSMENT_STATUS.DRAFT
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {year.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dimensions View */}
            {activeView === 'dimensions' && selectedYear && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-mint-primary-blue">Assessment Dimensions</h2>
                      <p className="text-sm text-mint-dark-text/70 mt-1">
                        Year: {selectedYear.yearName} | 
                        Total Weight: <span className={`font-bold ${dimensionTotalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                          {dimensionTotalWeight.toFixed(2)} / 100%
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDimensionForm(!showDimensionForm)}
                      className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {showDimensionForm ? 'Cancel' : '+ Add Dimension'}
                    </button>
                  </div>

                  {showDimensionForm && (
                    <form onSubmit={handleDimensionSubmit} className="mb-6 p-4 bg-mint-light-gray rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                            Dimension Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={dimensionForm.dimensionName}
                            onChange={(e) => setDimensionForm({ ...dimensionForm, dimensionName: e.target.value })}
                            className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                            placeholder="e.g., Institutional Framework"
                          />
                          {errors.dimensionName && <p className="mt-1 text-sm text-red-500">{errors.dimensionName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                            Weight (%) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={dimensionForm.dimensionWeight}
                            onChange={(e) => setDimensionForm({ ...dimensionForm, dimensionWeight: e.target.value })}
                            className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                            placeholder="e.g., 20.00"
                          />
                          {errors.dimensionWeight && <p className="mt-1 text-sm text-red-500">{errors.dimensionWeight}</p>}
                          <p className="mt-1 text-xs text-mint-dark-text/60">
                            Remaining: {(100 - dimensionTotalWeight).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="mt-4 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded-lg transition-colors"
                      >
                        Save Dimension
                      </button>
                    </form>
                  )}

                  <div className="space-y-2">
                    {dimensions.map((dimension) => (
                      <div
                        key={dimension.dimensionId}
                        onClick={() => {
                          setSelectedDimension(dimension);
                          setActiveView('indicators');
                        }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedDimension?.dimensionId === dimension.dimensionId
                            ? 'border-mint-primary-blue bg-mint-primary-blue/5'
                            : 'border-mint-medium-gray hover:border-mint-primary-blue hover:bg-mint-light-gray'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-mint-dark-text">{dimension.dimensionName}</h3>
                            <p className="text-sm text-mint-dark-text/70">Weight: {dimension.dimensionWeight}%</p>
                          </div>
                          <span className="px-3 py-1 bg-mint-primary-blue/10 text-mint-primary-blue rounded text-sm font-semibold">
                            {dimension.dimensionWeight}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Indicators View */}
            {activeView === 'indicators' && selectedDimension && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-mint-primary-blue">Indicators</h2>
                      <p className="text-sm text-mint-dark-text/70 mt-1">
                        Dimension: {selectedDimension.dimensionName} | 
                        Total Weight: <span className={`font-bold ${indicatorTotalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                          {indicatorTotalWeight.toFixed(2)} / 100%
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setShowIndicatorForm(!showIndicatorForm)}
                      className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {showIndicatorForm ? 'Cancel' : '+ Add Indicator'}
                    </button>
                  </div>

                  {showIndicatorForm && (
                    <form onSubmit={handleIndicatorSubmit} className="mb-6 p-4 bg-mint-light-gray rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                            Indicator Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={indicatorForm.indicatorName}
                            onChange={(e) => setIndicatorForm({ ...indicatorForm, indicatorName: e.target.value })}
                            className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                            placeholder="e.g., Policy Framework"
                          />
                          {errors.indicatorName && <p className="mt-1 text-sm text-red-500">{errors.indicatorName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                            Weight (%) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={indicatorForm.indicatorWeight}
                            onChange={(e) => setIndicatorForm({ ...indicatorForm, indicatorWeight: e.target.value })}
                            className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                            placeholder="e.g., 30.00"
                          />
                          {errors.indicatorWeight && <p className="mt-1 text-sm text-red-500">{errors.indicatorWeight}</p>}
                          <p className="mt-1 text-xs text-mint-dark-text/60">
                            Remaining: {(100 - indicatorTotalWeight).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                            Applicable Unit Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={indicatorForm.applicableUnitType}
                            onChange={(e) => setIndicatorForm({ ...indicatorForm, applicableUnitType: e.target.value })}
                            className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                          >
                            <option value="">Select Unit Type</option>
                            {APPLICABLE_UNIT_TYPES.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          {errors.applicableUnitType && <p className="mt-1 text-sm text-red-500">{errors.applicableUnitType}</p>}
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="mt-4 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded-lg transition-colors"
                      >
                        Save Indicator
                      </button>
                    </form>
                  )}

                  <div className="space-y-2">
                    {indicators.map((indicator) => (
                      <div
                        key={indicator.indicatorId}
                        onClick={() => {
                          setSelectedIndicator(indicator);
                          setActiveView('subQuestions');
                        }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedIndicator?.indicatorId === indicator.indicatorId
                            ? 'border-mint-primary-blue bg-mint-primary-blue/5'
                            : 'border-mint-medium-gray hover:border-mint-primary-blue hover:bg-mint-light-gray'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-mint-dark-text">{indicator.indicatorName}</h3>
                            <p className="text-sm text-mint-dark-text/70">
                              Weight: {indicator.indicatorWeight}% | Unit Type: {indicator.applicableUnitType}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-mint-primary-blue/10 text-mint-primary-blue rounded text-sm font-semibold">
                            {indicator.indicatorWeight}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Questions View */}
            {activeView === 'subQuestions' && selectedIndicator && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-mint-primary-blue">Sub-Questions</h2>
                      <p className="text-sm text-mint-dark-text/70 mt-1">
                        Indicator: {selectedIndicator.indicatorName} | 
                        Total Weight: <span className={`font-bold ${subQuestionTotalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                          {subQuestionTotalWeight.toFixed(2)} / 100%
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSubQuestionForm(!showSubQuestionForm)}
                      className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {showSubQuestionForm ? 'Cancel' : '+ Add Sub-Question'}
                    </button>
                  </div>

                  {showSubQuestionForm && (
                    <form onSubmit={handleSubQuestionSubmit} className="mb-6 p-4 bg-mint-light-gray rounded-lg">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                            Sub-Question Text <span className="text-red-500">*</span>
                          </label>
                          <textarea
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
                            <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                              Weight (%) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={subQuestionForm.subWeightPercentage}
                              onChange={(e) => setSubQuestionForm({ ...subQuestionForm, subWeightPercentage: e.target.value })}
                              className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                              placeholder="e.g., 50.00"
                            />
                            {errors.subWeightPercentage && <p className="mt-1 text-sm text-red-500">{errors.subWeightPercentage}</p>}
                            <p className="mt-1 text-xs text-mint-dark-text/60">
                              Remaining: {(100 - subQuestionTotalWeight).toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                              Response Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={subQuestionForm.responseType}
                              onChange={(e) => setSubQuestionForm({ ...subQuestionForm, responseType: e.target.value, checkboxOptions: '' })}
                              className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                            >
                              <option value={RESPONSE_TYPES.YES_NO}>Yes/No</option>
                              <option value={RESPONSE_TYPES.MULTIPLE_SELECT_CHECKBOX}>Multiple-Select Checkbox</option>
                              <option value={RESPONSE_TYPES.TEXT_EXPLANATION}>Text Explanation</option>
                            </select>
                            {errors.responseType && <p className="mt-1 text-sm text-red-500">{errors.responseType}</p>}
                          </div>
                        </div>
                        {subQuestionForm.responseType === RESPONSE_TYPES.MULTIPLE_SELECT_CHECKBOX && (
                          <div>
                            <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                              Checkbox Options (comma-separated) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={subQuestionForm.checkboxOptions}
                              onChange={(e) => setSubQuestionForm({ ...subQuestionForm, checkboxOptions: e.target.value })}
                              className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                              placeholder="e.g., Option 1, Option 2, Option 3"
                            />
                            <p className="mt-1 text-xs text-mint-dark-text/60">
                              Separate multiple options with commas
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="mt-4 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded-lg transition-colors"
                      >
                        Save Sub-Question
                      </button>
                    </form>
                  )}

                  <div className="space-y-2">
                    {subQuestions.map((sq) => (
                      <div
                        key={sq.subQuestionId}
                        className="p-4 border border-mint-medium-gray rounded-lg hover:bg-mint-light-gray"
                      >
                        <div className="flex justify-between items-start">
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
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}


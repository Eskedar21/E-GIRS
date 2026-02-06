import { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUnits, getUnitById, getUnitsByType } from '../../data/administrativeUnits';
import { getAllSubmissions, SUBMISSION_STATUS, getResponsesBySubmission } from '../../data/submissions';
import { getAllAssessmentYears, getAssessmentYearById } from '../../data/assessmentFramework';
import { filterSubmissionsByAccess, canAccessUnit } from '../../utils/permissions';
import { 
  calculateNationalIndex, 
  getRankedUnits, 
  getNationalDimensionScores,
  countUnitsByMaturityLevel,
  getNationalTrendData
} from '../../utils/calculations';
import { assessmentYears, getMaturityLevel, regionsAndCities } from '../../data/mockData';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import Link from 'next/link';
import NationalMaturityMap from '../../components/NationalMaturityMap';

const COLORS = ['#10b981', '#0d6670', '#eab308', '#ef4444']; // Very High, High, Medium, Low

export default function ReportsIndex() {
  const { user } = useAuth();
  const userRole = user ? user.role : '';
  const [allUnits] = useState(getAllUnits());
  const [selectedYearId, setSelectedYearId] = useState(assessmentYears[assessmentYears.length - 1]?.id || '2024');
  const [unitTypeFilter, setUnitTypeFilter] = useState('all'); // 'all', 'Region', 'City Administration', 'Federal Institute'
  const [regionFilter, setRegionFilter] = useState('all');
  const [activeView, setActiveView] = useState('units'); // 'units' or 'federal'

  // Get available regions for filter
  const availableRegions = useMemo(() => {
    return allUnits.filter(u => u.unitType === 'Region' || u.unitType === 'City Administration');
  }, [allUnits]);

  // Helper function to map mockData unit to administrativeUnit
  const findAdminUnit = (mockUnit) => {
    return allUnits.find(u => {
      // Direct name match
      if (u.officialUnitName === mockUnit.name) return true;
      // Map known IDs
      const idMap = {
        'addis-ababa': 10,
        'dire-dawa': 11,
        'oromia': 20,
        'amhara': 21,
        'tigray': 22,
        'somali': 23,
        'snnpr': 24,
        'afar': 25,
        'benishangul': 26,
        'gambela': 27,
        'harari': 28,
        'sidama': 29,
        'southwest': 30
      };
      const mappedId = idMap[mockUnit.id];
      return mappedId && u.unitId === mappedId;
    });
  };

  // Get ranked units based on filters and scope
  const rankedUnits = useMemo(() => {
    let units = getRankedUnits(selectedYearId);
    
    // Apply role-based scoping
    if (['Regional Approver', 'Federal Approver'].includes(userRole)) {
      if (!user?.officialUnitId) return [];
      // Filter to units within their hierarchy
      units = units.filter(unit => {
        const adminUnit = findAdminUnit(unit);
        if (!adminUnit) return false;
        return canAccessUnit(user, adminUnit.unitId, allUnits);
      });
    } else if (['Data Contributor', 'Institute Data Contributor'].includes(userRole)) {
      // Data contributors see only their unit
      if (!user?.officialUnitId) return [];
      const userUnit = getUnitById(user.officialUnitId);
      if (!userUnit) return [];
      units = units.filter(unit => {
        const adminUnit = findAdminUnit(unit);
        return adminUnit && adminUnit.unitId === user.officialUnitId;
      });
    }
    
    // Apply unit type filter
    if (unitTypeFilter !== 'all') {
      units = units.filter(unit => {
        const adminUnit = findAdminUnit(unit);
        return adminUnit && adminUnit.unitType === unitTypeFilter;
      });
    }
    
    // Apply region filter
    if (regionFilter !== 'all') {
      const regionId = parseInt(regionFilter);
      const regionUnit = getUnitById(regionId);
      if (regionUnit) {
        // Filter to units within this region's hierarchy
        units = units.filter(unit => {
          const adminUnit = findAdminUnit(unit);
          if (!adminUnit) return false;
          return adminUnit.unitId === regionId || 
                 adminUnit.parentUnitId === regionId ||
                 canAccessUnit({ role: 'Regional Approver', officialUnitId: regionId }, adminUnit.unitId, allUnits);
        });
      }
    }
    
    return units;
  }, [selectedYearId, unitTypeFilter, regionFilter, user, userRole, allUnits]);

  // Calculate National Index
  const nationalIndex = useMemo(() => {
    if (['Regional Approver', 'Federal Approver', 'Data Contributor', 'Institute Data Contributor'].includes(userRole)) {
      // For scoped roles, calculate average of accessible units
      if (rankedUnits.length === 0) return 0;
      const sum = rankedUnits.reduce((acc, unit) => acc + (unit.score || 0), 0);
      return sum / rankedUnits.length;
    }
    return calculateNationalIndex(selectedYearId);
  }, [selectedYearId, rankedUnits, userRole]);

  // Maturity distribution
  const maturityDistribution = useMemo(() => {
    const counts = { 'Very High': 0, 'High': 0, 'Medium': 0, 'Low': 0 };
    rankedUnits.forEach(unit => {
      const level = getMaturityLevel(unit.score || 0);
      counts[level]++;
    });
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [rankedUnits]);

  // Top units by score
  const topUnits = useMemo(() => {
    return rankedUnits
      .slice(0, 5)
      .map(unit => ({
        name: unit.name.length > 20 ? unit.name.substring(0, 20) + '...' : unit.name,
        score: (unit.score || 0) * 100, // Convert to percentage
        fullName: unit.name
      }));
  }, [rankedUnits]);

  // National dimension scores for radar chart
  const nationalDimensions = useMemo(() => {
    const dimScores = getNationalDimensionScores(selectedYearId);
    return dimScores.map(dim => ({
      dimension: dim.dimensionName.length > 15 ? dim.dimensionName.substring(0, 15) + '...' : dim.dimensionName,
      national: (dim.nationalAverage || 0) * 100,
      fullName: dim.dimensionName
    }));
  }, [selectedYearId]);

  // Trend data (national index over years)
  const trendData = useMemo(() => {
    const years = assessmentYears.map(y => y.id);
    return years.map(yearId => ({
      year: yearId,
      index: calculateNationalIndex(yearId) * 100
    }));
  }, []);

  // Federal Institute submissions
  const federalSubmissions = useMemo(() => {
    if (activeView !== 'federal') return [];
    
    let institutes = getUnitsByType('Federal Institute');
    const allSubmissions = getAllSubmissions();
    const yearId = selectedYearId === '2024' ? 1 : 2;
    
    // Apply role-based scoping
    if (['Federal Approver', 'Institute Admin', 'Institute Data Contributor'].includes(userRole)) {
      if (!user?.officialUnitId) return [];
      institutes = institutes.filter(inst => {
        if (userRole === 'Federal Approver') {
          return canAccessUnit(user, inst.unitId, allUnits);
        }
        return inst.unitId === user.officialUnitId;
      });
    }
    
    return institutes.map(institute => {
      const submissions = allSubmissions.filter(s => 
        s.unitId === institute.unitId && 
        s.assessmentYearId === yearId &&
        (s.submissionStatus === SUBMISSION_STATUS.VALIDATED || 
         s.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE)
      );
      
      return {
        ...institute,
        submissions: submissions.sort((a, b) => 
          new Date(b.submittedDate || b.createdAt) - new Date(a.submittedDate || a.createdAt)
        ),
        latestSubmission: submissions[0] || null
      };
    }).filter(inst => inst.latestSubmission);
  }, [activeView, selectedYearId, user, userRole, allUnits]);

  // Export to CSV
  const handleExport = (type = 'units') => {
    let headers, rows;
    
    if (type === 'units') {
      headers = ['Rank', 'Unit Name', 'E-GIRS Score', 'Maturity Level'];
      rows = rankedUnits.map(unit => [
        unit.rank,
        unit.name,
        (unit.score || 0).toFixed(3),
        getMaturityLevel(unit.score || 0)
      ]);
    } else {
      headers = ['Institute Name', 'Latest Submission', 'Status', 'Submitted Date'];
      rows = federalSubmissions.map(inst => [
        inst.officialUnitName,
        inst.latestSubmission?.submissionName || 'N/A',
        inst.latestSubmission?.submissionStatus || 'N/A',
        inst.latestSubmission ? new Date(inst.latestSubmission.submittedDate || inst.latestSubmission.createdAt).toLocaleDateString() : 'N/A'
      ]);
    }
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `e-girs-report-${type}-${selectedYearId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Check if user can view federal submissions
  const canViewFederal = ['Super Admin', 'MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)', 'Federal Approver', 'Institute Admin', 'Institute Data Contributor'].includes(userRole);

  return (
    <ProtectedRoute allowedRoles={['all']}>
      <Layout title="Reports & Analytics">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                    Reports & Analytics
                  </h1>
                  <p className="text-mint-dark-text/70">
                    Comprehensive insights into unit performance, national index, maturity levels, and federal submissions
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedYearId}
                    onChange={(e) => setSelectedYearId(e.target.value)}
                    className="px-4 py-2 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                  >
                    {assessmentYears.map(year => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleExport(activeView)}
                    className="px-4 py-2 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white rounded-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>

              {/* View Toggle */}
              {canViewFederal && (
                <div className="mb-6 flex gap-2">
                  <button
                    onClick={() => setActiveView('units')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                      activeView === 'units'
                        ? 'bg-mint-primary-blue text-white'
                        : 'bg-gray-100 text-mint-dark-text hover:bg-gray-200'
                    }`}
                  >
                    Unit Index Results
                  </button>
                  <Link
                    href="/reports/federal-institutes-overview"
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                      'bg-gray-100 text-mint-dark-text hover:bg-gray-200'
                    }`}
                  >
                    Federal Submissions
                  </Link>
                </div>
              )}

              {activeView === 'units' ? (
                <>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white/90 text-sm font-medium uppercase tracking-wide">National Index</p>
                        <span className="text-white/60">...</span>
                      </div>
                      <p className="text-5xl font-bold mb-2">{(nationalIndex * 100).toFixed(1)}%</p>
                      <p className="text-sm text-white/80">
                        {selectedYearId} Assessment Year
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide">Very High Maturity</p>
                        <span className="text-mint-dark-text/40">...</span>
                      </div>
                      <p className="text-4xl font-bold text-green-600 mb-1">
                        {maturityDistribution.find(d => d.name === 'Very High')?.value || 0}
                      </p>
                      <p className="text-xs text-mint-dark-text/60">
                        Units with score ≥ 75%
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-mint-primary-blue">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide">High Maturity</p>
                        <span className="text-mint-dark-text/40">...</span>
                      </div>
                      <p className="text-4xl font-bold text-mint-primary-blue mb-1">
                        {maturityDistribution.find(d => d.name === 'High')?.value || 0}
                      </p>
                      <p className="text-xs text-mint-dark-text/60">
                        Units with score ≥ 50%
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide">Total Units</p>
                        <span className="text-mint-dark-text/40">...</span>
                      </div>
                      <p className="text-4xl font-bold text-yellow-600 mb-1">{rankedUnits.length}</p>
                      <p className="text-xs text-mint-dark-text/60">
                        Units assessed
                      </p>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="mb-6 flex gap-4">
                    <select
                      value={unitTypeFilter}
                      onChange={(e) => setUnitTypeFilter(e.target.value)}
                      className="px-4 py-2 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                    >
                      <option value="all">All Unit Types</option>
                      <option value="Region">Regions</option>
                      <option value="City Administration">City Administrations</option>
                    </select>
                    <select
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="px-4 py-2 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                    >
                      <option value="all">All Regions</option>
                      {availableRegions.map(region => (
                        <option key={region.unitId} value={region.unitId}>
                          {region.officialUnitName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Charts Row 1 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Maturity Distribution Donut Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-mint-dark-text">Unit Maturity Distribution</h3>
                          <p className="text-sm text-mint-dark-text/60">Breakdown by maturity level</p>
                        </div>
                        <span className="text-mint-dark-text/40">...</span>
                      </div>
                      <div className="h-64">
                        {maturityDistribution.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={maturityDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {maturityDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-mint-dark-text/40">
                            No data available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* National Index Trends Line Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-mint-dark-text">National Index Trends</h3>
                          <p className="text-sm text-mint-dark-text/60">Index performance over assessment years</p>
                        </div>
                        <span className="text-mint-dark-text/40">...</span>
                      </div>
                      <div className="h-64">
                        {trendData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                              <Line type="monotone" dataKey="index" stroke="#0d6670" strokeWidth={3} name="National Index %" />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-mint-dark-text/40">
                            No data available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Charts Row 2 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top Units Bar Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-mint-dark-text">Top Units by E-GIRS Score</h3>
                          <p className="text-sm text-mint-dark-text/60">Top 5 performing units</p>
                        </div>
                        <span className="text-mint-dark-text/40">...</span>
                      </div>
                      <div className="h-64">
                        {topUnits.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topUnits} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" domain={[0, 100]} />
                              <YAxis dataKey="name" type="category" width={120} />
                              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                              <Bar dataKey="score" fill="#0d6670" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-mint-dark-text/40">
                            No data available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Performance Comparison Radar Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-mint-dark-text">Dimension Performance</h3>
                          <p className="text-sm text-mint-dark-text/60">National average across dimensions</p>
                        </div>
                        <span className="text-mint-dark-text/40">...</span>
                      </div>
                      <div className="h-64">
                        {nationalDimensions.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={nationalDimensions}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="dimension" />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} />
                              <Radar name="National Average" dataKey="national" stroke="#0d6670" fill="#0d6670" fillOpacity={0.6} />
                              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                            </RadarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-mint-dark-text/40">
                            No data available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* National Maturity Map (Geographic) */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-mint-dark-text">National Maturity Map</h3>
                        <p className="text-sm text-mint-dark-text/60">Regions colored by maturity level. Hover for details; click to open Unit Scorecard.</p>
                      </div>
                      <span className="text-mint-dark-text/40">...</span>
                    </div>
                    <NationalMaturityMap
                      rankedUnits={rankedUnits}
                      selectedYearId={selectedYearId}
                      getMaturityLevel={getMaturityLevel}
                    />
                  </div>

                  {/* Units Table */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-mint-dark-text">All Units Index Results</h3>
                        <p className="text-sm text-mint-dark-text/60">Complete list of units with scores and maturity levels</p>
                      </div>
                      <span className="text-mint-dark-text/40">...</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-mint-medium-gray">
                        <thead className="bg-mint-primary-blue">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Unit Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">E-GIRS Score</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Maturity Level</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-mint-medium-gray">
                          {rankedUnits.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-4 text-center text-mint-dark-text/60">
                                No units found for the selected filters
                              </td>
                            </tr>
                          ) : (
                            rankedUnits.map((unit) => {
                              const score = unit.score || 0;
                              const maturity = getMaturityLevel(score);
                              const maturityColors = {
                                'Very High': 'bg-green-100 text-green-800',
                                'High': 'bg-[#0d6670]/10 text-[#0d6670]',
                                'Medium': 'bg-yellow-100 text-yellow-800',
                                'Low': 'bg-red-100 text-red-800'
                              };
                              
                              return (
                                <tr key={unit.id || unit.name} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-mint-dark-text">
                                    {unit.rank}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-mint-dark-text">
                                    {unit.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                                    {score.toFixed(3)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${maturityColors[maturity] || 'bg-gray-100 text-gray-800'}`}>
                                      {maturity}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <Link
                                      href={`/reports/unit-scorecard?year=${selectedYearId}&unit=${unit.id}`}
                                      className="text-mint-primary-blue hover:text-mint-secondary-blue hover:underline"
                                    >
                                      View Details
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Federal Submissions View */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-mint-primary-blue mb-4">Federal Institute Informational Submissions</h2>
                    <p className="text-mint-dark-text/70 mb-4">
                      View detailed informational submissions from Federal Institutes for {selectedYearId}
                    </p>
                  </div>

                  {federalSubmissions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 border border-mint-medium-gray text-center">
                      <p className="text-mint-dark-text/60 text-lg">No federal institute submissions found for the selected year.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {federalSubmissions.map((institute) => (
                        <div key={institute.unitId} className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray hover:shadow-xl transition-shadow">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-mint-primary-blue mb-2">
                              {institute.officialUnitName}
                            </h3>
                            <p className="text-sm text-mint-dark-text/60">
                              {institute.unitType}
                            </p>
                          </div>
                          
                          {institute.latestSubmission && (
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-mint-dark-text/70">Status:</span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  institute.latestSubmission.submissionStatus === SUBMISSION_STATUS.VALIDATED
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {institute.latestSubmission.submissionStatus}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-mint-dark-text/70">Submitted:</span>
                                <span className="text-sm text-mint-dark-text">
                                  {new Date(institute.latestSubmission.submittedDate || institute.latestSubmission.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <Link
                            href={`/reports/federal-institute-detail?year=${selectedYearId === '2024' ? 1 : 2}&unit=${institute.unitId}`}
                            className="block w-full text-center px-4 py-2 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white rounded-lg transition-colors"
                          >
                            View Submission Details
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

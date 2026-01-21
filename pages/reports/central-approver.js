import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentYears, getMaturityLevel } from '../../data/mockData';
import { getAllUnits, getUnitsByType } from '../../data/administrativeUnits';
import { getAllSubmissions, SUBMISSION_STATUS } from '../../data/submissions';
import { getRankedUnits, getNationalDimensionScores } from '../../utils/calculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Link from 'next/link';

export default function CentralApproverReport() {
  const { user } = useAuth();
  const [selectedYearId, setSelectedYearId] = useState(assessmentYears[assessmentYears.length - 1].id);
  const [activeTab, setActiveTab] = useState('regions');

  const allUnits = useMemo(() => getAllUnits(), []);
  
  // Get ranked units (regions and cities)
  const rankedUnits = useMemo(() => getRankedUnits(selectedYearId), [selectedYearId]);
  
  // Get federal institutes
  const federalInstitutes = useMemo(() => {
    const institutes = getUnitsByType('Federal Institute');
    const allSubmissions = getAllSubmissions();
    const yearId = selectedYearId === '2024' ? 1 : 2;
    
    return institutes.map(institute => {
      // Get final validated submissions for this institute
      const submissions = allSubmissions.filter(s => 
        s.unitId === institute.unitId && 
        s.assessmentYearId === yearId &&
        (s.submissionStatus === SUBMISSION_STATUS.VALIDATED || 
         s.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE)
      );
      
      return {
        ...institute,
        submissions: submissions.sort((a, b) => 
          new Date(b.submittedDate) - new Date(a.submittedDate)
        ),
        latestSubmission: submissions[0] || null
      };
    }).filter(inst => inst.latestSubmission); // Only show institutes with validated submissions
  }, [selectedYearId]);

  // Get dimension scores
  const dimensionScores = useMemo(() => getNationalDimensionScores(selectedYearId), [selectedYearId]);

  // Prepare maturity distribution data
  const maturityDistribution = useMemo(() => {
    const levels = { 'Very High': 0, 'High': 0, 'Medium': 0, 'Low': 0 };
    rankedUnits.forEach(unit => {
      const level = getMaturityLevel(unit.score);
      levels[level]++;
    });
    return Object.entries(levels).map(([name, value]) => ({ name, value }));
  }, [rankedUnits]);

  const COLORS = ['#10b981', '#0d6670', '#eab308', '#ef4444'];

  const exportToCSV = (type) => {
    let headers, rows;
    
    if (type === 'regions') {
      headers = ['Rank', 'Unit Name', 'E-GIRS Score', 'Maturity Level', ...dimensionScores.map(d => d.dimensionName)];
      rows = rankedUnits.map(unit => [
        unit.rank,
        unit.name,
        unit.score.toFixed(3),
        getMaturityLevel(unit.score),
        ...dimensionScores.map(dim => {
          const dimScore = unit.dimensionScores?.find(d => d.dimensionId === dim.dimensionId);
          return (dimScore?.score || 0).toFixed(3);
        })
      ]);
    } else {
      headers = ['Institute Name', 'Latest Submission', 'Status', 'Submitted Date'];
      rows = federalInstitutes.map(inst => [
        inst.officialUnitName,
        inst.latestSubmission?.submissionName || 'N/A',
        inst.latestSubmission?.submissionStatus || 'N/A',
        inst.latestSubmission ? new Date(inst.latestSubmission.submittedDate).toLocaleDateString() : 'N/A'
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `central-report-${type}-${selectedYearId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allowedRoles = ['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)', 'MInT Admin', 'Super Admin'];
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Layout title="Comprehensive Administrative Report">
          <div className="p-8 text-center">
            <p className="text-red-600">Access Denied. This report is only available for Central Committee members and Admins.</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Layout title="Comprehensive Administrative Report">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-mint-primary-blue mb-2">
                      Comprehensive Administrative Report
                    </h1>
                    <p className="text-mint-dark-text/70 text-lg">
                      All administrative units and federal institutions overview
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                      Assessment Year
                    </label>
                    <select
                      value={selectedYearId}
                      onChange={(e) => setSelectedYearId(e.target.value)}
                      className="px-4 py-2.5 border-2 border-mint-medium-gray rounded-lg bg-white text-mint-dark-text font-medium focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                    >
                      {assessmentYears.map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-6 border-b border-mint-medium-gray">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('regions')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'regions'
                        ? 'border-mint-primary-blue text-mint-primary-blue'
                        : 'border-transparent text-mint-dark-text/70 hover:text-mint-dark-text hover:border-mint-medium-gray'
                    }`}
                  >
                    Regions & Cities
                  </button>
                  <button
                    onClick={() => setActiveTab('federal')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'federal'
                        ? 'border-mint-primary-blue text-mint-primary-blue'
                        : 'border-transparent text-mint-dark-text/70 hover:text-mint-dark-text hover:border-mint-medium-gray'
                    }`}
                  >
                    Federal Institutions
                  </button>
                </nav>
              </div>

              {/* Regions & Cities Tab */}
              {activeTab === 'regions' && (
                <>
                  {/* Overview KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
                      <p className="text-white/90 text-sm font-medium uppercase tracking-wide mb-2">Total Units</p>
                      <p className="text-5xl font-bold mb-2">{rankedUnits.length}</p>
                      <p className="text-sm text-white/80">Regions & Cities</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                      <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Very High</p>
                      <p className="text-4xl font-bold text-green-600 mb-1">
                        {maturityDistribution.find(d => d.name === 'Very High')?.value || 0}
                      </p>
                      <p className="text-xs text-mint-dark-text/60">Maturity Level</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                      <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">High</p>
                      <p className="text-4xl font-bold text-blue-600 mb-1">
                        {maturityDistribution.find(d => d.name === 'High')?.value || 0}
                      </p>
                      <p className="text-xs text-mint-dark-text/60">Maturity Level</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                      <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Medium/Low</p>
                      <p className="text-4xl font-bold text-yellow-600 mb-1">
                        {(maturityDistribution.find(d => d.name === 'Medium')?.value || 0) + 
                         (maturityDistribution.find(d => d.name === 'Low')?.value || 0)}
                      </p>
                      <p className="text-xs text-mint-dark-text/60">Maturity Level</p>
                    </div>
                  </div>

                  {/* Visualizations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                      <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Maturity Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={maturityDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
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
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                      <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Top 10 Units Performance</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={rankedUnits.slice(0, 10).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis domain={[0, 1]} />
                          <Tooltip formatter={(value) => value.toFixed(3)} />
                          <Bar dataKey="score" fill="#0d6670" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Units Table */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mint-medium-gray">
                    <div className="px-6 py-4 border-b border-mint-medium-gray bg-mint-light-gray flex justify-between items-center">
                      <h3 className="text-xl font-bold text-mint-primary-blue">All Administrative Units</h3>
                      <button
                        onClick={() => exportToCSV('regions')}
                        className="px-4 py-2 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold rounded-lg transition-colors"
                      >
                        Export CSV
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-mint-medium-gray">
                        <thead className="bg-mint-primary-blue">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Unit Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">E-GIRS Score</th>
                            {dimensionScores.map(dim => (
                              <th key={dim.dimensionId} className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                                {dim.dimensionName}
                              </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Maturity Level</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-mint-medium-gray">
                          {rankedUnits.map((unit) => (
                            <tr key={unit.id} className="hover:bg-mint-light-gray">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{unit.rank}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                  href={`/reports/unit-scorecard?year=${selectedYearId}&unit=${unit.id}`}
                                  className="text-sm font-medium text-mint-primary-blue hover:underline"
                                >
                                  {unit.name}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{unit.score.toFixed(3)}</td>
                              {dimensionScores.map(dim => {
                                const dimScore = unit.dimensionScores?.find(d => d.dimensionId === dim.dimensionId);
                                return (
                                  <td key={dim.dimensionId} className="px-6 py-4 whitespace-nowrap text-sm">
                                    {(dimScore?.score || 0).toFixed(3)}
                                  </td>
                                );
                              })}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  getMaturityLevel(unit.score) === 'Very High' ? 'bg-green-100 text-green-800' :
                                  getMaturityLevel(unit.score) === 'High' ? 'bg-[#0d6670]/10 text-[#0d6670]' :
                                  getMaturityLevel(unit.score) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {getMaturityLevel(unit.score)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Federal Institutions Tab */}
              {activeTab === 'federal' && (
                <>
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Federal Institutions do not have index calculations. This tab shows final validated submissions for information purposes only.
                    </p>
                  </div>

                  {/* Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
                      <p className="text-white/90 text-sm font-medium uppercase tracking-wide mb-2">Total Institutes</p>
                      <p className="text-5xl font-bold mb-2">{federalInstitutes.length}</p>
                      <p className="text-sm text-white/80">With Validated Submissions</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                      <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Validated</p>
                      <p className="text-4xl font-bold text-green-600 mb-1">
                        {federalInstitutes.filter(inst => 
                          inst.latestSubmission?.submissionStatus === SUBMISSION_STATUS.VALIDATED ||
                          inst.latestSubmission?.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE
                        ).length}
                      </p>
                      <p className="text-xs text-mint-dark-text/60">Final Submissions</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                      <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Assessment Year</p>
                      <p className="text-2xl font-bold text-blue-600 mb-1">{selectedYearId}</p>
                      <p className="text-xs text-mint-dark-text/60">Current Selection</p>
                    </div>
                  </div>

                  {/* Federal Institutes Table */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mint-medium-gray">
                    <div className="px-6 py-4 border-b border-mint-medium-gray bg-mint-light-gray flex justify-between items-center">
                      <h3 className="text-xl font-bold text-mint-primary-blue">Federal Institutions Final Submissions</h3>
                      <button
                        onClick={() => exportToCSV('federal')}
                        className="px-4 py-2 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold rounded-lg transition-colors"
                      >
                        Export CSV
                      </button>
                    </div>
                    {federalInstitutes.length === 0 ? (
                      <div className="p-8 text-center text-mint-dark-text/70">
                        <p>No validated submissions found for federal institutions in {selectedYearId}.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-mint-medium-gray">
                          <thead className="bg-mint-primary-blue">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Institute Name</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Latest Submission</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Submitted Date</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-mint-medium-gray">
                            {federalInstitutes.map((institute) => (
                              <tr key={institute.unitId} className="hover:bg-mint-light-gray">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {institute.officialUnitName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {institute.latestSubmission?.submissionName || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    institute.latestSubmission?.submissionStatus === SUBMISSION_STATUS.VALIDATED ||
                                    institute.latestSubmission?.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {institute.latestSubmission?.submissionStatus || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {institute.latestSubmission 
                                    ? new Date(institute.latestSubmission.submittedDate).toLocaleDateString()
                                    : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {institute.latestSubmission && (
                                    <Link
                                      href={`/reports/federal-institute-detail?submissionId=${institute.latestSubmission.submissionId}`}
                                      className="text-mint-primary-blue hover:underline"
                                    >
                                      View Details
                                    </Link>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

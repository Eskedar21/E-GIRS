import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentYears, getMaturityLevel } from '../../data/mockData';
import { getAllUnits, getUnitById } from '../../data/administrativeUnits';
import { getUnitScore, getUnitDimensionScores } from '../../utils/calculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export default function DataContributorReport() {
  const { user } = useAuth();
  const [selectedYearId, setSelectedYearId] = useState(assessmentYears[assessmentYears.length - 1].id);

  const allUnits = useMemo(() => getAllUnits(), []);
  const userUnit = useMemo(() => {
    if (!user?.officialUnitId) return null;
    return getUnitById(user.officialUnitId);
  }, [user]);

  // Get unit score and dimensions
  const unitData = useMemo(() => {
    if (!userUnit) return null;
    
    const score = getUnitScore(userUnit.unitId, selectedYearId, allUnits);
    const dimensions = getUnitDimensionScores(userUnit.unitId, selectedYearId, allUnits);
    
    return {
      unit: userUnit,
      score,
      dimensions
    };
  }, [userUnit, selectedYearId, allUnits]);

  // Prepare dimension chart data
  const dimensionChartData = useMemo(() => {
    if (!unitData || !unitData.dimensions) return [];
    return unitData.dimensions.map(dim => ({
      name: dim.dimensionId,
      score: dim.score || 0
    }));
  }, [unitData]);

  // Prepare radar chart data
  const radarChartData = useMemo(() => {
    if (!unitData || !unitData.dimensions) return [];
    return unitData.dimensions.map(dim => ({
      dimension: dim.dimensionId,
      score: (dim.score || 0) * 100, // Convert to percentage for radar
      fullMark: 100
    }));
  }, [unitData]);

  const exportToCSV = () => {
    if (!unitData) return;
    
    const headers = ['Dimension', 'Score', 'Maturity Level'];
    const rows = unitData.dimensions.map(dim => [
      dim.dimensionId,
      (dim.score || 0).toFixed(3),
      getMaturityLevel(dim.score || 0)
    ]);

    const csvContent = [
      `Unit: ${unitData.unit.officialUnitName || unitData.unit.name}`,
      `Year: ${selectedYearId}`,
      `Overall Score: ${unitData.score.toFixed(3)}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `unit-report-${selectedYearId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allowedRoles = ['Data Contributor', 'Institute Data Contributor'];
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Layout title="Unit Performance Report">
          <div className="p-8 text-center">
            <p className="text-red-600">Access Denied. This report is only available for Data Contributors.</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!unitData) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Layout title="Unit Performance Report">
          <div className="flex">
            <Sidebar />
            <main className="flex-grow ml-64 p-8">
              <p>Loading report data...</p>
            </main>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Layout title="Unit Performance Report">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-mint-primary-blue mb-2">
                      My Unit Performance Report
                    </h1>
                    <p className="text-mint-dark-text/70 text-lg">
                      {unitData.unit.officialUnitName || unitData.unit.name}
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

              {/* Overview KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
                  <p className="text-white/90 text-sm font-medium uppercase tracking-wide mb-2">Unit Index</p>
                  <p className="text-5xl font-bold mb-2">{unitData.score.toFixed(3)}</p>
                  <p className="text-sm text-white/80">{getMaturityLevel(unitData.score)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Dimensions Assessed</p>
                  <p className="text-4xl font-bold text-green-600 mb-1">{unitData.dimensions.length}</p>
                  <p className="text-xs text-mint-dark-text/60">Total Dimensions</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Unit Type</p>
                  <p className="text-2xl font-bold text-blue-600 mb-1">{unitData.unit.unitType || 'N/A'}</p>
                  <p className="text-xs text-mint-dark-text/60">Administrative Unit</p>
                </div>
              </div>

              {/* Visualizations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Dimension Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dimensionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip formatter={(value) => value.toFixed(3)} />
                      <Bar dataKey="score" fill="#0d6670" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Dimension Radar Chart</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dimension" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#0d6670"
                        fill="#0d6670"
                        fillOpacity={0.6}
                      />
                      <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dimension Details Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mint-medium-gray">
                <div className="px-6 py-4 border-b border-mint-medium-gray bg-mint-light-gray flex justify-between items-center">
                  <h3 className="text-xl font-bold text-mint-primary-blue">Dimension Performance Details</h3>
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold rounded-lg transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-mint-medium-gray">
                    <thead className="bg-mint-primary-blue">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Dimension</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Maturity Level</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-mint-medium-gray">
                      {unitData.dimensions.map((dim, idx) => {
                        const score = dim.score || 0;
                        const maturity = getMaturityLevel(score);
                        return (
                          <tr key={idx} className="hover:bg-mint-light-gray">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{dim.dimensionId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{score.toFixed(3)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                maturity === 'Very High' ? 'bg-green-100 text-green-800' :
                                maturity === 'High' ? 'bg-[#0d6670]/10 text-[#0d6670]' :
                                maturity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {maturity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    score >= 0.75 ? 'bg-green-500' :
                                    score >= 0.50 ? 'bg-[#0d6670]' :
                                    score >= 0.25 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${score * 100}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

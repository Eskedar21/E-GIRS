import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentYears, getMaturityLevel } from '../../data/mockData';
import { getAllUnits, getUnitById } from '../../data/administrativeUnits';
import { getAccessibleUnitIds } from '../../utils/permissions';
import { getUnitScore, getUnitDimensionScores, getUnitsByTypeInHierarchy } from '../../utils/calculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export default function RegionalApproverReport() {
  const { user } = useAuth();
  const [selectedYearId, setSelectedYearId] = useState(assessmentYears[assessmentYears.length - 1].id);

  const allUnits = useMemo(() => getAllUnits(), []);
  const userUnit = useMemo(() => {
    if (!user?.officialUnitId) return null;
    return getUnitById(user.officialUnitId);
  }, [user]);

  // Get accessible units
  const accessibleUnitIds = useMemo(() => {
    if (!user) return [];
    return getAccessibleUnitIds(user, allUnits);
  }, [user, allUnits]);

  // Get region, zones, and woredas in scope
  const regionData = useMemo(() => {
    if (!userUnit) return null;
    
    const regionScore = getUnitScore(userUnit.unitId, selectedYearId, allUnits);
    const regionDimensions = getUnitDimensionScores(userUnit.unitId, selectedYearId, allUnits);
    
    // Get zones - include all zones even if score is 0 (for display purposes)
    const zones = getUnitsByTypeInHierarchy(userUnit.unitId, 'Zone', allUnits)
      .map(zone => ({
        ...zone,
        score: getUnitScore(zone.unitId, selectedYearId, allUnits),
        dimensions: getUnitDimensionScores(zone.unitId, selectedYearId, allUnits)
      }))
      .sort((a, b) => b.score - a.score);

    // Get woredas - include all woredas even if score is 0 (for display purposes)
    const woredas = getUnitsByTypeInHierarchy(userUnit.unitId, 'Woreda', allUnits)
      .map(woreda => ({
        ...woreda,
        score: getUnitScore(woreda.unitId, selectedYearId, allUnits),
        dimensions: getUnitDimensionScores(woreda.unitId, selectedYearId, allUnits)
      }))
      .sort((a, b) => b.score - a.score);

    return {
      unit: userUnit,
      score: regionScore,
      dimensions: regionDimensions,
      zones,
      woredas,
      zoneCount: zones.length,
      woredaCount: woredas.length,
      avgZoneScore: zones.length > 0 
        ? zones.filter(z => z.score > 0).reduce((sum, z) => sum + z.score, 0) / zones.filter(z => z.score > 0).length 
        : 0,
      avgWoredaScore: woredas.length > 0 
        ? woredas.filter(w => w.score > 0).reduce((sum, w) => sum + w.score, 0) / woredas.filter(w => w.score > 0).length 
        : 0
    };
  }, [userUnit, selectedYearId, allUnits]);

  // Prepare dimension chart data
  const dimensionChartData = useMemo(() => {
    if (!regionData || !regionData.dimensions) return [];
    return regionData.dimensions.map(dim => ({
      name: dim.dimensionId,
      score: dim.score || 0
    }));
  }, [regionData]);

  // Prepare zone comparison data
  const zoneComparisonData = useMemo(() => {
    if (!regionData || !regionData.zones) return [];
    return regionData.zones.map(zone => ({
      name: zone.officialUnitName || zone.name,
      score: zone.score
    }));
  }, [regionData]);

  // Prepare woreda distribution data
  const woredaDistributionData = useMemo(() => {
    if (!regionData || !regionData.woredas) return [];
    const levels = { 'Very High': 0, 'High': 0, 'Medium': 0, 'Low': 0 };
    regionData.woredas.forEach(w => {
      const level = getMaturityLevel(w.score);
      levels[level]++;
    });
    return Object.entries(levels).map(([name, value]) => ({ name, value }));
  }, [regionData]);

  const COLORS = ['#0d6670', '#10b981', '#eab308', '#ef4444'];

  const exportToCSV = () => {
    if (!regionData) return;
    
    const headers = ['Unit Type', 'Unit Name', 'E-GIRS Score', 'Maturity Level'];
    const rows = [];
    
    // Add region
    rows.push(['Region', regionData.unit.officialUnitName, regionData.score.toFixed(3), getMaturityLevel(regionData.score)]);
    
    // Add zones
    regionData.zones.forEach(zone => {
      rows.push(['Zone', zone.officialUnitName || zone.name, zone.score.toFixed(3), getMaturityLevel(zone.score)]);
    });
    
    // Add woredas (top 20)
    regionData.woredas.slice(0, 20).forEach(woreda => {
      rows.push(['Woreda', woreda.officialUnitName || woreda.name, woreda.score.toFixed(3), getMaturityLevel(woreda.score)]);
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `regional-report-${selectedYearId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || user.role !== 'Regional Approver') {
    return (
      <ProtectedRoute allowedRoles={['Regional Approver']}>
        <Layout title="Regional Report">
          <div className="p-8 text-center">
            <p className="text-red-600">Access Denied. This report is only available for Regional Approvers.</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!regionData) {
    return (
      <ProtectedRoute allowedRoles={['Regional Approver']}>
        <Layout title="Regional Report">
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
    <ProtectedRoute allowedRoles={['Regional Approver']}>
      <Layout title="Regional Performance Report">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-mint-primary-blue mb-2">
                      Regional Performance Report
                    </h1>
                    <p className="text-mint-dark-text/70 text-lg">
                      {regionData.unit.officialUnitName || regionData.unit.name}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
                  <p className="text-white/90 text-sm font-medium uppercase tracking-wide mb-2">Region Index</p>
                  <p className="text-5xl font-bold mb-2">{regionData.score.toFixed(3)}</p>
                  <p className="text-sm text-white/80">{getMaturityLevel(regionData.score)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Zones</p>
                  <p className="text-4xl font-bold text-blue-600 mb-1">{regionData.zoneCount}</p>
                  <p className="text-xs text-mint-dark-text/60">Avg Score: {regionData.avgZoneScore.toFixed(3)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Woredas</p>
                  <p className="text-4xl font-bold text-green-600 mb-1">{regionData.woredaCount}</p>
                  <p className="text-xs text-mint-dark-text/60">Avg Score: {regionData.avgWoredaScore.toFixed(3)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Total Units</p>
                  <p className="text-4xl font-bold text-purple-600 mb-1">{regionData.zoneCount + regionData.woredaCount}</p>
                  <p className="text-xs text-mint-dark-text/60">In Scope</p>
                </div>
              </div>

              {/* Dimension-based Visualization */}
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
                  <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Zone Performance Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={zoneComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 1]} />
                      <Tooltip formatter={(value) => value.toFixed(3)} />
                      <Bar dataKey="score" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Woreda Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray mb-8">
                <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Woreda Maturity Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={woredaDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {woredaDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Zone Details Table */}
              {regionData.zones.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mint-medium-gray mb-8">
                  <div className="px-6 py-4 border-b border-mint-medium-gray bg-mint-light-gray flex justify-between items-center">
                    <h3 className="text-xl font-bold text-mint-primary-blue">Zone Performance Details</h3>
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
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Zone Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">E-GIRS Score</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Maturity Level</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-mint-medium-gray">
                        {regionData.zones.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-mint-dark-text/70">
                              No zones found in this region.
                            </td>
                          </tr>
                        ) : (
                          regionData.zones.map((zone, idx) => (
                            <tr key={idx} className="hover:bg-mint-light-gray">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{zone.officialUnitName || zone.name || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {zone.score > 0 ? zone.score.toFixed(3) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {zone.score > 0 ? (
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    getMaturityLevel(zone.score) === 'Very High' ? 'bg-green-100 text-green-800' :
                                    getMaturityLevel(zone.score) === 'High' ? 'bg-[#0d6670]/10 text-[#0d6670]' :
                                    getMaturityLevel(zone.score) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {getMaturityLevel(zone.score)}
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                    No Data
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Top Woredas Table */}
              {regionData.woredas.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mint-medium-gray">
                  <div className="px-6 py-4 border-b border-mint-medium-gray bg-mint-light-gray">
                    <h3 className="text-xl font-bold text-mint-primary-blue">Top Performing Woredas</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-mint-medium-gray">
                      <thead className="bg-mint-primary-blue">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Rank</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Woreda Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">E-GIRS Score</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Maturity Level</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-mint-medium-gray">
                        {regionData.woredas.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-mint-dark-text/70">
                              No woredas found in this region.
                            </td>
                          </tr>
                        ) : (
                          regionData.woredas.slice(0, 20).map((woreda, idx) => (
                            <tr key={idx} className="hover:bg-mint-light-gray">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">#{idx + 1}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{woreda.officialUnitName || woreda.name || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {woreda.score > 0 ? woreda.score.toFixed(3) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {woreda.score > 0 ? (
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    getMaturityLevel(woreda.score) === 'Very High' ? 'bg-green-100 text-green-800' :
                                    getMaturityLevel(woreda.score) === 'High' ? 'bg-[#0d6670]/10 text-[#0d6670]' :
                                    getMaturityLevel(woreda.score) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {getMaturityLevel(woreda.score)}
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                    No Data
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
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

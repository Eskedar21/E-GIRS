import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { assessmentYears, regionsAndCities, getMaturityLevel } from '../data/mockData';
import {
  calculateNationalIndex,
  getNationalDimensionScores,
  countUnitsByMaturityLevel,
  getNationalTrendData,
  getRankedUnits
} from '../utils/calculations';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export default function PublicDashboard() {
  const router = useRouter();
  // Initialize with the latest year (2025)
  const [selectedYearId, setSelectedYearId] = useState(assessmentYears[assessmentYears.length - 1].id);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate KPIs using calculation utilities
  const nationalIndex = useMemo(() => calculateNationalIndex(selectedYearId), [selectedYearId]);
  const dimensionScores = useMemo(() => getNationalDimensionScores(selectedYearId), [selectedYearId]);
  const maturityCounts = useMemo(() => countUnitsByMaturityLevel(selectedYearId), [selectedYearId]);
  const trendData = useMemo(() => getNationalTrendData(), []);
  const rankedUnits = useMemo(() => getRankedUnits(selectedYearId), [selectedYearId]);

  // Prepare chart data for line chart
  const lineChartData = useMemo(() => {
    const years = trendData.nationalIndex.map(d => d.year);
    return years.map(year => {
      const dataPoint = {
        year,
        'National Index': trendData.nationalIndex.find(d => d.year === year)?.score || 0
      };
      trendData.dimensions.forEach(dim => {
        const score = dim.scores.find(s => s.year === year);
        dataPoint[dim.dimensionName] = score ? score.score : 0;
      });
      return dataPoint;
    });
  }, [trendData]);

  // Export function for CSV/Excel
  const exportToCSV = () => {
    const headers = ['Rank', 'Unit Name', 'E-GIRS Score', ...dimensionScores.map(d => d.dimensionName)];
    const rows = rankedUnits.map(unit => [
      unit.rank,
      unit.name,
      unit.score.toFixed(3),
      ...dimensionScores.map(dim => {
        const dimScore = unit.dimensionScores.find(d => d.dimensionId === dim.dimensionId);
        return (dimScore?.score || 0).toFixed(3);
      })
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `e-girs-national-report-${selectedYearId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get maturity level color
  const getMaturityColor = (level) => {
    switch (level) {
      case 'Very High':
        return 'bg-green-100 text-green-800';
      case 'High':
        return 'bg-[#0d6670]/10 text-[#0d6670]';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="National E-Government Performance Dashboard">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-mint-primary-blue">
                  National E-Government Performance Dashboard
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700">Live</span>
                </div>
              </div>
              <p className="text-mint-dark-text/70 text-lg">
                Comprehensive assessment of e-government maturity across administrative units
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-mint-dark-text/60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <label htmlFor="year-select" className="block text-sm font-semibold text-mint-dark-text mb-2">
                Assessment Year
              </label>
              <select
                id="year-select"
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="px-4 py-2.5 border-2 border-mint-medium-gray rounded-lg bg-white text-mint-dark-text font-medium focus:outline-none focus:ring-2 focus:ring-mint-primary-blue focus:border-mint-primary-blue shadow-sm min-w-[200px] hover:border-mint-primary-blue transition-colors"
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

        {/* Key Performance Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-mint-primary-blue">Key Performance Indicators</h2>
            <div className="text-sm text-mint-dark-text/60">
              Real-time data • Auto-refreshing
            </div>
          </div>
          
          {/* National Index and Maturity Counts */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-mint-primary-blue via-mint-secondary-blue to-[#0a4f57] rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/90 text-sm font-medium uppercase tracking-wide">National Index</p>
                <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-5xl font-bold mb-3">
                {nationalIndex.toFixed(3)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30">
                  {getMaturityLevel(nationalIndex)}
                </span>
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${nationalIndex * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide">Very High Maturity</p>
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-green-600 mb-1">
                {maturityCounts['Very High']}
              </p>
              <p className="text-xs text-mint-dark-text/60 mt-2">Units (≥0.75)</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all" 
                  style={{ width: `${rankedUnits.length > 0 ? (maturityCounts['Very High'] / rankedUnits.length * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#0d6670] hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide">High Maturity</p>
                <svg className="w-6 h-6 text-[#0d6670]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-[#0d6670] mb-1">
                {maturityCounts['High']}
              </p>
              <p className="text-xs text-mint-dark-text/60 mt-2">Units (0.50-0.75)</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-[#0d6670] h-1.5 rounded-full transition-all" 
                  style={{ width: `${rankedUnits.length > 0 ? (maturityCounts['High'] / rankedUnits.length * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide">Medium/Low Maturity</p>
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-yellow-600 mb-1">
                {maturityCounts['Medium'] + maturityCounts['Low']}
              </p>
              <p className="text-xs text-mint-dark-text/60 mt-2">Units (&lt;0.50)</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-yellow-500 h-1.5 rounded-full transition-all" 
                  style={{ width: `${rankedUnits.length > 0 ? ((maturityCounts['Medium'] + maturityCounts['Low']) / rankedUnits.length * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Dimension Score KPIs */}
          {dimensionScores.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dimensionScores.map((dim, index) => {
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-purple-500 to-purple-600',
                  'from-green-500 to-green-600',
                  'from-orange-500 to-orange-600',
                  'from-teal-500 to-teal-600',
                  'from-pink-500 to-pink-600'
                ];
                const colorClass = colors[index % colors.length];
                return (
                  <div 
                    key={dim.dimensionId} 
                    className={`bg-gradient-to-br ${colorClass} rounded-xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-200`}
                  >
                    <p className="text-xs font-medium mb-2 truncate text-white/90">{dim.dimensionName}</p>
                    <p className="text-2xl font-bold mb-2">
                      {dim.nationalAverage.toFixed(3)}
                    </p>
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div 
                        className="bg-white h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${dim.nationalAverage * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Visualization 1: National Performance Over Time (Area Chart) */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-mint-primary-blue">National Performance Over Time</h3>
              <span className="text-xs text-mint-dark-text/60 bg-mint-light-gray px-2 py-1 rounded">Trend Analysis</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={lineChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorNational" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d6670" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d6670" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="year" 
                  stroke="#374151"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  domain={[0, 1]}
                  stroke="#374151"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <Tooltip 
                  formatter={(value) => value.toFixed(3)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="National Index"
                  stroke="#0d6670" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorNational)"
                  dot={{ fill: '#0d6670', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                {trendData.dimensions.slice(0, 4).map((dim, idx) => {
                  const colors = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0'];
                  return (
                    <Line
                      key={dim.dimensionId}
                      type="monotone"
                      dataKey={dim.dimensionName}
                      stroke={colors[idx % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Visualization 2: Unit Performance Ranking (Bar Chart) */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-mint-primary-blue">Top 10 Unit Performance Ranking</h3>
              <span className="text-xs text-mint-dark-text/60 bg-mint-light-gray px-2 py-1 rounded">Top Performers</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={rankedUnits.slice(0, 10).reverse()}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  type="number"
                  domain={[0, 1]}
                  stroke="#374151"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  stroke="#374151"
                  style={{ fontSize: '11px' }}
                  width={110}
                />
                <Tooltip 
                  formatter={(value) => value.toFixed(3)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="score" name="E-GIRS Score" radius={[0, 8, 8, 0]}>
                  {rankedUnits.slice(0, 10).reverse().map((unit, index) => {
                    const maturityLevel = getMaturityLevel(unit.score);
                    let color = '#ef4444'; // red
                    if (unit.score >= 0.75) color = '#10b981'; // green
                    else if (unit.score >= 0.50) color = '#0d6670'; // primary blue
                    else if (unit.score >= 0.25) color = '#eab308'; // yellow
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visualization 3: National Maturity Map */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray mb-8">
          <h3 className="text-lg font-bold text-mint-primary-blue mb-4">National Maturity Map</h3>
          <p className="text-sm text-mint-dark-text/70 mb-4">
            Click on any region to view detailed scorecard. Regions are color-coded by maturity level.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rankedUnits.map((unit) => {
              const maturityLevel = getMaturityLevel(unit.score);
              return (
                <Link
                  key={unit.id}
                  href={`/reports/unit-scorecard?year=${selectedYearId}&unit=${unit.id}`}
                  className={`block p-4 rounded-lg border-2 transition-all hover:shadow-lg hover:scale-105 cursor-pointer ${getMaturityColor(maturityLevel)}`}
                  title={`${unit.name}: ${unit.score.toFixed(3)} (Rank: ${unit.rank})`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-mint-dark-text/50">#{unit.rank}</span>
                    <span className="text-xs font-bold text-mint-primary-blue">{unit.score.toFixed(3)}</span>
                  </div>
                  <p className="text-sm font-semibold mb-1">{unit.name}</p>
                  <p className="text-xs mt-1 font-medium">{maturityLevel}</p>
                  <div className="mt-2 w-full bg-white/50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        unit.score >= 0.75 ? 'bg-green-600' :
                        unit.score >= 0.50 ? 'bg-[#0d6670]' :
                        unit.score >= 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${unit.score * 100}%` }}
                    ></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Data Table: Ranking Table with Dimension Scores */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mint-medium-gray mb-8">
          <div className="px-6 py-4 border-b border-mint-medium-gray bg-mint-light-gray flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-mint-primary-blue">
                Regional Performance Overview
              </h2>
              <p className="text-sm text-mint-dark-text/70 mt-1">
                E-Government Index scores and maturity levels by administrative unit
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold rounded-lg transition-colors"
            >
              Export Data (CSV)
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-mint-medium-gray">
              <thead className="bg-mint-primary-blue">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Unit Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    E-GIRS Score
                  </th>
                  {dimensionScores.map((dim) => (
                    <th key={dim.dimensionId} className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      {dim.dimensionName}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Maturity Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-mint-medium-gray">
                {rankedUnits.map((unit) => {
                  const maturityLevel = getMaturityLevel(unit.score);
                  return (
                    <tr key={unit.id} className="hover:bg-mint-light-gray transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-mint-dark-text">
                          {unit.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/reports/unit-scorecard?year=${selectedYearId}&unit=${unit.id}`}
                          className="text-sm font-semibold text-mint-primary-blue hover:underline"
                        >
                          {unit.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-mint-primary-blue">
                          {unit.score.toFixed(3)}
                        </span>
                      </td>
                      {dimensionScores.map((dim) => {
                        const dimScore = unit.dimensionScores.find(d => d.dimensionId === dim.dimensionId);
                        return (
                          <td key={dim.dimensionId} className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-mint-dark-text">
                              {(dimScore?.score || 0).toFixed(3)}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getMaturityColor(maturityLevel)}`}>
                          {maturityLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 bg-[#0d6670]/10 border border-[#0d6670]/20 rounded-lg p-4">
          <p className="text-sm text-[#0d6670]">
            <span className="font-semibold">Note:</span> E-GIRS scores range from 0 to 1, with maturity levels categorized as Low (0-0.25), Medium (0.25-0.50), High (0.50-0.75), and Very High (0.75-1.0).
          </p>
        </div>
      </div>
    </Layout>
  );
}


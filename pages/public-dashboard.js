import { useState, useMemo } from 'react';
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
  Cell
} from 'recharts';

export default function PublicDashboard() {
  const router = useRouter();
  // Initialize with the latest year (2025)
  const [selectedYearId, setSelectedYearId] = useState(assessmentYears[assessmentYears.length - 1].id);

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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-mint-primary-blue mb-2">
                National E-Government Performance Dashboard
              </h1>
              <p className="text-mint-dark-text/70 text-lg">
                Comprehensive assessment of e-government maturity across administrative units
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <label htmlFor="year-select" className="block text-sm font-semibold text-mint-dark-text mb-2">
                Assessment Year
              </label>
              <select
                id="year-select"
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="px-4 py-2.5 border-2 border-mint-medium-gray rounded-lg bg-white text-mint-dark-text font-medium focus:outline-none focus:ring-2 focus:ring-mint-primary-blue focus:border-mint-primary-blue shadow-sm min-w-[200px]"
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
          <h2 className="text-2xl font-bold text-mint-primary-blue mb-4">Key Performance Indicators</h2>
          
          {/* National Index and Maturity Counts */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
              <p className="text-white/80 text-sm font-medium mb-1">National Index</p>
              <p className="text-4xl font-bold mb-2">
                {nationalIndex.toFixed(3)}
              </p>
              <div className="mt-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
                  {getMaturityLevel(nationalIndex)}
                </span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <p className="text-mint-dark-text/70 text-sm font-medium mb-1">Very High Maturity</p>
              <p className="text-4xl font-bold text-mint-primary-blue">
                {maturityCounts['Very High']}
              </p>
              <p className="text-xs text-mint-dark-text/60 mt-2">Units</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <p className="text-mint-dark-text/70 text-sm font-medium mb-1">High Maturity</p>
              <p className="text-4xl font-bold text-mint-primary-blue">
                {maturityCounts['High']}
              </p>
              <p className="text-xs text-mint-dark-text/60 mt-2">Units</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <p className="text-mint-dark-text/70 text-sm font-medium mb-1">Medium/Low Maturity</p>
              <p className="text-4xl font-bold text-mint-primary-blue">
                {maturityCounts['Medium'] + maturityCounts['Low']}
              </p>
              <p className="text-xs text-mint-dark-text/60 mt-2">Units</p>
            </div>
          </div>

          {/* Dimension Score KPIs */}
          {dimensionScores.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dimensionScores.map((dim) => (
                <div key={dim.dimensionId} className="bg-white rounded-lg shadow-md p-4 border border-mint-medium-gray">
                  <p className="text-xs text-mint-dark-text/70 font-medium mb-1 truncate">{dim.dimensionName}</p>
                  <p className="text-2xl font-bold text-mint-primary-blue">
                    {dim.nationalAverage.toFixed(3)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Visualization 1: National Performance Over Time (Line Chart) */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
            <h3 className="text-lg font-bold text-mint-primary-blue mb-4">National Performance Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={lineChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
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
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="National Index"
                  stroke="#0d6670" 
                  strokeWidth={3}
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
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Visualization 2: Unit Performance Ranking (Bar Chart) */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
            <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Unit Performance Ranking</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={rankedUnits.slice(0, 10).reverse()}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
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
                  width={90}
                />
                <Tooltip 
                  formatter={(value) => value.toFixed(3)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                />
                <Bar dataKey="score" name="E-GIRS Score" radius={[0, 4, 4, 0]}>
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


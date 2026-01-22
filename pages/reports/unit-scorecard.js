import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { assessmentYears, regionsAndCities, getMaturityLevel } from '../../data/mockData';
import {
  calculateNationalDimensionAverage,
  getNationalDimensionScores,
  getRankedUnits
} from '../../utils/calculations';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

export default function UnitScorecard() {
  const router = useRouter();
  const { year, unit } = router.query;

  const [selectedYearId, setSelectedYearId] = useState(year || assessmentYears[assessmentYears.length - 1].id);
  const [selectedUnitId, setSelectedUnitId] = useState(unit || null);

  // Update state when query params change
  useEffect(() => {
    if (year) setSelectedYearId(year);
    if (unit) setSelectedUnitId(unit);
  }, [year, unit]);

  // Get selected unit data
  const selectedUnit = useMemo(() => {
    if (!selectedUnitId) return null;
    return regionsAndCities.find(u => u.id === selectedUnitId);
  }, [selectedUnitId]);

  // Get ranked units to determine rank
  const rankedUnits = useMemo(() => getRankedUnits(selectedYearId), [selectedYearId]);
  const unitRank = useMemo(() => {
    if (!selectedUnit) return null;
    const ranked = rankedUnits.find(u => u.id === selectedUnit.id);
    return ranked ? ranked.rank : null;
  }, [selectedUnit, rankedUnits]);

  // Get dimension scores
  const dimensionScores = useMemo(() => getNationalDimensionScores(selectedYearId), [selectedYearId]);

  // Get unit's dimension scores
  const unitDimensionScores = useMemo(() => {
    if (!selectedUnit) return [];
    return selectedUnit.dimensionsScoresByYear?.[selectedYearId] || [];
  }, [selectedUnit, selectedYearId]);

  // Helper function to get dimension name
  const getDimensionName = (dimensionId) => {
    const dimensionMap = {
      'IF': 'Institutional Framework',
      'CP': 'Content Provision',
      'SD': 'Service Delivery',
      'PCE': 'Participation & Citizen Engagement',
      'TE': 'Technology Enablement',
      'DI': 'Digital Inclusion'
    };
    return dimensionMap[dimensionId] || dimensionId;
  };

  // Calculate gap/surplus for each dimension
  const dimensionalPerformance = useMemo(() => {
    if (!selectedUnit) {
      return [];
    }
    
    // If we have dimension scores from the calculation utility, use them
    if (dimensionScores && dimensionScores.length > 0) {
      return dimensionScores.map(dim => {
        const unitScore = unitDimensionScores.find(d => d.dimensionId === dim.dimensionId)?.score || 0;
        const nationalAvg = dim.nationalAverage || 0;
        const gap = unitScore - nationalAvg;
        return {
          dimensionName: dim.dimensionName,
          unitScore: unitScore || 0,
          nationalAverage: nationalAvg,
          gap: gap.toFixed(3),
          isSurplus: gap > 0
        };
      });
    }
    
    // Fallback: Calculate from unit's dimension scores directly
    if (unitDimensionScores && unitDimensionScores.length > 0) {
      const allUnits = regionsAndCities;
      return unitDimensionScores.map(unitDim => {
        // Calculate national average from all units
        const nationalAvg = allUnits.reduce((sum, unit) => {
          const dimScore = unit.dimensionsScoresByYear?.[selectedYearId]?.find(
            d => d.dimensionId === unitDim.dimensionId
          )?.score || 0;
          return sum + dimScore;
        }, 0) / (allUnits.length || 1);
        
        const gap = (unitDim.score || 0) - nationalAvg;
        return {
          dimensionName: getDimensionName(unitDim.dimensionId),
          unitScore: unitDim.score || 0,
          nationalAverage: nationalAvg || 0,
          gap: gap.toFixed(3),
          isSurplus: gap > 0
        };
      });
    }
    
    return [];
  }, [selectedUnit, dimensionScores, unitDimensionScores, selectedYearId]);

  // Get child units (sub-units)
  const childUnits = useMemo(() => {
    if (!selectedUnit || !selectedUnit.childUnits) return [];
    return selectedUnit.childUnits
      .map(child => ({
        ...child,
        score: child.scoresByYear[selectedYearId] || 0
      }))
      .sort((a, b) => b.score - a.score)
      .map((child, index) => ({
        ...child,
        rank: index + 1
      }));
  }, [selectedUnit, selectedYearId]);

  // Export functions
  const exportDimensionalPerformance = () => {
    const headers = ['Dimension', 'Unit Score', 'National Average', 'Gap / Surplus'];
    const rows = dimensionalPerformance.map(d => [
      d.dimensionName,
      d.unitScore.toFixed(3),
      d.nationalAverage.toFixed(3),
      d.gap
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `unit-dimensional-performance-${selectedUnitId}-${selectedYearId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSubUnitRanking = () => {
    if (childUnits.length === 0) return;
    
    const headers = ['Rank', 'Sub-Unit Name', 'Score'];
    const rows = childUnits.map(child => [
      child.rank,
      child.name,
      child.score.toFixed(3)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sub-unit-ranking-${selectedUnitId}-${selectedYearId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  // Auto-select first unit if none selected and we have units
  useEffect(() => {
    if (!selectedUnitId && regionsAndCities.length > 0 && router.isReady) {
      const defaultUnit = regionsAndCities[0];
      setSelectedUnitId(defaultUnit.id);
      router.replace(`/reports/unit-scorecard?year=${selectedYearId}&unit=${defaultUnit.id}`, undefined, { shallow: true });
    }
  }, [router.isReady, selectedYearId]);

  if (!selectedUnit) {
    return (
      <Layout title="Unit Scorecard">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-mint-medium-gray">
            <h1 className="text-3xl font-bold text-mint-primary-blue mb-4">Unit Scorecard</h1>
            <div className="mb-6">
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
            <div className="mb-6">
              <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                Select Unit
              </label>
              <select
                value={selectedUnitId || ''}
                onChange={(e) => {
                  setSelectedUnitId(e.target.value);
                  router.push(`/reports/unit-scorecard?year=${selectedYearId}&unit=${e.target.value}`);
                }}
                className="w-full px-4 py-2.5 border-2 border-mint-medium-gray rounded-lg bg-white text-mint-dark-text font-medium focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
              >
                <option value="">Select a unit...</option>
                {regionsAndCities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const unitScore = selectedUnit.scoresByYear[selectedYearId] || 0;
  const maturityLevel = getMaturityLevel(unitScore);

  return (
    <Layout title={`Unit Scorecard - ${selectedUnit.name}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Link
              href="/reports"
              className="flex items-center text-mint-primary-blue hover:text-mint-secondary-blue transition-colors"
            >
              <span className="text-xl mr-2">←</span>
              <span className="text-sm font-medium">Back to Reports</span>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-mint-primary-blue mb-2">
                Unit Scorecard: {selectedUnit.name}
              </h1>
              <p className="text-mint-dark-text/70 text-lg">
                Detailed performance analysis and dimensional breakdown
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div>
                <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Assessment Year
                </label>
                <select
                  value={selectedYearId}
                  onChange={(e) => {
                    setSelectedYearId(e.target.value);
                    router.push(`/reports/unit-scorecard?year=${e.target.value}&unit=${selectedUnitId}`);
                  }}
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
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
            <p className="text-white/80 text-sm font-medium mb-1">Overall Rank</p>
            <p className="text-4xl font-bold">
              {unitRank ? `${unitRank} / ${rankedUnits.length}` : 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
            <p className="text-mint-dark-text/70 text-sm font-medium mb-1">E-GIRS Score</p>
            <p className="text-4xl font-bold text-mint-primary-blue">
              {unitScore.toFixed(3)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
            <p className="text-mint-dark-text/70 text-sm font-medium mb-1">Maturity Level</p>
            <p className={`text-4xl font-bold ${getMaturityColor(maturityLevel).split(' ')[1]}`}>
              {maturityLevel}
            </p>
          </div>
        </div>

        {/* Main Content Grid - Left: Dimensional Analysis, Right: Intra-Unit Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column: Dimensional Performance Analysis and Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dimensional Performance Analysis (Radar Chart) */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Dimensional Performance Analysis</h3>
              {dimensionalPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={dimensionalPerformance.map(dim => ({
                    dimension: dim.dimensionName.length > 20 ? dim.dimensionName.substring(0, 20) + '...' : dim.dimensionName,
                    fullDimension: dim.dimensionName,
                    unitScore: Math.max(0, Math.min(1, dim.unitScore)), // Clamp between 0 and 1
                    nationalAverage: Math.max(0, Math.min(1, dim.nationalAverage)) // Clamp between 0 and 1
                  }))}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ fontSize: 11, fill: '#374151' }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 1]}
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(value) => value.toFixed(2)}
                  />
                  <Tooltip 
                    formatter={(value, name) => [value.toFixed(3), name === 'unitScore' ? 'Unit Score' : 'National Average']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDimension || label}
                  />
                  <Legend />
                  <Radar
                    name="Unit Score"
                    dataKey="unitScore"
                    stroke="#0d6670"
                    fill="#0d6670"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Radar
                    name="National Average"
                    dataKey="nationalAverage"
                    stroke="#9CA3AF"
                    fill="#9CA3AF"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center bg-mint-light-gray rounded-lg border-2 border-dashed border-mint-medium-gray">
                  <div className="text-center">
                    <p className="text-mint-dark-text/70 mb-2">No dimensional data available</p>
                    <p className="text-sm text-mint-dark-text/50">Please ensure the unit has dimension scores for the selected year</p>
                  </div>
                </div>
              )}
            </div>

            {/* Dimensional Performance Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mint-medium-gray">
              <div className="px-6 py-4 border-b border-mint-medium-gray bg-mint-light-gray flex justify-between items-center">
                <h3 className="text-lg font-bold text-mint-primary-blue">Dimensional Performance</h3>
                <button
                  onClick={exportDimensionalPerformance}
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
                        Dimension
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Unit Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        National Average
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Gap / Surplus
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-mint-medium-gray">
                    {dimensionalPerformance.length > 0 ? (
                      dimensionalPerformance.map((dim, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-mint-dark-text">{dim.dimensionName}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-mint-primary-blue">{dim.unitScore.toFixed(3)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-mint-dark-text">{dim.nationalAverage.toFixed(3)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-semibold ${dim.isSurplus ? 'text-green-600' : 'text-red-600'}`}>
                              {dim.isSurplus ? '+' : ''}{dim.gap}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-mint-dark-text/70">
                          No dimensional data available for this unit
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Intra-Unit Performance */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-mint-primary-blue">Intra-Unit Performance</h3>
                {childUnits.length > 0 && (
                  <button
                    onClick={exportSubUnitRanking}
                    className="px-3 py-1.5 bg-[#0d6670] hover:bg-[#0a4f57] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Export Data (CSV)
                  </button>
                )}
              </div>
              {childUnits.length > 0 ? (
                <div className="max-h-[800px] overflow-y-auto pr-2 space-y-3">
                  {childUnits.map((child) => {
                    const childMaturity = getMaturityLevel(child.score);
                    return (
                      <div 
                        key={child.id} 
                        className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getMaturityColor(childMaturity)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-mint-dark-text/50">#{child.rank}</span>
                          <span className="text-sm font-bold text-mint-primary-blue">{child.score.toFixed(3)}</span>
                        </div>
                        <p className="text-sm font-semibold mb-1 text-mint-dark-text">{child.name}</p>
                        <p className="text-xs mt-1 font-medium mb-2">{childMaturity}</p>
                        <div className="w-full bg-white/50 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              child.score >= 0.75 ? 'bg-green-600' :
                              child.score >= 0.50 ? 'bg-[#0d6670]' :
                              child.score >= 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${child.score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-mint-dark-text/60 mb-2">No sub-units available for this unit</p>
                  <p className="text-xs text-mint-dark-text/50">This unit does not have child administrative units in the hierarchy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


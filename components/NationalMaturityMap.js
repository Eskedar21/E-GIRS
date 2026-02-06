import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import * as topojson from 'topojson-client';

const ETHIOPIA_TOPOLOGY_URL = '/ethiopia-regions.json';

// Map GeoJSON NAME_1 to mockData region id
const NAME_1_TO_ID = {
  'Addis Ababa': 'addis-ababa',
  'Afar': 'afar',
  'Amhara': 'amhara',
  'Benshangul-Gumaz': 'benishangul',
  'Dire Dawa': 'dire-dawa',
  'Gambela Peoples': 'gambela',
  'Harari People': 'harari',
  'Oromia': 'oromia',
  'Somali': 'somali',
  'Southern Nations, Nationalities and Peoples': 'snnpr',
  'Tigray': 'tigray',
};

const MATURITY_COLORS = {
  'Very High': '#10b981',
  'High': '#0d6670',
  'Medium': '#eab308',
  'Low': '#ef4444',
};
const DEFAULT_COLOR = '#94a3b8';

export default function NationalMaturityMap({ rankedUnits, selectedYearId, getMaturityLevel }) {
  const router = useRouter();
  const [geography, setGeography] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(ETHIOPIA_TOPOLOGY_URL)
      .then((res) => res.json())
      .then((topology) => {
        if (cancelled || !topology?.objects?.ETH_adm1) return;
        const geo = topojson.feature(topology, topology.objects.ETH_adm1);
        setGeography(geo);
      })
      .catch(() => setGeography(null));
    return () => { cancelled = true; };
  }, []);

  const unitById = useMemo(() => {
    const map = {};
    (rankedUnits || []).forEach((u) => { map[u.id] = u; });
    return map;
  }, [rankedUnits]);

  const getUnitForGeo = (geo) => {
    const name = geo?.properties?.NAME_1;
    const id = name ? NAME_1_TO_ID[name] : null;
    return id ? unitById[id] : null;
  };

  const handleRegionClick = (geo) => {
    const unit = getUnitForGeo(geo);
    if (unit) {
      router.push(`/reports/unit-scorecard?year=${selectedYearId}&unit=${unit.id}`);
    }
  };

  if (!geography) {
    return (
      <div className="w-full aspect-[4/3] max-h-[420px] bg-mint-light-gray rounded-lg flex items-center justify-center text-mint-dark-text/60">
        Loading map…
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [39, 9],
          scale: 2200,
        }}
        width={800}
        height={600}
        style={{ width: '100%', height: 'auto', maxHeight: '420px' }}
      >
        <ZoomableGroup center={[39, 9]} zoom={1}>
          <Geographies geography={geography}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const unit = getUnitForGeo(geo);
                const level = unit ? getMaturityLevel(unit.score) : null;
                const fill = level ? MATURITY_COLORS[level] || DEFAULT_COLOR : DEFAULT_COLOR;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#fff"
                    strokeWidth={0.6}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', cursor: unit ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={(evt) => {
                      if (unit) {
                        setTooltip({
                          name: unit.name,
                          rank: unit.rank,
                          score: unit.score.toFixed(3),
                          x: evt.clientX,
                          y: evt.clientY,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onMouseMove={(evt) => {
                      if (unit) {
                        setTooltip((t) => (t ? { ...t, x: evt.clientX, y: evt.clientY } : null));
                      }
                    }}
                    onClick={() => handleRegionClick(geo)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 text-sm bg-mint-primary-blue text-white rounded-lg shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y + 8 }}
        >
          <div className="font-semibold">{tooltip.name}</div>
          <div>Rank: {tooltip.rank}</div>
          <div>E-GIRS Score: {tooltip.score}</div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /> Very High</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#0d6670]" /> High</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Medium</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Low</span>
      </div>
    </div>
  );
}

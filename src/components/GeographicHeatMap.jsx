import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import './GeographicHeatMap.css'

// Canada provinces GeoJSON - using a public CDN with Canada-specific data
const CANADA_PROVINCES_GEOJSON = 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada.geojson'

// Alternative: Use world-atlas and filter for Canada, then use province data
// For now, we'll use a detailed SVG approach with proper province shapes

// Province codes mapping
const PROVINCE_CODES = {
  'British Columbia': 'BC',
  'Alberta': 'AB',
  'Saskatchewan': 'SK',
  'Manitoba': 'MB',
  'Ontario': 'ON',
  'Quebec': 'QC',
  'New Brunswick': 'NB',
  'Nova Scotia': 'NS',
  'Prince Edward Island': 'PE',
  'Newfoundland and Labrador': 'NL',
  'Yukon': 'YT',
  'Northwest Territories': 'NT',
  'Nunavut': 'NU'
}

// City coordinates with proper lat/lng - adjusted to prevent overlap
const CANADA_CITIES = {
  'Vancouver': { coordinates: [-123.1207, 49.2827], province: 'BC' },
  'Victoria': { coordinates: [-123.3656, 48.3284], province: 'BC' }, // Slightly adjusted south to prevent overlap
  'Calgary': { coordinates: [-114.0719, 51.0447], province: 'AB' },
  'Edmonton': { coordinates: [-113.4938, 53.5461], province: 'AB' },
  'Saskatoon': { coordinates: [-106.6700, 52.1332], province: 'SK' },
  'Regina': { coordinates: [-104.6189, 50.4452], province: 'SK' },
  'Winnipeg': { coordinates: [-97.1384, 49.8951], province: 'MB' },
  'Toronto': { coordinates: [-79.3832, 43.6532], province: 'ON' },
  'Ottawa': { coordinates: [-75.6972, 45.4215], province: 'ON' },
  'Hamilton': { coordinates: [-79.8711, 43.2557], province: 'ON' },
  'Kitchener': { coordinates: [-80.4925, 43.5516], province: 'ON' }, // Slightly adjusted north to prevent overlap with Toronto
  'Montreal': { coordinates: [-73.5673, 45.5017], province: 'QC' },
  'Quebec City': { coordinates: [-71.2080, 46.8139], province: 'QC' },
  'Halifax': { coordinates: [-63.5752, 44.6488], province: 'NS' },
  'Fredericton': { coordinates: [-66.6431, 45.9636], province: 'NB' },
  'Charlottetown': { coordinates: [-63.1311, 46.2382], province: 'PE' },
  "St. John's": { coordinates: [-52.7126, 47.5615], province: 'NL' }
}

const STATUS_COLORS = {
  accepted: '#28a745',
  pending: '#ECAB23',
  denied: '#dc3545',
  other: '#6c757d'
}

function GeographicHeatMap({ cityData = [], selectedView = 'total' }) {
  const { t } = useTranslation()
  const [hoveredCity, setHoveredCity] = useState(null)
  const [hoveredProvince, setHoveredProvince] = useState(null)

  // Create a map of city data for quick lookup
  const cityDataMap = useMemo(() => {
    const map = {}
    cityData.forEach(city => {
      map[city.city] = city
    })
    return map
  }, [cityData])

  // Get city data
  const getCityData = (cityName) => {
    return cityDataMap[cityName] || { total: 0, accepted: 0, pending: 0, denied: 0 }
  }

  // Calculate province-level data
  const provinceData = useMemo(() => {
    const data = {}
    cityData.forEach(city => {
      const cityInfo = CANADA_CITIES[city.city]
      if (cityInfo) {
        const province = cityInfo.province
        if (!data[province]) {
          data[province] = { total: 0, accepted: 0, pending: 0, denied: 0 }
        }
        data[province].total += city.total || 0
        data[province].accepted += city.accepted || 0
        data[province].pending += city.pending || 0
        data[province].denied += city.denied || 0
      }
    })
    return data
  }, [cityData])

  // Get max value for sizing
  const maxValue = useMemo(() => {
    return Math.max(...cityData.map(c => c.total || 0), 1)
  }, [cityData])

  // Get circle size based on value
  const getCircleSize = (total) => {
    const minSize = 8
    const maxSize = 40
    if (maxValue === 0) return minSize
    return minSize + ((total / maxValue) * (maxSize - minSize))
  }

  // Get heatmap color based on status distribution
  const getHeatmapColor = (city) => {
    const { accepted = 0, pending = 0, denied = 0, total = 0 } = city
    
    if (total === 0) return '#e0e0e0'
    
    const acceptedRatio = accepted / total
    const pendingRatio = pending / total
    const deniedRatio = denied / total
    
    // Blend colors based on proportions
    const r = Math.floor(28 + (220 - 28) * deniedRatio + (200 - 28) * pendingRatio)
    const g = Math.floor(167 + (236 - 167) * pendingRatio + (40 - 167) * deniedRatio)
    const b = Math.floor(69 + (35 - 69) * pendingRatio + (50 - 69) * deniedRatio)
    
    return `rgb(${Math.max(0, Math.min(255, r))}, ${Math.max(0, Math.min(255, g))}, ${Math.max(0, Math.min(255, b))})`
  }

  // Get province fill color based on selected view
  const getProvinceColor = (provinceName) => {
    const provinceCode = PROVINCE_CODES[provinceName]
    if (!provinceCode || !provinceData[provinceCode]) return '#f8f9fa'
    
    const data = provinceData[provinceCode]
    const value = data[selectedView] || 0
    const maxProvinceValue = Math.max(...Object.values(provinceData).map(p => p[selectedView] || 0), 1)
    
    if (maxProvinceValue === 0) return '#f8f9fa'
    
    const intensity = value / maxProvinceValue
    const opacity = 0.2 + (intensity * 0.5)
    
    if (selectedView === 'accepted') {
      return `rgba(40, 167, 69, ${opacity})`
    } else if (selectedView === 'pending') {
      return `rgba(236, 171, 35, ${opacity})`
    } else if (selectedView === 'denied') {
      return `rgba(220, 53, 69, ${opacity})`
    } else {
      // Total view: use navy blue (#003946) or dark blue (#0E3846)
      // Convert to RGB: #003946 = rgb(0, 57, 70)
      return `rgba(0, 57, 70, ${opacity})`
    }
  }

  // Get pie chart data for city
  const getPieData = (city) => {
    const { accepted = 0, pending = 0, denied = 0, total = 0 } = city
    const other = total - accepted - pending - denied
    
    return [
      { name: 'Accepted', value: accepted, color: STATUS_COLORS.accepted },
      { name: 'Pending', value: pending, color: STATUS_COLORS.pending },
      { name: 'Denied', value: denied, color: STATUS_COLORS.denied },
      ...(other > 0 ? [{ name: 'Other', value: other, color: STATUS_COLORS.other }] : [])
    ].filter(item => item.value > 0)
  }

  return (
    <div className="geographic-heatmap-container">
      <div className="map-wrapper">
        <ComposableMap
          projectionConfig={{
            scale: 800,
            center: [-95, 62],
            projection: 'geoMercator'
          }}
          width={800}
          height={600}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup>
            <Geographies geography={CANADA_PROVINCES_GEOJSON}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const provinceName = geo.properties.name || geo.properties.NAME || geo.properties.NAME_EN
                  const fillColor = getProvinceColor(provinceName)
                  const isHovered = hoveredProvince === provinceName
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#003946"
                      strokeWidth={isHovered ? 2 : 1.5}
                      style={{
                        default: {
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        },
                        hover: {
                          outline: 'none',
                          fill: getProvinceColor(provinceName),
                          stroke: '#ECAB23',
                          strokeWidth: 2.5
                        },
                        pressed: {
                          outline: 'none'
                        }
                      }}
                      onMouseEnter={() => setHoveredProvince(provinceName)}
                      onMouseLeave={() => setHoveredProvince(null)}
                    />
                  )
                })
              }
            </Geographies>

            {/* City markers */}
            {Object.entries(CANADA_CITIES).map(([cityName, cityInfo]) => {
              const data = getCityData(cityName)
              const total = data.total || 0
              const size = total > 0 ? getCircleSize(total) : 6 // Smaller size for cities with 0 cases
              const heatmapColor = total > 0 ? getHeatmapColor(data) : '#e0e0e0'
              const isHovered = hoveredCity === cityName
              
              // Adjust label position for overlapping cities
              const labelOffset = cityName === 'Victoria' ? -25 : cityName === 'Kitchener' ? -22 : size / 2 + 18
              
              return (
                <Marker
                  key={cityName}
                  coordinates={cityInfo.coordinates}
                >
                  <g>
                    {/* Glow effect on hover */}
                    {isHovered && (
                      <circle
                        r={size / 2 + 4}
                        fill="none"
                        stroke="#ECAB23"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    )}
                    
                    {/* City circle */}
                    <circle
                      r={size / 2}
                      fill={heatmapColor}
                      stroke="#fff"
                      strokeWidth={isHovered ? 3 : 2}
                      opacity={total > 0 ? 0.85 : 0.5}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredCity(cityName)}
                      onMouseLeave={() => setHoveredCity(null)}
                    />
                    
                    {/* Value label */}
                    <text
                      textAnchor="middle"
                      y={4}
                      style={{
                        fontFamily: 'system-ui',
                        fill: total > 0 ? '#fff' : '#999',
                        fontSize: size > 20 ? '10px' : size > 10 ? '8px' : '7px',
                        fontWeight: '700',
                        pointerEvents: 'none',
                        textShadow: total > 0 ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none'
                      }}
                    >
                      {total}
                    </text>
                    
                    {/* City label - positioned to avoid overlap */}
                    <text
                      textAnchor="middle"
                      y={labelOffset}
                      style={{
                        fontFamily: 'system-ui',
                        fill: '#0E3846',
                        fontSize: cityName === 'Victoria' || cityName === 'Kitchener' ? '10px' : '11px',
                        fontWeight: '600',
                        pointerEvents: 'none'
                      }}
                    >
                      {cityName}
                    </text>
                  </g>
                </Marker>
              )
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Hover tooltip */}
        {hoveredCity && (() => {
          const city = getCityData(hoveredCity)
          const pieData = getPieData(city)
          const cityInfo = CANADA_CITIES[hoveredCity]
          
          return (
            <div className="city-tooltip">
              <div className="tooltip-header">
                <h3>{hoveredCity}</h3>
                <div className="tooltip-stats">
                  <div className="tooltip-stat">
                    <span className="stat-label">{t('dashboard.total')}:</span>
                    <span className="stat-value">{city.total || 0}</span>
                  </div>
                </div>
              </div>
              
              {pieData.length > 0 && (
                <>
                  <div className="tooltip-chart">
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => {
                            if (percent < 0.08) return ''
                            return `${name}: ${(percent * 100).toFixed(0)}%`
                          }}
                          outerRadius={40}
                          innerRadius={0}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="tooltip-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-dot accepted"></span>
                      <span>{t('dashboard.accepted')}: {city.accepted || 0}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-dot pending"></span>
                      <span>{t('dashboard.pending')}: {city.pending || 0}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-dot denied"></span>
                      <span>{t('dashboard.denied')}: {city.denied || 0}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })()}
      </div>
      
      {/* Legend */}
      <div className="heatmap-legend">
        <div className="legend-title">{t('dashboard.heatmapLegend')}</div>
        <div className="legend-explanation">
          <p>{t('dashboard.heatmapExplanation')}</p>
        </div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot accepted"></span>
            <span>{t('dashboard.accepted')}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot pending"></span>
            <span>{t('dashboard.pending')}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot denied"></span>
            <span>{t('dashboard.denied')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeographicHeatMap

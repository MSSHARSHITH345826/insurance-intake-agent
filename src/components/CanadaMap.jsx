import { useState, useRef, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import './CanadaMap.css'

// Canada map with province boundaries and major cities
// Coordinates are adjusted for SVG viewBox (0 0 800 600)
const CANADA_CITIES = {
  Toronto: { x: 580, y: 340, lat: 43.6532, lng: -79.3832, province: 'ON' },
  Montreal: { x: 650, y: 300, lat: 45.5017, lng: -73.5673, province: 'QC' },
  Vancouver: { x: 120, y: 280, lat: 49.2827, lng: -123.1207, province: 'BC' },
  Calgary: { x: 320, y: 300, lat: 51.0447, lng: -114.0719, province: 'AB' },
  Ottawa: { x: 620, y: 320, lat: 45.4215, lng: -75.6972, province: 'ON' },
  Edmonton: { x: 280, y: 260, lat: 53.5461, lng: -113.4938, province: 'AB' },
  Winnipeg: { x: 440, y: 280, lat: 49.8951, lng: -97.1384, province: 'MB' },
  'Quebec City': { x: 680, y: 280, lat: 46.8139, lng: -71.2080, province: 'QC' },
  Hamilton: { x: 580, y: 360, lat: 43.2557, lng: -79.8711, province: 'ON' },
  Kitchener: { x: 560, y: 370, lat: 43.4516, lng: -80.4925, province: 'ON' },
  Regina: { x: 380, y: 300, lat: 50.4452, lng: -104.6189, province: 'SK' },
  Saskatoon: { x: 360, y: 280, lat: 52.1332, lng: -106.6700, province: 'SK' },
  Halifax: { x: 720, y: 420, lat: 44.6488, lng: -63.5752, province: 'NS' },
  'St. John\'s': { x: 760, y: 400, lat: 47.5615, lng: -52.7126, province: 'NL' },
  Fredericton: { x: 700, y: 380, lat: 45.9636, lng: -66.6431, province: 'NB' },
  Charlottetown: { x: 710, y: 390, lat: 46.2382, lng: -63.1311, province: 'PE' },
  Victoria: { x: 100, y: 300, lat: 48.4284, lng: -123.3656, province: 'BC' }
}

const STATUS_COLORS = {
  accepted: '#28a745',
  pending: '#ECAB23',
  denied: '#dc3545',
  other: '#6c757d'
}

function CanadaMap({ cityData, selectedView, onCityClick }) {
  const [hoveredCity, setHoveredCity] = useState(null)
  const hoverTimeoutRef = useRef(null)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const getCityData = (cityName) => {
    return cityData.find(c => c.city === cityName) || { total: 0, accepted: 0, pending: 0, denied: 0 }
  }

  const getMaxValue = () => {
    return Math.max(...cityData.map(c => c.total || 0), 1)
  }

  const getCircleSize = (total, max) => {
    const minSize = 20
    const maxSize = 80
    if (max === 0) return minSize
    return minSize + ((total / max) * (maxSize - minSize))
  }

  // Create a multi-color heatmap based on proportions
  const getHeatmapColor = (city) => {
    const { accepted = 0, pending = 0, denied = 0, total = 0 } = city
    
    if (total === 0) return '#e0e0e0'
    
    // Calculate proportions
    const acceptedRatio = accepted / total
    const pendingRatio = pending / total
    const deniedRatio = denied / total
    
    // Create a gradient based on proportions
    // More accepted = greener, more pending = yellower, more denied = redder
    const r = Math.floor(28 + (220 - 28) * deniedRatio + (200 - 28) * pendingRatio)
    const g = Math.floor(167 + (236 - 167) * pendingRatio + (40 - 167) * deniedRatio)
    const b = Math.floor(69 + (35 - 69) * pendingRatio + (50 - 69) * deniedRatio)
    
    return `rgb(${Math.max(0, Math.min(255, r))}, ${Math.max(0, Math.min(255, g))}, ${Math.max(0, Math.min(255, b))})`
  }

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

  const maxValue = getMaxValue()

  return (
    <div className="canada-map-container">
      <div className="map-with-hover">
        <svg 
          viewBox="0 0 800 600" 
          className="canada-map-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Canada outline with more detail */}
          <g id="canada-outline">
            {/* Main Canada shape */}
            <path
              d="M 50 100 L 50 200 L 80 240 L 120 260 L 180 280 L 260 300 L 360 320 L 480 340 L 580 360 L 680 380 L 750 400 L 750 350 L 720 300 L 680 250 L 640 200 L 600 150 L 550 120 L 480 100 L 400 80 L 300 70 L 200 75 L 120 80 L 80 90 L 50 100 Z"
              fill="#f8f9fa"
              stroke="#003946"
              strokeWidth="2"
            />
            
            {/* Atlantic Canada (Maritimes + Newfoundland) */}
            <path
              d="M 680 380 L 720 400 L 760 420 L 780 440 L 780 400 L 760 380 L 730 360 L 700 370 L 680 380 Z"
              fill="#f8f9fa"
              stroke="#003946"
              strokeWidth="2"
            />
            
            {/* Vancouver Island */}
            <path
              d="M 80 280 L 140 300 L 140 320 L 100 330 L 80 310 L 80 280 Z"
              fill="#f8f9fa"
              stroke="#003946"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Province boundaries */}
          <g id="province-boundaries">
            {/* British Columbia / Alberta */}
            <path 
              d="M 200 100 L 200 350" 
              stroke="#003946" 
              strokeWidth="1.5" 
              strokeDasharray="5,3"
              opacity="0.6"
            />
            
            {/* Alberta / Saskatchewan */}
            <path 
              d="M 320 100 L 320 350" 
              stroke="#003946" 
              strokeWidth="1.5" 
              strokeDasharray="5,3"
              opacity="0.6"
            />
            
            {/* Saskatchewan / Manitoba */}
            <path 
              d="M 420 100 L 420 350" 
              stroke="#003946" 
              strokeWidth="1.5" 
              strokeDasharray="5,3"
              opacity="0.6"
            />
            
            {/* Manitoba / Ontario */}
            <path 
              d="M 500 100 L 500 380" 
              stroke="#003946" 
              strokeWidth="1.5" 
              strokeDasharray="5,3"
              opacity="0.6"
            />
            
            {/* Ontario / Quebec */}
            <path 
              d="M 600 100 L 600 400" 
              stroke="#003946" 
              strokeWidth="1.5" 
              strokeDasharray="5,3"
              opacity="0.6"
            />
            
            {/* Horizontal divisions (approximate) */}
            <path 
              d="M 100 200 L 700 200" 
              stroke="#003946" 
              strokeWidth="1" 
              strokeDasharray="3,3"
              opacity="0.4"
            />
            
            <path 
              d="M 100 300 L 700 300" 
              stroke="#003946" 
              strokeWidth="1" 
              strokeDasharray="3,3"
              opacity="0.4"
            />
          </g>
          
          {/* Province labels */}
          <g id="province-labels">
            <text x="150" y="250" fontSize="14" fontWeight="600" fill="#003946" opacity="0.7">BC</text>
            <text x="270" y="250" fontSize="14" fontWeight="600" fill="#003946" opacity="0.7">AB</text>
            <text x="370" y="250" fontSize="14" fontWeight="600" fill="#003946" opacity="0.7">SK</text>
            <text x="460" y="250" fontSize="14" fontWeight="600" fill="#003946" opacity="0.7">MB</text>
            <text x="550" y="300" fontSize="14" fontWeight="600" fill="#003946" opacity="0.7">ON</text>
            <text x="650" y="280" fontSize="14" fontWeight="600" fill="#003946" opacity="0.7">QC</text>
            <text x="710" y="400" fontSize="12" fontWeight="600" fill="#003946" opacity="0.7">NB</text>
            <text x="730" y="410" fontSize="12" fontWeight="600" fill="#003946" opacity="0.7">NS</text>
            <text x="760" y="380" fontSize="12" fontWeight="600" fill="#003946" opacity="0.7">PE</text>
            <text x="780" y="420" fontSize="12" fontWeight="600" fill="#003946" opacity="0.7">NL</text>
            <text x="250" y="150" fontSize="12" fontWeight="600" fill="#003946" opacity="0.7">YT</text>
            <text x="300" y="150" fontSize="12" fontWeight="600" fill="#003946" opacity="0.7">NT</text>
            <text x="350" y="150" fontSize="12" fontWeight="600" fill="#003946" opacity="0.7">NU</text>
          </g>
          
          {/* City markers with heatmap colors */}
          {Object.entries(CANADA_CITIES).map(([cityName, coords]) => {
            const data = getCityData(cityName)
            const total = data.total || 0
            const size = getCircleSize(total, maxValue)
            const heatmapColor = getHeatmapColor(data)
            const isHovered = hoveredCity === cityName
            
            return (
              <g key={cityName}>
                {/* Outer glow effect on hover */}
                {isHovered && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={size / 2 + 5}
                    fill="none"
                    stroke="#ECAB23"
                    strokeWidth="3"
                    opacity="0.5"
                    className="city-glow"
                  />
                )}
                
                {/* City circle with heatmap color */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={size / 2}
                  fill={heatmapColor}
                  stroke={isHovered ? '#0E3846' : '#fff'}
                  strokeWidth={isHovered ? 4 : 3}
                  opacity={0.85}
                  className="city-marker"
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current)
                    }
                    setHoveredCity(cityName)
                  }}
                  onMouseLeave={() => {
                    // Add a longer delay before hiding to prevent blinking
                    hoverTimeoutRef.current = setTimeout(() => {
                      setHoveredCity(null)
                    }, 200)
                  }}
                  onClick={() => onCityClick && onCityClick(cityName)}
                />
                
                {/* City label */}
                <text
                  x={coords.x}
                  y={coords.y + size / 2 + 18}
                  textAnchor="middle"
                  fontSize="13"
                  fill="#0E3846"
                  fontWeight="700"
                  className="city-label"
                >
                  {cityName}
                </text>
                
                {/* Total value label */}
                <text
                  x={coords.x}
                  y={coords.y + 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#fff"
                  fontWeight="700"
                  className="value-label"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {total}
                </text>
              </g>
            )
          })}
        </svg>
        
        {/* Hover tooltip with graph */}
        {hoveredCity && (() => {
          const city = getCityData(hoveredCity)
          const pieData = getPieData(city)
          const cityCoords = CANADA_CITIES[hoveredCity]
          
          // Calculate position relative to SVG viewBox (0-800 width, 0-600 height)
          // Convert to percentage for responsive positioning
          const leftPercent = ((cityCoords.x / 800) * 100)
          const topPercent = ((cityCoords.y / 600) * 100)
          
          return (
            <div 
              className="city-hover-tooltip"
              style={{
                left: `${Math.min(leftPercent + 5, 70)}%`,
                top: `${Math.max(topPercent - 15, 5)}%`,
                transform: leftPercent > 50 ? 'translateX(-100%)' : 'none'
              }}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current)
                }
                setHoveredCity(hoveredCity)
              }}
              onMouseLeave={() => {
                hoverTimeoutRef.current = setTimeout(() => {
                  setHoveredCity(null)
                }, 200)
              }}
            >
              <div className="tooltip-header">
                <h3>{hoveredCity}</h3>
                <div className="tooltip-stats">
                  <div className="tooltip-stat">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">{city.total || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="tooltip-chart">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => {
                        // Only show label if segment is large enough to prevent crowding
                        if (percent < 0.08) return ''
                        return `${name}: ${(percent * 100).toFixed(0)}%`
                      }}
                      outerRadius={45}
                      innerRadius={0}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        fontSize: '12px',
                        padding: '8px',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="tooltip-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-dot accepted"></span>
                  <span>Accepted: {city.accepted || 0}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-dot pending"></span>
                  <span>Pending: {city.pending || 0}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-dot denied"></span>
                  <span>Denied: {city.denied || 0}</span>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
      
      {/* Legend */}
      <div className="map-legend">
        <div className="legend-title">Heatmap Legend</div>
        <div className="legend-explanation">
          <p>Circle size represents total claims. Color indicates status distribution:</p>
        </div>
        <div className="legend-color-scheme">
          <div className="legend-status">
            <span className="legend-dot accepted"></span>
            <span>Accepted (Green)</span>
          </div>
          <div className="legend-status">
            <span className="legend-dot pending"></span>
            <span>Pending (Yellow)</span>
          </div>
          <div className="legend-status">
            <span className="legend-dot denied"></span>
            <span>Denied (Red)</span>
          </div>
        </div>
        <div className="legend-note">
          <p>Hover over cities to see detailed breakdown</p>
        </div>
      </div>
    </div>
  )
}

export default CanadaMap

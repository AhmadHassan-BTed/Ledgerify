import React, { useState, useMemo, useRef, useCallback } from 'react';
import { MapPin, Globe, Sparkles, Building2, ArrowUpRight, Compass, ZoomIn, ZoomOut, RotateCcw, Move, Navigation } from 'lucide-react';
import { GeoHotspotItem } from '../../types/analytics';

interface GeoDistributionMapProps {
  hotspots: GeoHotspotItem[];
  currencySymbol: string;
  datasetName?: string;
  regionCode?: string;
  onCityClick?: (cityName: string) => void;
}

type MapRegion = 'uk' | 'usa' | 'uae' | 'global';

// UK & Ireland Regional Coordinates (viewBox: 0 0 800 650)
const UK_COORDINATES: Record<string, { x: number; y: number; region: string }> = {
  // Scotland
  'aberdeen': { x: 490, y: 120, region: 'Scotland' },
  'dundee': { x: 470, y: 155, region: 'Scotland' },
  'edinburgh': { x: 450, y: 185, region: 'Scotland' },
  'glasgow': { x: 400, y: 195, region: 'Scotland' },
  'inverness': { x: 410, y: 90, region: 'Scotland' },
  'stirling': { x: 425, y: 175, region: 'Scotland' },

  // Northern Ireland
  'belfast': { x: 260, y: 250, region: 'Northern Ireland' },
  'derry': { x: 215, y: 230, region: 'Northern Ireland' },

  // North East & North West England
  'newcastle': { x: 480, y: 250, region: 'North East' },
  'sunderland': { x: 495, y: 255, region: 'North East' },
  'durham': { x: 480, y: 268, region: 'North East' },
  'middlesbrough': { x: 495, y: 280, region: 'North East' },
  'carlisle': { x: 420, y: 255, region: 'North West' },
  'lancaster': { x: 420, y: 310, region: 'North West' },
  'blackpool': { x: 400, y: 330, region: 'North West' },
  'preston': { x: 415, y: 335, region: 'North West' },
  'rochdale': { x: 445, y: 345, region: 'North West' },
  'bolton': { x: 425, y: 345, region: 'North West' },
  'manchester': { x: 440, y: 360, region: 'North West' },
  'salford': { x: 432, y: 360, region: 'North West' },
  'liverpool': { x: 405, y: 365, region: 'North West' },
  'warrington': { x: 420, y: 368, region: 'North West' },
  'chester': { x: 405, y: 385, region: 'North West' },

  // Yorkshire & The Humber
  'york': { x: 495, y: 330, region: 'Yorkshire' },
  'leeds': { x: 465, y: 340, region: 'Yorkshire' },
  'bradford': { x: 452, y: 342, region: 'Yorkshire' },
  'wakefield': { x: 468, y: 352, region: 'Yorkshire' },
  'huddersfield': { x: 455, y: 355, region: 'Yorkshire' },
  'hull': { x: 535, y: 345, region: 'Yorkshire' },
  'kingston upon hull': { x: 535, y: 345, region: 'Yorkshire' },
  'sheffield': { x: 470, y: 375, region: 'Yorkshire' },
  'doncaster': { x: 490, y: 365, region: 'Yorkshire' },

  // East & West Midlands
  'nottingham': { x: 485, y: 405, region: 'East Midlands' },
  'derby': { x: 465, y: 410, region: 'East Midlands' },
  'leicester': { x: 485, y: 430, region: 'East Midlands' },
  'lincoln': { x: 525, y: 385, region: 'East Midlands' },
  'northampton': { x: 495, y: 465, region: 'East Midlands' },
  'stoke-on-trent': { x: 430, y: 395, region: 'West Midlands' },
  'wolverhampton': { x: 435, y: 425, region: 'West Midlands' },
  'birmingham': { x: 445, y: 440, region: 'West Midlands' },
  'coventry': { x: 465, y: 445, region: 'West Midlands' },
  'worcester': { x: 430, y: 465, region: 'West Midlands' },

  // Wales
  'cardiff': { x: 390, y: 510, region: 'Wales' },
  'swansea': { x: 340, y: 505, region: 'Wales' },
  'newport': { x: 405, y: 505, region: 'Wales' },
  'wrexham': { x: 405, y: 395, region: 'Wales' },

  // East of England
  'norwich': { x: 590, y: 425, region: 'East England' },
  'ipswich': { x: 580, y: 475, region: 'East England' },
  'cambridge': { x: 525, y: 465, region: 'East England' },
  'peterborough': { x: 515, y: 430, region: 'East England' },
  'luton': { x: 500, y: 485, region: 'East England' },
  'colchester': { x: 565, y: 485, region: 'East England' },
  'chelmsford': { x: 545, y: 500, region: 'East England' },

  // Greater London & South East
  'london': { x: 520, y: 515, region: 'Greater London' },
  'greater london': { x: 520, y: 515, region: 'Greater London' },
  'croydon': { x: 522, y: 528, region: 'Greater London' },
  'watford': { x: 505, y: 505, region: 'Greater London' },
  'oxford': { x: 470, y: 490, region: 'South East' },
  'milton keynes': { x: 495, y: 475, region: 'South East' },
  'reading': { x: 485, y: 515, region: 'South East' },
  'slough': { x: 498, y: 515, region: 'South East' },
  'guildford': { x: 498, y: 535, region: 'South East' },
  'maidstone': { x: 550, y: 530, region: 'South East' },
  'canterbury': { x: 580, y: 530, region: 'South East' },
  'brighton': { x: 525, y: 565, region: 'South East' },
  'portsmouth': { x: 475, y: 565, region: 'South East' },
  'southampton': { x: 455, y: 555, region: 'South East' },

  // South West England
  'bristol': { x: 415, y: 510, region: 'South West' },
  'bath': { x: 425, y: 515, region: 'South West' },
  'gloucester': { x: 440, y: 480, region: 'South West' },
  'swindon': { x: 455, y: 510, region: 'South West' },
  'bournemouth': { x: 440, y: 565, region: 'South West' },
  'exeter': { x: 360, y: 565, region: 'South West' },
  'plymouth': { x: 325, y: 585, region: 'South West' },
  'torquay': { x: 365, y: 580, region: 'South West' }
};

// USA Coordinates (viewBox: 0 0 900 550)
const USA_COORDINATES: Record<string, { x: number; y: number; region: string }> = {
  'seattle': { x: 130, y: 90, region: 'Pacific NW' },
  'portland': { x: 120, y: 130, region: 'Pacific NW' },
  'san francisco': { x: 95, y: 240, region: 'California' },
  'san jose': { x: 105, y: 255, region: 'California' },
  'los angeles': { x: 135, y: 320, region: 'California' },
  'san diego': { x: 150, y: 345, region: 'California' },
  'las vegas': { x: 190, y: 280, region: 'Southwest' },
  'phoenix': { x: 230, y: 340, region: 'Southwest' },
  'salt lake city': { x: 260, y: 210, region: 'Mountain' },
  'denver': { x: 370, y: 240, region: 'Mountain' },
  'austin': { x: 470, y: 430, region: 'Texas' },
  'san antonio': { x: 460, y: 445, region: 'Texas' },
  'dallas': { x: 485, y: 385, region: 'Texas' },
  'houston': { x: 505, y: 445, region: 'Texas' },
  'minneapolis': { x: 510, y: 150, region: 'Midwest' },
  'kansas city': { x: 490, y: 260, region: 'Midwest' },
  'st. louis': { x: 540, y: 275, region: 'Midwest' },
  'chicago': { x: 575, y: 200, region: 'Midwest' },
  'detroit': { x: 640, y: 190, region: 'Midwest' },
  'indianapolis': { x: 605, y: 245, region: 'Midwest' },
  'cincinnati': { x: 630, y: 265, region: 'Midwest' },
  'nashville': { x: 615, y: 320, region: 'South' },
  'memphis': { x: 555, y: 335, region: 'South' },
  'atlanta': { x: 670, y: 360, region: 'Southeast' },
  'orlando': { x: 720, y: 460, region: 'Florida' },
  'tampa': { x: 705, y: 470, region: 'Florida' },
  'miami': { x: 745, y: 505, region: 'Florida' },
  'charlotte': { x: 710, y: 325, region: 'East Coast' },
  'raleigh': { x: 735, y: 305, region: 'East Coast' },
  'washington': { x: 745, y: 250, region: 'Mid-Atlantic' },
  'baltimore': { x: 755, y: 240, region: 'Mid-Atlantic' },
  'philadelphia': { x: 775, y: 220, region: 'Northeast' },
  'new york': { x: 795, y: 200, region: 'Northeast' },
  'boston': { x: 825, y: 165, region: 'New England' },
  'toronto': { x: 690, y: 150, region: 'Canada' },
  'vancouver': { x: 130, y: 65, region: 'Canada' }
};

// UAE / GCC Coordinates (viewBox: 0 0 800 500)
const UAE_COORDINATES: Record<string, { x: number; y: number; region: string }> = {
  'abu dhabi': { x: 380, y: 320, region: 'Abu Dhabi' },
  'al ain': { x: 450, y: 345, region: 'Abu Dhabi' },
  'dubai': { x: 440, y: 235, region: 'Dubai' },
  'sharjah': { x: 460, y: 215, region: 'Sharjah' },
  'ajman': { x: 472, y: 205, region: 'Ajman' },
  'umm al quwain': { x: 485, y: 190, region: 'Umm Al Quwain' },
  'ras al khaimah': { x: 505, y: 165, region: 'Ras Al Khaimah' },
  'fujairah': { x: 535, y: 230, region: 'Fujairah' },
  'riyadh': { x: 180, y: 290, region: 'Saudi Arabia' },
  'doha': { x: 320, y: 250, region: 'Qatar' },
  'manama': { x: 290, y: 220, region: 'Bahrain' },
  'muscat': { x: 630, y: 310, region: 'Oman' }
};

export const GeoDistributionMap: React.FC<GeoDistributionMapProps> = ({
  hotspots,
  currencySymbol,
  datasetName,
  regionCode,
  onCityClick
}) => {
  const [hoveredCity, setHoveredCity] = useState<GeoHotspotItem | null>(null);

  // Pan & Zoom States
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  // Determine optimal map projection mode based on dataset or region code
  const detectedRegion: MapRegion = useMemo(() => {
    const reg = (regionCode || '').toLowerCase();
    const name = (datasetName || '').toLowerCase();

    if (reg === 'uk' || reg === 'gb' || name.includes('uk') || name.includes('london') || name.includes('england')) {
      return 'uk';
    }
    if (reg === 'usa' || reg === 'us' || reg === 'ca' || name.includes('us') || name.includes('america') || name.includes('canada')) {
      return 'usa';
    }
    if (reg === 'uae' || reg === 'gcc' || name.includes('uae') || name.includes('dubai') || name.includes('emirates')) {
      return 'uae';
    }
    return 'uk';
  }, [regionCode, datasetName]);

  const [activeRegionView, setActiveRegionView] = useState<MapRegion>(detectedRegion);

  const handleRegionChange = (newRegion: MapRegion) => {
    setActiveRegionView(newRegion);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(parseFloat((prev + 0.25).toFixed(2)), 4.0));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(parseFloat((prev - 0.25).toFixed(2)), 0.6));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only respond to main left click
    if (e.button !== 0) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom(prev => Math.min(Math.max(parseFloat((prev + delta).toFixed(2)), 0.6), 4.0));
  };

  // Touch handlers for mobile / touchpads
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      hasMovedRef.current = false;
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true;
      }
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!hotspots || hotspots.length === 0) {
    return (
      <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-obsidian-900 border border-dashed border-slate-200 dark:border-obsidian-750 text-xs text-slate-400 dark:text-zinc-500">
        <Globe className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
        No geographic delivery records available for this period.
      </div>
    );
  }

  const maxOrders = Math.max(...hotspots.map(h => h.orderCount), 1);
  const totalShipments = hotspots.reduce((sum, h) => sum + h.orderCount, 0);

  // Resolve coordinates based on current activeRegionView
  const plottedHotspots = useMemo(() => {
    const coordMap = activeRegionView === 'uk'
      ? UK_COORDINATES
      : activeRegionView === 'usa'
      ? USA_COORDINATES
      : activeRegionView === 'uae'
      ? UAE_COORDINATES
      : UK_COORDINATES;

    return hotspots.slice(0, 10).map((h, index) => {
      const key = h.city.toLowerCase().trim();
      let coords = coordMap[key];

      if (!coords) {
        const hash = h.city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        if (activeRegionView === 'uk') {
          coords = {
            x: 380 + (hash % 150),
            y: 300 + ((hash * 3) % 240),
            region: h.provinceState || 'England'
          };
        } else if (activeRegionView === 'usa') {
          coords = {
            x: 200 + (hash % 500),
            y: 180 + ((hash * 3) % 250),
            region: h.provinceState || 'USA'
          };
        } else {
          coords = {
            x: 350 + (hash % 200),
            y: 200 + ((hash * 2) % 150),
            region: h.provinceState || 'UAE'
          };
        }
      }

      const radius = Math.max(7, Math.min(22, (h.orderCount / maxOrders) * 18 + 6));

      return {
        ...h,
        coords,
        radius,
        rank: index + 1
      };
    });
  }, [hotspots, activeRegionView, maxOrders]);

  // Center points per regional viewBox
  const viewBoxCenter = activeRegionView === 'uk'
    ? { cx: 400, cy: 325, vb: '0 0 800 650' }
    : activeRegionView === 'usa'
    ? { cx: 450, cy: 275, vb: '0 0 900 550' }
    : { cx: 400, cy: 250, vb: '0 0 800 500' };

  const isViewTransformed = zoom !== 1 || pan.x !== 0 || pan.y !== 0;

  return (
    <div className="space-y-4">
      {/* Map Control Header Bar: Region Focus Switcher & Live Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
            {activeRegionView === 'uk'
              ? 'United Kingdom & Ireland Logistics Hubs'
              : activeRegionView === 'usa'
              ? 'North America Commerce Hubs'
              : 'UAE & Arabian Gulf Logistics Hubs'}
          </span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
            ({plottedHotspots.length} Plotted)
          </span>
        </div>

        {/* Viewport Projection Switcher Tabs */}
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-obsidian-850 rounded-xl border border-slate-200 dark:border-obsidian-750 text-[11px]">
          <button
            type="button"
            onClick={() => handleRegionChange('uk')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeRegionView === 'uk'
                ? 'bg-role text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            UK &amp; Ireland View
          </button>
          <button
            type="button"
            onClick={() => handleRegionChange('usa')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeRegionView === 'usa'
                ? 'bg-role text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            North America View
          </button>
          <button
            type="button"
            onClick={() => handleRegionChange('uae')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeRegionView === 'uae'
                ? 'bg-role text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            UAE / GCC View
          </button>
        </div>
      </div>

      {/* Main Interactive Map Canvas Container with Pan & Zoom */}
      <div
        className={`relative w-full h-[390px] sm:h-[440px] rounded-3xl bg-gradient-to-b from-[#0b101e] via-[#080d1a] to-[#050811] border border-slate-800/90 overflow-hidden shadow-2xl flex items-center justify-center select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Futuristic Map Coordinate Grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid-pattern-radar" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.4" />
              <circle cx="25" cy="25" r="0.8" fill="#60a5fa" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-radar)" />
        </svg>

        {/* UK & Ireland High-Resolution Vector Contour Canvas */}
        {activeRegionView === 'uk' && (
          <svg
            viewBox={viewBoxCenter.vb}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="arc-gradient-uk" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
              </linearGradient>
              <radialGradient id="hub-glow-uk" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Transformed Group for smooth Pan & Zoom */}
            <g
              transform={`translate(${viewBoxCenter.cx + pan.x}, ${viewBoxCenter.cy + pan.y}) scale(${zoom}) translate(-${viewBoxCenter.cx}, -${viewBoxCenter.cy})`}
              style={{ transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}
            >
              {/* Scotland Contour */}
              <path
                d="M 370,50 Q 420,40 480,70 Q 520,110 500,160 Q 460,200 410,210 Q 360,200 370,140 Q 350,90 370,50 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.2"
                opacity="0.5"
              />
              {/* England & Wales Contour */}
              <path
                d="M 410,210 Q 480,220 510,280 Q 550,330 580,410 Q 610,480 570,530 Q 520,570 440,580 Q 350,590 310,570 Q 330,510 390,500 Q 360,450 400,380 Q 390,320 410,210 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.2"
                opacity="0.5"
              />
              {/* Northern Ireland Contour */}
              <path
                d="M 190,210 Q 250,200 270,240 Q 260,280 200,280 Q 180,250 190,210 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.2"
                opacity="0.4"
              />

              {/* Region Label Watermarks */}
              <text x="440" y="110" fill="#475569" fontSize="13" fontWeight="bold" opacity="0.4" textAnchor="middle">SCOTLAND</text>
              <text x="470" y="300" fill="#475569" fontSize="13" fontWeight="bold" opacity="0.4" textAnchor="middle">NORTH ENGLAND</text>
              <text x="460" y="420" fill="#475569" fontSize="13" fontWeight="bold" opacity="0.4" textAnchor="middle">MIDLANDS</text>
              <text x="510" y="550" fill="#475569" fontSize="13" fontWeight="bold" opacity="0.4" textAnchor="middle">SOUTH &amp; LONDON</text>
              <text x="230" y="245" fill="#475569" fontSize="10" fontWeight="bold" opacity="0.4" textAnchor="middle">N. IRELAND</text>

              {/* Logistics Flight & Dispatch Arcs from Origin (Top Hub #1) */}
              {plottedHotspots.length > 1 && plottedHotspots.slice(1, 7).map((point, i) => {
                const origin = plottedHotspots[0];
                const midX = (origin.coords.x + point.coords.x) / 2;
                const midY = Math.min(origin.coords.y, point.coords.y) - 35;
                return (
                  <g key={`arc-uk-${i}`}>
                    <path
                      d={`M ${origin.coords.x},${origin.coords.y} Q ${midX},${midY} ${point.coords.x},${point.coords.y}`}
                      fill="none"
                      stroke="url(#arc-gradient-uk)"
                      strokeWidth="1.6"
                      strokeDasharray="5 4"
                      opacity="0.75"
                    />
                  </g>
                );
              })}

              {/* Interactive City Hub Nodes */}
              {plottedHotspots.map((point) => {
                const isHovered = hoveredCity?.city === point.city;
                const isOrigin = point.rank === 1;

                return (
                  <g
                    key={point.city}
                    className="cursor-pointer transition-transform duration-200 group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasMovedRef.current) {
                        onCityClick?.(point.city);
                      }
                    }}
                    onMouseEnter={() => setHoveredCity(point)}
                    onMouseLeave={() => setHoveredCity(null)}
                  >
                    {/* Outer Pulsating Halo */}
                    <circle
                      cx={point.coords.x}
                      cy={point.coords.y}
                      r={point.radius * (isHovered ? 2.4 : 1.7)}
                      fill="url(#hub-glow-uk)"
                      className="animate-pulse"
                    />

                    {/* Main Node Point */}
                    <circle
                      cx={point.coords.x}
                      cy={point.coords.y}
                      r={isHovered ? point.radius + 3 : point.radius}
                      fill={isOrigin ? '#38bdf8' : isHovered ? '#60a5fa' : '#2563eb'}
                      stroke="#ffffff"
                      strokeWidth={isOrigin ? "2.5" : "1.8"}
                      className="shadow-xl"
                    />

                    {/* Inner Node Core */}
                    <circle
                      cx={point.coords.x}
                      cy={point.coords.y}
                      r={isOrigin ? "3.5" : "2.5"}
                      fill="#ffffff"
                    />

                    {/* Leader Tag / City Name Label */}
                    <rect
                      x={point.coords.x - 38}
                      y={point.coords.y - point.radius - 17}
                      width="76"
                      height="16"
                      rx="6"
                      fill={isHovered ? '#000000' : 'rgba(15, 23, 42, 0.85)'}
                      stroke={isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)'}
                      strokeWidth="0.8"
                    />
                    <text
                      x={point.coords.x}
                      y={point.coords.y - point.radius - 6}
                      textAnchor="middle"
                      fill={isHovered ? '#38bdf8' : '#ffffff'}
                      fontSize="9"
                      fontWeight="bold"
                      className="select-none font-sans"
                    >
                      {point.city}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        {/* USA / North America Vector Contour Canvas */}
        {activeRegionView === 'usa' && (
          <svg
            viewBox={viewBoxCenter.vb}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              transform={`translate(${viewBoxCenter.cx + pan.x}, ${viewBoxCenter.cy + pan.y}) scale(${zoom}) translate(-${viewBoxCenter.cx}, -${viewBoxCenter.cy})`}
              style={{ transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}
            >
              {/* US Mainland Contour */}
              <path
                d="M 120,80 Q 280,60 500,80 Q 720,70 820,120 Q 860,200 810,320 Q 750,460 720,510 Q 560,450 480,470 Q 380,350 200,370 Q 110,350 90,220 Q 80,130 120,80 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.2"
                opacity="0.45"
              />

              {/* Region Label Watermarks */}
              <text x="170" y="160" fill="#475569" fontSize="14" fontWeight="bold" opacity="0.4">PACIFIC</text>
              <text x="360" y="200" fill="#475569" fontSize="14" fontWeight="bold" opacity="0.4">MOUNTAIN</text>
              <text x="560" y="240" fill="#475569" fontSize="14" fontWeight="bold" opacity="0.4">MIDWEST</text>
              <text x="750" y="260" fill="#475569" fontSize="14" fontWeight="bold" opacity="0.4">EAST COAST</text>
              <text x="490" y="420" fill="#475569" fontSize="14" fontWeight="bold" opacity="0.4">TEXAS &amp; SOUTH</text>

              {/* Arcs */}
              {plottedHotspots.length > 1 && plottedHotspots.slice(1, 6).map((point, i) => {
                const origin = plottedHotspots[0];
                const midX = (origin.coords.x + point.coords.x) / 2;
                const midY = Math.min(origin.coords.y, point.coords.y) - 40;
                return (
                  <path
                    key={`arc-us-${i}`}
                    d={`M ${origin.coords.x},${origin.coords.y} Q ${midX},${midY} ${point.coords.x},${point.coords.y}`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.6"
                    strokeDasharray="5 4"
                    opacity="0.7"
                  />
                );
              })}

              {/* Plotted USA Nodes */}
              {plottedHotspots.map((point) => {
                const isHovered = hoveredCity?.city === point.city;
                return (
                  <g
                    key={point.city}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasMovedRef.current) {
                        onCityClick?.(point.city);
                      }
                    }}
                    onMouseEnter={() => setHoveredCity(point)}
                    onMouseLeave={() => setHoveredCity(null)}
                  >
                    <circle cx={point.coords.x} cy={point.coords.y} r={point.radius * 1.8} fill="#06b6d4" opacity="0.25" className="animate-pulse" />
                    <circle cx={point.coords.x} cy={point.coords.y} r={point.radius} fill={isHovered ? '#38bdf8' : '#2563eb'} stroke="#ffffff" strokeWidth="1.8" />
                    <rect x={point.coords.x - 38} y={point.coords.y - point.radius - 17} width="76" height="16" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="0.8" />
                    <text x={point.coords.x} y={point.coords.y - point.radius - 6} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">{point.city}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        {/* UAE / Arabian Gulf Canvas */}
        {activeRegionView === 'uae' && (
          <svg
            viewBox={viewBoxCenter.vb}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              transform={`translate(${viewBoxCenter.cx + pan.x}, ${viewBoxCenter.cy + pan.y}) scale(${zoom}) translate(-${viewBoxCenter.cx}, -${viewBoxCenter.cy})`}
              style={{ transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}
            >
              {/* Arabian Gulf Peninsula Contour */}
              <path
                d="M 120,280 Q 280,180 430,220 Q 530,160 560,240 Q 580,330 480,380 Q 320,440 180,380 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.2"
                opacity="0.45"
              />
              <text x="440" y="160" fill="#475569" fontSize="14" fontWeight="bold" opacity="0.4">ARABIAN GULF</text>
              <text x="350" y="380" fill="#475569" fontSize="14" fontWeight="bold" opacity="0.4">UNITED ARAB EMIRATES</text>

              {/* Plotted UAE Nodes */}
              {plottedHotspots.map((point) => {
                const isHovered = hoveredCity?.city === point.city;
                return (
                  <g
                    key={point.city}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasMovedRef.current) {
                        onCityClick?.(point.city);
                      }
                    }}
                    onMouseEnter={() => setHoveredCity(point)}
                    onMouseLeave={() => setHoveredCity(null)}
                  >
                    <circle cx={point.coords.x} cy={point.coords.y} r={point.radius * 1.8} fill="#06b6d4" opacity="0.25" className="animate-pulse" />
                    <circle cx={point.coords.x} cy={point.coords.y} r={point.radius} fill={isHovered ? '#38bdf8' : '#2563eb'} stroke="#ffffff" strokeWidth="1.8" />
                    <rect x={point.coords.x - 38} y={point.coords.y - point.radius - 17} width="76" height="16" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="0.8" />
                    <text x={point.coords.x} y={point.coords.y - point.radius - 6} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">{point.city}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        {/* Floating Pan & Zoom Interactive HUD Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 bg-black/80 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl z-20">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In (+)"
            className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] font-mono font-bold text-zinc-300 px-1.5 min-w-[36px] text-center select-none">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-white/20 my-auto" />

          <button
            type="button"
            onClick={handleResetView}
            title="Reset Map View (Pan & Zoom)"
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
              isViewTransformed
                ? 'text-role bg-role/20 hover:bg-role/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Pan Gesture Tip Helper */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 shadow-lg pointer-events-none">
          <Move className="w-3 h-3 text-role" />
          <span>Drag to Pan · Scroll to Zoom</span>
        </div>

        {/* Live Hover Dossier Tooltip */}
        {hoveredCity && (
          <div className="absolute top-12 left-3 p-3.5 rounded-2xl bg-black/90 backdrop-blur-xl border border-role shadow-2xl text-white text-xs animate-fade-in pointer-events-none space-y-1.5 z-20 max-w-[220px]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-role/20 flex items-center justify-center text-role flex-shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="font-extrabold text-white text-sm block truncate">{hoveredCity.city}</span>
                <span className="text-[10px] text-zinc-400 font-mono truncate block">Region: {hoveredCity.provinceState || 'Mainland'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1 text-[11px] font-mono border-t border-white/10">
              <span className="text-zinc-300">
                <strong className="text-role text-xs">{hoveredCity.orderCount}</strong> shipments
              </span>
              <span>·</span>
              <span className="text-emerald-400 font-bold text-xs">
                {currencySymbol}{Math.round(hoveredCity.totalValue).toLocaleString()}
              </span>
            </div>
            <span className="text-[9px] text-zinc-400 block pt-0.5 italic">
              Click hub to inspect orders manifest →
            </span>
          </div>
        )}

        {/* Bottom Legend */}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 font-mono flex items-center gap-2 shadow-lg pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-role animate-ping" />
          <span>Origin Hub: <strong className="text-white">{plottedHotspots[0]?.city || 'Primary Hub'}</strong></span>
        </div>
      </div>

      {/* Ranked Top Delivery Hubs Grid (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {hotspots.slice(0, 6).map((c, i) => {
          const share = Math.round((c.orderCount / Math.max(1, totalShipments)) * 100);
          return (
            <div
              key={c.city}
              onClick={() => onCityClick?.(c.city)}
              onMouseEnter={() => setHoveredCity(c)}
              onMouseLeave={() => setHoveredCity(null)}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-obsidian-850/80 border border-slate-200/80 dark:border-obsidian-750 flex items-center justify-between hover:border-role hover:bg-role-subtle/20 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-6 h-6 rounded-xl bg-slate-200 dark:bg-obsidian-750 text-slate-700 dark:text-zinc-300 font-mono text-xs font-black flex items-center justify-center flex-shrink-0">
                  #{i + 1}
                </span>
                <div className="truncate">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-role truncate block">
                      {c.city}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-role transition-opacity" />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono block">
                    {c.provinceState || 'Region'} · {share}% share
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white block">
                  {c.orderCount} parcels
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                  {currencySymbol}{Math.round(c.totalValue).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

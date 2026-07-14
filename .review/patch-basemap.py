from pathlib import Path

p = Path(r"D:/quickpickapp/components/marketing/experience-phone-live.tsx")
text = p.read_text(encoding="utf-8")
start = text.index("/** Rich original city basemap")

new_basemap = r'''/** Rich original city basemap with road hierarchy + depth */
function CityBasemap({ uid }: { uid: string }) {
  return (
    <svg
      className="experience-live-basemap"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`land-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EDEAE3" />
          <stop offset="55%" stopColor="#E8E4DB" />
          <stop offset="100%" stopColor="#E2DED4" />
        </linearGradient>
        <linearGradient id={`park-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9DDB8" />
          <stop offset="100%" stopColor="#AFC897" />
        </linearGradient>
        <linearGradient id={`water-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B3D4E6" />
          <stop offset="100%" stopColor="#8EBFD8" />
        </linearGradient>
        <filter id={`soft-${uid}`} x="-12%" y="-12%" width="124%" height="124%">
          <feDropShadow
            dx="0"
            dy="1.1"
            stdDeviation="1.4"
            floodColor="#1c221c"
            floodOpacity="0.14"
          />
        </filter>
        <filter id={`road-shadow-${uid}`}>
          <feDropShadow
            dx="0"
            dy="0.7"
            stdDeviation="0.9"
            floodColor="#2a3228"
            floodOpacity="0.2"
          />
        </filter>
        <radialGradient id={`vig-${uid}`} cx="50%" cy="42%" r="72%">
          <stop offset="48%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(36,40,30,0.11)" />
        </radialGradient>
      </defs>

      <rect width={VB_W} height={VB_H} fill={`url(#land-${uid})`} />

      <path
        d="M -12 148 C 36 132 78 154 98 182 C 120 214 116 246 90 274 C 58 310 18 320 -12 312 Z"
        fill={`url(#water-${uid})`}
        opacity="0.78"
        filter={`url(#soft-${uid})`}
      />
      <path
        d="M 248 436 C 286 420 318 438 340 458 L 340 500 L 236 500 C 232 472 236 448 248 436 Z"
        fill={`url(#water-${uid})`}
        opacity="0.5"
      />

      <g filter={`url(#soft-${uid})`}>
        <path
          d="M 16 42 C 48 28 92 34 108 58 C 122 80 108 104 78 108 C 42 112 8 88 16 42 Z"
          fill={`url(#park-${uid})`}
        />
        <path
          d="M 204 248 C 236 236 282 252 286 292 C 290 330 252 348 220 340 C 186 332 178 272 204 248 Z"
          fill={`url(#park-${uid})`}
          opacity="0.92"
        />
        <path
          d="M 40 418 C 72 400 118 416 124 448 C 128 470 96 486 64 480 C 28 472 20 436 40 418 Z"
          fill={`url(#park-${uid})`}
          opacity="0.88"
        />
        <path
          d="M 190 36 C 222 24 258 42 262 72 C 266 100 240 118 210 110 C 178 102 170 56 190 36 Z"
          fill={`url(#park-${uid})`}
          opacity="0.82"
        />
      </g>

      <g filter={`url(#soft-${uid})`}>
        <g fill="#D5D0C6">
          <path d="M 126 40 H 178 V 76 H 126 Z" />
          <path d="M 198 118 H 264 V 168 H 198 Z" />
          <path d="M 122 118 H 172 V 176 H 122 Z" />
          <path d="M 28 208 H 92 V 254 H 28 Z" />
          <path d="M 112 228 H 168 V 292 H 112 Z" />
          <path d="M 26 298 H 98 V 352 H 26 Z" />
          <path d="M 168 332 H 220 V 390 H 168 Z" />
          <path d="M 198 360 H 262 V 408 H 198 Z" />
          <path d="M 238 198 H 290 V 240 H 238 Z" />
          <path d="M 176 200 H 214 V 248 H 176 Z" />
        </g>
        <g fill="#C8C3B8" opacity="0.8">
          <rect x="136" y="50" width="24" height="14" rx="2" />
          <rect x="210" y="130" width="30" height="16" rx="2" />
          <rect x="42" y="220" width="26" height="14" rx="2" />
          <rect x="126" y="246" width="22" height="22" rx="2" />
          <rect x="42" y="314" width="28" height="14" rx="2" />
          <rect x="248" y="208" width="20" height="12" rx="2" />
        </g>
      </g>

      <g
        fill="none"
        stroke="#F7F5F0"
        strokeWidth="4.2"
        strokeLinecap="round"
        opacity="0.95"
        filter={`url(#road-shadow-${uid})`}
      >
        <path d="M 18 88 H 304" />
        <path d="M 18 168 H 304" />
        <path d="M 18 248 H 304" />
        <path d="M 18 328 H 304" />
        <path d="M 18 388 H 304" />
        <path d="M 84 18 V 466" />
        <path d="M 150 18 V 466" />
        <path d="M 214 18 V 466" />
        <path d="M 278 18 V 466" />
      </g>

      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#road-shadow-${uid})`}
      >
        <path d="M 16 412 H 304" />
        <path d="M 142 466 V 198" />
        <path d="M 142 210 C 170 190 210 176 250 172" />
        <path d="M 250 172 C 268 168 276 140 272 110 C 268 86 256 74 240 70" />
        <path d="M 48 420 C 56 360 60 300 68 240" />
      </g>

      <path
        d={ROUTE_D}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#road-shadow-${uid})`}
      />

      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#road-shadow-${uid})`}
      >
        <path d="M -6 168 C 70 150 140 178 330 162" />
        <path d="M 46 4 C 56 138 52 282 68 492" />
        <path d="M 186 -4 C 196 118 226 262 268 492" />
      </g>

      <g
        fill="none"
        stroke="#D4B45A"
        strokeWidth="1.2"
        strokeDasharray="6 8"
        strokeLinecap="round"
        opacity="0.48"
      >
        <path d="M -6 168 C 70 150 140 178 330 162" />
        <path d="M 46 4 C 56 138 52 282 68 492" />
        <path d="M 186 -4 C 196 118 226 262 268 492" />
      </g>

      <rect
        width={VB_W}
        height={VB_H}
        fill={`url(#vig-${uid})`}
        pointerEvents="none"
      />
    </svg>
  );
}
'''

p.write_text(text[:start] + new_basemap, encoding="utf-8")
print("ok")

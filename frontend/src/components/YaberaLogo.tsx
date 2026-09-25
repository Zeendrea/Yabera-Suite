// Yabera Suite logo component — extracted from brand image
// YS monogram in arch with olive branch accent

interface Props {
  variant?: 'full' | 'compact'
  className?: string
}

export default function YaberaLogo({ variant = 'compact', className = '' }: Props) {
  if (variant === 'full') {
    return (
      <svg
        viewBox="0 0 520 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Yabera Suites"
      >
        {/* YS Monogram in arch */}
        <path
          d="M 260 40 A 120 120 0 0 1 380 160 L 380 280 L 370 280 L 370 160 A 110 110 0 0 0 260 50 A 110 110 0 0 0 150 160 L 150 280 L 140 280 L 140 160 A 120 120 0 0 1 260 40 Z"
          stroke="#B8935A"
          strokeWidth="3"
          fill="none"
        />
        
        {/* Olive branch */}
        <g transform="translate(165, 200)">
          <path
            d="M 0 60 Q 10 40 15 20 Q 18 5 20 -10"
            stroke="#6B7A5A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="8" cy="48" rx="8" ry="14" fill="#6B7A5A" opacity="0.85" transform="rotate(-25 8 48)" />
          <ellipse cx="12" cy="32" rx="7" ry="13" fill="#768361" opacity="0.85" transform="rotate(-18 12 32)" />
          <ellipse cx="16" cy="16" rx="8" ry="13" fill="#6B7A5A" opacity="0.85" transform="rotate(-12 16 16)" />
          <ellipse cx="20" cy="0" rx="7" ry="12" fill="#768361" opacity="0.85" transform="rotate(-8 20 0)" />
          <ellipse cx="30" cy="44" rx="8" ry="14" fill="#768361" opacity="0.85" transform="rotate(25 30 44)" />
          <ellipse cx="26" cy="28" rx="7" ry="13" fill="#6B7A5A" opacity="0.85" transform="rotate(18 26 28)" />
          <ellipse cx="23" cy="12" rx="7" ry="12" fill="#768361" opacity="0.85" transform="rotate(12 23 12)" />
        </g>

        {/* Y */}
        <path
          d="M 225 120 L 260 180 L 295 120 M 260 180 L 260 240"
          stroke="#B8935A"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* S */}
        <path
          d="M 315 130 Q 305 120 290 120 Q 275 120 270 130 Q 265 140 270 150 L 290 180 Q 300 195 300 210 Q 300 225 290 230 Q 280 235 270 230"
          stroke="#B8935A"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />

        {/* YABERA text */}
        <text
          x="260"
          y="350"
          fontFamily="serif"
          fontSize="64"
          fontWeight="500"
          fill="#1A1A1A"
          textAnchor="middle"
          letterSpacing="8"
        >
          YABERA
        </text>

        {/* SUITES */}
        <g>
          <line x1="155" y1="385" x2="220" y2="385" stroke="#B8935A" strokeWidth="2" />
          <text
            x="260"
            y="395"
            fontFamily="sans-serif"
            fontSize="28"
            fontWeight="400"
            fill="#B8935A"
            textAnchor="middle"
            letterSpacing="6"
          >
            S U I T E S
          </text>
          <line x1="300" y1="385" x2="365" y2="385" stroke="#B8935A" strokeWidth="2" />
        </g>

        {/* IT PARK CEBU */}
        <text
          x="260"
          y="435"
          fontFamily="sans-serif"
          fontSize="20"
          fontWeight="500"
          fill="#1A1A1A"
          textAnchor="middle"
          letterSpacing="3"
        >
          📍 IT PARK CEBU
        </text>
      </svg>
    )
  }

  // Compact variant — just monogram
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="YS"
    >
      {/* Arch frame */}
      <path
        d="M 100 10 A 60 60 0 0 1 160 70 L 160 130 L 155 130 L 155 70 A 55 55 0 0 0 100 15 A 55 55 0 0 0 45 70 L 45 130 L 40 130 L 40 70 A 60 60 0 0 1 100 10 Z"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Olive accent */}
      <g transform="translate(52, 85)" opacity="0.7">
        <path d="M 0 20 Q 3 12 5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="2" cy="16" rx="3" ry="6" fill="currentColor" opacity="0.5" transform="rotate(-20 2 16)" />
        <ellipse cx="4" cy="10" rx="3" ry="5" fill="currentColor" opacity="0.5" transform="rotate(-15 4 10)" />
        <ellipse cx="6" cy="4" rx="3" ry="5" fill="currentColor" opacity="0.5" transform="rotate(-10 6 4)" />
        <ellipse cx="10" cy="15" rx="3" ry="6" fill="currentColor" opacity="0.5" transform="rotate(20 10 15)" />
        <ellipse cx="8" cy="9" rx="2.5" ry="5" fill="currentColor" opacity="0.5" transform="rotate(15 8 9)" />
      </g>

      {/* Y */}
      <path
        d="M 80 50 L 100 75 L 120 50 M 100 75 L 100 105"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* S */}
      <path
        d="M 135 55 Q 130 50 122 50 Q 115 50 112 55 Q 110 60 113 65 L 125 80 Q 130 87 130 95 Q 130 103 125 106 Q 120 108 115 106"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

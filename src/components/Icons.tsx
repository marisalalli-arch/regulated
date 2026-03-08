type IconProps = { size?: number; className?: string }

// Crescent Moon — horoscope / astrology
export function MoonIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
        fill="currentColor" fillOpacity="0.12"
      />
      <circle cx="17" cy="5.5" r="0.9" fill="currentColor" />
      <circle cx="20" cy="9" r="0.55" fill="currentColor" />
      <circle cx="19" cy="3.5" r="0.45" fill="currentColor" />
    </svg>
  )
}

// 4-pointed sparkle star — goals / intentions
export function SparkleIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2L13.6 10.4 22 12l-8.4 1.6L12 22l-1.6-8.4L2 12l8.4-1.6z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
        fill="currentColor" fillOpacity="0.12"
      />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" fillOpacity="0.4" stroke="none" />
      <circle cx="5" cy="5" r="0.7" fill="currentColor" />
      <circle cx="19" cy="19" r="0.7" fill="currentColor" />
    </svg>
  )
}

// Flame — movement / workout
export function FlameIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2C12 2 5.5 8 5.5 13.5a6.5 6.5 0 0 0 13 0C18.5 11 17 9 17 9s-0.5 3.5-2.5 4.5C15 11 14 7.5 12 2z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
        fill="currentColor" fillOpacity="0.13"
      />
      <path
        d="M10 17.5c0-1.5 1-2.5 2-2.5s2 1 2 2.5"
        stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"
      />
    </svg>
  )
}

// Faceted gem — tarot / intuition
export function GemIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 9L12 2l6 7-6 13z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
        fill="currentColor" fillOpacity="0.12"
      />
      <line x1="3.5" y1="9" x2="20.5" y2="9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="6" y1="9" x2="12" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="18" y1="9" x2="12" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  )
}

// Mystical eye — coach / AI
export function EyeIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M2 12C4 7 7.5 4.5 12 4.5S20 7 22 12c-2 5-5.5 7.5-10 7.5S4 17 2 12z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
        fill="currentColor" fillOpacity="0.08"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <path d="M12 2.5L12 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />
      <path d="M16.5 4L15.5 5.7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.3" />
      <path d="M7.5 4L8.5 5.7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.3" />
    </svg>
  )
}

// 6-petal bloom — habits / rituals
export function BloomIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="7.5" rx="2" ry="3.5" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
      <ellipse cx="12" cy="16.5" rx="2" ry="3.5" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
      <ellipse cx="7.27" cy="9.75" rx="2" ry="3.5" transform="rotate(-60 7.27 9.75)" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
      <ellipse cx="16.73" cy="9.75" rx="2" ry="3.5" transform="rotate(60 16.73 9.75)" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
      <ellipse cx="7.27" cy="14.25" rx="2" ry="3.5" transform="rotate(60 7.27 14.25)" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
      <ellipse cx="16.73" cy="14.25" rx="2" ry="3.5" transform="rotate(-60 16.73 14.25)" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
      <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.25" />
    </svg>
  )
}

// Feather — journal / reflection
export function FeatherIcon({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M20.24 4.76a6.5 6.5 0 0 0-9.19 0L3 13l1.5 1.5 1 3.5 3.5 1L10.5 20l8-8.05a6.5 6.5 0 0 0 1.74-7.19z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
        fill="currentColor" fillOpacity="0.11"
      />
      <path d="M4.5 14.5L10 20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 12l4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.45" />
      <path d="M11 9l4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.45" />
      <path d="M14 6.5l3.5 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.45" />
    </svg>
  )
}

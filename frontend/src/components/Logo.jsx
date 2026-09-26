export default function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" data-testid="site-logo" aria-label="Sarah Toscano logo">
      <defs>
        <linearGradient id="stg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF2A85" />
          <stop offset="1" stopColor="#E10078" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#0d0d14" />
      <rect x="3" y="3" width="58" height="58" rx="12" fill="none" stroke="url(#stg)" strokeWidth="2" />
      <text x="32" y="42" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="28" fontWeight="900" fill="url(#stg)" letterSpacing="-1">ST</text>
    </svg>
  );
}

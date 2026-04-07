export function MaxIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#005FF9"/>
      <path d="M4 17V7l4.5 5L13 7v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.5 12l2.5-5 2.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.8 14h6.4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

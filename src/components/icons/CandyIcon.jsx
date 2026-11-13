// Balde de pochoclo del mockup: se muestra cuando un producto no tiene imagen
function CandyIcon({ className = "admin-icon" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l1.5 12h9L18 9" />
      <path d="M5 9h14" />
      <path d="M8 9c-1.5-2 0-4.5 2-4 .5-2 3.5-2 4 0 2-.5 3.5 2 2 4" />
    </svg>
  );
}

export default CandyIcon;

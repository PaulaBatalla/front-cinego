function PlayIcon({ className = "logo-cinego__icon" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="40" height="40" rx="11" ry="11" fill="var(--brand-orange)" />
      <path
        d="M16 12.5 L16 27.5 L28.5 20 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export default PlayIcon;

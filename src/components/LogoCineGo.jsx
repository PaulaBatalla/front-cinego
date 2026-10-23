function LogoCineGo({ className = "" }) {
  return (
    <span className={`logo-cinego ${className}`.trim()}>
      <svg
        className="logo-cinego__icon"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="40" height="40" rx="11" ry="11" fill="var(--brand-orange)" />
        <path
          d="M15.5 12.5 L15.5 27.5 L28 20 Z"
          fill="none"
          stroke="#121212"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span className="logo-cinego__text">CineGo</span>
    </span>
  );
}

export default LogoCineGo;

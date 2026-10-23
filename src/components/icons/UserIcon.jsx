function UserIcon({ className = "site-login__icon" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 19.25c1.4-3.1 3.6-4.5 6.5-4.5s5.1 1.4 6.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default UserIcon;

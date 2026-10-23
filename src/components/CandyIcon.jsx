function CandyIcon({ tipo = "combo" }) {
  if (tipo === "bebida") {
    return (
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 8h10l-1.5 12h-7L7 8z" />
        <path d="M6 8h12" />
        <path d="M14 4l-2 4" />
      </svg>
    );
  }

  if (tipo === "pochoclo") {
    return (
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 10l1.2 11h7.6L17 10" />
        <path d="M6 10c0-1.5 1.5-2 2.5-1 1-1.5 3-1.5 4 0 1-1.5 3-1.5 4 0 1-1 2.5-.5 2.5 1H6z" />
        <line x1="10" y1="13" x2="10" y2="19" />
        <line x1="14" y1="13" x2="14" y2="19" />
      </svg>
    );
  }

  if (tipo === "nachos") {
    return (
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 14c0 4 3.5 7 8 7s8-3 8-7H4z" />
        <path d="M7 10l5-6 3 6" />
        <path d="M12 10l4-4 2 4" />
      </svg>
    );
  }

  // Por defecto: Bolsita de combo con manija (tal cual figura en el PDF mockup)
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8h12l1 12H5L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export default CandyIcon;

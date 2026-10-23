import { useEffect, useId, useState } from "react";

function useMobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerId = useId();

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((open) => !open);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = (event) => {
      if (event.matches) closeMenu();
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return {
    menuOpen,
    drawerId,
    closeMenu,
    toggleMenu,
  };
}

export default useMobileMenu;

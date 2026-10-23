import { PlayIcon } from "./icons";

function LogoCineGo({ className = "" }) {
  return (
    <span className={`logo-cinego ${className}`.trim()}>
      <PlayIcon />
      <span className="logo-cinego__text">CineGo</span>
    </span>
  );
}

export default LogoCineGo;

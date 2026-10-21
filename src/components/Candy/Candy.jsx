import CandyCard from "./CandyCard";
import ResumenCandy from "./ResumenCandy";
import { useCandy } from "../hooks/useCandy";

function Candy() {
  const { candy } = useCandy();

  return (
    <>
      <ResumenCandy />

      <div className="listado">
        {candy.map((producto) => (
          <CandyCard key={producto.id} item={producto} />
        ))}
      </div>
    </>
  );
}

export default Candy;
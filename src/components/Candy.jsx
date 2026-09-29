import CandyCard from "./CandyCard";
import {useCandy} from "../hooks/useCandy";

function Candy() {
  const { candy } = useCandy();
  return (
    <div className="listado">
      {candy.map((candy) => (
        <CandyCard key={candy.id} item={candy}/>
      ))}
    </div>
  );
}

export default Candy;
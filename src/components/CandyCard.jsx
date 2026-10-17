import { useDispatch, useSelector } from "react-redux";
import { agregarCandy } from "../store/slices/candySlice";
import CustomCard from "./CustomCard";

function CandyCard({ item }) {
  const dispatch = useDispatch();

  const seleccionado = useSelector((state) =>
    state.candy.items.some((producto) => producto.id === item.id)
  );

  return (
    <CustomCard
      image={item.imagenUrl}
      imageAlt={`Imagen de ${item.nombre}`}
      title={item.nombre}
      description={item.descripcion}
      precio={item.precio}
    >
      <button
        type="button"
        onClick={() => dispatch(agregarCandy(item))}
        disabled={seleccionado}
      >
        {seleccionado ? "Agregado" : "Agregar"}
      </button>
    </CustomCard>
  );
}

export default CandyCard;
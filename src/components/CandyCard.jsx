import { useDispatch, useSelector } from "react-redux";
import { agregarCandy } from "../store/slices/candySlice";
import CustomCard from "./CustomCard";

function CandyCard({ item }) {
  const dispatch = useDispatch();

  const cantidad = useSelector((state) => {
    const seleccionado = state.candy.items.find(
      (producto) => producto.id === item.id
    );

    return seleccionado ? seleccionado.cantidad : 0;
  });

  return (
    <CustomCard
      image={item.imagenUrl}
      imageAlt={`Imagen de ${item.nombre}`}
      title={item.nombre}
      description={item.descripcion}
      precio={item.precio}
    >
      <p>Unidades seleccionadas: {cantidad}</p>

      <button
        type="button"
        onClick={() => dispatch(agregarCandy(item))}
      >
        Agregar una unidad
      </button>
    </CustomCard>
  );
}

export default CandyCard;
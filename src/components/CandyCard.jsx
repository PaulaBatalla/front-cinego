import CustomCard from "./CustomCard";

function CandyCard({ item }) {
  return <CustomCard 
      image={item.imagenUrl}
      imageAlt={item.nombre}
      title={item.nombre}
      description={item.descripcion}
      precio={item.precio} />;
}

export default CandyCard;
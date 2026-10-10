function CustomCard({
  image,
  imageAlt,
  title,
  description,
  precio,
  badge,
  badgeTitle,
  duration,
  children,
}) {
  return (
    <div className="custom-card">
      <div className="custom-image-wrap">
        <img
          src={image}
          alt={imageAlt || title}
          className="custom-imagen"
        />

        {badge && (
          <span className="custom-card-badge" title={badgeTitle}>
            {badge}
          </span>
        )}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {duration && (
        <p className="custom-duration">
          Duración: {duration}
        </p>
      )}

      {precio && (
        <p className="custom-precio">
          ${precio}
        </p>
      )}

      {/* Lo que se pase entre <CustomCard> y </CustomCard> (por ejemplo, un botón) */}
      {children}
    </div>
  );
}

export default CustomCard;

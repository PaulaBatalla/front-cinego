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

      <div className="custom-card__body">
        <h3>{title}</h3>

        {description && (
          <p className="custom-card__description">{description}</p>
        )}

        {duration && (
          <p className="custom-duration">
            Duración: {duration} mins
          </p>
        )}

        {precio && (
          <p className="custom-precio">
            ${precio}
          </p>
        )}
      </div>

      {children && (
        <div className="custom-card__footer">{children}</div>
      )}
    </div>
  );
}

export default CustomCard;

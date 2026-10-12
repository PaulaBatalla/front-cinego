function CampoFormulario({
  etiqueta,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  children,
}) {
  return (
    <label className="auth-field">
      {etiqueta}
      {children ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
        />
      )}
      {error && <span className="auth-error">{error}</span>}
    </label>
  );
}

export default CampoFormulario;

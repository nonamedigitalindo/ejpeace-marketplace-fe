const Input = ({ type, onChange, style, placeholder, value, id, name }) => {
  return (
    <input
      type={type}
      className={style}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
      id={id}
      name={name}
    />
  );
};

export default Input;

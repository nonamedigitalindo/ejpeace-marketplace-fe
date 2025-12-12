const Button = ({ children, style, onClick, type }) => {
  return (
    <button className={`${style} cursor-pointer`} onClick={onClick} type={type}>
      {children}
    </button>
  );
};

export default Button;

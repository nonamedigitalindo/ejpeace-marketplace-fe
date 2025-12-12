const Label = ({ style, children, id, name }) => {
  return (
    <label className={style} id={id} name={name}>
      {children}
    </label>
  );
};

export default Label;

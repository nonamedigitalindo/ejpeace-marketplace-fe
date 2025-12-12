const Image = ({ style, src, alt }) => {
  return <img src={src} alt={alt} className={style} />;
};

export default Image;

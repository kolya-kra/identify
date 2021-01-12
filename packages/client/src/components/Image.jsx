import React, { useEffect, useState } from 'react';

const Image = (props) => {
  const [src, setSrc] = useState(props.src);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const onError = () => {
    if (!errorOccurred) {
      setErrorOccurred(true);
      console.log(props.fallbackSrc);
      if (props.fallbackSrc) setSrc(props.fallbackSrc);
    }
  };

  useEffect(() => {
    console.log(src);
  }, [src]);

  // eslint-disable-next-line
  return <img src={src} onError={onError} {...props} />;
};

export default Image;

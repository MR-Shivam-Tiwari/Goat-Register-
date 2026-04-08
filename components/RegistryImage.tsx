'use client';

import React from 'react';

interface RegistryImageProps {
  src: string;
  alt: string;
}

export default function RegistryImage({ src, alt }: RegistryImageProps) {
  const [imgSrc, setImgSrc] = React.useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc('/img/breeds/default.png');
      }}
      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
    />
  );
}

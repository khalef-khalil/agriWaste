'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Package } from 'lucide-react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  // If there's an error and no fallback image provided, show a placeholder
  if (error && !fallbackSrc) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted ${props.className}`}
        style={props.style}
      >
        <Package className="h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Image
      src={error ? (fallbackSrc || '') : src}
      alt={alt}
      {...props}
      onError={() => {
        setError(true);
      }}
    />
  );
} 
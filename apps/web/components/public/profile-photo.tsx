import { getImageProps } from 'next/image';

interface ProfilePhotoProps {
  alt: string;
  size: number;
  className: string;
}

/**
 * next/image always renders an inline `color: transparent`, which this site's nonce-based CSP
 * blocks and logs as a console error. getImageProps keeps the optimized src/srcSet while letting
 * the inline style be dropped.
 */
export function ProfilePhoto({ alt, size, className }: ProfilePhotoProps) {
  const { style: _inlineStyle, ...imageProps } = getImageProps({
    src: '/images/perfil.png',
    alt,
    width: size,
    height: size,
    className,
  }).props;

  return <img {...imageProps} alt={alt} />;
}

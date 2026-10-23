import React from 'react';
import { HERO_AVATARS, HeroAvatarItem } from '../data/avatars';

interface HeroAvatarProps {
  avatarId?: string;
  className?: string;
  sizeClassName?: string;
  alt?: string;
}

export const HeroAvatar: React.FC<HeroAvatarProps> = ({
  avatarId,
  className = '',
  sizeClassName = 'w-8 h-8',
  alt,
}) => {
  const avatar: HeroAvatarItem =
    HERO_AVATARS.find((a) => a.id === avatarId) || HERO_AVATARS[0];

  return (
    <div
      className={`rounded-full overflow-hidden bg-white/95 flex items-center justify-center p-0.5 border border-pink-500/60 shadow-sm shrink-0 ${sizeClassName} ${className}`}
    >
      <img
        src={avatar.src}
        alt={alt || avatar.name}
        className="w-full h-full object-contain rounded-full"
        loading="lazy"
        onError={(e) => {
          // Fallback if image fails
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    </div>
  );
};

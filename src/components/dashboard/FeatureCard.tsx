/**
 * 🎴 FEATURE CARD COMPONENT
 *
 * Editorial-style card with image top + content bottom
 * Inspired by Stitch "Editorial Storyboard V3" design
 *
 * @example
 * <FeatureCard
 *   title="Hotel List"
 *   description="Add hotels, map GPS coordinates..."
 *   imageUrl="/images/hotel.jpg"
 *   icon="Hotel"
 *   path="/admin-hotels"
 * />
 */

import React from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { getIcon, type IconName } from '../../lib/iconRegistry';
import { cn } from '../../lib/utils';

export interface FeatureCardProps {
  /** Card title */
  title: string;

  /** Card description */
  description: string;

  /** Image URL for card header */
  imageUrl?: string;

  /** Icon name from registry */
  icon?: string | IconName;

  /** Link path */
  path: string;

  /** Link label (default: "Go to {title}") */
  linkLabel?: string;

  /** Custom className */
  className?: string;

  /** Image aspect ratio class (default: aspect-[5/2]) */
  aspectRatio?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  imageUrl,
  icon,
  path,
  linkLabel,
  className,
  aspectRatio = 'aspect-[5/2.4]'
}) => {
  const IconComponent = icon ? getIcon(icon) : null;

  return (
    <Link
      to={path}
      className={cn(
        "group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden",
        "shadow-sm border border-gray-100 dark:border-gray-800",
        "flex flex-col transition-all duration-300",
        "hover:shadow-xl hover:shadow-brand-500/5",
        "no-underline block",
        className
      )}
    >
      {/* Image Header */}
      {imageUrl && (
        <div className={cn("overflow-hidden relative", aspectRatio)}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/20 dark:to-gray-900/40 pointer-events-none" />
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Icon Badge */}
        {IconComponent && (
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center rounded-2xl mb-6 transition-transform duration-300 group-hover:scale-110">
            <IconComponent className="w-6 h-6" strokeWidth={2} />
          </div>
        )}

        {/* Title */}
        <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
          {title}
        </h3>

        {/* Description */}
        <p className="text-md text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-1">
          {description}
        </p>

        {/* Link Label */}
        {linkLabel && (
          <div className="inline-flex items-center text-brand-500 font-bold text-md uppercase tracking-wider border-b-2 border-transparent group-hover:border-brand-500 transition-all pb-1 w-fit">
            {linkLabel}
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </Link>
  );
};

export default FeatureCard;

/**
 * 📢 CTA BANNER COMPONENT
 *
 * Full-width call-to-action banner for important actions
 * Used for Reports, Announcements, System Alerts, etc.
 *
 * @example
 * <CTABanner
 *   title="Executive Reports & Intelligence"
 *   description="Track revenue stats, driver payroll..."
 *   ctaLabel="View Reports"
 *   ctaPath="/admin-reports"
 *   icon="BarChart3"
 *   variant="dark"
 * />
 */

import React from 'react';
import { Link } from 'react-router';
import { getIcon, type IconName } from '../../lib/iconRegistry';
import { cn } from '../../lib/utils';

export interface CTABannerProps {
  /** Banner title */
  title: string;

  /** Banner description */
  description: string;

  /** CTA button label */
  ctaLabel: string;

  /** CTA button path */
  ctaPath: string;

  /** Icon for CTA button */
  icon?: string | IconName;

  /** Visual variant */
  variant?: 'dark' | 'brand' | 'light';

  /** Custom className */
  className?: string;

  /** Show decorative pattern */
  showPattern?: boolean;
}

const CTABanner: React.FC<CTABannerProps> = ({
  title,
  description,
  ctaLabel,
  ctaPath,
  icon,
  variant = 'dark',
  className,
  showPattern = true
}) => {
  const IconComponent = icon ? getIcon(icon) : null;

  const variantStyles = {
    dark: 'bg-gray-900 dark:bg-brand-600 text-white',
    brand: 'bg-brand-500 text-white',
    light: 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
  };

  return (
    <div
      className={cn(
        "rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between",
        "shadow-2xl overflow-hidden relative",
        variantStyles[variant],
        className
      )}
    >
      {/* Decorative Pattern */}
      {showPattern && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path
              d="M0 100 Q 25 0 50 100 T 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <path
              d="M0 80 Q 25 -20 50 80 T 100 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center md:text-left mb-8 md:mb-0 max-w-2xl">
        <h2 className="text-3xl font-bold mb-2 tracking-tight">{title}</h2>
        <p className={cn(
          "max-w-lg leading-relaxed",
          variant === 'light'
            ? 'text-gray-600 dark:text-gray-300'
            : 'text-white/70'
        )}>
          {description}
        </p>
      </div>

      {/* CTA Button */}
      <div className="relative z-10">
        <Link
          to={ctaPath}
          className={cn(
            "px-8 py-4 font-bold rounded-2xl transition-all flex items-center gap-3",
            "hover:scale-105 active:scale-95",
            variant === 'dark' || variant === 'brand'
              ? 'bg-white text-gray-900 hover:bg-gray-100'
              : 'bg-brand-500 text-white hover:bg-brand-600'
          )}
        >
          {ctaLabel}
          {IconComponent && <IconComponent className="w-5 h-5" />}
        </Link>
      </div>
    </div>
  );
};

export default CTABanner;

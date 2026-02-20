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
import { Heading, Paragraph } from '../typography';
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
  variant = 'dark',
  className,
  showPattern = true
}) => {

  const variantStyles = {
    dark: 'bg-gray-900 dark:bg-brand-600 text-white',
    brand: 'bg-brand-500 text-white',
    light: 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
  };

  const patternColors = {
    dark: 'text-gray-800',
    brand: 'text-brand-600',
    light: 'text-gray-100'
  };

  return (
    <Link
      to={ctaPath}
      className={cn(
        "rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between",
        "shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative",
        "transition-all hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1",
        "block no-underline",
        variantStyles[variant],
        className
      )}
    >
      {/* Decorative Pattern */}
      {showPattern && (
        <div className={cn("absolute inset-0 opacity-20 pointer-events-none", patternColors[variant])}>
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
        <Heading level="h2" className="mb-2 !text-white">
          {title}
        </Heading>
        <Paragraph
          size="lg"
          className={cn(
            "!max-w-lg",
            variant === 'light'
              ? '!text-gray-600 dark:!text-gray-300'
              : '!text-white/70'
          )}
        >
          {description}
        </Paragraph>
      </div>

      {/* CTA Button */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={cn(
            "px-6 py-3 text-sm font-bold rounded-xl transition-all inline-flex items-center gap-2",
            "hover:scale-105 active:scale-95",
            variant === 'dark' || variant === 'brand'
              ? 'bg-white text-gray-900 hover:bg-gray-100'
              : 'bg-brand-500 text-white hover:bg-brand-600'
          )}
        >
          {ctaLabel}
        </div>
      </div>
    </Link>
  );
};

export default CTABanner;

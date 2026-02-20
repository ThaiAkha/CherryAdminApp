/**
 * 🎨 UNIVERSAL ICON COMPONENT
 *
 * Single component to render any Lucide icon by name (string)
 * Compatible with database-driven UIs, dynamic menus, and hardcoded components
 *
 * @example
 * // From database
 * <Icon name="Package" size={24} />
 *
 * // With custom styling
 * <Icon name="Home" className="w-6 h-6 text-brand-500" />
 *
 * // With fallback
 * <Icon name={metadata?.icon} fallback="LayoutDashboard" />
 */

import React from 'react';
import { getIcon, type IconName } from '../../lib/iconRegistry';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface IconProps {
  /** Icon name as string (e.g., "Home", "Package") */
  name: string | IconName | undefined | null;

  /** Size shorthand (pixels) - overrides width/height */
  size?: number | string;

  /** Fallback icon name if main icon not found */
  fallback?: IconName;

  /** Custom className (Tailwind classes work) */
  className?: string;

  /** Stroke width (default: 2) */
  strokeWidth?: number;

  /** Additional SVG props */
  [key: string]: any;
}

/**
 * Universal Icon Component
 */
const Icon: React.FC<IconProps> = ({
  name,
  size,
  fallback = 'AlertCircle',
  className,
  strokeWidth = 2,
  ...svgProps
}) => {
  // Get icon component from registry
  const IconComponent = getIcon(name, getIcon(fallback));

  // Build className with size if provided
  const iconClassName = cn(
    size ? `w-[${size}px] h-[${size}px]` : '',
    className
  );

  return (
    <IconComponent
      className={iconClassName}
      strokeWidth={strokeWidth}
      {...svgProps}
    />
  );
};

export default Icon;

// ============================================================================
// UTILITY COMPONENT: IconByName (alias)
// ============================================================================

/**
 * Alternative component that takes icon as component directly
 * Useful for migration from old code
 */
export const DynamicIcon: React.FC<{
  icon: LucideIcon | string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}> = ({ icon, className, size, strokeWidth = 2 }) => {
  // If already a component, render directly
  if (typeof icon !== 'string') {
    const IconComponent = icon;
    return <IconComponent className={className} strokeWidth={strokeWidth} />;
  }

  // Otherwise use the Icon component
  return <Icon name={icon} className={className} size={size} strokeWidth={strokeWidth} />;
};

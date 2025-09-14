'use client';

import React from 'react';
import Link from 'next/link';
import { LinkProps } from 'next/link';
import { CSSProperties } from 'react';

// Define the base props without href to avoid type conflicts
interface BaseCustomLinkProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
  passHref?: boolean;
  legacyBehavior?: boolean;
}

// Extend LinkProps but make href required
interface CustomLinkProps extends BaseCustomLinkProps {
  href: string;
}

// Create the base CustomLink component
const CustomLink = React.forwardRef<HTMLAnchorElement, CustomLinkProps>(({
  href,
  children,
  className,
  style,
  onClick,
  title,
  ...props
}, ref) => {
  // If href is undefined, render children in a span
  if (!href) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }

  // Handle external links
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    // Filter out Next.js specific props
    const { passHref, legacyBehavior, ...anchorProps } = props;
    return (
      <a
        ref={ref}
        href={href}
        className={className}
        style={style}
        onClick={onClick}
        title={title}
        target="_blank"
        rel="noopener noreferrer nofollow"
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  // Handle DroomDroom links
  if (href.startsWith('https://droomdroom.com')) {
    // Filter out Next.js specific props
    const { passHref, legacyBehavior, ...anchorProps } = props;
    return (
      <a
        ref={ref}
        href={href}
        className={className}
        style={style}
        onClick={onClick}
        title={title}
        target="_blank"
        rel="noopener noreferrer"
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  // By default, use Link for internal links
  // Filter out props that shouldn't be passed to Link or anchor
  const { passHref, legacyBehavior, ...linkProps } = props;
  
  if (legacyBehavior) {
    return (
      <Link href={href} {...linkProps}>
        <a
          ref={ref}
          className={className}
          style={style}
          onClick={onClick}
          title={title}
        >
          {children}
        </a>
      </Link>
    );
  }
  
  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      style={style}
      onClick={onClick}
      title={title}
      {...linkProps}
    >
      {children}
    </Link>
  );
});

// Create the Link variant
const CustomLinkLink = React.forwardRef<HTMLAnchorElement, CustomLinkProps>(({
  href,
  children,
  className,
  style,
  onClick,
  title,
  ...props
}, ref) => {
  // Filter out props that shouldn't be passed to Link
  const { passHref, legacyBehavior, ...linkProps } = props;
  
  if (legacyBehavior) {
    return (
      <Link href={href} {...linkProps}>
        <a
          ref={ref}
          className={className}
          style={style}
          onClick={onClick}
          title={title}
        >
          {children}
        </a>
      </Link>
    );
  }
  
  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      style={style}
      onClick={onClick}
      title={title}
      {...linkProps}
    >
      {children}
    </Link>
  );
});

// Create the Anchor variant
const CustomLinkAnchor = React.forwardRef<HTMLAnchorElement, CustomLinkProps>(({
  href,
  children,
  className,
  style,
  onClick,
  title,
  ...props
}, ref) => {
  return (
    <a
      ref={ref}
      href={href}
      className={className}
      style={style}
      onClick={onClick}
      title={title}
      target="_blank"
      rel="noopener noreferrer nofollow"
      {...props}
    >
      {children}
    </a>
  );
});

// Add display names for better debugging
CustomLink.displayName = 'CustomLink';
CustomLinkLink.displayName = 'CustomLink.Link';
CustomLinkAnchor.displayName = 'CustomLink.a';

// Create the compound component
// The main CustomLink already uses Link by default for internal links,
// so we don't need to change the default behavior
const CompoundCustomLink = Object.assign(CustomLink, {
  Link: CustomLinkLink,
  a: CustomLinkAnchor
});

export default CompoundCustomLink;
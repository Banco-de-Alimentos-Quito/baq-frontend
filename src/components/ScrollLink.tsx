"use client";

import type React from 'react';

interface ScrollLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

const ScrollLink: React.FC<ScrollLinkProps> = ({ href, children, className, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = href.startsWith('#') ? href.substring(1) : href;
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

export default ScrollLink;

import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      {/* Replace this SVG with your actual logo image (e.g., <img src="/path/to/your/logo.png" alt="Your App Logo" className="h-16 w-auto" />) */}
      <svg
        className="h-16 w-auto text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      <span className="ml-3 text-3xl font-extrabold text-primary">ServiceFlow</span>
    </div>
  );
};

export default Logo;
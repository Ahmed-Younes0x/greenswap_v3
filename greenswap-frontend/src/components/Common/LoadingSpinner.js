import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'جاري التحميل...', 
  color = 'primary',
  centered = false 
}) => {
  const sizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  }[size];

  const spinner = (
    <div className="d-flex align-items-center">
      <div className={`spinner-border text-${color} ${sizeClass} me-2`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <span>{text}</span>}
      }
    </div>
  );

  if (centered) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
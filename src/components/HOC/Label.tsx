import React from 'react';
interface LabelProps {
  label: string;
  children: React.ReactNode;
  require?: boolean;
}

const LabelContent: React.FC<LabelProps> = ({ label, children, require = false }) => (
  <div className="label-container">
    <label htmlFor={label}>
      { label }
      { require && (<span className="text-rose-600"> * </span>) } 
    </label>
    <div className="relative text-white-dark">
      { children }
    </div>
  </div>
);

export default LabelContent;
import React from 'react';
import Select from 'react-select';

// DigiWave Professional Color Scheme
const digiWaveColors = {
  primary: '#6366f1',      // Indigo - Professional primary
  primaryLight: '#a5b4fc', // Light indigo
  primaryDark: '#4338ca',  // Dark indigo
  secondary: '#10b981',    // Emerald - Success/accent
  secondaryLight: '#6ee7b7', // Light emerald
  accent: '#f59e0b',       // Amber - Warning/highlight
  neutral: '#6b7280',      // Gray - Text
  neutralLight: '#f3f4f6', // Light gray - Background
  border: '#d1d5db',       // Border gray
  white: '#ffffff',
  dark: '#1f2937',
};

// Custom styles for React Select with DigiWave theme
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    border: `1px solid ${state.isFocused ? digiWaveColors.primary : digiWaveColors.border}`,
    borderRadius: '0.5rem',
    padding: '0.125rem',
    minHeight: '42px',
    boxShadow: state.isFocused ? `0 0 0 3px ${digiWaveColors.primary}20` : 'none',
    backgroundColor: digiWaveColors.white,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      borderColor: digiWaveColors.primary,
      boxShadow: `0 0 0 1px ${digiWaveColors.primary}40`
    }
  }),
  
  placeholder: (provided) => ({
    ...provided,
    color: digiWaveColors.neutral,
    fontSize: '0.875rem',
  }),
  
  singleValue: (provided) => ({
    ...provided,
    color: digiWaveColors.dark,
    fontSize: '0.875rem',
  }),
  
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: `${digiWaveColors.primary}15`,
    borderRadius: '0.375rem',
    border: `1px solid ${digiWaveColors.primary}30`,
  }),
  
  multiValueLabel: (provided) => ({
    ...provided,
    color: digiWaveColors.primaryDark,
    fontSize: '0.8125rem',
    fontWeight: '500',
    padding: '2px 6px',
  }),
  
  multiValueRemove: (provided) => ({
    ...provided,
    color: digiWaveColors.primaryDark,
    borderRadius: '0 0.375rem 0.375rem 0',
    '&:hover': {
      backgroundColor: digiWaveColors.primary,
      color: digiWaveColors.white,
    },
  }),
  
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.5rem',
    border: `1px solid ${digiWaveColors.border}`,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 9999,
  }),
  
  menuList: (provided) => ({
    ...provided,
    padding: '0.25rem',
    maxHeight: '200px',
  }),
  
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? digiWaveColors.primary 
      : state.isFocused 
        ? `${digiWaveColors.primary}10` 
        : 'transparent',
    color: state.isSelected 
      ? digiWaveColors.white 
      : digiWaveColors.dark,
    borderRadius: '0.375rem',
    margin: '1px 0',
    padding: '8px 12px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    '&:hover': {
      backgroundColor: state.isSelected 
        ? digiWaveColors.primaryDark 
        : `${digiWaveColors.primary}15`,
    },
  }),
  
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: digiWaveColors.border,
  }),
  
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? digiWaveColors.primary : digiWaveColors.neutral,
    '&:hover': {
      color: digiWaveColors.primary,
    },
  }),
  
  clearIndicator: (provided) => ({
    ...provided,
    color: digiWaveColors.neutral,
    '&:hover': {
      color: digiWaveColors.accent,
    },
  }),
};

// Form Section Component with DigiWave theme
export const FormSection = ({ title, icon: Icon, children, bgColor = "bg-indigo-50", textColor = "text-indigo-800" }) => (
  <tr className={bgColor}>
    <th colSpan="4" className={`p-4 text-left font-semibold ${textColor} border border-gray-300`}>
      <Icon className="inline h-5 w-5 mr-2" />
      {title}
    </th>
  </tr>
);

// Form Row Component
export const FormRow = ({ children }) => (
  <tr>{children}</tr>
);

// Form Field Component
export const FormField = ({ label, children, colSpan = 1 }) => (
  <>
    <th className="p-3 text-left font-medium bg-gray-50 border border-gray-300 w-1/4">{label}</th>
    <td colSpan={colSpan} className="p-3 border border-gray-300">
      {children}
    </td>
  </>
);

// Input Component with DigiWave theme
export const Input = ({ type = "text", value, onChange, placeholder, required, className = "", ...props }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm
      focus:outline-none focus:ring-3 focus:ring-indigo-100 focus:border-indigo-500
      hover:border-indigo-400 transition-all duration-200 ${className}`}
    style={{
      minHeight: '42px'
    }}
    {...props}
  />
);

// Select Component
export const SelectField = ({ value, onChange, options, placeholder, isMulti = false, ...props }) => (
  <Select
    value={value}
    onChange={onChange}
    options={options}
    placeholder={placeholder}
    isMulti={isMulti}
    styles={selectStyles}
    className="react-select-container"
    classNamePrefix="react-select"
    {...props}
  />
);

// Textarea Component with DigiWave theme
export const Textarea = ({ value, onChange, placeholder, rows = 3, className = "" }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm
      focus:outline-none focus:ring-3 focus:ring-indigo-100 focus:border-indigo-500
      hover:border-indigo-400 transition-all duration-200 resize-none ${className}`}
  />
);

// Chip Display Component for selected items
export const ChipDisplay = ({ items, onRemove }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {items.map((item, index) => (
      <span
        key={index}
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
      >
        {item.label}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="ml-1 text-blue-600 hover:text-blue-800"
          >
            ×
          </button>
        )}
      </span>
    ))}
  </div>
);

"use client";

import React from 'react';
import CreatableSelect from 'react-select/creatable';

/**
 * AppSelect - A reusable wrapper for react-select/creatable
 * Supports standard selection and creation of new options.
 */
const AppSelect = ({ options, onChange, onCreateOption, value, placeholder, className = "", isDisabled = false }) => {
  // Custom styles to match the app's modern UI and dark mode
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#2563EB' : 'var(--color-border, #E2E8F0)',
      backgroundColor: 'transparent',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#2563EB',
      },
      padding: '2px',
      fontSize: '0.875rem',
      color: 'inherit',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      zIndex: 100,
      backgroundColor: 'var(--color-bg-card, #FFFFFF)',
      border: '1px solid var(--color-border, #E2E8F0)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#2563EB' 
        : state.isFocused 
          ? 'var(--color-bg-hover, #F1F5F9)' 
          : 'transparent',
      color: state.isSelected ? 'white' : 'var(--color-text-primary, #0F172A)',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#2563EB',
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--color-text-primary, #0F172A)',
    }),
    input: (base) => ({
      ...base,
      color: 'var(--color-text-primary, #0F172A)',
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--color-text-muted, #94A3B8)',
    }),
  };

  return (
    <div className={`app-select-wrapper ${className}`}>
      <CreatableSelect
        isClearable
        isDisabled={isDisabled}
        options={options}
        value={value}
        onChange={onChange}
        onCreateOption={onCreateOption}
        placeholder={placeholder}
        styles={customStyles}
        classNamePrefix="react-select"
        formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
      />
    </div>
  );
};

export default AppSelect;

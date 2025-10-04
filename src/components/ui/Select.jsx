"use client"
import React, { useState } from "react";

const Select = ({ children, value, onValueChange }) => {
  return (
    <select value={value} onChange={(e) => onValueChange(e.target.value)} className="w-full p-2 border rounded-md">
      {children}
    </select>
  );
};

const SelectContent = ({ children }) => {
  return <>{children}</>;
};

const SelectItem = ({ children, value }) => {
  return <option value={value}>{children}</option>;
};

const SelectTrigger = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

const SelectValue = ({ placeholder }) => {
  return <span>{placeholder}</span>;
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
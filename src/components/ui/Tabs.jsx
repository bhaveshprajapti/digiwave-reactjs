"use client"
import React, { useState } from "react";

const Tabs = ({ children, defaultValue, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabClick = (value) => {
    setActiveTab(value);
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (child.type === TabsList) {
          return React.cloneElement(child, { activeTab, handleTabClick });
        } else if (child.type === TabsContent && child.props.value === activeTab) {
          return child;
        }
        return null;
      })}
    </div>
  );
};

const TabsList = ({ children, activeTab, handleTabClick, className }) => (
  <div className={`flex border-b ${className}`}>
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { activeTab, handleTabClick })
    )}
  </div>
);

const TabsTrigger = ({ children, value, activeTab, handleTabClick, className }) => (
  <button
    onClick={() => handleTabClick(value)}
    className={`px-4 py-2 -mb-px border-b-2 ${activeTab === value ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} ${className}`}>
    {children}
  </button>
);

const TabsContent = ({ children, value, className }) => (
  <div className={className}>{children}</div>
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
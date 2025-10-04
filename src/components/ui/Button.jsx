"use client"
import React from "react";

const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={`px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 ${className}`}>
    {children}
  </button>
);

export { Button };
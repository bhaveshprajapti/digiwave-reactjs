import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

// Track number of open modals for nested modal support
let openModalCount = 0;

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'lg', 
  showCloseButton = true,
  nested = false // New prop to indicate if this is a nested modal
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      openModalCount++;
      // Only set overflow hidden if this is the first modal
      if (openModalCount === 1) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      const timer = setTimeout(() => setIsVisible(false), 150);
      openModalCount = Math.max(0, openModalCount - 1);
      // Only restore overflow if no modals are open
      if (openModalCount === 0) {
        document.body.style.overflow = 'unset';
      }
      return () => clearTimeout(timer);
    }

    return () => {
      if (isOpen) {
        openModalCount = Math.max(0, openModalCount - 1);
        if (openModalCount === 0) {
          document.body.style.overflow = 'unset';
        }
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-5xl',
    '5xl': 'max-w-6xl',
    '6xl': 'max-w-7xl',
  };

  // Increase z-index for nested modals
  const zIndex = nested ? 'z-[60]' : 'z-50';

  return (
    <div className={`fixed inset-0 ${zIndex} transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Background overlay */}
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`}
          onClick={onClose}
        />

        {/* Modal panel */}
        <div 
          ref={modalRef}
          className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-2xl transform transition-all duration-300 flex flex-col ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
              {title && (
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto p-6 flex-grow">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

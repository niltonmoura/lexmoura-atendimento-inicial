import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, hideCloseButton = false }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !hideCloseButton) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose, hideCloseButton]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={!hideCloseButton ? onClose : undefined}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {!hideCloseButton && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div className="overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

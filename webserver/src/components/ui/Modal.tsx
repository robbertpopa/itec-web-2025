import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cn from 'lib/utils/cn';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setMounted(true);
    
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (overlayRef.current === e.target) {
      onClose();
    }
  };
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!mounted || !isOpen) return null;
  
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/40 backdrop-blur-sm p-4"
      ref={overlayRef}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={cn(
          "bg-base-100 rounded-lg shadow-xl max-h-[90vh] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 border border-base-300",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 !pb-0">
          <h2 className="text-lg font-semibold text-base-content">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-base-200 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-base-content" />
          </button>
        </div>
        <div className="divider"></div>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-4rem)] text-base-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
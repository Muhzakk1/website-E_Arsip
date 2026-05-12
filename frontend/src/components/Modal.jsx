import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00000080] animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-[#ffffff] rounded-[10px] p-[24px] w-[460px] max-w-[90vw] shadow-xl animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-[600] text-[15px]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-[#000000] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {/* Divider */}
        <div className="border-b-[0.5px] border-[#E0E0E0] my-[14px]" />
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}

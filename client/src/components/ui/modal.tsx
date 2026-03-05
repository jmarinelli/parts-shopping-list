import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[4px]"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-md border border-border bg-surface-raised p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-[13px] text-muted">{description}</p>
        )}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

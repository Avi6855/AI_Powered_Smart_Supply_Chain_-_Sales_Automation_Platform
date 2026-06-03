'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open:          boolean;
  onClose:       () => void;
  title?:        string;
  description?:  string;
  children:      React.ReactNode;
  footer?:       React.ReactNode;
  size?:         'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?:    string;
  showClose?:    boolean;
}

const sizeMap: Record<string, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl':'max-w-2xl',
  full: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size      = 'md',
  className,
  showClose = true,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* Overlay */}
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                key="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
            </DialogPrimitive.Overlay>

            {/* Content */}
            <DialogPrimitive.Content asChild forceMount>
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <motion.div
                  key="modal-content"
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1,    y: 0  }}
                  exit={{ opacity: 0, scale: 0.92,    y: 20 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={cn(
                    'w-full glass-card rounded-2xl border border-white/10 shadow-glass',
                    'overflow-hidden flex flex-col max-h-[90vh]',
                    sizeMap[size],
                    className
                  )}
                >
                  {/* Header */}
                  {(title || showClose) && (
                    <div className="flex items-start justify-between p-6 border-b border-white/8 shrink-0">
                      <div>
                        {title && (
                          <DialogPrimitive.Title className="text-lg font-bold font-outfit text-slate-100">
                            {title}
                          </DialogPrimitive.Title>
                        )}
                        {description && (
                          <DialogPrimitive.Description className="text-sm text-slate-500 mt-1">
                            {description}
                          </DialogPrimitive.Description>
                        )}
                      </div>
                      {showClose && (
                        <DialogPrimitive.Close
                          onClick={onClose}
                          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors shrink-0 ml-4"
                        >
                          <X size={18} />
                        </DialogPrimitive.Close>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {children}
                  </div>

                  {/* Footer */}
                  {footer && (
                    <div className="p-6 border-t border-white/8 flex items-center justify-end gap-3 shrink-0">
                      {footer}
                    </div>
                  )}
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open:        boolean;
  onClose:     () => void;
  onConfirm:   () => void;
  title:       string;
  description: string;
  confirmLabel?: string;
  cancelLabel?:  string;
  isDestructive?: boolean;
  isLoading?:    boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel  = 'Confirm',
  cancelLabel   = 'Cancel',
  isDestructive = false,
  isLoading     = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="btn-ghost text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              isDestructive
                ? 'bg-danger-500/10 border border-danger-500/30 text-danger-400 hover:bg-danger-500/20'
                : 'btn-primary'
            )}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </>
      }
    >
      <div />
    </Modal>
  );
}

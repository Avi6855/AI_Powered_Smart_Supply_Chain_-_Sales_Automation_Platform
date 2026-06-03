'use client';

import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ScopedAiAssistant } from '@/components/ai/ScopedAiAssistant';

export function AiFab({
  moduleName,
  data,
  suggestedPrompts,
}: {
  moduleName: string;
  data: unknown[];
  suggestedPrompts?: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-primary/25 bg-primary text-primary-foreground px-4 py-3 shadow-lg hover:brightness-110 active:brightness-95 transition"
      >
        <span className="flex items-center justify-center h-9 w-9 rounded-full bg-white/15 border border-white/20">
          <Bot className="h-5 w-5" />
        </span>
        <span className="font-semibold">{moduleName} AI</span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`${moduleName} AI`}
        description=""
        size="full"
        className="max-w-4xl"
      >
        <ScopedAiAssistant moduleName={moduleName} data={data} suggestedPrompts={suggestedPrompts} />
      </Modal>
    </>
  );
}


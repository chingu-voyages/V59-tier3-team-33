'use client';

import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { FaChevronUp } from 'react-icons/fa';

interface SidebarShellProps {
  children: React.ReactNode;
}

export function SidebarShell({ children }: SidebarShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: Fixed floating panel on the right */}
      <div className="hidden md:block fixed top-20 right-0 bottom-4 w-[400px] h-screen bg-surface-50 rounded-2xl shadow-2xl border border-surface-500 overflow-hidden z-20">
        <div className="h-full overflow-y-auto">{children}</div>
      </div>

      {/* Mobile: Toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-400 text-surface-50 rounded-full shadow-lg flex items-center justify-center z-20 hover:bg-primary-500 transition-colors"
        aria-label="Open trip details"
      >
        <FaChevronUp className="text-xl" />
      </button>

      {/* Mobile: Full-height drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="md:hidden h-[90vh]">
          <DrawerHeader className="border-b border-surface-500">
            <DrawerTitle className="text-neutral-400">Trip Details</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-8">{children}</div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

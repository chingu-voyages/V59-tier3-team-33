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
      <aside className="hidden h-screen w-[390px] shrink-0 border-l border-surface-500 bg-surface-50 shadow-xl md:flex md:flex-col">
        <div className="h-full overflow-y-auto">{children}</div>
      </aside>

      <button
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary-400 text-surface-50 shadow-lg transition-colors hover:bg-primary-500 md:hidden"
        aria-label="Open trip details"
      >
        <FaChevronUp className="text-xl" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="h-[90vh] md:hidden">
          <DrawerHeader className="border-b border-surface-500">
            <DrawerTitle className="text-neutral-400">Trip Details</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-8">{children}</div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

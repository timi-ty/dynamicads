"use client";

import { type ReactNode } from "react";
import useNoDocumentScroll from "../_hooks/useNoDocumentScroll";

export default function ModalOverlay({
  children,
}: Readonly<{ children: ReactNode }>) {
  useNoDocumentScroll();

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-dvh w-dvw flex-col items-center justify-center">
      <div className="absolute z-0 h-full w-full bg-black opacity-[0.16]"></div>
      <div className="relative z-[1] m-auto rounded-lg border bg-white p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}

"use client";

import { Provider } from "jotai";
import { type ReactNode } from "react";

export default function AtomProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <Provider>{children}</Provider>;
}

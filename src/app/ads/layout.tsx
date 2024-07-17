import { type ReactNode } from "react";

export default function AdsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}

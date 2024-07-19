"use client";

import { createContext, useState, type ReactNode } from "react";

export interface MenuStateConsumer {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

export function MenuStateContextProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <MenuStateContext.Provider
      value={{
        isMenuOpen: isMenuOpen,
        toggleMenu: () => setIsMenuOpen((m) => !m),
        closeMenu: () => setIsMenuOpen(false),
      }}
    >
      {isMenuOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 top-0 z-20 bg-black opacity-50"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      {children}
    </MenuStateContext.Provider>
  );
}

const defaultConsumer: MenuStateConsumer = {
  isMenuOpen: false,
  toggleMenu: function (): void {
    throw new Error("Function not implemented.");
  },
  closeMenu: function (): void {
    throw new Error("Function not implemented.");
  },
};

const MenuStateContext = createContext(defaultConsumer);

export default MenuStateContext;

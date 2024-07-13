"use client";

import { ReactNode, useState } from "react";

export default function withDropdown<T>(
  BaseComponent: (props: T) => ReactNode,
) {
  return ({
    items,
    onSelectItem,
    className,
  }: Readonly<{
    items: T[];
    onSelectItem?: (selected: T) => void;
    className?: string;
  }>) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selected, setSelected] = useState(0);
    return (
      <div className={className} onClick={() => setIsExpanded((x) => !x)}>
        {items &&
          items.length > 0 &&
          items[selected] &&
          BaseComponent(items[selected])}
        {isExpanded &&
          items &&
          items.map((item, i) => {
            return i === selected ? (
              // Do not show the already selected item as part of the dropdown
              <></>
            ) : (
              <div
                onClick={() => {
                  setSelected(i);
                  if (onSelectItem) onSelectItem(item);
                }}
              >
                {BaseComponent(item)}
              </div>
            );
          })}
      </div>
    );
  };
}

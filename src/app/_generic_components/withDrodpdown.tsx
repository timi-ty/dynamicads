"use client";

import { ReactNode, useState } from "react";

type PropsType<T> = {
  data: T;
  isSelected?: boolean;
  isPicker?: boolean;
};

export default function withDropdown<T extends { id: any }>(
  BaseComponent: (props: PropsType<T>) => ReactNode,
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
        {items && items.length > 0 && items[selected] && (
          <div key={items[selected].id}>
            {BaseComponent({
              data: items[selected],
              isPicker: true,
            })}
          </div>
        )}
        {isExpanded &&
          items &&
          items.map((item, i) => (
            <div
              key={item.id}
              onClick={() => {
                setSelected(i);
                if (onSelectItem) onSelectItem(item);
              }}
            >
              {BaseComponent({
                data: item,
                isSelected: i === selected,
              })}
            </div>
          ))}
      </div>
    );
  };
}

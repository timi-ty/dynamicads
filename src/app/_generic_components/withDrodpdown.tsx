"use client";

import { ReactNode, useEffect, useState } from "react";

type IdType<K> = {
  id: K;
};

type PropsType<T, K> = {
  data: T & IdType<K>;
  isSelected?: boolean;
  isPicker?: boolean;
};

export default function withDropdown<T extends { id: K }, K>(
  BaseComponent: (props: PropsType<T, K>) => ReactNode,
) {
  return ({
    items,
    selectedId,
    onSelectItem,
    className,
  }: Readonly<{
    items: T[];
    selectedId?: K;
    onSelectItem?: (selected: T) => void;
    className?: string;
  }>) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedItem, setSelectedItem] = useState(items[0]);

    useEffect(() => {
      // selectedId can be undefined in which case it does nothing
      if (!selectedId) return;
      setSelectedItem(items.find((item) => item.id === selectedId));
    }, [selectedId]);

    return (
      <div className={className} onClick={() => setIsExpanded((x) => !x)}>
        {selectedItem &&
          BaseComponent({
            data: selectedItem,
            isPicker: true,
          })}
        {isExpanded &&
          items &&
          items.map((item) => (
            <div
              key={item.id as any}
              onClick={() => {
                setSelectedItem(item);
                if (onSelectItem) onSelectItem(item);
              }}
            >
              {BaseComponent({
                data: item,
                isSelected: item.id === selectedItem?.id,
              })}
            </div>
          ))}
      </div>
    );
  };
}

"use client";

import { type Key, type ReactNode, useEffect, useState } from "react";

type IdType<K> = {
  id: K;
};

export type DropdownItemPropsType<T, K> = {
  data: T & IdType<K>;
  isSelected?: boolean;
  isPicker?: boolean;
  isExpanded?: boolean;
};

export default function withDropdown<T extends { id: K }, K>(
  BaseComponent: (props: DropdownItemPropsType<T, K>) => ReactNode,
) {
  function Dropdown({
    items,
    pickedItemId,
    onSelectItem,
    className,
  }: Readonly<{
    items: T[];
    pickedItemId?: K;
    onSelectItem?: (selected: T) => void;
    className?: string;
  }>) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedItem, setSelectedItem] = useState(items[0]);

    useEffect(() => {
      const pickedItem = items.find((item) => item.id === pickedItemId);
      // pickedItem can be undefined in which case it does nothing
      if (!pickedItem) return;
      setSelectedItem(pickedItem);
    }, [pickedItemId, items, setSelectedItem]);

    return (
      <div className={className} onClick={() => setIsExpanded((x) => !x)}>
        <div className="relative">
          {selectedItem &&
            BaseComponent({
              data: selectedItem,
              isPicker: true,
              isExpanded: isExpanded,
            })}
          <div className="absolute">
            {isExpanded &&
              items?.map((item) => (
                <div
                  key={item.id as Key}
                  onClick={() => {
                    setSelectedItem(item);
                    if (onSelectItem) onSelectItem(item);
                  }}
                >
                  {BaseComponent({
                    data: item,
                    isSelected: item.id === selectedItem?.id,
                    isExpanded: true,
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return Dropdown;
}

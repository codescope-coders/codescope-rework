"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button, Input } from "@/components/dashboard/ui";
import { toEnDigits } from "@/lib/dashboard/format";

/**
 * A tag-style editor for a list of short strings. Items render as removable
 * chips; a trailing input adds a new item on the "Add" button or Enter. Empty
 * and duplicate values are ignored. The list itself is controlled by `items`
 * (the settings query is the source of truth) — every mutation goes up through
 * `onChange`, which the page wires to `useUpdateSettings` with the changed key.
 */
export function EditableList({
  title,
  items,
  placeholder,
  addLabel,
  emptyLabel,
  removeLabel,
  disabled,
  onChange,
}: {
  title: string;
  items: string[];
  placeholder: string;
  addLabel: string;
  emptyLabel: string;
  removeLabel: string;
  disabled?: boolean;
  onChange: (next: string[]) => void;
}) {
  const [value, setValue] = useState("");

  const add = () => {
    const v = value.trim();
    if (!v || items.includes(v)) {
      setValue("");
      return;
    }
    onChange([...items, v]);
    setValue("");
  };

  const remove = (item: string) => onChange(items.filter((i) => i !== item));

  return (
    <div>
      <div className="mb-2 text-xs font-bold text-muted-foreground">{title}</div>

      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-[12px] text-muted-foreground">{emptyLabel}</span>
        ) : (
          items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[12px] font-semibold text-primary-700"
            >
              {item}
              {!disabled && (
                <button
                  type="button"
                  aria-label={removeLabel}
                  onClick={() => remove(item)}
                  className="grid size-4 place-items-center rounded-full transition-colors hover:bg-destructive-50 hover:text-destructive-600"
                >
                  <X className="size-3" />
                </button>
              )}
            </span>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => setValue(toEnDigits(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button
          type="button"
          variant="subtle"
          size="md"
          disabled={disabled || !value.trim()}
          onClick={add}
        >
          <Plus className="size-4" /> {addLabel}
        </Button>
      </div>
    </div>
  );
}

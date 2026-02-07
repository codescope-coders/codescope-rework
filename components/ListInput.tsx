import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { Plus, TrashIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  forwardRef,
  useImperativeHandle,
  useState,
  ComponentProps,
  useEffect,
} from "react";

export interface ListInputRef {
  getItems: () => string[];
  setItems: (items: string[]) => void;
  clearItems: () => void;
}

interface ListInputProps {
  label: string;
  placeholder: string;
  id: string;
  required?: boolean;
  defaultItems?: string[];
}

export const ListInput = forwardRef<
  ListInputRef,
  ListInputProps & ComponentProps<"input">
>(
  (
    { label, placeholder, id, required = false, defaultItems = [], ...props },
    ref,
  ) => {
    const [items, setItems] = useState<string[]>(defaultItems);
    const [value, setValue] = useState("");

    useEffect(() => {
      if (defaultItems.length) setItems(defaultItems);
    }, [defaultItems]);

    useImperativeHandle(ref, () => ({
      getItems: () => items,
      setItems: (newItems: string[]) => setItems(newItems),
      clearItems: () => setItems([]),
    }));

    const addItem = () => {
      const trimmed = value.trim();
      if (!trimmed) return;

      setItems((prev) => [trimmed, ...prev]);
      setValue("");
    };

    const removeItem = (index: number) => {
      setItems((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div className={cn("grid gap-2")}>
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>

        <div className="relative w-full">
          <Input
            {...props}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            size="sm"
            maxLength={50}
            className={props.className}
          />

          <button
            type="button"
            onClick={addItem}
            disabled={!value.trim()}
            className={clsx(
              "absolute top-0 end-0 h-10 w-10 border-s border-input rounded-e-md",
              "flex items-center justify-center transition",
              value.trim()
                ? "hover:bg-primary/10 hover:text-primary"
                : "opacity-50 cursor-not-allowed",
            )}
          >
            <Plus width={18} />
          </button>
        </div>

        <AnimatePresence>
          {items.length > 0 && (
            <motion.ul
              className="flex flex-col gap-2 p-2 bg-gray-50 border border-input rounded-md"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {items.map((item, i) => (
                <motion.li
                  key={`${id}-${i}`}
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  className="flex items-center justify-between gap-3 border border-primary/40 bg-white rounded-md px-2 py-1"
                >
                  <span className="text-sm font-medium first-letter:uppercase">
                    {item}
                  </span>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(i)}
                  >
                    <TrashIcon className="text-destructive" size={16} />
                  </Button>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

ListInput.displayName = "ListInput";

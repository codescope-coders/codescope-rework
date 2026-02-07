"use client";
import clsx from "clsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import React, {
  ReactNode,
  useState,
  useContext,
  createContext,
  ComponentProps,
  useId,
} from "react";
import { Card } from "./card";
import { buttonVariants } from "./button";
import { useTranslations } from "next-intl";
import { Accordion, AccordionContent, AccordionItem } from "./accordion";
import { VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TableHandlerColumn {
  key: string;
  value?: string | ReactNode;
  classes?: string;
  breakpoint?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

interface TableHandlerProps {
  children?: React.ReactNode;
  columns: TableHandlerColumn[];
}

type TableHandlerContextType = {
  columns: TableHandlerColumn[];
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  rowsLength: number;
  index: number;
};

interface TableHandlerCellProps {
  columnKey?: string;
  children?: ReactNode;
}

interface TableHandlerDetailsRowProps {
  children?: ReactNode;
}

interface TableHandlerRowProps {
  children?: ReactNode;
  disabled?: boolean;
}

interface TableHandlerProviderProps {
  children?: ReactNode;
  rowsLength: number;
  index: number;
}

interface DetailsRowProps {
  children?: ReactNode;
  columnKey: string;
}

// ============================================================================
// UTILITIES & CONSTANTS
// ============================================================================

const breakpointClasses: Record<string, string> = {
  xs: "max-xs:hidden",
  sm: "max-sm:hidden",
  md: "max-md:hidden",
  lg: "max-lg:hidden",
  xl: "max-xl:hidden",
  "2xl": "max-2xl:hidden",
};

const minBreakpointClasses: Record<string, string> = {
  xs: "xs:hidden",
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
  "2xl": "2xl:hidden",
};

const breakpointOrder: Record<
  NonNullable<TableHandlerColumn["breakpoint"]>,
  number
> = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
  "2xl": 6,
};

export const getLargestBreakpoint = (
  columns: TableHandlerColumn[],
): TableHandlerColumn["breakpoint"] | null => {
  if (!columns?.length) return null;

  const columnsWithBreakpoints = columns.filter((col) => col.breakpoint);
  if (!columnsWithBreakpoints.length) return null;

  return columnsWithBreakpoints.reduce<
    NonNullable<TableHandlerColumn["breakpoint"]>
  >((max, col) => {
    if (!col.breakpoint) return max;
    return breakpointOrder[col.breakpoint] > breakpointOrder[max]
      ? col.breakpoint
      : max;
  }, "xs");
};

// ============================================================================
// CONTEXT
// ============================================================================

const TableHandlerContext = createContext<TableHandlerContextType | undefined>(
  undefined,
);

export function useTableHandler() {
  const context = useContext(TableHandlerContext);
  if (context === undefined) {
    throw new Error(
      "useTableHandler must be used within a TableHandlerProvider",
    );
  }
  return context;
}

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

export const TableHandler = ({
  children,
  columns,
  className,
}: TableHandlerProps & ComponentProps<"div">) => {
  return (
    <Card className={cn("rounded-lg p-1!", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-card border-b border-b-input">
            {columns.map((column, i) => (
              <TableHead
                key={i}
                className={clsx(
                  "px-4 py-4 text-start capitalize",
                  column.classes,
                  column.breakpoint ? breakpointClasses[column.breakpoint] : "",
                )}
              >
                {column.key}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody suppressHydrationWarning>
          <TableHandlerContext.Provider
            value={{
              columns: columns,
              isOpen: false,
              setIsOpen: () => {},
              rowsLength: 0,
              index: 0,
            }}
          >
            {children}
          </TableHandlerContext.Provider>
        </TableBody>
      </Table>
    </Card>
  );
};

export const TableHandlerProvider = ({
  children,
  rowsLength,
  index,
}: TableHandlerProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { columns } = useTableHandler();

  return (
    <TableHandlerContext.Provider
      value={{
        columns,
        isOpen,
        setIsOpen,
        rowsLength,
        index,
      }}
    >
      {children}
    </TableHandlerContext.Provider>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

export const TableHandlerRow = ({
  children,
  className,
  disabled = false,
}: TableHandlerRowProps & ComponentProps<"tr">) => {
  const { isOpen, rowsLength, index } = useTableHandler();

  return (
    <TableRow
      className={clsx(
        "[&_td]:rtl:first:rounded-l-none [&_td]:rtl:last:rounded-r-none",
        {
          "[&_td]:rtl:first:rounded-tr-lg [&_td]:rtl:last:rounded-tl-lg [&_td]:ltr:first:rounded-tl-lg [&_td]:ltr:last:rounded-tr-lg [&_td]:ltr:first:rounded-r-none [&_td]:ltr:last:rounded-l-none":
            index == 0,
          "[&_td]:rtl:first:rounded-br-lg [&_td]:rtl:last:rounded-bl-lg [&_td]:ltr:first:rounded-bl-lg [&_td]:ltr:last:rounded-br-lg [&_td]:ltr:first:rounded-r-none [&_td]:ltr:last:rounded-l-none":
            index === rowsLength - 1 && !isOpen,
          "[&>td]:rounded-b-none!": isOpen,
          "opacity-40 cursor-not-allowed": disabled,
        },
        className,
      )}
    >
      {children}
    </TableRow>
  );
};
export const TableHandlerCell = ({
  columnKey,
  children,
  className,
  ...props
}: TableHandlerCellProps & ComponentProps<"td">) => {
  const { columns } = useTableHandler();
  const matchedColumn = columns && columns.find((c) => c.key === columnKey);

  if (columnKey && !matchedColumn) {
    if (process.env.NODE_ENV === "development") {
      throw new Error(
        `Column key is not matching any column from the columns array.`,
      );
    }
    return null;
  }

  return (
    <TableCell
      className={clsx(
        className,
        matchedColumn?.breakpoint &&
          breakpointClasses[matchedColumn.breakpoint],
      )}
      {...props}
    >
      {children}
    </TableCell>
  );
};

export const TableHandlerDetailsRow = ({
  children,
}: TableHandlerDetailsRowProps) => {
  const id = useId();
  const { isOpen, columns } = useTableHandler();
  return (
    <TableRow>
      <TableCell colSpan={columns.length} className="p-0 pe-6">
        <Accordion type="single" value={isOpen ? id : ""}>
          <AccordionItem value={id} className="border-0!">
            <AccordionContent className="border-0! ms-15">
              {children}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TableCell>
    </TableRow>
  );
};

export const TableHandlerToggle = ({
  className,
  variant = "ghost",
  size = "sm",
  asChild = false,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) => {
  const { setIsOpen, isOpen, columns } = useTableHandler();
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-state={isOpen ? "open" : "closed"}
      aria-expanded={isOpen}
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        buttonVariants({ variant, size }),
        className,
        "[&[data-state=open]>svg]:rotate-90 [&_svg]:duration-200",
        clsx(
          getLargestBreakpoint(columns)
            ? minBreakpointClasses[
                getLargestBreakpoint(columns) as NonNullable<
                  TableHandlerColumn["breakpoint"]
                >
              ]
            : "",
          {
            "hidden!": !getLargestBreakpoint(columns),
          },
        ),
      )}
      {...props}
    />
  );
};

export const DetailsRow = ({
  children,
  className,
  columnKey,
}: DetailsRowProps & ComponentProps<"div">) => {
  const { columns } = useTableHandler();
  const matchedColumn = columns && columns.find((c) => c.key === columnKey);

  if (!matchedColumn) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        `Column key (${columnKey}) is not matching any column from the columns array.`,
      );
    }
    return null;
  }
  return (
    <div
      className={cn(
        "py-2 border-t border-t-input-bordere",
        className,
        matchedColumn.breakpoint
          ? minBreakpointClasses[matchedColumn.breakpoint]
          : "hidden",
      )}
    >
      {children}
    </div>
  );
};

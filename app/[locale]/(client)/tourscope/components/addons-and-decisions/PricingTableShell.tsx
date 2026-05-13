import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  title: string;
  tag: string;
  nameColLabel: string;
  setupLabel: string;
  quarterlyLabel: string;
  annualLabel: string;
  twoYearsLabel: string;
  children: React.ReactNode;
};

/**
 * Shared shell used by ModulesTable, ApisTable, and GatewaysTable.
 * Renders the section header + a <Table> with the standard 5-column header.
 * Callers fill `children` with <TableBody> content.
 */
export function PricingTableShell({
  title,
  tag,
  nameColLabel,
  setupLabel,
  quarterlyLabel,
  annualLabel,
  twoYearsLabel,
  children,
}: Props) {
  return (
    <div>
      <header className="flex items-center justify-between gap-4 mb-4">
        <h3 className="font-bold text-lg tracking-normal">{title}</h3>
        <span className="uppercase tracking-widest text-xs text-subtitle-color font-semibold">
          {tag}
        </span>
      </header>

      <hr className="mb-6 border-border" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">{nameColLabel}</TableHead>
            <TableHead className="w-45 text-end">{setupLabel}</TableHead>
            <TableHead className="w-45 text-end">{quarterlyLabel}</TableHead>
            <TableHead className="bg-[#6f00ff12] text-accent font-semibold w-45 text-end">
              {annualLabel}
            </TableHead>
            <TableHead className="w-45 text-end">{twoYearsLabel}</TableHead>
          </TableRow>
        </TableHeader>

        {children}
      </Table>
    </div>
  );
}
import { TableCell, TableRow } from "@/components/ui/table";

type Props = {
  setup: string;
  quarterly: string;
  annual: string;
  biannual: string;
  children: React.ReactNode; // name cell content — caller composes it
};

export function PricedTableRow({
  setup,
  quarterly,
  annual,
  biannual,
  children,
}: Props) {
  return (
    <TableRow>
      <TableCell className="font-medium">{children}</TableCell>

      <TableCell className="text-end tabular-nums">
        {setup === "FREE" ? (
          <span className="text-accent font-semibold text-xs">FREE</span>
        ) : (
          setup
        )}
      </TableCell>

      <TableCell className="text-end tabular-nums">{quarterly}</TableCell>

      <TableCell className="bg-[#6f00ff12] text-accent font-semibold text-end tabular-nums">
        {annual}
      </TableCell>

      <TableCell className="text-end tabular-nums">{biannual}</TableCell>
    </TableRow>
  );
}

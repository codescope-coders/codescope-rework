import { TableBody } from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { PricingTableShell } from "./PricingTableShell";
import { PricedTableRow } from "./PricedTableRow";
import { MODULES } from "@/constants/tourscope-tables";

export function ModulesTable() {
  const t = useTranslations("tourscope.addons-and-decision");
  const tc = useTranslations("table.columns");

  return (
    <PricingTableShell
      title={t("subtitle")}
      tag={t("tag")}
      nameColLabel={tc("addition")}
      setupLabel={tc("setup")}
      quarterlyLabel={tc("quarterly")}
      annualLabel={tc("annually")}
      twoYearsLabel={tc("two_years")}
    >
      <TableBody>
        {MODULES.map((row) => (
          <PricedTableRow
            key={row.nameKey}
            setup={row.setup}
            quarterly={row.quarterly}
            annual={row.annual}
            biannual={row.biannual}
          >
            {t(`additions.${row.nameKey}`)}
            {row.subKey && (
              <span className="ms-2 text-xs text-muted-foreground font-normal">
                {t(`additions.${row.subKey}`)}
              </span>
            )}
          </PricedTableRow>
        ))}
      </TableBody>
    </PricingTableShell>
  );
}

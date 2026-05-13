import { TableBody } from "@/components/ui/table";
import { APIS } from "@/constants/tourscope-tables";
import { useTranslations } from "next-intl";
import { PricedTableRow } from "./PricedTableRow";
import { PricingTableShell } from "./PricingTableShell";

export function ApisTable() {
  const t = useTranslations("tourscope.addons-and-decision");
  const tc = useTranslations("table.columns");

  return (
    <PricingTableShell
      title={t("apis.title")}
      tag={t("apis.tag")}
      nameColLabel={tc("service")}
      setupLabel={tc("setup")}
      quarterlyLabel={tc("quarterly")}
      annualLabel={tc("annually")}
      twoYearsLabel={tc("two_years")}
    >
      <TableBody>
        {APIS.map((row) => (
          <PricedTableRow
            key={row.nameKey}
            setup={row.setup}
            quarterly={row.quarterly}
            annual={row.annual}
            biannual={row.biannual}
          >
            {t(`apis.names.${row.nameKey}`)}
            {row.badgeKey && (
              <span className="ms-2 text-xs text-muted-foreground font-normal">
                {row.badgeKey}
              </span>
            )}
          </PricedTableRow>
        ))}
      </TableBody>
    </PricingTableShell>
  );
}

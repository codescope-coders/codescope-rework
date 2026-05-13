import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { GATEWAY_GROUPS } from "@/constants/tourscope-tables";
import { useTranslations } from "next-intl";
import React from "react";
import { PricedTableRow } from "./PricedTableRow";
import { PricingTableShell } from "./PricingTableShell";

export function GatewaysTable() {
  const t = useTranslations("tourscope.addons-and-decision");
  const tc = useTranslations("table.columns");

  return (
    <PricingTableShell
      title={t("gateways.title")}
      tag={t("gateways.tag")}
      nameColLabel={t("gateways.column")}
      setupLabel={tc("setup")}
      quarterlyLabel={tc("quarterly")}
      annualLabel={tc("annually")}
      twoYearsLabel={tc("two_years")}
    >
      <TableBody>
        {GATEWAY_GROUPS.map((group, i) => (
          <React.Fragment key={i}>
            {/* Group subheader row */}
            {group.titleKey && (
              <TableRow
                key={`group-${i}`}
                className="bg-muted/40 hover:bg-muted/40"
              >
                <TableCell colSpan={5} className="py-2">
                  <span className="font-medium text-xs me-2">
                    {t(`gateways.groups.${group.titleKey}`)}
                  </span>
                  {group.tagKey && (
                    <span className="text-xs text-muted-foreground">
                      {t(`gateways.groups.${group.tagKey}`)}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )}

            {group.rows.map((row) => (
              <PricedTableRow
                key={row.nameKey}
                setup={row.setup}
                quarterly={row.quarterly}
                annual={row.annual}
                biannual={row.biannual}
              >
                {t(`gateways.names.${row.nameKey}`)}
              </PricedTableRow>
            ))}
          </React.Fragment>
        ))}
      </TableBody>
    </PricingTableShell>
  );
}

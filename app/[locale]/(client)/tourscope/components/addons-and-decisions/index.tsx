import Container from "@/components/Container";
import { useTranslations } from "next-intl";
import { ApisTable } from "./ApisTable";
import { GatewaysTable } from "./GatewaysTable";
import { ModulesTable } from "./ModulesTable";
import { SetupPanel } from "./SetupPanel";

export const AddonsAndDecisions = () => {
  const t = useTranslations("tourscope.addons-and-decision");

  return (
    <section className="bg-white">
      <Container className="min-h-screen py-20 max-w-6xl">
        {/* Section header */}
        <header className="mb-14">
          <h2 className="mb-3 font-bold text-xs uppercase text-accent tracking-widest">
            {t("tagline")}
          </h2>
          <h2 className="mb-4 text-[clamp(28px,4vw,44px)] tracking-tight leading-[1.13] font-bold">
            {t("title")}
          </h2>
        </header>

        {/* Table 1 — Optional Modules */}
        <ModulesTable />

        {/* Table 2 — Outbound APIs */}
        <div className="mt-10">
          <GatewaysTable />
        </div>
        <div className="mt-10">
          <ApisTable />
        </div>

        {/* Table 3 — Payment Gateways */}

        {/* Setup fee breakdown */}
        <SetupPanel />
      </Container>
    </section>
  );
};

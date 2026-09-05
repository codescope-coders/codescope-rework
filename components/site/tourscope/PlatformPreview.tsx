"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { EASE } from "@/lib/motion";
import {
  AirplaneTilt, Bed, MapTrifold, MagnifyingGlass,
  SquaresFour, Tag, Wallet, Article,
} from "@phosphor-icons/react";

const PURPLE = "#6f00ff";
const TEAL = "#00a79d";

/* ── Shared surface ─────────────────────────────────────────────────────── */
const surface =
  "relative rounded-2xl overflow-hidden border border-white/[0.07]";
const surfaceStyle = {
  background: "rgba(12,9,20,0.85)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
} as const;

/* ── B2C — the traveler-facing storefront ───────────────────────────────── */
export function StorefrontMock({ className = "" }: { className?: string }) {
  const t = useTranslations("TourScope.preview");
  const reduced = useReducedMotionSafe();

  const tabs = [
    { label: t("tabFlights"), Icon: AirplaneTilt, active: true },
    { label: t("tabHotels"), Icon: Bed, active: false },
    { label: t("tabTours"), Icon: MapTrifold, active: false },
  ];

  const rows = [
    {
      Icon: AirplaneTilt,
      title: t("flightRoute"),
      meta: t("flightMeta"),
      price: t("flightPrice"),
      badge: t("available"),
    },
    {
      Icon: Bed,
      title: t("hotelName"),
      meta: t("hotelMeta"),
      price: t("hotelPrice"),
      badge: null,
    },
  ];

  return (
    <div className={`${surface} ${className}`} style={surfaceStyle}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <span className="text-sm font-semibold text-white tracking-tight">
          TourScope
        </span>
        <div className="flex items-center gap-1.5">
          <motion.span
            className="w-[7px] h-[7px] rounded-full"
            style={{ backgroundColor: TEAL }}
            animate={reduced ? undefined : { opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[11px] font-medium text-zinc-400">{t("live")}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 px-5 pt-4">
        {tabs.map(({ label, Icon, active }) => (
          <div
            key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
            style={
              active
                ? { background: "rgba(111,0,255,0.16)", color: "#b794ff", border: "1px solid rgba(111,0,255,0.28)" }
                : { color: "#71717a", border: "1px solid transparent" }
            }
          >
            <Icon size={13} weight={active ? "fill" : "regular"} />
            {label}
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="px-5 pt-3 pb-4">
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <MagnifyingGlass size={13} className="text-zinc-600 shrink-0" />
          <span className="text-sm text-zinc-600 select-none truncate">{t("search")}</span>
        </div>
      </div>

      {/* Streaming results */}
      <div className="px-5 pb-5 flex flex-col gap-2.5">
        {rows.map((row, i) => (
          <motion.div
            key={row.title}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease: EASE }}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(111,0,255,0.12)", border: "1px solid rgba(111,0,255,0.22)" }}
            >
              <row.Icon size={15} weight="duotone" style={{ color: "#b794ff" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate select-none">{row.title}</p>
              <p className="text-xs text-zinc-500 select-none truncate">{row.meta}</p>
            </div>
            <div className="text-end shrink-0">
              <p className="text-sm font-bold text-white select-none tabular-nums">{row.price}</p>
              {row.badge && (
                <span
                  className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full select-none"
                  style={{ background: "rgba(0,167,157,0.1)", color: TEAL, border: "1px solid rgba(0,167,157,0.22)" }}
                >
                  {row.badge}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── B2B — the agency command center ────────────────────────────────────── */
export function DashboardMock({ className = "" }: { className?: string }) {
  const t = useTranslations("TourScope.preview");
  const reduced = useReducedMotionSafe();

  const nav = [
    { label: t("navBookings"), Icon: SquaresFour, active: true },
    { label: t("navPricing"), Icon: Tag, active: false },
    { label: t("navFinance"), Icon: Wallet, active: false },
    { label: t("navContent"), Icon: Article, active: false },
  ];

  const kpis = [
    { label: t("kpiBookings"), value: "248", accent: PURPLE },
    { label: t("kpiRevenue"), value: "$61.4k", accent: TEAL },
    { label: t("kpiSuppliers"), value: "32", accent: "#9393d4" },
  ];

  const rows = [
    { label: t("rowFlight"), status: t("statusConfirmed"), ok: true },
    { label: t("rowHotel"), status: t("statusConfirmed"), ok: true },
    { label: t("rowVisa"), status: t("statusPending"), ok: false },
  ];

  return (
    <div className={`${surface} ${className} flex`} style={surfaceStyle}>
      {/* Sidebar */}
      <div className="hidden sm:flex flex-col gap-1 w-[132px] shrink-0 p-3 border-e border-white/[0.06]">
        <div className="flex items-center gap-1.5 px-2 pb-3 mb-1">
          <span className="w-2 h-2 rounded-sm" style={{ background: PURPLE }} />
          <span className="text-[12px] font-semibold text-white tracking-tight">TourScope</span>
        </div>
        {nav.map(({ label, Icon, active }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium"
            style={
              active
                ? { background: "rgba(111,0,255,0.14)", color: "#c4a7ff" }
                : { color: "#71717a" }
            }
          >
            <Icon size={14} weight={active ? "fill" : "regular"} />
            {label}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 p-4">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-sm font-semibold text-white">{t("dashTitle")}</span>
          <div className="flex items-center gap-1.5">
            <motion.span
              className="w-[6px] h-[6px] rounded-full"
              style={{ backgroundColor: TEAL }}
              animate={reduced ? undefined : { opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[10px] font-medium text-zinc-500">{t("live")}</span>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {kpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: EASE }}
              className="px-2.5 py-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-[15px] font-bold text-white tabular-nums leading-tight">{k.value}</p>
              <p className="text-[9.5px] text-zinc-500 leading-tight mt-0.5 truncate">{k.label}</p>
              <div className="mt-1.5 h-0.5 rounded-full" style={{ background: k.accent, opacity: 0.7 }} />
            </motion.div>
          ))}
        </div>

        {/* Bookings table */}
        <div className="flex flex-col gap-1.5">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={reduced ? false : { opacity: 0, x: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.25 + i * 0.08, ease: EASE }}
              className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span className="text-[11.5px] text-zinc-300 truncate">{row.label}</span>
              <span
                className="inline-flex items-center gap-1 text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                style={
                  row.ok
                    ? { background: "rgba(0,167,157,0.1)", color: TEAL, border: "1px solid rgba(0,167,157,0.22)" }
                    : { background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.22)" }
                }
              >
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: row.ok ? TEAL : "#fbbf24" }}
                />
                {row.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStats } from "@/hooks/useStats";
import clsx from "clsx";
import { Files, LampDesk, Layers, UserCheck } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

interface Counter {
  title: string;
  count: number | string;
  icon?: ReactNode;
  type: "icon" | "online" | "offline" | "growth" | "pending";
}

export const Counters = () => {
  const [counters, setCounters] = useState<Counter[]>([
    {
      type: "icon",
      title: "Total Applications",
      count: 0,
      icon: <Files />,
    },
    {
      type: "icon",
      title: "Interviewed",
      count: 0,
      icon: <UserCheck />,
    },
    {
      type: "pending",
      title: "Pending",
      count: 0,
      icon: <UserCheck />,
    },
    {
      type: "online",
      title: "Accepted",
      count: 0,
    },
    {
      type: "offline",
      title: "Rejected",
      count: 0,
    },
  ]);
  const { data, isPending } = useGetStats();

  useEffect(() => {
    if (data?.payload) {
      setCounters([
        {
          type: "icon",
          title: "Total Applications",
          count: data?.payload?.totalApplications,
          icon: <Files />,
        },
        {
          type: "icon",
          title: "Interviewed",
          count: data?.payload?.interviewedApplications,
          icon: <UserCheck />,
        },
        {
          type: "pending",
          title: "Pending",
          count: data?.payload?.pendingApplications,
          icon: <UserCheck />,
        },
        {
          type: "online",
          title: "Accepted",
          count: data?.payload?.approvedApplications,
        },
        {
          type: "offline",
          title: "Rejected",
          count: data?.payload?.rejectedApplications,
        },
      ]);
    }
  }, [data]);

  return (
    <section className="rounded-xl shadow-xs flex flex-wrap gap-3">
      {isPending &&
        counters.map((counter, i) => (
          <Skeleton
            key={i}
            className="px-5 py-3 hover:bg-primary/5 group rounded-lg border border-gray-300/80 hover:border-primary duration-200 flex-1 flex flex-col justify-between gap-3 min-w-full md:min-w-3xs"
          >
            <div className="flex justify-between gap-4 font-medium">
              <Skeleton className="w-50 h-3" variant={"primary"} />
              {counter.type == "icon" && (
                <Skeleton
                  className="group-hover:-translate-y-1 duration-150 ease-out size-7 rounded-sm"
                  variant={"primary"}
                ></Skeleton>
              )}
              {(counter.type == "offline" || counter.type == "online") && (
                <Skeleton
                  className={clsx(
                    "size-3 rounded-full shadow-xs border group-hover:-translate-y-1 duration-150 ease-out",
                  )}
                ></Skeleton>
              )}
            </div>
            <Skeleton
              className="text-3xl font-black size-8 rounded-md"
              variant={"primary"}
            ></Skeleton>
          </Skeleton>
        ))}
      {!isPending &&
        counters.map((counter, i) => (
          <div
            key={i}
            className="px-5 py-3 hover:bg-primary/5 group rounded-lg border border-gray-300/80 hover:border-primary duration-200 flex-1 flex flex-col justify-between gap-3 min-w-full md:min-w-3xs"
          >
            <div className="flex justify-between gap-4 font-medium">
              {counter?.title}
              {counter.type == "icon" && (
                <span className="group-hover:-translate-y-1 duration-150 ease-out">
                  {counter?.icon}
                </span>
              )}
              {(counter.type == "offline" ||
                counter.type == "online" ||
                counter.type == "pending") && (
                <div
                  className={clsx(
                    "size-3 rounded-full shadow-xs border group-hover:-translate-y-1 duration-150 ease-out",
                    {
                      "shadow-success bg-success/30 border-success":
                        counter.type == "online",
                      "shadow-invalid-color bg-invalid-color/30 border-invalid-color":
                        counter.type == "offline",
                      "shadow-yellow-500/30 bg-yellow-500/20 border-yellow-500":
                        counter.type === "pending",
                    },
                  )}
                ></div>
              )}
            </div>
            <span className="text-3xl font-black">{counter.count}</span>
          </div>
        ))}
    </section>
  );
};

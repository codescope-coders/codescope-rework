"use client";
import Container from "@/components/Container";
import { useGetJobById } from "@/hooks/useJobs";
import { useParams } from "next/navigation";
import DetailsSkeleton from "./DetailsSkeleton";
import clsx from "clsx";
import { Building, ClockIcon, MapPinIcon, TableIcon } from "lucide-react";
import { timeAgo } from "@/helpers/date";
import { ApplicationForm } from "./ApplicationForm";

export const Content = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isPending } = useGetJobById(id);
  return (
    <section>
      {isPending && <DetailsSkeleton />}
      {!isPending && (
        <Container className="px-6 py-8">
          <div className="py-12">
            <div className="flex justify-between flex-col relative mb-2">
              <div className="mb-3 flex items-start justify-between gap-2 flex-col md:flex-row md:items-center">
                <h1 className="text-3xl flex items-center gap-2 font-bold">
                  <span
                    className={clsx(
                      "w-3.5 h-3.5 rounded-full inline-block border",
                      {
                        "bg-red-600": data?.payload?.status == "CLOSED",
                        "bg-green-200 border-green-600":
                          data?.payload?.status == "AVAILABLE",
                      },
                    )}
                  ></span>
                  {data?.payload?.position}
                </h1>
                <div className="details flex items-start gap-2 min-w-fit">
                  <div className="department px-3 py-1 bg-blue-500 rounded-sm font-bold min-w-fit capitalize">
                    <span>
                      {data?.payload?.type.toLowerCase().replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
              <p className="w-[90%]">{data?.payload?.description}</p>
            </div>
            <div className="location-date flex items-center gap-4 flex-wrap">
              <div className="location flex items-center gap-2 text-[15px] text-gray-400">
                <ClockIcon width={18} />
                <span>{timeAgo(data?.payload?.createdAt as string)}</span>
              </div>
              <div className="location flex items-center gap-2 text-[15px] text-gray-400">
                <MapPinIcon width={18} />
                <span>{data?.payload?.location}</span>
              </div>
            </div>
            {data && data?.payload?.requirements?.length > 0 && (
              <div className="mt-4">
                <h1 className="text-xl font-bold">Requirements:</h1>
                {data?.payload?.requirements?.map((r, i: number) => (
                  <li className="text-base font-medium ms-6" key={i}>
                    {r}
                  </li>
                ))}
              </div>
            )}
            {data && data?.payload?.responsibilities?.length > 0 && (
              <div className="mt-4">
                <h1 className="text-xl font-bold">Responsibilities:</h1>
                {data?.payload?.responsibilities?.map((r, i: number) => (
                  <li className="text-base font-medium ms-6" key={i}>
                    {r}
                  </li>
                ))}
              </div>
            )}
          </div>
        </Container>
      )}
      {!isPending && <ApplicationForm />}
    </section>
  );
};

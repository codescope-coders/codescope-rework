import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicMetadata } from "@/lib/site-meta";
import { getPublicJob } from "@/lib/public-jobs";
import { BreadcrumbData } from "@/components/site/StructuredData";
import { Content } from "./components/Content";

type Props = { params: Promise<{ locale: string; id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const { job } = await getPublicJob(id);
  const ar = locale === "ar";
  const title = job ? `${job.position} — ${ar ? "وظائف كودسكوب" : "Careers at CodeScope"}`
    : ar ? "تفاصيل الوظيفة — كودسكوب" : "Job details | CodeScope";
  const description = job
    ? ar ? `اطّلع على متطلبات ومسؤوليات وظيفة ${job.position} في كودسكوب${job.location ? `، ${job.location}` : ""}، وتعرّف على طريقة التقديم.`
      : `Explore the ${job.position} role at CodeScope${job.location ? ` in ${job.location}` : ""}. Read requirements, responsibilities and how to apply.`
    : ar ? "تعذّر عرض تفاصيل الوظيفة حاليًا. يمكنك العودة إلى صفحة الوظائف للاطّلاع على الفرص المتاحة." : "Job details are currently unavailable. Visit CodeScope careers to explore available roles.";
  return publicMetadata({ path: `/jobs/${id}`, locale, title, description, index: job?.status === "AVAILABLE" });
}
export default async function JobPage({ params }: Props) {
  const { locale, id } = await params;
  const { job, unavailable } = await getPublicJob(id);
  if (!job && !unavailable) notFound();
  return <div className="text-white">
    {job && <BreadcrumbData path={`/jobs/${id}`} locale={locale} jobTitle={job.position} />}
    <Content initialJob={job ?? undefined} />
  </div>;
}

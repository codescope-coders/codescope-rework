import { Badge } from "@/components/ui/badge";
import { displayUrl } from "@/helpers/links";
import {
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  DollarSign,
  Flag,
  GraduationCap,
  Hourglass,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  MoreVertical,
  Phone,
  Trash,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ApplicationDto,
  ApplicationStatus,
  EducationLevel,
  ExpectedSalary,
} from "@/services/applications";
import { timeAgo } from "@/helpers/date";
import {
  useDeleteApplication,
  useUpdateApplication,
} from "@/hooks/useApplications";
import { useState } from "react";
import clsx from "clsx";

export const expectedSalaryLabel: Record<ExpectedSalary, string> = {
  RANGE_400_600: "400k - 600k IQD",
  RANGE_700_900: "700k - 900k IQD",
  RANGE_1000_1500: "1m - 1.5m IQD",
  RANGE_1500_2000: "1.5m - 2m IQD",
  OTHER: "Negotiable",
};

export const educationLevelLabel: Record<EducationLevel, string> = {
  NO_FORMAL_EDUCATION: "No formal education",
  PRIMARY: "Primary school",
  INTERMEDIATE: "Intermediate school",
  SECONDARY: "Secondary / High school",
  DIPLOMA: "Diploma",
  BACHELORS: "Bachelor’s degree",
  MASTERS: "Master’s degree",
  DOCTORATE: "Doctorate (PhD)",
  POSTDOCTORATE: "Post-doctorate",
  CERTIFICATE: "Certificate",
  PROFESSIONAL_CERTIFICATION: "Professional certification",
};

const statusVariantMap: Record<
  ApplicationStatus,
  "pending" | "green" | "gray" | "destructive" | "default"
> = {
  PENDING: "pending",
  APPROVED: "green",
  INTERVIEWED: "gray",
  REJECTED: "destructive",
};

const statusIconMap: Record<ApplicationStatus, React.ReactNode> = {
  PENDING: <Hourglass size={14} />,
  APPROVED: <CheckCircle size={14} />,
  INTERVIEWED: <MessageSquare size={14} />,
  REJECTED: <XCircle size={14} />,
};

export const Application = ({
  application,
}: {
  application: ApplicationDto;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isPending } = useUpdateApplication(application.id);
  const { mutate: deleteApplication, isPending: isDeleting } =
    useDeleteApplication(application.id);

  return (
    <div
      className={clsx(
        "shadow-xs rounded-md border border-input/80 duration-300 w-full flex flex-col",
        {
          "opacity-50 cursor-not-allowed": isPending || isDeleting,
        },
      )}
    >
      <header className="flex justify-between gap-4 mb-1 p-4">
        <div className="flex gap-2">
          <div>
            <h2 className="font-bold text-xl">{application?.fullName}</h2>
            <div className="flex gap-1 items-center text-xs font-medium text-gray-500">
              <Mail size={14} /> {application?.email}
            </div>
          </div>
          <Badge
            variant={statusVariantMap[application?.status] ?? "default"}
            className="capitalize"
          >
            {statusIconMap[application?.status]}
            {application?.status.toLowerCase()}
          </Badge>
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon-sm">
              <MoreVertical />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-48 p-0"
            align="end"
            onClick={() => setIsOpen(false)}
          >
            {(application?.status == "PENDING" ||
              application?.status != "APPROVED") && (
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-emerald-100 rounded-none"
                size={"sm"}
                onClick={() => mutate({ status: "APPROVED" })}
              >
                <Check className="mr-1 h-4 w-4 text-emerald-700 hover:text-emerald-800" />
                Accept
              </Button>
            )}
            {(application?.status == "PENDING" ||
              application?.status != "INTERVIEWED") && (
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-indigo-100 rounded-none"
                size={"sm"}
                onClick={() => mutate({ status: "INTERVIEWED" })}
              >
                <Phone className="mr-1 h-4 w-4 text-indigo-800 hover:text-indigo-900" />
                Interviewed
              </Button>
            )}
            {(application?.status == "PENDING" ||
              application?.status != "REJECTED") && (
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-rose-100 rounded-none"
                size={"sm"}
                onClick={() => mutate({ status: "REJECTED" })}
              >
                <X className="mr-1 h-4 w-4 text-rose-700 hover:text-rose-800" />
                Reject
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-rose-100 rounded-none"
              size={"sm"}
              onClick={() => deleteApplication()}
            >
              <Trash className="mr-1 h-4 w-4 text-rose-700 hover:text-rose-800" />
              Delete
            </Button>
          </PopoverContent>
        </Popover>
      </header>
      <div className="px-2 py-4 m-2 bg-blue-50/50 border border-blue-400/20 rounded-lg grid sm:grid-cols-2 gap-4">
        <div className="flex gap-2">
          <div className="size-7 flex items-center justify-center rounded-sm border border-input/50 bg-white">
            <Briefcase size={18} className="text-primary" />
          </div>
          <div className="text-xs leading-[100%]">
            <h3 className="text-gray-600">Position</h3>
            <p className="font-semibold text-base">
              {application?.job?.position}
            </p>
          </div>
        </div>

        {application?.phoneNumber && (
          <div className="flex gap-2">
            <div className="size-7 flex items-center justify-center rounded-sm border border-input/50 bg-white">
              <Phone size={18} className="text-primary" />
            </div>
            <div className="text-xs leading-[100%]">
              <h3 className="text-gray-600">Phone</h3>
              <p className="font-semibold text-base">
                {application?.phoneNumber}
              </p>
            </div>
          </div>
        )}

        {application?.currentCity && (
          <div className="flex gap-2">
            <div className="size-7 flex items-center justify-center rounded-sm border border-input/50 bg-white">
              <MapPin size={18} className="text-primary" />
            </div>
            <div className="text-xs leading-[100%]">
              <h3 className="text-gray-600">Current City</h3>
              <p className="font-semibold text-base">
                {application?.currentCity}
              </p>
            </div>
          </div>
        )}

        {application?.nationality && (
          <div className="flex gap-2">
            <div className="size-7 flex items-center justify-center rounded-sm border border-input/50 bg-white">
              <Flag size={18} className="text-primary" />
            </div>
            <div className="text-xs leading-[100%]">
              <h3 className="text-gray-600">Nationality</h3>
              <p className="font-semibold text-base">
                {application?.nationality}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <div className="size-7 flex items-center justify-center rounded-sm border border-input/50 bg-white">
            <Calendar size={18} className="text-primary" />
          </div>
          <div className="text-xs leading-[100%]">
            <h3 className="text-gray-600">Availability to start</h3>
            <p className="font-semibold text-base">
              {application?.availabilityToStart
                ? new Date(
                    application?.availabilityToStart,
                  ).toLocaleDateString()
                : "Immediately"}
            </p>
          </div>
        </div>

        {application?.lastJobTitle && (
          <div className="flex gap-2">
            <div className="size-7 flex items-center justify-center rounded-sm border border-input/50 bg-white">
              <Briefcase size={18} className="text-primary" />
            </div>
            <div className="text-xs leading-[100%]">
              <h3 className="text-gray-600">Last Job Title</h3>
              <p className="font-semibold text-base">
                {application?.lastJobTitle}
              </p>
            </div>
          </div>
        )}

        {application?.yearsOfExperience && (
          <div className="flex gap-2">
            <div className="size-7 flex items-center justify-center rounded-sm border border-input/50 bg-white">
              <Clock size={18} className="text-primary" />
            </div>
            <div className="text-xs leading-[100%]">
              <h3 className="text-gray-600">Years of Experience</h3>
              <p className="font-semibold text-base">
                {application?.yearsOfExperience}
              </p>
            </div>
          </div>
        )}

        {application?.expectedSalary && (
          <div className="flex gap-2">
            <div className="size-7 flex items-center justify-center rounded-sm border border-input/50 bg-white">
              <DollarSign size={18} className="text-primary" />
            </div>
            <div className="text-xs leading-[100%]">
              <h3 className="text-gray-600">Expected Salary</h3>
              <p className="font-semibold text-base">
                {expectedSalaryLabel[application?.expectedSalary]}
              </p>
            </div>
          </div>
        )}

        {application?.highestEducationLevel && (
          <div className="flex gap-2">
            <div className="size-7 flex items-center justify-center rounded-sm border border-input/50 bg-white">
              <GraduationCap size={18} className="text-primary" />
            </div>
            <div className="text-xs leading-[100%]">
              <h3 className="text-gray-600">Education Level</h3>
              <p className="font-semibold text-base">
                {educationLevelLabel[application?.highestEducationLevel]}
              </p>
            </div>
          </div>
        )}

        {application?.fieldOfStudy && (
          <div className="flex gap-2">
            <div className="size-7 flex items-center justify-center rounded-sm border border-input/50 bg-white">
              <BookOpen size={18} className="text-primary" />
            </div>
            <div className="text-xs leading-[100%]">
              <h3 className="text-gray-600">Field of Study</h3>
              <p className="font-semibold text-base">
                {application?.fieldOfStudy}
              </p>
            </div>
          </div>
        )}

        {application?.graduationYear && (
          <div className="flex gap-2">
            <div className="size-7 flex items-center justify-center rounded-sm border border-input/50 bg-white">
              <Calendar size={18} className="text-primary" />
            </div>
            <div className="text-xs leading-[100%]">
              <h3 className="text-gray-600">Graduation Year</h3>
              <p className="font-semibold text-base">
                {application?.graduationYear}
              </p>
            </div>
          </div>
        )}
      </div>
      <hr className="border-input/50" />
      <div className="flex flex-col justify-end flex-1">
        {application?.links?.length > 0 && (
          <div className="px-4 my-4">
            <h2 className="font-bold text-xl">Links:</h2>
            <div className="flex flex-col gap-2">
              {application?.links?.map((link, i) => (
                <Link
                  key={i}
                  className="px-2 py-1 rounded-sm bg-blue-50/40 hover:bg-blue-50 duration-200 hover:underline"
                  href={link}
                  target="_blank"
                >
                  {displayUrl(link)}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 px-3 py-1.5">
          <div className="flex gap-2 items-center text-xs text-gray-600">
            <Calendar size={16} /> Applied: {timeAgo(application?.createdAt)}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText size={16} />
                CV
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={() => window.open(application?.cvUrl, "_blank")}
                >
                  <Eye size={16} />
                  View CV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2"
                  asChild
                >
                  <a href={application?.cvUrl} download>
                    <Download size={16} />
                    Download CV
                  </a>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

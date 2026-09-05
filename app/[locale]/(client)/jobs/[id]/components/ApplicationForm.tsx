"use client";
import {
  educationLevelLabel,
  expectedSalaryLabel,
} from "@/lib/careers-labels";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateApplication } from "@/hooks/useApplications";
import { useUpload } from "@/hooks/useUpload";
import { useRouter } from "@/i18n/routing";
import { educationLevelEnum, expectedSalaryEnum } from "@/lib/db/schema";
import { EducationLevel, ExpectedSalary } from "@/services/applications";
import { useVariablesStore } from "@/stores/variables";
import clsx from "clsx";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  FileText,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

type FieldErrors = {
  fullName?: string;
  email?: string;
  currentCity?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  expectedSalary?: string;
  availabilityDate?: string;
  yearsOfExperience?: string;
  lastJobTitle?: string;
  lastCompanyName?: string;
  links?: string;
  cv?: string;
  highestEducationLevel?: string;
  fieldOfStudy?: string;
  graduationYear?: string;
};

type FormState = {
  fullName: string;
  email: string;
  currentCity: string;
  phoneNumber: string;
  nationality: string;
  expectedSalary: string;
  yearsOfExperience: string;
  lastJobTitle: string;
  lastCompanyName: string;
  highestEducationLevel: string;
  fieldOfStudy: string;
  graduationYear: string;
};

export const ApplicationForm = () => {
  const [dateOfBirth, setDateOfBirth] = React.useState<Date>();
  const [availabilityDate, setAvailabilityDate] = React.useState<Date>();
  const [links, setLinks] = React.useState<string[]>([""]);
  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const { showMessage } = useVariablesStore();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    mutateAsync: uploadFile,
    isPending: isUploadingFile,
    error: errorUploadingFile,
  } = useUpload();

  const { mutate, isPending, error } = useCreateApplication(
    () => {
      showMessage();
      setTimeout(() => {
        router.push("/");
      }, 500);
    },
    (error: any) => {
      if (error?.fieldErrors) {
        setFieldErrors(error.fieldErrors);
        toast.error("يرجى تصحيح الأخطاء في النموذج");
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("فشل إرسال الطلب. يرجى المحاولة مجدداً.");
      }
    },
  );

  const addLink = () => {
    if (links.length < 3) {
      setLinks([...links, ""]);
    }
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      setLinks((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleLinkChange = (index: number, value: string) => {
    setLinks((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });

    if (fieldErrors.links) {
      setFieldErrors((prev) => ({ ...prev, links: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvFile(file);

    if (fieldErrors.cv) {
      setFieldErrors((prev) => ({ ...prev, cv: undefined }));
    }
  };

  const removeFile = () => {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (e: React.FormEvent<HTMLFormElement>): boolean => {
    const errors: FieldErrors = {};
    const form = new FormData(e.currentTarget);

    if (!form.get("fullName")) {
      errors.fullName = "الاسم الكامل مطلوب";
    }

    if (!form.get("email")) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.get("email") as string)
    ) {
      errors.email = "يرجى إدخال بريد إلكتروني صحيح";
    }

    if (!form.get("currentCity")) {
      errors.currentCity = "المدينة الحالية مطلوبة";
    }

    if (!form.get("nationality")) {
      errors.nationality = "الجنسية مطلوبة";
    }

    if (!dateOfBirth) {
      errors.dateOfBirth = "تاريخ الميلاد مطلوب";
    }

    if (!cvFile) {
      errors.cv = "السيرة الذاتية مطلوبة";
    }

    if (
      form.get("yearsOfExperience") &&
      Number(form.get("yearsOfExperience")) < 0
    ) {
      errors.yearsOfExperience = "يجب أن تكون سنوات الخبرة عدداً موجباً";
    }

    if (
      form.get("graduationYear") &&
      (Number(form.get("graduationYear")) < 1950 ||
        Number(form.get("graduationYear")) > new Date().getFullYear() + 10)
    ) {
      errors.graduationYear = "يرجى إدخال سنة تخرج صحيحة";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    if (!validateForm(e)) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const form = new FormData(e.currentTarget);

    try {
      const cvFormData = new FormData();
      cvFormData.append("cv", cvFile!);
      const uploadResponse = await uploadFile(cvFormData);
      console.log(availabilityDate);
      mutate({
        jobId: id,
        fullName: (form.get("fullName") as string)?.trim(),
        email: (form.get("email") as string)?.trim(),
        currentCity: (form.get("currentCity") as string)?.trim(),
        nationality: (form.get("nationality") as string)?.trim(),
        date_of_birth: dateOfBirth!.toISOString(),
        cvUrl: uploadResponse.cvUrl,
        ...((form.get("phoneNumber") as string)?.trim()
          ? { phoneNumber: (form.get("phoneNumber") as string)?.trim() }
          : {}),
        ...(form.get("expectedSalary")
          ? { expectedSalary: form.get("expectedSalary") as ExpectedSalary }
          : {}),
        ...(availabilityDate
          ? { availabilityToStart: availabilityDate!.toISOString() }
          : {}),
        ...(form.get("yearsOfExperience")
          ? { yearsOfExperience: Number(form.get("yearsOfExperience")) }
          : {}),
        ...((form.get("lastJobTitle") as string).trim()
          ? { lastJobTitle: (form.get("lastJobTitle") as string).trim() }
          : {}),
        ...((form.get("lastCompanyName") as string).trim()
          ? { lastCompanyName: (form.get("lastCompanyName") as string).trim() }
          : {}),
        ...(form.get("highestEducationLevel")
          ? {
              highestEducationLevel: form.get(
                "highestEducationLevel",
              ) as EducationLevel,
            }
          : {}),
        ...((form.get("fieldOfStudy") as string).trim()
          ? { fieldOfStudy: (form.get("fieldOfStudy") as string).trim() }
          : {}),
        ...(form.get("graduationYear")
          ? { graduationYear: Number(form.get("graduationYear")) }
          : {}),
        ...(links.filter((l) => l.trim()).length
          ? { links: links.filter((l) => l.trim()) }
          : {}),
      });
    } catch (err) {
      toast.error("فشل رفع السيرة الذاتية. يرجى المحاولة مجدداً.");
      console.error("Upload error:", err);
    }
  };

  return (
    <section className="px-6 pb-28">
      <div className="mx-auto max-w-4xl">
        <form
          onSubmit={handleSubmit}
          dir="rtl"
          /* `site-form` is the hook for the scoped control styling in
             globals.css — see the block under "Careers application form".
             The shadcn primitives in here read the LIGHT shadcn tokens off
             `:root`, which is correct for the dashboard and wrong on this
             ground; restyling them in CSS keeps 780 lines of validation and
             submission logic untouched. */
          className="site-form"
        >
        <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">معلومات التواصل</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              الاسم الكامل <span className="text-red-400">*</span>
            </Label>
            <Input
              placeholder="أدخل اسمك الكامل"
              name="fullName"
              className={clsx("text-white", {
                "border-destructive focus-visible:ring-destructive":
                  fieldErrors.fullName,
              })}
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.fullName}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              البريد الإلكتروني <span className="text-red-400">*</span>
            </Label>
            <Input
              name="email"
              placeholder="أدخل بريدك الإلكتروني"
              type="email"
              className={clsx("text-white", {
                "border-destructive focus-visible:ring-destructive":
                  fieldErrors.email,
              })}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              المدينة الحالية <span className="text-red-400">*</span>
            </Label>
            <Input
              name="currentCity"
              placeholder="أدخل مدينتك الحالية"
              className={clsx("text-white", {
                "border-destructive focus-visible:ring-destructive":
                  fieldErrors.currentCity,
              })}
            />
            {fieldErrors.currentCity && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.currentCity}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              رقم الهاتف{" "}
              <span className="text-xs font-normal text-zinc-500">
                (اختياري)
              </span>
            </Label>
            <Input
              name="phoneNumber"
              placeholder="أدخل رقم هاتفك"
              className={clsx("text-white", {
                "border-destructive focus-visible:ring-destructive":
                  fieldErrors.phoneNumber,
              })}
            />
            {fieldErrors.phoneNumber && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.phoneNumber}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              تاريخ الميلاد <span className="text-red-400">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={"outline"}
                  className={clsx(
                    "h-12 w-full justify-start rounded-xl border border-white/8 bg-zinc-900 font-normal text-zinc-400 hover:bg-zinc-900 hover:text-white",
                    {
                      "border-destructive focus-visible:ring-destructive":
                        fieldErrors.dateOfBirth,
                    },
                  )}
                >
                  <CalendarIcon />
                  {dateOfBirth ? (
                    format(dateOfBirth, "PPP")
                  ) : (
                    <span>اختر تاريخاً</span>
                  )}
                </Button>
              </PopoverTrigger>
              {/* `site-popover` is the dark token map for this subtree. Radix
                  portals the content into `document.body`, so it lands OUTSIDE
                  `[data-site="public"] .site-form` and would otherwise read the
                  light `:root` shadcn values — a white calendar over a
                  near-black page. See `globals.css`. */}
              <PopoverContent className="site-popover w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={(date) => {
                    setDateOfBirth(date);
                    clearFieldError("dateOfBirth");
                  }}
                  fromYear={1950}
                  toYear={new Date().getFullYear() - 18}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
            {fieldErrors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.dateOfBirth}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              الجنسية <span className="text-red-400">*</span>
            </Label>
            <Input
              name="nationality"
              placeholder="أدخل جنسيتك"
              className={clsx("text-white", {
                "border-destructive focus-visible:ring-destructive":
                  fieldErrors.nationality,
              })}
            />
            {fieldErrors.nationality && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.nationality}
              </p>
            )}
          </div>
        </div>
        <hr className="my-10 border-0 border-t border-white/8" />
        <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">المنصب والتوفر</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              الراتب المتوقع{" "}
              <span className="text-xs font-normal text-zinc-500">
                (اختياري)
              </span>
            </Label>
            <Select name="expectedSalary">
              <SelectTrigger
                className={clsx("w-full text-white", {
                  "border-destructive focus:ring-destructive":
                    fieldErrors.expectedSalary,
                })}
              >
                <SelectValue placeholder="اختر الراتب المتوقع" />
              </SelectTrigger>
              <SelectContent>
                {expectedSalaryEnum?.enumValues.map((v, i) => (
                  <SelectItem key={i} value={v}>
                    {expectedSalaryLabel[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.expectedSalary && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.expectedSalary}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              تاريخ الاستعداد للبدء{" "}
              <span className="text-xs font-normal text-zinc-500">
                (اختياري، فوري بشكل افتراضي)
              </span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={"outline"}
                  className={clsx(
                    "h-12 w-full justify-start rounded-xl border border-white/8 bg-zinc-900 font-normal text-zinc-400 hover:bg-zinc-900 hover:text-white",
                    {
                      "border-destructive focus-visible:ring-destructive":
                        fieldErrors.availabilityDate,
                    },
                  )}
                >
                  <CalendarIcon />
                  {availabilityDate ? (
                    format(availabilityDate, "PPP")
                  ) : (
                    <span>اختر تاريخاً</span>
                  )}
                </Button>
              </PopoverTrigger>
              {/* `site-popover` is the dark token map for this subtree. Radix
                  portals the content into `document.body`, so it lands OUTSIDE
                  `[data-site="public"] .site-form` and would otherwise read the
                  light `:root` shadcn values — a white calendar over a
                  near-black page. See `globals.css`. */}
              <PopoverContent className="site-popover w-auto p-0">
                <Calendar
                  mode="single"
                  selected={availabilityDate}
                  onSelect={(date) => {
                    setAvailabilityDate(date);
                    clearFieldError("availabilityDate");
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const endOfYear = new Date(today.getFullYear(), 11, 31);
                    return date < today || date > endOfYear;
                  }}
                  fromMonth={new Date()}
                  toMonth={new Date(new Date().getFullYear(), 11)}
                  fromYear={new Date().getFullYear()}
                  toYear={new Date().getFullYear()}
                  captionLayout="dropdown"
                  defaultMonth={availabilityDate || new Date()}
                />
              </PopoverContent>
            </Popover>
            {fieldErrors.availabilityDate && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.availabilityDate}
              </p>
            )}
          </div>
        </div>
        <hr className="my-10 border-0 border-t border-white/8" />
        <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">الخلفية المهنية</h2>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              سنوات الخبرة{" "}
              <span className="text-xs font-normal text-zinc-500">
                (اختياري)
              </span>
            </Label>
            <Input
              name="yearsOfExperience"
              placeholder="أدخل سنوات خبرتك"
              className={clsx("text-white", {
                "border-destructive focus-visible:ring-destructive":
                  fieldErrors.yearsOfExperience,
              })}
              type="number"
              min="0"
            />
            {fieldErrors.yearsOfExperience && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.yearsOfExperience}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              المسمى الوظيفي الأخير{" "}
              <span className="text-xs font-normal text-zinc-500">
                (اختياري)
              </span>
            </Label>
            <Input
              name="lastJobTitle"
              placeholder="أدخل مسماك الوظيفي الأخير"
              className={clsx("text-white", {
                "border-destructive focus-visible:ring-destructive":
                  fieldErrors.lastJobTitle,
              })}
            />
            {fieldErrors.lastJobTitle && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.lastJobTitle}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              اسم آخر شركة{" "}
              <span className="text-xs font-normal text-zinc-500">
                (اختياري)
              </span>
            </Label>
            <Input
              name="lastCompanyName"
              placeholder="أدخل اسم آخر شركة عملت بها"
              className={clsx("text-white", {
                "border-destructive focus-visible:ring-destructive":
                  fieldErrors.lastCompanyName,
              })}
            />
            {fieldErrors.lastCompanyName && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.lastCompanyName}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 mt-4">
          <Label className="text-sm font-medium text-zinc-300">
            الروابط{" "}
            <span className="text-xs font-normal text-zinc-500">
              (اختياري - معرض الأعمال، GitHub، LinkedIn، إلخ)
            </span>
          </Label>
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={link}
                onChange={(e) => handleLinkChange(index, e.target.value)}
                placeholder="موقع معرض الأعمال / Behance / GitHub"
                className={clsx("text-white flex-1", {
                  "border-destructive focus-visible:ring-destructive":
                    fieldErrors.links,
                })}
              />
              {links.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeLink(index)}
                  className="size-12 shrink-0 rounded-xl border-white/10 bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {index === links.length - 1 && links.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLink}
                  className="h-12 whitespace-nowrap rounded-xl border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  أضف رابطاً آخر
                </Button>
              )}
            </div>
          ))}
          {fieldErrors.links && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.links}</p>
          )}
        </div>

        <div className="grid gap-2 mt-4">
          <Label className="text-sm font-medium text-zinc-300">
            ارفع سيرتك الذاتية <span className="text-red-400">*</span>
          </Label>

          {!cvFile ? (
            <div
              className={clsx(
                "cursor-pointer rounded-2xl border border-dashed border-white/12 bg-white/2 p-8 text-center transition-colors hover:border-cs-teal/40 hover:bg-cs-teal/5",
                {
                  "border-red-400/60": fieldErrors.cv,
                },
              )}
            >
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="cv-upload"
                onChange={handleFileChange}
              />
              <label
                htmlFor="cv-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 text-zinc-400"
              >
                <Upload className="h-8 w-8" />
                <span className="font-medium">انقر لرفع سيرتك الذاتية</span>
                <span className="text-sm">
                  PDF أو DOC أو DOCX (حجم أقصى 5 ميغابايت)
                </span>
              </label>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-cs-teal/20 bg-cs-teal/10 p-2">
                    <FileText className="h-6 w-6 text-cs-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{cvFile.name}</p>
                    <p className="text-xs text-zinc-500">
                      {(cvFile.size / 1024).toFixed(2)} كيلوبايت
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="text-zinc-500 hover:bg-red-400/10 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {fieldErrors.cv && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.cv}</p>
          )}
        </div>

        <hr className="my-10 border-0 border-t border-white/8" />
        <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">التعليم</h2>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              أعلى مستوى تعليمي{" "}
              <span className="text-xs font-normal text-zinc-500">
                (اختياري)
              </span>
            </Label>
            <Select name="highestEducationLevel">
              <SelectTrigger
                className={clsx("w-full text-white", {
                  "border-destructive focus:ring-destructive":
                    fieldErrors.highestEducationLevel,
                })}
              >
                <SelectValue placeholder="اختر أعلى مستوى تعليمي" />
              </SelectTrigger>
              <SelectContent>
                {educationLevelEnum?.enumValues.map((v, i) => (
                  <SelectItem key={i} value={v}>
                    {educationLevelLabel[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.highestEducationLevel && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.highestEducationLevel}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              التخصص الدراسي{" "}
              <span className="text-xs font-normal text-zinc-500">
                (اختياري)
              </span>
            </Label>
            <Input
              name="fieldOfStudy"
              placeholder="أدخل تخصصك الدراسي"
              className={clsx("text-white", {
                "border-destructive focus-visible:ring-destructive":
                  fieldErrors.fieldOfStudy,
              })}
            />
            {fieldErrors.fieldOfStudy && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.fieldOfStudy}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              سنة التخرج{" "}
              <span className="text-xs font-normal text-zinc-500">
                (اختياري)
              </span>
            </Label>
            <Input
              name="graduationYear"
              placeholder="أدخل سنة التخرج"
              className={clsx("text-white", {
                "border-destructive focus-visible:ring-destructive":
                  fieldErrors.graduationYear,
              })}
              type="number"
              min="1950"
              max={new Date().getFullYear() + 10}
            />
            {fieldErrors.graduationYear && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.graduationYear}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || isUploadingFile}
          className="sticky bottom-5 left-0 mt-10 h-14 w-full rounded-xl bg-cs-teal text-base font-semibold text-white opacity-100 shadow-none hover:bg-cs-teal-hover"
        >
          {isUploadingFile
            ? "جارٍ رفع السيرة الذاتية..."
            : isPending
              ? "جارٍ إرسال الطلب..."
              : "إرسال الطلب"}
        </Button>
        </form>
      </div>
    </section>
  );
};

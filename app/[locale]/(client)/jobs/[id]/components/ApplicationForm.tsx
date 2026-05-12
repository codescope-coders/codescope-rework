"use client";
import {
  educationLevelLabel,
  expectedSalaryLabel,
} from "@/app/[locale]/(admin)/dashboard/applications/components/Application";
import Container from "@/components/Container";
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
    <Container>
      <form onSubmit={handleSubmit} dir="rtl">
        <h2 className="font-semibold text-4xl pb-4">معلومات التواصل</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              الاسم الكامل <span className="text-destructive">*</span>
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.fullName}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              البريد الإلكتروني <span className="text-destructive">*</span>
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              المدينة الحالية <span className="text-destructive">*</span>
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.currentCity}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              رقم الهاتف{" "}
              <span className="text-muted-foreground text-sm font-normal">
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.phoneNumber}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              تاريخ الميلاد <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={"outline"}
                  className={clsx(
                    "bg-transparent border-input border h-12 justify-start text-muted-foreground hover:bg-transparent",
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
              <PopoverContent className="w-auto p-0">
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.dateOfBirth}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              الجنسية <span className="text-destructive">*</span>
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.nationality}
              </p>
            )}
          </div>
        </div>
        <hr className="mt-8 pb-8 border-input" />
        <h2 className="font-semibold text-4xl pb-4">المنصب والتوفر</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              الراتب المتوقع{" "}
              <span className="text-muted-foreground text-sm font-normal">
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.expectedSalary}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              تاريخ الاستعداد للبدء{" "}
              <span className="text-muted-foreground text-sm font-normal">
                (اختياري، فوري بشكل افتراضي)
              </span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={"outline"}
                  className={clsx(
                    "bg-transparent font-normal border-input border h-10 justify-start text-muted-foreground hover:bg-transparent",
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
              <PopoverContent className="w-auto p-0">
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.availabilityDate}
              </p>
            )}
          </div>
        </div>
        <hr className="mt-8 pb-8 border-input" />
        <h2 className="font-semibold text-4xl pb-4">الخلفية المهنية</h2>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              سنوات الخبرة{" "}
              <span className="text-muted-foreground text-sm font-normal">
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.yearsOfExperience}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              المسمى الوظيفي الأخير{" "}
              <span className="text-muted-foreground text-sm font-normal">
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.lastJobTitle}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              اسم آخر شركة{" "}
              <span className="text-muted-foreground text-sm font-normal">
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.lastCompanyName}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 mt-4">
          <Label className="text-base font-semibold">
            الروابط{" "}
            <span className="text-muted-foreground text-sm font-normal">
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
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {index === links.length - 1 && links.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLink}
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  أضف رابطاً آخر
                </Button>
              )}
            </div>
          ))}
          {fieldErrors.links && (
            <p className="text-sm text-destructive mt-1">{fieldErrors.links}</p>
          )}
        </div>

        <div className="grid gap-2 mt-4">
          <Label className="text-base font-semibold">
            ارفع سيرتك الذاتية <span className="text-destructive">*</span>
          </Label>

          {!cvFile ? (
            <div
              className={clsx(
                "border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-muted-foreground transition-colors cursor-pointer",
                {
                  "border-destructive": fieldErrors.cv,
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
                className="cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                <Upload className="h-8 w-8" />
                <span className="font-medium">انقر لرفع سيرتك الذاتية</span>
                <span className="text-sm">
                  PDF أو DOC أو DOCX (حجم أقصى 5 ميغابايت)
                </span>
              </label>
            </div>
          ) : (
            <div className="border-2 border-input rounded-lg p-4 bg-accent/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{cvFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(cvFile.size / 1024).toFixed(2)} كيلوبايت
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {fieldErrors.cv && (
            <p className="text-sm text-destructive mt-1">{fieldErrors.cv}</p>
          )}
        </div>

        <hr className="mt-8 pb-8 border-input" />
        <h2 className="font-semibold text-4xl pb-4">التعليم</h2>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              أعلى مستوى تعليمي{" "}
              <span className="text-muted-foreground text-sm font-normal">
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.highestEducationLevel}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              التخصص الدراسي{" "}
              <span className="text-muted-foreground text-sm font-normal">
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.fieldOfStudy}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              سنة التخرج{" "}
              <span className="text-muted-foreground text-sm font-normal">
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
              <p className="text-sm text-destructive mt-1">
                {fieldErrors.graduationYear}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || isUploadingFile}
          className="w-full mt-8 h-14 text-base font-semibold sticky bottom-5 left-0 opacity-100"
        >
          {isUploadingFile
            ? "جارٍ رفع السيرة الذاتية..."
            : isPending
              ? "جارٍ إرسال الطلب..."
              : "إرسال الطلب"}
        </Button>
      </form>
    </Container>
  );
};

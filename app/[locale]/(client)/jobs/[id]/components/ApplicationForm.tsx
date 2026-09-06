"use client";
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
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

/**
 * The candidate application form — translated (P8).
 *
 * ⚠️ Validation and submission are BEHAVIOURALLY UNCHANGED. The same fields are
 * required, the same regex checks the email, the same year bounds apply, the
 * same `FormData` keys are read, the same upload-then-mutate order runs, and
 * the same optional fields are omitted when blank. What moved is strings and
 * direction: every label, placeholder, section heading, option label, button,
 * validation message and toast now comes from the `Jobs` namespace, and the
 * hardcoded `dir="rtl"` is gone because the copy is no longer Arabic-only.
 *
 * The option labels for expected salary and education level used to live in
 * `lib/careers-labels.ts` as Arabic-only maps. That module existed solely for
 * this form, so it was retired rather than left half-used — the labels are
 * messages now, in both locales, keyed by the database enum values.
 */

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

export const ApplicationForm = () => {
  const t = useTranslations("Jobs");
  const [dateOfBirth, setDateOfBirth] = React.useState<Date>();
  const [availabilityDate, setAvailabilityDate] = React.useState<Date>();
  const [links, setLinks] = React.useState<string[]>([""]);
  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const { showMessage } = useVariablesStore();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  /**
   * Option labels are keyed by a DATABASE enum value, and next-intl throws on a
   * missing message — so a value added to `expected_salary` / `education_level`
   * before its translation lands would take down the whole form rather than
   * render one odd-looking row. Falling back to the raw value keeps the blast
   * radius the size the old plain-object lookup had.
   */
  const optionLabel = (group: "salary" | "education", value: string): string => {
    const key = `${group}.${value}`;
    return t.has(key) ? t(key) : value;
  };

  const { mutateAsync: uploadFile, isPending: isUploadingFile } = useUpload();

  /**
   * ⚠️ PRE-EXISTING, NOT INTRODUCED HERE: the second argument is DEAD. Its
   * parameter is named `p0` in `hooks/useApplications.ts` and that hook wires
   * only `onSuccess` — there is no `onError`, so nothing has ever invoked this
   * callback and a server-side rejection currently surfaces as nothing at all.
   * It is left in place (translated, so it is correct if it is ever called)
   * rather than deleted, because the fix belongs in the hook.
   *
   * Client-side validation is unaffected: `validateForm` runs in `handleSubmit`
   * below and paints the inline field errors itself.
   */
  const { mutate, isPending } = useCreateApplication(
    () => {
      showMessage();
      setTimeout(() => {
        router.push("/");
      }, 500);
    },
    (error) => {
      if (error?.fieldErrors) {
        setFieldErrors(error.fieldErrors);
        toast.error(t("form.toast.fixErrors"));
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error(t("form.toast.submitFailed"));
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
      errors.fullName = t("form.validation.fullName");
    }

    if (!form.get("email")) {
      errors.email = t("form.validation.emailRequired");
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.get("email") as string)
    ) {
      errors.email = t("form.validation.emailInvalid");
    }

    if (!form.get("currentCity")) {
      errors.currentCity = t("form.validation.currentCity");
    }

    if (!form.get("nationality")) {
      errors.nationality = t("form.validation.nationality");
    }

    if (!dateOfBirth) {
      errors.dateOfBirth = t("form.validation.dateOfBirth");
    }

    if (!cvFile) {
      errors.cv = t("form.validation.cv");
    }

    if (
      form.get("yearsOfExperience") &&
      Number(form.get("yearsOfExperience")) < 0
    ) {
      errors.yearsOfExperience = t("form.validation.yearsOfExperience");
    }

    if (
      form.get("graduationYear") &&
      (Number(form.get("graduationYear")) < 1950 ||
        Number(form.get("graduationYear")) > new Date().getFullYear() + 10)
    ) {
      errors.graduationYear = t("form.validation.graduationYear");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    if (!validateForm(e)) {
      toast.error(t("form.toast.requiredFields"));
      return;
    }

    const form = new FormData(e.currentTarget);

    try {
      const cvFormData = new FormData();
      cvFormData.append("cv", cvFile!);
      const uploadResponse = await uploadFile(cvFormData);
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
      toast.error(t("form.toast.uploadFailed"));
      console.error("Upload error:", err);
    }
  };

  return (
    <section className="px-6 pb-28">
      <div className="mx-auto max-w-4xl">
        <form
          onSubmit={handleSubmit}
          /* `site-form` is the hook for the scoped control styling in
             globals.css — see the block under "Careers application form".
             The shadcn primitives in here read the LIGHT shadcn tokens off
             `:root`, which is correct for the dashboard and wrong on this
             ground; restyling them in CSS keeps the validation and submission
             logic untouched.

             No `dir` — every string is locale-resolved now, so the form
             follows the document like the rest of the site. */
          className="site-form"
        >
        <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">{t("form.sections.contact")}</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              {t("form.fullName")} <span className="text-red-400">*</span>
            </Label>
            <Input
              placeholder={t("form.fullNamePlaceholder")}
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
              {t("form.email")} <span className="text-red-400">*</span>
            </Label>
            <Input
              name="email"
              placeholder={t("form.emailPlaceholder")}
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
              {t("form.currentCity")} <span className="text-red-400">*</span>
            </Label>
            <Input
              name="currentCity"
              placeholder={t("form.currentCityPlaceholder")}
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
              {t("form.phone")}{" "}
              <span className="text-xs font-normal text-zinc-500">
                {t("form.optional")}
              </span>
            </Label>
            <Input
              name="phoneNumber"
              placeholder={t("form.phonePlaceholder")}
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
              {t("form.dateOfBirth")} <span className="text-red-400">*</span>
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
                    <span>{t("form.datePlaceholder")}</span>
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
              {t("form.nationality")} <span className="text-red-400">*</span>
            </Label>
            <Input
              name="nationality"
              placeholder={t("form.nationalityPlaceholder")}
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
        <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">{t("form.sections.role")}</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              {t("form.expectedSalary")}{" "}
              <span className="text-xs font-normal text-zinc-500">
                {t("form.optional")}
              </span>
            </Label>
            <Select name="expectedSalary">
              <SelectTrigger
                className={clsx("w-full text-white", {
                  "border-destructive focus:ring-destructive":
                    fieldErrors.expectedSalary,
                })}
              >
                <SelectValue placeholder={t("form.expectedSalaryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {expectedSalaryEnum?.enumValues.map((v, i) => (
                  <SelectItem key={i} value={v}>
                    {optionLabel("salary", v)}
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
              {t("form.availability")}{" "}
              <span className="text-xs font-normal text-zinc-500">
                {t("form.optionalImmediate")}
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
                    <span>{t("form.datePlaceholder")}</span>
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
        <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">{t("form.sections.experience")}</h2>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              {t("form.yearsOfExperience")}{" "}
              <span className="text-xs font-normal text-zinc-500">
                {t("form.optional")}
              </span>
            </Label>
            <Input
              name="yearsOfExperience"
              placeholder={t("form.yearsOfExperiencePlaceholder")}
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
              {t("form.lastJobTitle")}{" "}
              <span className="text-xs font-normal text-zinc-500">
                {t("form.optional")}
              </span>
            </Label>
            <Input
              name="lastJobTitle"
              placeholder={t("form.lastJobTitlePlaceholder")}
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
              {t("form.lastCompanyName")}{" "}
              <span className="text-xs font-normal text-zinc-500">
                {t("form.optional")}
              </span>
            </Label>
            <Input
              name="lastCompanyName"
              placeholder={t("form.lastCompanyNamePlaceholder")}
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
            {t("form.links")}{" "}
            <span className="text-xs font-normal text-zinc-500">
              {t("form.linksHint")}
            </span>
          </Label>
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={link}
                onChange={(e) => handleLinkChange(index, e.target.value)}
                placeholder={t("form.linkPlaceholder")}
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
                  /* Icon-only, so it had no accessible name at all — a screen
                     reader announced it as an unlabelled button. */
                  aria-label={t("form.removeLink")}
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
                  {t("form.addLink")}
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
            {t("form.cv")} <span className="text-red-400">*</span>
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
                <span className="font-medium">{t("form.cvDropzoneTitle")}</span>
                <span className="text-sm">{t("form.cvDropzoneHint")}</span>
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
                    {/* The candidate's own filename — `dir="auto"` for the same
                        reason the role data has it. */}
                    <p dir="auto" className="text-sm font-medium text-white">
                      {cvFile.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {(cvFile.size / 1024).toFixed(2)} {t("form.kilobytes")}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  aria-label={t("form.removeFile")}
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
        <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">{t("form.sections.education")}</h2>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-zinc-300">
              {t("form.educationLevel")}{" "}
              <span className="text-xs font-normal text-zinc-500">
                {t("form.optional")}
              </span>
            </Label>
            <Select name="highestEducationLevel">
              <SelectTrigger
                className={clsx("w-full text-white", {
                  "border-destructive focus:ring-destructive":
                    fieldErrors.highestEducationLevel,
                })}
              >
                <SelectValue placeholder={t("form.educationLevelPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {educationLevelEnum?.enumValues.map((v, i) => (
                  <SelectItem key={i} value={v}>
                    {optionLabel("education", v)}
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
              {t("form.fieldOfStudy")}{" "}
              <span className="text-xs font-normal text-zinc-500">
                {t("form.optional")}
              </span>
            </Label>
            <Input
              name="fieldOfStudy"
              placeholder={t("form.fieldOfStudyPlaceholder")}
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
              {t("form.graduationYear")}{" "}
              <span className="text-xs font-normal text-zinc-500">
                {t("form.optional")}
              </span>
            </Label>
            <Input
              name="graduationYear"
              placeholder={t("form.graduationYearPlaceholder")}
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
            ? t("form.uploadingCv")
            : isPending
              ? t("form.submitting")
              : t("form.submit")}
        </Button>
        </form>
      </div>
    </section>
  );
};

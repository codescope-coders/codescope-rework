import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { jobStatusEnum, jobTypeEnum } from "@/lib/db/schema";
import React, { useRef } from "react";
import { ListInput, ListInputRef } from "../../../../../components/ListInput";
import { useCreateJob } from "@/hooks/useJobs";
import { JobStatus } from "@/services/jobs";
import clsx from "clsx";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClientProvider";

export const NewJobDialog = ({ closeDialog }: { closeDialog: () => void }) => {
  const requirementsRef = useRef<ListInputRef>(null);
  const responsibilitiesRef = useRef<ListInputRef>(null);

  const { mutateAsync, isPending, error } = useCreateJob((msg) => {
    toast.message(msg);
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requirements = requirementsRef.current?.getItems() || [];
    const responsibilities = responsibilitiesRef.current?.getItems() || [];
    const form = new FormData(e.target as HTMLFormElement);

    await mutateAsync({
      position: form.get("position") as string,
      requirements,
      responsibilities,
      status: form.get("status") as JobStatus,
      location: form.get("location") as string,
      description: form.get("description") as string,
    });
    closeDialog();
  };

  return (
    <DialogContent showCloseButton={false}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Create a New Job</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 flex-wrap">
          <div className="grid gap-2 w-full flex-1 md:min-w-sm min-w-full">
            <Label>
              Position <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Frontend, backend..."
              size={"sm"}
              name="position"
              className={clsx({
                "border-destructive": (
                  error as { fieldErrors?: { position?: string } }
                )?.fieldErrors?.position,
              })}
            />
          </div>
          <div className="grid gap-2 w-full flex-1 md:min-w-sm min-w-full">
            <Label>Type</Label>
            <Select name="type">
              <SelectTrigger
                className={clsx("w-full capitalize", {
                  "border-destructive!": (
                    error as { fieldErrors?: { type?: string } }
                  )?.fieldErrors?.type,
                })}
              >
                <SelectValue placeholder="Job type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypeEnum.enumValues.map((val, i) => (
                  <SelectItem value={val} key={i} className="capitalize">
                    {val.toLowerCase().replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 w-full flex-1 md:min-w-sm min-w-full">
            <Label>Status</Label>
            <Select name="status">
              <SelectTrigger
                className={clsx("w-full capitalize", {
                  "border-destructive!": (
                    error as { fieldErrors?: { status?: string } }
                  )?.fieldErrors?.status,
                })}
              >
                <SelectValue placeholder="Job status" />
              </SelectTrigger>
              <SelectContent>
                {jobStatusEnum.enumValues.map((val, i) => (
                  <SelectItem value={val} key={i} className="capitalize">
                    {val.toLowerCase().replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2 w-full flex-1 md:min-w-sm min-w-full mt-4">
          <Label>
            Location <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="Enter location"
            size={"sm"}
            name="location"
            className={clsx({
              "border-destructive": (
                error as { fieldErrors?: { location?: string } }
              )?.fieldErrors?.location,
            })}
          />
        </div>
        <div className="grid gap-2 w-full flex-1 md:min-w-sm min-w-full mt-4">
          <Label>Description</Label>
          <Textarea
            placeholder="Enter description"
            className="min-h-20 max-h-40! resize-y"
            name="description"
          />
        </div>

        <div className="mt-4">
          <ListInput
            ref={requirementsRef}
            className={clsx("w-full", {
              "border-destructive!": (
                error as { fieldErrors?: { requirements?: string } }
              )?.fieldErrors?.requirements,
            })}
            required
            label="Requirements"
            placeholder="Add a requirement"
            id="requirements"
          />
        </div>

        <div className="mt-4 mb-5">
          <ListInput
            className={clsx("w-full", {
              "border-destructive!": (
                error as { fieldErrors?: { responsibilities?: string } }
              )?.fieldErrors?.responsibilities,
            })}
            ref={responsibilitiesRef}
            label="Responsibilities"
            placeholder="Add a responsibility"
            id="responsibilities"
          />
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button variant={"outline"} type="button" onClick={closeDialog}>
              Close
            </Button>
            <Button disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

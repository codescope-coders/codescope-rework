"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TableHandlerCell,
  TableHandlerRow,
  TableHandlerToggle,
} from "@/components/ui/TableHandler";
import { timeAgo } from "@/helpers/date";
import { useDeleteJob, useToggleJob } from "@/hooks/useJobs";
import { queryClient } from "@/lib/queryClientProvider";
import { JobDto } from "@/services/jobs";
import {
  ChevronRight,
  Edit,
  Lock,
  MoreHorizontal,
  Trash,
  Unlock,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";

export const JobRow = ({
  job,
  openDialog,
}: {
  job: JobDto;
  openDialog: () => void;
}) => {
  const [_, setJobToEdit] = useQueryState("job-to-edit");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { mutate, isPending } = useToggleJob(job.id, () => {
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    setIsPopoverOpen(false);
  });
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJob(
    job.id,
    () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsPopoverOpen(false);
    },
  );

  return (
    <TableHandlerRow disabled={isPending || isDeleting}>
      <TableHandlerCell className="font-medium p-0">
        <div className="flex items-center gap-2 px-2">
          <TableHandlerToggle>
            <ChevronRight />
          </TableHandlerToggle>
          {job.position}
        </div>
      </TableHandlerCell>
      <TableHandlerCell className="px-5" columnKey="location">
        {job.location ?? "—"}
      </TableHandlerCell>
      <TableHandlerCell className="capitalize" columnKey="type">
        {job.type.replace("_", " ").toLowerCase()}
      </TableHandlerCell>
      <TableHandlerCell columnKey="status">
        <Badge
          variant={job.status === "AVAILABLE" ? "green" : "secondary"}
          className="capitalize"
        >
          {job.status.toLowerCase()}
        </Badge>
      </TableHandlerCell>
      <TableHandlerCell
        className="font-medium text-xs text-center text-gray-600"
        columnKey="created"
      >
        {timeAgo(job.createdAt)}
      </TableHandlerCell>
      <TableHandlerCell className="text-center">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              size={"icon-sm"}
              variant={"ghost"}
              className="hover:bg-primary/20 hover:text-primary"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-50 flex flex-col p-0 overflow-hidden"
            align="start"
          >
            <Button
              className="w-full rounded-none justify-start hover:bg-primary/5"
              variant={"ghost"}
              dir="ltr"
              onClick={() => mutate()}
            >
              {job.status == "AVAILABLE" ? <Lock /> : <Unlock />}
              <span className="translate-y-px">
                {job.status == "AVAILABLE" ? "Close Job" : "Open Job"}
              </span>
            </Button>
            <Button
              className="w-full rounded-none justify-start hover:bg-primary/5"
              variant={"ghost"}
              dir="ltr"
              onClick={() => {
                setJobToEdit(String(job.id));
                openDialog();
              }}
            >
              <Edit /> <span className="translate-y-px">Edit Job</span>
            </Button>
            <Button
              className="w-full rounded-none justify-start hover:bg-primary/5"
              variant={"ghost"}
              dir="ltr"
              onClick={() => deleteJob()}
            >
              <Trash /> <span className="translate-y-px">Delete Job</span>
            </Button>
          </PopoverContent>
        </Popover>
      </TableHandlerCell>
    </TableHandlerRow>
  );
};

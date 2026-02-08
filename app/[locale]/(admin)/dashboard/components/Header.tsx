"use client";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { NewJobDialog } from "./NewJobDialog";

export type JobsTableDialogsType = "new-job" | null;

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogType, setDialogType] = useState<JobsTableDialogsType>(null);

  const openDialog = (type: JobsTableDialogsType) => {
    setIsOpen(true);
    setDialogType(type);
  };
  const closeDialog = () => {
    setIsOpen(false);
    setDialogType(null);
  };

  return (
    <header className="flex justify-between gap-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {dialogType == "new-job" ? (
          <NewJobDialog closeDialog={closeDialog} />
        ) : null}
      </Dialog>
      <h1 className="font-semibold text-4xl mb-4">Jobs</h1>
      <Button size={"sm"} onClick={() => openDialog("new-job")}>
        <Plus />
        New Job
      </Button>
    </header>
  );
};

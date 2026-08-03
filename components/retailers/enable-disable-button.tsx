"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateAdminRetailerStatus } from "@/lib/api/admin";
import type { AdminRetailer } from "@/types/admin";

export function EnableDisableButton({ retailer }: { retailer: AdminRetailer }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const isActive = retailer.accountStatus === "active";

  function runToggle() {
    startTransition(async () => {
      const result = await updateAdminRetailerStatus(retailer.id, !isActive);
      if (result.error) {
        toast.error(result.message);
        setConfirming(false);
        return;
      }

      toast.success(
        isActive ? "Retailer account disabled" : "Retailer account enabled",
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "retailers"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] }),
      ]);
      router.refresh();
      setConfirming(false);
    });
  }

  if (!confirming) {
    return (
      <Button
        variant={isActive ? "destructive" : "default"}
        onClick={() => setConfirming(true)}
        disabled={pending}
      >
        {isActive ? "Disable account" : "Enable account"}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-sm">
        {isActive
          ? "Disable this retailer? They will lose API access."
          : "Enable this retailer account?"}
      </span>
      <Button
        variant={isActive ? "destructive" : "default"}
        size="sm"
        onClick={runToggle}
        disabled={pending}
      >
        {pending ? "Saving…" : "Confirm"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirming(false)}
        disabled={pending}
      >
        Cancel
      </Button>
    </div>
  );
}

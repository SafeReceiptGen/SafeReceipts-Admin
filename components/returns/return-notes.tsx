"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addAdminReturnNote } from "@/lib/api/admin";
import type { AdminReturnNote } from "@/types/admin";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function authorLabel(note: AdminReturnNote) {
  if (note.author.name && note.author.email) {
    return `${note.author.name} (${note.author.email})`;
  }
  return note.author.name || note.author.email || "Admin";
}

export function ReturnNotes({
  returnId,
  notes,
}: {
  returnId: string;
  notes: AdminReturnNote[];
}) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error("Note cannot be empty");
      return;
    }

    startTransition(async () => {
      const result = await addAdminReturnNote(returnId, trimmed);
      if (result.error) {
        toast.error(result.message);
        return;
      }
      toast.success("Internal note added");
      setBody("");
      await queryClient.invalidateQueries({
        queryKey: ["admin", "returns", returnId],
      });
      await queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
    });
  }

  return (
    <div className="space-y-4">
      {notes.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No internal notes yet. Notes are visible only to platform admins.
        </p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border bg-muted/30 px-3 py-2"
            >
              <p className="text-sm whitespace-pre-wrap">{note.body}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {authorLabel(note)} · {formatDate(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add an internal note for support…"
          rows={3}
          disabled={pending}
        />
        <Button type="submit" size="sm" disabled={pending || !body.trim()}>
          {pending ? "Saving…" : "Add note"}
        </Button>
      </form>
    </div>
  );
}

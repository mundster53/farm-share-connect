import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const noteSchema = z
  .string()
  .trim()
  .max(500, "Optional note must be 500 characters or less")
  .optional();

type FarmerRequest = {
  id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  admin_note: string | null;
};

export function RequestFarmerAccessPanel() {
  const { user } = useAuth();
  const { toast } = useToast();

  // The backend schema/types are generated; until they refresh locally,
  // we use an any-typed client for newly-added tables/functions.
  const sb = supabase as any;

  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [request, setRequest] = useState<FarmerRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canQuery = useMemo(() => !!user, [user]);

  const loadMyRequests = async () => {
    if (!user) return;
    const { data, error } = await sb
      .from("farmer_role_requests")
      .select("id,status,created_at,admin_note")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      toast({
        variant: "destructive",
        title: "Couldn’t load request status",
        description: error.message,
      });
      return;
    }

    if (!data) {
      setRequest(null);
      return;
    }

    setRequest({
      id: String((data as any).id),
      status: (data as any).status,
      created_at: String((data as any).created_at),
      admin_note: (data as any).admin_note ?? null,
    });
  };

  useEffect(() => {
    if (canQuery) void loadMyRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canQuery]);

  const submitRequest = async () => {
    if (!user) return;
    const parsed = noteSchema.safeParse(note);
    if (!parsed.success) {
      setNoteError(parsed.error.errors[0]?.message ?? "Invalid note");
      return;
    }
    setNoteError(null);

    setIsLoading(true);
    try {
      const { data, error } = await sb.rpc("request_farmer_role", {
        _note: parsed.data ?? null,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Request failed",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Request submitted",
        description: "We’ll review your request for farmer access.",
      });

      if (data) {
        setRequest({
          id: String((data as any).id),
          status: (data as any).status,
          created_at: String((data as any).created_at),
          admin_note: (data as any).admin_note ?? null,
        });
      } else {
        await loadMyRequests();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isPending = request?.status === "pending";

  return (
    <div className="bg-card rounded-2xl shadow-card p-6">
      <h3 className="text-xl font-serif font-semibold text-foreground">
        Request farmer access
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Farmer tools are restricted. Submit a request and an admin can approve it.
      </p>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="text-sm text-muted-foreground">Current status</div>
          <div className="mt-1 text-base text-foreground">
            {request ? (
              <span className="font-medium">{request.status}</span>
            ) : (
              <span className="text-muted-foreground">no request submitted</span>
            )}
          </div>
          {request?.admin_note ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Admin note: {request.admin_note}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="farmerNote">Optional note</Label>
          <Textarea
            id="farmerNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tell us about your farm (optional)…"
            className={noteError ? "border-destructive" : ""}
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            {noteError ? (
              <p className="text-sm text-destructive">{noteError}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Up to 500 characters.</p>
            )}
            <p className="text-xs text-muted-foreground">{note.trim().length}/500</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={submitRequest} disabled={isLoading || isPending}>
            {isPending ? "Request pending" : isLoading ? "Submitting…" : "Submit request"}
          </Button>
          <Button variant="outline" onClick={loadMyRequests} disabled={isLoading}>
            Refresh status
          </Button>
        </div>

        {request?.status === "approved" ? (
          <p className="text-sm text-muted-foreground">
            Approved — sign out/in (or refresh) to access farmer tools.
          </p>
        ) : null}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type AccessState = "checking" | "allowed" | "forbidden";

type RequestRow = {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  admin_note: string | null;
  created_at: string;
};

const adminNoteSchema = z
  .string()
  .trim()
  .max(500, "Admin note must be 500 characters or less")
  .optional();

export default function AdminFarmerRequests() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const sb = supabase as any;

  const [access, setAccess] = useState<AccessState>("checking");
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [adminNoteById, setAdminNoteById] = useState<Record<string, string>>({});

  const canCheck = useMemo(() => !!user && !authLoading, [user, authLoading]);

  useEffect(() => {
    const check = async () => {
      if (!canCheck || !user) return;
      setAccess("checking");
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (error) {
        setAccess("forbidden");
        return;
      }
      setAccess(data ? "allowed" : "forbidden");
    };
    void check();
  }, [canCheck, user]);

  const load = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await sb
        .from("farmer_role_requests")
        .select("id,user_id,status,note,admin_note,created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        toast({
          variant: "destructive",
          title: "Couldn’t load requests",
          description: error.message,
        });
        setRows([]);
        return;
      }

      setRows(
        (data ?? []).map((r: any) => ({
          id: String(r.id),
          user_id: String(r.user_id),
          status: r.status,
          note: r.note ?? null,
          admin_note: r.admin_note ?? null,
          created_at: String(r.created_at),
        })),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (access === "allowed") void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access]);

  const review = async (requestId: string, decision: "approved" | "rejected") => {
    const parsed = adminNoteSchema.safeParse(adminNoteById[requestId] ?? "");
    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Invalid admin note",
        description: parsed.error.errors[0]?.message,
      });
      return;
    }

    const { error } = await sb.rpc("review_farmer_role_request", {
      _request_id: requestId,
      _decision: decision,
      _admin_note: (parsed.data ?? "") || null,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Review failed",
        description: error.message,
      });
      return;
    }

    toast({
      title: `Request ${decision}`,
      description: "The request was updated.",
    });
    await load();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-lg font-serif font-semibold text-foreground">
              Admin · Farmer Requests
            </h1>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to home
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-10">
          <Button asChild>
            <Link to="/auth">Go to sign in</Link>
          </Button>
        </main>
      </div>
    );
  }

  if (access !== "allowed") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-lg font-serif font-semibold text-foreground">
              Admin · Farmer Requests
            </h1>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to home
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-10">
          <p className="text-muted-foreground">Admin access required.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-serif font-semibold text-foreground">
              Admin · Farmer Requests
            </h1>
            <p className="text-sm text-muted-foreground">
              Approve or reject farmer access requests.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={load} disabled={isLoading}>
              {isLoading ? "Refreshing…" : "Refresh"}
            </Button>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr className="border-b border-border">
                  <th className="px-6 py-3 font-medium text-muted-foreground">User</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Note</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Admin note</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-muted-foreground" colSpan={5}>
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const isPending = r.status === "pending";
                    return (
                      <tr key={r.id} className="border-b border-border last:border-b-0">
                        <td className="px-6 py-4 text-foreground font-mono text-xs">
                          {r.user_id}
                        </td>
                        <td className="px-6 py-4 text-foreground">{r.status}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {r.note ?? "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <Label className="sr-only" htmlFor={`adminNote-${r.id}`}>
                              Admin note
                            </Label>
                            <Input
                              id={`adminNote-${r.id}`}
                              value={adminNoteById[r.id] ?? r.admin_note ?? ""}
                              onChange={(e) =>
                                setAdminNoteById((prev) => ({
                                  ...prev,
                                  [r.id]: e.target.value,
                                }))
                              }
                              placeholder="Optional (max 500)"
                              disabled={!isPending}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => review(r.id, "approved")}
                              disabled={!isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => review(r.id, "rejected")}
                              disabled={!isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

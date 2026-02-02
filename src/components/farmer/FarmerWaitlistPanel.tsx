import { useState } from "react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const farmIdSchema = z.string().uuid("Enter a valid farm id (UUID)");

type WaitlistRow = {
  id: string;
  zip_area: string | null;
  allow_contact: boolean;
};

export function FarmerWaitlistPanel() {
  const { toast } = useToast();

  const [farmId, setFarmId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [farmIdError, setFarmIdError] = useState<string | null>(null);

  const loadWaitlist = async () => {
    const parsed = farmIdSchema.safeParse(farmId.trim());
    if (!parsed.success) {
      setFarmIdError(parsed.error.errors[0]?.message ?? "Invalid farm id");
      return;
    }
    setFarmIdError(null);

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_farm_waitlist", {
        _farm_id: parsed.data,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Couldn’t load waitlist",
          description: error.message,
        });
        setRows([]);
        return;
      }

      const mapped: WaitlistRow[] = (data ?? []).map((r: any) => ({
        id: String(r.id),
        zip_area: r.zip_area ?? null,
        allow_contact: Boolean(r.allow_contact),
      }));

      setRows(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="farmId">Farm ID</Label>
            <Input
              id="farmId"
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              placeholder="e.g. 8b9d0c5e-..."
              className={farmIdError ? "border-destructive" : ""}
              autoComplete="off"
            />
            {farmIdError ? (
              <p className="text-sm text-destructive">{farmIdError}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                ZIP is masked to area; contact status reflects buyer opt-in.
              </p>
            )}
          </div>

          <Button onClick={loadWaitlist} disabled={isLoading}>
            {isLoading ? "Loading…" : "Load waitlist"}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-xl font-serif font-semibold text-foreground">
            Buyers waiting
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b border-border">
                <th className="px-6 py-3 font-medium text-muted-foreground">
                  ZIP area
                </th>
                <th className="px-6 py-3 font-medium text-muted-foreground">
                  Opted into contact
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-muted-foreground" colSpan={2}>
                    No entries loaded yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-b-0">
                    <td className="px-6 py-4 text-foreground">{r.zip_area ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          r.allow_contact ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {r.allow_contact ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type PurchaseRow = {
  id: string;
  farmName: string;
  portion: string;
  status: string;
  price_paid: number;
  created_at: string;
};

export function FarmerPurchasesPanel() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<PurchaseRow[]>([]);

  const canQuery = useMemo(() => !!user, [user]);

  const loadPurchases = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // RLS already restricts visibility to farm owners for their farms.
      const { data, error } = await supabase
        .from("share_purchases")
        .select("id,portion,status,price_paid,created_at, farms(name)")
        .order("created_at", { ascending: false })
        .limit(250);

      if (error) {
        toast({
          variant: "destructive",
          title: "Couldn’t load purchases",
          description: error.message,
        });
        setRows([]);
        return;
      }

      const mapped: PurchaseRow[] = (data ?? []).map((p: any) => ({
        id: String(p.id),
        farmName: String(p.farms?.name ?? "—"),
        portion: String(p.portion),
        status: String(p.status),
        price_paid: Number(p.price_paid),
        created_at: String(p.created_at),
      }));

      setRows(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (canQuery) void loadPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-serif font-semibold text-foreground">
            Purchases
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Purchases for farms you own.
          </p>
        </div>
        <Button variant="outline" onClick={loadPurchases} disabled={isLoading}>
          {isLoading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b border-border">
                <th className="px-6 py-3 font-medium text-muted-foreground">Farm</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Portion</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Paid</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-muted-foreground" colSpan={5}>
                    No purchases found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-b-0">
                    <td className="px-6 py-4 text-foreground">{r.farmName}</td>
                    <td className="px-6 py-4 text-foreground">{r.portion}</td>
                    <td className="px-6 py-4 text-foreground">{r.status}</td>
                    <td className="px-6 py-4 text-foreground">${r.price_paid}</td>
                    <td className="px-6 py-4 text-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
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

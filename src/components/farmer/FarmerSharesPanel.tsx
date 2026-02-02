import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ShareRow = {
  id: string;
  farmName: string;
  portion: string;
  price: number;
  quantity_available: number;
};

export function FarmerSharesPanel() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<ShareRow[]>([]);

  const canQuery = useMemo(() => !!user, [user]);

  const loadShares = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("farms")
        .select(
          "id,name,available_shares(id,portion,price,quantity_available)",
        )
        .eq("owner_id", user.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Couldn’t load shares",
          description: error.message,
        });
        setRows([]);
        return;
      }

      const mapped: ShareRow[] = (data ?? []).flatMap((farm: any) => {
        const farmName = String(farm.name);
        const shares = (farm.available_shares ?? []) as any[];
        return shares.map((s) => ({
          id: String(s.id),
          farmName,
          portion: String(s.portion),
          price: Number(s.price),
          quantity_available: Number(s.quantity_available),
        }));
      });

      setRows(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (canQuery) void loadShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-serif font-semibold text-foreground">
            Your shares
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Shares across farms you own.
          </p>
        </div>
        <Button variant="outline" onClick={loadShares} disabled={isLoading}>
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
                <th className="px-6 py-3 font-medium text-muted-foreground">Price</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Available</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-muted-foreground" colSpan={4}>
                    No shares found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-b-0">
                    <td className="px-6 py-4 text-foreground">{r.farmName}</td>
                    <td className="px-6 py-4 text-foreground">{r.portion}</td>
                    <td className="px-6 py-4 text-foreground">${r.price}</td>
                    <td className="px-6 py-4 text-foreground">{r.quantity_available}</td>
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

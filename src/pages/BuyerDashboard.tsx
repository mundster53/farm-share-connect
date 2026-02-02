import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, Package, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Purchase = Tables<"share_purchases"> & {
  farms: Tables<"farms"> | null;
  available_shares: Tables<"available_shares"> | null;
};

const BuyerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [user]);

  const fetchPurchases = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("share_purchases")
        .select(`
          *,
          farms (*),
          available_shares (*)
        `)
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "confirmed":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Awaiting Payment";
      case "confirmed":
        return "Payment Confirmed";
      case "completed":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              My Dashboard
            </h1>
            <p className="text-muted-foreground mb-8">
              Track your orders and manage your purchases.
            </p>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4 mb-12">
              <Link
                to="/#browse"
                className="bg-card rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Browse Farms</h3>
                    <p className="text-sm text-muted-foreground">
                      Find new shares near you
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
              <Link
                to="/profile"
                className="bg-card rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">My Profile</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your information
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </div>

            {/* Orders Section */}
            <h2 className="text-xl font-semibold text-foreground mb-4">My Orders</h2>

            {purchases.length === 0 ? (
              <div className="bg-card rounded-2xl p-12 text-center shadow-soft">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No orders yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Once you reserve a share, it will appear here.
                </p>
                <Button asChild>
                  <Link to="/#browse">Browse Farms</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="bg-card rounded-xl p-6 shadow-soft"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">
                          {purchase.available_shares?.animal_type === "beef" ? "🐄" : "🐷"}
                        </span>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {purchase.portion} Share
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            from {purchase.farms?.name || "Unknown Farm"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ordered {new Date(purchase.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">
                          ${purchase.price_paid}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(purchase.status)}
                          <span className="text-sm text-muted-foreground">
                            {getStatusText(purchase.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BuyerDashboard;

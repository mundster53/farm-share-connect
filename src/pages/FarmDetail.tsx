import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Star, ArrowLeft, Loader2, Check } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Farm = Tables<"farms">;
type Share = Tables<"available_shares">;

const FarmDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [farm, setFarm] = useState<Farm | null>(null);
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShare, setSelectedShare] = useState<Share | null>(null);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFarmDetails();
    }
  }, [id]);

  const fetchFarmDetails = async () => {
    setLoading(true);
    try {
      // Fetch farm
      const { data: farmData, error: farmError } = await supabase
        .from("farms")
        .select("*")
        .eq("id", id)
        .single();

      if (farmError) throw farmError;
      setFarm(farmData);

      // Fetch available shares
      const { data: sharesData, error: sharesError } = await supabase
        .from("available_shares")
        .select("*")
        .eq("farm_id", id)
        .gt("quantity_available", 0)
        .order("price", { ascending: true });

      if (sharesError) throw sharesError;
      setShares(sharesData || []);
    } catch (error) {
      console.error("Error fetching farm:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load farm details.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase a share.",
      });
      navigate("/auth");
      return;
    }

    if (!selectedShare || !farm) return;

    // Check if farm has Stripe Connect set up
    const farmData = farm as any;
    if (!farmData.stripe_account_id) {
      toast({
        variant: "destructive",
        title: "Not available",
        description: "This farm hasn't set up payments yet. Please check back later.",
      });
      return;
    }

    setReserving(true);
    try {
      // Create Stripe Checkout session for the purchase
      const response = await fetch("/api/purchase-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareId: selectedShare.id,
          farmId: farm.id,
          farmName: farm.name,
          farmerStripeAccountId: farmData.stripe_account_id,
          buyerId: user.id,
          buyerEmail: user.email,
          animalType: selectedShare.animal_type,
          portion: selectedShare.portion,
          price: selectedShare.price,
          weightEstimate: selectedShare.weight_estimate,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error starting purchase:", error);
      toast({
        variant: "destructive",
        title: "Purchase failed",
        description: "Could not start checkout. Please try again.",
      });
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
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

  if (!farm) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Farm not found</h1>
          <p className="text-muted-foreground mb-6">
            This farm may no longer be available.
          </p>
          <Button asChild>
            <Link to="/#browse">Browse other farms</Link>
          </Button>
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
          {/* Back Link */}
          <Link
            to="/#browse"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all farms
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Farm Info */}
            <div>
              <div className="bg-card rounded-2xl p-8 shadow-soft">
                <div className="text-8xl mb-6">
                  {farm.is_organic ? "🌿" : farm.is_grass_fed ? "🌾" : "🏔️"}
                </div>
                <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
                  {farm.name}
                </h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">{farm.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-secondary fill-secondary" />
                    <span className="font-medium">{farm.rating}</span>
                    <span className="text-muted-foreground">({farm.review_count} reviews)</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {farm.is_grass_fed && (
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      Grass-Fed
                    </span>
                  )}
                  {farm.is_organic && (
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      Organic
                    </span>
                  )}
                  {farm.badge && (
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {farm.badge}
                    </span>
                  )}
                </div>

                {farm.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {farm.description}
                  </p>
                )}
              </div>
            </div>

            {/* Available Shares */}
            <div>
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
                Available Shares
              </h2>

              {shares.length === 0 ? (
                <div className="bg-card rounded-2xl p-8 text-center shadow-soft">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-muted-foreground">
                    No shares currently available. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shares.map((share) => (
                    <div
                      key={share.id}
                      onClick={() => setSelectedShare(share)}
                      className={`bg-card rounded-xl p-6 shadow-soft cursor-pointer transition-all duration-200
                        ${selectedShare?.id === share.id
                          ? "ring-2 ring-primary"
                          : "hover:shadow-card"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">
                            {share.animal_type === "beef" ? "🐄" : "🐷"}
                          </span>
                          <div>
                            <div className="font-semibold text-foreground text-lg">
                              {share.portion} {share.animal_type === "beef" ? "Beef" : "Pork"}
                            </div>
                            <div className="text-muted-foreground">
                              {share.weight_estimate}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            ${share.price}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {share.quantity_available} available
                          </div>
                        </div>
                      </div>
                      {selectedShare?.id === share.id && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center gap-2 text-primary text-sm">
                            <Check className="w-4 h-4" />
                            Selected
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Purchase Button */}
              {shares.length > 0 && (
                <div className="mt-8">
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!selectedShare || reserving}
                    onClick={handleReserve}
                  >
                    {reserving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : selectedShare ? (
                      `Purchase ${selectedShare.portion} Share - $${selectedShare.price}`
                    ) : (
                      "Select a share to purchase"
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Secure checkout powered by Stripe. Farmer receives payment directly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmDetail;

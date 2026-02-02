import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, ExternalLink, Plus } from "lucide-react";

interface Farm {
  id: string;
  name: string;
  description: string;
  location: string;
  zip_code: string;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  is_active: boolean;
}

interface Share {
  id: string;
  animal_type: string;
  portion: string;
  price: number;
  weight_estimate: string;
  quantity_available: number;
  next_available_date: string;
}

export default function FarmerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{
    chargesEnabled: boolean;
    detailsSubmitted: boolean;
  } | null>(null);

  // Check for onboarding complete
  useEffect(() => {
    if (searchParams.get("onboarding") === "complete") {
      toast({
        title: "Stripe setup complete!",
        description: "You can now receive payments for your shares.",
      });
    }
    if (searchParams.get("refresh") === "true") {
      toast({
        title: "Please complete Stripe setup",
        description: "Click the button below to continue onboarding.",
      });
    }
  }, [searchParams, toast]);

  // Load farm data
  useEffect(() => {
    const loadFarm = async () => {
      if (!user) return;
      setLoading(true);

      // Get farmer's farm
      const { data: farmData, error: farmError } = await supabase
        .from("farms")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (farmError && farmError.code !== "PGRST116") {
        console.error("Error loading farm:", farmError);
      }

      if (farmData) {
        setFarm(farmData as Farm);

        // Load shares for this farm
        const { data: sharesData } = await supabase
          .from("available_shares")
          .select("*")
          .eq("farm_id", farmData.id);

        if (sharesData) {
          setShares(sharesData as Share[]);
        }

        // Check Stripe status if account exists
        if (farmData.stripe_account_id) {
          try {
            const response = await fetch("/api/check-connect-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ stripeAccountId: farmData.stripe_account_id }),
            });
            const status = await response.json();
            setStripeStatus(status);

            // Update onboarding status in database if changed
            if (status.chargesEnabled && !farmData.stripe_onboarding_complete) {
              await supabase
                .from("farms")
                .update({ stripe_onboarding_complete: true })
                .eq("id", farmData.id);
            }
          } catch (err) {
            console.error("Error checking Stripe status:", err);
          }
        }
      }

      setLoading(false);
    };

    loadFarm();
  }, [user]);

  const handleSetupStripe = async () => {
    if (!farm || !user) return;
    setConnectLoading(true);

    try {
      // If already has account, get new onboarding link
      if (farm.stripe_account_id) {
        const response = await fetch("/api/refresh-connect-onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stripeAccountId: farm.stripe_account_id }),
        });
        const data = await response.json();
        if (data.onboardingUrl) {
          window.location.href = data.onboardingUrl;
        }
      } else {
        // Create new Connect account
        const response = await fetch("/api/create-connect-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            farmName: farm.name,
          }),
        });
        const data = await response.json();

        if (data.accountId) {
          // Save account ID to database
          await supabase
            .from("farms")
            .update({ stripe_account_id: data.accountId })
            .eq("id", farm.id);

          // Redirect to onboarding
          if (data.onboardingUrl) {
            window.location.href = data.onboardingUrl;
          }
        }
      }
    } catch (error) {
      console.error("Stripe setup error:", error);
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: "Could not set up Stripe. Please try again.",
      });
    } finally {
      setConnectLoading(false);
    }
  };

  const handleCreateFarm = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("farms")
      .insert({
        owner_id: user.id,
        name: "My Farm",
        description: "A family farm selling quality meat.",
        location: "Enter your location",
        zip_code: "00000",
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create farm profile.",
      });
    } else {
      setFarm(data as Farm);
      toast({
        title: "Farm created!",
        description: "Now set up your Stripe account to start selling.",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-lg font-serif font-semibold text-foreground">Farmer Dashboard</h1>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to home
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-10">
          <section className="max-w-xl">
            <h2 className="text-2xl font-serif font-semibold text-foreground">Sign in required</h2>
            <p className="mt-2 text-muted-foreground">You need to be signed in to access farmer tools.</p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/auth">Go to sign in</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // No farm yet - show create farm
  if (!farm) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-lg font-serif font-semibold text-foreground">Farmer Dashboard</h1>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to home
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-10">
          <section className="max-w-xl">
            <div className="text-6xl mb-6">🌾</div>
            <h2 className="text-2xl font-serif font-semibold text-foreground">Welcome, Farmer!</h2>
            <p className="mt-2 text-muted-foreground">
              Create your farm profile to start selling shares directly to local buyers.
            </p>
            <div className="mt-6">
              <Button onClick={handleCreateFarm}>
                <Plus className="w-4 h-4 mr-2" />
                Create Farm Profile
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const isStripeReady = stripeStatus?.chargesEnabled && stripeStatus?.detailsSubmitted;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐄</span>
            <h1 className="text-lg font-serif font-semibold text-foreground">{farm.name}</h1>
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {/* Stripe Status Card */}
        <div className={`rounded-xl p-6 mb-8 ${isStripeReady ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {isStripeReady ? (
                <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
              )}
              <div>
                <h3 className="font-semibold text-foreground">
                  {isStripeReady ? "Payments Enabled" : "Set Up Payments"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isStripeReady
                    ? "You can receive payments for share purchases. Funds are deposited directly to your bank."
                    : "Connect your bank account to receive payments when buyers purchase shares."}
                </p>
              </div>
            </div>
            {!isStripeReady && (
              <Button onClick={handleSetupStripe} disabled={connectLoading}>
                {connectLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                {farm.stripe_account_id ? "Continue Setup" : "Set Up Stripe"}
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="shares" className="w-full">
          <TabsList>
            <TabsTrigger value="shares">My Shares</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Farm Profile</TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="shares">
              <SharesManager farm={farm} shares={shares} setShares={setShares} isStripeReady={isStripeReady || false} />
            </TabsContent>
            <TabsContent value="orders">
              <OrdersPanel farmId={farm.id} />
            </TabsContent>
            <TabsContent value="profile">
              <FarmProfileEditor farm={farm} setFarm={setFarm} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

// Shares Manager Component
function SharesManager({ 
  farm, 
  shares, 
  setShares, 
  isStripeReady 
}: { 
  farm: Farm; 
  shares: Share[]; 
  setShares: (shares: Share[]) => void;
  isStripeReady: boolean;
}) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    animal_type: "beef",
    portion: "1/4",
    price: "",
    weight_estimate: "",
    quantity_available: "1",
    next_available_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from("available_shares")
      .insert({
        farm_id: farm.id,
        animal_type: formData.animal_type,
        portion: formData.portion,
        price: parseFloat(formData.price),
        weight_estimate: formData.weight_estimate,
        quantity_available: parseInt(formData.quantity_available),
        next_available_date: formData.next_available_date || null,
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create share listing.",
      });
    } else {
      setShares([...shares, data as Share]);
      setShowForm(false);
      setFormData({
        animal_type: "beef",
        portion: "1/4",
        price: "",
        weight_estimate: "",
        quantity_available: "1",
        next_available_date: "",
      });
      toast({
        title: "Share created!",
        description: "Your share is now listed for buyers.",
      });
    }
  };

  const handleDelete = async (shareId: string) => {
    const { error } = await supabase
      .from("available_shares")
      .delete()
      .eq("id", shareId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete share.",
      });
    } else {
      setShares(shares.filter((s) => s.id !== shareId));
      toast({
        title: "Share deleted",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Available Shares</h2>
        <Button onClick={() => setShowForm(!showForm)} disabled={!isStripeReady}>
          <Plus className="w-4 h-4 mr-2" />
          Add Share
        </Button>
      </div>

      {!isStripeReady && (
        <p className="text-sm text-muted-foreground mb-4">
          Complete Stripe setup above to add share listings.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Animal Type</label>
              <select
                value={formData.animal_type}
                onChange={(e) => setFormData({ ...formData, animal_type: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="beef">Beef</option>
                <option value="pork">Pork</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Portion Size</label>
              <select
                value={formData.portion}
                onChange={(e) => setFormData({ ...formData, portion: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="1/8">1/8</option>
                <option value="1/4">1/4</option>
                <option value="1/2">1/2</option>
                <option value="3/4">3/4</option>
                <option value="whole">Whole</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="650"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight Estimate</label>
              <input
                type="text"
                value={formData.weight_estimate}
                onChange={(e) => setFormData({ ...formData, weight_estimate: e.target.value })}
                placeholder="~100 lbs"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity Available</label>
              <input
                type="number"
                value={formData.quantity_available}
                onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                min="1"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Next Available Date</label>
              <input
                type="date"
                value={formData.next_available_date}
                onChange={(e) => setFormData({ ...formData, next_available_date: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Create Share</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {shares.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">📦</div>
          <p>No shares listed yet. Add your first share to start selling!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {shares.map((share) => (
            <div key={share.id} className="bg-card p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{share.animal_type === "beef" ? "🐄" : "🐷"}</div>
                <div>
                  <div className="font-semibold">
                    {share.portion} {share.animal_type.charAt(0).toUpperCase() + share.animal_type.slice(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${share.price} • {share.weight_estimate} • {share.quantity_available} available
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDelete(share.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Orders Panel Component
function OrdersPanel({ farmId }: { farmId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const { data } = await supabase
        .from("purchases")
        .select("*, available_shares(*)")
        .eq("available_shares.farm_id", farmId)
        .order("created_at", { ascending: false });

      if (data) {
        setOrders(data);
      }
      setLoading(false);
    };

    loadOrders();
  }, [farmId]);

  if (loading) {
    return <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-4xl mb-4">📋</div>
        <p>No orders yet. Orders will appear here when buyers purchase your shares.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-card p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">Order #{order.id.slice(0, 8)}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-sm ${
              order.status === "completed" ? "bg-green-100 text-green-800" :
              order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {order.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Farm Profile Editor Component
function FarmProfileEditor({ farm, setFarm }: { farm: Farm; setFarm: (farm: Farm) => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: farm.name,
    description: farm.description,
    location: farm.location,
    zip_code: farm.zip_code,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data, error } = await supabase
      .from("farms")
      .update(formData)
      .eq("id", farm.id)
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update farm profile.",
      });
    } else {
      setFarm(data as Farm);
      toast({
        title: "Profile updated!",
      });
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Farm Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full p-3 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Nashville, TN"
          className="w-full p-3 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Zip Code</label>
        <input
          type="text"
          value={formData.zip_code}
          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
          maxLength={5}
          className="w-full p-3 border rounded-lg"
        />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        Save Changes
      </Button>
    </form>
  );
}

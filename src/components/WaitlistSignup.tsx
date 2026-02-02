import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MapPin, CheckCircle, Loader2 } from "lucide-react";

const WaitlistSignup = () => {
  const [email, setEmail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [userType, setUserType] = useState<"buyer" | "farmer">("buyer");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !zipCode) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from("waitlist")
        .insert({
          email,
          zip_code: zipCode,
          user_type: userType,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("This email is already on the waitlist!");
        } else {
          throw insertError;
        }
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Waitlist error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="waitlist" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              You're on the list!
            </h2>
            <p className="text-lg text-muted-foreground">
              We'll notify you as soon as {userType === "buyer" ? "farms in your area are available" : "we're ready to onboard farmers"}.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="waitlist" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block text-primary font-medium mb-4">Coming Soon</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
              Join the Waitlist
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're building a network of local farms and buyers in your area. 
              Be the first to know when we launch.
            </p>
          </div>

          {/* Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setUserType("buyer")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200
                ${userType === "buyer"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
                }`}
            >
              🛒 I want to buy meat
            </button>
            <button
              onClick={() => setUserType("farmer")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200
                ${userType === "farmer"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
                }`}
            >
              🌾 I'm a farmer
            </button>
          </div>

          {/* Form */}
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-soft">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Zip Code
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="12345"
                      maxLength={5}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    `Join as a ${userType === "buyer" ? "Buyer" : "Farmer"}`
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                We'll only email you when {userType === "buyer" ? "farms are available in your area" : "we're ready to onboard farmers"}.
              </p>
            </form>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              { label: "Buyers Waiting", value: "Join them" },
              { label: "Farmers Interested", value: "Be first" },
              { label: "States", value: "Growing" },
              { label: "Launch", value: "Coming Soon" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSignup;

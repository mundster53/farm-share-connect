import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-medium mb-4">Simple Pricing</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            Free Until Your First Sale
          </h2>
          <p className="text-lg text-muted-foreground">
            We believe in earning your trust first. No fees until 
            the marketplace is working for you.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Buyer Plan */}
          <div className="relative rounded-2xl p-8 bg-background shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-2xl font-serif font-semibold mb-2 text-foreground">
                For Buyers
              </h3>
              <p className="text-sm mb-4 text-muted-foreground">
                Access the marketplace and find local farms
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-foreground">$12</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-sm text-primary mt-2 font-medium">Free during launch!</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "Browse all local farms",
                "Connect directly with farmers",
                "Reserve your portions",
                "Track your orders",
                "Email notifications",
                "Community support",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button className="w-full" variant="default" size="lg" asChild>
              <a href="#waitlist">Join the Waitlist</a>
            </Button>
          </div>

          {/* Farmer Plan */}
          <div className="relative rounded-2xl p-8 bg-gradient-hero text-primary-foreground shadow-elevated transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-sm font-semibold px-4 py-1 rounded-full">
              For Farmers
            </div>

            <div className="text-center mb-8 mt-4">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-2xl font-serif font-semibold mb-2">
                For Farmers
              </h3>
              <p className="text-sm mb-4 opacity-80">
                Sell directly to local buyers
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">$99</span>
                <span className="opacity-80">/year</span>
              </div>
              <p className="text-sm opacity-90 mt-2 font-medium">Free until your first sale!</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "Create your farm profile",
                "List unlimited shares",
                "Direct buyer connections",
                "Secure payment processing",
                "Customer messaging",
                "Analytics dashboard",
                "Priority support",
                "Only 1% transaction fee",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm opacity-90">{feature}</span>
                </li>
              ))}
            </ul>

            <Button className="w-full" variant="outline-light" size="lg" asChild>
              <a href="#waitlist">Apply as a Farmer</a>
            </Button>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            No credit card required. Pay only when the marketplace is working for you.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

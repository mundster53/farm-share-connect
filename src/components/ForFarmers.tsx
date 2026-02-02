import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const ForFarmers = () => {
  return (
    <section id="farmers" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-soft">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-secondary font-medium mb-4">For Farmers</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                Sell Direct. Earn More.
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Skip the middleman and connect directly with local buyers. 
                Our platform handles the matching, payment processing, and logistics 
                so you can focus on what you do best.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Direct access to motivated buyers",
                  "Automatic share matching",
                  "Secure payment processing",
                  "Farm profile & reviews",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-muted-foreground">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="warm" size="lg" asChild>
                <a href="#waitlist">Join the Waitlist</a>
              </Button>
            </div>
            <div className="text-center">
              <div className="text-9xl mb-6">🌾</div>
              <div className="bg-background rounded-2xl p-8 inline-block shadow-soft">
                <div className="text-5xl font-bold text-foreground">$99</div>
                <div className="text-muted-foreground text-lg">/year for farmers</div>
                <div className="text-sm text-primary mt-3 font-medium">Free until your first sale!</div>
                <div className="text-xs text-muted-foreground mt-2">+ 1% transaction fee</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForFarmers;

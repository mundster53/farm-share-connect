import { Button } from "@/components/ui/button";
import { Leaf, ArrowDown } from "lucide-react";

const Hero = () => {
  const scrollToWaitlist = () => {
    const element = document.getElementById("waitlist");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-cream" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/50 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium animate-fade-in mb-8">
            <Leaf className="w-4 h-4 text-primary" />
            Coming Soon to Your Area
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight animate-fade-in-up mb-6" style={{ animationDelay: "0.1s" }}>
            Know Where Your{" "}
            <span className="text-primary">Meat Comes From</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up mb-10" style={{ animationDelay: "0.2s" }}>
            Buy beef and pork directly from local family farms. 
            Pasture-raised, transparent sourcing, and support for the farmers in your community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" onClick={scrollToWaitlist} className="text-lg px-8 py-6">
              Join the Waitlist
              <ArrowDown className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="text-5xl mb-4">🐄</div>
              <h3 className="font-semibold text-foreground mb-2">Direct from Farms</h3>
              <p className="text-sm text-muted-foreground">Connect directly with local farmers you can trust</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="font-semibold text-foreground mb-2">Pasture-Raised</h3>
              <p className="text-sm text-muted-foreground">Animals raised the way nature intended</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="font-semibold text-foreground mb-2">Support Local</h3>
              <p className="text-sm text-muted-foreground">Keep your dollars in your community</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

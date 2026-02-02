import { MapPin, Users, Truck, Package } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Find Local Farms",
    description: "Enter your location to discover verified farms within your area. See distance and estimated shipping costs upfront.",
    color: "bg-primary",
  },
  {
    icon: Users,
    title: "Join a Share Group",
    description: "Browse available beef or pork shares, or start your own group. Match with others who want the portions you don't need.",
    color: "bg-secondary",
  },
  {
    icon: Package,
    title: "Choose Your Cuts",
    description: "Select your preferred cuts and portions. Quarter, half, or split it further with your group members.",
    color: "bg-primary",
  },
  {
    icon: Truck,
    title: "Fresh Delivery",
    description: "Your share is processed, packaged, and delivered fresh. Track your order from farm to freezer.",
    color: "bg-secondary",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-medium mb-4">Simple Process</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            How Farm Direct Meat Works
          </h2>
          <p className="text-lg text-muted-foreground">
            From farm to freezer in four simple steps. We handle the matching, 
            logistics, and delivery so you can enjoy premium meat.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              
              <div className="relative bg-background rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 group-hover:-translate-y-1">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm font-bold text-primary shadow-soft">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6`}>
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Ready to get started? Join our waitlist to be first in line.
          </p>
          <a 
            href="#waitlist" 
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Join the waitlist
            <span className="text-lg">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

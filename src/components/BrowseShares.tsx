import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Farm = Tables<"farms"> & {
  available_shares: Tables<"available_shares">[];
};

const BrowseShares = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [animalFilter, setAnimalFilter] = useState<"all" | "beef" | "pork">("all");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [zipCode, setZipCode] = useState("");

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("farms")
        .select(`
          *,
          available_shares (*)
        `)
        .eq("is_active", true)
        .eq("stripe_onboarding_complete", true)
        .order("rating", { ascending: false });

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error("Error fetching farms:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFarms = farms.filter((farm) => {
    // Filter by animal type
    if (animalFilter !== "all") {
      const hasAnimalType = farm.available_shares.some(
        (share) => share.animal_type === animalFilter
      );
      if (!hasAnimalType) return false;
    }

    // Filter by portion size
    if (selectedFilter !== "all" && selectedFilter !== "grass-fed" && selectedFilter !== "organic") {
      const portionMap: { [key: string]: string } = {
        "1/8 share": "1/8",
        "1/4 share": "1/4",
        "1/2 share": "1/2",
        "3/4 share": "3/4",
        "whole": "whole",
      };
      const targetPortion = portionMap[selectedFilter];
      if (targetPortion) {
        const hasPortion = farm.available_shares.some(
          (share) => share.portion === targetPortion && share.quantity_available > 0
        );
        if (!hasPortion) return false;
      }
    }

    // Filter by grass-fed
    if (selectedFilter === "grass-fed" && !farm.is_grass_fed) return false;
    
    // Filter by organic
    if (selectedFilter === "organic" && !farm.is_organic) return false;

    return true;
  });

  const getFarmEmoji = (farm: Farm) => {
    if (farm.is_organic) return "🌿";
    if (farm.is_grass_fed) return "🌾";
    return "🏔️";
  };

  const getBadge = (farm: Farm) => {
    if (farm.badge) return farm.badge;
    if (farm.rating && farm.rating >= 4.9) return "Top Rated";
    if (farm.is_organic) return "Organic";
    if (farm.is_grass_fed) return "Grass-Fed";
    return null;
  };

  // Demo data for when database is empty
  const demoFarms = [
    {
      id: "demo-1",
      name: "Green Valley Ranch",
      location: "Austin, TX",
      zip_code: "78701",
      rating: 4.9,
      review_count: 127,
      is_grass_fed: true,
      is_organic: false,
      is_active: true,
      badge: "Top Rated",
      owner_id: "",
      description: null,
      latitude: null,
      longitude: null,
      image_url: null,
      created_at: "",
      updated_at: "",
      available_shares: [
        { id: "1", farm_id: "demo-1", portion: "1/4" as const, price: 650, weight_estimate: "~100 lbs", quantity_available: 2, animal_type: "beef" as const, next_available_date: null, created_at: "", updated_at: "" },
        { id: "2", farm_id: "demo-1", portion: "1/2" as const, price: 1200, weight_estimate: "~200 lbs", quantity_available: 1, animal_type: "beef" as const, next_available_date: null, created_at: "", updated_at: "" },
      ],
    },
    {
      id: "demo-2",
      name: "Sunrise Pastures",
      location: "Round Rock, TX",
      zip_code: "78664",
      rating: 4.8,
      review_count: 89,
      is_grass_fed: false,
      is_organic: true,
      is_active: true,
      badge: "Best Value",
      owner_id: "",
      description: null,
      latitude: null,
      longitude: null,
      image_url: null,
      created_at: "",
      updated_at: "",
      available_shares: [
        { id: "3", farm_id: "demo-2", portion: "1/4" as const, price: 625, weight_estimate: "~100 lbs", quantity_available: 3, animal_type: "beef" as const, next_available_date: null, created_at: "", updated_at: "" },
        { id: "4", farm_id: "demo-2", portion: "1/8" as const, price: 340, weight_estimate: "~50 lbs", quantity_available: 4, animal_type: "pork" as const, next_available_date: null, created_at: "", updated_at: "" },
      ],
    },
    {
      id: "demo-3",
      name: "Heritage Farms",
      location: "Dripping Springs, TX",
      zip_code: "78620",
      rating: 5.0,
      review_count: 64,
      is_grass_fed: true,
      is_organic: true,
      is_active: true,
      badge: "Premium",
      owner_id: "",
      description: null,
      latitude: null,
      longitude: null,
      image_url: null,
      created_at: "",
      updated_at: "",
      available_shares: [
        { id: "5", farm_id: "demo-3", portion: "1/2" as const, price: 1350, weight_estimate: "~200 lbs", quantity_available: 1, animal_type: "beef" as const, next_available_date: null, created_at: "", updated_at: "" },
        { id: "6", farm_id: "demo-3", portion: "whole" as const, price: 550, weight_estimate: "~150 lbs", quantity_available: 2, animal_type: "pork" as const, next_available_date: null, created_at: "", updated_at: "" },
      ],
    },
  ];

  const displayFarms = filteredFarms.length > 0 ? filteredFarms : demoFarms;

  return (
    <section id="browse" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block text-primary font-medium mb-4">Available Now</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground">
              Browse Local Shares
            </h2>
          </div>

          {/* Location Input */}
          <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 shadow-soft">
            <MapPin className="w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder="Enter your zip code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-40"
            />
            <Button size="sm" variant="default">
              Search
            </Button>
          </div>
        </div>

        {/* Animal Type Tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "beef", "pork"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAnimalFilter(type)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${animalFilter === type 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card text-muted-foreground hover:bg-muted"
                }`}
            >
              {type === "all" ? "All Meat" : type === "beef" ? "🐄 Beef" : "🐷 Pork"}
            </button>
          ))}
        </div>

        {/* Portion Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {["all", "1/8 share", "1/4 share", "1/2 share", "3/4 share", "whole", "grass-fed", "organic"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${selectedFilter === filter 
                  ? "bg-secondary text-secondary-foreground" 
                  : "bg-card text-muted-foreground hover:bg-muted"
                }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Farm Cards */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFarms.map((farm, index) => (
              <div 
                key={farm.id}
                className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header */}
                <div className="relative p-6 bg-gradient-cream">
                  {getBadge(farm) && (
                    <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {getBadge(farm)}
                    </div>
                  )}
                  <div className="text-6xl mb-4">{getFarmEmoji(farm)}</div>
                  <h3 className="text-xl font-serif font-semibold text-foreground">
                    {farm.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {farm.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    <span className="font-medium text-foreground">{farm.rating}</span>
                    <span className="text-muted-foreground">({farm.review_count} reviews)</span>
                  </div>
                </div>

                {/* Available Shares */}
                <div className="p-6 border-t border-border">
                  <div className="text-sm font-medium text-muted-foreground mb-3">
                    Available Shares:
                  </div>
                  <div className="space-y-2">
                    {farm.available_shares
                      .filter((share) => share.quantity_available > 0)
                      .slice(0, 3)
                      .map((share) => (
                        <div key={share.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{share.animal_type === "beef" ? "🐄" : "🐷"}</span>
                            <div>
                              <span className="font-semibold text-foreground">{share.portion}</span>
                              <span className="text-muted-foreground text-sm ml-2">{share.weight_estimate}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">${share.price}</div>
                            <div className="text-xs text-muted-foreground">{share.quantity_available} left</div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Group Matching */}
                  <div className="mt-4 p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        Buyers waiting to match
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Available now
                      </span>
                    </div>
                  </div>

                  <Button className="w-full mt-4" variant="default" asChild>
                    <Link to={`/farm/${farm.id}`}>View Details & Reserve</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayFarms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No farms found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search in a different area.
            </p>
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Farms
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BrowseShares;

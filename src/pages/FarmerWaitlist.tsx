import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FarmerWaitlistPanel } from "@/components/farmer/FarmerWaitlistPanel";

export default function FarmerWaitlist() {
  const { user, loading: authLoading } = useAuth();

  const canQuery = useMemo(() => !!user && !authLoading, [user, authLoading]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>
              🐄
            </span>
            <h1 className="text-lg font-serif font-semibold text-foreground">
              Farm Waitlist
            </h1>
          </div>

          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {!canQuery ? (
          <section className="max-w-xl">
            <h2 className="text-2xl font-serif font-semibold text-foreground">
              Sign in required
            </h2>
            <p className="mt-2 text-muted-foreground">
              You need to be signed in to view a farm’s waitlist.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/auth">Go to sign in</Link>
              </Button>
            </div>
          </section>
        ) : (
          <section className="max-w-3xl">
            <FarmerWaitlistPanel />
          </section>
        )}
      </main>
    </div>
  );
}

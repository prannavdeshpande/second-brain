import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for trying out Second Brain",
      features: [
        "Up to 50 contents",
        "Basic tagging",
        "Web clipper",
        "Community support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Premium",
      price: { monthly: 29, yearly: 290 },
      description: "Best for individuals and small teams",
      features: [
        "Unlimited contents",
        "Advanced tagging & search",
        "Priority support",
        "Team collaboration (up to 5)",
        "Custom integrations",
        "Export capabilities",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Pro",
      price: { monthly: 99, yearly: 990 },
      description: "For power users and large teams",
      features: [
        "Everything in Premium",
        "Unlimited team members",
        "Advanced analytics",
        "Custom branding",
        "API access",
        "Dedicated support",
        "SSO & advanced security",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const handleSubscribe = (planName: string) => {
    if (planName === "Pro") {
      toast.info("Contact our sales team for enterprise pricing");
    } else {
      toast.success(`Subscribed to ${planName} plan!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-background/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Second Brain
              </span>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-4">Upgrade Your Plan</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose the perfect plan for your needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 rounded-full bg-gradient-card border border-border">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-full transition-all ${
                billingPeriod === "monthly"
                  ? "bg-gradient-primary text-primary-foreground shadow-[var(--shadow-medium)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 ${
                billingPeriod === "yearly"
                  ? "bg-gradient-primary text-primary-foreground shadow-[var(--shadow-medium)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-1">Save 20%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative shadow-[var(--shadow-large)] hover:scale-105 transition-all duration-300 animate-fade-in-up ${
                plan.popular ? "border-primary border-2" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-primary px-4 py-1">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold">
                    ${plan.price[billingPeriod]}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingPeriod === "monthly" ? "month" : "year"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  onClick={() => handleSubscribe(plan.name)}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-muted-foreground mt-12 animate-fade-in">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </main>
    </div>
  );
};

export default Pricing;

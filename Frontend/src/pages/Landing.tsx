import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Second Brain
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-card border border-border mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Your Content, Organized</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Manage All Your
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Content in One Place
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Aggregate content from YouTube, Substack, Twitter, and more. 
            Keep everything organized with smart tags and powerful search.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="hero" size="lg" className="text-base">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="glass" size="lg" className="text-base">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Import and organize content in seconds with our intelligent automation"
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "Your content is encrypted and protected with enterprise-grade security"
            },
            {
              icon: Users,
              title: "Team Collaboration",
              description: "Share collections and collaborate with your team seamlessly"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-gradient-card backdrop-blur-sm border border-border hover:shadow-[var(--shadow-medium)] transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-card border border-border">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users organizing their content better
          </p>
          <Link to="/signup">
            <Button variant="hero" size="lg" className="text-base">
              Create Your Account <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;

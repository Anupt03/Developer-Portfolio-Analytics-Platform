import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Code2, FileText, Target, Users, Search, ChevronRight, CheckCircle2, GitBranch } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
              Introducing DevScope AI 2.0
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              Know Your <span className="text-gradient">Hiring Readiness.</span>
              <br />
              Land Your Dream Job.
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              The AI-powered portfolio analytics platform that analyzes your GitHub, LeetCode, and Resume to give you actionable career insights and connect you with top tech recruiters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Start for free <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to="#demo"
                className="w-full sm:w-auto px-8 py-4 rounded-full glass font-semibold text-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                View Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-white/5 bg-surface/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to stand out</h2>
            <p className="text-gray-400">Comprehensive analytics across your entire developer footprint, synthesized into one powerful profile.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<GitBranch className="w-6 h-6 text-indigo-400" />}
              title="GitHub Analytics"
              description="Deep dive into your repos, languages, commit consistency, and open-source impact."
            />
            <FeatureCard
              icon={<Code2 className="w-6 h-6 text-emerald-400" />}
              title="LeetCode Integration"
              description="Track your DSA readiness, problem-solving streaks, and contest performance."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6 text-amber-400" />}
              title="Resume Analyzer"
              description="Get instant ATS scoring, quality metrics, and AI suggestions to improve your resume."
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6 text-purple-400" />}
              title="AI Career Coach"
              description="Personalized, actionable insights identifying skill gaps and next steps."
            />
            <FeatureCard
              icon={<Target className="w-6 h-6 text-cyan-400" />}
              title="Hiring Readiness Score"
              description="A composite 0-100 score showing exactly where you stand against industry benchmarks."
            />
            <FeatureCard
              icon={<Search className="w-6 h-6 text-pink-400" />}
              title="Recruiter Discovery"
              description="Get discovered by top recruiters searching for your specific skill set and verified scores."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Developer Free"
              price="0"
              features={['GitHub basic analytics', 'LeetCode basic stats', '1 Resume analysis/mo', 'Standard AI insights', 'Public profile']}
            />
            <PricingCard
              name="Developer Pro"
              price="12"
              recommended
              features={['Everything in Free', 'Unlimited resume analysis', 'Advanced AI Career Coach', 'Priority recruiter visibility', 'Custom profile domain']}
            />
            <PricingCard
              name="Recruiter Teams"
              price="99"
              features={['Advanced candidate search', 'Side-by-side comparisons', 'Unlimited profile views', 'Save candidate lists', 'Team collaboration']}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-surface">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">DevScope.ai</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 DevScope AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="glass-card p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const PricingCard = ({ name, price, features, recommended = false }: { name: string, price: string, features: string[], recommended?: boolean }) => (
  <div className={`glass-card p-8 rounded-2xl border ${recommended ? 'border-primary shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'border-white/5'} relative flex flex-col`}>
    {recommended && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
        Most Popular
      </div>
    )}
    <h3 className="text-xl font-semibold mb-2">{name}</h3>
    <div className="flex items-baseline gap-1 mb-6">
      <span className="text-4xl font-bold text-white">${price}</span>
      <span className="text-gray-400">/mo</span>
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
          <span className="text-gray-300 text-sm">{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-3 rounded-xl font-medium transition-colors ${recommended ? 'bg-primary hover:bg-primary-hover text-white' : 'glass hover:bg-white/10 text-white'}`}>
      Get Started
    </button>
  </div>
);

export default Landing;

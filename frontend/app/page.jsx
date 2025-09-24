'use client';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';


const FEATURES = [
  {
    icon: '🎯',
    title: 'Algorithm Visualizer',
    description: 'Interactive visualizations of sorting, searching, and tree algorithms with step-by-step execution.',
    href: '/visualizer',
    gradient: 'from-purple-500 to-pink-500',
    techIcon: '⚡'
  },
  {
    icon: '💻',
    title: 'Online IDE',
    description: 'Write, compile, and run code in multiple programming languages with real-time feedback.',
    href: '/ide',
    gradient: 'from-blue-500 to-cyan-500',
    techIcon: '⚙️'
  },
  {
    icon: '🤖',
    title: 'AI Study Planner',
    description: 'Get personalized study plans and coding guidance from our intelligent assistant.',
    href: '/ai',
    gradient: 'from-emerald-500 to-teal-500',
    techIcon: '🧠'
  },
  {
    icon: '📊',
    title: 'Profile Tracker',
    description: 'Track your coding progress across multiple platforms with detailed analytics and insights.',
    href: '/profile-tracker',
    gradient: 'from-orange-500 to-red-500',
    techIcon: '📈'
  },
  {
    icon: '💬',
    title: 'Discussion Forum',
    description: 'Connect with fellow developers, share knowledge, and get help with coding challenges.',
    href: '/forum',
    gradient: 'from-indigo-500 to-purple-500',
    techIcon: '🌐'
  }
];

const TESTIMONIALS = [
  {
    name: 'Alex Chen',
    role: 'Software Engineer at Google',
    content: 'CodeQuest helped me visualize complex algorithms during my interview prep. The interactive approach made learning so much easier!',
    avatar: '👨‍💻'
  },
  {
    name: 'Sarah Johnson',
    role: 'CS Student at MIT',
    content: 'The AI study planner is incredible! It created a perfect roadmap for my data structures course. Highly recommend!',
    avatar: '👩‍🎓'
  },
  {
    name: 'Mike Rodriguez',
    role: 'Full Stack Developer',
    content: 'Love the profile tracker feature. Being able to see my progress across different coding platforms keeps me motivated.',
    avatar: '👨‍🚀'
  }
];

const STATS = [
  { number: '10K+', label: 'Active Users' },
  { number: '50+', label: 'Algorithms' },
  { number: '15+', label: 'Languages' },
  { number: '99%', label: 'Satisfaction' }
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden transition-colors duration-500 hero-bg-pattern">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 dark:from-teal-400/10 dark:to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-300/10 to-teal-300/10 dark:from-emerald-300/5 dark:to-teal-300/5 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Floating geometric shapes */}
        <div className="floating-shapes"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 border-2 border-emerald-300/30 dark:border-emerald-400/20 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 dark:from-teal-400/10 dark:to-cyan-400/10 rounded-full animate-float"></div>
        <div className="absolute top-3/4 right-1/3 w-8 h-8 bg-emerald-400/30 dark:bg-emerald-400/20 transform rotate-45 animate-pulse"></div>

        {/* Code-like background pattern */}
        <div className="absolute top-20 left-20 opacity-10 dark:opacity-5 font-mono text-emerald-600 dark:text-emerald-400 text-sm animate-fade-in">
          <div>function solve() {'{'}</div>
          <div className="ml-4">return optimize();</div>
          <div>{'}'}</div>
        </div>
        <div className="absolute bottom-32 right-20 opacity-10 dark:opacity-5 font-mono text-teal-600 dark:text-teal-400 text-sm animate-fade-in delay-1000">
          <div>while (learning) {'{'}</div>
          <div className="ml-4">improve();</div>
          <div>{'}'}</div>
        </div>
      </div>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Circuit board background */}
        <div className="absolute inset-0 z-0">
          {/* CSS-based circuit pattern as fallback */}
          <div className="absolute inset-0 circuit-pattern opacity-30 dark:opacity-20"></div>

          {/* If you have the circuit-bg.jpg image, uncomment this: */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-10"
            style={{
              backgroundImage: "url('/circuit-bg.jpg')",
              filter: 'blur(2px) brightness(0.7)'
            }}
          ></div>

          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-teal-50/80 to-cyan-50/80 dark:from-slate-900/90 dark:via-slate-800/90 dark:to-slate-900/90"></div>
        </div>

        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-emerald-200 dark:border-emerald-700/50">
              <span className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></span>
              Welcome to the future of coding education
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient-shift animate-bounce-in">
                Master Algorithms
              </div>
              <br />
              <span className="text-4xl lg:text-6xl bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 dark:from-teal-400 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent animate-gradient-shift animate-bounce-in delay-300">
                Visually
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto animate-fade-in delay-500">
              Interactive algorithm visualizations, AI-powered study plans, and a comprehensive coding environment.
              Everything you need to excel in programming interviews and beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in delay-700">
              <Link href="/visualizer" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-emerald-500/25 animate-pulse-glow">
                Start Visualizing
              </Link>
              {!user && (
                <Link href="/auth/signup" className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl font-semibold text-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 hover:scale-105">
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From interactive visualizations to AI-powered guidance, we've built the ultimate platform for mastering algorithms and data structures.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <Link key={index} href={feature.href} className="group">
              <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:-translate-y-2 animate-fade-in relative overflow-hidden`}
                style={{ animationDelay: `${index * 100}ms` }}>
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                <div className="relative z-10">
                  <div className="text-4xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 text-emerald-600 dark:text-emerald-400 font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-300 flex items-center gap-2">
                    Explore
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Loved by Developers Worldwide
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join thousands of developers who've accelerated their learning with CodeQuest
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">{testimonial.avatar}</div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              <div>
                <div className="font-bold text-gray-800 dark:text-gray-100">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 lg:p-20 text-center text-white shadow-2xl shadow-emerald-500/25">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Level Up Your Coding Skills?
          </h2>
          <p className="text-xl lg:text-2xl mb-8 opacity-90">
            Join CodeQuest today and transform the way you learn algorithms
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link href="/auth/signup" className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                  Get Started Free
                </Link>
                <Link href="/visualizer" className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
                  Try Demo
                </Link>
              </>
            ) : (
              <Link href="/visualizer" className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Continue Learning
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
              CodeQuest
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Empowering developers with interactive learning tools and AI-powered guidance.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform cursor-pointer">
                🐙
              </div>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform cursor-pointer">
                🐦
              </div>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform cursor-pointer">
                💼
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Features</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><Link href="/visualizer" className="hover:text-emerald-600 dark:hover:text-emerald-400">Algorithm Visualizer</Link></li>
              <li><Link href="/ide" className="hover:text-emerald-600 dark:hover:text-emerald-400">Online IDE</Link></li>
              <li><Link href="/ai" className="hover:text-emerald-600 dark:hover:text-emerald-400">AI Study Planner</Link></li>
              <li><Link href="/profile-tracker" className="hover:text-emerald-600 dark:hover:text-emerald-400">Profile Tracker</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Community</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><Link href="/forum" className="hover:text-emerald-600 dark:hover:text-emerald-400">Discussion Forum</Link></li>
              <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Help Center</a></li>
              <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Documentation</a></li>
              <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 text-center text-gray-600 dark:text-gray-300">
          <p>&copy; 2024 CodeQuest. All rights reserved. Built with ❤️ for developers.</p>
        </div>
      </footer>
    </div>
  );
}

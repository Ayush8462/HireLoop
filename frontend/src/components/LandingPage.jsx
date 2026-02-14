import React from "react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="bg-[#0b0f19] text-gray-200 min-h-screen">
      {/* Header */}
      <header className="backdrop-blur bg-white/5 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wide bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            PlacementReady
          </h1>
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#features" className="hover:text-blue-400 transition">Features</a>
            <a href="#how" className="hover:text-blue-400 transition">How it Works</a>
            <button className="px-5 py-2 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg">
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        {/* Glow */}
        <div className="absolute -top-10 left-0 w-72 h-72 bg-blue-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Crack Placements
            <span className="block bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              with Data + Referrals
            </span>
          </h2>

          <p className="text-lg text-gray-400 mb-8">
            Track your placement readiness score, identify skill gaps, and request referrals from seniors & alumni — all inside one intelligent platform.
          </p>

          <div className="flex gap-4">
            <button className="px-7 py-3 rounded-2xl bg-linear-to-r from-blue-500 to-purple-600 font-semibold shadow-xl hover:scale-105 transition">
              Join as Student
            </button>
            <button className="px-7 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 hover:bg-white/20 transition">
              Join as Alumni
            </button>
          </div>
        </motion.div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              alt="students"
              className="rounded-2xl"
            />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Built for Modern Placement Preparation
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Placement Readiness Score",
                desc: "AI-powered scoring across coding, aptitude, projects & interview skills.",
              },
              {
                title: "Referral Engine",
                desc: "Directly request referrals from verified seniors & alumni in product companies.",
              },
              {
                title: "Skill Gap Analyzer",
                desc: "Know what to learn next with personalized insights.",
              },
              {
                title: "Mentor Network",
                desc: "Connect with people who already cracked the companies you target.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl hover:scale-[1.03] transition"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-lg mb-3 text-white">{feature.title}</h4>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h3>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              "Create Profile",
              "Get Readiness Score",
              "Improve Weak Areas",
              "Request Referrals",
            ].map((step, index) => (
              <motion.div
                key={index}
                className="bg-linear-to-br from-white/5 to-white/0 border border-white/10 p-6 rounded-3xl text-center backdrop-blur-xl"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl font-bold mb-3 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {index + 1}
                </div>
                <p className="font-medium">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 text-center relative">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Start Your Placement Journey Today
          </h3>
          <p className="mb-8 text-gray-400 max-w-xl mx-auto">
            Join students preparing smarter with data-driven readiness insights and alumni-powered referrals.
          </p>
          <button className="px-10 py-4 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold shadow-2xl hover:scale-105 transition">
            Create Free Account
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center text-gray-500 text-sm">
        © 2026 PlacementReady — Smart placement powered by community & AI.
      </footer>
    </div>
  );
}

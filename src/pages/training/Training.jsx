// src/pages/training/Training.jsx
// 3PAC Training Library — landing page at /training

import { Link } from "react-router-dom";

const modules = [
  {
    id: "bull-put-spread",
    title: "Bull Put Spread Simulator",
    description:
      "100 to 300-trade statistical simulation showing how the bull put spread performs over time. Includes Monte Carlo overlay, drawdown tracker, consecutive loss counter, EV display, and 1,000-run distribution analysis.",
    tag: "Interactive Simulator",
    tagColor: "text-amber-400 border-amber-400",
    href: "/training/bull-put-spread",
    ready: true,
  },
  {
    id: "iron-condor",
    title: "Iron Condor Simulator",
    description: "Coming soon.",
    tag: "Coming Soon",
    tagColor: "text-gray-600 border-gray-600",
    href: "#",
    ready: false,
  },
  {
    id: "covered-call",
    title: "Covered Call Simulator",
    description: "Coming soon.",
    tag: "Coming Soon",
    tagColor: "text-gray-600 border-gray-600",
    href: "#",
    ready: false,
  },
  {
    id: "pmcc",
    title: "Poor Man's Covered Call",
    description: "Coming soon.",
    tag: "Coming Soon",
    tagColor: "text-gray-600 border-gray-600",
    href: "#",
    ready: false,
  },
];

export default function Training() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-amber-400 transition-colors mb-6 tracking-wide">
            ← Home
          </Link>
          <p className="text-xs tracking-widest text-amber-400 uppercase mb-2">
            3P Alpha Capital
          </p>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
            Training Library
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Systematic options trading — strategy, execution, and the maths
            behind every rule.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {modules.map((m) => (
            <div
              key={m.id}
              className={`bg-gray-900 border rounded-2xl p-6 transition-all ${
                m.ready
                  ? "border-gray-700 hover:border-gray-500"
                  : "border-gray-800 opacity-50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-bold text-white">{m.title}</h2>
                <span
                  className={`text-xs font-semibold border rounded-full px-3 py-1 ml-4 whitespace-nowrap ${m.tagColor}`}
                >
                  {m.tag}
                </span>
              </div>
              <p className="text-gray-400 text-base leading-relaxed mb-4">
                {m.description}
              </p>
              {m.ready && (
                <Link
                  to={m.href}
                  className="inline-block bg-amber-400 text-black font-bold px-5 py-2 rounded-lg text-sm hover:bg-amber-300 transition-colors"
                >
                  Launch →
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-gray-700 leading-relaxed">
          3P Alpha Capital Limited · BVI Company No. 2205767 · For educational
          use only. Not investment advice.
        </p>
      </div>
    </div>
  );
}

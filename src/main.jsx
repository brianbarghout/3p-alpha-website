import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const NAV_LINKS = ['About', 'Heritage', 'Structure', 'Approach', 'Contact']

const COMPANIES = [
  {
    name: 'Sheibarg',
    description: 'Strategic holding and operational oversight across diversified business interests.',
  },
  {
    name: 'Barplas',
    description: 'Industrial plastics manufacturing with a focus on precision-engineered components.',
  },
  {
    name: 'Imago Design',
    description: 'Creative and architectural design consultancy serving premium residential and commercial clients.',
  },
  {
    name: 'Bradford Industrial Properties',
    description: 'Commercial and industrial real estate acquisition, development, and long-term asset management.',
  },
  {
    name: 'Littlecote Soap Manufacturing',
    description: 'Artisan consumer goods production with an emphasis on quality formulation and brand integrity.',
  },
]

const PILLARS = [
  {
    title: 'Purpose',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description:
      'Every capital allocation decision is grounded in a clear, long-term mandate: to preserve and grow wealth responsibly across generations. We are not driven by short-term performance metrics but by enduring principles of stewardship.',
  },
  {
    title: 'Precision',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    description:
      'Our systematic, quantitative approach applies rigorous methodology to every trade and investment decision. Data-driven analysis and disciplined risk management replace intuition with repeatable, auditable processes.',
  },
  {
    title: 'Performance',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    description:
      'Sustained, compounding growth — not volatility — defines our performance standard. By combining capital preservation with strategic deployment, we aim to deliver consistent returns that withstand cycles and compound meaningfully over time.',
  },
]

function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 border border-amber-400 flex items-center justify-center">
            <span className="text-amber-400 font-serif text-sm font-bold tracking-widest">3P</span>
          </div>
          <span className="hidden sm:block text-sm tracking-[0.2em] text-slate-300 uppercase font-light">
            Alpha Capital
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="text-xs tracking-[0.15em] uppercase text-slate-400 hover:text-amber-400 transition-colors duration-200"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-slate-300 hover:text-amber-400 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-950/98 border-t border-slate-800 px-6 py-4">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase()}`}
                  className="text-sm tracking-[0.15em] uppercase text-slate-400 hover:text-amber-400 transition-colors duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      {/* Diagonal line geometric pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 28px,
            rgba(255,255,255,0.10) 28px,
            rgba(255,255,255,0.10) 29px
          )`,
        }}
      />

      {/* Subtle radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(15,23,42,0.6) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-amber-400 text-xs tracking-[0.4em] uppercase mb-8 font-light">
          3P Alpha Capital
        </p>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight mb-8">
          Purpose, Precision,
          <br />
          Performance.
        </h1>

        <div className="w-16 h-px bg-amber-400 mx-auto mb-8" />

        <p className="text-slate-300 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
          Capital preservation. Systematic, methodical, quantitative trading.
          Sustained portfolio growth for the benefit of the next generation.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#about"
            className="px-8 py-3 border border-amber-400 text-amber-400 text-xs tracking-[0.2em] uppercase hover:bg-amber-400 hover:text-slate-950 transition-all duration-200"
          >
            Learn More
          </a>
          <a
            href="#contact"
            className="px-8 py-3 text-slate-400 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors duration-200"
          >
            Get in Touch
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}

function SectionHeader({ label, title, subtitle }) {
  return (
    <div className="text-center mb-16">
      {label && (
        <p className="text-amber-400 text-xs tracking-[0.4em] uppercase mb-4 font-light">{label}</p>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl font-light text-white mb-4">{title}</h2>
      <div className="w-12 h-px bg-amber-400 mx-auto mb-4" />
      {subtitle && (
        <p className="text-slate-400 text-base max-w-2xl mx-auto font-light leading-relaxed">{subtitle}</p>
      )}
    </div>
  )
}

function About() {
  return (
    <section id="about" className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          label="About the Principal"
          title="Grounded in Experience"
          subtitle="A track record built across multiple industries and decades of operational leadership."
        />

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image placeholder */}
          <div className="relative">
            <div className="aspect-[3/4] bg-slate-800 border border-slate-700 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-slate-600 text-xs tracking-widest uppercase">Principal Photo</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-amber-400/20 -z-10" />
          </div>

          {/* Bio */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-white font-light">The Principal</h3>
            <div className="w-8 h-px bg-amber-400" />
            <p className="text-slate-400 leading-relaxed font-light">
              With a career spanning multiple industries and decades of operational leadership,
              the principal of 3P Alpha Capital brings a rare combination of entrepreneurial
              vision and disciplined capital management to the investment arena.
            </p>
            <p className="text-slate-400 leading-relaxed font-light">
              Having founded, operated, and scaled businesses across manufacturing, design,
              industrial property, and consumer goods, the principal's approach to capital
              stewardship is forged from direct operating experience — not abstraction.
            </p>
            <p className="text-slate-400 leading-relaxed font-light">
              This depth of real-world business understanding informs a systematic, quantitative
              trading philosophy that prizes risk management, consistency, and long-term
              compounding over short-term gain.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800">
              {[['20+', 'Years Operating'], ['5', 'Companies Built'], ['Multi-Gen', 'Focus']].map(([val, lbl]) => (
                <div key={lbl} className="text-center">
                  <p className="text-amber-400 font-serif text-xl mb-1">{val}</p>
                  <p className="text-slate-500 text-xs tracking-wider uppercase">{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Heritage() {
  return (
    <section id="heritage" className="py-24 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          label="Operating Experience"
          title="Heritage of Enterprise"
          subtitle="A portfolio of operating companies built over decades, each demonstrating disciplined leadership and a commitment to long-term value creation."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPANIES.map((company, i) => (
            <div
              key={company.name}
              className="group relative bg-slate-800/50 border border-slate-700 p-8 hover:border-amber-400/50 transition-all duration-300"
            >
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-amber-400/40 group-hover:border-amber-400 transition-colors duration-300" />

              <p className="text-amber-400/50 font-serif text-3xl mb-4 font-light">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="font-serif text-xl text-white mb-3 font-light">{company.name}</h3>
              <div className="w-6 h-px bg-amber-400/40 mb-4 group-hover:bg-amber-400 transition-colors duration-300" />
              <p className="text-slate-400 text-sm leading-relaxed font-light">{company.description}</p>
            </div>
          ))}

          {/* Placeholder sixth card for visual balance on 3-col grid */}
          <div className="hidden lg:flex bg-slate-800/20 border border-slate-800 p-8 items-center justify-center">
            <p className="text-slate-700 text-xs tracking-[0.3em] uppercase text-center">
              Ongoing<br />Ventures
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Structure() {
  return (
    <section id="structure" className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          label="Fund Structure"
          title="How We Operate"
          subtitle="3P Alpha Capital is structured to ensure disciplined capital deployment, transparent governance, and alignment of interests between principal and partners."
        />

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            {[
              {
                title: 'Capital Preservation First',
                body: 'Every allocation begins with downside assessment. We define acceptable loss before we define target return. Capital preservation is not a constraint on our strategy — it is the strategy.',
              },
              {
                title: 'Quantitative Framework',
                body: 'Our trading systems are rule-based and data-driven. Entry, exit, position sizing, and risk exposure are all governed by quantitative models, removing emotion from the decision-making process.',
              },
              {
                title: 'Generational Mandate',
                body: 'We operate with a time horizon that extends beyond the typical fund cycle. Our decisions are made with the next generation in mind, prioritising compounding consistency over near-term performance optics.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-6">
                <div className="flex-shrink-0 w-px bg-amber-400/40 self-stretch" />
                <div>
                  <h3 className="text-white font-serif text-lg mb-2 font-light">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-light">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Structure diagram placeholder */}
          <div className="bg-slate-800/30 border border-slate-700 p-10">
            <p className="text-slate-500 text-xs tracking-[0.3em] uppercase mb-8 text-center">Fund Architecture</p>
            <div className="space-y-4">
              {['General Partner', 'Investment Committee', 'Quantitative Systems', 'Portfolio Execution', 'Risk Oversight'].map((layer, i) => (
                <div key={layer} className="flex items-center gap-4">
                  <div
                    className="h-10 bg-slate-700 border-l-2 border-amber-400/60 flex items-center px-4 flex-1"
                    style={{ marginLeft: `${i * 16}px` }}
                  >
                    <span className="text-slate-300 text-xs tracking-wider">{layer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Approach() {
  return (
    <section id="approach" className="py-24 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          label="Capital Stewardship Philosophy"
          title="The Three Pillars"
        />

        <div className="grid md:grid-cols-3 gap-8">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="group bg-slate-800/40 border border-slate-700 p-10 text-center hover:border-amber-400/50 transition-all duration-300"
            >
              <div className="text-amber-400 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                {pillar.icon}
              </div>
              <h3 className="font-serif text-2xl text-white mb-4 font-light">{pillar.title}</h3>
              <div className="w-8 h-px bg-amber-400/40 mx-auto mb-6 group-hover:bg-amber-400 transition-colors duration-300" />
              <p className="text-slate-400 text-sm leading-relaxed font-light">{pillar.description}</p>
            </div>
          ))}
        </div>

        {/* Extended philosophy */}
        <div className="mt-16 border border-slate-700 p-10 md:p-16 relative">
          <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-amber-400/40" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-amber-400/40" />
          <p className="text-slate-300 text-lg md:text-xl font-serif font-light leading-relaxed text-center max-w-3xl mx-auto">
            "We do not trade markets. We apply systematic methodology to extract consistent,
            risk-adjusted returns — compounding quietly over time, in service of a legacy
            that endures beyond any single market cycle."
          </p>
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase text-center mt-6">
            — 3P Alpha Capital
          </p>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="py-24 bg-slate-950">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeader
          label="Contact"
          title="Open a Conversation"
          subtitle="3P Alpha Capital engages with qualified partners and investors on a selective basis. We welcome introductions from those who share our commitment to long-term, disciplined capital stewardship."
        />

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Enquiries</p>
              <p className="text-slate-300 font-light">contact@3palphacapital.com</p>
            </div>
            <div>
              <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Location</p>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                United Kingdom<br />
                By appointment only
              </p>
            </div>
            <div>
              <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-4">Disclaimer</p>
              <p className="text-slate-600 text-xs leading-relaxed font-light">
                3P Alpha Capital is a private investment vehicle. Nothing on this website
                constitutes investment advice or a solicitation to invest. Past performance
                is not indicative of future results.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-slate-500 text-xs tracking-widest uppercase block mb-2">Name</label>
              <input
                type="text"
                className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-amber-400/60 transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs tracking-widest uppercase block mb-2">Email</label>
              <input
                type="email"
                className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-amber-400/60 transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs tracking-widest uppercase block mb-2">Message</label>
              <textarea
                rows={5}
                className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-amber-400/60 transition-colors resize-none"
                placeholder="Please introduce yourself and your interest..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 border border-amber-400 text-amber-400 text-xs tracking-[0.2em] uppercase hover:bg-amber-400 hover:text-slate-950 transition-all duration-200"
            >
              Send Enquiry
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border border-amber-400/60 flex items-center justify-center">
            <span className="text-amber-400/60 font-serif text-xs font-bold">3P</span>
          </div>
          <span className="text-slate-600 text-xs tracking-widest uppercase">Alpha Capital</span>
        </div>
        <p className="text-slate-700 text-xs tracking-wider text-center">
          &copy; {new Date().getFullYear()} 3P Alpha Capital. All rights reserved.
        </p>
        <p className="text-slate-700 text-xs">Private &amp; Confidential</p>
      </div>
    </footer>
  )
}

function App() {
  return (
    <>
      <NavBar />
      <Hero />
      <About />
      <Heritage />
      <Structure />
      <Approach />
      <Contact />
      <Footer />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

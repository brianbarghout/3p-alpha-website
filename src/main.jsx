import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const NAV_LINKS = ['About', 'Heritage', 'Approach', 'Contact']

const COMPANIES = [
  {
    name: 'Sheibarg',
    description: '1992–1994. Grew to become the largest independent manufacturer of metal lever lid containers in Britain.',
    image: '/images/sheibarg.jpg',
  },
  {
    name: 'Barplas',
    description: '1994–2006. Co-founded and grew to become the second largest manufacturer of lever lid plastic containers in Britain. Sold in 2006.',
    image: '/images/barplas.jpg',
  },
  {
    name: 'Imago Design',
    description: '1997–1998. Creative product design and development — from concept to mass production.',
    image: '/images/imago.jpg',
  },
  {
    name: 'Bradford Industrial Properties',
    description: '1994–2025. Commercial and industrial property development and management.',
    image: '/images/bradford.jpg',
  },
  {
    name: 'Littlecote Soap',
    description: '2014–2016. Artisan toiletries and natural soaps — handmade in North Yorkshire.',
    image: '/images/littlecote.jpg',
  },
  {
    name: 'Wicked Works',
    description: '2002–2004. Hand-cast bronze Harley Davidson shifter linkages — designed, sand-cast, and chrome-finished. Each piece individually made.',
    image: '/images/wickedworks.jpg',
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
      'Our mission is to preserve and grow wealth responsibly, passing it forward across generations, guided by enduring principles of stewardship.',
  },
  {
    title: 'Precision',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    description:
      'Data-driven analysis and disciplined risk management replace intuition with repeatable, auditable processes.',
  },
  {
    title: 'Performance',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    description:
      'Capital preservation first, strategic deployment second — consistent returns that compound meaningfully over time.',
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
          Our purpose is to consolidate, preserve, and grow family assets across generations.
          Our mission is to deploy this capital for education, opportunity, and financial security
          for our family, and for charitable activities that reflect our values.
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
          {/* Principal photo */}
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden border border-slate-700">
              <img
                src="/images/principal.jpg"
                alt="The Principal"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-amber-400/20 -z-10" />
          </div>

          {/* Bio */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-white font-light">Brian Barghout</h3>
            <p className="text-amber-400 text-xs tracking-[0.2em] uppercase mt-1">BSc Chemical Engineering · FRSA</p>
            <div className="w-8 h-px bg-amber-400 mt-4" />
            <p className="text-slate-400 leading-relaxed font-light">
              A chemical engineer by training, Brian has spent over four decades founding,
              operating, and scaling businesses across manufacturing, product design,
              industrial property, and consumer goods.
            </p>
            <p className="text-slate-400 leading-relaxed font-light">
              That depth of hands-on operating experience — building companies from the ground
              up, managing production at scale, and navigating real-world commercial risk —
              now informs a systematic, quantitative approach to capital stewardship.
            </p>
            <p className="text-slate-400 leading-relaxed font-light">
              3P Alpha Capital is the expression of that philosophy: disciplined risk management,
              methodical execution, and long-term compounding in service of the next generation.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800">
              {[['40+', 'Years Operating'], ['5', 'Companies Built'], ['Multi-Gen', 'Focus']].map(([val, lbl]) => (
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
          title="Real Businesses, Real Experience"
          subtitle="Decades of building businesses from the ground up — across manufacturing, design, property, and consumer goods."
        />

        <div className="flex flex-wrap justify-center gap-6">
          {COMPANIES.map((company, i) => (
            <div
              key={company.name}
              className="group relative overflow-hidden h-72 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] hover:scale-[1.02] transition-transform duration-300"
            >
              {/* Background image */}
              {company.image ? (
                <img
                  src={company.image}
                  alt={company.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                  <p className="text-slate-600 text-xs tracking-[0.3em] uppercase">Image Coming Soon</p>
                </div>
              )}

              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-amber-400/50 font-serif text-2xl mb-2 font-light">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-serif text-xl text-white mb-2 font-light">{company.name}</h3>
                <div className="w-6 h-px bg-amber-400/60 mb-3 group-hover:bg-amber-400 transition-colors duration-300" />
                <p className="text-slate-300 text-sm leading-relaxed font-light">{company.description}</p>
              </div>
            </div>
          ))}
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
          label="How We Operate"
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

        {/* Philosophy statement */}
        <div className="mt-16 border border-slate-700 p-10 md:p-16 relative">
          <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-amber-400/40" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-amber-400/40" />
          <p className="text-slate-300 text-lg md:text-xl font-serif font-light leading-relaxed text-center max-w-3xl mx-auto">
            Growing family capital with discipline and patience — compounding quietly,
            in service of a legacy that endures.
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
          title="Get in Touch"
        />

        <div className="max-w-lg mx-auto text-center space-y-8">
          <div>
            <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Enquiries</p>
            <a href="mailto:contact@3palphacapital.com" className="text-slate-300 text-lg font-light hover:text-amber-400 transition-colors">
              contact@3palphacapital.com
            </a>
          </div>
          <div>
            <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Jurisdiction</p>
            <p className="text-slate-400 font-light text-sm">
              British Virgin Islands
            </p>
          </div>
          <div className="pt-8 border-t border-slate-800">
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              3P Alpha Capital is a private investment vehicle. Nothing on this website
              constitutes investment advice or a solicitation to invest. Past performance
              is not indicative of future results.
            </p>
          </div>
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

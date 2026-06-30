import React, { useState, useRef, useEffect, memo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, X,
  Sparkles, PenTool, Lightbulb,
  ShoppingCart, ChevronRight, CheckCircle2,
  Target, Award, Rocket,
  Code2, TrendingUp,
  Star, Quote
} from 'lucide-react';

/* ═══════════════════ CLIENT DATA ═══════════════════════ */

const clients = [
  {
    id: 'amazon',
    name: 'Amazon',
    industry: 'E-commerce & Technology',
    logo: '/clients/amazon-logo.png',
    color: '#FF9900',
    gradient: 'linear-gradient(135deg, #FF9900, #FF6600)',
    accentBg: '#FF990012',
    description: 'Supporting digital innovation and working on lead generation for Amazon business.',
    icon: <ShoppingCart className="w-5 h-5" />,
    caseStudy: {
      title: 'Building Scalable Digital Experiences',
      services: ['Technology Solutions', 'Digital Experience', 'Platform Improvements'],
      highlight: 'Focused on creating reliable, scalable, and user-centric digital solutions.',
      overview: 'We partnered with Amazon to support their digital innovation initiatives, focusing on lead generation strategies and building scalable technology solutions that drive measurable business growth. Our team worked closely with their product teams to identify bottlenecks, optimize user funnels, and deliver platform-level improvements.',
      keyResults: [
        { label: 'Lead Generation', detail: 'Implemented advanced lead capture and nurturing strategies tailored for Amazon\'s business verticals.' },
        { label: 'Platform Optimization', detail: 'Delivered performance improvements across critical user touchpoints, enhancing load times and conversion flows.' },
        { label: 'Scalable Architecture', detail: 'Designed modular, future-proof digital systems built to handle high-volume traffic and rapid feature iteration.' },
      ],
      impact: 'Enhanced digital presence with a focus on conversion optimization, user engagement, and sustainable technology infrastructure.',
      testimonial: {
        quote: 'The team delivered exactly what we needed — reliable, scalable solutions that made a real difference in our lead generation efforts.',
        author: 'Product Team Lead',
        rating: 5,
      },
    },
  },
  {
    id: 'vt-interiors',
    name: 'VT Interiors',
    industry: 'Interior Design & Architecture',
    logo: '/clients/vt-interiors-logo.png',
    color: '#8B6914',
    gradient: 'linear-gradient(135deg, #8B6914, #C4962C)',
    accentBg: '#8B691412',
    description: 'Creating digital solutions that showcase creativity, design excellence, and brand presence.',
    icon: <PenTool className="w-5 h-5" />,
    caseStudy: {
      title: 'Creating a Digital Showcase for Interior Excellence',
      services: ['Website Design', 'Portfolio Presentation', 'Brand Experience'],
      highlight: null,
      overview: 'VT Interiors creates stunning physical spaces, but their online presence didn\'t reflect the same level of excellence. We developed a visually rich digital platform that showcases their portfolio, communicates their design philosophy, and attracts high-value clients through compelling visual storytelling.',
      challenge: 'Showcasing premium interior projects through an engaging online experience. The challenge was translating the tactile, immersive quality of physical interior design into a digital format that captures the same emotional response.',
      solution: 'Developed a visually rich platform that highlights creativity and attracts potential customers. We implemented gallery-style layouts, project case studies with immersive scrolling, and a cohesive brand narrative that positions VT Interiors as a premium design authority.',
      keyResults: [
        { label: 'Visual Storytelling', detail: 'Created immersive portfolio presentations that let potential clients experience the quality of work before making contact.' },
        { label: 'Brand Positioning', detail: 'Established a premium digital identity that matches the sophistication of their interior design projects.' },
        { label: 'Client Acquisition', detail: 'Designed strategic inquiry flows and project showcases that convert visitors into qualified leads.' },
      ],
      impact: 'A digital presence that truly reflects the craftsmanship and artistry of VT Interiors, driving new client inquiries and strengthening brand authority in the interior design space.',
      testimonial: {
        quote: 'Our website finally matches the quality of our work. Clients now come to us already impressed — that\'s the power of great digital design.',
        author: 'Founder, VT Interiors',
        rating: 5,
      },
    },
  },

];

/* ═══════════════════ CSS-ONLY BACKGROUND ORBS ═════════ */
/* Uses pure CSS animations instead of Framer Motion to avoid constant re-renders */

const orbStyle = `
@keyframes orb-drift {
  0%   { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(15px, -25px) scale(1.08); }
  50%  { transform: translate(-10px, 0) scale(0.95); }
  75%  { transform: translate(5px, 20px) scale(1.05); }
  100% { transform: translate(0, 0) scale(1); }
}
.orb { animation: orb-drift 16s ease-in-out infinite; will-change: transform; }
.orb-d1 { animation-delay: 0s; }
.orb-d2 { animation-delay: -4s; }
.orb-d3 { animation-delay: -8s; }
.orb-d4 { animation-delay: -12s; }
`;

/* ═══════════════════ SECTION BADGE ═════════════════════ */

const SectionBadge = memo(({ icon, label }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8
               bg-accent/8 dark:bg-accent/10
               border border-accent/15 dark:border-accent/20
               text-accent text-xs font-semibold tracking-[0.15em] uppercase"
  >
    {icon}
    {label}
  </motion.div>
));

/* ═══════════════════ STAR RATING ═══════════════════════ */

const StarRating = memo(({ rating }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < rating ? 'fill-amber-400 text-amber-400' : 'text-foreground/15'
        }`}
      />
    ))}
  </div>
));

/* ═══════════════════ CLIENT PARTNERSHIP CARD ═══════════ */

const ClientCard = memo(({ client, index, onOpenCaseStudy }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div
        className="relative rounded-3xl overflow-hidden cursor-pointer
                    glass-panel
                    transition-[transform,box-shadow,border-color] duration-500
                    hover:-translate-y-2
                    hover:shadow-[0_20px_50px_-15px_var(--card-glow)]
                    hover:border-[var(--card-border)]"
        style={{
          '--card-glow': `${client.color}25`,
          '--card-border': `${client.color}40`,
        }}
        onClick={() => onOpenCaseStudy(client)}
      >
        {/* Top color bar */}
        <div className="h-1 w-full" style={{ background: client.gradient }} />

        {/* Card content */}
        <div className="p-7 md:p-8">
          {/* Logo + Industry row */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden
                            bg-white dark:bg-white/10 border border-border/30
                            shadow-sm group-hover:shadow-md
                            group-hover:scale-105 transition-[transform,box-shadow] duration-500"
              >
                <img
                  src={client.logo}
                  alt={`${client.name} logo`}
                  className="w-12 h-12 object-contain"
                  loading="lazy"
                />
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">{client.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span style={{ color: client.color }}>{client.icon}</span>
                  <span className="text-xs font-medium text-foreground/45 tracking-wide">{client.industry}</span>
                </div>
              </div>
            </div>

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-300"
              style={{ background: `${client.color}15`, color: client.color }}
            >
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <p className="text-foreground/55 font-light leading-relaxed text-[15px] mb-6">
            "{client.description}"
          </p>

          <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-[gap] duration-300"
            style={{ color: client.color }}
          >
            <span>View Case Study</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

/* ═══════════════════ CASE STUDY MODAL ══════════════════ */

const CaseStudyModal = ({ client, onClose }) => {
  const cs = client.caseStudy;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/60 dark:bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto
                   bg-background dark:bg-background
                   rounded-3xl border border-border/50
                   shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Top gradient bar */}
        <div className="h-1.5 w-full rounded-t-3xl" style={{ background: client.gradient }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-xl
                     bg-foreground/5 hover:bg-foreground/10
                     flex items-center justify-center transition-colors duration-200
                     hover:rotate-90 z-10 cursor-pointer"
        >
          <X className="w-5 h-5 text-foreground/60" />
        </button>

        <div className="p-8 md:p-10">

          {/* ── Header ── */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden
                            bg-white dark:bg-white/10 border border-border/30 shadow-sm">
              <img src={client.logo} alt={client.name} className="w-10 h-10 object-contain" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: client.color }}>
                Case Study
              </p>
              <h3 className="text-sm text-foreground/50 font-medium">{client.name} · {client.industry}</h3>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 leading-tight">
            {cs.title}
          </h2>

          {/* ── Overview ── */}
          <p className="text-foreground/60 font-light leading-relaxed text-[15px] mb-8">
            {cs.overview}
          </p>

          {/* ── Services Delivered ── */}
          <div className="mb-8">
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground/40 mb-4 flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5" />
              Services Delivered
            </h4>
            <div className="flex flex-wrap gap-2">
              {cs.services.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border/40"
                  style={{ background: client.accentBg, color: client.color }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* ── Challenge & Solution ── */}
          {cs.challenge && (
            <div className="space-y-4 mb-8">
              <div className="rounded-2xl p-6 border border-border/30" style={{ background: `${client.color}04` }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${client.color}15`, color: client.color }}>
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground/70">The Challenge</h4>
                    <p className="text-foreground/55 font-light leading-relaxed text-[15px]">{cs.challenge}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6 border border-border/30" style={{ background: `${client.color}06` }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${client.color}15`, color: client.color }}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: client.color }}>Our Solution</h4>
                    <p className="text-foreground/55 font-light leading-relaxed text-[15px]">{cs.solution}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Highlight (Amazon-style) ── */}
          {cs.highlight && !cs.challenge && (
            <div className="rounded-2xl p-6 border border-border/30 mb-8" style={{ background: `${client.color}06` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${client.color}15`, color: client.color }}>
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: client.color }}>Highlight</h4>
                  <p className="text-foreground/55 font-light leading-relaxed text-[15px]">{cs.highlight}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Key Results ── */}
          <div className="mb-8">
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground/40 mb-5 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Key Results & Deliverables
            </h4>
            <div className="space-y-3">
              {cs.keyResults.map((result, i) => (
                <div
                  key={result.label}
                  className="rounded-xl p-5 border border-border/25
                             bg-foreground/[0.015] dark:bg-foreground/[0.02]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold"
                      style={{ background: `${client.color}12`, color: client.color }}>
                      {i + 1}
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold mb-1 tracking-tight">{result.label}</h5>
                      <p className="text-foreground/50 font-light leading-relaxed text-[14px]">{result.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Impact ── */}
          <div
            className="rounded-2xl p-6 border mb-8 relative overflow-hidden"
            style={{ borderColor: `${client.color}20`, background: `${client.color}06` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${client.color}30, transparent)` }} />
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${client.color}15`, color: client.color }}>
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: client.color }}>Overall Impact</h4>
                <p className="text-foreground/60 font-light leading-relaxed text-[15px]">{cs.impact}</p>
              </div>
            </div>
          </div>

          {/* ── Testimonial ── */}
          {cs.testimonial && (
            <div className="rounded-2xl p-6 border border-border/25 bg-card/30 dark:bg-card/15 relative">
              <Quote className="absolute top-4 right-5 w-10 h-10 text-foreground/[0.04] dark:text-foreground/[0.06]" />

              <StarRating rating={cs.testimonial.rating} />

              <p className="text-foreground/60 font-light leading-relaxed text-[15px] mt-4 mb-4 italic">
                "{cs.testimonial.quote}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: client.gradient }}>
                  {cs.testimonial.author.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{cs.testimonial.author}</p>
                  <p className="text-xs text-foreground/40">{client.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════ BOTTOM CTA ════════════════════════ */

const BottomCTA = memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center mt-20 md:mt-28"
  >
    <div
      className="relative inline-block rounded-3xl p-10 md:p-14
                  glass-panel overflow-hidden max-w-3xl mx-auto"
    >
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none rounded-br-[4rem]" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-accent-violet/10 to-transparent pointer-events-none rounded-tl-[4rem]" />
      <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 text-accent mb-6">
          <Award className="w-7 h-7" />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 leading-tight">
          Every partnership represents our
          <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-accent via-accent-violet to-accent-cyan bg-clip-text text-transparent">
            {' '}commitment to excellence
          </span>
        </h3>
        <p className="text-foreground/45 font-light max-w-lg mx-auto text-[15px] leading-relaxed">
          We don't just deliver projects — we build lasting relationships through
          quality, innovation, and measurable results.
        </p>
      </div>
    </div>
  </motion.div>
));

/* ═══════════════════ MAIN COMPONENT ═══════════════════════ */

export default function OurClients() {
  const [selectedClient, setSelectedClient] = useState(null);

  return (
    <section className="py-24 md:py-36 relative overflow-hidden" id="our-clients">

      {/* ─── CSS-ONLY AMBIENT ORBS (zero JS overhead) ─── */}
      <style>{orbStyle}</style>
      <div className="orb orb-d1 absolute rounded-full pointer-events-none -z-10"
        style={{ width: 550, height: 550, top: '-5%', left: '5%', background: 'radial-gradient(circle, #4F8EF715, #4F8EF705, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="orb orb-d2 absolute rounded-full pointer-events-none -z-10"
        style={{ width: 450, height: 450, top: '25%', left: '75%', background: 'radial-gradient(circle, #8B5CF615, #8B5CF605, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="orb orb-d3 absolute rounded-full pointer-events-none -z-10"
        style={{ width: 400, height: 400, top: '55%', left: '15%', background: 'radial-gradient(circle, #06B6D415, #06B6D405, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="orb orb-d4 absolute rounded-full pointer-events-none -z-10"
        style={{ width: 350, height: 350, top: '75%', left: '65%', background: 'radial-gradient(circle, #FF990015, #FF990005, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">

        {/* ═══════════════ SECTION 1: TRUSTED BY ═══════════════ */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <SectionBadge icon={<Sparkles className="w-3.5 h-3.5" />} label="Our Clients" />

          <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight mb-6 leading-[1.1]">
            Trusted By{' '}
            <span className="bg-gradient-to-r from-accent via-accent-violet to-accent-cyan bg-clip-text text-transparent">
              Visionary Businesses
            </span>
          </h2>

          <p className="text-base md:text-lg text-foreground/50 font-light max-w-2xl mx-auto leading-relaxed">
            We collaborate with ambitious brands and businesses to create impactful
            digital experiences and technology solutions.
          </p>
        </motion.div>

        {/* Client Cards — 2×2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {clients.map((client, i) => (
            <ClientCard
              key={client.id}
              client={client}
              index={i}
              onOpenCaseStudy={setSelectedClient}
            />
          ))}
        </div>

        {/* ═══════════════ BOTTOM CTA ═══════════════ */}
        <BottomCTA />

      </div>

      {/* ═══════════════ CASE STUDY MODAL ═══════════════ */}
      <AnimatePresence>
        {selectedClient && (
          <CaseStudyModal
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
          />
        )}
      </AnimatePresence>

    </section>
  );
}

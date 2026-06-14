import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Cpu, HelpCircle, LayoutTemplate, Settings, Cloud, Database, Target, Phone, MessageSquare, FileText, Calendar } from 'lucide-react';

const servicesData = {
  "website-design": {
    title: "Bespoke Website Designing",
    subtitle: "Where visual storytelling meets flawless UI/UX",
    icon: LayoutTemplate,
    description: "We design high-end, immersive, and pixel-perfect layouts that capture attention instantly and reflect the true essence of your brand. Our methodology merges creative direction with psychological UI patterns to guide visitors effortlessly through your digital space.",
    pillars: [
      {
        title: "Visual Storytelling",
        desc: "We craft custom illustrations, layouts, and typography that narrate your brand's unique history and core value proposition."
      },
      {
        title: "Flawless UI/UX",
        desc: "Through rigorous wireframing and user flow analysis, we design interfaces that eliminate friction and maximize engagement."
      },
      {
        title: "Pixel-Perfect Execution",
        desc: "Every grid, alignment, and border is configured with surgical precision, ensuring perfect presentation across all screens."
      }
    ],
    deliverables: [
      "Custom High-Fidelity UI/UX Designs",
      "Interactive Prototyping (Figma)",
      "Bespoke Brand Asset & Iconography Design",
      "Component-Driven Design Systems",
      "Responsive Layout Grid Architectures",
      "Visual Motion & Interaction Guidelines"
    ],
    tech: ["Figma", "Adobe Creative Cloud", "Spline 3D", "Framer", "CSS Grid", "TailwindCSS"],
    blueprint: {
      title: "Interactive UX Mapping",
      desc: "Our design team charts interactive user journeys, testing user paths to confirm maximum engagement before a single line of code is written."
    }
  },
  "web-app-dev": {
    title: "Next-Gen Web & App Development",
    subtitle: "Turning stunning concepts into robust reality",
    icon: Cpu,
    description: "We write clean, lightning-fast code to develop responsive web platforms and mobile applications that perform flawlessly across all devices. We build for the future using robust frameworks and component architecture.",
    pillars: [
      {
        title: "High Performance",
        desc: "By implementing server-side rendering, code-splitting, and asset optimization, we achieve near-instantaneous page load speeds."
      },
      {
        title: "Cross-Platform Unity",
        desc: "We build applications that deliver a native-like experience whether run on desktop browsers, iOS devices, or Android platforms."
      },
      {
        title: "Scalable Architecture",
        desc: "Our component-driven structures ensure that your app remains maintainable and easy to expand as your features grow."
      }
    ],
    deliverables: [
      "Single Page Applications (SPAs) & PWAs",
      "Hybrid iOS & Android App Development",
      "Server-Side Rendered (SSR) Platforms",
      "Bespoke Headless CMS Integrations",
      "WebGL & 3D Interactive Web Experiences",
      "Comprehensive Unit & Integration Testing"
    ],
    tech: ["React", "Next.js", "Vite", "Capacitor", "Node.js", "Three.js", "Framer Motion"],
    blueprint: {
      title: "Component Tree Design",
      desc: "We plan out component lifecycles and global states to create highly modular, reusable frontend structures that build fast and scale smoothly."
    }
  },
  "custom-software": {
    title: "Custom Software Development",
    subtitle: "High-performance software tailored to your specific operational scale",
    icon: Settings,
    description: "From intelligent backends to complex data processing tools, we engineer high-performance software tailored to your specific operational scale. We design robust business logic to digitize operations and unlock new efficiency gains.",
    pillars: [
      {
        title: "Tailored Engineering",
        desc: "No generic templates. We analyze your workflows to build custom code that fits your exact operating and scaling requirements."
      },
      {
        title: "Intelligent Automation",
        desc: "We implement background queue systems, automated pipelines, and custom processing scripts to streamline manual work."
      },
      {
        title: "Hardened Core",
        desc: "We build security directly into our architectures, utilizing strict encryption, multi-layered auth, and sandboxed processing."
      }
    ],
    deliverables: [
      "Enterprise Resource Planning (ERP) Modules",
      "Custom CRM & Database Systems",
      "Automated Processing & Batch Scripts",
      "Real-Time Operational Dashboards",
      "SaaS Product Infrastructure Design",
      "Secure REST & gRPC API Services"
    ],
    tech: ["Python", "Go", "Node.js", "Docker", "Kubernetes", "AWS", "gRPC"],
    blueprint: {
      title: "Microservices Data Flow",
      desc: "Our backend architectures partition logic into microservices, securing data streams and decoupling components to avoid single points of failure."
    }
  },
  "cloud-api-integration": {
    title: "Intelligent Cloud & API Integration",
    subtitle: "Connecting your ecosystem securely",
    icon: Cloud,
    description: "We design seamless data pipelines and robust API structures optimized for speed, security, and reliability. We link your digital ecosystem into a cohesive unit that facilitates real-time data flows and breaks down silos.",
    pillars: [
      {
        title: "Ecosystem Connectivity",
        desc: "We build adapters and middleware that bind third-party tools, legacy hardware, and modern apps into one platform."
      },
      {
        title: "Performance Optimization",
        desc: "We leverage edge computing, CDNs, and intelligent caching layers to handle massive API request volumes with low latency."
      },
      {
        title: "Resilient Security",
        desc: "All connections are shielded using robust TLS standards, rate limiters, token validation, and IP restrictions."
      }
    ],
    deliverables: [
      "Custom RESTful & GraphQL APIs",
      "Serverless Cloud Infrastructure Setup",
      "Third-party Software (SaaS) Integrations",
      "Secure OAuth 2.0 Auth Gateways",
      "Edge Computing & CDN Configurations",
      "Real-time Webhook & Event Listeners"
    ],
    tech: ["AWS", "Google Cloud Platform", "GraphQL", "REST APIs", "Redis", "Serverless", "OAuth 2.0"],
    blueprint: {
      title: "API Gateway Topology",
      desc: "Our API mesh setups utilize routing policies, rate limiting, and automated fallback endpoints to ensure maximum uptime under extreme loads."
    }
  },
  "database-optimization": {
    title: "Database Design & Optimization",
    subtitle: "Architecting secure, high-availability, and scalable data structures",
    icon: Database,
    description: "Architecting secure, high-availability, and scalable data structures that keep your business moving forward without a hitch. We help you store, query, and scale your structural and semi-structural data pools.",
    pillars: [
      {
        title: "Sub-Millisecond Queries",
        desc: "We configure indexes, construct optimized query patterns, and redesign schemas to resolve queries in fractions of a millisecond."
      },
      {
        title: "Fault-Tolerant Setups",
        desc: "Through read-replicas, hot standby nodes, and automated backup schedules, we design database architectures with 99.99% reliability."
      },
      {
        title: "Structured Efficiency",
        desc: "We balance normalization and denormalization perfectly, creating layouts that map cleanly to your business logic."
      }
    ],
    deliverables: [
      "Relational & NoSQL Schema Redesign",
      "Database Query Diagnostics & Tuning",
      "Read-Replica & Clustering Configurations",
      "Secure Automated Backup Solutions",
      "ETL Pipelines & Data Warehousing",
      "Encrypted Field-Level Storage Implementations"
    ],
    tech: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "DynamoDB", "Supabase", "SQL Optimization"],
    blueprint: {
      title: "High-Availability Replication Grid",
      desc: "We structure cluster nodes with automated replication, active failover coordinators, and query routers to handle peak load spikes gracefully."
    }
  },
  "lead-gen": {
    title: "Lead Generation",
    subtitle: "Hyper-targeted B2B and B2C lead generation workflows",
    icon: Target,
    description: "We compile data-driven profiles and execute multi-channel outreach campaigns to find warm prospects. Our team maps out target accounts, sets up customized lead scoring metrics, and configures automated outbound email drips to book qualified sales calls.",
    pillars: [
      {
        title: "Hyper-Targeted Profiling",
        desc: "We analyze your ideal customer profile (ICP) to extract and qualify prospects matching your niche."
      },
      {
        title: "Multi-Channel Outreach",
        desc: "We run outreach campaigns across Email, LinkedIn, and Phone channels to warm up prospects."
      },
      {
        title: "CAC Optimization",
        desc: "We lower your Customer Acquisition Cost (CAC) by filtering out invalid leads and optimizing message response rates."
      }
    ],
    deliverables: [
      "Custom ICP Target Prospect Databases",
      "Multi-Channel Outreach Sequences",
      "Automated Outbound Campaign Setup",
      "Response Tracking & Reporting Dashboards",
      "Verified B2B Contact Datasets",
      "Lead Qualification Flowcharts"
    ],
    tech: ["HubSpot CRM", "Apollo.io", "LinkedIn Sales Navigator", "Lemlist", "Zapier", "Python Scripts"],
    blueprint: {
      title: "Target Outreach Funnel",
      desc: "Our automated data pipes scrape and verify contacts, push them through high-converting outreach lists, and route positive replies directly to your CRM."
    }
  },
  "telemarketing": {
    title: "Telemarketing Services",
    subtitle: "Professional, high-volume outbound calling campaigns",
    icon: Phone,
    description: "Our script-trained specialists execute targeted calling cadences to warm up cold prospects, raise brand awareness, and qualify inbound/outbound interests. We handle cold calls with a focus on trust and value, not generic reading.",
    pillars: [
      {
        title: "Professional Calling Cadence",
        desc: "We make high-volume calls with structured scripts optimized for objection handling and scheduling."
      },
      {
        title: "Continuous Call Audits",
        desc: "Our QA managers review calls daily to verify alignment with compliance rules and brand value."
      },
      {
        title: "Direct Pipeline Integration",
        desc: "Interested leads are updated in real-time, allowing your internal closers to step in immediately."
      }
    ],
    deliverables: [
      "Custom Calling Script & Objections Guide",
      "High-Volume Dialer Platform Config",
      "Daily Outbound Call Log Analytics",
      "Audited Voice Recording Portals",
      "Lead Status CRM Integration",
      "Dedicated Representative Onboarding"
    ],
    tech: ["RingCentral", "Twilio API", "Close.io", "Aircall", "Google Sheets", "Vocal Auditing Tools"],
    blueprint: {
      title: "Telephony Call Flow Diagram",
      desc: "Outbound dials pass through our CRM calling routing, directing positive conversations to team leaders and sync'ing daily records into database tables."
    }
  },
  "email-chat": {
    title: "Email & Chat Support",
    subtitle: "24/7 omnichannel assistance built for scale",
    icon: MessageSquare,
    description: "Dedicated support agents provide rapid, empathetic, and accurate answers to your customers across live chat, ticketing platforms, and email boxes. We help you boost customer retention and lower response times to minutes.",
    pillars: [
      {
        title: "24/7 Support Coverage",
        desc: "No question goes unanswered. We maintain round-the-clock agent rotations to resolve issues globally."
      },
      {
        title: "Empathetic Interaction",
        desc: "We focus on human-centered support guidelines to make customers feel heard, valued, and resolved."
      },
      {
        title: "SLA Commitment",
        desc: "We adhere strictly to target Service Level Agreements (SLAs), minimizing wait times and resolving tickets quickly."
      }
    ],
    deliverables: [
      "Zendesk / Freshdesk Workspace Setup",
      "Interactive Live Chat Widget Config",
      "Custom Knowledgebase & Macros Library",
      "First Response SLA Performance Reports",
      "CSAT & NPS Customer Feedback Audits",
      "Escalation Workflow Diagrams"
    ],
    tech: ["Zendesk", "Intercom", "Freshdesk", "Slack", "LiveChat", "Jira Service Desk"],
    blueprint: {
      title: "Chat Routing Queue Grid",
      desc: "Incoming chat and support queries pass through intelligent priority routing, matching problems to specific trained agents for immediate action."
    }
  },
  "data-entry": {
    title: "Data Entry & Back Office",
    subtitle: "Streamlined data management and administrative processing",
    icon: FileText,
    description: "We handle accurate, rapid data processing and comprehensive back-office management to keep your core teams free to focus on strategic growth. From data scraping to formatting, we ensure high quality.",
    pillars: [
      {
        title: "Surgical Data Accuracy",
        desc: "Double-entry validation and regular audits keep error rates under 0.1% across all datasets."
      },
      {
        title: "Rapid Lead Times",
        desc: "We process documents, invoices, and databases within strict timelines to avoid workflow backlogs."
      },
      {
        title: "Flexible Operations",
        desc: "Our data team scales output up or down based on your business cycles and transaction volumes."
      }
    ],
    deliverables: [
      "Database Cleansing & Normalization",
      "Administrative Document Digitization",
      "Invoice & Billing Records Matching",
      "Regular Data Validation Audits",
      "E-commerce Inventory Sync Management",
      "PDF to Structured Spreadsheet Extraction"
    ],
    tech: ["Microsoft Excel", "Google Sheets", "Airtable", "OCR Automation Tools", "Google Drive", "Notion"],
    blueprint: {
      title: "Document Intake Processing Map",
      desc: "Physical and PDF documents are ingested, OCR-processed, manually cross-checked by validators, and formatted into secure cloud storage tables."
    }
  },
  "crm": {
    title: "CRM Management",
    subtitle: "End-to-end database organization and workflow automation",
    icon: Database,
    description: "We clean duplicate records, build automated pipelines, construct reporting dashboards, and clean up your CRM database to optimize sales efficiency and forecasting clarity.",
    pillars: [
      {
        title: "Database Hygiene",
        desc: "We clean duplicates, fix formatting, and delete outdated records to preserve contact accuracy."
      },
      {
        title: "Workflow Automation",
        desc: "We build Zapier and Native triggers that update deal cards, assign tasks, and send automated templates."
      },
      {
        title: "Clear Forecasting",
        desc: "We construct visual pipeline stages that reflect true lead states, providing reliable revenue projections."
      }
    ],
    deliverables: [
      "De-duplicated Contact & Lead Records",
      "Automated Custom CRM Pipelines",
      "Zapier / Make Automation Integrations",
      "Visual Analytics & Revenue Dashboards",
      "CRM Permissions & Access Settings",
      "Pipeline Phase Training Playbooks"
    ],
    tech: ["Salesforce", "HubSpot CRM", "Zoho CRM", "Zapier", "Make.com", "Pipedrive"],
    blueprint: {
      title: "Lead State Workflow Chart",
      desc: "Incoming leads are tagged, routed by geo-location, assigned tasks automatically, and monitored through visual CRM pipeline columns."
    }
  },
  "appointments": {
    title: "Appointment Setting",
    subtitle: "Qualified meetings scheduled directly on your sales team's calendar",
    icon: Calendar,
    description: "Highly-trained outreach specialists warm up target accounts, qualify prospects, and book confirmed meetings directly on your sales representatives' calendars, allowing them to focus on closing.",
    pillars: [
      {
        title: "Qualified Calendars",
        desc: "We screen every prospect to ensure they match budget, authority, and need criteria before booking."
      },
      {
        title: "Empathetic Pitching",
        desc: "We call and email prospects, explaining value propositions tailored to their specific market pressure points."
      },
      {
        title: "Low No-Show Rates",
        desc: "We implement multi-step text and email reminder loops to keep scheduled meetings top-of-the-mind."
      }
    ],
    deliverables: [
      "Direct Calendar API Integrations",
      "Prospect Qualification Brief Sheets",
      "Meeting Reminder Automation Sequences",
      "Qualified Outbound Calls Log",
      "Sales Lead Handoff Protocols",
      "Performance Booking Dashboards"
    ],
    tech: ["Calendly", "HubSpot Meeting Tool", "Google Calendar", "Outlook Calendar", "Zoom API", "Mailshake"],
    blueprint: {
      title: "Calendar Booking Routing Grid",
      desc: "Qualified contacts select booking slots, triggers confirmation messages, assigns sales reps via round-robin, and schedules calendar events."
    }
  },
  "intelligence-os": {
    title: "Intelligence OS",
    subtitle: "The core operating system for enterprise data flows",
    icon: Cpu,
    description: "A unified platform that connects APIs, cleanses raw data pools, and outputs actionable models to build seamless enterprise efficiency and true predictive capabilities.",
    pillars: [
      {
        title: "API Unification",
        desc: "We connect disparate databases and third-party apps into one centralized hub."
      },
      {
        title: "Data Cleanse Lakes",
        desc: "We process and filter structured/unstructured data in real-time, removing duplicates and bad headers."
      },
      {
        title: "Predictive Modeler",
        desc: "We implement machine learning algorithms that analyze trends to forecast user actions and revenue curves."
      }
    ],
    deliverables: [
      "Unified Enterprise API Gateway",
      "Clean Data Ingestion Pipelines",
      "Real-Time Analytics Dashboards",
      "Predictive Machine Learning APIs",
      "Automated Database Sync Pipelines",
      "Snowflake / BigQuery Cloud Setup"
    ],
    tech: ["Python", "Node.js", "AWS Lambda", "Snowflake", "Google BigQuery", "Tableau", "TensorFlow"],
    blueprint: {
      title: "Enterprise ETL Architecture Grid",
      desc: "Raw events land in our ingestion bucket, undergo transformation by serverless functions, and populate analytics tables for predictive model output."
    }
  }
};

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = servicesData[id];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!service) {
    return (
      <main className="pt-32 pb-24 min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-bold mb-4">Service Not Found</h2>
        <p className="text-foreground/60 mb-8">The requested service does not exist or has been moved.</p>
        <Link to="/services" className="px-6 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent/90 transition-colors">
          Back to Services
        </Link>
      </main>
    );
  }

  const IconComponent = service.icon || HelpCircle;

  return (
    <main className="pt-32 pb-24 min-h-screen relative overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-accent-violet/5 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        {/* Back navigation & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b border-border/20 pb-8">
          <button 
            onClick={() => navigate('/services')} 
            className="flex items-center gap-3 text-foreground/50 hover:text-accent transition-colors text-sm font-medium group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Capabilities
          </button>
          
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-foreground/40">
            <Link to="/services" className="hover:text-accent transition-colors">Capabilities</Link>
            <span>/</span>
            <span className="text-accent">{service.title}</span>
          </div>
        </div>

        {/* Hero Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-24 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-[0_0_30px_rgba(79,142,247,0.15)] mb-8">
              <IconComponent className="w-8 h-8 text-accent" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.1] mb-6">
              {service.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-accent font-light mb-8 italic">
              "{service.subtitle}"
            </p>
            
            <p className="text-lg text-foreground/70 font-light leading-relaxed max-w-2xl">
              {service.description}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="glass-panel border border-border/30 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <h3 className="text-lg font-bold tracking-wider uppercase text-foreground/40 mb-6 border-b border-border/20 pb-4">
                Core Deliverables
              </h3>
              
              <ul className="flex flex-col gap-4">
                {service.deliverables.map((item, idx) => (
                  <motion.li 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                    className="flex items-start gap-3 text-foreground/85 font-light"
                  >
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Pillars / Value Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {service.pillars.map((pillar, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="glass-panel border border-border/20 rounded-3xl p-8 hover:border-accent/30 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(79,142,247,0.05)]"
            >
              <div className="text-accent font-mono text-sm mb-4">0{idx + 1} // CAPABILITY</div>
              <h3 className="text-xl font-bold mb-4">{pillar.title}</h3>
              <p className="text-foreground/75 font-light text-sm leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack & Blueprint Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24 items-stretch">
          
          {/* Blueprint */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div className="glass-panel border border-border/20 rounded-[2rem] p-8 md:p-10 flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span className="text-xs uppercase tracking-widest font-semibold text-foreground/50">Architecture & Method</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">{service.blueprint.title}</h2>
                <p className="text-foreground/70 font-light leading-relaxed mb-8 text-base">
                  {service.blueprint.desc}
                </p>
              </div>

              {/* Blueprint Graphic Placeholder Grid */}
              <div className="border border-border/30 rounded-2xl p-6 bg-background/30 flex items-center justify-center min-h-[160px] relative shimming-effect overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-15 pointer-events-none">
                  {[...Array(18)].map((_, i) => (
                    <div key={i} className="border border-foreground/30"></div>
                  ))}
                </div>
                <div className="z-10 flex flex-col items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-accent font-semibold">Blueprint Layout Map</span>
                  <span className="text-[10px] font-mono text-foreground/40">ZEXORA INTEL SYNC v1.02</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 flex"
          >
            <div className="glass-panel border border-border/20 rounded-[2rem] p-8 md:p-10 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-accent-violet"></div>
                  <span className="text-xs uppercase tracking-widest font-semibold text-foreground/50">Integrated Technology</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">Technology Stack</h2>
                <p className="text-foreground/60 font-light leading-relaxed mb-8 text-sm">
                  We use state-of-the-art tools and robust technologies optimized for speed, reliability, and visual clarity.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {service.tech.map((techName, idx) => (
                  <span 
                    key={idx}
                    className="px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground/80 text-sm font-medium transition-all duration-300 hover:border-accent/40 hover:text-accent hover:shadow-[0_0_15px_rgba(79,142,247,0.1)]"
                  >
                    {techName}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-panel border border-accent/20 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent-violet/5"></div>
          <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">
              Ready to engineer your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">vision</span>?
            </h2>
            <p className="text-foreground/60 font-light text-base md:text-lg mb-10 leading-relaxed">
              Connect with our experts to discuss how Zexora Quvixo can build your next digital asset.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/contact" 
                className="px-8 py-4 rounded-full bg-accent text-white font-medium text-lg hover:bg-accent/90 transition-colors shadow-[0_0_20px_rgba(79,142,247,0.3)] hover:shadow-[0_0_30px_rgba(79,142,247,0.5)] cursor-pointer"
              >
                Start Your Project
              </Link>
              <Link 
                to="/services" 
                className="px-8 py-4 rounded-full bg-background border border-border hover:border-foreground/45 text-foreground/80 font-medium text-lg transition-colors cursor-pointer"
              >
                Back to Capabilities
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

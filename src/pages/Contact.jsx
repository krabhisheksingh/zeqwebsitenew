import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, ArrowRight } from 'lucide-react';
import { FaLinkedin, FaTwitter } from 'react-icons/fa';

const teamMembers = [
  {
    name: "Neha Patel",
    role: "Director",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80",
    bio: "Driving strategic initiatives and operational excellence across the organization.",
    social: { linkedin: "#", twitter: "#" }
  },
  {
    name: "Vivek Patel",
    role: "Founder & Chief Executive Officer",
    image: "/vivek.jpg",
    bio: "Visionary leader with a decade of experience in enterprise intelligence.",
    social: { linkedin: "#", twitter: "#" }
  },
  {
    name: "Abhishek Singh",
    role: "Technical Head",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80",
    bio: "Architecting robust, scalable, and cutting-edge software solutions.",
    social: { linkedin: "#", twitter: "#" }
  },
  {
    name: "Shruti Patel",
    role: "Chief Legal Officer (CLO)",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&q=80",
    bio: "Navigating complex legal landscapes and ensuring corporate compliance.",
    social: { linkedin: "#", twitter: "#" }
  }
];


export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("form-name", "contact");
    Object.keys(formState).forEach((key) => formData.append(key, formState[key]));

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert("There was an error sending your message. Please try again.");
    }
  };

  return (
    <main className="pt-32 pb-24 min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
      </div>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full mb-32 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="w-12 h-[1px] bg-accent"></div>
          <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">Who We Are</span>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.1] mb-8 sticky top-32">
              We build digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">ecosystems</span> designed for the future.
            </h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-7 flex flex-col gap-6 text-foreground/70 font-light text-lg md:text-xl leading-relaxed"
          >
            <p className="text-foreground font-medium text-xl md:text-2xl border-l-2 border-accent pl-6 mb-4">
              At Zexora Quvixo, we are a future-focused digital solutions company dedicated to helping businesses build, scale, and grow in the modern digital world.
            </p>
            <p>
              We combine strategy, creativity, technology, and innovation to create powerful digital experiences that drive real business results. Our team specializes in branding, web design & development, AI-powered product solutions, digital marketing, automation, and business growth strategies.
            </p>
            <p>
              We work closely with startups, creators, enterprises, and growing brands to transform ideas into impactful digital products and scalable business systems. We believe that every business deserves more than just services — it deserves a growth partner. 
            </p>
            <p>
              That’s why we focus on creating tailored solutions that align with each client’s vision, audience, and long-term goals. From building strong brand identities to developing modern websites, intelligent automation systems, and high-converting digital campaigns, we help brands stand out in competitive markets.
            </p>
            <p>
              Driven by creativity, technology, and performance, our mission is to simplify digital transformation and empower businesses with innovative solutions that create measurable growth, stronger customer engagement, and lasting brand value.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full mb-32 mt-8">
        <div className="flex items-center gap-4 mb-6 justify-center">
          <div className="w-12 h-[1px] bg-accent"></div>
          <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">Leadership</span>
          <div className="w-12 h-[1px] bg-accent"></div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-16 text-center">
          Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">Team</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="glass-panel border border-border/30 rounded-3xl p-6 flex flex-col items-center text-center group hover:border-accent/40 transition-colors duration-500"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-2 border-accent/20 group-hover:border-accent transition-colors duration-500 relative">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
              <p className="text-accent font-medium text-sm mb-4 tracking-wide uppercase">{member.role}</p>
              <p className="text-foreground/70 font-light text-sm mb-6 leading-relaxed">
                {member.bio}
              </p>

            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Left Column - Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 flex flex-col justify-center"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[1px] bg-accent"></div>
              <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">Get In Touch</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
              Let's Build the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">Future</span> Together.
            </h1>
            
            <p className="text-xl text-foreground/60 font-light max-w-md mb-16">
              Reach out to discover how our intelligence ecosystem can transform your enterprise.
            </p>

            <div className="flex flex-col gap-10">
              <div className="group flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Email Us</h3>
                  <a href="mailto:info@zexoraquvixo.in" className="text-foreground/70 hover:text-accent transition-colors font-light">
                    info@zexoraquvixo.in
                  </a>
                </div>
              </div>

              <div className="group flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Address</h3>
                  <a 
                    href="https://maps.app.goo.gl/E9j9gm4q3thYPq9FA"
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-foreground/70 hover:text-accent transition-colors font-light leading-relaxed max-w-sm block"
                  >
                    4th floor, 241, Lotus square, corner, <br />
                    9th Cross Rd, next to HSR High street Restaurant, <br />
                    7th Sector, HSR Layout, Bengaluru, Karnataka 560102
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <div className="glass-panel border border-border/30 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <h3 className="text-2xl font-bold mb-8 relative z-10">Send us a Query</h3>
              
              <form name="contact" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
                <input type="hidden" name="form-name" value="contact" />
                <p className="hidden">
                  <label>Don’t fill this out if you're human: <input name="bot-field" /></label>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Name</label>
                    <input 
                      type="text" 
                      id="name"
                      required
                      value={formState.name}
                      onChange={e => setFormState({...formState, name: e.target.value})}
                      className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent focus:bg-background/80 transition-all font-light"
                      placeholder="Abhiraj Singh"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Email</label>
                    <input 
                      type="email" 
                      id="email"
                      required
                      value={formState.email}
                      onChange={e => setFormState({...formState, email: e.target.value})}
                      className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent focus:bg-background/80 transition-all font-light"
                      placeholder="abhiraj@gmail.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Subject</label>
                  <input 
                    type="text" 
                    id="subject"
                    required
                    value={formState.subject}
                    onChange={e => setFormState({...formState, subject: e.target.value})}
                    className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent focus:bg-background/80 transition-all font-light"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Message</label>
                  <textarea 
                    id="message"
                    required
                    rows="4"
                    value={formState.message}
                    onChange={e => setFormState({...formState, message: e.target.value})}
                    className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent focus:bg-background/80 transition-all font-light resize-none"
                    placeholder="Tell us about your project..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 w-full md:w-auto self-start px-8 py-4 rounded-full bg-accent text-white font-medium text-lg flex items-center justify-center gap-3 hover:bg-accent/90 transition-colors shadow-[0_0_20px_rgba(40,80,255,0.3)] hover:shadow-[0_0_30px_rgba(40,80,255,0.5)] disabled:opacity-70 group"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : isSubmitted ? (
                    <span>Message Sent!</span>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}

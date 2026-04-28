import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, ArrowRight } from 'lucide-react';

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate frontend submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <main className="pt-32 pb-24 min-h-screen flex items-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
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
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
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
                      placeholder="abhiraj0401@gmail.com"
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

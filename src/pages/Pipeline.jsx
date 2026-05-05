import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Clock, Calendar, Mail, User, Building } from 'lucide-react';

export default function Pipeline() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectDetails: '',
    date: ''
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 relative overflow-hidden flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-background overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="max-w-3xl w-full mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Let's Build <span className="text-accent">Together</span>
          </h1>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">
            Complete the form below to help us understand your needs and schedule a personalized consultation.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-border/50 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-accent transition-all duration-500 -z-10" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
              step >= num ? 'bg-accent text-white shadow-[0_0_20px_rgba(var(--accent),0.5)]' : 'bg-background border-2 border-border/50 text-foreground/50'
            }`}>
              {step > num ? <CheckCircle className="w-5 h-5" /> : num}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-background/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <User className="text-accent" /> Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Mail className="w-4 h-4"/> Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 flex items-center gap-2"><Building className="w-4 h-4"/> Company Name</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors" placeholder="Your Organization" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Calendar className="text-accent" /> Project Needs
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Tell us about your project or challenges</label>
                <textarea name="projectDetails" value={formData.projectDetails} onChange={handleChange} rows={5} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors resize-none" placeholder="We are looking to implement AI solutions for..." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Clock className="text-accent" /> Schedule Consultation
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Preferred Date & Time</label>
                <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors text-foreground" />
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mt-6">
                <h3 className="font-semibold text-accent mb-2">Summary</h3>
                <p className="text-sm text-foreground/70 mb-1"><span className="font-medium text-foreground">Name:</span> {formData.name || 'Not provided'}</p>
                <p className="text-sm text-foreground/70"><span className="font-medium text-foreground">Email:</span> {formData.email || 'Not provided'}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-10 pt-6 border-t border-border/30">
            {step > 1 ? (
              <button onClick={handlePrev} className="px-6 py-2 rounded-full border border-border/50 hover:bg-foreground/5 font-medium transition-colors">
                Back
              </button>
            ) : <div></div>}
            
            {step < 3 ? (
              <button onClick={handleNext} className="px-8 py-3 rounded-full bg-foreground text-background font-medium flex items-center gap-2 hover:scale-105 transition-transform group">
                Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button className="px-8 py-3 rounded-full bg-accent text-white font-medium flex items-center gap-2 hover:scale-105 transition-transform hover:shadow-[0_0_20px_rgba(var(--accent),0.4)]">
                Confirm Booking
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

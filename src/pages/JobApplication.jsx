import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ArrowLeft } from 'lucide-react';

export default function JobApplication() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job || { title: "Role not found" };

  const [fileName, setFileName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    formData.append("form-name", "job-application");
    formData.append("jobTitle", job.title);

    try {
      await fetch("/", {
        method: "POST",
        body: formData,
      });
      alert('Application submitted successfully!');
      navigate('/careers');
    } catch (error) {
      console.error(error);
      alert('There was an error submitting your application. Please try again.');
    }
  };

  return (
    <main className="pt-32 pb-24 min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 w-full relative z-10">
        <button 
          onClick={() => navigate('/careers')}
          className="flex items-center gap-2 text-foreground/60 hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Careers
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel border border-border/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">Apply for <span className="text-accent">{job.title}</span></h1>
          <p className="text-foreground/60 mb-10">Join our ecosystem and build the future with us.</p>

          <form name="job-application" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="flex flex-col gap-6">
            <input type="hidden" name="form-name" value="job-application" />
            <p className="hidden">
              <label>Don’t fill this out if you're human: <input name="bot-field" /></label>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  required
                  className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  placeholder="John"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  required
                  className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Email Address</label>
              <input 
                type="email" 
                name="email"
                required
                className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                placeholder="john.doe@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80">LinkedIn Profile</label>
              <input 
                type="url" 
                name="linkedin"
                className="bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Resume / CV</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 hover:border-accent/50 rounded-xl px-6 py-10 cursor-pointer bg-background/30 hover:bg-background/50 transition-all group">
                <Upload className="w-8 h-8 text-foreground/40 group-hover:text-accent mb-3 transition-colors" />
                <span className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                  {fileName ? fileName : "Click to upload or drag and drop"}
                </span>
                <span className="text-xs text-foreground/50 mt-1">PDF, DOCX up to 5MB</span>
                <input 
                  type="file" 
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  className="hidden" 
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>

            <button 
              type="submit" 
              className="mt-6 w-full py-4 rounded-xl bg-foreground text-background font-bold text-lg hover:bg-accent hover:text-white transition-all shadow-lg hover:shadow-accent/20"
            >
              Submit Application
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}

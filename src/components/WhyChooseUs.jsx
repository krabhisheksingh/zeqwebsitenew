import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, BarChart2, DollarSign, Globe2, Sparkles, Users } from 'lucide-react';

const features = [
  {
    icon: <Rocket className="w-12 h-12" />,
    title: "Scalable",
    desc: "Built to grow with your business demands invisibly and effortlessly. We ensure that your infrastructure can handle rapid expansion without compromising on performance or stability. From day one, our systems are architected with elasticity in mind, allowing you to scale resources up or down dynamically based on real-time needs. This forward-thinking approach minimizes downtime, optimizes resource allocation, and provides a seamless experience for your users regardless of traffic spikes or sudden growth spurts."
  },
  {
    icon: <BarChart2 className="w-12 h-12" />,
    title: "Data-driven",
    desc: "Every decision, process, and output is backed by deep data analysis. We harness the power of advanced analytics and machine learning to uncover hidden patterns and actionable insights within your organization. By transforming raw data into strategic assets, we empower your team to make informed, objective choices that drive efficiency and competitive advantage. Our comprehensive dashboards and reporting tools ensure that you always have a clear, real-time view of your performance metrics."
  },
  {
    icon: <DollarSign className="w-12 h-12" />,
    title: "Cost-efficient",
    desc: "Optimized pipelines ensure maximum ROI with minimal administrative overhead. We meticulously analyze your operational workflows to identify and eliminate bottlenecks, redundancies, and unnecessary expenses. By automating routine tasks and streamlining complex processes, we significantly reduce your operational costs while simultaneously increasing productivity. This strategic approach to resource management allows you to reinvest your savings into core business initiatives and innovation."
  },
  {
    icon: <Globe2 className="w-12 h-12" />,
    title: "Global Reach",
    desc: "Intelligence solutions tailored for international scale and seamless deployment. Our architecture is designed to support multi-region infrastructure, ensuring low latency and high availability for users across the globe. We incorporate localization features and adhere to international compliance standards, making it easy for your business to expand into new markets confidently. Experience unparalleled connectivity and operational consistency no matter where your team or your customers are located."
  },
  {
    icon: <Sparkles className="w-12 h-12" />,
    title: "Future-Proofing",
    desc: "Systems designed to adapt to the next decade of digital evolution and beyond. We build with cutting-edge technologies and modular architectures that embrace change rather than resist it. By staying ahead of industry trends and continuously integrating the latest advancements in AI and automation, we ensure that your digital ecosystem remains robust, secure, and relevant. Protect your investments and maintain your competitive edge in an ever-changing technological landscape."
  },
  {
    icon: <Users className="w-12 h-12" />,
    title: "Human-Centric AI",
    desc: "We prioritize solutions that augment human potential rather than simply replacing it. Our AI models are designed to work alongside your team, automating tedious tasks so that your employees can focus on high-value, creative, and strategic endeavors. We place a strong emphasis on ethical AI practices, ensuring transparency, fairness, and user control in all our deployments. Empower your workforce with intelligent tools that enhance their capabilities and foster a more engaging work environment."
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-32" id="why-us">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-24 md:w-1/2">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Why Choose Us</h2>
          <p className="text-xl text-foreground/60 font-light">The foundation of our intelligence ecosystem. In a rapidly evolving global market, staying ahead requires more than just technology; it requires an intelligence partner who understands the nuance of global enterprise.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
          {features.map((feature, idx) => {
            let spanClass = "col-span-1";
            if (idx === 0) spanClass = "md:col-span-2";
            if (idx === 3) spanClass = "md:col-span-2";
            if (idx === 4) spanClass = "md:col-span-2";

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative group [perspective:1000px] ${spanClass}`}
              >
                <div className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-500 group-hover:[transform:rotateY(180deg)]">
                  {/* Front Face */}
                  <div className="absolute inset-0 [backface-visibility:hidden] rounded-[2rem] bg-card border border-border/50 overflow-hidden p-8 flex flex-col justify-between">
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/5 to-transparent"></div>
                    
                    <div className="relative z-10 text-accent bg-background w-16 h-16 rounded-2xl flex items-center justify-center border border-border/50 shadow-sm group-hover:scale-110 transition-transform duration-500">
                      {React.cloneElement(feature.icon, { className: "w-8 h-8" })}
                    </div>

                    <div className="relative z-10 mt-auto">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-foreground/60 font-light leading-relaxed max-w-md line-clamp-2">{feature.desc}</p>
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2rem] bg-accent text-white p-8 overflow-y-auto flex flex-col justify-center shadow-2xl">
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-white/90 font-light leading-relaxed text-sm md:text-base">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

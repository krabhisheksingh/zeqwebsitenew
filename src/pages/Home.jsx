import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Pillars from '../components/Pillars';
import WhyChooseUs from '../components/WhyChooseUs';
import Quote from '../components/Quote';
import Metrics from '../components/Metrics';

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Pillars />
      <WhyChooseUs />
      <Quote />
      <Metrics />
    </main>
  );
}

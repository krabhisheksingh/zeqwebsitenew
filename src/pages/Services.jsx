import React, { useEffect } from 'react';
import ServicesSection from '../components/ServicesSection';

export default function Services() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-20">
      <ServicesSection />
    </main>
  );
}

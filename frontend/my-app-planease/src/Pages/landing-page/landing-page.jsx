"use client"

import HeaderHeroSection from "./header-hero-section"
import ServicesSection from "./services-section"
import EventHighlightsSection from "./event-highlights-section"
import TestimonialsSection from "./testimonials-section"
import CTASection from "./cta-section"

export default function HomePage() {
  // Autolocking scroll feature removed

  return (
    <div>
      <div className="snap-section">
        <HeaderHeroSection />
      </div>
      <div className="snap-section">
        <ServicesSection />
      </div>
      <div className="snap-section">
        <EventHighlightsSection />
      </div>
      <div className="snap-section">
        <TestimonialsSection />
      </div>
    </div>
  )
}

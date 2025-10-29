"use client"

import { Link } from "react-router-dom"
import { ArrowRight, Camera, Mic, UtensilsCrossed, Cake, Users, Palette } from "lucide-react"
import { motion } from "framer-motion"

const ServiceCard = ({ title, description, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="bg-gray-900 text-white p-6 rounded-lg"
    >
      <div className="text-amber-400 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
  )
}

export default function ServicesSection() {
  const services = [
    {
      title: "Photography",
      description:
        "With Experience In A Range Of Event Styles, Our Contractors Excel In Both Candid And Posed Shots, Mastering Lighting, Timing, And Composition To Deliver Exceptional Photos Every Time.",
      icon: Camera,
    },
    {
      title: "Hosting",
      description:
        "Our Professional Hosts Bring Charisma, Confidence, And Excellent Communication Skills To Every Event, Ensuring Your Guests Feel Welcome And The Event Runs Smoothly.",
      icon: Mic,
    },
    {
      title: "Catering",
      description:
        "Our Contractors Specialize In Crafting Delicious, Custom Menus Tailored To Your Event, With A Focus On Presentation, Quality Ingredients, And Seamless Service.",
      icon: UtensilsCrossed,
    },
    {
      title: "Cakes",
      description:
        "Specialize In Crafting Custom Cakes That Combine Artistry, Flavor, And Flawless Presentation — Tailored Specifically To Make Your Day Unforgettable.",
      icon: Cake,
    },
    {
      title: "Bridal Entourage",
      description:
        "From Bridesmaids' Dresses To Flowers And Beauty Services, We Help Ensure Your Bridal Entourage Is Perfectly In Sync With Your Vision.",
      icon: Users,
    },
    {
      title: "Decor & Design",
      description:
        "Our Decorators Specialize In Creating Beautiful, On-Theme Event Spaces With Everything From Flowers To Furniture.",
      icon: Palette,
    },
  ]

  return (
    <section className="min-h-screen flex items-center py-16 bg-amber-50 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-amber-100 -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-100 translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-amber-500 uppercase tracking-wider font-medium mb-2"
          >
            RELIABLE SERVICES
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-900"
          >
            What We Offer
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              delay={index * 0.1}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {/* <Link
              to="#"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-md px-6 py-3 inline-flex items-center font-medium uppercase text-sm"
            >
              Explore Services <ArrowRight className="ml-2 h-4 w-4" />
            </Link> */}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

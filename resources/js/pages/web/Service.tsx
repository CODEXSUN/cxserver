'use client';

import WebMenu from '@/pages/web/web-menu';
import { motion } from 'framer-motion';
import { Monitor, Laptop, Camera, Server, Printer, Wrench, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import FooterSection from '@/pages/web/home/FooterSection';

const categories = [
    {
        title: "Desktop Computers",
        icon: Monitor,
        color: "from-blue-500 to-cyan-500",
        services: [
            "Motherboard & CPU Repair",
            "RAM & Storage Upgrades",
            "Power Supply Replacement",
            "Custom PC Assembly",
            "Overheating & Cooling Fix",
            "Windows Reinstallation"
        ]
    },
    {
        title: "Laptops",
        icon: Laptop,
        color: "from-purple-500 to-pink-500",
        services: [
            "Screen Replacement",
            "Keyboard & Trackpad Fix",
            "Battery Replacement",
            "Hinge & Body Repair",
            "SSD/HDD Upgrade",
            "Thermal Paste Refill"
        ]
    },
    {
        title: "Cameras & Photography",
        icon: Camera,
        color: "from-green-500 to-emerald-500",
        services: [
            "Lens Cleaning & Repair",
            "Sensor Dust Removal",
            "Shutter Mechanism Fix",
            "Firmware Updates",
            "Memory Card Recovery",
            "Battery & Charger Issues"
        ]
    },
    {
        title: "Servers & Networking",
        icon: Server,
        color: "from-orange-500 to-red-500",
        services: [
            "RAID Configuration",
            "Server OS Installation",
            "Network Switch Setup",
            "Firewall & Security",
            "Remote Access Setup",
            "Data Backup Solutions"
        ]
    },
    {
        title: "Printers & Peripherals",
        icon: Printer,
        color: "from-indigo-500 to-blue-500",
        services: [
            "Ink/Toner Refill & Reset",
            "Paper Jam & Feed Fix",
            "Driver & Network Setup",
            "Scanner Calibration",
            "Cartridge Alignment",
            "Wi-Fi Printing Setup"
        ]
    }
];

export default function Services() {
    return (
        <>
            <WebMenu />

            {/* Hero */}
            <section className="relative py-32 bg-gradient-to-br from-[#f53003] via-red-600 to-orange-700 overflow-hidden">
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-white text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6"
                    >
                        All-in-One Tech Repair
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl max-w-3xl mx-auto"
                    >
                        Desktop • Laptop • Camera • Server • Printer — We fix everything
                    </motion.p>
                </div>
            </section>

            {/* Service Categories */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                <div className="p-8">
                                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${cat.color} text-white mb-6`}>
                                        <cat.icon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        {cat.title}
                                    </h3>
                                    <ul className="space-y-3 mb-6">
                                        {cat.services.map((service, j) => (
                                            <li key={j} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                                <Wrench className="w-4 h-4 text-[#f53003]" />
                                                <span>{service}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center gap-2 text-[#f53003] font-semibold hover:gap-3 transition-all"
                                    >
                                        Book Service <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16">
                        Why Trust Us With Your Devices
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: "Certified Technicians", desc: "CompTIA A+, Microsoft, Cisco certified" },
                            { icon: Zap, title: "Same-Day Service", desc: "Most repairs completed within 4 hours" },
                            { icon: ArrowRight, title: "90-Day Warranty", desc: "Free rework if issue returns" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="inline-flex p-4 rounded-full bg-[#f53003]/10 text-[#f53003] mb-4">
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-[#f53003] to-orange-600">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Bring Your Device Today
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Walk-in or book online — we’re ready when you are.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-3 bg-white text-[#f53003] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100"
                        >
                            Book Now
                        </Link>
                        <Link
                            href="tel:+919876543210"
                            className="inline-flex items-center justify-center gap-3 border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-[#f53003]"
                        >
                            Call +91 98765 43210
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <FooterSection/>
        </>
    );
}

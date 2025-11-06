'use client';

import WebMenu from '@/pages/web/web-menu';
import { motion } from 'framer-motion';
import { Shield, Users, Award, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function About() {
    return (
        <>
            <WebMenu />

            {/* Hero Section */}
            <section className="relative h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#f53003] via-purple-400 to-orange-300">
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            Tech Media Service Center
                        </h1>
                        <p className="text-2xl md:text-3xl font-light mb-4">
              <span className="inline-flex items-center gap-2">
                <Clock className="w-7 h-7" />
                Since 2002
              </span>
                        </p>
                        <p className="text-xl leading-relaxed max-w-2xl">
                            Over two decades of excellence in computer repair, IT solutions, and customer trust.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Our Journey Since 2002
                            </h2>
                            <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
                                <p>
                                    Founded in the heart of Bangalore's tech district, <strong>Tech Media Service Center</strong> began as a small repair shop with a big vision: to make technology accessible and reliable for everyone.
                                </p>
                                <p>
                                    From fixing the first-generation Pentium PCs to today's AI-powered workstations, we've evolved with technology — but never compromised on our core values: <em>honesty, speed, and expertise</em>.
                                </p>
                                <p>
                                    Today, we serve over <strong>10,000+ customers annually</strong>, from students and home users to Fortune 500 companies, with the same dedication that started it all in 2002.
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-gradient-to-br from-[#f53003] to-orange-600 rounded-2xl p-8 text-white shadow-2xl">
                                <h3 className="text-2xl font-bold mb-6">23+ Years of Trust</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <div className="text-5xl font-bold">50K+</div>
                                        <div className="text-sm opacity-90">Devices Repaired</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-5xl font-bold">98%</div>
                                        <div className="text-sm opacity-90">Success Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-5xl font-bold">24/7</div>
                                        <div className="text-sm opacity-90">Emergency Support</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-5xl font-bold">2002</div>
                                        <div className="text-sm opacity-90">Year Founded</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16"
                    >
                        Why Customers Choose Us
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: "Certified Experts", desc: "Microsoft, CompTIA & Apple certified technicians" },
                            { icon: Users, title: "Customer First", desc: "Transparent pricing, no hidden fees" },
                            { icon: Award, title: "Award Winning", desc: "Best Service Center 2023 - Bangalore Tech Awards" },
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="text-center"
                            >
                                <div className="inline-flex p-4 rounded-full bg-[#f53003]/10 text-[#f53003] mb-4">
                                    <value.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-[#f53003] to-orange-600">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center text-white">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        Experience the Tech Media Difference
                    </motion.h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands who trust us with their technology every day.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-3 bg-white text-[#f53003] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
                        >
                            <Phone className="w-5 h-5" />
                            Book a Service
                        </Link>
                        <Link
                            href="tel:+919876543210"
                            className="inline-flex items-center justify-center gap-3 border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-[#f53003] transition"
                        >
                            <Phone className="w-5 h-5" />
                            Call +91 98765 43210
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">Tech Media Service Center</h3>
                            <p className="text-gray-400">Since 2002 — Your trusted tech partner.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5" /> Hours
                            </h4>
                            <p className="text-gray-400">
                                Mon-Fri: 9AM-8PM<br />
                                Sat: 10AM-6PM<br />
                                Sun: Emergency Only
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" /> Visit Us
                            </h4>
                            <p className="text-gray-400">
                                Electronic City, Phase II<br />
                                Bangalore, Karnataka 560100<br />
                                <a href="mailto:info@techmedia.in" className="flex items-center gap-2 mt-2 hover:text-[#f53003] transition">
                                    <Mail className="w-4 h-4" /> info@techmedia.in
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className="text-center text-gray-400 text-sm">
                        © {new Date().getFullYear()} Tech Media Service Center. All rights reserved.
                    </div>
                </div>
            </footer>
        </>
    );
}

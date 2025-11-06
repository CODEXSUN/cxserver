// resources/js/components/ServicesSection.tsx
'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Zap, Shield, HardDrive, Wifi, Server } from 'lucide-react';
import { Link } from '@inertiajs/react';

const services = [
    { icon: CheckCircle, title: "Virus & Malware Removal", desc: "Deep scan + full cleanup", color: "from-red-500 to-pink-500" },
    { icon: Zap, title: "Hardware Replacement", desc: "Screens, RAM, SSD upgrades", color: "from-orange-500 to-yellow-500" },
    { icon: HardDrive, title: "Data Recovery", desc: "Recover lost files safely", color: "from-blue-500 to-cyan-500" },
    { icon: Shield, title: "Windows & Mac OS", desc: "Reinstall, optimize, secure", color: "from-green-500 to-emerald-500" },
    { icon: Wifi, title: "Network Setup", desc: "Wi-Fi, secure connections", color: "from-purple-500 to-indigo-500" },
    { icon: Server, title: "Business IT Support", desc: "Servers, backup, remote", color: "from-pink-500 to-rose-500" },
];

export default function ServicesSection() {
    return (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Complete Computer Solutions
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Expert care for every device — fast, reliable, and affordable.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                            <div className="p-8">
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} text-white mb-5`}>
                                    <service.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">{service.desc}</p>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 text-[#f53003] font-semibold hover:gap-3 transition-all"
                                >
                                    Book Now <span className="text-sm">→</span>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

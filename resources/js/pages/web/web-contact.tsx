'use client';

import WebMenu from '@/pages/web/web-menu';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import FooterSection from '@/pages/web/home/FooterSection';

export default function Contact() {
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => {
                reset();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 5000);
            }
        });
    };

    return (
        <>
            <WebMenu />

            {/* Hero */}
            <section className="relative py-32 bg-gradient-to-br from-[#f53003] via-red-600 to-orange-700">
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-white text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6"
                    >
                        Get in Touch
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl max-w-3xl mx-auto"
                    >
                        Walk-in, call, or message — we're here to help 24/7
                    </motion.p>
                </div>
            </section>

            {/* Contact Info + Form */}
            <section className="py-20 bg-gray-50 dark:bg,bg-gray-900">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Details */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                                Visit or Call Us
                            </h2>
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="p-3 rounded-xl bg-[#f53003]/10 text-[#f53003]">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Location</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Tech Media Service Center<br />
                                            436, Avinashi Road,<br />
                                            Near CITU Office,<br />
                                            Tiruppur, Tamil Nadu 641602.<br />
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="p-3 rounded-xl bg-[#f53003]/10 text-[#f53003]">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Phone</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            <a href="tel:+919894244460" className="hover:text-[#f53003]">+91 9894244460</a><br />
                                            <a href="tel:+919894244450" className="hover:text-[#f53003]">+91 9894244450</a>
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="p-3 rounded-xl bg-[#f53003]/10 text-[#f53003]">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            <a href="mailto:support@techmedia.in" className="hover:text-[#f53003]">support@techmedia.in</a><br />
                                            <a href="mailto:service@techmedia.in" className="hover:text-[#f53003]">service@techmedia.in</a>
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="p-3 rounded-xl bg-[#f53003]/10 text-[#f53003]">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Open Hours</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Mon-Sat: 10:00 AM - 8:00 PM<br />
                                            Sunday: Emergency Only
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Map */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mt-10"
                            >
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                                    <p className="text-gray-500">Google Maps Embed Here</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
                        >
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                Send us a Message
                            </h2>

                            {showSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Message sent successfully! We'll reply within 2 hours.
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#f53003] focus:border-transparent"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#f53003]"
                                            required
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#f53003]"
                                            required
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Subject
                                    </label>
                                    <select
                                        value={data.subject}
                                        onChange={e => setData('subject', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#f53003]"
                                        required
                                    >
                                        <option value="">Select a service</option>
                                        <option>Desktop Repair</option>
                                        <option>Laptop Repair</option>
                                        <option>Camera Repair</option>
                                        <option>Server Setup</option>
                                        <option>Printer Fix</option>
                                        <option>Data Recovery</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#f53003]"
                                        required
                                    />
                                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#f53003] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#d42a00] transition flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {processing ? 'Sending...' : (
                                        <>
                                            Send Message <Send className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-[#f53003] to-orange-600">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Emergency? Call Now!
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        24/7 support for critical issues
                    </p>
                    <Link
                        href="tel:+919876543210"
                        className="inline-flex items-center gap-3 bg-white text-[#f53003] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100"
                    >
                        <Phone className="w-5 h-5" /> +91 9894244460
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <FooterSection/>
        </>
    );
}

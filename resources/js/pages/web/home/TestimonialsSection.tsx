// resources/js/components/TestimonialsSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: "Rohan Sharma",
        role: "Business Owner",
        content: "Saved my entire business data after a ransomware attack. Recovered 100% in 48 hours!",
        rating: 5,
        avatar: "R"
    },
    {
        name: "Priya Patel",
        role: "Student",
        content: "Fixed my laptop screen same day. Super fast and affordable. Highly recommend!",
        rating: 5,
        avatar: "P"
    },
    {
        name: "Amit Kumar",
        role: "IT Manager",
        content: "They manage our entire office network. Zero downtime in 2 years. True professionals.",
        rating: 5,
        avatar: "A"
    },
];

export default function TestimonialsSection() {
    return (
        <section className="py-20 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Trusted by 5000+ Customers
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Real stories from real people
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-900 p-8 rounded-2xl shadow-lg"
                        >
                            <Quote className="absolute top-4 right-4 w-8 h-8 text-[#f53003]/20" />
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(t.rating)].map((_, j) => (
                                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 dark:text-gray-200 mb-6 italic">"{t.content}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f53003] to-pink-600 flex items-center justify-center text-white font-bold">
                                    {t.avatar}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{t.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

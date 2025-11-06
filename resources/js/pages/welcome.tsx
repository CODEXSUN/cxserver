'use client';

import FullScreenSlider from '@/pages/web/slider';
import WebMenu from '@/pages/web/web-menu';
import { Link } from '@inertiajs/react';
import { ArrowRight, Phone } from 'lucide-react';
import ServicesSection from '@/pages/web/home/ServicesSection';
import TestimonialsSection from '@/pages/web/home/TestimonialsSection';

export default function Home() {
    return (
        <>
            <WebMenu/>
            <FullScreenSlider />
            <ServicesSection />
            <TestimonialsSection />

            {/* CTA */}
            <section className="py-20 bg-[#f53003]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Fix Your Tech?
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="tel:+919894644460"
                            className="inline-flex items-center gap-3 bg-white text-[#f53003] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
                        >
                            <Phone className="w-5 h-5" /> Call Now
                        </Link>
                        <Link
                            href="/web-contact"
                            className="inline-flex items-center gap-3 border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-[#f53003] transition"
                        >
                            Book Service <ArrowRight className="w-5 h-5" />
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
                            <p className="text-gray-400">Trusted computer repair since 2015.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Hours</h4>
                            <p className="text-gray-400">Mon-Fri: 9AM-8PM<br />Sat: 10AM-6PM</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <p className="text-gray-400">
                                Electronic City, Bangalore<br />
                                <a href="mailto:support@techmedia.in" className="hover:text-[#f53003]">support@techmedia.in</a>
                            </p>
                        </div>
                    </div>
                    <div className="text-center text-gray-400 text-sm">
                        © {new Date().getFullYear()} Tech media Service Center. All rights reserved.
                    </div>
                </div>
            </footer>
        </>
    );
}

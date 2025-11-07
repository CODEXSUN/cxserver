'use client';

import ServicesSection from '@/pages/web/home/ServicesSection';
import TestimonialsSection from '@/pages/web/home/TestimonialsSection';
import FullScreenSlider from '@/pages/web/slider';
import WebMenu from '@/pages/web/web-menu';
import { Link } from '@inertiajs/react';
import { ArrowRight, Phone } from 'lucide-react';
import FooterSection from '@/pages/web/home/FooterSection';

export default function Home() {

    return (
        <>
            <WebMenu />
            <FullScreenSlider />
            <ServicesSection />
            <TestimonialsSection />

            {/* CTA */}
            <section className="bg-[#f53003] py-20">
                <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
                    <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                        Ready to Fix Your Tech?
                    </h2>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            href="tel:+919894644460"
                            className="inline-flex items-center gap-3 rounded-lg bg-white px-8 py-4 text-lg font-bold text-[#f53003] transition hover:bg-gray-100"
                        >
                            <Phone className="h-5 w-5" /> Call Now
                        </Link>
                        <Link
                            href="/web-contact"
                            className="inline-flex items-center gap-3 rounded-lg border-2 border-white px-8 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-[#f53003]"
                        >
                            Book Service <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            <FooterSection/>

        </>
    );
}

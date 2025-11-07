// resources/js/components/FooterSection.tsx
'use client';

import AppLogoIcon from '@/components/app-logo-icon';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function FooterSection() {
    const currentYear = new Date().getFullYear();

    // Hardcoded data — no Laravel/Inertia needed
    const footer = {
        companyName: 'Tech Media',
        tagline: 'Trusted computer repair center since 2002.',
        address: '436, Avinashi Road, Near CITU Office, Tiruppur, Tamil Nadu 641602',
        email: 'support@techmedia.in',
        phone: '9894244460',
        hours: { monFri: '10AM - 8PM', sat: '10AM - 6PM' },
        social: {
            facebook: 'https://facebook.com/techmedia',
            instagram: 'https://instagram.com/techmedia',
            twitter: 'https://twitter.com/techmedia',
            linkedin: 'https://linkedin.com/company/techmedia',
        },
    };

    const socialLinks = [
        { Icon: Facebook, href: footer.social.facebook, label: 'Facebook' },
        { Icon: Instagram, href: footer.social.instagram, label: 'Instagram' },
        { Icon: Twitter, href: footer.social.twitter, label: 'Twitter' },
        { Icon: Linkedin, href: footer.social.linkedin, label: 'LinkedIn' },
    ].filter(link => link.href);

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer */}
            <div className="mx-auto max-w-11/12 px-6 py-12 lg:px-8">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-white p-1">
                                <AppLogoIcon className="h-7 w-7 fill-gray-900" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">{footer.companyName}</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-400">{footer.tagline}</p>
                    </div>

                    {/* Hours */}
                    <div>
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white">
                            <Clock className="h-4 w-4" />
                            Business Hours
                        </h4>
                        <dl className="space-y-1 text-sm text-gray-400">
                            <div className="flex justify-between">
                                <dt>Mon - Fri</dt>
                                <dd className="font-medium">{footer.hours.monFri}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Saturday</dt>
                                <dd className="font-medium">{footer.hours.sat}</dd>
                            </div>
                        </dl>
                        <div className="mt-3 flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <a href={`tel:${footer.phone}`} className="font-medium text-white hover:text-orange-500 transition-colors">
                                {footer.phone}
                            </a>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white">
                            <MapPin className="h-4 w-4" />
                            Get in Touch
                        </h4>
                        <address className="not-italic text-sm leading-relaxed text-gray-400">
                            {footer.address.split(', ').map((line, i, arr) => (
                                <span key={i} className="block">
                                    {line}
                                    {i < arr.length - 1 && ','}
                                </span>
                            ))}
                        </address>
                        <div className="mt-3">
                            <a
                                href={`mailto:${footer.email}`}
                                className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-orange-500 transition-colors"
                            >
                                <Mail className="h-4 w-4" />
                                {footer.email}
                            </a>
                        </div>
                    </div>

                    {/* Social Large */}
                    <div className="hidden lg:flex lg:flex-col lg:items-end lg:justify-center">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Follow Us</p>
                        <div className="flex gap-2">
                            {socialLinks.map(({ Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="rounded-full bg-gray-800 p-2 text-gray-400 transition-all hover:bg-orange-600 hover:text-white hover:scale-110"
                                >
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-10 border-t border-gray-800 pt-6 text-center">
                    <p className="text-xs text-gray-500">
                        © {currentYear} {footer.companyName}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

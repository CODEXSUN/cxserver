'use client';

import { Link } from '@inertiajs/react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Slide {
    id: number;
    title: string;
    tagline: string;
    action: { text: string; href: string };
    image: string;
}

const slides: Slide[] = [
    {
        id: 1,
        title: 'Your Trusted Computer Repair Partner',
        tagline: 'Fast, reliable & affordable solutions for all devices',
        action: { text: 'Book Service', href: '/contact' },
        image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=600&fit=crop',
    },
    {
        id: 2,
        title: 'Expert Hardware & Software Fixes',
        tagline: 'From virus removal to system upgrades — we do it all',
        action: { text: 'View Services', href: '/services' },
        image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=1200&h=600&fit=crop',
    },
    {
        id: 3,
        title: '24/7 Emergency Support',
        tagline: 'Critical issues? We’re here when you need us most',
        action: { text: 'Call Now', href: 'tel:+1234567890' },
        image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=600&fit=crop',
    },
    {
        id: 4,
        title: 'Data Recovery Specialists',
        tagline: 'Lost files? We recover photos, documents & more safely',
        action: { text: 'Start Recovery', href: '/contact' },
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
    },
    {
        id: 5,
        title: 'Business IT Solutions',
        tagline: 'Managed services, cloud backup & cybersecurity',
        action: { text: 'Talk to Expert', href: '/contact' },
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
    },
];

export default function FullScreenSlider() {
    const [current, setCurrent] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [direction, setDirection] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const animationRef = useRef<number | null>(null);
    const startTime = useRef<number>(0); // Fixed: initialize with 0

    const duration = 5000;

    const next = () => {
        setDirection(1);
        setCurrent((i) => (i + 1) % slides.length);
        setProgress(0);
        startTime.current = performance.now(); // Fixed: set in effect
    };

    const prev = () => {
        setDirection(-1);
        setCurrent((i) => (i - 1 + slides.length) % slides.length);
        setProgress(0);
        startTime.current = performance.now();
    };

    const paginate = (dir: number) => {
        setDirection(dir);
        setCurrent((i) => (i + dir + slides.length) % slides.length);
        setProgress(0);
        startTime.current = performance.now();
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        const shouldNext = info.offset.x < -50 || info.velocity.x < -500;
        const shouldPrev = info.offset.x > 50 || info.velocity.x > 500;
        if (shouldNext) next();
        else if (shouldPrev) prev();
        // Fixed: no unused expression
    };

    useEffect(() => {
        if (!isPlaying) return;
        intervalRef.current = setInterval(next, duration);
        return () => clearInterval(intervalRef.current!);
    }, [isPlaying, current]);

    useEffect(() => {
        if (!isPlaying) return;

        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const elapsed = timestamp - startTime.current;
            const newProgress = Math.min(elapsed / duration, 1);
            setProgress(newProgress);
            if (newProgress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current)
                cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, current]);

    const circumference = 2 * Math.PI * 26;
    const strokeDashoffset = circumference * (1 - progress);

    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 1000 : -1000, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 1000 : -1000, opacity: 0 }),
    };

    return (
        <div className="relative h-screen overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={current}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${slides[current].image})`,
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                    </div>

                    <div className="relative flex h-full items-center">
                        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
                            <div className="max-w-3xl">
                                <motion.h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
                                    {slides[current].title
                                        .split(' ')
                                        .map((w, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: 0.3 + i * 0.1,
                                                }}
                                                className="mr-3 inline-block"
                                            >
                                                {w}
                                            </motion.span>
                                        ))}
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="mb-8 text-xl text-gray-200 md:text-2xl"
                                >
                                    {slides[current].tagline}
                                </motion.p>
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.9 }}
                                >
                                    <Link
                                        href={slides[current].action.href}
                                        className="inline-flex items-center gap-3 rounded-lg bg-[#f53003] px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#d42a00] hover:shadow-xl"
                                    >
                                        {slides[current].action.text}{' '}
                                        <Play className="h-5 w-5" />
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Timer Circle */}
            <div className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2">
                <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    className="rotate-[-90deg]"
                >
                    <circle
                        cx="28"
                        cy="28"
                        r="26"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="3"
                        fill="none"
                    />
                    <motion.circle
                        cx="28"
                        cy="28"
                        r="26"
                        stroke="white"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0, ease: 'linear' }}
                        strokeLinecap="round"
                    />
                </svg>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute inset-0 flex items-center justify-center text-white transition hover:scale-110"
                >
                    {isPlaying ? (
                        <Pause className="h-5 w-5" />
                    ) : (
                        <Play className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Arrows & Bullets */}
            <button
                onClick={prev}
                className="absolute top-1/2 left-6 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/40"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                onClick={next}
                className="absolute top-1/2 right-6 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/40"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 gap-3">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => paginate(i > current ? 1 : -1)}
                        className={`h-3 w-3 rounded-full transition-all ${i === current ? 'w-10 bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                ))}
            </div>
        </div>
    );
}

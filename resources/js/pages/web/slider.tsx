'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface Slide { id: number; title: string; tagline: string; action: { text: string; href: string }; image: string; }

const slides: Slide[] = [
    {
        id: 1,
        title: "Welcome to Modern Web",
        tagline: "Build amazing experiences with Laravel & React",
        action: { text: "Get Started", href: "/register" },
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop"
    },
    {
        id: 2,
        title: "Powerful Full-Stack",
        tagline: "Inertia.js bridges Laravel and React seamlessly",
        action: { text: "Learn More", href: "/about" },
        image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1200&h=600&fit=crop"
    },
    {
        id: 3,
        title: "Deploy with Confidence",
        tagline: "Production-ready apps in minutes",
        action: { text: "Deploy Now", href: "https://cloud.laravel.com" },
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop"
    }
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
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slides[current].image})` }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                    </div>

                    <div className="relative h-full flex items-center">
                        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                            <div className="max-w-3xl">
                                <motion.h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                                    {slides[current].title.split(' ').map((w, i) => (
                                        <motion.span key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="inline-block mr-3">
                                            {w}
                                        </motion.span>
                                    ))}
                                </motion.h1>
                                <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="text-xl md:text-2xl text-gray-200 mb-8">
                                    {slides[current].tagline}
                                </motion.p>
                                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }}>
                                    <Link href={slides[current].action.href} className="inline-flex items-center gap-3 bg-[#f53003] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#d42a00] transition shadow-lg hover:shadow-xl hover:-translate-y-1">
                                        {slides[current].action.text} <Play className="w-5 h-5" />
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Timer Circle */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
                <svg width="56" height="56" viewBox="0 0 56 56" className="rotate-[-90deg]">
                    <circle cx="28" cy="28" r="26" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
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
                        transition={{ duration: 0, ease: "linear" }}
                        strokeLinecap="round"
                    />
                </svg>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute inset-0 flex items-center justify-center text-white hover:scale-110 transition"
                >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
            </div>

            {/* Arrows & Bullets */}
            <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/40 z-10">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={next} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/40 z-10">
                <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => paginate(i > current ? 1 : -1)}
                        className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-white w-10' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                ))}
            </div>
        </div>
    );
}

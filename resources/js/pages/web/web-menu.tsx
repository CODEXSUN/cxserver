'use client';

import { dashboard, login, register } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogIn, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WebMenu() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const { auth, app } = usePage<any>().props;
    const currentUrl = usePage<any>().url;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [darkMode]);

    useEffect(() => {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(
                    anchor.getAttribute('href')!,
                );
                target?.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }, []);

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/abouts' },
        { name: 'Services', href: '/web-services' },
        { name: 'Contact', href: '/web-contacts' },
    ];

    const current = navItems.find((i) => i.href === currentUrl)?.name || '';

    return (
        <>
            <header
                className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-white shadow-md dark:bg-[#0a0a0a]'
                        : 'bg-transparent'
                }`}
            >
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="group flex items-center space-x-2"
                        >
                            <div className="h-10 w-12 rounded-lg bg-[#f53003] transition-transform group-hover:scale-110">
                                <span className="text-white flex justify-center items-center text-center text-2xl w-full">
                                    TM
                                </span>
                            </div>
                            <span
                                className={`text-2xl font-medium transition-colors ${
                                    scrolled || darkMode
                                        ? 'text-[#1b1b18] dark:text-[#EDEDEC]'
                                        : 'text-white'
                                } group-hover:text-[#f53003] dark:group-hover:text-[#FF4433]`}
                            >
                                {app?.name || 'Tech media Service Center'}
                            </span>
                        </Link>

                        {/* Desktop Menu */}
                        <nav className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
                            <ul className="flex space-x-8">
                                {navItems.map((item) => {
                                    const active = current === item.name;
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={`group relative overflow-hidden pb-1 font-medium transition-all duration-200 ${
                                                    scrolled || darkMode
                                                        ? 'text-[#1b1b18] dark:text-[#EDEDEC]'
                                                        : 'text-white'
                                                }`}
                                            >
                                                <span className="relative z-10">
                                                    {item.name}
                                                </span>
                                                <span
                                                    className={`absolute right-0 bottom-0 left-0 h-0.5 transform bg-[#f53003] transition-transform duration-300 ${
                                                        active
                                                            ? 'scale-x-100'
                                                            : 'scale-x-0 group-hover:scale-x-100'
                                                    }`}
                                                ></span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {/* Right: Auth + Theme */}
                        <div className="hidden items-center space-x-4 md:flex">
                            {auth?.user ? (
                                <Link
                                    href={dashboard()}
                                    className={`group flex items-center space-x-1 font-medium transition-all duration-200 ${
                                        scrolled || darkMode
                                            ? 'text-[#1b1b18] dark:text-[#EDEDEC]'
                                            : 'text-white'
                                    } hover:text-[#f53003] dark:hover:text-[#FF4433]`}
                                >
                                    <LayoutDashboard className="h-4 w-4 transition-transform group-hover:scale-110" />
                                    <span>Dashboard</span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className={`group font-medium transition-all duration-200 ${
                                            scrolled || darkMode
                                                ? 'text-[#1b1b18] dark:text-[#EDEDEC]'
                                                : 'text-white'
                                        } hover:text-[#f53003] dark:hover:text-[#FF4433]`}
                                    >
                                        <LogIn className="mr-1 inline h-4 w-4 transition-transform group-hover:scale-110" />
                                        Log in
                                    </Link>
                                    {/*<Link*/}
                                    {/*    href={register()}*/}
                                    {/*    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm font-medium transition-all duration-200 hover:border-[#f53003] hover:bg-[#f53003] hover:text-white dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#FF4433] dark:hover:bg-[#FF4433] dark:hover:text-white"*/}
                                    {/*>*/}
                                    {/*    Register*/}
                                    {/*</Link>*/}
                                </>
                            )}
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`group rounded-full p-2 transition-all duration-200 ${
                                    scrolled || darkMode
                                        ? 'text-[#1b1b18] dark:text-[#EDEDEC]'
                                        : 'text-white'
                                } hover:bg-gray-200 dark:hover:bg-gray-800`}
                            >
                                {darkMode ? (
                                    <Sun className="h-5 w-5 transition-transform group-hover:rotate-180" />
                                ) : (
                                    <Moon className="h-5 w-5 transition-transform group-hover:-rotate-12" />
                                )}
                            </button>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileMenu(!mobileMenu)}
                            className={`p-1 transition-transform duration-200 md:hidden ${
                                scrolled || darkMode
                                    ? 'text-[#1b1b18] dark:text-[#EDEDEC]'
                                    : 'text-white'
                            } hover:scale-110`}
                        >
                            {mobileMenu ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenu && (
                        <div className="animate-in border-t bg-white duration-300 slide-in-from-top-2 md:hidden dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                            <nav className="space-y-1 px-4 py-3">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`block rounded-md px-3 py-2 transition-all duration-200 ${
                                            current === item.name
                                                ? 'bg-[#f53003] font-semibold text-white'
                                                : 'text-[#1b1b18] hover:bg-gray-100 dark:text-[#EDEDEC] dark:hover:bg-gray-800'
                                        }`}
                                        onClick={() => setMobileMenu(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="space-y-1 border-t pt-3 dark:border-[#3E3E3A]">
                                    {auth?.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="flex items-center rounded-md px-3 py-2 text-[#1b1b18] hover:bg-gray-100 dark:text-[#EDEDEC] dark:hover:bg-gray-800"
                                        >
                                            <LayoutDashboard className="mr-2 h-4 w-4" />{' '}
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={login()}
                                                className="flex items-center rounded-md px-3 py-2 text-[#1b1b18] hover:bg-gray-100 dark:text-[#EDEDEC] dark:hover:bg-gray-800"
                                            >
                                                <LogIn className="mr-2 h-4 w-4" />{' '}
                                                Log in
                                            </Link>
                                            <Link
                                                href={register()}
                                                className="block rounded-md px-3 py-2 text-[#1b1b18] hover:bg-gray-100 dark:text-[#EDEDEC] dark:hover:bg-gray-800"
                                            >
                                                Register
                                            </Link>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setDarkMode(!darkMode)}
                                        className="flex w-full items-center rounded-md px-3 py-2 text-[#1b1b18] transition-all hover:bg-gray-100 dark:text-[#EDEDEC] dark:hover:bg-gray-800"
                                    >
                                        {darkMode ? (
                                            <Sun className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Moon className="mr-2 h-4 w-4" />
                                        )}
                                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                                    </button>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { mainNavLinks } from "lib/navigation";
import useRequireEmailVerified from "lib/hooks/useRequireEmailVerified";

export default function AuthenticatedLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    useRequireEmailVerified();

    return (
        <div className="w-full flex flex-col justify-start items-start box-border">
            <nav className="navbar bg-base-100 shadow px-6">
                <div className="navbar-start">
                    <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/images/of_coursly.png"
                        alt="OfCoursly Logo"
                        width={48}
                        height={48}
                        className="cursor-pointer"
                    />
                    </Link>

                    <div className="hidden lg:flex">
                        <ul className="menu menu-horizontal px-1">
                            {mainNavLinks.map((link, index) => (
                                <li key={`desktop-${link.name}-${index}`}>
                                    <Link href={link.href} className="btn btn-ghost">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                
                    <div className="lg:hidden">
                        <div className="dropdown">
                            <label tabIndex={0} className="btn btn-ghost lg:hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </label>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                {mainNavLinks.map((link, index) => (
                                    <li key={`mobile-${link.name}-${index}`}>
                                        <Link href={link.href}>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="navbar-end gap-2">
                    <button className="btn btn-ghost btn-circle">
                    <div className="indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="badge badge-xs badge-primary indicator-item"></span>
                    </div>
                    </button>
                    <div className="avatar">
                    <div className="w-10 rounded-full">
                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                    </div>
                    <div className="hidden sm:flex font-semibold">
                    Robert Popa
                    </div>
                </div>
            </nav>
            <main className="w-full flex flex-col px-6 py-4 bg min-h-screen">
                {children}
            </main>
        </div>
        
    )
  }
  
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Navbar = () => {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const isHomeActive =
        location.pathname === "/" ||
        location.pathname === "/recommendedjobs";


    return (
        <div className="w-full bg-white shadow font-medium">
            <div className="flex items-center justify-between py-5 px-6 md:px-10">

                {/* Logo */}
                <NavLink to="/" className="text-3xl font-bold text-blue-600">
                    JobWise
                </NavLink>

                {/* Desktop Menu */}
                <ul className="hidden md:flex gap-10 text-gray-700">

                    {/* Home */}
                    <NavLink
                        to="/"
                        className="flex flex-col items-center gap-1 group"
                    >
                        {() => (
                            <>
                                <p className="transition duration-200 group-hover:-translate-y-0.5">
                                    Jobs Recommender
                                </p>
                                <hr
                                    className={`w-2/4 h-[1.5px] bg-blue-600 border-none ${isHomeActive ? "block" : "hidden group-hover:block"
                                        }`}
                                />
                            </>
                        )}
                    </NavLink>

                    <NavLink
                        to="/joblistings"
                        className="flex flex-col items-center gap-1 group"
                    >
                        {({ isActive }) => (
                            <>
                                <p className="transition duration-200 group-hover:-translate-y-0.5">
                                    All Job Listings
                                </p>
                                <hr
                                    className={`w-2/4 h-[1.5px] bg-blue-600 border-none ${isActive ? "block" : "hidden group-hover:block"
                                        }`}
                                />
                            </>
                        )}
                    </NavLink>
                </ul>

                {/* Hamburger Button (Mobile) */}
                <button
                    className="md:hidden text-3xl text-gray-700"
                    onClick={() => setOpen(true)}
                >
                    ☰
                </button>
            </div>

            {/* Drawer Background Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-opacity-40 z-30"
                    onClick={() => setOpen(false)}
                ></div>
            )}

            {/* Sliding Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-blue-100 shadow-xl z-40 transform transition-transform duration-300 
    ${open ? "translate-x-0" : "translate-x-full"} rounded-l-2xl`}
            >
                {/* Drawer Header */}
                <div className="flex justify-between items-center p-5 border-b bg-blue-100 rounded-tl-2xl">
                    <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
                    <button
                        className="text-3xl text-gray-700 hover:text-blue-600 transition"
                        onClick={() => setOpen(false)}
                    >
                        ×
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className="flex flex-col p-5 text-gray-800 gap-4 text-lg">
                    <NavLink
                        to="/"
                        className="px-2 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                        onClick={() => setOpen(false)}
                    >
                        Jobs Recommender
                    </NavLink>

                    <NavLink
                        to="/joblistings"
                        className="px-2 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                        onClick={() => setOpen(false)}
                    >
                        All Job Listings
                    </NavLink>
                </div>
            </div>
        </div >
    );
};

export default Navbar;

import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4 text-center">
            <h1 className="text-6xl font-extrabold text-blue-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
                Oops! The page you are looking for does not exist.
            </p>
            <Link
                to="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFound;

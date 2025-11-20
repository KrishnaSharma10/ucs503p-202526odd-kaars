import React from "react";
import { MapPin, Building2, Star } from "lucide-react";

const JobCard = ({ job }) => {
    const { job_title, company, location, skills, reason, score, apply_link } = job;

    return (
        <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col h-full">
            
            {/* Job Title and Company */}
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{job_title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Building2 className="w-4 h-4" />
                    <span>{company}</span>
                </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                </div>
            </div>

            {/* Score */}
            {score !== undefined && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 mb-3">
                    <Star className="w-4 h-4 fill-yellow-600" />
                    <span className="font-semibold">Match Score: {score}%</span>
                </div>
            )}

            {/* Reason */}
            {reason && (
                <p className="text-sm text-gray-600 mb-3">
                    <strong>Match Reason:</strong> {reason}
                </p>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {skills.slice(0, 6).map((skill, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                        >
                            {skill}
                        </span>
                    ))}
                    {skills.length > 6 && (
                        <span className="px-2 py-1 text-xs font-medium text-gray-500">
                            +{skills.length - 6} more
                        </span>
                    )}
                </div>
            )}

            {/* Apply Button */}
            {apply_link ? (
                <a 
                    href={apply_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-auto"
                >
                    <button className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors">
                        Apply Now
                    </button>
                </a>
            ) : (
                <button className="w-full py-2 rounded-lg bg-gray-400 text-white font-semibold mt-auto" disabled>
                    No Link Available
                </button>
            )}
        </div>
    );
};

export default JobCard;

import React, { useState } from "react";
import { Upload, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const HeroSection = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
        } else {
            alert("❌ Please upload a PDF file only.");
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Step 1: Upload resume and get skills
            const skillRes = await fetch(`${API_BASE_URL}/upload_resume`, {
                method: "POST",
                body: formData,
            });

            if (!skillRes.ok) {
                const errorData = await skillRes.json();
                throw new Error(errorData.detail || "Failed to upload resume");
            }

            const skillData = await skillRes.json();
            console.log("Skills received:", skillData.skills);

            if (!skillData.skills || skillData.skills.length === 0) {
                alert("❌ No skills found in your resume. Please try a different file.");
                return;
            }

            // Step 2: Send skills to match_jobs
            // ✅ FIX: Wrap in object with "skills" key
            const matchRes = await fetch(`${API_BASE_URL}/match_jobs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skills: skillData.skills }), // ✅ FIXED!
            });

            if (!matchRes.ok) {
                const errorData = await matchRes.json();
                throw new Error(errorData.detail || "Failed to match jobs");
            }

            const jobs = await matchRes.json();
            console.log("Jobs received:", jobs);

            // ✅ Defensive check: ensure it's an array
            if (!Array.isArray(jobs)) {
                console.error("Expected array but got:", jobs);
                alert("❌ Unexpected response format from server");
                return;
            }

            if (jobs.length === 0) {
                alert("⚠️ No matching jobs found. Try updating your resume with more skills.");
                return;
            }

            // Store and navigate
            sessionStorage.setItem("recommendedJobs", JSON.stringify(jobs));
            navigate("/recommendedjobs");

        } catch (err) {
            console.error("Upload error:", err);
            alert(`❌ Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-20 bg-blue-100 text-black">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-bold">Land Your First Job</h1>
                        <p className="text-xl text-gray-600">
                            Upload your resume and discover entry-level positions matched to your skills and experience
                        </p>
                    </div>

                    <div className="bg-white">
                        <div className="p-8 shadow-xl bg-white/10 backdrop-blur-md border border-blue-300 rounded-2xl">
                            <div className="space-y-6">
                                <div className="border-2 border-dashed border-blue-300 rounded-lg p-12 hover:border-blue-500 transition-colors cursor-pointer">
                                    <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                        {file ? (
                                            <>
                                                <FileText className="h-12 w-12 text-black" />
                                                <div className="text-center">
                                                    <p className="font-medium text-black">{file.name}</p>
                                                    <p className="text-sm text-gray-600">Click to change</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-12 w-12 text-black" />
                                                <div className="text-center">
                                                    <p className="font-medium text-black">Drop your resume here</p>
                                                </div>
                                            </>
                                        )}
                                    </label>
                                    <input
                                        id="resume-upload"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={!file || loading}
                                    className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
                                        file && !loading
                                            ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                                            : "bg-blue-400 cursor-not-allowed"
                                    }`}
                                >
                                    {loading ? "Analyzing..." : "Analyze My Resume & Find Jobs"}
                                </button>

                                <p className="text-xs text-gray-500 text-center">
                                    We'll score your resume and match you with the best entry-level opportunities
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;

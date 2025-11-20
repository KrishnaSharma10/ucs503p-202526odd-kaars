import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import JobGrid from "../components/JobGrid";

const AllJobListings = () => {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        Papa.parse("/jobs.csv", {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const cleaned = result.data.map(job => ({
                    ...job,
                    skills: typeof job.skills === "string"
                        ? job.skills.split(",").map(s => s.trim())
                        : []
                }));

                setJobs(cleaned);
            }
        });

    }, []);

    console.log(jobs)
    return (
        <div>
            <JobGrid jobs={jobs} />
        </div>
    );
};

export default AllJobListings;

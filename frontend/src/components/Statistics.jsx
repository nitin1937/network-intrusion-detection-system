import { useEffect, useState } from "react";
import StatsCard from "./StatsCard";
import API from "../services/api";

function Statistics() {

    const [stats, setStats] = useState({
        total: 0,
        latest: "-",
        confidence: 0
    });

    useEffect(() => {

        API.get("/logs")
            .then((response) => {

                const logs = response.data;

                let avg = 0;

                logs.forEach(log => {
                    avg += log[2];
                });

                avg = logs.length ? (avg / logs.length).toFixed(2) : 0;

                setStats({
                    total: logs.length,
                    latest: logs.length ? logs[0][1] : "-",
                    confidence: avg
                });

            });

    }, []);

    return (

        <div
            style={{
                display:"flex",
                gap:"20px",
                justifyContent:"center",
                flexWrap:"wrap",
                marginTop:"20px"
            }}
        >

            <StatsCard
                title="Total Attacks"
                value={stats.total}
                color="#dc2626"
            />

            <StatsCard
                title="Latest Attack"
                value={stats.latest}
                color="#0ea5e9"
            />

            <StatsCard
                title="Average Confidence"
                value={stats.confidence}
                color="#16a34a"
            />

        </div>

    );

}

export default Statistics;
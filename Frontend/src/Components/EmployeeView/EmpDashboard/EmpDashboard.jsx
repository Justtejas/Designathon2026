import React, { useEffect, useMemo, useState } from "react";
import EmployeeHeader from "../EmployeeHeader";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Filler,
    Tooltip,
    Legend,

} from "chart.js";
import { jwtToken } from "../../Utils/utils";
import axiosInstance from "../../Utils/api";
import moment from "moment";
import Footer from "../../LandingPage/Footer";

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Filler,
    Tooltip,
    Legend,
);

const CircularGauge = ({ value = 0, label }) => {
    const percentage = Math.min(value * 10, 100);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6
      flex flex-col items-center transition hover:-translate-y-1">
            <div className="relative w-28 h-28">
                <svg viewBox="0 0 36 36" className="-rotate-90">
                    <path
                        d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3.5"
                    />
                    <path
                        d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#F87060"
                        strokeWidth="3.5"
                        strokeDasharray={`${percentage},100`}
                        strokeLinecap="round"
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center
          text-xl font-bold text-indigo-900 dark:text-white">
                    {value}
                </span>
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {label}
            </p>
        </div>
    );
};

const EmpDashboard = () => {
    const [assets, setAssets] = useState([]);
    const [assetReqData, setAssetReqData] = useState([]);
    const [serviceReqData, setServiceReqData] = useState([]);
    const [requestsCount, setRequestsCount] = useState(0);
    const [returnedCount, setReturnedCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

    const extractSettledData = (result) => {
        if (result.status === "fulfilled") {
            const res = result.value;
            if (Array.isArray(res?.data)) return res.data;
            if (Array.isArray(res?.data?.data)) return res.data.data;
        }
        return []; // rejected or unexpected shape
    };
    useEffect(() => {
        const decoded = jwtToken();
        if (!decoded?.userId) return;

        const userId = decoded.userId;

        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const results = await Promise.allSettled([
                    axiosInstance.get(`/AssetAllocations/user/${userId}`),
                    axiosInstance.get(`/AssetRequests`),
                    axiosInstance.get(`/ServiceRequests`),
                    axiosInstance.get(`/ReturnRequests`),
                ]);

                const [
                    assetAllocRes,
                    assetReqRes,
                    serviceReqRes,
                    returnReqRes,
                ] = results;
                console.log(assetAllocRes)
                const myAssets = extractSettledData(assetAllocRes);
                const assetRequests = extractSettledData(assetReqRes);
                const serviceRequests = extractSettledData(serviceReqRes);
                const returnRequests = extractSettledData(returnReqRes);

                const assetReq = assetRequests.filter(r => r.userId === userId);
                const serviceReq = serviceRequests.filter(r => r.userId === userId);
                const returns = returnRequests.filter(
                    r => r.userId === userId && r.returnStatus === 2
                );

                setAssets(myAssets);
                setReturnedCount(returns.length);
                setRequestsCount(assetReq.length + serviceReq.length + returns.length);
                setAssetReqData(groupByWeek(assetReq));
                setServiceReqData(groupByWeek(serviceReq));

            } catch (err) {
                console.error("Dashboard API Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);
    const groupByWeek = (data = []) => {
        const weeks = Array(5).fill(0);
        data.forEach(item => {
            const diff =
                moment(item.requestDate).week() -
                moment().startOf("month").week();
            if (diff >= 0 && diff < 5) weeks[diff]++;
        });
        return weeks;
    };

    const chartData = useMemo(
        () => ({
            labels: weekLabels,
            datasets: [
                {
                    label: "Asset Requests",
                    data: assetReqData,
                    borderColor: "#F87060",
                    backgroundColor: "rgba(248,112,96,0.25)",
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: "Service Requests",
                    data: serviceReqData,
                    borderColor: "#1E3A8A",
                    backgroundColor: "rgba(59,130,246,0.25)",
                    fill: true,
                    tension: 0.4,
                },
            ],
        }),
        [assetReqData, serviceReqData]
    );

    return (
        <div className="min-h-screen flex flex-col
    bg-gradient-to-br from-gray-100 to-indigo-100
    dark:from-gray-950 dark:to-gray-900">

            <EmployeeHeader />

            <main className="flex-grow">
                {loading ? (
                    <div className="flex justify-center items-center h-full text-xl">
                        Loading dashboard...
                    </div>
                ) : (
                    <>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <CircularGauge value={assets.length} label="Assets Possessed" />
                            <CircularGauge value={requestsCount} label="Requests Raised" />
                            <CircularGauge value={returnedCount} label="Assets Returned" />
                        </div>

                        <div className="p-6 flex flex-col lg:flex-row gap-6">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full lg:w-1/2">
                                <h2 className="text-xl font-bold text-indigo-900 dark:text-white mb-4">
                                    My Assets
                                </h2>

                                {assets.length === 0 ? (
                                    <p className="text-gray-500 text-center">
                                        No assets allocated.
                                    </p>
                                ) : (
                                    <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                                        <thead className="bg-indigo-900 text-white">
                                            <tr>
                                                {["Name", "Type", "Value", "Model", "Allocated"].map(h => (
                                                    <th key={h} className="p-3 text-center">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assets.map((a, i) => (
                                                <tr
                                                    key={i}
                                                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <td className="p-2 text-center">{a.assetName}</td>
                                                    <td className="p-2 text-center">{a.categoryName}</td>
                                                    <td className="p-2 text-center">{a.Value}</td>
                                                    <td className="p-2 text-center">{a.Model}</td>
                                                    <td className="p-2 text-center">
                                                        {new Date(a.allocatedDate).toDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full lg:w-1/2">
                                <h2 className="text-xl font-bold text-indigo-900 dark:text-white mb-4 text-center">
                                    Requests Overview
                                </h2>
                                <div className="h-72">
                                    <Line data={chartData} />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default EmpDashboard;
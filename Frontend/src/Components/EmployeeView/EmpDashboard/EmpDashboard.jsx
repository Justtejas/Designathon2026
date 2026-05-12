import React, { useEffect, useState } from 'react';
import Header from './Header';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js';
import { jwtToken } from '../../Utils/utils';
import Cookies from 'js-cookie';
import axios from 'axios';
import moment from 'moment';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler);

const token = Cookies.get('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const CircularGauge = ({ value, label }) => {
    const percentage = Math.min(value * 10, 100);

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:-translate-y-1 transition-all">
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
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-indigo-900">
                    {value}
                </span>
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-700 tracking-wide">
                {label}
            </p>
        </div>
    );
};

const EmpDashboard = () => {
    const [assetTableData, setAssetTableData] = useState([]);
    const [requestsCount, setRequestsCount] = useState(0);
    const [returnedAssetsCount, setReturnedAssetsCount] = useState(0);
    const [assetRequestsData, setAssetRequestsData] = useState([]);
    const [serviceRequestsData, setServiceRequestsData] = useState([]);

    const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

    useEffect(() => {
        const decoded = jwtToken();
        if (!decoded) return;

        const userId = decoded.userId;

        const fetchData = async () => {
            //const assetRes = await axios.get(`http://localhost:7287/api/AssetAllocations/user/${userId}`);
            //setAssetTableData(assetRes.data || []);

            const assetReq = await axios.get(`http://localhost:7287/api/AssetRequests`);
            console.log(assetReq)
            const serviceReq = await axios.get(`http://localhost:7287/api/ServiceRequests`);
            const returnReq = await axios.get(`http://localhost:7287/api/ReturnRequests`);

            const assets = assetReq.data.filter(x => x.userId === userId);
            const services = serviceReq.data.filter(x => x.userId === userId);
            const returns = returnReq.data.filter(x => x.userId === userId && x.returnStatus === 2);

            setReturnedAssetsCount(returns.length);
            setRequestsCount(assets.length + services.length + returns.length);
            setAssetRequestsData(groupByWeek(assets));
            setServiceRequestsData(groupByWeek(services));
        };

        fetchData();
    }, []);

    const groupByWeek = requests => {
        const weeks = [0, 0, 0, 0, 0];
        requests.forEach(r => {
            const w = moment(r.requestDate).week() - moment().startOf('month').week();
            if (w >= 0 && w < 5) weeks[w]++;
        });
        return weeks;
    };

    const chartData = {
        labels: weekLabels,
        datasets: [
            {
                label: 'Asset Requests',
                data: assetRequestsData,
                borderColor: '#F87060',
                backgroundColor: 'rgba(248,112,96,0.25)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Service Requests',
                data: serviceRequestsData,
                borderColor: '#1E3A8A',
                backgroundColor: 'rgba(59,130,246,0.25)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-indigo-100">
            <Header />

            {/* Gauges */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <CircularGauge value={assetTableData.length} label="Assets Possessed" />
                <CircularGauge value={requestsCount} label="Requests Raised" />
                <CircularGauge value={returnedAssetsCount} label="Assets Returned" />
            </div>

            {/* Main Content */}
            <div className="p-6 flex flex-col lg:flex-row gap-6">
                {/* Assets Table */}
                <div className="bg-white rounded-2xl shadow-lg p-6 w-full lg:w-1/2">
                    <h2 className="text-xl font-bold text-indigo-900 mb-4">
                        My Assets
                    </h2>
                    <table className="w-full text-sm text-gray-700">
                        <thead className="bg-indigo-900 text-white">
                            <tr>
                                {['Name', 'Type', 'Value', 'Model', 'Allocated'].map(h => (
                                    <th key={h} className="p-3 text-center">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {assetTableData.map((a, i) => (
                                <tr
                                    key={i}
                                    className="border-b hover:bg-gray-50 transition"
                                >
                                    <td className="p-2 text-center">{a.assetName}</td>
                                    <td className="p-2 text-center">{a.categoryName}</td>
                                    <td className="p-2 text-center">{a.value}</td>
                                    <td className="p-2 text-center">{a.Model}</td>
                                    <td className="p-2 text-center">
                                        {new Date(a.allocatedDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6 w-full lg:w-1/2">
                    <h2 className="text-xl font-bold text-indigo-900 mb-4 text-center">
                        Requests Overview
                    </h2>
                    <div className="h-72">
                        <Line data={chartData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmpDashboard;


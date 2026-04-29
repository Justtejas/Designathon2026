import React, { useEffect, useState } from 'react';
import Header from './Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js';
import { color } from 'chart.js/helpers';
import { jwtDecode } from "jwt-decode";
import { jwtToken } from '../../Utils/utils';
import Cookies from 'js-cookie';
import axios from 'axios';
import moment from 'moment';
import Chart from 'chart.js/auto';

const token = Cookies.get('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler);

// Circular Gauge Component
const CircularGauge = ({ percentage, label }) => {
    return (
        <div className="bg-white dark-mode:bg-light-black p-7 shadow-md rounded-lg flex flex-col items-center w-3/4">
            <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="circular-chart">
                    <path
                        className="circle-bg"
                        d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#eee"
                        strokeWidth="3.8"
                    />
                    <svg width="36" height="36">
                        {/* Base path (remaining part) */}
                        <path
                            className="circle-bg"
                            d="M18 2.0845
       a 15.9155 15.9155 0 0 1 0 31.831
       a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#102542" /* Color for remaining part */
                            strokeWidth="3.8"
                        />
                        {/* Foreground path (completed part) */}
                        <path
                            className="circle"
                            strokeDasharray={`${percentage}, 100`}
                            d="M18 2.0845
       a 15.9155 15.9155 0 0 1 0 31.831
       a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#F87060" /* Color for completed part */
                            strokeWidth="3.8"
                            strokeDashoffset="0" /* Start at the top */
                        />
                    </svg>

                    <text
                        x="18"
                        y="20.35"
                        className="percentage"
                        textAnchor="middle"
                        fill="#F87060"
                        fontSize="8"
                    >{`${percentage}`}</text>
                </svg>
            </div>
            <p className="mt-4 text-lg">{label}</p>
        </div>
    );
};

const EmpDashboard = () => {

    const [assetTableData, setAssetTableData] = useState([]);
    const [requestsCount, setRequestsCount] = useState(0);
    const [returnRequests, setReturnRequests] = useState([]);
    const [returnedAssetsCount, setReturnedAssetsCount] = useState(0);
    const [assetRequestsData, setAssetRequestsData] = useState([]);
    const [serviceRequestsData, setServiceRequestsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clickedYValue, setClickedYValue] = useState(null);

    // Week labels for the current month
    const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

    useEffect(() => {
        const decoded = jwtToken();
        if (!decoded) {
            console.error("No valid Token found");
            return;
        }

        // Extract the userId from the 'nameid' field
        const userId = decoded.nameid;
        const fetchData = async () => {
            const decodedToken = jwtToken();
            if (!decodedToken) {
                console.error("No valid Token found");
                return;
            }

            setLoading(true);
            setError(null);

            // Separate try-catch blocks for each request
            try {
                const response = await axios.get(`https://localhost:7287/api/AssetAllocations/user/${userId}`);
                const assetAllocations = Array.isArray(response.data.$values) ? response.data.$values : response.data;
                setAssetTableData(assetAllocations);
                console.log("Asset Allocations:", assetAllocations);
            } catch (error) {
                console.error("Error fetching Asset Allocations:", error.response ? error.response.data : error.message);
                setError("Failed to load asset allocations.");
            }

            let serviceRequests = [];
            try {
                const serviceResponse = await axios.get(`https://localhost:7287/api/ServiceRequests`);
                const allServiceRequests = Array.isArray(serviceResponse.data.$values) ? serviceResponse.data.$values : serviceResponse.data;
                serviceRequests = allServiceRequests.filter(request => request.userId === parseInt(userId));
                setServiceRequestsData(groupRequestsByWeek(serviceRequests));
            } catch (error) {
                console.error("Error fetching Service Requests:", error.response ? error.response.data : error.message);
                setError("Failed to load service requests.");
            }

            let returnRequests = [];
            try {
                const returnResponse = await axios.get(`https://localhost:7287/api/ReturnRequests`);
                const allReturnRequests = Array.isArray(returnResponse.data.$values) ? returnResponse.data.$values : returnResponse.data;
                returnRequests = allReturnRequests.filter(request => request.userId === parseInt(userId));
                setReturnRequests(returnRequests);
                setReturnedAssetsCount(returnRequests.length);
            } catch (error) {
                console.error("Error fetching Return Requests:", error.response ? error.response.data : error.message);
                setError("Failed to load return requests.");
            }

            let assetRequests = [];
            try {
                const assetRequestsResponse = await axios.get(`https://localhost:7287/api/AssetRequests`);
                const allAssetRequests = Array.isArray(assetRequestsResponse.data.$values) ? assetRequestsResponse.data.$values : assetRequestsResponse.data;
                assetRequests = allAssetRequests.filter(request => request.userId === parseInt(userId));
                setAssetRequestsData(groupRequestsByWeek(assetRequests));
            } catch (error) {
                console.error("Error fetching Asset Requests:", error.response ? error.response.data : error.message);
                setError("Failed to load asset requests.");
            }

            // Calculate and update requests count
            const totalRequests = serviceRequests.length + returnRequests.length + assetRequests.length;
            setRequestsCount(totalRequests);
            console.log("Total Requests Raised:", totalRequests);

            setLoading(false);
        };
        fetchData();
        // // Ensure fetchData can access userId
        // const fetchData = async () => {
        //     const decodedToken = jwtToken();
        //     if (!decodedToken) {
        //         console.error("No valid Token found");
        //         return;
        //     }
        //     try {
        //         const response = await axios.get(`https://localhost:7287/api/AssetAllocations/user/${userId}`);
        //         console.log("Fetched Data:", response.data);

        //         // Check if data is directly an array or inside a $values property
        //         const assetAllocations = Array.isArray(response.data.$values) ? response.data.$values : response.data;

        //         if (Array.isArray(assetAllocations)) {
        //             setAssetTableData(assetAllocations);
        //             console.log("Asset Allocations:", assetAllocations);
        //         } else {
        //             console.error("Expected an array for asset allocations", response.data);
        //         }
        //         // Fetch all Service Requests
        //         const serviceResponse = await axios.get(`https://localhost:7287/api/ServiceRequests`);

        //         const allServiceRequests = Array.isArray(serviceResponse.data.$values) ? serviceResponse.data.$values : serviceResponse.data;
        //         // Filter Service Requests by userId
        //         const serviceRequests = allServiceRequests.filter(request => request.userId === parseInt(userId));

        //         // Fetch all Return Requests
        //         const returnResponse = await axios.get(`https://localhost:7287/api/ReturnRequests`);
        //         const allReturnRequests = Array.isArray(returnResponse.data.$values) ? returnResponse.data.$values : returnResponse.data;
        //         // Filter Return Requests by userId
        //         const returnRequests = allReturnRequests.filter(request => request.userId === parseInt(userId));

        //         const assetRequestsResponse = await axios.get(`https://localhost:7287/api/AssetRequests`);

        //         const allAssetRequests = Array.isArray(assetRequestsResponse.data.$values) ? assetRequestsResponse.data.$values : assetRequestsResponse.data;
        //         const assetRequests = allAssetRequests.filter(request => request.userId === parseInt(userId));

        //         // Group requests by weeks (for asset and service requests)
        //         const assetRequestsPerWeek = groupRequestsByWeek(assetRequests);
        //         const serviceRequestsPerWeek = groupRequestsByWeek(serviceRequests);

        //         // Update state with calculated weekly data
        //         setAssetRequestsData(assetRequestsPerWeek);
        //         setServiceRequestsData(serviceRequestsPerWeek);

        //         // Sum the total number of requests raised by the user
        //         const totalRequests = serviceRequests.length + returnRequests.length + assetRequests.length;
        //         setRequestsCount(totalRequests);
        //         console.log("Total Requests Raised:", totalRequests);


        //     } catch (error) {
        //         console.error(error.response ? error.response.data : error.message);

        //     }
        // };

        // fetchData();
        // }
    }, []); // Add userId as a dependency if necessary

    const assetCount = assetTableData.length;

    const groupRequestsByWeek = (requests) => {
        const weeks = [0, 0, 0, 0, 0]; // Assuming there are 5 weeks in a month

        requests.forEach(request => {
            const requestDate = moment(request.requestDate); // Replace 'requestDate' with the actual date field
            const weekNumber = requestDate.week() - moment().startOf('month').week() + 1;

            if (weekNumber >= 1 && weekNumber <= 5) {
                weeks[weekNumber - 1] += 1; // Count the request for the corresponding week
            }
        });

        return weeks;
    };

    useEffect(() => {
        const fetchReturnRequests = async () => {
            try {
                const response = await axios.get('https://localhost:7287/api/ReturnRequests');

                // Make sure the data is valid JSON
                const data = Array.isArray(response.data.$values) ? response.data.$values : response.data;

                // Check if data is valid before setting it
                if (data) {
                    setReturnRequests(data);
                    calculateReturnedAssets(data); // Calculate returned assets after fetching
                } else {
                    console.error('No valid data found for return requests');
                }

            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.error('Unauthorized: You are not logged in or your session has expired');
                    // You can also handle redirection to login here if necessary
                } else {
                    console.error('Error fetching return requests:', error.message);
                }
            }
        };

        fetchReturnRequests();
    }, []);


    // Step 2: Count returned assets
    const calculateReturnedAssets = (requests) => {
        const count = requests.filter(request => request.returnStatus === 2).length;
        setReturnedAssetsCount(count);

    };


    // Chart data configuration
    const chartData = {
        labels: weekLabels,
        datasets: [
            {
                label: 'Asset Requests',
                data: assetRequestsData,
                borderColor: '#F87060',
                backgroundColor: 'rgba(248, 112, 96, 0.2)',
                fill: true,
                tension: 0.1, // Smooth curve
            },
            {
                label: 'Service Requests',
                data: serviceRequestsData,
                borderColor: '#102542',
                backgroundColor: 'rgba(178, 202, 252, 0.8)',
                fill: true,
                tension: 0.1, // Smooth curve
            },
        ],
    };



    // Chart options
    const options = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Weeks',
                    color: '#F87060',
                },
                ticks: {
                    color: '#102542',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Requests',
                    color: '#F87060',
                },
                ticks: {
                    color: '#102542',
                    stepSize: 1,
                },
                beginAtZero: true,
                min: 0,
                max: 8,
            },
        },
        onClick: (event) => {
            const chart = Chart.getChart(event.chart);
            const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
            if (elements.length) {
                const index = elements[0].index;
                const yValue = chart.data.datasets[elements[0].datasetIndex].data[index];
                setClickedYValue(yValue); // Update the clicked Y value
                console.log("Clicked Y Value:", yValue);
            }
        },

    };



    return (

        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="p-6 bg-white dark-mode:bg-black">
                {/* Gauges Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-indigo-950 ">
                    <CircularGauge percentage={assetCount} label="Assets Possessed" />
                    <CircularGauge percentage={requestsCount} label="Requests Raised" />
                    <CircularGauge percentage={returnedAssetsCount} label="Assets Returned" />
                </div>
            </div>
            <div className="bg-white p-6 shadow-md rounded-lg">
                <div className="flex justify-between ">

                    {/* Asset Table Section */}
                    <div className="bg-white dark-mode:bg-light-black p-6 shadow-md rounded-lg w-1/2 mr-6">
                        <div className="flex justify-center items-center mb-4">
                            <h2 className="text-xl font-bold text-red-400">My</h2>
                            <h2 className="text-xl font-bold text-indigo-950 ml-2">Assets</h2>
                        </div>
                        <table className="min-w-full bg-white border-collapse text-indigo-950">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Asset Name</th>
                                    <th className="py-2 px-4 border-b">Asset Type</th>
                                    <th className="py-2 px-4 border-b">Asset Value</th>
                                    <th className="py-2 px-4 border-b">Asset Model</th>
                                    <th className="py-2 px-4 border-b">Allocated Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assetTableData.length > 0 ? (
                                    assetTableData.map((allocation, index) => {
                                        console.log("Allocation Data:", allocation);

                                        // Render asset details directly from allocation
                                        return (
                                            <tr key={index}>
                                                <td>{allocation.assetName || 'No Asset Name'}</td>
                                                <td>{allocation.categoryName || 'No Category'}</td>
                                                <td>{allocation.value !== undefined ? allocation.value : 'No Value'}</td>
                                                <td>{allocation.model}</td>
                                                <td>{new Date(allocation.allocatedDate).toLocaleDateString() || 'No Date'}</td> {/* Formatting the date */}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5}>No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Line Chart Section */}
                    <div className="bg-white dark-mode:bg-light-black p-6 shadow-md rounded-lg w-1/2">
                        <div className="flex justify-center items-center mb-4">
                            <h2 className="text-xl font-bold mb-4 text-indigo-950">Requests Overview</h2>
                        </div>
                        <div className="flex justify-center" style={{ width: '100%', height: '80%' }}>
                            {clickedYValue !== null}
                            <Line data={chartData} options={options} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default EmpDashboard;



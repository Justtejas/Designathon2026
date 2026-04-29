import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faCommentDots, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import Header from './Header';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';


const Notifications = () => {
    
    const [notificationStatus, setNotificationStatus] = useState('active'); // Manage notification visibility
    const [showSuccessPrompt, setShowSuccessPrompt] = useState(false);
    const [auditStatus, setAuditStatus] = useState('');
    const [showTrackDetails, setShowTrackDetails] = useState(false);
    const [assetAllocations, setAssetAllocations] = useState([]); // Store asset allocations
    const [isLoading, setIsLoading] = useState(true); // For loading state
    const [assetImages, setAssetImages] = useState({});
    const [assetRequest, setAssetRequest] = useState(null);
    const [serviceRequest, setServiceRequest] = useState(null);
    const [returnRequest, setReturnRequest] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [auditRequests, setAuditRequests] = useState([]);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    const [assetName, setAssetName] = useState('');
    const [selectedAuditId, setSelectedAuditId] = useState(null);
    const [selectedAssetId, setSelectedAssetId] = useState(null);
    const [auditMessage, setAuditMessage] = useState('');
    const [nextAuditDate, setNextAuditDate] = useState(new Date('2024-04-11'));
    const [showAuditUpdateSuccess, setShowAuditUpdateSuccess] = useState(false);
    const defaultImage = "Images/AssetDefault.jpg";

    const toggleAssetDetails = (assetId) => {
        setSelectedAssetId(selectedAssetId === assetId ? null : assetId); // Toggle details for the clicked asset
      };

    // Function to handle the audit completion
    const handleAccept = () => {
        const currentDate = new Date();
        const newNextAuditDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        setNextAuditDate(newNextAuditDate);
    };

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            const decode = jwtDecode(token);
            setUserId(decode.nameid); 
            
            const fetchAuditRequests = async () => {
                try {
                    const response = await axios.get(`https://localhost:7287/api/Audits?userId=${decode.nameid}`);
                    const requests = response.data.$values;

                    const today = new Date();
                    const fiveDaysAgo = new Date();
                    fiveDaysAgo.setDate(today.getDate() - 5);

                    const filteredRequests = requests.filter(request => {
                        const requestDate = new Date(request.auditDate); 
                        return request.audit_Status === "Sent" && requestDate >= fiveDaysAgo && requestDate <= today;
                    });

                    if (filteredRequests && filteredRequests.length > 0) {
                        setAuditRequests(filteredRequests);
                        setNotificationStatus('active');
                    } else {
                        setNotificationStatus('inactive');
                    }
                } catch (error) {
                    console.error('Error fetching audit requests:', error);
                }
            };

            fetchAuditRequests();
        }
    }, []);

    const acceptAuditRequest = async (auditId, assetId) => {
        setSelectedAuditId(auditId); // Set the ID of the audit to be updated
        setSelectedAssetId(assetId);
        setNotificationStatus('completed'); // Show the audit update section
        setAuditMessage('');
        setShowSuccessPrompt(true);


        try {
            const assetResponse = await axios.get(`https://localhost:7287/api/Assets/${assetId}`);
            if (assetResponse.status === 200) {
                const assetData = assetResponse.data;
                setAssetName(assetData.assetName); // Set the asset name here
            }
        } catch (error) {
            console.error('Error fetching asset details:', error);
        }
    };

    const toggleTrackDetails = () => {
        setShowTrackDetails((prev) => !prev);
    };

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            const decode = jwtDecode(token);
            const userId = decode.nameid;
            const userName = decode.unique_name;

            const fetchAssetAllocations = async () => {
                try {
                    const response = await fetch(`https://localhost:7287/api/AssetAllocations/user/${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                          // Get today's date and the date five days ago
                          const today = new Date();
                          const fiveDaysAgo = new Date();
                          fiveDaysAgo.setDate(today.getDate() - 5);

                            // Filter allocations from the last five days
                        const filteredAllocations = (data.$values || []).filter(allocation => {
                            const allocationDate = new Date(allocation.allocatedDate); 
                            console.log("Allocation Date:", allocationDate);// Replace with the actual date field
                            return allocationDate >= fiveDaysAgo && allocationDate <= today;
                        });

                        console.log("Filtered Allocations:", filteredAllocations);
                        setAssetAllocations(filteredAllocations);

                        // Fetch images for filtered allocations
                        filteredAllocations.forEach((allocation) => {
                            fetchAssetImage(allocation.assetId);
                        });
                    } else {
                        console.error('Failed to fetch asset allocations');
                    }
                } catch (error) {
                    console.error('Error:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            const fetchAssetImage = async (assetId) => {
                try {
                    const response = await fetch(`https://localhost:7287/api/Assets/get-image/${assetId}`);
                    if (response.ok) {
                        const blob = await response.blob();
                        const imageUrl = URL.createObjectURL(blob); // Convert blob to URL
                        setAssetImages((prevImages) => ({
                            ...prevImages,
                            [assetId]: imageUrl, // Store the image URL by assetId
                        }));
                    } else {
                        console.error(`Failed to fetch image for asset ${assetId}`);
                        setAssetImages((prevImages) => ({
                            ...prevImages,
                            [assetId]: defaultImage, // Set default image if fetching fails
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching asset image:', error);
                    setAssetImages((prevImages) => ({
                        ...prevImages,
                        [assetId]: defaultImage, // Set default image if there's an error
                    }));
                }
            };

            fetchAssetAllocations();
        }
    }, []);
    const fetchRequests = async () => {
        try {
            const token = Cookies.get('token'); // Get token from cookies
            let userId;
    
            if (token) {
                const decode = jwtDecode(token); // Decode the token
                userId = decode.nameid; // Extract the user ID
            } else {
                console.error('No token found');
                return; // Exit if no token is found
            }
    
            // Create an array to hold the promises for the API requests
            const requests = [
                axios.get('https://localhost:7287/api/AssetRequests', {
                    headers: { Authorization: `Bearer ${token}` }, // Add Authorization header
                }).then(res => {
                    setAssetRequest(res.data.$values);
                    console.log('Asset Requests:', res.data);
                }).catch(error => {
                    console.error('Error fetching asset requests:', error.response ? error.response.data : error.message);
                    setAssetRequest([]); // Set to empty if there's an error
                }),
                
                axios.get('https://localhost:7287/api/ServiceRequests', {
                    headers: { Authorization: `Bearer ${token}` }, // Add Authorization header
                }).then(res => {
                    setServiceRequest(res.data.$values);
                    console.log('Service Requests:', res.data);
                }).catch(error => {
                    console.error('Error fetching service requests:', error.response ? error.response.data : error.message);
                    setServiceRequest([]); // Set to empty if there's an error
                }),
                
                axios.get('https://localhost:7287/api/ReturnRequests', {
                    headers: { Authorization: `Bearer ${token}` }, // Add Authorization header
                }).then(res => {
                    setReturnRequest(res.data.$values);
                    console.log('Return Requests:', res.data);
                }).catch(error => {
                    console.error('Error fetching return requests:', error.response ? error.response.data : error.message);
                    setReturnRequest([]); // Set to empty if there's an error
                }),
            ];
    
            // Wait for all requests to complete
            await Promise.all(requests);
            
        } catch (error) {
            console.error('Unexpected error fetching requests:', error.response ? error.response.data : error.message);
        }
    };
    
    // const fetchRequests = async () => {
    //     try {
    //         const token = Cookies.get('token'); // Get token from cookies
    //         let userId;

    //         if (token) {
    //             const decode = jwtDecode(token); // Decode the token
    //             userId = decode.nameid; // Extract the user ID
    //         } else {
    //             console.error('No token found');
    //             return; // Exit if no token is found
    //         }

    //         // Make API requests using the userId with Authorization header
    //         const [assetRes, serviceRes, returnRes] = await Promise.all([
    //             axios.get('https://localhost:7287/api/AssetRequests', {
    //                 headers: { Authorization: `Bearer ${token}` }, // Add Authorization header
    //             }), // Asset requests
    //             axios.get('https://localhost:7287/api/ServiceRequests', {
    //                 headers: { Authorization: `Bearer ${token}` }, // Add Authorization header
    //             }), // Service requests
    //             axios.get('https://localhost:7287/api/ReturnRequests', {
    //                 headers: { Authorization: `Bearer ${token}` }, // Add Authorization header
    //             }), // Return requests
    //         ]);

    //         // Handle the responses
    //         setAssetRequest(assetRes.data.$values);
    //         setServiceRequest(serviceRes.data.$values);
    //         setReturnRequest(returnRes.data.$values);

    //         console.log('Asset Requests:', assetRes.data);
    //         console.log('Service Requests:', serviceRes.data);
    //         console.log('Return Requests:', returnRes.data);

    //     } catch (error) {
    //         console.error('Error fetching requests:', error.response ? error.response.data : error.message);
    //     }
    // };

    useEffect(() => {
        fetchRequests(); // Call the fetchRequests function on component mount
    }, []);

    const updateAudit = async () => {
        try {
            const assetResponse = await axios.get(`https://localhost:7287/api/Assets/${selectedAssetId}`);
            const assetData = assetResponse.data;
            setAssetName(assetData.assetName);

            if (assetResponse.status !== 200) {
                throw new Error('Failed to fetch asset details');
            }

            const auditUpdateData = {
                auditId: selectedAuditId,
                assetId: selectedAssetId,
                userId: userId,
                auditDate: new Date().toISOString(),
                auditMessage: auditMessage,
                audit_Status: auditStatus,
                assetName: assetData.assetName,
                userName: userName
            };

            console.log("Audit update data:", auditUpdateData); 

            await axios.put(`https://localhost:7287/api/Audits/${selectedAuditId}`, auditUpdateData, {
                headers: {
                    'Content-Type': 'application/json',
                    accept: '*/*'
                }
            });

            setShowSuccessPrompt(false); 
            setNotificationStatus('inactive'); 

            if (assetResponse.status === 200) {
                setShowAuditUpdateSuccess(true); 
                setTimeout(() => {
                  setShowAuditUpdateSuccess(false);
                }, 3000);
              }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error updating audit request:', error.response?.data);
            } else {
                console.error('Unexpected error:', error);
            }
        }
    };
  
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="flex flex-col items-center p-8 bg-gray-100 h-screen">
                {showSuccessPrompt && (
                    <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
                        Audit status updated successfully!
                    </div>
                )}

                <div className="text-2xl font-bold mb-4 text-indigo-950">NOTIFICATIONS</div>

                <div className="p-4 w-full max-w-2xl space-y-4">
                    {/* Asset Allocation Notifications */}
                    {isLoading ? (
                        <div>Loading asset allocations...</div>
                    ) : assetAllocations.length > 0 ? (
                        assetAllocations.map((allocation) => (
                            <div key={allocation.assetId} className="flex flex-col p-6 bg-indigo-950 text-white rounded-lg shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                        <span>
                                            <span className="font-semibold text-red-500">ADMIN</span> has allocated an asset to you
                                        </span>
                                    </div>
                                    <div
                                        onClick={() => toggleAssetDetails(allocation.assetId)}
                                        className="text-red-500 hover:underline cursor-pointer"
                                    >
                                        {selectedAssetId === allocation.assetId ? 'Hide Details' : 'View Details'}
                                    </div>
                                </div>

                                {selectedAssetId === allocation.assetId && (
                                    <div className="mt-4 p-4 bg-indigo-950 text-white rounded-lg shadow-lg flex">
                                        <div className="flex-1">
                                            <p><strong>Asset Name:</strong> {allocation.assetName}</p>
                                            <p><strong>Model:</strong> {allocation.model}</p>
                                            <p><strong>Allocation Date:</strong> {new Date(allocation.allocatedDate).toLocaleDateString()}</p>
                                            <p><strong>Category:</strong> {allocation.categoryName}</p>
                                        </div>
                                        {assetImages[allocation.assetId] ? (
                                            <img
                                                src={assetImages[allocation.assetId] || defaultImage}
                                                alt={`Asset ${allocation.assetId}`}
                                                style={{ width: '100px', height: '100px' }}
                                            />
                                        ) : (
                                            <div>Loading image...</div>
                                        )}

                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-slate-200">No recent asset allocations found.</div>
                    )}

                    <div>
                        {notificationStatus === 'active' ? (
                            auditRequests.map(request => (
                                <div key={request.auditId} className="flex flex-col p-6 bg-indigo-950 text-white rounded-lg shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <FontAwesomeIcon icon={faCommentDots} className="text-slate-300" />
                                            <span>
                                                <span className="font-semibold text-red-500">ADMIN</span> has sent you an audit request
                                            </span>
                                        </div>
                                        <div className="flex space-x-4">
                                            <div
                                                onClick={() => acceptAuditRequest(request.auditId, request.assetId)}
                                                className="text-green-500 hover:underline cursor-pointer"
                                            >
                                                Accept
                                            </div>
                                          
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : notificationStatus === 'completed' && showSuccessPrompt ? (
                            <div className="mt-4 p-4 items-center bg-indigo-950 text-slate-200 rounded-lg shadow-lg">
                                <p><strong>Update Audit Status</strong></p>
                                <p>Asset ID: <span className="font-semibold text-yellow-400">{selectedAssetId}</span></p>
                                <p>Asset Name: <span className="font-semibold text-yellow-400">{assetName}</span></p>
                                <select
                                    value={auditStatus}
                                    onChange={(e) => setAuditStatus(e.target.value)}
                                    className="border border-gray-300 bg-slate-200 text-indigo-950 rounded p-2 mb-2"
                                >
                                    <option value="" disabled >Update Status</option>
                                    <option value="Completed">Completed</option>

                                    <option value="InProgress">InProgress</option>
                                </select>
                                <textarea
                                    value={auditMessage}
                                    onChange={(e) => setAuditMessage(e.target.value)}
                                    placeholder="Enter audit message..."
                                    className="border border-gray-300 bg-slate-200 text-indigo-950 rounded p-2 w-full h-24"
                                />
                                <button
                                    onClick={updateAudit}
                                    className="mt-2 bg-green-500 text-white rounded p-2"
                                >
                                    Update Audit
                                </button>
                                {showAuditUpdateSuccess && (
        <div className="mt-4 p-4 items-center bg-green-500 text-white rounded-lg shadow-lg">
          <p>Audit updated successfully!</p>
        </div>
      )}
                            </div>
                        ) : (
                            <div className="p-6 bg-gray-200 text-gray-700 rounded-lg shadow-lg">
                                No recent audit request found
                            </div>
                        )}
                    </div>

                    {/* Under Review Notification */}
                    <div className="flex flex-col p-6 bg-indigo-950 text-white rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <FontAwesomeIcon icon={faExclamationCircle} className="text-blue-500" />
                                <span>
                                    <span className="font-semibold text-red-500">Request</span> Tracking
                                </span>
                            </div>
                            <div className="flex space-x-4">
                                <div
                                    onClick={() => setShowTrackDetails(!showTrackDetails)}
                                    className="text-red-500 hover:underline cursor-pointer"
                                >
                                    Track Status
                                </div>
                            </div>
                        </div>

                        {showTrackDetails && (
                            <div className="mt-4 p-4 bg-indigo-950 text-white rounded-lg shadow-lg">
                                {/* Links to select request type */}
                                <div className="flex space-x-4 mb-4">
                                    <div
                                        onClick={() => setSelectedRequest('asset')}
                                        className={`cursor-pointer  ${selectedRequest === 'asset' ? 'text-red-500' : 'text-blue-400'
                                            }`}
                                    >
                                        Asset Request Status
                                    </div>
                                    <div
                                        onClick={() => setSelectedRequest('service')}
                                        className={`cursor-pointer  ${selectedRequest === 'service' ? 'text-red-500' : 'text-blue-400'
                                            }`}
                                    >
                                        Service Request Status
                                    </div>
                                    <div
                                        onClick={() => setSelectedRequest('return')}
                                        className={`cursor-pointer  ${selectedRequest === 'return' ? 'text-red-500' : 'text-blue-400'
                                            }`}
                                    >
                                        Return Request Status
                                    </div>
                                </div>

                                {/* Conditionally render Asset Request details */}
                                {selectedRequest === 'asset' && assetRequest.length > 0 && (
                                    <div>

                                        {assetRequest.map((req) => (
                                            <div key={req.assetReqId} className="mb-4">
                                                <p>
                                                    <strong>Asset Request Sent On:</strong>{' '}
                                                    {new Date(req.assetReqDate).toLocaleDateString() || 'N/A'}
                                                </p>
                                                <p>
                                                    <strong>Asset Status:</strong>{' '}
                                                    {(() => {
                                                        switch (req.requestStatus) {
                                                            case 0:
                                                                return 'Pending';
                                                            case 1:
                                                                return 'Allocated';
                                                            case 2:
                                                                return 'Rejected';
                                                            default:
                                                                return 'Unknown Status';
                                                        }
                                                    })()}
                                                </p>
                                                <p>
                                                    <strong>Asset Name:</strong> {req.assetName || 'N/A'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Conditionally render Service Request details */}
                                {selectedRequest === 'service' && serviceRequest.length > 0 && (
                                    <div>

                                        {serviceRequest.map((req) => (
                                            <div key={req.serviceId} className="mb-4">
                                                <p>
                                                    <strong>Service Request Date:</strong>{' '}
                                                    {new Date(req.serviceRequestDate).toLocaleDateString() || 'N/A'}
                                                </p>
                                                <p>
                                                    <strong>Service Status:</strong> {' '}
                                                    {(() => {
                                                        switch (req.serviceReqStatus) {
                                                            case 0:
                                                                return 'UnderReview';
                                                            case 1:
                                                                return 'Approved';
                                                            case 2:
                                                                return 'Completed';
                                                            case 3:
                                                                return 'Rejected';
                                                            default:
                                                                return 'Unknown Status';
                                                        }
                                                    })()}
                                                </p>
                                                <p>
                                                    <strong>Service Description:</strong>{' '}
                                                    {req.serviceDescription || 'N/A'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Conditionally render Return Request details */}
                                {selectedRequest === 'return' && returnRequest.length > 0 && (
                                    <div>

                                        {returnRequest.map((req) => (
                                            <div key={req.returnId} className="mb-4">
                                                <p>
                                                    <strong>Return Request Date:</strong>{' '}
                                                    {new Date(req.returnDate).toLocaleDateString() || 'N/A'}
                                                </p>
                                                <p>
                                                    <strong>Return Status:</strong>{' '}
                                                    {(() => {
                                                        switch (req.returnStatus) {
                                                            case 0:
                                                                return 'Sent';
                                                            case 1:
                                                                return 'Approved';
                                                            case 2:
                                                                return 'Returned';
                                                            case 3:
                                                                return 'Rejected';
                                                            default:
                                                                return 'Unknown Status';
                                                        }
                                                    })()}
                                                </p>
                                                <p>
                                                    <strong>Asset Name:</strong> {req.assetName || 'N/A'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center items-center bg-white text-indigo-950 p-4 rounded-lg mt-8 shadow-lg">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-red-500 mr-2" />
                    <span className="text-lg font-medium">
                        Reminder: Your next audit is scheduled for <strong>{nextAuditDate.toLocaleDateString()}</strong>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
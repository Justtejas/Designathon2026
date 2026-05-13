import React, { useEffect, useState } from "react";
import axiosInstance from "../../Utils/api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import CustomPagination from "../../Utils/CustomPagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faThumbsUp,
  faTimes,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import EmployeeHeader from "../EmployeeHeader";

const ServiceRequest = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [assetAllocations, setAssetAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    serviceId: 0,
    userId: "",
    assetName: "",
    assetId: "",
    serviceRequestDate: new Date().toISOString().split("T")[0],
    issueType: "",
    serviceDescription: "",
    serviceReqStatus: "UnderReview",
  });

  const issueTypeMapping = {
    1: "Malfunction",
    2: "Repair",
    3: "Installation",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const userId = decoded.userId;
        setFormData((p) => ({ ...p, userId }));

        const [serviceRes, assetRes] = await Promise.allSettled([
          axiosInstance.get("/ServiceRequests"),
          axiosInstance.get(`/AssetAllocations/user/${userId}`),
        ]);

        if (serviceRes.status === "fulfilled") {
          setServiceRequests(serviceRes.value.data || []);
        }

        if (assetRes.status === "fulfilled") {
          setAssetAllocations(assetRes.value.data || []);
        }
      } catch {
        setError("Failed to load service requests");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRequests = serviceRequests.slice(indexOfFirst, indexOfLast);

  const handleAssetChange = (e) => {
    const name = e.target.value;
    const asset = assetAllocations.find((a) => a.assetName === name);
    setFormData({
      ...formData,
      assetName: name,
      assetId: asset ? asset.assetId : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.assetId || !formData.issueType || !formData.serviceDescription) {
      return;
    }
    try {
      await axiosInstance.post("/ServiceRequests", formData);
      setShowForm(false);
      setSuccessMessage("Service request submitted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col
      bg-gray-50 dark:bg-slate-950 transition-colors">

      <EmployeeHeader />

      <main className="flex-grow max-w-7xl mx-auto px-6 py-16">

        <h1 className="text-3xl font-extrabold text-center mb-10
          text-gray-900 dark:text-slate-100 animate-fadeUp">
          Service Requests
        </h1>

        <div className="bg-white dark:bg-slate-900
          border border-gray-200 dark:border-slate-700
          rounded-2xl shadow-lg p-6 animate-fadeUp">

          {loading ? (
            <p className="text-center text-gray-600 dark:text-slate-300">
              Loading...
            </p>
          ) : error ? (
            <p className="text-center text-gray-500">{error}</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-indigo-950 dark:bg-indigo-900 text-white">
                  <tr>
                    {["ID", "Asset ID", "Asset Name", "Date", "Issue", "Desc", "Status"]
                      .map(h => (
                        <th key={h} className="p-3 text-center">{h}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRequests.map(r => (
                    <tr key={r.serviceId}
                      className="border-b border-gray-200
                      dark:border-slate-700
                      hover:bg-gray-100 dark:hover:bg-slate-800 transition">

                      <td className="p-2 text-center text-gray-800 dark:text-slate-300">
                        {r.serviceId}
                      </td>
                      <td className="p-2 text-center text-gray-800 dark:text-slate-300">
                        {r.assetId}
                      </td>
                      <td className="p-2 text-center text-gray-800 dark:text-slate-300">
                        {r.assetName || "N/A"}
                      </td>
                      <td className="p-2 text-center text-gray-800 dark:text-slate-300">
                        {new Date(r.serviceRequestDate).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-center text-gray-800 dark:text-slate-300">
                        {issueTypeMapping[r.issueType]}
                      </td>
                      <td className="p-2 text-gray-800 dark:text-slate-300">
                        {r.serviceDescription}
                      </td>
                      <td className="p-2 text-center">
                        {r.serviceReqStatus === "UnderReview" && (
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            <FontAwesomeIcon icon={faCircleExclamation} /> Under Review
                          </span>
                        )}
                        {r.serviceReqStatus === "Approved" && (
                          <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                            <FontAwesomeIcon icon={faThumbsUp} /> Approved
                          </span>
                        )}
                        {r.serviceReqStatus === "Rejected" && (
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            <FontAwesomeIcon icon={faXmark} /> Rejected
                          </span>
                        )}
                        {r.serviceReqStatus === "Completed" && (
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            <FontAwesomeIcon icon={faCircleCheck} /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <CustomPagination
                currentPage={currentPage}
                totalItems={serviceRequests.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12 animate-fadeUp">
          <div className="bg-gray-100 dark:bg-slate-800
            border border-gray-200 dark:border-slate-700
            p-6 rounded-xl shadow">
            <h2 className="font-bold text-gray-900 dark:text-slate-100 mb-4">
              Service Guidelines
            </h2>
            <ul className="text-gray-700 dark:text-slate-300 space-y-2">
              <li className="flex justify-between">
                Issues <span className="text-red-500">Malfunction / Repair / Install</span>
              </li>
              <li className="flex justify-between">
                Time <span className="text-red-500">~ 2 Weeks</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-center items-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700
              text-white px-6 py-3 rounded-lg shadow">
              Raise Service Request
            </button>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60
            flex items-center justify-center z-50">
            <form onSubmit={handleSubmit}
              className="bg-white dark:bg-slate-900
              border border-gray-200 dark:border-slate-700
              p-6 rounded-xl w-full max-w-md animate-scaleIn">

              <div className="flex justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  New Service Request
                </h3>
                <FontAwesomeIcon
                  icon={faTimes}
                  className="cursor-pointer text-red-500"
                  onClick={() => setShowForm(false)}
                />
              </div>

              <div className="space-y-4">
                <select
                  className="w-full p-3 rounded
                  bg-white dark:bg-slate-800
                  border border-gray-300 dark:border-slate-600
                  text-gray-900 dark:text-slate-200"
                  value={formData.assetName}
                  onChange={handleAssetChange}
                  required>
                  <option value="">Select Asset</option>
                  {assetAllocations.map(a => (
                    <option key={a.assetId} value={a.assetName}>{a.assetName}</option>
                  ))}
                </select>

                <select
                  className="w-full p-3 rounded
                  bg-white dark:bg-slate-800
                  border border-gray-300 dark:border-slate-600
                  text-gray-900 dark:text-slate-200"
                  value={formData.issueType}
                  onChange={e => setFormData({
                    ...formData,
                    issueType: Number(e.target.value)
                  })}
                  required>
                  <option value="">Select Issue</option>
                  {Object.entries(issueTypeMapping).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>

                <textarea
                  rows={4}
                  className="w-full p-3 rounded
                  bg-white dark:bg-slate-800
                  border border-gray-300 dark:border-slate-600
                  text-gray-900 dark:text-slate-200"
                  placeholder="Describe the issue"
                  value={formData.serviceDescription}
                  onChange={e => setFormData({
                    ...formData,
                    serviceDescription: e.target.value
                  })}
                  required
                />

                <button
                  type="submit"
                  className="w-full bg-indigo-950 hover:bg-indigo-800
                  text-white py-2 rounded">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        {successMessage && (
          <div className="fixed top-5 right-5 bg-green-600
            text-white px-4 py-2 rounded shadow-lg">
            {successMessage}
          </div>
        )}
      </main>
    </div>
  );
};

export default ServiceRequest;
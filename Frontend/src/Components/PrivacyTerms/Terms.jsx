import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Terms = () => {
    const navigate = useNavigate(); // Initialize navigate function

    const handleBackClick = () => {
        navigate('/signin'); // Navigate back to the sign-in page
    };

    return (
        <div className="container mx-auto p-6 bg-white flex justify-center">
            <div className="w-full lg:w-3/4 bg-white p-8 shadow-lg rounded-lg">
                {/* Back Link */}
                <div 
                    onClick={handleBackClick}
                    className="mb-6 text-red-500 cursor-pointer flex items-center "
                >
                    <span className="mr-2">👈</span> Back
                </div>

                {/* Terms of Service Section */}
                <section className="mb-12">
                    <h1 className="text-3xl font-bold text-center text-indigo-950 mb-6">Terms of Service</h1>
                    <p className="mb-6 text-gray-700">
                        By using Hexahub, you agree to the following terms and conditions. Please read them carefully.
                    </p>

                    {/* Section 1 */}
                    <div className="flex items-center mb-4">
                        <FontAwesomeIcon icon={faFile} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">Acceptance of Terms</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        By accessing or using our asset management platform, you agree to comply with and be bound by these Terms of Service. If you do not agree with these terms, you are not permitted to use the service.
                    </p>

                    {/* Section 2 */}
                    <div className="flex items-center mb-4">
                        <FontAwesomeIcon icon={faFile} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">Use of Services</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        You agree to use Hexahub solely for managing and tracking assets within your organization. Unauthorized use of the platform, including but not limited to, illegal activities or accessing the system for malicious purposes, is prohibited.
                    </p>

                    {/* Section 3 */}
                    <div className="flex items-center mb-4">
                        <FontAwesomeIcon icon={faFile} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">User Accounts</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                    </p>

                    {/* Section 4 */}
                    <div className="flex items-center mb-4">
                        <FontAwesomeIcon icon={faFile} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">Limitation of Liability</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        Hexahub will not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the platform. This includes but is not limited to, any loss of data or financial losses resulting from system malfunctions.
                    </p>

                    {/* Section 5 */}
                    <div className="flex items-center mb-4">
                        <FontAwesomeIcon icon={faFile} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">Termination</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        We reserve the right to suspend or terminate your access to Hexahub at our discretion, without notice, if we believe that you have violated these terms.
                    </p>

                    {/* Section 6 */}
                    <div className="flex items-center mb-4">
                        <FontAwesomeIcon icon={faFile} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">Modifications to the Service</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        Hexahub reserves the right to modify, suspend, or discontinue the service at any time, without notice.
                    </p>

                    <p className="text-gray-700">
                        If you have any questions about these Terms of Service, please contact us at <span className="underline">support@hexahub.com</span>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms;


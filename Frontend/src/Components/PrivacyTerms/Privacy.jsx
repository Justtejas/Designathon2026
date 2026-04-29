import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';

const Privacy = () => {
    const navigate = useNavigate(); // Initialize navigate function

    const handleBackClick = () => {
        navigate('/signin'); // Navigate to the sign-in page
    };

    return (
        <div className="container mx-auto p-6 bg-white flex justify-center">
            <div className="w-full lg:w-3/4 bg-white p-8 shadow-lg rounded-lg">
                {/* Back Link */}
                <div 
                    onClick={handleBackClick}
                    className="mb-6 text-red-500 cursor-pointer flex items-center "
                >
                    <span className="mr-2 ">👈</span> Back
                </div>

                {/* Privacy Policy Section */}
                <section className="mb-12">
                    <h1 className="text-3xl font-bold text-center text-indigo-950 mb-6">Privacy Policy</h1>
                    <p className="mb-6 text-gray-700">
                        At Hexahub, we prioritize your privacy and are committed to safeguarding your personal information. This Privacy Policy outlines how we collect, use, and protect the data you provide while using our asset management system.
                    </p>

                    <div className="mb-6 flex items-center">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">Information We Collect</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        We may collect personal information such as your name, email address, and contact details when you sign up for our services. Additionally, we may gather data related to the assets you manage using our platform.
                    </p>

                    <div className="mb-6 flex items-center">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">How We Use Your Information</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        We use the information collected to provide and improve our services, communicate with you, and ensure the smooth operation of the platform. Your data may also be used to analyze system performance and improve user experience.
                    </p>

                    <div className="mb-6 flex items-center">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">Data Security</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        We implement industry-standard security measures to protect your information from unauthorized access or disclosure. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.
                    </p>

                    <div className="mb-6 flex items-center">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">Third-Party Services</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        Hexahub may use third-party services to process or store your data. These third parties are obligated to ensure your data is protected and will not be used for unauthorized purposes.
                    </p>

                    <div className="mb-6 flex items-center">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">Your Rights</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        You have the right to request access, correction, or deletion of your personal information. Please contact us if you wish to exercise these rights.
                    </p>

                    <div className="mb-6 flex items-center">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-red-500 mr-2" />
                        <h2 className="text-xl font-semibold text-indigo-950">Changes to this Privacy Policy</h2>
                    </div>
                    <p className="mb-6 text-gray-700">
                        Hexahub reserves the right to update or change this Privacy Policy at any time. We will notify you of any significant changes through the platform or by email.
                    </p>

                    <p className="text-gray-700">
                        If you have any questions about this Privacy Policy, please contact us at <span className="underline">privacy@hexahub.com</span>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Privacy;




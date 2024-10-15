import React, { useState } from 'react';
import { FaClipboardList, FaRegPaperPlane, FaHistory, FaBook, FaPhone } from 'react-icons/fa'; // Import icons
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveBalance from '../components/LeaveBalance';
import LeaveHistory from '../components/LeaveHistory';
import HRContactInfo from '../components/HRContactInfo';
import PoliciesAndGuidelines from '../components/PoliciesAndGuidelines';

const LeavePage = () => {
    const [activeComponent, setActiveComponent] = useState(['leave-balance', 'policies-guidelines', 'hr-contact']);

    const handleComponentToggle = (component) => {
        setActiveComponent((prevState) =>
            prevState.includes(component)
                ? prevState.filter((item) => item !== component)
                : [...prevState, component]
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-blue-600 text-white text-center p-4">
                <h1 className="text-3xl font-semibold">Leave Management</h1>
            </header>

            <div className="flex flex-grow">
                {/* Sidebar */}
                <aside className="w-1/4 bg-gray-200 p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Navigation</h2>
                    <ul className="space-y-4">
                        <li>
                            <button 
                                onClick={() => handleComponentToggle('leave-balance')}
                                className="flex items-center p-2 w-full text-left text-gray-700 hover:bg-blue-100 rounded-lg transition"
                            >
                                <FaClipboardList className="mr-2 text-blue-600" /> Leave Balance
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => handleComponentToggle('leave-request')}
                                className="flex items-center p-2 w-full text-left text-gray-700 hover:bg-blue-100 rounded-lg transition"
                            >
                                <FaRegPaperPlane className="mr-2 text-blue-600" /> Leave Request
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => handleComponentToggle('leave-history')}
                                className="flex items-center p-2 w-full text-left text-gray-700 hover:bg-blue-100 rounded-lg transition"
                            >
                                <FaHistory className="mr-2 text-blue-600" /> Leave History
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => handleComponentToggle('policies-guidelines')}
                                className="flex items-center p-2 w-full text-left text-gray-700 hover:bg-blue-100 rounded-lg transition"
                            >
                                <FaBook className="mr-2 text-blue-600" /> Policies and Guidelines
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => handleComponentToggle('hr-contact')}
                                className="flex items-center p-2 w-full text-left text-gray-700 hover:bg-blue-100 rounded-lg transition"
                            >
                                <FaPhone className="mr-2 text-blue-600" /> HR Contact Info
                            </button>
                        </li>
                    </ul>
                </aside>

                {/* Main Content */}
                <main className="flex-grow p-6 container mx-auto space-y-8">
                    {activeComponent.includes('leave-balance') && (
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">Leave Balance</h2>
                            <LeaveBalance />
                        </section>
                    )}

                    {activeComponent.includes('leave-request') && (
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">Leave Request</h2>
                            <LeaveRequestForm />
                        </section>
                    )}

                    {activeComponent.includes('leave-history') && (
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">Leave History</h2>
                            <LeaveHistory />
                        </section>
                    )}

                    {activeComponent.includes('policies-guidelines') && (
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">Policies and Guidelines</h2>
                            <PoliciesAndGuidelines />
                        </section>
                    )}

                    {activeComponent.includes('hr-contact') && (
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">Contact HR</h2>
                            <HRContactInfo />
                        </section>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white p-4 text-center">
                <p>&copy; 2024 All rights reserved.</p>
                <p>
                    <a href="/terms" className="text-gray-400 hover:text-gray-200">Terms of Service</a> | 
                    <a href="/privacy" className="text-gray-400 hover:text-gray-200"> Privacy Policy</a>
                </p>
            </footer>
        </div>
    );
};

export default LeavePage;

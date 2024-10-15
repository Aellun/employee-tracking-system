import React from 'react';

const PoliciesAndGuidelines = () => {
    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto my-8">
            <h2 className="text-3xl font-bold text-blue-800 mb-6">Policies and Guidelines</h2>
            <p className="text-gray-700 text-lg mb-4">
                Please refer to our detailed company leave policies for information on leave entitlements, procedures, and guidelines.
            </p>
            <ul className="list-disc list-inside space-y-3 text-gray-600 text-base ml-4">
                <li>
                    <strong className="text-blue-700">Annual Leave:</strong> Employees are entitled to annual leave based on their tenure and position.
                </li>
                <li>
                    <strong className="text-blue-700">Sick Leave:</strong> Sick leave can be availed in case of illness or medical emergencies, with proper documentation.
                </li>
                <li>
                    <strong className="text-blue-700">Maternity/Paternity Leave:</strong> Details on leave entitlements for expecting parents.
                </li>
                <li>
                    <strong className="text-blue-700">Unpaid Leave:</strong> Employees can apply for unpaid leave in certain circumstances.
                </li>
            </ul>
            <p className="mt-6">
                <a href="/policies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold underline">
                    Read full leave policies
                </a>
            </p>
        </div>
    );
};

export default PoliciesAndGuidelines;

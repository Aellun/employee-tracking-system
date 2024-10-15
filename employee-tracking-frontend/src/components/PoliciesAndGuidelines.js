import React from 'react';

const PoliciesAndGuidelines = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Policies and Guidelines</h2>
            <p className="text-gray-600">
                Please refer to our detailed company leave policies for information on leave entitlements, procedures, and guidelines.
            </p>
            <ul className="list-disc list-inside text-gray-600">
                <li>Annual Leave: Employees are entitled to annual leave based on their tenure and position.</li>
                <li>Sick Leave: Sick leave can be availed in case of illness or medical emergencies, with proper documentation.</li>
                <li>Maternity/Paternity Leave: Details on leave entitlements for expecting parents.</li>
                <li>Unpaid Leave: Employees can apply for unpaid leave in certain circumstances.</li>
            </ul>
            <p className="mt-4 text-blue-500 underline">
                <a href="/policies" target="_blank" rel="noopener noreferrer">Read full leave policies</a>
            </p>
        </div>
    );
};

export default PoliciesAndGuidelines;

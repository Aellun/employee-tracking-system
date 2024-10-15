import React from 'react';

const HRContactInfo = () => {
    return (
        <div className="bg-blue-50 p-6 rounded-lg shadow-md max-w-md mx-auto my-8">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">Need Assistance?</h3>
            <p className="text-gray-700 mb-2">If you have any questions regarding leave policies, please reach out to HR:</p>
            <div className="bg-white p-4 rounded-md border border-blue-200 shadow-sm mt-3">
                <p className="text-lg font-medium text-blue-600">
                    <span className="font-semibold">Email:</span> <a href="mailto:hr@employeetrackingsystem.com" className="text-blue-500 hover:underline">hr@employeetrackingsystem.com</a>
                </p>
                <p className="text-lg font-medium text-blue-600 mt-2">
                    <span className="font-semibold">Phone:</span> <a href="tel:+254728519741" className="text-blue-500 hover:underline">(254) 728 519741</a>
                </p>
            </div>
        </div>
    );
};

export default HRContactInfo;

import React from 'react';
import { useAdmin } from '../context/AdminContext';

const PageHeader = ({ title }) => {
    const { impersonatedUsername } = useAdmin();
    const ownUsername = localStorage.getItem('username');
    const userRole = localStorage.getItem('role');

    const displayName = userRole === 'ADMIN' && impersonatedUsername 
        ? impersonatedUsername 
        : ownUsername;

    return (
        <div className="p-6 border-b bg-white">
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            <p className="text-md text-gray-600">
                Viewing data for: <span className="font-semibold">{displayName}</span>
            </p>
        </div>
    );
};

export default PageHeader;
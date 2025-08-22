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
        <div className="p-6 border-b border-default bg-surface">
            <h1 className="text-3xl font-bold text-primary">{title}</h1>
            <p className="text-md text-secondary">
                Viewing data for: <span className="font-semibold text-primary">{displayName}</span>
            </p>
        </div>
    );
};

export default PageHeader;
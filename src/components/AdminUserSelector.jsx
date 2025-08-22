import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAdmin } from '../context/AdminContext';

const AdminUserSelector = () => {
    const [users, setUsers] = useState([]);
    const { 
        impersonatedUserId, 
        setImpersonatedUserId, 
        setImpersonatedUsername 
    } = useAdmin();
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (userRole === 'ADMIN') {
            api.get('/users').then(response => setUsers(response.data));
        }
    }, [userRole]);
    const handleChange = (e) => {
        const userId = e.target.value;
        setImpersonatedUserId(userId || null);
        
        if (userId) {
            const selectedUser = users.find(u => u.id === parseInt(userId));
            if (selectedUser) {
                setImpersonatedUsername(selectedUser.username);
            }
        } else {
            setImpersonatedUsername('');
        }
    };

    if (userRole !== 'ADMIN') return null;

    return (
        <div className="p-4 flex items-center bg-surface border-b border-default">
            <span className="font-bold mr-4">Admin View:</span>
            <select
                value={impersonatedUserId || ''}
                onChange={handleChange} 
                className="p-2 rounded bg-app border border-default text-primary"
            >
                <option value="">View My Own Data</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        View data for: {user.username}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default AdminUserSelector;
import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const Settings = () => {
    const [config, setConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (userRole === 'ADMIN') {
            api.get('/config')
                .then(response => {
                    setConfig(response.data);
                    setIsLoading(false);
                })
                .catch(error => console.error("Error fetching config:", error));
        } else {
            setIsLoading(false);
        }
    }, [userRole]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prevConfig => ({ ...prevConfig, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        api.post('/config', config)
            .then(() => setMessage('Settings saved successfully!'))
            .catch(() => setMessage('Error saving settings.'));
    };

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }
    console.log(userRole);
    if (userRole !== 'ADMIN') {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }
    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Client Configuration</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-lg">
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Passive Sample Interval (ms)</label>
                    <input type="number" name="passive_sample_interval_ms" value={config.passive_sample_interval_ms} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Sync Interval (ms)</label>
                    <input type="number" name="sync_interval_ms" value={config.sync_interval_ms} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Download Test URL</label>
                    <input type="url" name="download_test_url" value={config.download_test_url} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Upload Test URL</label>
                    <input type="url" name="upload_test_url" value={config.upload_test_url} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Settings</button>
                {message && <p className="mt-4 text-green-600">{message}</p>}
            </form>
        </div>
    );
};

export default Settings;
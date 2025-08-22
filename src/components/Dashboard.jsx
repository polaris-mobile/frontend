import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import { Map, List, BarChart2, Settings, Download, Upload } from 'lucide-react';
import api from '../api/axiosConfig';
import { useAdmin } from '../context/AdminContext';
import PageHeader from './PageHeader';
import AdminUserSelector from './AdminUserSelector';
import logo from "../assets/logos/logo.png"


const Dashboard = () => {
    const { impersonatedUserId } = useAdmin();
    const username = localStorage.getItem('username');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const role = localStorage.getItem('role');
    // --- FIX: تابع جدید برای مدیریت دانلود فایل ---
    const handleDownload = async (path, filename) => {
        try {
            // ساخت URL بر اساس کاربر انتخاب‌شده توسط ادمین
            let url = path;
            if (impersonatedUserId) {
                url += `?user_id=${impersonatedUserId}`;
            }

            // ارسال درخواست از طریق axios با responseType: 'blob' و هدر موقت Authorization
            const token = localStorage.getItem('access_token');
            const response = await api.get(url, {
                responseType: 'blob',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            // ایجاد یک لینک موقت در حافظه برای شروع دانلود
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename); // نام فایل دانلود شده
            document.body.appendChild(link);
            link.click();

            // پاک کردن لینک موقت
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

        } catch (error) {
            console.error(`Failed to download ${filename}:`, error);
            alert(`Could not download the file. Please check permissions or server status.`);
        }
    };
    
    // --- FIX: تغییر آیتم‌های داشبورد برای استفاده از onClick ---
    const dashboardItems = [
        { to: '/map', icon: Map, label: 'Live Map View' },
        { to: '/table', icon: List, label: 'Browse All Data' },
        { to: '/active-tests', icon: BarChart2, label: 'Active Test Charts' },
        { to: '/settings', icon: Settings, label: 'Client Configuration' },
        // به جای href از onClick استفاده می‌کنیم
        { onClick: () => handleDownload('/export/csv', 'measurements.csv'), icon: Download, label: 'Export as CSV' },
        { onClick: () => handleDownload('/export/kml', 'measurements.kml'), icon: Upload, label: 'Export as KML' },
    ];

    // --- FIX: تغییر تابع renderItem برای مدیریت onClick ---
    const renderItem = (item) => {
        const content = (
            <div className="bg-surface p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col items-center justify-center h-40 cursor-pointer border border-default">
                <item.icon className="w-12 h-12 mb-4 text-accent" />
                <span className="text-lg font-semibold text-primary">{item.label}</span>
            </div>
        );

        if (item.to) {
            return <Link to={item.to} key={item.label}>{content}</Link>;
        }
        
        // اگر آیتم onClick داشت، به جای لینک از یک div با رویداد کلیک استفاده می‌کنیم
        return <div key={item.label} onClick={item.onClick}>{content}</div>;
    };

    return (
<div>
      <AdminUserSelector selectedUserId={selectedUserId} setSelectedUserId={setSelectedUserId} />
      <PageHeader title="Dashboard" />
      <div className="p-6 bg-app min-h-full">
        <h1 className="text-3xl font-bold mb-2 text-primary ">Welcome, {username}!</h1>
        <p className="text-md text-secondary mb-8">Select a tool below to analyze the collected network data.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map(renderItem)}
        </div>
      </div>
    </div>
    );
};

export default Dashboard;
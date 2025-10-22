import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userLogout } from '../store/actions/useraction';
import { 
    Mail, 
    Users, 
    Send, 
    LogOut, 
    Plus, 
    Settings,
    BarChart3,
    FileText,
    Database,
    UserPlus,
    Upload,
    List,
    Edit,
    Menu,
    X
} from 'lucide-react';

const Layout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useSelector(state => state.User);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            try {
                dispatch(userLogout());
                toast.success("Logged out successfully");
                navigate('/auth', { replace: true });
            } catch (error) {
                console.error('Logout error:', error);
                toast.error("Error during logout");
            }
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const sidebarItems = [
        { name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
        { name: 'Domains status', icon: Database, path: '/domains' },
        { name: 'Domain list', icon: Send, path: '/domain-data' },
        { name: 'Add Domain', icon: Plus, path: '/add-domain' },
        { name: 'Subscribers List', icon: Users, path: '/subscribers' },
        { name: 'Add Subscriber', icon: UserPlus, path: '/add-subscriber' },
        { name: 'Template List', icon: List, path: '/templates' },
        { name: 'Create Templates', icon: Edit, path: '/templates/create' },
        { name: 'Create Mail subject', icon: Settings, path: '/mail-settings' },
        { name: 'Mail Subject List', icon: Send, path: '/mail-setting-list' },
        { name: 'Publish Mail List', icon: Send, path: '/publish-mail' },
        { name: 'Domain Daily Stats', icon: FileText, path: '/domain-daily-stats' },
        { name: 'Update Password', icon: Settings, path: '/userprofile' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-white-100 bg-opacity-50 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:fixed
                w-64 bg-white shadow-sm border-r border-gray-200 
                h-full overflow-y-auto
                z-50 lg:z-auto
                transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-4">
                    {/* Mobile Close Button */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <Mail className="h-8 w-8 text-blue-600 mr-3" />
                            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <button
                            onClick={closeSidebar}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    
                    <nav className="space-y-1">
                        {sidebarItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    onClick={closeSidebar}
                                    className={`flex items-center px-4 py-3 text-sm md:text-md font-medium rounded-md transition-colors ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 lg:ml-64 w-full">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                {/* Mobile Menu Button */}
                                <button
                                    onClick={toggleSidebar}
                                    className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>
                                <div>
                                    <h2 className="text-xs sm:text-sm text-gray-600">
                                        Welcome: <span className="font-medium text-gray-900">
                                            {user?.name || user?.email || 'Admin'}
                                        </span>
                                    </h2>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium bg-red-300 rounded text-red-700 hover:bg-red-400"
                                >
                                    <LogOut className="h-4 w-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                
                {/* Page Content */}
                <main className="p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
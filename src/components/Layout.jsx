import React from 'react';
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
    Edit
} from 'lucide-react';

const Layout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useSelector(state => state.User);

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

    

    const sidebarItems = [
        { name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
        { name: 'Domains status', icon: Database, path: '/domains' },
        { name: 'Domain list', icon: Send, path: '/domain-data' },
        // { name: 'Send Mail', icon: Send, path: '/send-mail' },
        { name: 'Add Domain', icon: Plus, path: '/add-domain' },
        { name: 'Subscribers List', icon: Users, path: '/subscribers' },
        { name: 'Add Subscriber', icon: UserPlus, path: '/add-subscriber' },
        { name: 'Template List', icon: List, path: '/templates' },
        { name: 'Create Templates', icon: Edit, path: '/templates/create' },
        { name: 'Create Mail subject', icon: Settings, path: '/mail-settings' },
        { name: 'Mail Subject List', icon: Send, path: '/mail-setting-list' },
        { name: 'Publish Mail List', icon: Send, path: '/publish-mail' },
        { name: 'Domain Daily Stats', icon: FileText, path: '/domain-daily-stats' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-sm border-r border-gray-200 fixed h-full overflow-y-auto">
                <div className="p-4">
                    <div className="flex items-center mb-8">
                        <Mail className="h-8 w-8 text-blue-600 mr-3" />
                        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                    
                    <nav className="space-y-1">
                        {sidebarItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 text-md font-medium rounded-md transition-colors ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 ml-64">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-sm text-gray-600">
                                    Welcome : <span className="font-medium text-gray-900">
                                        {user?.name || user?.email || 'Admin'}
                                    </span>
                                </h2>
                            </div>
                            <div className="flex items-center space-x-4">
                                
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-red-300 rounded text-red-700 hover:text-gray-900"
                                >
                                    <LogOut className="h-4 w-4 mr-1" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                
                {/* Page Content */}
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
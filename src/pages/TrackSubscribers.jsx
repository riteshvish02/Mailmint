import React, { useState, useEffect, useMemo } from 'react';
import axios from '../utils/Axios';
import socket from '../utils/socket';
import { useParams, Link } from 'react-router-dom';
import {
  Mail,
  CheckCircle2,
  Eye,
  MousePointerClick,
  AlertOctagon,
  UserMinus,
  Download,
  RefreshCw,
  ArrowLeft,
  Radio,
  Search,
  Calendar,
  Filter,
  Inbox,
} from 'lucide-react';
import { toast } from 'react-toastify';

const TrackSubscribers = () => {
  const { domain } = useParams();
  const [subscribers, setSubscribers] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  // Real-time Dashboard summary state
  const [dashboard, setDashboard] = useState({
    total: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
  });

  const fetchSubscribers = async (pageNum = 1, perPageNum = 20, filter = trackFilter) => {
    if (!domain) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/v1/track-subscribers/${encodeURIComponent(domain)}?perPage=${perPageNum}&page=${pageNum}&filter=${filter}`
      );
      setSubscribers(res.data.subscribers || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || 1);
      setTotalRecords(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch track subscribers:', err);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    if (!domain) return;
    try {
      const res = await axios.get(`/api/v1/track-subscribers/${encodeURIComponent(domain)}/dashboard`);
      setDashboard(res.data || {});
    } catch (err) {
      console.error('Failed to fetch track dashboard:', err);
    }
  };

  // Socket.IO Room & Real-time Event Subscription
  useEffect(() => {
    if (!domain) return;

    fetchSubscribers(1, perPage, trackFilter);
    fetchDashboard();

    // Join domain room
    socket.emit('join:domain', domain);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    // Live webhook event receiver
    const handleTrackEvent = (data) => {
      console.log('⚡ [Socket] Live webhook event received:', data);
      const incomingDomain = data.domain || '';
      if (incomingDomain.toLowerCase() !== domain.toLowerCase()) return;

      const eventType = (data.event || '').toLowerCase();

      // Update counters in real time
      setDashboard((prev) => {
        const next = { ...prev, total: (prev.total || 0) + 1 };
        if (eventType.includes('delivered')) next.delivered = (prev.delivered || 0) + 1;
        if (eventType.includes('open')) next.opened = (prev.opened || 0) + 1;
        if (eventType.includes('click')) next.clicked = (prev.clicked || 0) + 1;
        if (eventType.includes('bounce')) next.bounced = (prev.bounced || 0) + 1;
        if (eventType.includes('unsubscribe')) next.unsubscribed = (prev.unsubscribed || 0) + 1;
        return next;
      });

      // Prepend to current page if viewing first page and matches filter
      setSubscribers((prevList) => {
        const matchesFilter =
          trackFilter === 'all' ||
          (trackFilter === 'delivered' && eventType.includes('delivered')) ||
          (trackFilter === 'opened' && eventType.includes('open')) ||
          (trackFilter === 'clicked' && eventType.includes('click')) ||
          (trackFilter === 'bounced' && eventType.includes('bounce')) ||
          (trackFilter === 'unsubscribed' && eventType.includes('unsubscribe'));

        if (!matchesFilter) return prevList;

        const newRow = {
          Email: data.email,
          Name: data.name || '',
          Status: data.status || 'active',
          Track: data.event,
          Date: data.date || new Date().toISOString(),
          isNew: true, // for micro-animation highlight
        };

        return [newRow, ...prevList.slice(0, perPage - 1)];
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('track:event', handleTrackEvent);

    return () => {
      socket.emit('leave:domain', domain);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('track:event', handleTrackEvent);
    };
  }, [domain, perPage, trackFilter]);

  const handleExport = async () => {
    if (!domain) return;
    setIsExporting(true);
    try {
      const res = await axios.get(`/api/v1/track-subscribers/${encodeURIComponent(domain)}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${domain}-activity-tracking.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Activity report downloaded successfully!');
    } catch (err) {
      toast.error('Excel download failed');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredSubscribers = useMemo(() => {
    if (!searchQuery.trim()) return subscribers;
    const q = searchQuery.toLowerCase();
    return subscribers.filter(
      (s) =>
        (s.Email && s.Email.toLowerCase().includes(q)) ||
        (s.Name && s.Name.toLowerCase().includes(q)) ||
        (s.Track && s.Track.toLowerCase().includes(q))
    );
  }, [subscribers, searchQuery]);

  const getEventBadge = (trackValue) => {
    const val = (trackValue || '').toLowerCase();
    if (val.includes('delivered')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Delivered
        </span>
      );
    }
    if (val.includes('open')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <Eye className="w-3 h-3 text-amber-600" />
          Opened
        </span>
      );
    }
    if (val.includes('click')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <MousePointerClick className="w-3 h-3 text-blue-600" />
          Clicked
        </span>
      );
    }
    if (val.includes('bounce') || val.includes('fail') || val.includes('block')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
          <AlertOctagon className="w-3 h-3 text-rose-600" />
          {val.includes('hard') ? 'Hard Bounce' : val.includes('soft') ? 'Soft Bounce' : 'Bounced'}
        </span>
      );
    }
    if (val.includes('unsubscribe')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
          <UserMinus className="w-3 h-3 text-gray-600" />
          Unsubscribed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
        {trackValue || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to="/publish-mail"
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Publish"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>Track Activity</span>
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {domain}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Real-time webhook telemetry for email delivery, opens, clicks, and bounces
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                socketConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              ></span>
              {socketConnected ? 'Live Webhook Stream' : 'Connecting Stream...'}
            </span>

            <button
              onClick={() => {
                fetchSubscribers(page, perPage, trackFilter);
                fetchDashboard();
              }}
              className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Total Events</span>
              <Inbox className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboard.total || 0}</p>
            <span className="text-[11px] text-gray-400">All interactions</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Delivered</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{dashboard.delivered || 0}</p>
            <span className="text-[11px] text-emerald-600 font-medium">
              {dashboard.total > 0 ? `${Math.round(((dashboard.delivered || 0) / dashboard.total) * 100)}%` : '0%'} rate
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Opened</span>
              <Eye className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{dashboard.opened || 0}</p>
            <span className="text-[11px] text-amber-600 font-medium">
              {dashboard.delivered > 0 ? `${Math.round(((dashboard.opened || 0) / dashboard.delivered) * 100)}% open` : '0%'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Clicked</span>
              <MousePointerClick className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{dashboard.clicked || 0}</p>
            <span className="text-[11px] text-blue-600 font-medium">Link clicks</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-rose-600 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Bounced</span>
              <AlertOctagon className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-rose-600">{dashboard.bounced || 0}</p>
            <span className="text-[11px] text-rose-600 font-medium">Auto-isolated</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-gray-600 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Unsubscribed</span>
              <UserMinus className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-700">{dashboard.unsubscribed || 0}</p>
            <span className="text-[11px] text-gray-500 font-medium">Opted out</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'opened', label: 'Opened' },
              { id: 'clicked', label: 'Clicked' },
              { id: 'bounced', label: 'Bounced' },
              { id: 'unsubscribed', label: 'Unsubscribed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTrackFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  trackFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email or event..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[10, 20, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time Activity Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recipient Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading && filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                      Loading activity telemetry...
                    </td>
                  </tr>
                ) : filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400">
                      <Radio className="w-8 h-8 mx-auto mb-2 text-gray-300 animate-pulse" />
                      No events recorded yet for this domain. Incoming Brevo webhooks will appear here live!
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((row, idx) => (
                    <tr
                      key={`${row.Email}-${row.Track}-${idx}`}
                      className={`hover:bg-gray-50 transition-colors ${
                        row.isNew ? 'bg-blue-50/60 animate-fade-in' : ''
                      }`}
                    >
                      <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.Email}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600">
                        {row.Name || '—'}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-sm">
                        {getEventBadge(row.Track)}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-xs text-gray-500">
                        {row.Date ? new Date(row.Date).toLocaleString() : 'Just now'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Page <span className="font-semibold text-gray-700">{page}</span> of{' '}
                <span className="font-semibold text-gray-700">{totalPages}</span> ({totalRecords} events)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchSubscribers(page - 1, perPage, trackFilter)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchSubscribers(page + 1, perPage, trackFilter)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackSubscribers;

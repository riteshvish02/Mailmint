import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../store/actions/useraction';
import { Navigate } from 'react-router-dom';
import Loader from './Loader';

function AdminProtected({ children }) {
    const {
        user,
        loading,
        isAuthenticated,
        error
    } = useSelector((state) => state.User);
    const dispatch = useDispatch();
    const token = localStorage.getItem('userToken');
    const hasValidToken = Boolean(token && token !== 'undefined' && token !== 'null');

    useEffect(() => {
        if (hasValidToken && !user) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, hasValidToken, user]);

    if (loading) return <Loader />;

    if (!hasValidToken && !isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    if (user && user.role && user.role !== "admin") {
        return <Navigate to="/auth" replace />;
    }

    if (error && !token) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <>
            {children}
        </>
    );
}

export default AdminProtected;

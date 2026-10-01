import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../store/actions/useraction';
import { Navigate } from 'react-router-dom';
import Loader from './Loader';

function Protectedroute({ children }) {
    const {
        user,
        loading,
        isAuthenticated,
        error
    } = useSelector((state) => state.User);
    const dispatch = useDispatch();
    const token = localStorage.getItem('userToken');

    useEffect(() => {
        if (token && !user) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, token, user]);

    if (loading) return <Loader />;

    if (!token && !isAuthenticated) {
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

export default Protectedroute;

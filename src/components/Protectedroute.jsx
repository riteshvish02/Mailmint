import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserProfile } from '../store/actions/useraction'
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
function Protectedroute({ children }) {
    const {
        user,
        loading,
        isAuthenticated,
        error
    } = useSelector((state) => state.User)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch])
    if (loading) return <Loader/>;
    return isAuthenticated && !error ? (
        <>
            {children}
        </>
    ) : navigate('/auth');
}

export default Protectedroute


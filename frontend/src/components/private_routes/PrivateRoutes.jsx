// import React from 'react'
// import { useAuth } from '@/contexts/useAuth'
// import { useNavigate } from 'react-router-dom';

// export const PrivateRoutes = ({children}) => {
//     const { isAuthenticated, loading } = useAuth();
//     const navigate=useNavigate();
//     if (loading){
//         return <h4>Loading...</h4>
//     }
//     if (isAuthenticated){
//         return children
//     }else{
//         navigate('/login')
//     }
// }

// src/pages/GoogleCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { googleLogin, get_user } from '@/endpoints/axios';
import { setUser } from '../Redux/userSlice';
import { toast } from 'sonner';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      (async () => {
        const res = await googleLogin(code);
        if (res.success) {
          dispatch(setUser(userRes.data));
          const userRes = await get_user();
          if (userRes.success) {
            dispatch(setUser(userRes.data));
            if (userRes.data.user_type === "learner") navigate("/learnerhome");
            else if (userRes.data.user_type === "creator") navigate("/creatorhome");
            else navigate("/adminhome");
          }
        } else {
          alert("Google login failed");
          toast.error("Google login failed");
          navigate("/login");
        }
      })();
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="flex justify-center items-center h-screen text-lg font-semibold text-gray-600">
      Logging in with Google...
    </div>
  );
};

export default GoogleCallback;

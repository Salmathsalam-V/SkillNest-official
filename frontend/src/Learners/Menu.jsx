import React, { useEffect, useState } from 'react';
import {get_post, logout} from "../endpoints/axios"
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import LearnerLayout from '@/components/Layouts/LearnerLayout';


const Menu = () => {
    const [post, setPost] = useState([])
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.user);

    useEffect(()=>{
        const fetchPost= async ()=>{
            const posts= await get_post()
            setPost(posts)
        }
        fetchPost();
    },[])

    const handleLogout = async ()=>{
        const success = await logout();
        if (success){
            navigate('/login')
        }
    }
  return (
    <>
    <LearnerLayout>
            {user && <h2>Welcome, {user.fullname}</h2>}

        {post.map((pos)=>{
            return <p>{pos.caption}</p>
        })}

        <Button variant="custom" onClick={handleLogout}>Logout</Button>
    </LearnerLayout>
    </>
  )
}

export default Menu
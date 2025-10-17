import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api/';
const LOGIN_URL = `${BASE_URL}login/`;
const REFRESH_URL  = `${BASE_URL}token/refresh/`;
const POST_URL = `${BASE_URL}post/`;
const LOGOUT_URL = `${BASE_URL}logout/`;
const LEARNERS_URL = `${BASE_URL}admin/learners/`;

// const AUTH_URL = `${BASE_URL}authenticate/`;

let isSessionExpiredHandle = false;

const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

const refreshClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Auto refresh access token request logic 
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Error:', error.response?.status, error.response?.data);
    
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('Attempting token refresh...');
      
      try {
        // Check if we have cookies before attempting refresh
        alert('Document cookies:', document.cookie);
        
        const refreshResponse = await refreshClient.post(REFRESH_URL, {}, { 
          withCredentials: true 
        });
        
        console.log("Token refreshed successfully", refreshResponse.data);

        // Retry the original request
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.response?.data);
        
        if (!isSessionExpiredHandle) {
          isSessionExpiredHandle = true;
          alert("Session expired. Please log in again in session expiry",refreshError);
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    console.log('Non-auth error or already retried:', error);
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const response = await axios.post(
      LOGIN_URL,
      {email, password},
      { withCredentials: true } // Sends and receives cookies
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};


// export const refresh_token = async () => {
//   try {
//     await axios.post(
//       REFRESH_URL,
//       {},
//       { withCredentials: true }
//     );

//     // optionally: return the token or a success flag
//     return response.data.refreshed === true;
//   } catch (error) {
//     console.error("Token refresh failed", error);
//     return false;
//   }
// };

export const get_post = async ()=>{
  try{
    const response = await axios.get(POST_URL,
    { withCredentials : true }
  )
  return response.data
  }
  catch (error) {
    console.error("Fetching posts failed", error);
    return error
  }
}

const call_refresh=async (error, func ) =>{
  if (error.response && error.response.status === 401){
    console.log("Calling refresh")
    const tokenRefreshed = await refresh_token();
    console.log("Token refreshed:", tokenRefreshed)
    if (tokenRefreshed){
      const retryResponse = await func();
      return retryResponse.data
    }
  }
  return false
}
export const logout = async () => {
  try {
    // Use axios directly instead of apiClient to bypass interceptors
    await axios.post(LOGOUT_URL, {}, { withCredentials: true });
    console.log("Logout successful");
    return true;
  } catch (error) {
    console.error("Logout failed, but proceeding with client-side logout:", error.response?.data || error.message);
    // Always return true for logout - even if server-side fails, client should log out
    return true;
  }
};

export const get_learners = async () => {
  try {
    const response = await apiClient.get(LEARNERS_URL, { withCredentials: true });
    console.log("Learners fetched:", response.data);
    return response.data.learners;
  } catch (error) {
    console.error("Fetching learners failed:", error.response?.data || error.message);
    return [];
  }
};

export const googleLogin = async (code) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/dj-rest-auth/google/",
      { code },
      { withCredentials: true }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Google login error", error.response?.data || error.message);
    return { success: false };
  }
};



export const get_user = async () => {
  try {
    const response = await axios.get("http://localhost:8000/api/dj-rest-auth/user/", {
      withCredentials: true
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Get user error", error.response?.data || error.message);
    return { success: false };
  }
};

export const toggleFollow = async (id) => {
  const res = await apiClient.post(`creator/creators/${id}/follow/`);
  return res.data;
};

export const toggleLike = async (postId) => {
  const res = await apiClient.post(`creator/creators/posts/${postId}/like/`);
  return res.data;
};

export const createComment = async (postId, content) => {
  try {
    console.log(`Creating comment on post ${postId}:`, content);
    const response = await apiClient.post(
      `creator/posts/${postId}/comments/`,
      { content },
      { withCredentials: true }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Create comment failed:", error.response?.data || error.message);
    return { success: false, error };
  }
};

// Toggle like for a comment
export const toggleCommentLike = async (postId, commentId) => {
  try {
    const res = await apiClient.post(
      `creator/posts/${postId}/comments/${commentId}/like/`,
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Error toggling comment like:", err.response?.data || err.message);
    return { success: false };
  }
};
  //  creators/<int:creator_id>/courses/


export const get_course = async (userId)=>{
  try{
    console.log("Fetching courses for user from axios:", userId);
    const response = await axios.get(`http://localhost:8000/api/creator/creators/${userId}/courses/`,
    { withCredentials : true }
    )
  return response.data
  }
  catch (error) {
    console.error("Fetching course failed", error);
    return error
  }
}

export const fetchCommunities = async () => {
  try {
    const res = await apiClient.get("creator/communities/");
    return res.data;
  } catch (err) {
    console.error("Error fetching communities:", err);
  }
};

export const createCommunity  = async (name, description, members) => {
  try {
    const res = await apiClient.post("creator/communities/" , {
      name,
      description,
      members,
    });
    return res.data;
  } catch (err) {
    console.error("Error creating communities:", err);
  }
};

export const fetchUsers = async () => {
  try {
    const res = await apiClient.get("creator/users/"); 
    return res.data;
  } catch (err) {
    console.error("Error fetching users:", err);
  }
};




export const fetchChatRoom = (communityId) =>
  apiClient.get(`/chat/communities/${communityId}/chat-room/`);

export const fetchMessages = (communityId, page = 1) =>
  apiClient.get(`/chat/communities/${communityId}/messages/`, {
    params: { page },
  });

// api/axios.js (example sendMessage)
export const sendMessage = async (communityId, messageData) => {
  // messageData should be like { content, media_url, message_type }
  return await apiClient.post(`/chat/communities/${communityId}/messages/send/`, messageData);
};

export const fetchMembers = (communityId) =>
  apiClient.get(`/chat/communities/${communityId}/members/`);

export const fetchLearnerCommunities = async () => {
  try {
    const res = await apiClient.get("/learner/communities/"); // make sure leading slash
    return res.data;
  } catch (err) {
    if (err.response) {
      // Server responded with a status outside 2xx
      console.error("Server error:", err.response.status, err.response.data);
    } else if (err.request) {
      // Request was made but no response received
      console.error("No response received:", err.request);
    } else {
      // Something else happened
      console.error("Axios error:", err.message);
    }
    return [];
  }
};

export const getMembers = async (communityId) => {
  try {
    
    const res = await apiClient.get(`/creator/communities/${communityId}/members/`);
    return res.data;

  } catch (err) {
    console.error("Error fetching users:", err);
  }
};

export const removeMember = async (communityId, identifier) => {
  const res = await apiClient.patch(`/creator/communities/${communityId}/members/`, 
    { action: "remove", member: identifier }
  );
  return res.data; // backend returns { members: [...] }
  };
    
export const addMember = async (communityId, identifier) => {
  console.log("Adding member in axios:", communityId, identifier);
  const res = await apiClient.post(`/creator/communities/${communityId}/members/`, 
    { action: "add", member: identifier }
  );
  return res.data; // backend returns { members: [...] }
  };
    
export const searchUsers = async (query) => {
  try {
    const res = await apiClient.get(`/search-users/`, {
      params: { q: query },
    });
    return res.data; // [{id, username, email}, ...]
  } catch (err) {
    console.error("Error searching users:", err);
    throw err;
  }
};
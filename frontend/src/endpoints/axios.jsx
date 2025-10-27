import axios from 'axios';
import api from "@/api/axios";
import { data } from 'react-router-dom';
import { get } from 'react-hook-form';


const BASE_URL = 'http://127.0.0.1:8000/api/';
const LOGIN_URL = `${BASE_URL}login/`;
const REFRESH_URL  = `${BASE_URL}token/refresh/`;
const POST_URL = `${BASE_URL}post/`;
const LOGOUT_URL = `${BASE_URL}logout/`;
const LEARNERS_URL = `${BASE_URL}admin/learners/`;

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
  (response) => response,   //succesfull response passthrough
  async (error) => {        //error response handling
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Attempting token refresh...");
        await refreshClient.post(REFRESH_URL, {}, { withCredentials: true });

        console.log("Token refreshed successfully. Retrying request...");
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError.response?.data);

        if (!isSessionExpiredHandle) {
          isSessionExpiredHandle = true;
          alert("Session expired. Please log in again."); //need better UX and clear cookies
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


// export const refresh_token = async () => {
//   try {
//     console.log("Refreshing token...");
//     const response = 
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
// const call_refresh=async (error, func ) =>{
//   if (error.response && error.response.status === 401){
//     console.log("Calling refresh")
//     const tokenRefreshed = await refresh_token();
//     console.log("Token refreshed:", tokenRefreshed)
//     if (tokenRefreshed){
//       const retryResponse = await func();
//       return retryResponse.data
//     }
//   }
//   return false
// }

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

export const googleLogin = async (code) => {
  try {
    const response = await axios.post(
      "google-login/",
      { code }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Google login error", error.response?.data || error.message);
    return { success: false };
  }
};



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

export const fetchCommunities = async (limit = 6, offset = 0) => {
  try {
    // Add the ?page= query parameter
    const res = await apiClient.get(`creator/communities/?limit=${limit}&offset=${offset}`);
    return res.data;  // { count, next, previous, results }
  } catch (err) {
    console.error("Error fetching communities:", err);
    return null;
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
export const deleteCommunity = async (id) => {
  try {
    const res = await apiClient.delete(`creator/communities/${id}/delete/`, {
      withCredentials: true, // if using cookie-based JWT
    });
    return res.data; // { detail: "Community deleted successfully" }
  } catch (err) {
    console.error("Error deleting community:", err);
    throw err;
  }
};


export const fetchUsers = async () => {
  try {
    const res = await apiClient.get("creator/users/"); 
    return res.data.results; // assuming paginated response
  } catch (err) {
    console.error("Error fetching users:", err);
  }
};

export const fetchAllFollowers = async () => {
  try {
    let allUsers = [];
    let nextUrl = `${BASE_URL}creator/all-followers/?limit=100&offset=0`; 
    // Adjust endpoint name if needed

    while (nextUrl) {
      const res = await axios.get(nextUrl, { withCredentials: true });
      console.log(res.data)
      allUsers = [...allUsers, ...res.data.results];
      nextUrl = res.data.next; // DRF pagination gives next page URL
    }

    return allUsers;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
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

export const fetchLearnerCommunities = async (limit = 6, offset = 0) => {
  try {
    const res = await apiClient.get(`/learner/communities/?limit=${limit}&offset=${offset}`); // make sure leading slash
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


export const getCommunities = async () => {
  try {
    
    const res = await apiClient.get(`/admin/communities/`);
    return res.data;

  } catch (err) {
    console.error("Error fetching community:", err);
  }
};
export const deleteCommunities = async (communityId) => {
  try {
    
    const res = await apiClient.delete(`admin/admin-community/${communityId}/`);
    return res.data;

  } catch (err) {
    console.error("Error deleting community:", err);
  }
};


export const getCommunityMembers = async (communityId) => {
  try {
    
    const res = await apiClient.get(`/admin/communities/${communityId}/members/`);
    console.log("Community members data:", res.data);
    return res.data;

  } catch (err) {
    console.error("Error fetching users:", err);
  }
};


export const registerUser = async (formData) => {
  try {
    const response = await api.post("register/", formData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Register error:", error.response?.data || error.message);
    return { success: false, error };
  }
};

export const imageUpload = async (formData) => {
  try {
    const res = await axios.post("http://127.0.0.1:8000/api/upload-image/",   
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return { success: true, data: res.data };
  } catch (error) {
    console.error("image uplaod  error from axios:", error.response?.data || error.message);
    return { success: false, error };
  }
};

export const creatorData = async (creatorId) => {
  try {
    const res = await apiClient.get(`/admin/creators-view/${creatorId}/`);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error fetching users:", err);
    return { success: false, error: err };
  }
};

export const getCreatorPosts = async (creatorId) => {
  try {
    const res = await apiClient.get(`/creator/creators/${creatorId}/posts/`);
    return { success: true, data: res.data.results || [] };
  } catch (err) {
    console.error("Error fetching creator posts:", err);
    return { success: false, error: err };
  }
};

export const createCreatorPost = async (creatorId, postData) => {
  try {
    const res = await apiClient.post(`/creator/creators/${creatorId}/posts/`, postData);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error creating post:", err);
    return { success: false, error: err };
  }
};

// ✅ Approve creator
export const approveCreator = async (creatorId) => {
  try {
    const res = await apiClient.patch(`/admin/creators-view/${creatorId}/`, {
      approve: "accept",
    });
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error approving creator:", err);
    return { success: false, error: err };
  }
};

// ✅ Reject creator
export const rejectCreator = async (creatorId) => {
  try {
    const res = await apiClient.patch(`/admin/creators-view/${creatorId}/`, {
      approve: "reject",
    });
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error rejecting creator:", err);
    return { success: false, error: err };
  }
};
//fetch creators list for admin
export const listCreators = async () => {
  try {
    const res = await apiClient.get('/admin/creators/');
    console.log("Creators list response:", res.data);
    return { success: true, data: res.data || [] };
  } catch (err) {
    console.error("Error fetching creator posts:", err);
    return { success: false, error: err };
  }
};

//  Delete a creator from admin
export const deleteCreator = async (creatorId) => {
  try {
    const res = await apiClient.delete(`/admin/creators/${creatorId}/`);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error deleting creator:", err);
    return { success: false, error: err };
  }
};

//  Update a creator from admin
export const updateCreator = async (creatorId, updatedData) => {
  try {
    const res = await apiClient.patch(`/admin/creators/${creatorId}/`, updatedData);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error updating creator:", err);
    return { success: false, error: err };
  }
};


//  Delete learner from admin
export const deleteLearner = async (learnerId) => {
  try {
    const res = await apiClient.delete(`/admin/learners/${learnerId}/`);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error deleting learner:", err);
    return { success: false, error: err };
  }
};

export const updateLearner = async (learnerId, updatedData) => {
  const res = await apiClient.patch(`/admin/learners/${learnerId}/`, updatedData);
  return { success: true, data: res.data };
};


//  Fetch all contact messages
export const getContactMessages = async () => {
  try {
    const res = await apiClient.get("/admin/contact-us/");
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to fetch contact messages:", err);
    return { success: false, error: err };
  }
};

//  Fetch all notifications
export const getNotifications = async () => {
  try {
    const res = await apiClient.get("/notifications/list/");
    return { success: true, data: res.data.results || [] };
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return { success: false, error: err };
  }
};

// Create a creator
export const createCreator = async ({ email, category, description, background }) => {
  try {
    const res = await apiClient.post("/create-creator/", {
      email,
      category,
      description,
      background,
    });
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to create creator:", err);
    return { success: false, error: err };
  }
};

// Send a message to admin
export const sendContactMessage = async ({ content, userId }) => {
  try {
    const res = await apiClient.post("/admin/contact-us/", {
      content,
      user: userId,
    });
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to send contact message:", err);
    return { success: false, error: err };
  }
};

// Update a post by ID
export const updatePost = async (postId, payload) => {
  try {
    const res = await apiClient.patch(`/creator/creators/posts/${postId}/`, payload);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to update post:", err);
    return { success: false, error: err };
  }
};

export const updateCreatorProfile = async (creatorId, payload) => {
  try {
    const res = await apiClient.patch(`/admin/creators-view/${creatorId}/`, payload);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to update creator profile:", err);

    if (err.response?.data) {
      return {
        success: false,
        errors: err.response.data.errors || err.response.data,
      };
    }

    return { success: false, errors: { general: "Unknown error occurred" } };
  }
};

export const deletePost = async (postId) => {
  try {
    const res = await apiClient.delete(`/creator/creators/posts/${postId}/`, {
      withCredentials: true, // ensures cookies are sent
    });
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error deleting post:", err);
    return { success: false, error: err };
  }
};

export const fetchInvites = async () => {
  try {
    const res = await apiClient.get("creator/invites/");
    console.log("Fetched Invites:", res.data.results);
    return res.data.results;
  } catch (err) {
    console.error("Error fetching invites:", err);
  }
};


export const respondToInvite = async (inviteId, action) => {
  const res = await apiClient.patch(`creator/invites/${inviteId}/`, { action });
  return res.data;
};

// export const postReports = async (postId, reportData) => {
//   try {
//     const res = await axios.post(`/creator/post/${postId}/reports/`, reportData); 
//     console.log("Report post response data from axios:", res.data);
//     return { success: true};
//   } catch (err) {
//     console.error("Failed to report post:", err);
//     return { success: false, error: err };
//   }
// };
export const postReports = async (postId, reportData) => {
  try {
    console.log("before api call")
    const res = await apiClient.post(`creator/post/${postId}/reports/`, reportData);
    console.log("Report post response:", res.data);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to report post:", err.response?.data || err);
    return { success: false, error: err };
  }
};

export const postReportsView = async () => {
  try {
    const res = await apiClient.get('admin/post/reports');
    console.log("Report post response:", res.data);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to report post:", err.response?.data || err);
    return { success: false, error: err };
  }
};

export const postReviews = async (creatorId, reportData) => {
  try {
    console.log("before api call")
    const res = await apiClient.post(`creator/post/${postId}/reports/`, reportData);
    console.log("Report post response:", res.data);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to report post:", err.response?.data || err);
    return { success: false, error: err };
  }
};
// ✅ Post a new review for a creator
export const postReview = async (creatorId, reviewData) => {
  try {
    console.log("Before posting review...");
    const res = await apiClient.post(
      `creator/creators/${creatorId}/reviews/`,
      reviewData,
      { withCredentials: true }
    );
    console.log("Review post response:", res.data);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to post review:", err.response?.data || err);
    return { success: false, error: err };
  }
};

export const fetchReviews = async (creatorId) => {
  try {
    console.log("Before fetch review...");
    const res = await apiClient.get(
      `creator/creators/${creatorId}/reviews`,
      { withCredentials: true }
    );
    console.log("Reviews:", res);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to fetch review:", err.response?.data || err);
    return { success: false, error: err };
  }
};
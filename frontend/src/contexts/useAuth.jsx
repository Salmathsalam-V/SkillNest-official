// import { createContext,useContext,useEffect,useState } from "react";
// import { is_Authenticated, login } from "@/endpoints/axios";
// import { useNavigate } from "react-router-dom";

// const AuthContext = createContext();

// export const AuthProvider = ({children}) =>{

//     const [isAuthenticated, setIsAuthenticated]= useState(false)
//     const [loading,setLoading] = useState(true)
//     const navigate=useNavigate();
//     const get_autheticated = async ()=> {
//         try{
//             const success = await isAuthenticated();
//             setIsAuthenticated(success)
//         }catch{
//             setIsAuthenticated(false)
//         }finally{
//             setLoading(false)
//         }
//     }
//     const login_user = async (username,password)=>{
//         const success = await login(username,password);
//         if (success){
//             setIsAuthenticated(true)
//             navigate('/')
//         }
//     }

//     useEffect(()=>{
//         get_autheticated();
//     },[window.location.pathname])

//     return (
//         <AuthContext.Provider value={{isAuthenticated,loading, login_user}}>
//             {children}
//         </AuthContext.Provider>
    
//     )

// }

// export const useAuth = () =>useContext(AuthContext);
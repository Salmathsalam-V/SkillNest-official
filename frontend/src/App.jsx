import React from 'react';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import {Register} from '../src/Learners/Register'
import {AdminHome} from './Admin/AdminHome'
import {Home} from '../src/Learners/Home'
import {CreatorHome} from './Creator/CreatorHome'
import Login from './Learners/Login';
import menu from './Learners/menu';
import { CreateLearner } from './Admin/CreateLearner';
import LearnerList from './Admin/LearnerList';
import CreatorList from './Admin/CreatorList';
import { CreateCreator } from './Admin/CreateCreator';
import GoogleCallback from './Learners/GoogleCallBack';
import SendOTPForm from './Learners/sendOTPForm';
import Profile from './Learners/Profile';
import CreatorProfile from './Creator/CreatorProfile';
import VerifyOTPForm from './Learners/verifyOTPForm';
import ResetPasswordForm from './Learners/ResetPasswordHome';
import CreateExtraDetails from './Creator/CreateExtraDetails';
import { CreatorData } from './Admin/CreatorData';
import { Toaster } from 'sonner';
import AdminContactMessages from './Admin/UserMessage';
import { CreatorsListPublic } from './Creator/CreatorsList';
import { CreatorDetailpage } from './Creator/CreatorDetailpage';
import { CommunityList } from './Creator/CommunityList';
import { CommunityPage } from './Creator/CommunityPage';
import { LearnerListPublic } from './Learners/LearnerListPublic';
import { CommunityListLearner } from './Learners/CommunityListLearner';
import { CommunityPageLearner } from './Learners/CommunityPageLearner';
import {CommunityListAdmin} from './Admin/CommunityListAdmin';
import {ReportsPage} from './Admin/PostReports';
import { PostsPage } from './Admin/PostsPage';
import {AdminPayments} from './Admin/AdminPayments';
import NotFound from './Pages/NotFound';
import ServerError from './Pages/ServerError';
// import { AuthProvider } from './contexts/useAuth';
// import { PrivateRoutes } from './components/private_routes/PrivateRoutes'

function App() {
  return (
    <>
      <Router>
        {/* <AuthProvider> */}
          {/* <Toaster richColors position="top-right" /> */}
          <Routes>
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>}/>
            <Route path='/' element={<menu/>}/> 
            <Route path='/learnerhome' element={<Home/>}/>  
            <Route path='/adminhome' element={<AdminHome/>}/> 
            <Route path='/listlearner' element={<LearnerList/>}/>
            <Route path='/createlearner' element={<CreateLearner/>}/>
            <Route path='/listcreator' element={<CreatorList/>}/>
            <Route path='/createcreator' element={<CreateCreator/>}/>
            <Route path='/creatorHome' element={<CreatorHome/>}/>
            <Route path="/google/callback" element={<GoogleCallback/>} />
            <Route path="/send-otp" element={<SendOTPForm/>} />
            <Route path="/verify-otp" element={<VerifyOTPForm/>} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/creator-profile/:id" element={<CreatorProfile/>} />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/ceate-extradata" element={<CreateExtraDetails />} />
            <Route path="/creators-view/:id" element={<CreatorData />} />
            <Route path="/messages" element={<AdminContactMessages />} />
            <Route path="/creators-list" element={<CreatorsListPublic />}/>
            <Route path="/creators/:id" element={<CreatorDetailpage />}/>
            <Route path="/creator/communities" element={<CommunityList />} />
            <Route path="/creator/communities/:communityId" element={<CommunityPage />} />
            <Route path="learners-list" element={<LearnerListPublic />} />
            <Route path="/learner/communities" element={<CommunityListLearner />} />
            <Route path="/learner/communities/:communityId" element={<CommunityPageLearner />} />
            <Route path="/admin/communities" element={<CommunityListAdmin />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/posts-admin" element={ <PostsPage />} />
            <Route path="/admin-payments" element={ <AdminPayments />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/server-error" element={<ServerError />} />
          </Routes>
        {/* <PrivateRoutes></PrivateRoutes> */}
        {/* </AuthProvider> */}
        
      </Router>
    </>
  );
}

export default App;

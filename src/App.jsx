import { Routes, Route } from "react-router-dom";
import Tour from "./pages/tour";
import LegacyTourRedirect from './components/LegacyTourRedirect';
import UrlLanguage from './components/UrlLanguage';
import Tours from "./pages/tours";
import Admin_tours from "./pages/admin_tours";
import Admin_reservations from "./pages/admin_ reservations";
import Login from "./pages/admin_login";
import Invoice from "./pages/invoice";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterAdmin from "./pages/RegisterAdmin";
import 'aos/dist/aos.css';
import './i18n';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App(){
  

  return (
    <>

      
    
    
      <UrlLanguage />
      <Routes>
        <Route path="/admin/reservations" element={<ProtectedRoute><Admin_reservations /></ProtectedRoute>} />
        <Route path="/admin/tours" element={<ProtectedRoute><Admin_tours /></ProtectedRoute>} />
        <Route path="/tours" element={<Tours />} />
        {/* <Route path="/" element={<Tours />} /> */}
        <Route path="/registro" element={<RegisterAdmin />} />
        <Route path="/tours/:hotel" element={<LegacyTourRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tour/:hotel/:slug" element={<LegacyTourRedirect />} />
        <Route path="/tour/:slug" element={<Tour />} />
        <Route path="/tourAdmin/:slug" element={<LegacyTourRedirect />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/invoice/:referencia" element={<Invoice />} />
        <Route path="*" element={<LegacyTourRedirect />} />
        
         
      </Routes>
  
    <ToastContainer position="top-right" autoClose={3000} 
            newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"  />
    </>
    
  )
    

  
  

}


export default App;

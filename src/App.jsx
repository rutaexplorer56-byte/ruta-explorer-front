import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Tour from "./pages/tour";
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

      
    
    
      <Routes>
        <Route path="/admin/reservations" element={<ProtectedRoute><Admin_reservations /></ProtectedRoute>} />
        <Route path="/admin/tours" element={<ProtectedRoute><Admin_tours /></ProtectedRoute>} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/" element={<Tours />} />
        <Route path="/registro" element={<RegisterAdmin />} />
        <Route path="/tours/:hotel" element={<Tours/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/tour/:hotel/:id" element={<Tour />} />
        <Route path="/tour/:id" element={<Tour />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/invoice/:referencia" element={<Invoice />} />
        
         
      </Routes>
  
    <ToastContainer position="top-right" autoClose={2000} 
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
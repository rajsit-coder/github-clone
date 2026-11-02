import { createRoot } from 'react-dom/client'
import { AuthProvider } from './authContext.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import ProjectRoutes from './Routes.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Router>
    <ProjectRoutes />
    </Router>
  </AuthProvider>
)
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Provider } from 'react-redux'
import {store} from './store/store.js'

createRoot(document.getElementById('root')).render(
   <GoogleOAuthProvider clientId="405481912073-9im120in91tb09abb9hquo25pq2r8713.apps.googleusercontent.com">
      <BrowserRouter>
         <Provider store={store}>
            <App />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
         </Provider>
      </BrowserRouter>
   </GoogleOAuthProvider>
)

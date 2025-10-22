import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import store, { AppDispatch } from './store/store.ts'
import { loadUserFromStorage } from './store/authSlice'
import { Toaster } from 'react-hot-toast'

// Rehydrate auth state from localStorage before rendering
(store.dispatch as AppDispatch)(loadUserFromStorage())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </Provider>
  </StrictMode>,
)

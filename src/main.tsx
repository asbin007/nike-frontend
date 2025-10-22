import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import store, { AppDispatch } from './store/store.ts'
import { loadUserFromStorage } from './store/authSlice'
import { Toaster } from 'react-hot-toast'

// Rehydrate auth state from localStorage before rendering
// Temporary admin token for chat testing (DEV ONLY)
(function ensureAdminTokenForChat() {
  const injectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzN2NiMzNlYS1jMTY0LTQ2NzgtYjRiZS1iYzQ1YjNjYzBlMTciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjExMjMwNjgsImV4cCI6MTc2MzcxNTA2OH0._w70r5faNPdbnAFeaPTuOneJzu-na0Yh_3l5bbNuWVU';
  const hasToken = !!localStorage.getItem('tokenauth');
  if (!hasToken) {
    localStorage.setItem('tokenauth', injectedToken);
  }

  const hasUser = !!localStorage.getItem('user');
  if (!hasUser) {
    const adminUser = {
      id: '37cb33ea-c164-4678-b4be-bc45b3cc0e17',
      username: 'Admin',
      email: 'admin@nike.dev',
      password: null,
      token: injectedToken,
    };
    localStorage.setItem('user', JSON.stringify(adminUser));
  }
})();
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

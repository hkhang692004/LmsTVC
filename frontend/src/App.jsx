import { BrowserRouter, Route, Routes } from 'react-router'
import StartPage from './pages/StartPage'
import SignInPage from './pages/SignInPage'
import { Toaster } from 'sonner'
function App() {

  return <>
    <Toaster />
    <BrowserRouter>
      <Routes>
        {/* public route */}
        <Route
          path='/'
          element={<StartPage />}
        ></Route>
        <Route
          path='/signin'
          element={<SignInPage />}
        ></Route>
      </Routes>
      {/* protected route */}
    </BrowserRouter>

  </>

}

export default App

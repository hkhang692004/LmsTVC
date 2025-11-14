import { BrowserRouter, Route, Routes } from 'react-router'
import StartPage from './pages/StartPage'
import SignInPage from './pages/SignInPage'
import { Toaster } from 'sonner'
import MyCoursePage from './pages/MyCoursePage'
function App() {

  return <>
    <Toaster richColors />
    <BrowserRouter>
      <Routes>
        {/* public route */}
        <Route
          path='/'
          element={<StartPage />}
        />
        <Route
          path='/signin'
          element={<SignInPage />}
        />

        {/* protected route */}
        <Route
          path='/mycourse'
          element={<MyCoursePage />}
        />
      </Routes>
    </BrowserRouter>

  </>

}

export default App

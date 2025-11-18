import { BrowserRouter, Route, Routes } from 'react-router'
import StartPage from './pages/StartPage'
import SignInPage from './pages/SignInPage'
import MyCoursePage from './pages/MyCoursePage'
import MyContent from './pages/MyContent'
import { Toaster } from 'sonner'

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
        <Route
          path='/mycontent'
          element={<MyContent />}
        />
      </Routes>
    </BrowserRouter>

  </>

}

export default App

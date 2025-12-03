import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './pages/main/ProtectedRoute'

import SignInPage from './pages/main/SignInPage'
import MyCoursePage from './pages/student/MyCoursePage'
import MyContent from './pages/student/MyContent'
import { Toaster } from 'sonner'
import Forum from './pages/student/Forum'
import Directory from './pages/student/Directory'
import ScrollOnChange from './components/myui/ScrollOnChange'
import ForumContent from './pages/student/ForumContent'
import Text from './pages/student/Text'
import UploadAssignment from './pages/student/UploadAssignment'
import TestExercise from './pages/student/TestExercise'
import DoTest from './pages/student/DoTest'
import StartPage from './pages/main/StartPage'

function App() {

  return <>

    <Toaster richColors />
    <BrowserRouter>
      <ScrollOnChange />
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
        {/* protected routes (wrapped by ProtectedRoute) */}
        <Route element={<ProtectedRoute />}>
          <Route path='/mycourse' element={<MyCoursePage />} />
          <Route path='/mycontent' element={<MyContent />} />
          <Route path='/forum' element={<Forum />} />
          <Route path='/directory' element={<Directory />} />
          <Route path='/forumcontent' element={<ForumContent />} />
          <Route path='/text' element={<Text />} />
          <Route path='/assignment' element={<UploadAssignment />} />
          <Route path='/test' element={<TestExercise />} />
          <Route path='/kiemtra' element={<DoTest />} />
        </Route>
      </Routes>
    </BrowserRouter>

  </>

}

export default App

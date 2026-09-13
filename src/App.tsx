import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Layout } from "./components/Layout"
import { EditProfilePage } from "./pages/EditProfile"
import { FeedPage } from "./pages/Feed"
import { LoginPage } from "./pages/Login"
import { NewProjectPage } from "./pages/NewProject"
import { PeerPage } from "./pages/PeerPage"
import { PeoplePage } from "./pages/People"
import { ProjectPage } from "./pages/ProjectPage"
import { StoreProvider } from "./store"

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            <Route path="/peer/:id" element={<PeerPage />} />
            <Route path="/me" element={<EditProfilePage />} />
            <Route path="/new" element={<NewProjectPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}

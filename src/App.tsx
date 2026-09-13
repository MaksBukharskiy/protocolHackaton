import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Layout } from "./components/Layout"
import { AnalyticsPage } from "./pages/Analytics"
import { BadgesPage } from "./pages/Badges"
import { EditProfilePage } from "./pages/EditProfile"
import { FeedPage } from "./pages/Feed"
import { LoginPage } from "./pages/Login"
import { ModeratePage } from "./pages/Moderate"
import { NewProjectPage } from "./pages/NewProject"
import { PeerPage } from "./pages/PeerPage"
import { PeoplePage } from "./pages/People"
import { OnePagerPage } from "./pages/OnePager"
import { OnePagersPage } from "./pages/OnePagers"
import { ProjectPage } from "./pages/ProjectPage"
import { ScoutPage } from "./pages/Scout"
import { StoreProvider } from "./store"

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/project/:id/onepager" element={<OnePagerPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/onepagers" element={<OnePagersPage />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            <Route path="/peer/:id" element={<PeerPage />} />
            <Route path="/me" element={<EditProfilePage />} />
            <Route path="/new" element={<NewProjectPage />} />
            <Route path="/scout" element={<ScoutPage />} />
            <Route path="/moderate" element={<ModeratePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}

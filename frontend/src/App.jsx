import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PhoneFrame from "./components/layout/PhoneFrame";
import BottomBar from "./components/layout/BottomBar";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// ── Auth pages (no bottom bar, no login required) ──────────────────────────
import LandingPage             from "./pages/auth/LandingPage";
import LoginPage               from "./pages/auth/LoginPage";
import SignUpPage              from "./pages/auth/SignUpPage";
import EmailVerificationPage   from "./pages/auth/EmailVerificationPage";
import LicenseVerificationPage from "./pages/auth/LicenseVerificationPage";

// ── Main app pages (require login, all wrapped in AppLayout) ───────────────
import HomePage        from "./pages/home/HomePage";
import CreatePage      from "./pages/create/CreatePage";
import RequestFormPage from "./pages/create/RequestFormPage";
import OfferFormPage   from "./pages/create/OfferFormPage";
import MessageListPage from "./pages/messages/MessageListPage";
import ChatRoomPage    from "./pages/messages/ChatRoomPage";
import MyProfilePage   from "./pages/profile/MyProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import UserProfilePage from "./pages/profile/UserProfilePage";
import SettingsPage    from "./pages/settings/SettingsPage";
import DeleteAccountPage from "./pages/settings/DeleteAccountPage";

import { ROUTES } from "./constants/routes";

// ─────────────────────────────────────────────────────────────────────────────
// AppLayout — the shell that wraps every logged-in screen.
//
// Structure (top to bottom inside PhoneFrame):
//   [scrollable page content]  ← children go here
//   [BottomBar]                ← pinned to bottom via position:absolute
//   [overlay]                  ← optional modal/sheet rendered ABOVE the scroll
//                                 container, so position:absolute works correctly
//
// WHY the overlay slot exists:
//   Modal.jsx uses `position: absolute` for its backdrop and slide-up sheet.
//   Those elements must be positioned relative to a container that fills the
//   whole screen (AppLayout's outer div, which has position:relative).
//   If Modal is rendered INSIDE the scroll div (overflow-y:auto), the browser
//   clips it — the modal never appears. Putting it in `overlay` places it as
//   a direct child of the outer div, outside the scroll container, so it
//   correctly covers the entire screen.
// ─────────────────────────────────────────────────────────────────────────────
function AppLayout({ children, overlay }) {
  return (
    <div
      style={{
        flex:          1,
        display:       "flex",
        flexDirection: "column",
        overflow:      "hidden",   // clips children; keeps scroll contained
        position:      "relative", // anchor for BottomBar and overlay's position:absolute
      }}
    >
      {/* ── Scrollable page content ──────────────────────────────────────── */}
      {/* paddingBottom prevents page content from hiding behind the BottomBar */}
      <div
        style={{
          flex:          1,
          overflowY:     "auto",
          paddingBottom: "calc(60px + env(safe-area-inset-bottom))",
          display:       "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>

      {/* ── Bottom navigation bar (Messages | Home | Profile + FAB) ─────── */}
      <BottomBar />

      {/* ── Modal/sheet overlay — rendered outside the scroll container ──── */}
      {/* This slot is used by CreatePage so its Modal.jsx backdrop and       */}
      {/* slide-up sheet anchor correctly to the full-screen AppLayout div.  */}
      {overlay}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* PhoneFrame constrains the app to 390px wide, 100dvh tall */}
      <PhoneFrame>
        <Routes>

          {/* ── AUTH FLOW ────────────────────────────────────────────────── */}
          {/* These pages have no BottomBar and require no login.            */}
          <Route path={ROUTES.LANDING}        element={<LandingPage />} />
          <Route path={ROUTES.LOGIN}          element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP}         element={<SignUpPage />} />
          <Route path={ROUTES.EMAIL_VERIFY}   element={<EmailVerificationPage />} />
          <Route path={ROUTES.LICENSE_UPLOAD} element={<LicenseVerificationPage />} />

          {/* ── HOME FEED ────────────────────────────────────────────────── */}
          <Route path={ROUTES.HOME} element={
            <ProtectedRoute>
              <AppLayout>
                <HomePage />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* ── CREATE FLOW ──────────────────────────────────────────────── */}
          {/*                                                                 */}
          {/* /create         → CreatePage (bottom-sheet chooser:            */}
          {/*                   "Request a Ride" or "Offer a Ride")          */}
          {/* /create/request → RequestFormPage (full form for passengers)   */}
          {/* /create/offer   → OfferFormPage   (full form for drivers only) */}
          {/*                                                                 */}
          {/* IMPORTANT: CreatePage is passed as `overlay`, NOT as a child,  */}
          {/* so its Modal renders outside the scroll container.             */}
          <Route path={ROUTES.CREATE} element={
            <ProtectedRoute>
              <AppLayout overlay={<CreatePage />}>
                <HomePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.CREATE_REQUEST} element={
            <ProtectedRoute>
              <AppLayout>
                <RequestFormPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.CREATE_OFFER} element={
            <ProtectedRoute>
              <AppLayout>
                <OfferFormPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* ── MESSAGES ─────────────────────────────────────────────────── */}
          {/* /messages        → list of all active group chats               */}
          {/* /messages/:roomId → individual group chat with GasBot           */}
          <Route path={ROUTES.MESSAGES} element={
            <ProtectedRoute>
              <AppLayout>
                <MessageListPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.CHAT} element={
            <ProtectedRoute>
              <AppLayout>
                <ChatRoomPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* ── PROFILE ──────────────────────────────────────────────────── */}
          {/* IMPORTANT: /profile/edit must be declared BEFORE /profile/:userId */}
          {/* or React Router will treat "edit" as a userId param.             */}
          <Route path={ROUTES.MY_PROFILE} element={
            <ProtectedRoute>
              <AppLayout>
                <MyProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.EDIT_PROFILE} element={
            <ProtectedRoute>
              <AppLayout>
                <EditProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.USER_PROFILE} element={
            <ProtectedRoute>
              <AppLayout>
                <UserProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* ── SETTINGS ─────────────────────────────────────────────────── */}
          <Route path={ROUTES.SETTINGS} element={
            <ProtectedRoute>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path={ROUTES.DELETE_ACCOUNT} element={
            <ProtectedRoute>
              <AppLayout>
                <DeleteAccountPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* ── FALLBACK ─────────────────────────────────────────────────── */}
          {/* Any unknown URL sends the user back to the landing page.        */}
          <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />

        </Routes>
      </PhoneFrame>
    </BrowserRouter>
  );
}

import { Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider, useStore } from "./state/store";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Workspace from "./pages/Workspace";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { authed } = useStore();
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { authed } = useStore();
  return (
    <Routes>
      <Route
        path="/login"
        element={authed ? <Navigate to="/projects" replace /> : <Login />}
      />
      <Route
        path="/projects"
        element={
          <RequireAuth>
            <Projects />
          </RequireAuth>
        }
      />
      <Route
        path="/p/:repoId/:itemId?"
        element={
          <RequireAuth>
            <Workspace />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppRoutes />
    </StoreProvider>
  );
}

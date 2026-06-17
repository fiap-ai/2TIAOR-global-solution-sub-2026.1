import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Chat } from "@/pages/Chat";
import { Dashboard } from "@/pages/Dashboard";
import { Knowledge } from "@/pages/Knowledge";
import { Login } from "@/pages/Login";
import { Predict } from "@/pages/Predict";
import { Vision } from "@/pages/Vision";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="predict" element={<Predict />} />
            <Route path="vision" element={<Vision />} />
            <Route path="chat" element={<Chat />} />
            <Route path="knowledge" element={<Knowledge />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

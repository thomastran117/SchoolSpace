import { Routes, Route } from "react-router-dom";
import mainRoutes from "./MainRoutes";
import authRoutes from "./AuthRoutes";
import adminRoutes from "./AdminRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {mainRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {authRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {adminRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Routes>
  );
}

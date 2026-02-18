import AdminPage from "@pages/admin/AdminHomePage";

type AppRoute = {
  path: string;
  element: React.ReactElement;
};

const adminRoutes: AppRoute[] = [
  { path: "/admin", element: <AdminPage /> },
];

export default adminRoutes;

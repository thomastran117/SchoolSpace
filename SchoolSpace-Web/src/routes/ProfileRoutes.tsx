import SearchProfilePage from "@pages/profile/SearchProfilePage";
import ViewProfilePage from "@pages/profile/ViewProfilePage";
import EditProfilePage from "@pages/profile/EditProfilePage";

type AppRoute = {
  path: string;
  element: React.ReactElement;
};

const profileRoutes: AppRoute[] = [
  { path: "/profiles/:id", element: <ViewProfilePage /> },
  { path: "/profiles/:id/edit", element: <EditProfilePage /> },
  { path: "/profiles/", element: <SearchProfilePage /> },
];

export default profileRoutes;

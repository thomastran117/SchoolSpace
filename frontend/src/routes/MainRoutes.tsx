import HomePage from "@pages/main/HomePage";
import HomePage2 from "@pages/main/HomePage2";
import HomePage3 from "@pages/main/HomePage3";

type AppRoute = {
  path: string;
  element: React.ReactElement;
};

const mainRoutes: AppRoute[] = [
  { path: "/", element: <HomePage /> },
  { path: "/home2", element: <HomePage2 /> },
  { path: "/home3", element: <HomePage3 /> },
];

export default mainRoutes;
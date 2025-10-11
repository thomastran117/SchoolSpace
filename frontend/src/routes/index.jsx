import authRoutes from "./AuthRoute";
import mainRoutes from "./MainRoute";
import courseRoutes from "./CourseRoute";
import profileRoutes from "./ProfileRoute";

const routes = [
  ...mainRoutes,
  ...authRoutes,
  ...courseRoutes,
  ...profileRoutes,
];

export default routes;

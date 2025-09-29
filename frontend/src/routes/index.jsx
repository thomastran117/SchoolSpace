import authRoutes from "./AuthRoute";
import mainRoutes from "./MainRoute";
import courseRoutes from "./CourseRoute";

const routes = [...mainRoutes, ...authRoutes, ...courseRoutes];

export default routes;

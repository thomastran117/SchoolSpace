import authRoutes from "./AuthRoute";
import mainRoutes from "./MainRoute";

const routes = [...mainRoutes, ...authRoutes];

export default routes;

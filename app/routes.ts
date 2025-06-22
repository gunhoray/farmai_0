import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("common/pages/home.tsx"),
  route("auth/login", "common/pages/auth/login.tsx"),
  route("auth/join", "common/pages/auth/join.tsx"),
  route("auth/confirm-signup", "common/pages/auth/confirm-signup.tsx"),
  route("auth/leave", "common/pages/auth/leave.tsx"),
  route("farms/myfarms", "features/pages/farms/myfarms.tsx"),
  route("farms/consulting/:farmId", "common/pages/consulting.tsx"),
] satisfies RouteConfig;

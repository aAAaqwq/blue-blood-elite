import { Outlet, createBrowserRouter } from "react-router";
import { AppProviders } from "@/components/providers/app-providers";

import HomePage from "@/pages/home";
import DiscoverPage from "@/pages/discover";
import TasksPage from "@/pages/tasks";
import TaskCreatePage from "@/pages/tasks/create";
import TaskDetailPage from "@/pages/tasks/detail";
import GrowthPage from "@/pages/growth";
import MePage from "@/pages/me";
import MeBountiesPage from "@/pages/me/bounties";
import MeConnectionsPage from "@/pages/me/connections";
import MeMessagesPage from "@/pages/me/messages";
import ChatPage from "@/pages/me/chat";
import ProfileDetailPage from "@/pages/profile/detail";
import ProfileEditPage from "@/pages/profile/edit";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import VerifyPage from "@/pages/verify";
import NotificationsPage from "@/pages/notifications";
import NotFoundPage from "@/pages/not-found";

function Layout() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/discover", element: <DiscoverPage /> },
      { path: "/tasks", element: <TasksPage /> },
      { path: "/tasks/create", element: <TaskCreatePage /> },
      { path: "/tasks/:id", element: <TaskDetailPage /> },
      { path: "/growth", element: <GrowthPage /> },
      { path: "/me", element: <MePage /> },
      { path: "/me/bounties", element: <MeBountiesPage /> },
      { path: "/me/connections", element: <MeConnectionsPage /> },
      { path: "/me/messages", element: <MeMessagesPage /> },
      { path: "/me/messages/:userId", element: <ChatPage /> },
      { path: "/profile/:id", element: <ProfileDetailPage /> },
      { path: "/profile/edit", element: <ProfileEditPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify", element: <VerifyPage /> },
      { path: "/notifications", element: <NotificationsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

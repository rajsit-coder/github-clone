import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useNavigate, useRoutes, useLocation } from "react-router-dom";

import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Signup from "./components/auth/Signup";
import Profile from "./components/user/Profile";
import CreateRepo from "./components/repo/CreateRepo";
import RepoDetail from "./components/repo/RepoDetail";
import CreateIssue from "./components/issue/CreateIssue";
import SearchResults from "./components/search/SearchResults";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser, loading } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (loading) return;

        const userIdFromStorage = localStorage.getItem("userId");

        if (userIdFromStorage && !currentUser) {
            setCurrentUser(userIdFromStorage);
        }

        if (!userIdFromStorage) {
            if (location.pathname !== "/auth" && location.pathname !== "/signup") {
                navigate("/auth", { replace: true });
            }
        }

        if (userIdFromStorage && location.pathname === "/auth") {
            navigate("/", { replace: true });
        }
    }, [currentUser, navigate, setCurrentUser, location.pathname, loading]);

    const element = useRoutes([
        { path: "/", element: <Dashboard /> },
        { path: "/auth", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        { path: "/create", element: <CreateRepo /> },
        { path: "/repo/:id", element: <RepoDetail /> },
        { path: "/repo/:id/issues/new", element: <CreateIssue /> },
        { path: "/search", element: <SearchResults /> },
        { path: "/profile", element: <Profile /> },
        { path: "/profile/:id", element: <Profile /> },
    ]);

    return element;
};

export default ProjectRoutes;

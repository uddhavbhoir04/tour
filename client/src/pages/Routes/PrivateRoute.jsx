import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Spinner from "../components/Spinner";
import { apiFetch } from "../../api/client";

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const [status, setStatus] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    if (!currentUser) return setStatus("denied");
    let cancelled = false;
    apiFetch("/api/user/user-auth")
      .then((res) => res.json())
      .then((data) => !cancelled && setStatus(data?.check ? "ok" : "denied"))
      .catch(() => !cancelled && setStatus("denied"));
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  if (status === "checking") return <Spinner />;
  if (status === "denied") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

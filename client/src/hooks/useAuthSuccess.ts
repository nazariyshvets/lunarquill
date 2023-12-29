import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const useAuthSuccess = () => {
  const { success } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (success) navigate("/profile");
  }, [navigate, success]);
};

export default useAuthSuccess;

import useAppSelector from "./useAppSelector";

const useAuth = () => useAppSelector((state) => state.auth);

export default useAuth;

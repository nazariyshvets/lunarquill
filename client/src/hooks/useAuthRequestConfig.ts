import useAuth from "./useAuth";

const useAuthRequestConfig = () => {
  const { userToken } = useAuth();

  return {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  };
};

export default useAuthRequestConfig;

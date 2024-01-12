import useAppSelector from "./useAppSelector";

const useRTC = () => useAppSelector((state) => state.rtc);

export default useRTC;

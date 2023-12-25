import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";

export default () => useDispatch<AppDispatch>();

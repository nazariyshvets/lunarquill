import ReactSwitch, { ReactSwitchProps } from "react-switch";
import { useWindowWidth } from "@react-hook/window-size";

import { MOBILE_SCREEN_THRESHOLD } from "../constants/constants";

const Switch = (props: ReactSwitchProps) => {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_SCREEN_THRESHOLD;

  return (
    <ReactSwitch
      key={windowWidth}
      width={isMobile ? 30 : 42}
      height={isMobile ? 15 : 21}
      handleDiameter={isMobile ? 13 : 19}
      onColor="#339933"
      offColor="#868686"
      uncheckedIcon={false}
      checkedIcon={false}
      activeBoxShadow="0 0 2px 3px #86C232"
      {...props}
    />
  );
};

export default Switch;

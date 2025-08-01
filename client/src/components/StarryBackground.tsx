import { useEffect } from "react";

import { useWindowSize } from "@react-hook/window-size";

import ShootingStar from "./ShootingStar";
import { SHOOTING_STARS_COUNT } from "../constants/constants";

const StarryBackground = () => {
  const [width, height] = useWindowSize();

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, []);

  const stars = Array.from({ length: SHOOTING_STARS_COUNT }, (_, i) => (
    <ShootingStar
      key={i}
      style={{
        left: `${Math.random() * (width + height)}px`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${1 + Math.random() * 2}s`,
      }}
    />
  ));

  return (
    <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-full bg-[#000000] bg-stars bg-repeat" />
      <div className="absolute right-0 top-0 h-full w-[10000px] animate-twinkling bg-transparent bg-twinkling bg-repeat" />
      {stars}
    </div>
  );
};

export default StarryBackground;

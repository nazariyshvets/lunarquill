import type { CSSProperties } from "react";

interface ShootingStarProps {
  style?: CSSProperties;
}

const ShootingStar = ({ style }: ShootingStarProps) => (
  <span
    className="absolute -top-4 h-1 w-1 animate-shooting-star rounded-[50%] bg-white shadow-shooting-star before:absolute before:top-1/2 before:h-[1px] before:w-72 before:-translate-y-1/2 before:bg-gradient-to-b before:from-white"
    style={style}
  />
);

export default ShootingStar;

import { PropsWithChildren } from "react";

const FeaturedUser = ({
  children,
}: PropsWithChildren<Record<never, never>>) => {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg bg-deep-black">
      {children}
    </div>
  );
};

export default FeaturedUser;

import { useEffect } from "react";

interface UseClickOutsideProps {
  element?: HTMLElement;
  onClickOutside: () => void;
}

const useClickOutside = ({ element, onClickOutside }: UseClickOutsideProps) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (element && !element.contains(event.target as Node)) onClickOutside();
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [element, onClickOutside]);
};

export default useClickOutside;

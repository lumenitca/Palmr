import { useTheme } from "@/hooks/use-theme";
import { Button } from "@heroui/button";
import { FC, useEffect, useState } from "react";
import { BsMoonFill, BsSunFill } from "react-icons/bs";

export const ThemeSwitch: FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-6 h-6" />;

  return (
    <Button
      isIconOnly
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="text-default-500 mr-2"
      size="sm"
      variant="light"
      onPress={toggleTheme}
    >
      {isDark ? <BsSunFill size={20} /> : <BsMoonFill size={18} />}
    </Button>
  );
};

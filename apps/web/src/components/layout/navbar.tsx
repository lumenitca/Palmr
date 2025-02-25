import { LanguageSwitcher } from "../general/language-switcher";
import { ThemeSwitch } from "@/components/general/theme-switch";
import { useAppInfo } from "@/contexts/app-info-context";
import { useAuth } from "@/contexts/auth-context";
import { logout as logoutAPI } from "@/http/endpoints";
import { Avatar } from "@heroui/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Link } from "@heroui/link";
import { Navbar as HeroUINavbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { useTranslation } from "react-i18next";
import { FaCog, FaSignOutAlt, FaUser, FaUsersCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const { t } = useTranslation();
  const { user, isAdmin, logout } = useAuth();
  const { appName, appLogo } = useAppInfo();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAPI();
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <HeroUINavbar
      className="bg-background/70 backdrop-blur-sm border-b border-default-200/50"
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link className="flex justify-start items-center gap-2" color="foreground" href="/dashboard">
            {appLogo && <img alt={t("navbar.logoAlt")} className="h-8 w-8 object-contain" src={appLogo} />}
            <p className="font-bold text-2xl">{appName}</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="flex gap-1">
          <LanguageSwitcher />
          <ThemeSwitch />

          <Dropdown className="flex" placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                className="cursor-pointer"
                classNames={{
                  img: "opacity-100",
                }}
                radius="sm"
                size="sm"
                src={user?.image as string}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label={t("navbar.profileMenu")} variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold text-sm">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="font-semibold text-xs">{user?.email}</p>
              </DropdownItem>
              <DropdownItem key="userprofile">
                <Link className="text-foreground text-sm flex items-center gap-2" href="/profile">
                  <FaUser />
                  {t("navbar.profile")}
                </Link>
              </DropdownItem>
              {isAdmin ? (
                <DropdownItem key="settings">
                  <Link className="text-foreground text-sm flex items-center gap-2" href="/settings">
                    <FaCog />
                    {t("navbar.settings")}
                  </Link>
                </DropdownItem>
              ) : null}
              {isAdmin ? (
                <DropdownItem key="analytics">
                  <Link className="text-foreground text-sm flex items-center gap-2" href="/admin">
                    <FaUsersCog />
                    {t("navbar.usersManagement")}
                  </Link>
                </DropdownItem>
              ) : null}
              <DropdownItem key="logout" color="danger">
                <button className="text-foreground text-sm flex items-center gap-2 w-full" onClick={handleLogout}>
                  <FaSignOutAlt />
                  {t("navbar.logout")}
                </button>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
}

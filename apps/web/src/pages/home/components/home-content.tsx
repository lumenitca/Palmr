import { HomeContentProps } from "../types";
import { BackgroundLights } from "./background-lights";
import { HomeHeader } from "./home-header";
import { GridPattern } from "@/components/ui/grid-pattern";
import { siteConfig } from "@/config/site";
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaGithub } from "react-icons/fa6";

export function HomeContent({ isLoading }: HomeContentProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 flex-grow">
      <GridPattern />
      <BackgroundLights />
      <section className="relative flex flex-col items-center justify-center gap-6 m-auto h-full">
        <HomeHeader title="🌴 Palmr." />
        <motion.div
          animate={{ opacity: 1 }}
          className="w-full text-lg lg:text-xl text-default-600 mt-4 text-center whitespace-normal"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {t("home.description")}
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex gap-3">
            <Link
              isExternal
              className={buttonStyles({
                color: "success",
                radius: "full",
                variant: "ghost",
              })}
              href={siteConfig.links.docs}
            >
              {t("home.documentation")}
            </Link>
            <Link
              isExternal
              className={buttonStyles({
                variant: "bordered",
                radius: "full",
                color: "success",
              })}
              href={siteConfig.links.github}
            >
              <FaGithub size={20} />
              {t("home.starOnGithub")}
            </Link>
          </div>

          <p className="text-sm opacity-70 max-w-md text-center">{t("home.privacyMessage")}</p>
        </motion.div>
      </section>
    </div>
  );
}

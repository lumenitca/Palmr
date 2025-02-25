import { HomeHeaderProps } from "../types";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function HomeHeader({ title }: HomeHeaderProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="inline-block max-w-xl text-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-8">
        <motion.span
          animate={{ scale: 1 }}
          className="text-4xl lg:text-6xl font-extrabold tracking-tight"
          initial={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.span>
        <div className="flex flex-col gap-2">
          <motion.span
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl lg:text-5xl font-semibold tracking-tight text-primary"
            initial={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {t("home.header.fileSharing")}
          </motion.span>
          <motion.span
            animate={{ opacity: 1, x: 0 }}
            className="text-[2.3rem] lg:text-5xl leading-9 font-semibold tracking-tight"
            initial={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {t("home.header.tagline")}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

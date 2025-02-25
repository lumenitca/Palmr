import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function LoginHeader() {
  const { t } = useTranslation();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="flex flex-col gap-1"
      initial={{ opacity: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <h1 className="text-2xl font-semibold tracking-tight text-center mb-4">{t("login.welcome")}</h1>
      <p className="text-default-500">{t("login.signInToContinue")}</p>
    </motion.div>
  );
}

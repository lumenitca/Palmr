import { motion } from "framer-motion";

export function GridPattern() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ opacity: 0.4 }}
        className="absolute inset-0 bg-grid-pattern bg-[length:50px_50px] dark:opacity-10 opacity-20"
        initial={{ opacity: 0 }}
        transition={{ duration: 1 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  );
}

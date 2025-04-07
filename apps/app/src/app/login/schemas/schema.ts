import * as z from "zod";
import { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const createLoginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.invalidEmail")),
    password: z
      .string()
      .min(1, t("validation.passwordRequired"))
  });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
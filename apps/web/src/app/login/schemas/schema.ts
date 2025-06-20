import { useTranslations } from "next-intl";
import * as z from "zod";

type TFunction = ReturnType<typeof useTranslations>;

export const createLoginSchema = (t: TFunction) =>
  z.object({
    emailOrUsername: z.string().min(1, t("validation.emailOrUsernameRequired")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

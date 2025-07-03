import { useRouter } from "next/navigation";
import { IconDeviceDesktopDown, IconFoldersFilled, IconShare2 } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";

export function QuickAccessCards() {
  const t = useTranslations();
  const router = useRouter();

  const QUICK_ACCESS_ITEMS = [
    {
      title: t("quickAccess.files.title"),
      icon: <IconFoldersFilled size={28} />,
      description: t("quickAccess.files.description"),
      path: "/files",
      color: "bg-primary",
    },
    {
      title: t("quickAccess.shares.title"),
      icon: <IconShare2 size={28} />,
      description: t("quickAccess.shares.description"),
      path: "/shares",
      color: "bg-orange-400",
    },
    {
      title: t("quickAccess.reverseShares.title"),
      icon: <IconDeviceDesktopDown size={28} />,
      description: t("quickAccess.reverseShares.description"),
      path: "/reverse-shares",
      color: "bg-blue-500",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {QUICK_ACCESS_ITEMS.map((card) => (
        <Card
          key={card.title}
          className="cursor-pointer transform transition-all hover:bg-card/80"
          onClick={() => router.push(card.path)}
        >
          <CardContent>
            <div className="flex flex-col gap-4">
              <div
                className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-sm`}
              >
                {card.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

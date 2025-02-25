import { Card, CardBody } from "@heroui/card";
import { useTranslation } from "react-i18next";
import { FaFolderOpen, FaShareAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export function QuickAccessCards() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const QUICK_ACCESS_ITEMS = [
    {
      title: t("quickAccess.files.title"),
      icon: <FaFolderOpen className="text-3xl" />,
      description: t("quickAccess.files.description"),
      path: "/files",
      color: "bg-primary-500",
    },
    {
      title: t("quickAccess.shares.title"),
      icon: <FaShareAlt className="text-3xl" />,
      description: t("quickAccess.shares.description"),
      path: "/shares",
      color: "bg-warning-500",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {QUICK_ACCESS_ITEMS.map((card) => (
        <Card
          key={card.title}
          isPressable
          className="cursor-pointer transform transition-all hover:scale-105"
          onPress={() => navigate(card.path)}
        >
          <CardBody className="p-6">
            <div className="flex flex-col gap-4">
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                {card.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

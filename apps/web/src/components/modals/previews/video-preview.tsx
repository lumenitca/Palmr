import { useTranslations } from "next-intl";

interface VideoPreviewProps {
  src: string;
}

export function VideoPreview({ src }: VideoPreviewProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="w-full max-w-4xl">
        <video controls className="w-full rounded-lg" preload="metadata" style={{ maxHeight: "70vh" }}>
          <source src={src} />
          {t("filePreview.videoNotSupported")}
        </video>
      </div>
    </div>
  );
}

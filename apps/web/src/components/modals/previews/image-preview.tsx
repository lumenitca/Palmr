import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  return (
    <AspectRatio ratio={16 / 9} className="bg-muted">
      <img src={src} alt={alt} className="object-contain w-full h-full rounded-md" />
    </AspectRatio>
  );
}

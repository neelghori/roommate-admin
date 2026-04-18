import Image from "next/image";

/** Place `public/roomatelogo.png` in the app (repo root `public/` folder). */
const LOGO_SRC = "/roomatelogo.png";

type RoommatLogoProps = {
  className?: string;
  variant?: "stack" | "inline";
};

export function RoommatLogo({
  className = "",
  variant = "stack",
}: RoommatLogoProps) {
  if (variant === "inline") {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <Image
          src={LOGO_SRC}
          alt="Roommat"
          width={200}
          height={48}
          className="h-9 w-auto max-h-10 object-contain object-left sm:h-10"
          priority
        />
      </span>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Image
        src={LOGO_SRC}
        alt="Roommat"
        width={240}
        height={64}
        className="h-12 w-auto max-w-[min(100%,280px)] object-contain sm:h-14"
        priority
      />
    </div>
  );
}

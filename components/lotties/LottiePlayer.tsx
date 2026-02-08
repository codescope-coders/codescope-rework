import clsx from "clsx";
import { useCallback } from "react";
import { useLottie } from "lottie-react";

function LottiePlayer({
  animationData,
  children,
  className,
  color = "text-black",
  loop = false,
  autoplay = false,
  iconClassName,
  onClick,
  hoverInSegment = [0, 30],
  hoverOutSegment = [30, 60],
}: {
  readonly animationData: object;
  readonly className?: string;
  readonly color?: string;
  readonly loop?: boolean;
  readonly autoplay?: boolean;
  readonly children?: React.ReactNode;
  readonly iconClassName?: string;
  readonly onClick?: () => void;
  readonly hoverInSegment?: [number, number];
  readonly hoverOutSegment?: [number, number];
}) {
  const { View, pause, playSegments, setSpeed } = useLottie({
    animationData,
    loop,
    autoplay,
    onComplete: () => pause(),
  });

  const handleMouseEnter = useCallback(() => {
    playSegments(hoverInSegment, true);
  }, [hoverInSegment, playSegments]);

  const handleMouseLeave = useCallback(() => {
    playSegments(hoverOutSegment, true);
    setSpeed(1.4);
  }, [hoverOutSegment, playSegments]);

  return (
    <div
      aria-hidden="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(color, className)}
      onClick={onClick}
    >
      <div className={clsx("shrink-0", iconClassName)}>{View}</div>
      {children}
    </div>
  );
}

export default LottiePlayer;

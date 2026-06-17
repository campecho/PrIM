import { useState, useRef, useEffect } from "react";

export function TruncateWithTooltip({
  text,
  as: Component = "div",
  className = "",
}: {
  text: string;
  as?: any;
  className?: string;
}) {
  const textRef = useRef<HTMLElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(
          textRef.current.scrollWidth > textRef.current.clientWidth ||
            textRef.current.scrollHeight > textRef.current.clientHeight,
        );
      }
    };

    checkTruncation();
    const observer = new ResizeObserver(checkTruncation);
    if (textRef.current) {
      observer.observe(textRef.current);
    }
    return () => observer.disconnect();
  }, [text]);

  return (
    <Component
      ref={textRef}
      className={`${className.includes("line-clamp") ? "" : "truncate"} ${className}`}
      title={isTruncated ? text : undefined}
    >
      {text}
    </Component>
  );
}

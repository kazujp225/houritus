"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    threshold?: number;
    direction?: "up" | "down" | "left" | "right";
    delay?: number;
}

export default function ScrollReveal({
    children,
    className = "",
    threshold = 0.1,
    direction = "up",
    delay = 0,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold,
                rootMargin: "0px 0px -50px 0px",
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    const getTransform = () => {
        switch (direction) {
            case "up":
                return "translateY(30px)";
            case "down":
                return "translateY(-30px)";
            case "left":
                return "translateX(30px)";
            case "right":
                return "translateX(-30px)";
            default:
                return "translateY(30px)";
        }
    };

    const style = {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate(0, 0)" : getTransform(),
        transition: `opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`,
        willChange: "opacity, transform",
    };

    return (
        <div ref={ref} className={className} style={style}>
            {children}
        </div>
    );
}

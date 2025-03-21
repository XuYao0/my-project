import { createContext, useRef, useEffect } from "react";

export const keyContext = createContext();

export const KeyProvider = ({ children }) => {
    const keySpace = useRef(0);
    const keyArrowRight = useRef(0);
    const keyArrowLeft = useRef(0);
    const keyB = useRef(0);
    const keyS = useRef(0);

    const listeners = useRef(new Set()); // 存储子组件注册的effect触发函数

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === " ") {
                e.preventDefault();
                keySpace.current += 1;
                triggerEffects("Space");
            }
            if (e.key === "ArrowRight") {
                keyArrowRight.current += 1;
                triggerEffects("ArrowRight");
            }
            if (e.key === "ArrowLeft") {
                keyArrowLeft.current += 1;
                triggerEffects("ArrowLeft");
            }
            if (e.key === "b" || e.key === "B") {
                keyB.current += 1;
                triggerEffects("B");
            }
            if (e.key === "s" || e.key === "S") {
                keyS.current += 1;
                triggerEffects("S");
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [])

    const triggerEffects = (key) => {
        listeners.current.forEach((fn) => fn(key));
    }

    return (
        <keyContext.Provider value={{ keySpace, keyArrowRight, keyArrowLeft, keyB, keyS, listeners }}>
            {children}
        </keyContext.Provider>
    )
}
import { createContext, useRef, useEffect, useContext } from "react";

const keyContext = createContext();

export const KeyProvider = ({ children }) => {
    const listeners = useRef(new Set()); // 存储子组件注册的effect触发函数

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === " ") {
                e.preventDefault();
                triggerEffects("Space");
            }
            if (e.key === "ArrowRight") {
                triggerEffects("ArrowRight");
            }
            if (e.key === "ArrowLeft") {
                triggerEffects("ArrowLeft");
            }
            if (e.key === "b" || e.key === "B") {
                triggerEffects("B");
            }
            if (e.key === "s" || e.key === "S") {
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
        <keyContext.Provider value={{ listeners }}>
            {children}
        </keyContext.Provider>
    )
}

// 自定义hook，直接获取全部的state和dispatch
export const useKeyContext = () => {
  const context = useContext(keyContext);
  if (!context) {
    throw new Error('useKeyContext must be used within KeyProvider');
  }
  return context;
};

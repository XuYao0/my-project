import { useEffect } from "react";
import { usePlayerContext } from "../../../context/PlayerContext";
import { useKeyContext } from "../../../context/KeyContext";
import { useAudioControl } from "../../../hooks/useAudioControl";

export default function BreakpointButton({}) {
    const { state } = usePlayerContext();
    const { handleBreakpointAdd } = useAudioControl();

    // todo 监听键盘B
    const {listeners} = useKeyContext();
    useEffect(() => {
        const effectHanlder = (key) => {
            if (key === "B") handleBreakpointAdd()
        }
        listeners.current.add(effectHanlder)
        return () => listeners.current.delete(effectHanlder)
    }, [state.breakpoint]) // 同PlayButton里的闭包，必须依赖breakpoint，否则里面的breakpoint永远是同一个值

    return (
        <button onClick = {handleBreakpointAdd} disabled = {state.playingIndex === null} className = "button breakpoint">添加断点</button>
    )
}
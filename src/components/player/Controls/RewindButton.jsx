import { useEffect } from "react";
import { usePlayerContext } from "../../../context/PlayerContext";
import { useKeyContext } from "../../../context/KeyContext";
import { useAudioControl } from "../../../hooks/useAudioControl";

export default function RewindButton({}) {
    const { state } = usePlayerContext();
    const { handleRewind } = useAudioControl();


    // 监听方向键左
    const {listeners} = useKeyContext();
    useEffect(() => {
        const effectHanlder = (key) => {
            if (key === "ArrowLeft") handleRewind()
        }
        listeners.current.add(effectHanlder)
        return () => listeners.current.delete(effectHanlder)
    }, [])  // 这里不需要依赖，因为内部函数使用的 audioRef 和 setProgress 是固定的。即便audio的src发生变化，但也仅仅是audio的一个属性变化，并不是audio发生了变化
    // 要使audio发生变化，必须要react重新挂载audio这个标签，这样的话，整个player组件都会重新挂载，这个useEffect也会重新挂载，所以不需要依赖

    return (
        <button onClick = {handleRewind} disabled = {state.playingIndex === null} className = "button move left">REW</button>
    )
}
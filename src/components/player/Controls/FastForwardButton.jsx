import { useEffect } from "react";
import { usePlayerContext } from "../../../context/PlayerContext";
import { useKeyContext } from "../../../context/KeyContext";
import { useAudioControl } from "../../../hooks/useAudioControl";

export default function FastForwardButton({}) {
    const { state } = usePlayerContext();
    const { handleFastForward } = useAudioControl();

    //todo 监听方向键右
    const {listeners} = useKeyContext();
    useEffect(() => {
        const effectHanlder = (key) => {
            if (key === "ArrowRight") handleFastForward()
        }
        listeners.current.add(effectHanlder)
        return () => listeners.current.delete(effectHanlder)
    }, [])

    return (
        <button onClick = {handleFastForward} disabled = {state.playingIndex === null} className = "button move right">FF</button>
    )
}
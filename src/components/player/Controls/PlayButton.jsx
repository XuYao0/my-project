import { useEffect } from "react";
import { usePlayerContext } from "../../../context/PlayerContext";
import { useKeyContext } from "../../../context/KeyContext";
import { useAudioControl } from "../../../hooks/useAudioControl";

export default function PlayButton({}) {
  const { state } = usePlayerContext();
  const { togglePlay } = useAudioControl();

  // 监听空格键
  const {listeners} = useKeyContext();
  useEffect(() => {
      const effectHanlder = (key) => {
          if (key === "Space") togglePlay()
      }
      listeners.current.add(effectHanlder)
      return () => listeners.current.delete(effectHanlder)
  }, [state.isPlaying])
  
  return (
      <button className = "button play" onClick = {togglePlay} disabled = {state.playingIndex === null}>
          {state.isPlaying? "⏸" : "▶"}
      </button>
  )
}
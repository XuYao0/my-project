import { useEffect } from "react";
import { usePlayerContext } from "../../../context/PlayerContext";
import { useAudioControl } from "../../../hooks/useAudioControl";

export default function ModeButton({}) {
    const { state, dispatch, audioRef } = usePlayerContext();
    const { isLooping, loopingStart, loopingEnd, cycle } = state;
    const { handleModeChange } = useAudioControl();

    // 使音频在断点之间循环播放
    useEffect(() => {
        if (isLooping && (loopingStart !== 0 || loopingEnd !== 0)) {
            if (audioRef.current.currentTime >= loopingEnd) {
                audioRef.current.currentTime = loopingStart;
                const newProgress = (audioRef.current.currentTime / audioRef.current.duration) * 10000;
                dispatch({ type: 'UPDATE_PROGRESS', payload: newProgress });
                dispatch({ type: 'SET_PLAYING', payload: true });
            }
            if (audioRef.current.currentTime < loopingStart) {
                audioRef.current.currentTime = loopingStart;
                const newProgress = (audioRef.current.currentTime / audioRef.current.duration) * 10000;
                dispatch({ type: 'UPDATE_PROGRESS', payload: newProgress });
            }
        }
    }, [state.progress, state.isLooping, state.loopingStart, state,loopingEnd]);
    // todo 文件切换 useEffect(() => setIsLooping(false), [playingIndex])

    useEffect(() => {
        if (cycle.length === 3) {
            const newStart = cycle[1] > cycle[2] ? cycle[2] : cycle[1];
            const newEnd = cycle[1] > cycle[2] ? cycle[1] : cycle[2];
            dispatch({ type: 'UPDATE_LOOPINGSTATE', payload: [newStart, newEnd] })
        }
    },[cycle])

    useEffect(() => {
        dispatch({ type: 'EXIT_CYCLE' })
    }, [state.playingIndex])

    return (
        <select value = {state.isLooping} onChange = {(e) => handleModeChange(e.target.value)} disabled = {state.playingIndex === null} className = "button mode">
            <option value = "false">正常模式</option>
            <option value = "true">断点循环</option>
        </select>
    );
}
import { useEffect, useRef } from "react";
import { usePlayerContext } from "../../../context/PlayerContext";
import { useAudioControl } from "../../../hooks/useAudioControl";

export default function SpeedButton({}) {
    const { state, dispatch } = usePlayerContext()
    const { handleSpeedChange } = useAudioControl()

    // // 监控键盘S
    // const {listeners} = useContext(keyContext)
    const selectRef = useRef(null)
    // useEffect(() => {
    //     const effectHanlder = (key) => {
    //         if (key === "S") {
    //             selectRef.current.focus()   // 使select获得焦点，从而可以通过上下键改变速度
    //         }
    //     }
    //     listeners.current.add(effectHanlder)
    //     return () => listeners.current.delete(effectHanlder)
    // }, [])

    useEffect(() => {
        dispatch({ type: 'SET_SPEED', payload: 1 })
    }, [state.playingIndex])

    return (
        <select ref = {selectRef} value = {state.speed} onChange = {handleSpeedChange} disabled = {state.playingIndex === null} className = "button speed">
            <option value = "1">1x</option>
            <option value = "0.5">0.5x</option>
            <option value = "0.6">0.6x</option>
            <option value = "0.7">0.7x</option>
            <option value = "0.8">0.8x</option>
            <option value = "0.9">0.9x</option>
            <option value = "1.1">1.1x</option>
            <option value = "1.2">1.2x</option>
            <option value = "1.3">1.3x</option>
            <option value = "1.4">1.4x</option>
            <option value = "1.5">1.5x</option>
            <option value = "1.6">1.6x</option>
            <option value = "1.7">1.7x</option>
            <option value = "1.8">1.8x</option>
            <option value = "1.9">1.9x</option>
            <option value = "2">2x</option>
        </select>
    )
}
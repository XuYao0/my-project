
import { useRef } from "react";
import { usePlayerContext } from "../../../context/PlayerContext";
import { useAudioControl } from "../../../hooks/useAudioControl";

export default function FileButton({}) {
    const { state } = usePlayerContext();
    const { handleFileChange } = useAudioControl();
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
      };
    
    return (
        <div>
            <input 
                type="file" 
                accept="audio/*"
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style = {{display: "none"}} 
            />
            <button onClick={handleButtonClick} className = "button file" disabled = {state.cycle.length !== 0}>选择文件</button>
        </div>
    )
}
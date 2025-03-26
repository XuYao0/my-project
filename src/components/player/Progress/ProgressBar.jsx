import { usePlayerContext } from '../../../context/PlayerContext';
import { useAudioControl } from '../../../hooks/useAudioControl';


export default function ProgressBar({}) {
  const { state } = usePlayerContext();
  const { handleSeek } = useAudioControl(state.audioRef);

  return (
      <input
          type="range"
          min="0"
          max="10000"
          value={state.progress}
          onChange={handleSeek}
          className="progress-bar"
          disabled = {state.playingIndex === null}
    />
  )
}
import { useState, useRef } from 'react';
import { usePlayerContext } from '../../../context/PlayerContext';
import { useAudioControl } from '../../../hooks/useAudioControl';

function PlayListItem({name, index}) {
    const { state, dispatch, audioRef } = usePlayerContext();
    const { fileName, Url, breakpoint, breakpointText, playingIndex } = state;
    const { handlePlayListItemDelete, handlePlayListItemClick, handlePlayListItemSubmit } = useAudioControl();

    const [isEditing, setIsEditing] = useState(false)
    const [inputValue, setInputValue] = useState('') // 在编辑模式下读取用户输入的值
    const inputRef = useRef(null) // 用以控制input聚焦
    const clickTimeout = useRef(null); // 存储单击延时器

    
    const handleDblClick = () => {
        clearTimeout(clickTimeout.current) // 清除单击事件
        setIsEditing(true) // 进入编辑模式
        setInputValue('') // 避免第二次修改时，input框里是第一次修改后的名字
        setTimeout(() => inputRef.current.focus(), 0) // 等待DOM更新后聚焦
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handlePlayListItemSubmit(index, setIsEditing, inputValue);
        }
    }

    return (
        <div className = "list-item">
            <div onClick = {() => handlePlayListItemDelete(index)} className = "delete">x</div> {/*播放列表中的删去按钮 */}
            {isEditing? <input 
                ref = {inputRef}
                type = "text"
                value = {inputValue}
                onChange = {(e) => setInputValue(e.target.value)} 
                onKeyDown = {(e) => handleKeyDown(e, index)} // 如果不传index，是不需要传e的，默认传过去，在handleKeyDown的箭头函数里直接接收就好了
                onBlur = {() => handlePlayListItemSubmit(index, setIsEditing, inputValue)}
            />
            :<div onClick = {() => handlePlayListItemClick(index, clickTimeout)} onDoubleClick = {handleDblClick} className = "word">{name}</div>}
            {/*播放列表中的跳转按钮，双击重命名 */}
        </div>
    )
}

export default function PlayList({fileName, ...rest}) {
    const { state } = usePlayerContext();

    return (
        <div className = "itembar">
            {state.fileName.map((name, index) => {
                return (
                    <PlayListItem key = {index} {...{name, index}}></PlayListItem>
                )
            })}
        </div>
    )
}
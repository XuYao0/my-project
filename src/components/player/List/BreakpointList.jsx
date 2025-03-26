import { useEffect, useRef, useState } from 'react';
import { usePlayerContext } from '../../../context/PlayerContext';

function BreakpointListItem({time, index}) {
    const { state, dispatch, audioRef } = usePlayerContext()
    const { breakpoint, breakpointText, playingIndex, cycle } = state
    const clickTimeout = useRef(null); // 使用 ref 来保持定时器
    const inputRef = useRef(null) // 用以控制input聚焦
    const [isEditing, setIsEditing] = useState(false)
    const [inputValue, setInputValue] = useState('') // 在编辑模式下读取用户输入的数据
    const [clicked, setClicked] = useState(false) // 控制是否处于断点模式下被点击

    const handleDelete = (index) => {
        // 如果断点集合的下标与playingIndex一样，那就留下该元素数组中下标与index不一样的
        // 如果断点数组的下标与playingIndex不一样，那就直接留下整个元素数组
        const newBreakpoint = breakpoint.map((item, i) => {
            if (playingIndex === i) {
                return item.filter((_, j) => j !== index)
            }
            else return item
        })
        dispatch({ type: 'UPDATE_BREAKPOINT', payload: newBreakpoint })
        // 断点名集合同理
        const newBreakpointText = breakpointText.map((item, i) => {
            if (playingIndex === i) {
                return item.filter((_, j) => j !== index)
            }
            else return item
        })
        dispatch({ type: 'UPDATE_BREAKPOINTTEXT', payload: newBreakpointText })
    }

    // todo
    const handleClick = (time) => {
        clearTimeout(clickTimeout.current)
        clickTimeout.current = setTimeout(() => {
            audioRef.current.currentTime = time;
            dispatch({ type: 'UPDATE_PROGRESS', payload: (time / audioRef.current.duration) * 10000 })
        }, 300); // 延时 500 毫秒，以和双击事件区分。但如果500毫秒大于js判断double click的时间，比如200毫秒，那么每隔250毫秒点击一下，单击事件和双击事件都不会执行
      };
    
    const handleDblClick = () => {
        clearTimeout(clickTimeout.current); // 清除单击事件的定时器
        setIsEditing(true) // 进入编辑名字模式
        setInputValue('') // 避免第二次修改时，input框里是第一次修改后的名字
        setTimeout(() => inputRef.current.focus(), 0) // 等待DOM更新后聚焦
    };

    const handleSubmit = (index) => {
        if (inputValue.trim() === '') {
            setIsEditing(false)
            return
        };  // 空则不修改
        const newBreakpointText = breakpointText.map((item, i) => { // 替换指定下标的断点名
            if (playingIndex === i) return item.map((text, j) => {
                if (index === j) return "断点" + (index+1) + " : " + inputValue
                else return text
            })
            else return item
        })
        dispatch({ type: 'UPDATE_BREAKPOINTTEXT', payload: newBreakpointText })
        setIsEditing(false)
    }

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(index);
        }
    }

    useEffect(() => {
        if (cycle.length === 3) {
            setClicked(false)
        }
    }, [cycle])  // 清空状态，免得第二次设置循环模式时，该项还是处于被选中的状态

    return (
        <>
        {cycle.length !== 0? 
            <div className = {`btn ${clicked ? "list-item-cycle click" : "list-item-cycle"}`} onClick = {() => {
                dispatch({ type: 'UPDATE_CYCLE', payload: [...cycle, time] })
                setClicked(true)
            }}>
                <div className = "delete">x</div>
                <div className = "word">{breakpointText[playingIndex][index]}</div>
            </div> :
            <div className = "list-item">
                <div onClick = {() => handleDelete(index)} className = "delete">x</div>
                {isEditing? <input 
                    ref = {inputRef}
                    type = "text"
                    value = {inputValue}
                    onChange = {(e) => setInputValue(e.target.value)} 
                    onKeyDown = {(e) => handleKeyDown(e, index)} // 如果不传index，是不需要传e的，默认传过去，在handleKeyDown的箭头函数里直接接收就好了
                    onBlur = {() => handleSubmit(index)}
                />
                :<div onClick = {() => handleClick(time)} onDoubleClick = {handleDblClick} className = "word">{breakpointText[playingIndex][index]}</div>}
            </div>
            }
        </>
    )
}

export default function BreakPointList({}) {
    const { state, dispatch, audioRef } = usePlayerContext()
    const { cycle, breakpoint, playingIndex } = state
    const [click1, setClick1] = useState(false) // 控制开头和结尾两个断点被点击后的背景色
    const [click2, setClick2] = useState(false)

    useEffect(() => {
        if (cycle.length === 3) {
            setClick1(false)
            setClick2(false)
        }
    }, [cycle])  // 清空状态，免得第二次设置循环模式时，这俩还是处于被选中的状态

    return (
        <div className = "itembar">
            {cycle.length !== 0? <div className = {`btn ${click1 ? "list-item-cycle click" : "list-item-cycle"}`} onClick = {() => {
                    dispatch({ type: 'UPDATE_CYCLE', payload: [...cycle, 0] })
                    setClick1(true)}}>开头</div> : <></>}
            {playingIndex === null? <></> : breakpoint[playingIndex].map((time, index) => {
                // 上面这一行，假如playingIndex不存在，那么就返回空标签。如果playingIndex存在，但尚未设置断点，那访问断点数组会返回undefined，所以还是要加上“或空数组”
                return (
                    <BreakpointListItem key = {index} {...{time, index}}></BreakpointListItem>
                )
            })}
            {cycle.length !== 0? <div className = {`btn ${click2 ? "list-item-cycle click" : "list-item-cycle"}`} onClick = {() => {
                    dispatch({ type: 'UPDATE_CYCLE', payload: [...cycle, audioRef.current.duration] })
                    setClick2(true)}}>结尾</div> : <></>}
        </div>
    )
}
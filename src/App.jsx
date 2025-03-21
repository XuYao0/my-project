import { useState, useRef, useEffect, useContext } from "react";
import { KeyProvider, keyContext } from "./KeyContext";
import "./App.css"; // 引入 CSS 文件


function ProgressBar({playingIndex, progress, setProgress, audioRef, setIsPlaying}) {
    // **拖动进度条**
    const handleSeek = (e) => {
        console.log(e.target.value);
        const newTime = (e.target.value / 10000) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setProgress(e.target.value);
        if(audioRef.current.paused) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <input
            type="range"
            min="0"
            max="10000"
            value={progress}
            onChange={handleSeek}
            className="progress-bar"
            disabled = {playingIndex === null}
      />
    )
}

function FileButton({setPlayingIndex, Url, setUrl, fileName, setFileName, breakpoint, setBreakpoint, breakpointText, setBreakpointText, cycle}) {
    const fileInputRef = useRef(null);

    // 处理文件上传后的行为
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file); // 创建本地URL
            const len = Url.length
            setUrl([...Url, url]);
            setFileName([...fileName, file.name]);
            setBreakpoint([...breakpoint, []]) // 在断点集合中新增一个断点数组
            setBreakpointText([...breakpointText, []]) // 在断点名集合中新增一个断点名数组
            setPlayingIndex(len) // 设定播放下标
        }
    };

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
            <button onClick={handleButtonClick} className = "button file" disabled = {cycle.length !== 0}>选择文件</button>
        </div>
    )
}

function ModeButton({playingIndex, progress, setProgress, cycle, setCycle, audioRef, setIsPlaying}) {
    const [isLooping, setIsLooping] = useState(false); // 控制是否循环
    const [start, setStart] = useState(0); // 断点循环的起始时间
    const [end, setEnd] = useState(0); // 断点循环的结束时间

    // 处理正常模式和断点循环模式的切换
    const changeMode = (value) => {
        if (value === "false") {
            // 退出循环模式
            setIsLooping(false);
            setCycle([0, 0, 0])
        } else {
            // 进入循环模式
            setIsLooping(true)
            setCycle([0])
        }
    };

    // 监听音频的播放进度，确保在断点循环模式下控制播放
    useEffect(() => {
        if (isLooping && (start !== 0 || end !== 0)) {
            if (audioRef.current.currentTime >= end) {
                audioRef.current.currentTime = start;
                setProgress((audioRef.current.currentTime / audioRef.current.duration) * 10000);
                setIsPlaying(true)
            }
            if (audioRef.current.currentTime < start) {
                audioRef.current.currentTime = start;
                setProgress((audioRef.current.currentTime / audioRef.current.duration) * 10000);
            }
        }
    }, [progress, isLooping, start, end]);

    useEffect(() => {
        if (cycle.length === 3) {
            const newStart = cycle[1] < cycle[2]? cycle[1]: cycle[2]
            const newEnd = cycle[1] >= cycle[2]? cycle[1]: cycle[2]
            setStart(newStart)
            setEnd(newEnd)
            setCycle([])
        } // 当选定两个断点后，设置循环起点和终点，同时清空cycle状态
    }, [cycle])

    useEffect(() => setIsLooping(false), [playingIndex])

    return (
        <select value = {isLooping} onChange = {(e) => changeMode(e.target.value)} disabled = {playingIndex === null} className = "button mode">
            <option value = "false">正常模式</option>
            <option value = "true">断点循环</option>
        </select>
    );
}

function SpeedButton({playingIndex, audioRef}) {
    const [speed, setSpeed] = useState(1)
    const handleChange = ((e) => {
        const newSpeed = parseFloat(e.target.value)
        audioRef.current.playbackRate = newSpeed
        setSpeed(newSpeed)
    })

    useEffect(() => {
        setSpeed(1)
    }, [playingIndex])

    // 监控键盘S
    const {listeners} = useContext(keyContext)
    const selectRef = useRef(null)
    useEffect(() => {
        const effectHanlder = (key) => {
            if (key === "S") {
                selectRef.current.focus()   // 使select获得焦点，从而可以通过上下键改变速度
            }
        }
        listeners.current.add(effectHanlder)
        return () => listeners.current.delete(effectHanlder)
    }, [])

    return (
        <select ref = {selectRef} value = {speed} onChange = {handleChange} disabled = {playingIndex === null} className = "button speed">
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

function PlayButton({playingIndex, isPlaying, setIsPlaying}) {
    return (
        <button className = "button play" onClick = {() => setIsPlaying(!isPlaying)} disabled = {playingIndex === null}>
            {isPlaying? "⏸" : "▶"}
        </button>
    )
}

function FastForwardButton({playingIndex, setProgress, audioRef}) {
    const {listeners} = useContext(keyContext)

    const handleFastForward = () => {
        const time = audioRef.current.currentTime;
        if(time + 5 > audioRef.current.duration) {
            audioRef.current.currentTime = audioRef.current.duration;
        }
        else {
            audioRef.current.currentTime = time + 5;
        }
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 10000);
    }

    // 监听方向键右
    useEffect(() => {
        const effectHanlder = (key) => {
            if (key === "ArrowRight") handleFastForward()
        }
        listeners.current.add(effectHanlder)
        return () => listeners.current.delete(effectHanlder)
    }, [])

    return (
        <button onClick = {() => handleFastForward()} disabled = {playingIndex === null} className = "button move right">FF</button>
    )
}

function RewindButton({playingIndex, setProgress, audioRef}) {
    const {listeners} = useContext(keyContext)

    const handleRewind = () => {
        const time = audioRef.current.currentTime;
        if(time - 5 < 0) {
            audioRef.current.currentTime = 0;
        }
        else {
            audioRef.current.currentTime = time - 5;
        }
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 10000);
    }

    // 监听方向键左
    useEffect(() => {
        const effectHanlder = (key) => {
            if (key === "ArrowLeft") handleRewind()
        }
        listeners.current.add(effectHanlder)
        return () => listeners.current.delete(effectHanlder)
    }, [])  // 这里不需要依赖，因为内部函数使用的 audioRef 和 setProgress 是固定的。即便audio的src发生变化，但也仅仅是audio的一个属性变化，并不是audio发生了变化
    // 要使audio发生变化，必须要react重新挂载audio这个标签，这样的话，整个player组件都会重新挂载，这个useEffect也会重新挂载，所以不需要依赖

    return (
        <button onClick = {() => handleRewind()} disabled = {playingIndex === null} className = "button move left">REW</button>
    )
}

function BreakPointButton({playingIndex, breakpoint, setBreakpoint, breakpointText, setBreakpointText, audioRef}) {
    const {listeners} = useContext(keyContext)

    const handleBreakPoint = () => {
        const time = audioRef.current.currentTime
        const len = breakpoint[playingIndex].length + 1
        const temp_a = [...breakpoint[playingIndex], time]  // 该曲的临时断点数组
        const newBreakpoint = breakpoint.map((item, index) => playingIndex === index? temp_a: item) // 临时断点集合
        setBreakpoint(newBreakpoint)
        const temp_b = [...breakpointText[playingIndex], "断点" + len + " : " + time + "秒"] // 该曲的临时断点名数组
        const newBreakpointText = breakpointText.map((item, index) => playingIndex === index? temp_b: item) // 临时断点名集合
        setBreakpointText(newBreakpointText)
    }

    // 监听键盘B
    useEffect(() => {
        const effectHanlder = (key) => {
            if (key === "B") handleBreakPoint()
        }
        listeners.current.add(effectHanlder)
        return () => listeners.current.delete(effectHanlder)
    }, [breakpoint]) // 同player里的闭包，必须依赖breakpoint，否则里面的breakpoint永远是同一个值

    return (
        <button onClick = {() => handleBreakPoint()} disabled = {playingIndex === null} className = "button breakpoint">添加断点</button>
    )
}

function ButtonBar({playingIndex, setPlayingIndex, Url, setUrl, fileName, setFileName, breakpoint, setBreakpoint, breakpointText, setBreakpointText, progress, setProgress, cycle, setCycle, audioRef, isPlaying, setIsPlaying}) {
    return (
        <div className = "buttonbar">
            <FileButton {...{setPlayingIndex, Url, setUrl, fileName, setFileName, breakpoint, setBreakpoint, breakpointText, setBreakpointText, cycle}}></FileButton>
            <RewindButton {...{playingIndex, setProgress, audioRef}}></RewindButton>
            <PlayButton {...{playingIndex, isPlaying, setIsPlaying}}></PlayButton>
            <FastForwardButton {...{playingIndex, setProgress, audioRef}}></FastForwardButton>
            <SpeedButton {...{playingIndex, audioRef}}></SpeedButton>
            <ModeButton {...{playingIndex, progress, setProgress, cycle, setCycle, audioRef, setIsPlaying}}></ModeButton>
            <BreakPointButton {...{playingIndex, breakpoint, setBreakpoint, breakpointText, setBreakpointText, audioRef}}></BreakPointButton>
        </div>
    )
}

function Player({playingIndex, Url, fileName, setProgress, audioRef, ...rest}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const {listeners} = useContext(keyContext)
    
    // 监听播放进度
    const handleTimeUpdate = () => {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        if(duration) {
            setProgress((currentTime / duration) * 10000);
        }
    };

    // 播放下标变化时重载音频
    useEffect(() => {
        console.log(playingIndex)
        if (playingIndex !== null && audioRef.current) {
            audioRef.current.load()
            if (isPlaying) {  // 避免在播放状态下切换音频时不播放
                audioRef.current.play()
            }
            else {
                setIsPlaying(true)
            }
        }
        if(playingIndex === null) {
            audioRef.current.load();
            setIsPlaying(false)
        }
    }, [playingIndex]);

    // 播放状态变化时控制音频播放
    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play();
        } 
        else {
            audioRef.current.pause();
        }
    }, [isPlaying])

    // 控制播放
    useEffect(() => {
        const effectHanlder = (key) => {
            if (key === "Space") setIsPlaying(!isPlaying)
        }
        listeners.current.add(effectHanlder)
        return () => listeners.current.delete(effectHanlder)
    }, [isPlaying])  // 依赖isPlaying，这样的话在其变化的时候，才会重新挂载effectHanlder，否则里面的isPlaying永远是同一个值（闭包）。

    return (
        <div className = "player">
            <img className = "music-icon" src = "../src/image.svg"></img>
            <div className = "playingname">{fileName[playingIndex]}</div>
            <audio ref = {audioRef} src = {Url[playingIndex]} onTimeUpdate = {handleTimeUpdate} onEnded = {() => setIsPlaying(false)}/>
            <ProgressBar {...{...rest, playingIndex, Url, fileName, setProgress, audioRef, isPlaying, setIsPlaying}}></ProgressBar>
            <ButtonBar {...{...rest, playingIndex, Url, fileName, setProgress, audioRef, isPlaying, setIsPlaying}}></ButtonBar>
        </div>
    )
}

function PlayListItem({playingIndex, setPlayingIndex, Url, setUrl, fileName, setFileName, breakpoint, setBreakpoint, breakpointText, setBreakpointText, index}) {
    const [isEditing, setIsEditing] = useState(false)
    const [inputValue, setInputValue] = useState('') // 在编辑模式下读取用户输入的值
    const inputRef = useRef(null) // 用以控制input聚焦
    const clickTimeout = useRef(null); // 存储单击延时器

    const handleDelete = (index) => {
        const newfileName = fileName.filter((_, i) => i !== index); // 去掉文件名集合中的要删的文件名
        const newUrl = Url.filter((_, i) => i !== index); // 去掉URL集合中的要删的URL
        const newBreakpoint = breakpoint.filter((_, i) => i !== index) // 删去断点集合中的要删的断点数组
        const newBreakpointText = breakpointText.filter((_, i) => i !== index) // 删去断点名集合中的要删的断点名数组
        setUrl(newUrl);
        setFileName(newfileName);
        setBreakpoint(newBreakpoint)
        setBreakpointText(newBreakpointText)
        if(playingIndex === index) { // 如果要删的就是当前正在播放的，那就把当前播放的置为null
            setPlayingIndex(null);
        }
        else if (playingIndex > index) { // 如果要删的在当前播放的前面，那就把当前播放的下标减一
            setPlayingIndex(playingIndex - 1);
        }
    }

    const handleClick = (index) => {
        clearTimeout(clickTimeout.current)
        clickTimeout.current = setTimeout(() => {
            setPlayingIndex(index) // 执行单击事件
        }, 300);
    };
    
    const handleDblClick = () => {
        clearTimeout(clickTimeout.current) // 清除单击事件
        setIsEditing(true) // 进入编辑模式
        setInputValue('') // 避免第二次修改时，input框里是第一次修改后的名字
        setTimeout(() => inputRef.current.focus(), 0) // 等待DOM更新后聚焦
    };

    const handleSubmit = (index) => {
        if (inputValue.trim() === '') {
            setIsEditing(false)
            return
        };  // 空则不修改
        const newfileName = fileName.map((item, i) => { // 替换指定下标的文件名
            if (index === i) return inputValue
            else return item
        })
        setFileName(newfileName)
        setIsEditing(false)
    }

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(index);
        }
    }

    return (
        <div className = "list-item">
            <div onClick = {() => handleDelete(index)} className = "delete">x</div> {/*播放列表中的删去按钮 */}
            {isEditing? <input 
                ref = {inputRef}
                type = "text"
                value = {inputValue}
                onChange = {(e) => setInputValue(e.target.value)} 
                onKeyDown = {(e) => handleKeyDown(e, index)} // 如果不传index，是不需要传e的，默认传过去，在handleKeyDown的箭头函数里直接接收就好了
                onBlur = {() => handleSubmit(index)}
            />
            :<div onClick = {() => handleClick(index)} onDoubleClick = {handleDblClick} className = "word">{fileName[index]}</div>}
            {/*播放列表中的跳转按钮，双击重命名 */}
        </div>
    )
}

function PlayList({fileName, ...rest}) {

    return (
        <div className = "itembar">
            {fileName.map((name, index) => {
                return (
                    <PlayListItem key = {index} {...{...rest, fileName, index}}></PlayListItem>
                )
            })}
        </div>
    )
}

function BreakpointListItem({playingIndex, breakpoint, setBreakpoint, breakpointText, setBreakpointText, setProgress, cycle, setCycle, audioRef, time, index}) {
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
        setBreakpoint(newBreakpoint);
        // 断点名集合同理
        const newBreakpointText = breakpointText.map((item, i) => {
            if (playingIndex === i) {
                return item.filter((_, j) => j !== index)
            }
            else return item
        })
        setBreakpointText(newBreakpointText)
    }

    // todo
    const handleClick = (time) => {
        clearTimeout(clickTimeout.current)
        clickTimeout.current = setTimeout(() => {
            audioRef.current.currentTime = time;
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 10000);
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
        setBreakpointText(newBreakpointText)
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
                setCycle([...cycle, time])
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

function BreakPointList({playingIndex, breakpoint, cycle, setCycle, audioRef, ...rest}) {
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
                    setCycle([...cycle, 0])
                    setClick1(true)}}>开头</div> : <></>}
            {playingIndex === null? <></> : breakpoint[playingIndex].map((time, index) => {
                // 上面这一行，假如playingIndex不存在，那么就返回空标签。如果playingIndex存在，但尚未设置断点，那访问断点数组会返回undefined，所以还是要加上“或空数组”
                return (
                    <BreakpointListItem key = {index} {...{...rest, playingIndex, breakpoint, cycle, setCycle, audioRef, time, index}}></BreakpointListItem>
                )
            })}
            {cycle.length !== 0? <div className = {`btn ${click2 ? "list-item-cycle click" : "list-item-cycle"}`} onClick = {() => {
                    setCycle([...cycle, audioRef.current.duration])
                    setClick2(true)}}>结尾</div> : <></>}
        </div>
    )
}

function List(props) {
    const [list, setList] = useState(1);

    // 当cycle为1时，说明循环模式被点击，此时自动跳转到断点列表
    useEffect(() => {
        if (props.cycle.length === 1) setList(0)
    }, [props.cycle])

    return (
        <div className = "list-container">
            {props.cycle.length !== 0?             
                <div style = {{display: "flex"}}>
                    <div className = "choose-list left">播放列表</div>
                    <div className = "choose-list">断点列表</div>
                </div> :
                <div style = {{display: "flex"}}>
                    <div className = "choose-list left" onClick = {() => setList(1)}>播放列表</div>
                    <div className = "choose-list" onClick = {() => setList(0)}>断点列表</div>
                </div>
            }
            {list? <PlayList {...props}></PlayList> : <BreakPointList {...props}></BreakPointList>}
        </div>
    )
}

export default function MusicPlayer() {
    const getStoredState = (key, defaultValue) => {
        const stored = localStorage.getItem(key);
        return stored? JSON.parse(stored): defaultValue;
    }
    const [playingIndex, setPlayingIndex] = useState(null);  // 存储当前播放的下标
    const [Url, setUrl] = useState(getStoredState("Url", []));  // 存储所有文件的URL
    const [fileName, setFileName] = useState(getStoredState("fileName", []));  // 存储所有文件的名字
    const [breakpoint, setBreakpoint] = useState(getStoredState("breakpoint", []));  // 存储所有文件的断点
    const [breakpointText, setBreakpointText] = useState(getStoredState("breakpointText", [])) // 存储所有文件的断点名
    const [progress, setProgress] = useState(0);  // 存储当前播放的进度
    const [cycle, setCycle] = useState([]) // 存储断点模式的断点
    const audioRef = useRef(null); // 播放器引用

    useEffect(() => {
        localStorage.setItem("Url", JSON.stringify(Url));
    }, [Url]);

    useEffect(() => {
        localStorage.setItem("fileName", JSON.stringify(fileName));
    }, [fileName]);

    useEffect(() => {
        localStorage.setItem("breakpoint", JSON.stringify(breakpoint));
    }, [breakpoint]);

    useEffect(() => {
        localStorage.setItem("breakpointText", JSON.stringify(breakpointText));
    }, [breakpointText]);

    return (
        <KeyProvider>
            <div className = "container">
                <Player {...{playingIndex, setPlayingIndex, Url, setUrl, fileName, setFileName, breakpoint, setBreakpoint, breakpointText, setBreakpointText, progress, setProgress, cycle, setCycle, audioRef}}></Player>
                <List {...{playingIndex, setPlayingIndex, Url, setUrl, fileName, setFileName, breakpoint, setBreakpoint, breakpointText, setBreakpointText, progress, setProgress, cycle, setCycle, audioRef}}></List>
            </div>
        </KeyProvider>
    )
}
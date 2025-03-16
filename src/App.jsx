import { useState, useRef, useEffect } from "react";
import "./App.css"; // 引入 CSS 文件


function ProgressBar({fileUrl, isPlaying, setIsPlaying, audioRef, progress, setProgress}) {
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
            disabled = {fileUrl === null}
      />
    )
}

function FileButton({audioRef, fileUrl, setFileUrl, Url, setUrl, fileName, setFileName, setIsPlaying}) {
    const fileInputRef = useRef(null);

    // 上传文件时自动播放
    useEffect(() => {
        if (fileUrl && audioRef.current) {
            audioRef.current.load(); // 重新加载音频
            audioRef.current
            .play()
            .then(() => setIsPlaying(true)) // 如果成功播放，更新状态
            .catch((err) => console.log("自动播放被阻止:", err)); // 捕获自动播放失败的情况
        }
        }, [fileUrl]); // 依赖 fileUrl，每次变化都触发

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setFileUrl(url);
            setUrl([...Url, url]);
            setFileName([...fileName, file.name]);
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
            <button onClick={handleButtonClick} className = "button file">选择文件</button>
        </div>
    )
}

function ModeButton({fileUrl, audioRef, breakpoint, setIsPlaying, progress, setProgress }) {
    const [isLooping, setIsLooping] = useState(false); // 控制是否进入断点循环模式
    const [start, setStart] = useState(0); // 断点循环的起始时间
    const [end, setEnd] = useState(0); // 断点循环的结束时间

    // 处理正常模式和断点循环模式的切换
    const changeMode = (value) => {
        if (value === "false") {
            // 退出循环模式
            setIsLooping(false);
            setIsPlaying(true); // 恢复播放
        } else {
            // 进入循环模式
            setStart(parseInt(prompt("请输入断点循环的起始断点序号")));
            setEnd(parseInt(prompt("请输入断点循环的结束断点序号")));
            setIsLooping(true);
        }
    };

    // 监听音频的播放进度，确保在断点循环模式下控制播放
    useEffect(() => {
        if (isLooping) {
            if (audioRef.current.currentTime >= breakpoint[end - 1]) {
                audioRef.current.currentTime = breakpoint[start - 1];
                setProgress((audioRef.current.currentTime / audioRef.current.duration) * 10000);
            }
        }
    }, [[progress]]);

    return (
        <select value = {isLooping} onChange = {(e) => changeMode(e.target.value)} disabled = {fileUrl === null} className = "button mode">
            <option value = "false">正常模式</option>
            <option value = "true">断点循环</option>
        </select>
    );
}

function SpeedButton({fileUrl, audioRef}) {
    return (
        <select onChange = {(e) => audioRef.current.playbackRate = e.target.value} disabled = {fileUrl === null} className = "button speed">
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

function PlayButton({fileUrl, audioRef, isPlaying, setIsPlaying}) {
    // 播放暂停
    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }

    return (
        <button className = "button play" onClick = {togglePlay} disabled = {fileUrl === null}>
            {isPlaying? "⏸" : "▶"}
        </button>
    )
}

function FastForwardButton({fileUrl, audioRef, setProgress}) {
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

    return (
        <button onClick = {() => handleFastForward()} disabled = {fileUrl === null} className = "button move right">FF</button>
    )
}

function RewindButton({fileUrl, audioRef, setProgress}) {
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
    return (
        <button onClick = {() => handleRewind()} disabled = {fileUrl === null} className = "button move left">REW</button>
    )
}

function BreakPointButton({fileUrl, audioRef, breakpoint, setBreakpoint}) {
    const handleBreakPoint = () => {
        setBreakpoint([...breakpoint, audioRef.current.currentTime]);
    }
    return (
        <button onClick = {() => handleBreakPoint()} disabled = {fileUrl === null} className = "button breakpoint">添加断点</button>
    )
}

function ButtonBar(props) {
    return (
        <div className = "buttonbar">
            <FileButton {...props}></FileButton>
            <RewindButton {...props}></RewindButton>
            <PlayButton {...props}></PlayButton>
            <FastForwardButton {...props}></FastForwardButton>
            <SpeedButton {...props}></SpeedButton>
            <ModeButton {...props}></ModeButton>
            <BreakPointButton {...props}></BreakPointButton>
        </div>
    )
}

function Player({audioRef, fileUrl, ...rest}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);  // 存储进度
    
    // 监听播放进度
    const handleTimeUpdate = () => {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        if(duration) {
            setProgress((currentTime / duration) * 10000);
        }
    };

    return (
        <div className = "player">
            <img className = "music-icon" src = "../src/image.svg"></img>
            <audio ref = {audioRef} src = {fileUrl} onTimeUpdate = {handleTimeUpdate} onEnded = {() => setIsPlaying(false)}/>
            <ProgressBar {...{...rest, fileUrl, audioRef, isPlaying, setIsPlaying, progress, setProgress}}></ProgressBar>
            <ButtonBar {...{...rest, fileUrl, audioRef, isPlaying, setIsPlaying, progress, setProgress}}></ButtonBar>
        </div>
    )
}

function PlayList({audioRef, fileName, setFileName, Url, setUrl, fileUrl, setFileUrl}) {
    const isEditing = useRef(false)
    const handleDelete = (index) => {
        if(fileUrl === Url[index]) {
            console.log("delete");
            setFileUrl(null);
        }
        const newfileName = fileName.filter((_, i) => i !== index);
        const newUrl = Url.filter((_, i) => i !== index);
        setUrl(newUrl);
        setFileName(newfileName);
    }

    useEffect(() => {
        if(fileUrl === null) {
            audioRef.current.load();
        }
    }, [fileUrl]);

    return (
        <div className = "itembar">
            {fileName.map((name, index) => {
                return (
                    <div className = "list-item" key = {index}>
                        <div onClick = {() => handleDelete(index)} className = "delete">x</div>
                        <div onClick = {() => setFileUrl(Url[index])} className = "word">{name}</div>
                    </div>
                )
            })}
        </div>
    )
}

function BreakPointList({breakpoint, setBreakpoint, audioRef, setProgress}) {
    const handleDelete = (index) => {
        const newBreakpoint = breakpoint.filter((_, i) => i !== index);
        setBreakpoint(newBreakpoint);
    }

    const jumpToBreakPoint = (time) => {
        audioRef.current.currentTime = time;
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 10000);
    }

    return (
        <div className = "itembar">
            {breakpoint.map((time, index) => {
                return (
                    <div className = "list-item" key = {index}>
                        <div onClick = {() => handleDelete(index)} className = "delete">x</div>
                        <div onClick = {() => jumpToBreakPoint(time)} className = "word">断点{index + 1} : {time}秒</div>
                    </div>
                )
            })}
        </div>
    )
}

function List(props) {
    const [list, setList] = useState(1);
    return (
        <div className = "list-container">
            <div style = {{display: "flex"}}>
                <div className = "choose-list left" onClick = {() => setList(1)}>播放列表</div>
                <div className = "choose-list" onClick = {() => setList(0)}>断点列表</div>
            </div>
            {list? <PlayList {...props}></PlayList> : <BreakPointList {...props}></BreakPointList>}
        </div>
    )
}

export default function MusicPlayer() {
    const [fileUrl, setFileUrl] = useState(null);  // 存储当前播放的文件
    const [Url, setUrl] = useState([]);  // 存储所有播放文件
    const [fileName, setFileName] = useState([]);  // 存储所有播放文件名
    const [breakpoint, setBreakpoint] = useState([]);  // 存储断点
    const audioRef = useRef(null); // 播放器引用

    return (
        <div className = "container">
            <Player {...{fileUrl, setFileUrl, Url, setUrl, fileName, setFileName, breakpoint, setBreakpoint, audioRef}}></Player>
            <List {...{fileUrl, setFileUrl, Url, setUrl, fileName, setFileName, breakpoint, setBreakpoint, audioRef}}></List>
        </div>
    )
}
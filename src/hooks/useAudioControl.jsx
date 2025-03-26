import { useEffect } from 'react';
import { usePlayerContext } from '../context/PlayerContext';
import useLoacalStorage from './useLocalStorage';

// 负责音频控制
export const useAudioControl = () => {
  const { state, dispatch, audioRef } = usePlayerContext();
  const { saveFile, getFile, deleteFile } = useLoacalStorage();

  // audio的播放进度监听
  const handleTimeUpdate = () => {
    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    if(duration) {
      const newProgress = (currentTime / duration) * 10000;
      dispatch({ type: 'UPDATE_PROGRESS', payload: newProgress });
    }
  };

  // 进度条拖动
  const handleSeek = (e) => {
    console.log("执行进度条拖动函数");
    const newTime = (e.target.value / 10000) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    dispatch({ type: 'UPDATE_PROGRESS', payload: e.target.value });
    if(audioRef.current.paused) {
        togglePlay(); 
    }
  };


  // ButtonBar区
  // 处理文件上传后的行为
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("handleFileChange函数-upload：", file);
      const newID = state.id.length ? state.id[state.id.length - 1] + 1 : 1;
      await saveFile( newID, file);
      const savedFile = await getFile( newID);
      console.log("handleFileChange函数-get：", savedFile);
      const url = URL.createObjectURL(savedFile); // 创建本地URL
      console.log("handleFileChange函数-url:", url)
      dispatch({ type: "FILE_UPLOAD", payload: { newID, url, name: file.name, len: state.Url.length } });
    }
  };

  // 控制快退
  const handleRewind = () => {
    const time = audioRef.current.currentTime;
    if(time - 5 < 0) {
        audioRef.current.currentTime = 0;
    }
    else {
        audioRef.current.currentTime = time - 5;
    }
    const newProgress = (audioRef.current.currentTime / audioRef.current.duration) * 10000;
    dispatch({ type: 'UPDATE_PROGRESS', payload: newProgress });
  }

  // 播放暂停
  const togglePlay = () => {
    dispatch({ type: 'TOGGLE_PLAY' });
  };  

  // 控制快进
  const handleFastForward = () => {
    const time = audioRef.current.currentTime;
    if(time + 5 > audioRef.current.duration) {
        audioRef.current.currentTime = audioRef.current.duration;
    }
    else {
        audioRef.current.currentTime = time + 5;
    }
    const newProgress = (audioRef.current.currentTime / audioRef.current.duration) * 10000;
    dispatch({ type: 'UPDATE_PROGRESS', payload: newProgress });
  }

  // 控制播放速度
  const handleSpeedChange = ((e) => {
    const newSpeed = parseFloat(e.target.value)
    audioRef.current.playbackRate = newSpeed
    dispatch({ type: 'SET_SPEED', payload: newSpeed })
  })

  // 控制循环模式
  const handleModeChange = (value) => {
    if (value === "false") {
        // 退出循环模式
        dispatch({ type: "EXIT_CYCLE" });
    } else {
        // 进入循环模式
        dispatch({ type: "ENTER_CYCLE" });
    }
  };

  // 控制断点添加
  const handleBreakpointAdd = () => {
    const time = audioRef.current.currentTime
    const len = state.breakpoint[state.playingIndex].length + 1
    const temp_a = [...state.breakpoint[state.playingIndex], time]  // 该曲的临时断点数组
    const newBreakpoint = state.breakpoint.map((item, index) => state.playingIndex === index? temp_a: item) // 临时断点集合
    dispatch({ type: 'UPDATE_BREAKPOINT', payload: newBreakpoint })
    const temp_b = [...state.breakpointText[state.playingIndex], "断点" + len + " : " + time + "秒"] // 该曲的临时断点名数组
    const newBreakpointText = state.breakpointText.map((item, index) => state.playingIndex === index? temp_b: item) // 临时断点名集合
    dispatch({ type: 'UPDATE_BREAKPOINTTEXT', payload: newBreakpointText })
  }


  // List区
  // 控制播放列表删除
  const handlePlayListItemDelete = (index) => {
    deleteFile( state.id[index] )
    dispatch({ type: 'DELETE_PLAYLISTITEM', payload: index })
  }
  
  // 控制播放列表单击
  const handlePlayListItemClick = (index, clickTimeout) => {
    clickTimeout.current = setTimeout(async () => {
      if ( state.Url[index] === null ) {
        const file = await getFile(state.id[index])
        const url = URL.createObjectURL(file)
        const newUrl = state.Url.map((item, i) => i === index? url: item)
        dispatch({ type: 'UPDATE_URL', payload: newUrl })
      }
      dispatch({ type: 'SET_PLAYINGINDEX', payload: index })
    }, 300);
  }

  // 控制播放列表提交
  const handlePlayListItemSubmit = (index, setIsEditing, inputValue) => {
    if (inputValue.trim() === '') {
        setIsEditing(false)
        return
    };  // 空则不修改
    const newfileName = state.fileName.map((item, i) => { // 替换指定下标的文件名
        if (index === i) return inputValue
        else return item
    })
    dispatch({ type: 'UPDATE_FILENAME', payload: newfileName })
    setIsEditing(false)
  }
    

  return {
    handleTimeUpdate,
    handleSeek,

    handleFileChange,
    handleRewind,
    togglePlay,
    handleFastForward,
    handleSpeedChange,
    handleModeChange,
    handleBreakpointAdd,

    handlePlayListItemDelete,
    handlePlayListItemClick,
    handlePlayListItemSubmit,
  };
};

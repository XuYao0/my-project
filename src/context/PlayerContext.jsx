import { createContext, useContext, useEffect, useReducer, useRef } from 'react';

const PlayerContext = createContext(); // 创建一个全局状态容器

const initialState = { // 定义初始状态
  playingIndex: null,
  Url: [],
  fileName: [],
  breakpoint: [],
  breakpointText: [],
  id: [],
  progress: 0,
  cycle: [],
  
  isPlaying: false,
  speed: 1,
  isLooping: false,
  loopingStart: 0,
  loopingEnd: 0,
};

function reducer(state, action) {  // 状态处理器
  const { playingIndex, Url, fileName, breakpoint, breakpointText, id, progress, cycle, isPlaying, speed, isLooping, loopingStart, loopingEnd } = state;
  switch (action.type) {
    case 'SET_PLAYINGINDEX':
      return { ...state, playingIndex: action.payload };
    case 'UPDATE_URL':
      return { ...state, Url: action.payload };
    case 'FILE_UPLOAD':
      return { ...state, 
        Url: [...Url, action.payload.url], 
        fileName: [...fileName, action.payload.name], 
        breakpoint: [...breakpoint, []], 
        breakpointText: [...breakpointText, []],
        id: [...id, action.payload.newID], 
        playingIndex: action.payload.len, 
        isPlaying: true };
    case 'UPDATE_PROGRESS':
      return { ...state, progress: action.payload };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !isPlaying };
    case 'SET_SPEED':
      return { ...state, speed: action.payload };
    case 'ENTER_CYCLE':
      return { ...state, isLooping: true, cycle: [0] };
    case 'EXIT_CYCLE':
      return { ...state, isLooping: false, cycle: [], loopingStart: 0, loopingEnd: 0 };
    case 'UPDATE_LOOPINGSTATE':
      return { ...state, cycle: [], loopingStart: action.payload[0], loopingEnd: action.payload[1] };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'UPDATE_BREAKPOINT':
      return { ...state, breakpoint: action.payload };
    case 'UPDATE_BREAKPOINTTEXT':
      return { ...state, breakpointText: action.payload };
    case 'DELETE_PLAYLISTITEM':
      return { ...state, 
        Url: Url.filter((_, i) => i !== action.payload), 
        fileName: fileName.filter((_, i) => i !== action.payload), 
        breakpoint: breakpoint.filter((_, i) => i !== action.payload), 
        breakpointText: breakpointText.filter((_, i) => i !== action.payload), 
        id: id.filter((_, i) => i !== action.payload),
        playingIndex: playingIndex === action.payload? null: playingIndex > action.payload? playingIndex - 1: playingIndex };
    case 'UPDATE_FILENAME':
      return { ...state, fileName: action.payload };
    case 'UPDATE_CYCLE':
      return { ...state, cycle: action.payload };
    default:
      return state;
  }
}

export const PlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (initialState) => {
    const localData = JSON.parse(localStorage.getItem('audioStorage')) || {};
    // 用若干个null初始化Url
    const initialUrls = localData.fileName ? new Array(localData.fileName.length).fill(null) : [];
    return {...initialState, ...localData, Url: initialUrls}
  });   // 结合本地数据初始化state
  const audioRef = useRef(null);
  const { fileName, breakpoint, breakpointText, id} = state;

  useEffect(() => {
    localStorage.setItem('audioStorage', JSON.stringify({ fileName, breakpoint, breakpointText, id }));
  },[ fileName, breakpoint, breakpointText, id]); // 保存本地数据
  
  return (
    <PlayerContext.Provider value={{ state, dispatch, audioRef }}>
      {children}
    </PlayerContext.Provider>
  );
};

// 自定义hook，直接获取全部的state和dispatch
export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within PlayerProvider');
  }
  return context;
};

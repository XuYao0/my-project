import React, { useEffect, useState } from 'react';
import { PlayerProvider, usePlayerContext } from './context/PlayerContext';
import { KeyProvider, useKeyContext } from "./context/KeyContext";
import { useAudioControl } from './hooks/useAudioControl';

import FileButton from './components/player/Controls/FileButton';
import RewindButton from './components/player/Controls/RewindButton';
import PlayButton from './components/player/Controls/PlayButton';
import FastForwardButton from './components/player/Controls/FastForwardButton';
import SpeedButton from './components/player/Controls/SpeedButton';
import ModeButton from './components/player/Controls/ModeButton';
import BreakpointButton from './components/player/Controls/BreakpointButton';

import ProgressBar from './components/player/Progress/ProgressBar';

import PlayList from './components/player/List/PlayList';
import BreakpointList from './components/player/List/BreakpointList';

import "./AudioPlayer.css"; // 引入 CSS 文件


function ButtonBar({}) {
  return (
      <div className = "buttonbar">
          <FileButton></FileButton>
          <RewindButton></RewindButton>
          <PlayButton></PlayButton>
          <FastForwardButton></FastForwardButton>
          <SpeedButton></SpeedButton>
          <ModeButton></ModeButton>
          <BreakpointButton></BreakpointButton>
      </div>
  )
}

function Player({}) {
    const { state, dispatch, audioRef } = usePlayerContext();
    const { handleTimeUpdate } = useAudioControl();
    const [showHelp, setShowHelp] = useState(false);

    // 播放下标变化时重载音频
    useEffect(() => {
      console.log(state.playingIndex)
      if (state.playingIndex !== null && audioRef.current) {
          audioRef.current.load()
          if (state.isPlaying) {  // 避免在播放状态下切换音频时不播放
              audioRef.current.play()
          }
          else {
              dispatch({ type: 'SET_PLAYING', payload: true })
          }
      }
      if(state.playingIndex === null) {
          audioRef.current.load();
          dispatch({ type: 'SET_PLAYING', payload: false });
      }
    }, [state.playingIndex]);

    // 播放状态变化时控制音频播放
    useEffect(() => {
      if (state.isPlaying) {
          audioRef.current.play();
      } 
      else {
          audioRef.current.pause();
      }
    }, [state.isPlaying])

    // todo，空格控制播放
    const {listeners} = useKeyContext();
    useEffect(() => {
        const effectHanlder = (key) => {
            if (key === "Space") dispatch('TOGGLE_PLAY')
        }
        listeners.current.add(effectHanlder)
        return () => listeners.current.delete(effectHanlder)
    }, [state.isPlaying])  // 依赖isPlaying，这样的话在其变化的时候，才会重新挂载effectHanlder，否则里面的isPlaying永远是同一个值（闭包）。

    return (
        <div className = "player">
            <div className = "help-container">
                <div onClick = {() => setShowHelp(!showHelp)} className = "help-button">帮助</div>
                {showHelp && (
                <div className = "help-content">
                    <h3>使用帮助</h3>
                    <p>1.再点击一次“帮助”即可关闭此窗口</p>
                    <p>2.点击选择文件以上传音频文件，文件存储在本地缓存，与浏览器绑定。</p>
                    <p>3.点击REW可以快退五秒，点击FF可以快进五秒，点击这俩中间那个可以切换播放和暂停</p>
                    <p>4.点击1x可以选择播放速度</p>
                    <p>5.点击正常模式可以选择正常模式或者断点循环模式，点击断点循环模式后在右侧断点列表中点击两个断点，即可在该两个断点之间循环</p>
                    <p>6.点击添加断点可以添加断点</p>
                    <p>7.快退、快进、播放暂停、添加断点的键盘快捷键分别是方向键左、方向键右、空格键、键B</p>
                    <p>8.右上方可以点击切换播放列表和断点列表，每一首曲子都有自己的断点列表</p>
                    <p>9.点击播放列表中的曲名可以跳转到该曲播放，点击曲名旁边的叉可以删去该曲（包括断点和本地存储文件），双击曲名可以重命名</p>
                    <p>10.点击断点列表中的断点可以跳转到该断点处，点击断点名旁边的叉可以删去该断点，双击断点名可以重命名</p>
                    <p>11.文件名、断点名等也存储在本地缓存，与浏览器绑定</p>
                </div>
            )}
            </div>
            <img className = "music-icon" src = "../src/image.svg"></img>
            <div className = "playingname">{state.fileName[state.playingIndex]}</div>
            <audio ref = {audioRef} src = {state.Url[state.playingIndex]} onTimeUpdate = {handleTimeUpdate} onEnded = {() => dispatch('SET_PLAYING', false)}/>
            <ProgressBar></ProgressBar>
            <ButtonBar></ButtonBar>
        </div>
    )
}

function List() {
  const { state } = usePlayerContext();
  const { cycle } = state;
  const [list, setList] = useState(1);

  // 当cycle为1时，说明循环模式被点击，此时自动跳转到断点列表
  useEffect(() => {
      if (cycle.length === 1) setList(0)
  }, [cycle])

  return (
      <div className = "list-container">
          {cycle.length !== 0?             
              <div style = {{display: "flex"}}>
                  <div className = "choose-list left">播放列表</div>
                  <div className = "choose-list">断点列表</div>
              </div> :
              <div style = {{display: "flex"}}>
                  <div className = "choose-list left" onClick = {() => setList(1)}>播放列表</div>
                  <div className = "choose-list" onClick = {() => setList(0)}>断点列表</div>
              </div>
          }
          {list? <PlayList></PlayList> : <BreakpointList></BreakpointList>}
      </div>
  )
}

const AudioPlayer = () => {
  return (
    <PlayerProvider>
    <KeyProvider>
        <div className = "container">
            <Player></Player>
            <List></List>
        </div>
    </KeyProvider>
    </PlayerProvider>
)
};

export default AudioPlayer;

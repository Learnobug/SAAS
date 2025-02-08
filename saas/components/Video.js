"use-client";
import React, { useState } from "react";
import { useEffect ,useRef} from "react";
import ReactPlayer from 'react-player'

export default function YouTubeVideo({params}) {
  const videoref= useRef(null);
  
  const {queue,setQueue,setPlayedSeconds,seekTime,newvideoId}=params;
  const [videoid, setVideoId]= useState(null);
  const [playing,setplaying]=useState(false);
  const [play,setPlay]=useState(true);
 

  useEffect(() => {
    if(queue.length>0 && !playing){
      setVideoId(queue[0].id);
      setplaying(true);
      setQueue(queue.slice(1));
    };
  }, [params]);

   useEffect(() => {
    if (videoref.current ) {
        videoref.current.seekTo(videoref.current.getCurrentTime()+Number(seekTime));
        console.log("Seeking to:", seekTime);
       setPlay(true); 
    }
}, [seekTime,videoref.current]);

  const handleEnd = () => {
    setplaying(false);
    if(queue.length>0){
      setVideoId(queue[0].id);
      setQueue(queue.slice(1));
      setplaying(true);
    };
  }
    
   
    return (
      <ReactPlayer ref={videoref} url={`https://www.youtube.com/watch?v=${(videoid || newvideoId) }`} 
      onEnded={handleEnd}
       controls
       onSeek={() => setPlay(true)}
       playing={true}  
      onProgress={({ playedSeconds }) => setPlayedSeconds(playedSeconds)}
      />
   
    );
  }
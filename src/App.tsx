import React, { useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import "./App.css";

//custom hooks
import useAgora from "./hooks/useAgora";
import MediaPlayer from "./components/MediaPlayer";

const client = AgoraRTC.createClient({ codec: "h264", mode: "rtc" });

const App = () => {
  const [camera, setCamera] = useState(true);
  const [mic, setMic] = useState(true);
  const {
    localAudioTrack,
    localVideoTrack,
    join,
    leave,
    joinState,
    remoteUsers,
    cameratoggle,
    mictoggle,
  } = useAgora(client);
  return (
    <div className="App">
      <h1>Video Chat App</h1>
      <div className="button-group">
        <button
          id="join"
          type="button"
          className="btn btn-primary btn-sm"
          disabled={joinState}
          onClick={() => {
            join("91470b933a5242d7adae353e8304b356", "test");
          }}
        >
          Join
        </button>
        <button
          id="leave"
          type="button"
          className="btn btn-primary btn-sm"
          disabled={!joinState}
          onClick={() => {
            leave();
            window.location.reload(false);
          }}
        >
          Leave
        </button>
      </div>
      <div className="player-container">
        <div className="local-player-wrapper">
          <p className="local-player-text">
            {localVideoTrack && `YourVideo`}
            {joinState && localVideoTrack ? `(${client.uid})` : ""}
          </p>

          <MediaPlayer
            videoTrack={localVideoTrack}
            audioTrack={localAudioTrack}
          ></MediaPlayer>
          {localVideoTrack && (
            <>
              <button
                onClick={() => {
                  cameratoggle();
                  setCamera(!camera);
                }}
              >
                Turn {camera ? "Off": "On"}📷
              </button>

              <button
                onClick={() => {
                  mictoggle();
                  setMic(!mic);
                }}
              >
                Turn {mic ? "Off": "On"}🎙️
              </button>
            </>
          )}
        </div>
        {remoteUsers.map((user) => (
          <div className="remote-player-wrapper" key={user.uid}>
            <p className="remote-player-text">{`RemoteVideo(${user.uid})`}</p>
            <MediaPlayer
              videoTrack={user.videoTrack}
              audioTrack={user.audioTrack}
            ></MediaPlayer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

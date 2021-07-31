import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  ILocalVideoTrack,
} from "agora-rtc-sdk-ng";
import { useState, useEffect } from "react";

const useAgora = (client: IAgoraRTCClient | undefined) => {
  const [localAudioTrack, setLocalAudioTrack] = useState<
    ILocalAudioTrack | undefined
  >(undefined);
  const [localVideoTrack, setLocalVideoTrack] = useState<
    ILocalVideoTrack | undefined
  >(undefined);
  const [joinState, setJoinState] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const createLocalTracks = async () => {
    const [microphoneTrack, cameraTrack] =
      await AgoraRTC.createMicrophoneAndCameraTracks();
    setLocalAudioTrack(microphoneTrack);
    setLocalVideoTrack(cameraTrack);
    return [microphoneTrack, cameraTrack];
  };

  const cameratoggle = () => {
    console.log(localVideoTrack?.setEnabled(!localVideoTrack?.isPlaying));
  };

  const mictoggle = () => {
    console.log(localAudioTrack?.setEnabled(!localAudioTrack?.isPlaying));
  };

  const join = async (
    appid: string,
    channel: string,
    token?: string | null,
    uid?: string | number | null
  ) => {
    if (!client) return;
    const [microphoneTrack, cameraTrack] = await createLocalTracks();
    await client.join(appid, channel, null);
    await client.publish([microphoneTrack, cameraTrack]);
    console.log(client);
    (window as any).client = client;
    (window as any).videoTrack = cameraTrack;

    setJoinState(true);
  };

  const leave = async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }
    setRemoteUsers([]);
    await client?.leave();
  };

  useEffect(() => {
    if (!client) return;
    setRemoteUsers(client.remoteUsers);
    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      await client.subscribe(user, mediaType);
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };

    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };
    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);
    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
    };
  }, [client]);

  return {
    localAudioTrack,
    localVideoTrack,
    joinState,
    join,
    leave,
    remoteUsers,
    cameratoggle,
    mictoggle,
  };
};

export default useAgora;

import React, { useEffect, useState, useRef } from "react";
import { useRouter, NextRouter } from "next/router";
import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng";

interface Options {
  appId: string;
  channel: string;
  token: string | null;
  uid: number | string | null;
}

interface ChannelParameters {
  localAudioTrack: ILocalAudioTrack | null;
  remoteAudioTrack: IRemoteAudioTrack | null;
  remoteUid: number | string | null;
}

export default function Home() {
  const router: NextRouter = useRouter();
  const { id } = router.query as { id: string };
  const [isMuteAudio, setIsMuteAudio] = useState<boolean>(false);

  // State to store the Agora client
  const [agoraEngine, setAgoraEngine] = useState<IAgoraRTCClient | null>(null);

  const channelParametersRef = useRef<ChannelParameters>({
    localAudioTrack: null,
    remoteAudioTrack: null,
    remoteUid: null,
  });

  useEffect(() => {
    let isMounted = true;
    const initializeAgora = async () => {
      if (typeof window !== 'undefined') {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        AgoraRTC.setLogLevel(2);
        const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp9" });

        if (isMounted) {
          setAgoraEngine(client);
        }
      }
    };

    initializeAgora();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleJoin = async (channel: string) => {
    if (!agoraEngine) return;
    const options: Options = {
      appId: "6140d6ad1ad44ac2b7d3b84335f524fc", // Replace with your App ID
      channel: channel,
      token: null, // Replace with your token if you have one
      uid: 0, // You can use 0 to let Agora assign a user ID
    };

    await agoraEngine.join(options.appId, options.channel, options.token, options.uid);
    const localAudioTrack: ILocalAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    channelParametersRef.current.localAudioTrack = localAudioTrack;

    await agoraEngine.publish(localAudioTrack);
    console.log("Joined channel:", channel);
  };


  return (
    <div>
      <center>
              <h1>{id}</h1>
              
        <button onClick={() => id && handleJoin(id)}>Join Channel</button>
        <button onClick={() => setIsMuteAudio(!isMuteAudio)}>
          {isMuteAudio ? 'Unmute' : 'Mute'}
        </button>
      </center>
    </div>
  );
}

import React from 'react';
import { useRouter } from "next/router";
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelHeader, MessageInput, MessageInputSmall, VirtualizedMessageList, Window } from 'stream-chat-react';

import 'stream-chat-react/dist/css/index.css';

import { StreamViewerChatWrapper, StreamViewerChatInput, StreamViewerChatMessages } from "./StreamViewerChat.styles";

export const StreamViewerChat = ({ props }: any) => {
  const router = useRouter();
  //const { streamId } = router.query;
  const chatClient = StreamChat.getInstance('h3t9t6dtbs6d');
  const userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiY29sZC1uaWdodC0xIn0.PTghhJHXk5oR0gAnm76elzZTCUusg5tzfAKQtk2GoeY';

  chatClient.connectUser(
    {
      id: 'cold-night-1',
      name: 'cold-night-1',
      image: 'https://getstream.io/random_png/?id=cold-night-1&name=cold-night-1',
    },
    userToken,
  );
  
  const channel = chatClient.channel('livestream', 'spacex', {
    image: 'https://goo.gl/Zefkbx',
    name: 'SpaceX launch discussion',
  });

  return (
    <StreamViewerChatWrapper>
      <Chat client={chatClient} theme='livestream dark'>
        <Channel channel={channel}>
          <Window>
            <ChannelHeader live />
            <VirtualizedMessageList />
            <MessageInput Input={MessageInputSmall} focus />
          </Window>
        </Channel>
      </Chat>
    </StreamViewerChatWrapper>
  );
};
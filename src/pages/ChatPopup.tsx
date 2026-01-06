import React, { useState, useRef, useEffect } from 'react';
import IconSend from '../components/Icon/IconSend';
import IconDownload from '../components/Icon/IconDownload';
import IconMore from '../components/Icon/IconHorizontalDots';
import IconPaperclip from '../components/Icon/IconPaperclip';
import PerfectScrollbar from 'react-perfect-scrollbar';
import IconChatDot from '../components/Icon/IconChatDot';
import IconX from '../components/Icon/IconX';
import io from 'socket.io-client';
import { useGlobalChatMutation } from '../helpers/globalApi';
import { useUploadMutation } from '../services/mutations/useUploadMutation';
import Lightbox from 'react-18-image-lightbox';
import PreLoading from '../helpers/preLoading';
type MessageType = {
  sender: 'user' | 'admin' | 'shop' | 'business_unit';
  sender_name: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'video';
  message_id: string;
  created_at: string;
  read_at: string;
};

interface ChatPopupProps {
    id_contract: number;
}

const mode = process.env.MODE || 'admin';
  
const ChatPopup: React.FC<ChatPopupProps> = ({ id_contract }) => {
  const socket = useRef<SocketIOClient.Socket | null>(null); // Updated the type to be more explicit
  const SOCKET_URL = process.env.SOCKET_URL;
  const URL_CHAT  = process.env.CHAT_URL
  const storedUser = localStorage.getItem(mode);
  const role = storedUser ? JSON.parse(storedUser ?? '{}').role : null
  const token = storedUser ? JSON.parse(storedUser).access_token : null;
  const [clientId, setClientId] = useState('');
  const [context, setContext] = useState<'shop' | 'admin' | 'business_unit'>('shop');
  const [isOpen, setIsOpen] = useState(false);
  const [textMessage, setTextMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([])
  const [sender,setSender] = useState(role)  
  const [pictureURL, setPictureURL] = useState<any>('');
  const [isOpenPic, setIsOpenPic] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null)
  
  // let clientId:string;
  useEffect(()=>{
    fetchChat({ data: {"id_contract":id_contract.toString(),client_id:""}})
    getUnread({
      data: {
        contract_list: [id_contract],
      },
    })
  },[clientId])

  const [unread, setUnread] = useState<any>(false)
  const { mutate: getUnread } = useGlobalChatMutation('/chat/check-unread', {
    onSuccess: (res: any) => {
      if(res?.data[0]?.unread > 0) {
        setUnread(true)
        setIsOpen(true)
        updateRead({ data: { "id_contract":id_contract.toString()} });
      } else {
        setUnread(false)
        setIsOpen(false)
      }
    },
  });


  const { mutate: updateRead } = useGlobalChatMutation('/chat/update-read', {
    onSuccess: (res: any) => {
        setUnread(false)
    },
  });


  useEffect(() => {
    try {
      socket.current = io(SOCKET_URL!, {
        transports: ['websocket'],
        forceNew: true,
        query: {
         // token,
          id_contract:id_contract.toString()
       },
      });

      socket.current.on('connect', () => {
        if (socket.current) {
          setClientId(socket.current.id);
        }
      });

      socket.current.on('connect_error', (error:any) => {
        console.error('WebSocket connection error:', error);
      });

      socket.current.on('newMessage', (message: MessageType) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socket.current.on('typing', (data:any) => {
      
      });
    } catch (error) {
      console.warn(error);
    }

    return () => {
   
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [SOCKET_URL, token]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    updateRead({ data: { "id_contract":id_contract.toString()} });
  };

  const handleInputChange = (e: any) => {
    setTextMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage();
    }
  };

  const handleFocus = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
     updateRead({ data: { "id_contract":id_contract.toString()} });
     
  };

  const { mutate: addMessage } = useGlobalChatMutation('/chat/message/', {
    onSuccess: () => {
       
    },
  });

  const { mutate: fetchChat } = useGlobalChatMutation('/chat/chatroom/', {
    onSuccess: (res: any) => {
      setMessages(res?.data?.messages ?? [])
    },
  });

  const sendMessage = () => {
    if (textMessage.trim()) {
      addMessage({ 
        data: { 
        "id_contract":id_contract.toString(),
        "content" : textMessage,
        "type" : "text", 
        "client_id" : clientId
      } });
      // URL_CHAT
      setTextMessage('');

      if (socket.current) {
        //socket.current.emit('sendMessage', newMessage); // Emitting the message to the server
      }
    }
  };

  const { mutateAsync: uploadFile, isLoading: isLoadingUpload } = useUploadMutation({
      onSuccess: (res: any) => {
      },
      onError: (err: any) => {
      },
    })

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const fileType = file.type.startsWith('image') ? 'image' : 'video';
        try {
          // Create the file upload promise
          setLoading(true)
          const uploadPromise = uploadFile({ data: { file: file, type: 'chat' } });
          // Wait for the upload to complete
          const result = await uploadPromise;
          if(result?.data) {
            addMessage({ 
              data: { 
              "id_contract":id_contract.toString(),
              "content" : result?.data?.file_name,
              "type" : fileType, 
              "client_id" : clientId
            } });
            setLoading(false)
            //setTextMessage('');
          }
        } catch (error) {
          setLoading(false)
          console.error('Error uploading file:', error);
        }
      }
    };
    

  const isMessageOnRight = (senderNow: string) => {
    if(senderNow == 'business_unit' &&  sender == 'admin') {
      return true;
    }

    if(senderNow == 'admin' &&  sender == 'business_unit') {
      return true;
    }
    return sender === senderNow;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages,isOpen]); 

  return (
    <div className="fixed bottom-4 right-16" style={{zIndex:1}}>
    {loading && <PreLoading />}
    {isOpenPic && <Lightbox mainSrc={pictureURL} onCloseRequest={() => setIsOpenPic(false)} />}
     {unread && (
        <div className="pointer flex items-center space-x-2 absolute">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
        </div>
      )}

      <button
        onClick={toggleChat}
        className="bg-blue-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
      >
        {isOpen ? <IconX className="text-xl" /> : <IconChatDot className="text-2xl" />}
      </button>

      {isOpen && (
        <div className="bg-white w-96 h-96 shadow-lg rounded-lg mt-4 p-4 flex flex-col">
          <PerfectScrollbar className="flex-grow overflow-y-auto mb-4" options={{ suppressScrollX: true, wheelPropagation: false }} containerRef={(el:any) => (scrollRef.current = el)}>
            {messages.map((message) => (
              <div
                key={message.message_id}
                className={`flex items-start gap-3 mb-4 ${
                  isMessageOnRight(message.sender) ? 'justify-end' : 'justify-start'
                }`}
              >
                <IconChatDot className="w-6 h-6" />
                {/* {!isMessageOnRight(message.sender) && (
                  <img
                    src={`/favicon.png`}
                    alt="avatar"
                    className="rounded-full w-10 h-10 object-contain"
                  />
                )} */}
                <div className={`${isMessageOnRight(message.sender) ? 'text-right' : ''}`}>
                  {message.type === 'text' && (
                    <div
                      className={`p-3 rounded-lg flex items-center justify-center gap-2 max-w-[200px] ${
                        isMessageOnRight(message.sender) ? 'bg-blue-100' : 'bg-gray-100'
                      }`}
                    >
                      <p className='break-all text-left' style={{ whiteSpace: 'pre-wrap' }} >{message.content}</p>
                    </div>
                  )}
                  {message.type === 'image' && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={message.content}
                        alt="sent content"
                        className="w-48 h-auto rounded-lg"
                        onClick={() => {
                          setPictureURL(message.content);
                          setIsOpenPic(true);
                      }}
                      />
                    </div>
                  )}
                  {message.type === 'video' && (
                    <div className="rounded-lg overflow-hidden">
                      <video controls className="w-48 h-auto rounded-lg">
                        <source src={message.content} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{message.created_at}</p>
                  {sender != 'shop' || message.sender == 'shop' && (
                     <p className="text-xs text-gray-500 mt-1">ส่งโดย:{message.sender_name}</p>
                  )}
                 
                </div>
              </div>
            ))}
          </PerfectScrollbar>
          <div className="border-t border-gray-200 pt-4 flex items-center gap-2">
            {/* <input
              type="text"
              value={textMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}  
              className="flex-grow p-2 border rounded-lg"
              placeholder="Type a message"
            /> */}
            <textarea value={textMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              className="flex-grow p-2 border rounded-lg resize-none"
              placeholder="Type a message"
              rows={1} />
            <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-primary">
              <IconPaperclip />
            </button> *
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              //accept="image/*,video/*"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button onClick={sendMessage} className="text-primary hover:text-primary-dark">
              <IconSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;

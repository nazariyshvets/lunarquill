interface Message {
  id: string;
  msg: string;
  senderId?: string;
  senderUsername?: string;
  recipientId: string;
  time: number;
}

export default Message;

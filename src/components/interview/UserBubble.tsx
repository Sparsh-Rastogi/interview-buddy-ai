import type { Message } from '@/types';

const UserBubble = ({ message }: { message: Message }) => (
  <div className="flex justify-end animate-fade-in">
    <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-primary p-3">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-primary-foreground">{message.content}</p>
    </div>
  </div>
);

export default UserBubble;

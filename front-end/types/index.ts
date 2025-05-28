import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
//Message for chatbot
export type ChatMessage = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}
export type Message = {
  id: string;
  chat_id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  updated_at: string;
}
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
  status: "pending" | "done" | "error";
}
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export interface UserProfile {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  last_login: string;
  gdpr_consent: boolean;
  consent_timestamp: string;
  stripe_customer_id: string;
  subscription_status: string;
  email_confirmed_date: string;
  privacy: boolean;
  role: UserRole;
  email: string;
} 
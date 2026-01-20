
export enum Role {
  USER = 'user',
  AI = 'model',
}

export interface TextPart {
  text: string;
}

export interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string; // base64
  };
}

export type Part = TextPart | ImagePart;

export interface ChatMessage {
  id: string;
  role: Role;
  parts: Part[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  systemInstruction?: string;
}

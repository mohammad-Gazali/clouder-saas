import { createContext, PropsWithChildren, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";

interface ChatContextType {
    addMessage: () => void;
    message: string;
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    isLoading: boolean;
}

export const ChatContext = createContext<ChatContextType>({
    addMessage: () => {},
    message: "",
    handleInputChange: () => {},
    isLoading: false,
});

export const ChatContextProvider = ({ children, fileId }: PropsWithChildren<{ fileId: string }>) => {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { toast } = useToast();

    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            const response = await fetch("/api/message", {
                method: "POST",
                body: JSON.stringify({
                    fileId,
                    message,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message")
            }

            return response.body
        }
    });

    const addMessage = () => {
        sendMessage({ message });
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    }

    return (
        <ChatContext.Provider value={{
            message,
            isLoading,
            addMessage,
            handleInputChange,
        }}>
            {children}
        </ChatContext.Provider>
    )
}
import { createContext, PropsWithChildren, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

interface NoteContextType {
    addNote: () => void;
    note: string;
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    isLoading: boolean;
}

export const NoteContext = createContext<NoteContextType>({
    addNote: () => {},
    note: "",
    handleInputChange: () => {},
    isLoading: false,
});

export const NoteContextProvider = ({ children, fileId }: PropsWithChildren<{ fileId: string }>) => {
    const [note, setNote] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { toast } = useToast();

    const { mutate: sendNote } = trpc.createNote.useMutation();

    const addNote = () => {
        sendNote({ 
            fileId,
            text: note,
        });
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNote(e.target.value);
    }

    return (
        <NoteContext.Provider value={{
            note,
            isLoading,
            addNote,
            handleInputChange,
        }}>
            {children}
        </NoteContext.Provider>
    )
}
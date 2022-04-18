import { off, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";

type FirebaseQuestions = Record <string, {
    question: {
        author: {
            avatar: string;
            name: string;
        }
        content: string;
        isAnswered: boolean;
        isHighlighted: boolean;
        likes: Record<string, {
            authorId: string;
        }>
    }
}>

type Question = {
    id: string;
    author: {
        avatar: string;
        name: string;
    }
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
    likeCount: number;
    likeId: string | undefined;
}

export function useRoom(roomId: string){
    const { user } = useAuth()
    const [questions, setQuestions] = useState<Question[]>([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        const roomRef = ref(database, `rooms/${roomId}`);

        onValue(roomRef, (room) => {
            const databaseRoom = room.val();
            const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};
            
            const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                return {
                    id: key,
                    content: value.question.content,
                    author: value.question.author,
                    isHighlighted: value.question.isHighlighted,
                    isAnswered: value.question.isAnswered,
                    likeCount: Object.values(value.question.likes ?? {}).length,
                    likeId: Object.entries(value.question.likes ?? {}).find(([key, like]) => like.authorId == user?.id)?.[0],
                }
            })
            setTitle(databaseRoom.title);
            setQuestions(parsedQuestions);
        })

        return () => {
           off(roomRef, 'value');
        }
    }, [roomId, user?.id]);

    return {questions, title}
}
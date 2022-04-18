import logoImg from '../assets/images/logo.svg';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { useParams } from 'react-router-dom'
import '../css/room.scss';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { database, ref } from '../services/firebase';
import { onValue, push } from 'firebase/database';

type FirebaseQuestions = Record <string, {
    question: {
        author: {
            avatar: string;
            name: string;
        }
        content: string;
        isAnsewered: boolean;
        isHighlighted: boolean;
    }
}>

type Question = {
    id: string;
    author: {
        avatar: string;
        name: string;
    }
    content: string;
    isAnsewered: boolean;
    isHighlighted: boolean;
}

type RoomParams = {
    id: string;
}

export function Room(){
    const {user} = useAuth();
    const params = useParams<RoomParams>();
    const roomId = params.id!;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        const roomRef = ref(database, `rooms/${roomId}`);

        onValue(roomRef, (room) => {
            const databaseRoom = room.val();
            const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};
            
            const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                console.log(value);
                return {
                    id: key,
                    content: value.question.content,
                    author: value.question.author,
                    isHighlighted: value.question.isHighlighted,
                    isAnsewered: value.question.isAnsewered,
                }
            })
            setTitle(databaseRoom.title);
            setQuestions(parsedQuestions);
        })
    }, [roomId]);


    const [newQuestion, setNewQuestion] = useState("");

    async function handleSendQuestion(event: FormEvent) {
        event.preventDefault();

        if(newQuestion.trim() == ""){
            return;
        }
        if(!user){
            throw new Error('You must be logged in');
        }

        const question = {
            content: newQuestion,
            author: {
                name: user.name,
                avatar: user.avatar,
            },
            isHighlighted: false,
            isAnsewered: false
        };

        const roomRef = await ref(database, `rooms/${roomId}/questions`)
        const roomRefs = await push(roomRef, {question});

        setNewQuestion('');
    }

    return(
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <RoomCode code={roomId}/>
                </div>
            </header>
            <main className="content">
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
                </div>
                <form onSubmit={handleSendQuestion}>
                    <textarea
                    placeholder="O que você quer perguntar"
                    onChange={event => setNewQuestion(event.target.value)}
                    value={newQuestion}/>
                    <div className="form-footer">
                        {user ? (
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div>
                        ) : (
                            <span>Para enviar uma pergunta, <button>faça seu login</button>.</span>
                        )}
                        <Button type="submit" disabled={!user}>Enviar pergunta</Button>
                    </div>
                </form>
                {JSON.stringify(questions)}
            </main>
        </div>
    );
}
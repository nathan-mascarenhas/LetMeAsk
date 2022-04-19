import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg'
import checkImg from '../assets/images/check.svg'
import answerImg from '../assets/images/answer.svg'

import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { useNavigate, useParams } from 'react-router-dom'
import '../css/room.scss';
import { useAuth } from '../hooks/useAuth';
import { Question } from '../components/Question';
import { useRoom } from '../hooks/useRoom';
import { database, ref } from '../services/firebase';
import { remove, update } from 'firebase/database';

type RoomParams = {
    id: string;
}

export function AdminRoom(){
    // const {user} = useAuth();
    const navigate = useNavigate()
    const params = useParams<RoomParams>();
    const roomId = params.id!;
    const { title, questions } = useRoom(roomId);

    async function handleEndRoom() {
        const roomRef = await ref(database,`rooms/${roomId}`)
        update(roomRef, {
            endedAt: new Date(),
        })

        navigate('/')
    }

    async function handleDeleteQuestion(questionId: string) {
        if (window.confirm('Você tem certeza que deseja remover essa pergunta?')){
            const questionRef = await ref(database, `rooms/${roomId}/questions/${questionId}` )
            remove(questionRef)
        }
    }

    async function handleCheckQuestionAsAnswered(questionId: string){
        const questionRef = await ref(database, `rooms/${roomId}/questions/${questionId}/question` )
        update(questionRef, {
            isAnswered: true,
        })
    }

    async function handleHighlightQuestion(questionId: string){
        const questionRef = await ref(database, `rooms/${roomId}/questions/${questionId}/question` )
        update(questionRef, {
            isHighlighted: true,
        })
    }

    return(
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <div>
                        <RoomCode code={roomId}/>
                        <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
                    </div>
                </div>
            </header>
            <main className="content">
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
                </div>
                <div className="question-list">
                    {questions.map(question => {
                        return(
                            <Question
                            key={question.id} 
                            content={question.content}
                            author={question.author}
                            isAnswered={question.isAnswered}
                            isHighlighted={question.isHighlighted}>
                              
                              {!question.isAnswered && (   
                                <>
                                    <button
                                    type="button"
                                    onClick={() => handleCheckQuestionAsAnswered(question.id)}>
                                        <img src={checkImg} alt="Marcar pergunta como respondida" />
                                    </button>
                                    <button
                                    type="button"
                                    onClick={() => handleHighlightQuestion(question.id)}>
                                        <img src={answerImg} alt="Dar destaque à pergunta" />
                                    </button>
                                </>
                              )}
                                <button
                                type="button"
                                onClick={() => handleDeleteQuestion(question.id)}>
                                    <img src={deleteImg} alt="Remover pergunta" />
                                </button>
                            </Question>
                        )
                    })}
                </div>
            </main>
        </div>
    );
}
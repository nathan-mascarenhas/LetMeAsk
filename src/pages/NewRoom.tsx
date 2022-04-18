import { Link, useNavigate } from 'react-router-dom'
import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';
import googleIconImg from '../assets/images/google-icon.svg';
import { Button } from '../components/Button';
import '../css/auth.scss';
import { useAuth } from '../hooks/useAuth';
import { FormEvent, useState } from 'react'
import { database, firebase, ref} from '../services/firebase';
import { set, push } from 'firebase/database';

export function NewRoom() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [newRoom, setNewRoom] = useState('');

    async function handleCreateRoom(event: FormEvent){
        event.preventDefault()
        //.trim avaliar os espaços 
        if(newRoom.trim()==""){
            return;
        }
        const roomRef = ref(database, 'rooms'); 
        const firebaseRoom = push(roomRef, {
            title: newRoom,
            authorId: user?.id,
        })
        navigate(`/rooms/${firebaseRoom.key}`)
    }

    return(
        <div id="page-auth">
            <aside>
                <img src={illustrationImg} alt="Ilustração simbolizando perguntas e respostas" />
                <strong>Crie salas de Q&amp;A ao-vivo</strong>
                <p>Tie as dúvidas da sua audiência em tempo-real</p>
            </aside>
            <main>
                <div className="main-content">
                    <img src={logoImg} alt="Letmeask" />
                    <h2>Criar uma nova sala</h2>
                    <form onSubmit={handleCreateRoom}>
                        <input type="text" placeholder="Nome da Sala" onChange={event => setNewRoom(event.target.value)}
                        value={newRoom}/>
                        <Button type="submit">
                            Criar Sala
                        </Button>
                    </form>
                    <p>Quer entrar em uma sala existente? <Link to='/'>Clique Aqui</Link></p>
                </div>
            </main>
        </div>
    )
}
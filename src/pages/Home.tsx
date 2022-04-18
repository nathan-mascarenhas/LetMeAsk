import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';
import googleIconImg from '../assets/images/google-icon.svg';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import '../css/auth.scss';
import { auth, database, firebase, provider, ref } from '../services/firebase';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { get } from 'firebase/database';
import { useAuth } from '../hooks/useAuth';
import { FormEvent, useState } from 'react';

export function Home() {
    const navigate = useNavigate();
    const {user, signInWithGoogle} = useAuth();
    const [roomCode, setRoomCode] = useState('');

  async  function handleCreateRoom(){
        if(!user) {
            await signInWithGoogle()
        }
        navigate('/rooms/new')
        }

    async function handleJoinRoom(event: FormEvent){
        event.preventDefault();
        
        if(roomCode.trim()==""){
            return;
        }

        const roomRef = await ref(database,`rooms/${roomCode}`);
        const roomCheck = await get(roomRef)

        if (!roomCheck.exists()){
            alert('Room does not exists.')
            return;
        }
        navigate(`/rooms/${roomCode}`)
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
                    <button onClick={handleCreateRoom} className="create-room">
                        <img src={googleIconImg} alt="Logo do Google" />
                        Crie sua sala com o Google
                    </button>
                    <div className="separator">ou entre em uma sala</div>
                    <form>
                        <input type="text" placeholder="Digite o código da sala" onChange={event => setRoomCode(event.target.value)}
                        value={roomCode}/>
                        <Button onClick={handleJoinRoom} type="submit">
                            Entrar na sala
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    )
}
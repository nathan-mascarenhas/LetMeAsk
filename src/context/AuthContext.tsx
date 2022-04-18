import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { createContext, ReactNode, useEffect, useState } from "react";
import { auth, provider } from "../services/firebase";

type User = {
    id: string;
    name: string;
    avatar: string;
  }
  
type AuthContextType = {
user: User | undefined;
signInWithGoogle: () => void;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as any);

export function AuthContextProvider(props: AuthContextProviderProps){
    
    const[user, setUser] = useState<User>()

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        if(user){
          const {displayName, photoURL, uid} = user
  
          if(!displayName || !photoURL) {
            throw new Error("Missing information from Google Account.");
          }
  
          setUser({
            id: uid,
            name: displayName,
            avatar: photoURL,
          })
        }
      })
      return () => {
        unsubscribe();
      }
    }, [])
  
    function signInWithGoogle() {
      signInWithPopup(auth, provider)
      .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;
          const user = result.user;
          if (result.user) {
            const {displayName, photoURL, uid} = result.user
  
            if(!displayName || !photoURL) {
              throw new Error("Missing information from Google Account.");
            }
  
            setUser({
              id: uid,
              name: displayName,
              avatar: photoURL,
            })
          }
  
      }).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.email;
          const credential = GoogleAuthProvider.credentialFromError(error);
      })
    }  

    return(
        <AuthContext.Provider value={{user, signInWithGoogle}}>
            {props.children}
        </AuthContext.Provider>
    );
}
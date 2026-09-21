import { auth, googleProvider, signInWithPopup, onAuthStateChanged, firebaseSignOut } from "./firebase.js";
import { setUser, logout, currentUser } from "./state.js";

function normalize(firebaseUser){
  return {id:firebaseUser.uid,name:firebaseUser.displayName||firebaseUser.email?.split("@")[0]||"Student",email:firebaseUser.email||"",picture:firebaseUser.photoURL||"",provider:"google"};
}
export async function googleLogin(){
  const result=await signInWithPopup(auth,googleProvider);
  const user=normalize(result.user);setUser(user);return user;
}
export async function signOut(){
  try{await firebaseSignOut(auth)}catch{}
  logout();
}
export function demoLogin(){
  const existing=currentUser();
  const user=existing?.provider==="demo"?existing:{id:"demo-student",name:"Aarav Sharma",email:"demo@student.factorialacademy.local",picture:"",provider:"demo"};
  setUser(user);return user;
}
export function watchAuth(onUser){
  return onAuthStateChanged(auth, firebaseUser=>{
    if(firebaseUser){const u=normalize(firebaseUser);setUser(u);onUser(u)}
    else onUser(currentUser());
  });
}
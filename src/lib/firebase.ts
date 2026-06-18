import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUU2LlvL9ZJSzAfun7oqPHvIaTVO4Qe6M",
  authDomain: "charismatic-conquest-zdzmz.firebaseapp.com",
  projectId: "charismatic-conquest-zdzmz",
  storageBucket: "charismatic-conquest-zdzmz.firebasestorage.app",
  messagingSenderId: "418186465876",
  appId: "1:418186465876:web:efb3430d4ddfd7366313c1"
};

const app = initializeApp(firebaseConfig);
// Specify the correct custom database ID as found in firebase-applet-config.json
export const db = getFirestore(app, "ai-studio-74f59f1c-99a4-400d-a42a-9004271e1e3c");

export interface FirebaseNote {
  id: string; // The firestore doc ID
  content: string;
  date: string;
  tags?: string[];
  createdAt?: any;
}

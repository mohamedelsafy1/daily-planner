import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Public web config (safe to ship: access is enforced by Firestore rules + Auth).
const app = initializeApp({
  apiKey: 'AIzaSyBbm517A0_9TrCPjzJXDggmjU6z7MTBBOw',
  authDomain: 'daily-planner-52000.firebaseapp.com',
  projectId: 'daily-planner-52000',
  storageBucket: 'daily-planner-52000.firebasestorage.app',
  messagingSenderId: '739866058337',
  appId: '1:739866058337:web:263c52e9b46fdb238fd420',
})

export const auth = getAuth(app)
export const db = getFirestore(app)

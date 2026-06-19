/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { db } from './lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { 
  Rocket, 
  Share2, 
  FileText, 
  Megaphone, 
  Mail, 
  Percent, 
  Briefcase, 
  Lightbulb, 
  Lock, 
  Unlock, 
  User, 
  Plus, 
  Trash2, 
  LogOut, 
  Search, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Bell,
  Globe,
  Sparkles,
  ChevronRight,
  Send,
  MessageSquare,
  Inbox,
  Clock,
  Tag,
  Filter,
  RefreshCw,
  ArrowRight,
  MessageCircle,
  Award,
  BookOpen,
  X,
  UserCheck,
  Check,
  LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import nabilProfileImg from "./assets/images/nabil_exact_profile_1781858748715.jpg";

// Interfaces
interface Note {
  id: string;
  content: string;
  date: string;
  tags?: string[];
  category?: string;
  createdAt?: number;
}

interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  messageText: string;
  replyText?: string;
  repliedAt?: string;
  createdAt: number;
  isRead: boolean;
}

interface DigitalChannel {
  id: string;
  titleBn: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  tools: string[];
}

export default function App() {
  // Database States
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Notice Publisher Inputs (Admin)
  const [noteInput, setNoteInput] = useState('');
  const [noteCategory, setNoteCategory] = useState('SEO');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  // Visitor Message Chat Mode States
  const [chatUser, setChatUser] = useState<string>(() => {
    return localStorage.getItem('nabil_chat_username') || '';
  });
  const [nameInput, setNameInput] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState<string>(''); // For admin filtering chat view
  const [activeAdminChatMsgs, setActiveAdminChatMsgs] = useState<Message[]>([]);
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // Admin Portal states
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<'publish' | 'chats' | 'settings'>('chats');
  const [replyInputMap, setReplyInputMap] = useState<{ [messageId: string]: string }>({});

  // App General states
  const [activeChannelId, setActiveChannelId] = useState<string>('seo');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAboutMe, setShowAboutMe] = useState(false);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const adminChatEndRef = useRef<HTMLDivElement>(null);

  // Dynamic credentials from firestore settings/adminCredentials
  const [dbAdminId, setDbAdminId] = useState('nabil08');
  const [dbAdminPass, setDbAdminPass] = useState('nabil.0809');

  // Interactive inputs for changing credentials
  const [newAdminIdInput, setNewAdminIdInput] = useState('');
  const [newAdminPassInput, setNewAdminPassInput] = useState('');
  const [confirmAdminPassInput, setConfirmAdminPassInput] = useState('');
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);

  // Dynamic About Me customization states
  const DEFAULT_ABOUT_ME = {
    title: "✦ About Me | ডিজিটাল মার্কেটিং স্পেশালিস্ট",
    name: "নাবিল আহমেদ",
    role: "Digital Marketing Specialist",
    profileImg: nabilProfileImg,
    bioIntro: "হ্যালো! আমি নাবিল, একজন পেশাদার ডিজিটাল মার্কেটার এবং ফ্রিল্যান্সার। বর্তমান অনলাইনের যুগে যেকোনো ব্যবসাকে সঠিক কাস্টমারের কাছে পৌঁছে দিতে এবং ব্র্যান্ডের পরিচিতি বাড়াতে আমি কাজ করছি।",
    bioBody: "আমি বিশ্বাস করি, ডিজিটাল মার্কেটিং কেবল বিজ্ঞাপন দেওয়া নয়, বরং সঠিক স্ট্র্যাটেজি ব্যবহার করে একটি ব্যবসাকে সফল ব্র্যান্ডে রূপান্তর করা। ফ্রিল্যান্সিং সেক্টরে আমার মূল লক্ষ্য হলো ক্লায়েন্টদের ব্যবসার জন্য সাশ্রয়ী খরচে সর্বোচ্চ ফলাফল (ROI) নিশ্চিত করা।",
    seoText: "আপনার ওয়েবসাইটকে গুগলের প্রথম পাতায় নিয়ে এসে অর্গানিক ট্রাফিক ও কাস্টমার বৃদ্ধি করা।",
    smmText: "ফেসবুক, ইনস্টাগ্রাম, লিঙ্কডইন এবং ইউটিউবের জন্য কার্যকরী ক্যাম্পেইন ও বুস্টিং ম্যানেজমেন্ট।",
    contentMarketingText: "টার্গেটেড অডিয়েন্সের মন জয় করার মতো আকর্ষণীয় কনটেন্ট ও প্ল্যান তৈরি করা।",
    paidAdsText: "গুগল অ্যাডস (Google Ads) এবং মেটা অ্যাডসের মাধ্যমে নিখুঁতভাবে কাস্টমার টার্গেট করা এবং ফলাফল ট্র্যাক রাখা।",
    whyAudienceResearch: "আপনার পণ্য বা সেবা ঠিক কার প্রয়োজন, তা ডাটা অ্যানালাইসিস করে খুঁজে বের করি।",
    whyCostEffective: "কম বাজেটে কীভাবে সবচেয়ে ভালো আউটপুট আনা যায়, সেই প্ল্যান তৈরি করি।",
    whyGlobalReach: "দেশীয় মার্কেটপ্লেসের পাশাপাশি আন্তর্জাতিক ব্র্যান্ডের সাথে কাজ করার অভিজ্ঞতা ও গ্লোবাল মার্কেটিং স্ট্র্যাটেজি।",
    footerQuote: "আপনার ব্যবসাকে অনলাইনের দুনিয়ায় এক ধাপ এগিয়ে নিতে এবং গ্লোবাল অডিয়েন্সের কাছে পৌঁছাতে আমি আছি আপনার পাশে। চলুন একসাথে আপনার ব্র্যান্ডের ডিজিটাল যাত্রা শুরু করি!"
  };

  const [aboutMe, setAboutMe] = useState(DEFAULT_ABOUT_ME);
  const [aboutMeInput, setAboutMeInput] = useState(DEFAULT_ABOUT_ME);
  const [isUpdatingAboutMe, setIsUpdatingAboutMe] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  const categoriesList = [
    { value: 'SEO', label: 'সার্চ ইঞ্জিন অপটিমাইজেশন (SEO)' },
    { value: 'SMM', label: 'সোশ্যাল মিডিয়া মার্কেটিং (SMM)' },
    { value: 'SEM', label: 'গুগল এডস ও পেইড ক্যাম্পেইন (SEM)' },
    { value: 'Content', label: 'কন্টেন্ট ও কপিরাইটিং (Content)' },
    { value: 'Email', label: 'ইমেইল মার্কেটিং (Email)' },
    { value: 'Affiliate', label: 'অ্যাফিলিয়েট নেটওয়ার্ক (Affiliate)' },
    { value: 'Notes', label: 'বিশেষ নোট ও টিপস (Notes)' },
    { value: 'General', label: 'সাধারণ নোটিশ (General)' }
  ];

  const filterCategories = [
    { value: 'All', label: '📢 সব ক্যাটাগরি' },
    { value: 'SEO', label: '🚀 এসইও (SEO)' },
    { value: 'SMM', label: '📱 সোশ্যাল মিডিয়া (SMM)' },
    { value: 'SEM', label: '💰 গুগল এডস (SEM)' },
    { value: 'Content', label: '✍️ কন্টেন্ট রাইটিং' },
    { value: 'Email', label: '✉️ ইমেইল মার্কেটিং' },
    { value: 'Affiliate', label: '🔗 অ্যাফিলিয়েট' },
    { value: 'Notes', label: '📝 বিশেষ নোট' },
    { value: 'General', label: '🔔 সাধারণ নোটিশ' }
  ];

  const getCategoryLabel = (catVal?: string) => {
    const found = categoriesList.find(c => c.value === catVal);
    return found ? found.label : (catVal || 'সাধারণ নোটিশ');
  };

  // 1. Synchronize Notes & Announcements
  useEffect(() => {
    const notesQuery = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    
    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
      const fetchedNotes: Note[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedNotes.push({
          id: doc.id,
          content: data.content || '',
          date: data.date || '',
          tags: data.tags || [],
          category: data.category || 'General',
          createdAt: data.createdAt || 0
        });
      });
      
      // Fallback hydration if empty
      if (snapshot.empty) {
        const defaultDoc = {
          content: 'ডিজিটাল মার্কেটিং গাইডবুক আপডেট! গুগল সার্চ কনসোল ও অন-পেইজ এসইও ব্যবহার করে আপনার ওয়েবসাইটের অরগানিক রিচ বাড়িয়ে নিন ৩০০ গুণ পর্যন্ত।',
          date: new Date().toLocaleString('bn-BD', { hour12: true }),
          tags: [],
          category: 'SEO',
          createdAt: Date.now()
        };
        addDoc(collection(db, 'notes'), defaultDoc);
      } else {
        setNotes(fetchedNotes);
      }
    }, (error) => {
      console.error('Error syncing notes from firestore: ', error);
    });

    const storedAdmin = sessionStorage.getItem('nabil_admin_logged');
    if (storedAdmin === 'true') {
      setIsAdmin(true);
    }

    return () => unsubscribeNotes();
  }, []);

  // 2. Synchronize messages in Real-Time for Visitor and Admin
  useEffect(() => {
    const msgsQuery = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    
    const unsubscribeMessages = onSnapshot(msgsQuery, (snapshot) => {
      const fetchedMsgs: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMsgs.push({
          id: doc.id,
          senderName: data.senderName || '',
          senderEmail: data.senderEmail || '',
          subject: data.subject || '',
          messageText: data.messageText || '',
          replyText: data.replyText || '',
          repliedAt: data.repliedAt || '',
          createdAt: data.createdAt || 0,
          isRead: !!data.isRead
        });
      });
      setMessages(fetchedMsgs);
    }, (error) => {
      console.error('Error listing user queries: ', error);
    });

    return () => unsubscribeMessages();
  }, []);

  // Scroll to bottom on helper threads
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatUser]);

  useEffect(() => {
    if (adminChatEndRef.current) {
      adminChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedChatUser]);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Chat user login handler (Enter Key or Button)
  const handleRegisterChatUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const name = nameInput.trim();
    setChatUser(name);
    localStorage.setItem('nabil_chat_username', name);
    showToast(`স্বাগতম ${name}! লাইভ চ্যাট হেল্প সেন্টারে যুক্ত হয়েছেন।`);
  };

  // Exit chat session
  const handleExitChat = () => {
    localStorage.removeItem('nabil_chat_username');
    setChatUser('');
    setNameInput('');
    showToast('চ্যাট সেশন বন্ধ করা হয়েছে।');
  };

  // Send message chat entry
  const handleSendLiveMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !chatUser) return;

    try {
      setIsSendingMsg(true);
      const msgData = {
        senderName: chatUser,
        senderEmail: `${chatUser.toLowerCase().replace(/\s+/g, '')}@live.chat`,
        subject: 'Live Help Desk Inquiry',
        messageText: chatMessage.trim(),
        replyText: '',
        repliedAt: '',
        createdAt: Date.now(),
        isRead: false
      };
      
      await addDoc(collection(db, 'messages'), msgData);
      setChatMessage('');
      showToast('বার্তা প্রেরণ সম্পন্ন হয়েছে!');
    } catch (error) {
      console.error('Error posting live message: ', error);
      showToast('সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setIsSendingMsg(false);
    }
  };

  // 0. Synchronize custom Admin credentials from Firestore
  useEffect(() => {
    const unsubscribeCreds = onSnapshot(doc(db, 'settings', 'adminCredentials'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.adminId) setDbAdminId(data.adminId);
        if (data.adminPass) setDbAdminPass(data.adminPass);
      }
    }, (error) => {
      console.warn("Could not load credentials from Firestore:", error);
    });
    return () => unsubscribeCreds();
  }, []);

  // Update admin credentials in firestore
  const handleUpdateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminIdInput.trim() || !newAdminPassInput) {
      showToast('অনুগ্রহ করে আইডি এবং পাসওয়ার্ড সম্পূর্ণ লিখুন।');
      return;
    }
    if (newAdminPassInput !== confirmAdminPassInput) {
      showToast('পাসওয়ার্ড দুটি মেলেনি! দয়া করে পুনরায় চেক করুন।');
      return;
    }

    try {
      setIsUpdatingCredentials(true);
      await setDoc(doc(db, 'settings', 'adminCredentials'), {
        adminId: newAdminIdInput.trim(),
        adminPass: newAdminPassInput
      });
      showToast('আইডি এবং পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
      setNewAdminIdInput('');
      setNewAdminPassInput('');
      setConfirmAdminPassInput('');
    } catch (error) {
      console.error('Error updating credentials: ', error);
      showToast('আপডেট ব্যর্থ হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setIsUpdatingCredentials(false);
    }
  };

  // Synchronize dynamic About Me settings from Firestore
  useEffect(() => {
    const unsubscribeAbout = onSnapshot(doc(db, 'settings', 'aboutMe'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const cleanedProfileImg = (data.profileImg && !data.profileImg.startsWith('/src/assets/')) 
          ? data.profileImg 
          : DEFAULT_ABOUT_ME.profileImg;

        const merged = {
          title: data.title || DEFAULT_ABOUT_ME.title,
          name: data.name || DEFAULT_ABOUT_ME.name,
          role: data.role || DEFAULT_ABOUT_ME.role,
          profileImg: cleanedProfileImg,
          bioIntro: data.bioIntro || DEFAULT_ABOUT_ME.bioIntro,
          bioBody: data.bioBody || DEFAULT_ABOUT_ME.bioBody,
          seoText: data.seoText || DEFAULT_ABOUT_ME.seoText,
          smmText: data.smmText || DEFAULT_ABOUT_ME.smmText,
          contentMarketingText: data.contentMarketingText || DEFAULT_ABOUT_ME.contentMarketingText,
          paidAdsText: data.paidAdsText || DEFAULT_ABOUT_ME.paidAdsText,
          whyAudienceResearch: data.whyAudienceResearch || DEFAULT_ABOUT_ME.whyAudienceResearch,
          whyCostEffective: data.whyCostEffective || DEFAULT_ABOUT_ME.whyCostEffective,
          whyGlobalReach: data.whyGlobalReach || DEFAULT_ABOUT_ME.whyGlobalReach,
          footerQuote: data.footerQuote || DEFAULT_ABOUT_ME.footerQuote,
        };
        setAboutMe(merged);
        setAboutMeInput(merged);
      }
    }, (error) => {
      console.warn("Could not load About Me details from Firestore:", error);
    });
    return () => unsubscribeAbout();
  }, []);

  // Update About Me profile in firestore
  const handleUpdateAboutMe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingAboutMe(true);
      await setDoc(doc(db, 'settings', 'aboutMe'), {
        title: aboutMeInput.title,
        name: aboutMeInput.name,
        role: aboutMeInput.role,
        profileImg: aboutMeInput.profileImg,
        bioIntro: aboutMeInput.bioIntro,
        bioBody: aboutMeInput.bioBody,
        seoText: aboutMeInput.seoText,
        smmText: aboutMeInput.smmText,
        contentMarketingText: aboutMeInput.contentMarketingText,
        paidAdsText: aboutMeInput.paidAdsText,
        whyAudienceResearch: aboutMeInput.whyAudienceResearch,
        whyCostEffective: aboutMeInput.whyCostEffective,
        whyGlobalReach: aboutMeInput.whyGlobalReach,
        footerQuote: aboutMeInput.footerQuote,
      });
      showToast('আপনার প্রফাইল এবং ডেসক্রিপশন সফলভাবে আপডেট করা হয়েছে!');
    } catch (error) {
      console.error('Error updating About Me settings: ', error);
      showToast('আপডেট ব্যর্থ হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setIsUpdatingAboutMe(false);
    }
  };

  // Image upload base64 converter helper with automatic Canvas compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          try {
            // Create canvas for compression and resizing
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Target square size suitable for profile images (e.g. 350x350)
            const MAX_SIZE = 350;
            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              // Convert to web-optimized JPEG at 0.75 quality (usually results in beautiful, ultra-light files of ~20-30KB)
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
              setAboutMeInput(prev => ({ ...prev, profileImg: compressedDataUrl }));
              showToast("ছবি সফলভাবে আপলোড এবং সাইজ অপ্টিমাইজ করা হয়েছে!");
            } else {
              // Fallback to original image if context cannot be acquired
              setAboutMeInput(prev => ({ ...prev, profileImg: event.target?.result as string }));
              showToast("ছবি সফলভাবে নির্বাচন করা হয়েছে!");
            }
          } catch (err) {
            console.error("Canvas compression failed, falling back to original file.", err);
            setAboutMeInput(prev => ({ ...prev, profileImg: event.target?.result as string }));
            showToast("ছবি সফলভাবে নির্বাচন করা হয়েছে!");
          } finally {
            setIsCompressingImage(false);
          }
        };
        img.onerror = () => {
          showToast("ছবি লোড করতে সমস্যা হয়েছে, অনুগ্রহ করে অন্য ছবি দিয়ে চেষ্টা করুন।");
          setIsCompressingImage(false);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        showToast("ফাইল পড়তে ব্যর্থ হয়েছে, আবার চেষ্টা করুন।");
        setIsCompressingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Admin login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId.trim() === dbAdminId && adminPass === dbAdminPass) {
      setIsAdmin(true);
      setLoginError(null);
      sessionStorage.setItem('nabil_admin_logged', 'true');
      showToast('স্বাগতম নাবিল! আপনি সফলভাবে প্রবেশ করেছেন।');
    } else {
      setLoginError('ভুল আইডি অথবা পিন পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।');
    }
  };

  // Admin Logout handler
  const handleLogout = () => {
    setIsAdmin(false);
    setAdminId('');
    setAdminPass('');
    sessionStorage.removeItem('nabil_admin_logged');
    showToast('লগআউট সম্পন্ন হয়েছে।');
  };

  // Post new categorized digital marketing Announcement (Admin)
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noteInput.trim() === '') return;

    const newNote = {
      content: noteInput,
      date: new Date().toLocaleString('bn-BD', { hour12: true }),
      category: noteCategory,
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, 'notes'), newNote);
      setNoteInput('');
      showToast('নতুন গাইডবুক আপডেট সফলভাবে লাইভ পাবলিশ করা হয়েছে!');
    } catch (error) {
      console.error('Error uploading note: ', error);
      showToast('আপলোড ব্যর্থ হয়েছে!');
    }
  };

  // Delete note published (Admin)
  const handleDeleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
      showToast('নোটটি ডাটাবেজ থেকে মুছে ফেলা হয়েছে।');
    } catch (error) {
      console.error('Error deleting: ', error);
    }
  };

  // Reply message on the chat board
  const handleSendReply = async (messageId: string) => {
    const text = replyInputMap[messageId];
    if (!text || !text.trim()) return;

    try {
      const messageDoc = doc(db, 'messages', messageId);
      await updateDoc(messageDoc, {
        replyText: text.trim(),
        repliedAt: new Date().toLocaleTimeString('bn-BD', { hour: 'numeric', minute: 'numeric', hour12: true }),
        isRead: true
      });
      setReplyInputMap(prev => ({
        ...prev,
        [messageId]: ''
      }));
      showToast('রিপ্লাই লাইভ সেন্টারে যুক্ত করা হয়েছে!');
    } catch (err) {
      console.error('Error sending reply: ', err);
      showToast('জবাব প্রসেস করতে ব্যর্থ হয়েছে।');
    }
  };

  // Delete customer query (Admin)
  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
      showToast('মেসেজটি মুছে ফেলা হয়েছে।');
      if (selectedChatUser) {
        // If the deleted message was of the selected chat user, refresh if empty
        const remaining = messages.filter(m => m.id !== id && m.senderName === selectedChatUser);
        if (remaining.length === 0) {
          setSelectedChatUser('');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter notes by search + category
  const filteredNotes = notes.filter(note => {
    if (activeCategoryFilter !== 'All' && note.category !== activeCategoryFilter) {
      return false;
    }
    const q = searchQuery.toLowerCase();
    const contentMatch = note.content.toLowerCase().includes(q);
    const categoryMatch = (note.category || '').toLowerCase().includes(q);
    return contentMatch || categoryMatch;
  });

  // Group messages by username for Admin's live workspace view
  const chatUsers = Array.from(new Set(messages.map(m => m.senderName))).filter(Boolean) as string[];
  
  // Custom interactive channels
  const channels: DigitalChannel[] = [
    {
      id: 'seo',
      titleBn: 'সার্চ ইঞ্জিন অপটিমাইজেশন (SEO)',
      titleEn: 'Search Engine Optimization',
      icon: Rocket,
      desc: 'আপনার ওয়েবসাইট পেইজকে গুগল অর্গানিক অনুসন্ধানের প্রথম সারিতে র্যাঙ্ক করানোর আধুনিক কারিগরি পদ্ধতি। সঠিক কী-ওয়ার্ড রিসার্চ ও অন-পেইজ অপটিমাইজেশনের মাধ্যমে সাইট ট্রাফিক বৃদ্ধি নিশ্চিত করে।',
      tools: ['Google Search Console', 'Ahrefs Premium', 'SEMrush Master', 'Google Keyword Planner', 'Screaming Frog']
    },
    {
      id: 'smm',
      titleBn: 'সোশ্যাল মিডিয়া মার্কেটিং (SMM)',
      titleEn: 'Social Media Marketing',
      icon: Share2,
      desc: 'ফেসবুক, লিঙ্কডইন এবং ইনস্টাগ্রামের সাহায্যে সঠিক ক্রেতাদের অডিয়েন্স ফানেলে যুক্ত করা। রিচ কন্টেন্ট এবং ধারাবাহিক পোস্টিংয়ের মাধ্যমে ব্র্যান্ড ভ্যালু ও বিশ্বাসযোগ্যতা উন্নয়ন করা যায়।',
      tools: ['Meta Business Suite', 'Canva Graphics Studio', 'Adobe Illustrator', 'Later Scheduling', 'CapCut Pro']
    },
    {
      id: 'sem',
      titleBn: 'পেইড মিডিয়া ও গুগল এডস (SEM)',
      titleEn: 'PPC & Online Business Ads',
      icon: Megaphone,
      desc: 'বিজ্ঞাপনের খরচ সর্বনিম্ন রেখে হাই রিফান্ড জেনারেটিং গুগল সার্চ ক্যাম্পেইন, ইনস্ট্যান্ট ফেসবুক বুস্টিং এবং ইউটিউব লিড জেনারেশন অ্যাড পরিচালনা করা যা কনভার্শন অনেক গুনে বাড়িয়ে দেয়।',
      tools: ['Google Ads Manager', 'Facebook Pixel Script', 'Ads Analytics Dashboard', 'Meta Leads Custom API']
    },
    {
      id: 'content',
      titleBn: 'বাণিজ্যিক কন্টেন্ট প্রসেসিং',
      titleEn: 'Content Strategy & Copywriting',
      icon: FileText,
      desc: 'গ্রাহকের আবেগ ও প্রয়োজন অনুযায়ী তথ্যবহুল টেক্সট ব্লগিং, প্রোমোショナル ল্যান্ডিং পেইজ স্ক্রিপ্ট, ভিডিওর ভয়েস ওভার এবং ভাইরাল সোশ্যাল কপি প্রস্তুত করা যা সরাসরি বিক্রিতে রূপান্তরিত হয়।',
      tools: ['Gemini Advanced API', 'WordPress Studio', 'Notion Space', 'Grammarly Business', 'Copyscape Premium']
    },
    {
      id: 'email',
      titleBn: 'ইমেইল মার্কেটিং ক্যাম্পেইন',
      titleEn: 'Automated Email Marketing',
      icon: Mail,
      desc: 'অটোমেটেড সেলস পাইপলাইনের সাহায্যে কাস্টমাইজড ইমেইল ব্রডকাস্ট পাঠানো। কুপন অফার সিঙ্ক করে পুরনো ও স্থায়ী গ্রাহকদের পুনরায় অর্ডার করতে উৎসাহিত করার জন্য চমৎকার টেকনিক।',
      tools: ['Mailchimp Marketing', 'Klaviyo Automation', 'Brevo Connector', 'Subject Line Generator']
    },
    {
      id: 'affiliate',
      titleBn: 'অ্যাফিলিয়েট নেটওয়ার্কিং',
      titleEn: 'Affiliate Growth Framework',
      icon: Percent,
      desc: 'গলোবাল বিশ্বস্ত প্রোডাক্ট সোর্সিং ফানেলের সাথে সম্পৃক্ত হয়ে কাস্টম ট্র্যাকিং লিংক প্রমোট করা এবং সফল বিক্রিতে নিয়মিত কমিশন প্যাসিভ সোর্স হিসেবে নিশ্চিত করা।',
      tools: ['Amazon Associates Console', 'ShareASale', 'ClickBank Integration', 'LinkTree Advanced Pro']
    }
  ];

  return (
    <div id="app-root" className="min-h-screen bg-[#fafafc] text-slate-800 font-sans antialiased relative overflow-x-hidden selection:bg-red-100 selection:text-red-900">
      
      {/* Light aesthetic abstract background glow decorators */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 left-[-10%] w-[600px] h-[600px] bg-red-100/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[450px] h-[450px] bg-purple-100/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Grid line texture overlay */}
      <div className="absolute inset-x-0 top-0 h-[100vh] bg-[linear-gradient(rgba(220,38,38,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-80" />

      {/* Modern Floating Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-24 right-4 sm:right-8 z-50 bg-white border border-purple-100 shadow-[0_12px_30px_rgba(220,38,38,0.08)] px-5 py-3.5 rounded-2xl flex items-center gap-3 text-sm text-slate-800"
          >
            <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span className="font-semibold tracking-wide font-sans">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Absolute About Me Overlay Modal */}
      <AnimatePresence>
        {showAboutMe && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop cover */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAboutMe(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Body Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row z-10 max-h-[90vh] md:max-h-[85vh]"
            >
              {/* Corner Close button */}
              <button 
                onClick={() => setShowAboutMe(false)}
                className="absolute top-4 right-4 bg-slate-50 border border-slate-100 hover:bg-red-50 hover:text-red-650 hover:border-red-100 p-2 rounded-full cursor-pointer transition-all z-20"
                title="মেম্বার ড্যাশবোর্ড বন্ধ করুন"
              >
                <X className="h-5 w-5" />
              </button>

              {/* SECTION 1: Avatar Side Panel (Left column) */}
              <div className="w-full md:w-[35%] bg-slate-50 border-r border-slate-100/80 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/20 rounded-bl-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-100/10 rounded-tr-full pointer-events-none" />
                
                {/* Image Showcase */}
                <div className="relative group mb-4">
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-red-600 to-purple-500 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse" />
                  <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <img 
                      src={aboutMe.profileImg} 
                      alt="Nabil Ahmed Profile Picture" 
                      className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <h4 className="text-md sm:text-lg font-black text-slate-805 font-bengali tracking-wide leading-none">{aboutMe.name}</h4>
                <p className="text-[10px] sm:text-xs font-mono text-purple-600 mt-1.5 font-extrabold uppercase tracking-widest">{aboutMe.role}</p>
                <div className="mt-3.5 flex flex-wrap gap-1.5 justify-center">
                  <span className="bg-red-50 text-red-650 px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase border border-red-100">SEO Expert</span>
                  <span className="bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase border border-purple-100">SMM Master</span>
                </div>
              </div>

              {/* SECTION 2: Description Text Details Panel (Right column) */}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between max-h-[50vh] md:max-h-none">
                <div className="space-y-6">
                  {/* Headline Title */}
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 font-bengali leading-none">
                      <Sparkles className="h-5 w-5 text-red-500" />
                      <span>{aboutMe.title}</span>
                    </h3>
                  </div>

                  {/* Intro description paragraphs in sweet Bengali */}
                  <div className="space-y-4 text-xs text-slate-600 font-bengali leading-relaxed font-normal">
                    <p className="text-slate-700 font-bold text-sm leading-relaxed">
                      {aboutMe.bioIntro}
                    </p>
                    <p className="text-slate-600 leading-relaxed text-xs">
                      {aboutMe.bioBody}
                    </p>
                  </div>

                  {/* Skill Fields Section */}
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-extrabold uppercase font-sans tracking-larger text-red-600 flex items-center gap-1.5">
                      <Award className="h-4 w-4" />
                      <span>আমার দক্ষতার প্রধান ক্ষেত্রসমূহ:</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Item 1 */}
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl hover:bg-red-50/20 transition-all">
                        <h6 className="text-xs font-black text-slate-900 font-bengali leading-none mb-1">🔍 সার্চ ইঞ্জিন অপটিমাইজেশন (SEO)</h6>
                        <p className="text-[10.5px] text-slate-600 font-bengali leading-tight">{aboutMe.seoText}</p>
                      </div>

                      {/* Item 2 */}
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl hover:bg-red-50/20 transition-all">
                        <h6 className="text-xs font-black text-slate-900 font-bengali leading-none mb-1">📢 সোশ্যাল মিডিয়া মার্কেটিং (SMM)</h6>
                        <p className="text-[10.5px] text-slate-600 font-bengali leading-tight">{aboutMe.smmText}</p>
                      </div>

                      {/* Item 3 */}
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl hover:bg-red-50/20 transition-all">
                        <h6 className="text-xs font-black text-slate-900 font-bengali leading-none mb-1">✍️ কনটেন্ট মার্কেটিং ও স্ট্র্যাটেজি</h6>
                        <p className="text-[10.5px] text-slate-600 font-bengali leading-tight">{aboutMe.contentMarketingText}</p>
                      </div>

                      {/* Item 4 */}
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl hover:bg-red-50/20 transition-all">
                        <h6 className="text-xs font-black text-slate-900 font-bengali leading-none mb-1">📊 পেইড অ্যাডস ও অ্যানালিটিক্স</h6>
                        <p className="text-[10.5px] text-slate-600 font-bengali leading-tight">{aboutMe.paidAdsText}</p>
                      </div>

                    </div>
                  </div>

                  {/* Why work with me Section */}
                  <div className="space-y-2 pb-2">
                    <h5 className="text-[11px] font-extrabold uppercase font-sans tracking-larger text-purple-600 flex items-center gap-1.5">
                      <Check className="h-4 w-4" />
                      <span>কেন আমার সাথে কাজ করবেন?</span>
                    </h5>
                    <div className="space-y-1.5 pl-1 text-[11px] text-slate-700 font-bengali leading-relaxed">
                      <div className="flex items-start gap-2">
                        <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                        <span><strong>টার্গেটেড অডিয়েন্স রিসার্চ:</strong> {aboutMe.whyAudienceResearch}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                        <span><strong>কস্ট-ইফেক্টিভ সলিউশন:</strong> {aboutMe.whyCostEffective}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                        <span><strong>গ্লোবাল রিচ:</strong> {aboutMe.whyGlobalReach}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Quote banner */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 bg-red-50/40 p-3.5 rounded-xl border border-red-100/50">
                  <p className="text-xs font-medium text-slate-800 font-bengali text-center italic leading-relaxed">
                    {aboutMe.footerQuote}
                  </p>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightweight, clean Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-100/80 px-4 sm:px-8 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-purple-450 flex items-center justify-center shadow-lg shadow-red-600/10">
              <span className="text-white font-extrabold text-xl font-mono tracking-tighter">N</span>
            </div>
            <div>
              <h1 className="text-md sm:text-xl font-extrabold tracking-wider text-slate-900">
                NABIL <span className="bg-gradient-to-r from-red-600 to-purple-550 bg-clip-text text-transparent">FREELANCER</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 absolute" />
                <span className="text-[10px] uppercase tracking-widest text-red-600 font-bold ml-3.5 font-mono">LIVE CHET HELP DESK ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a 
              href="#help-center" 
              className="hidden md:flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-500 bg-red-50 border border-red-100 px-3.5 py-2 rounded-xl hover:bg-red-100/50 transition-all"
            >
              <LifeBuoy className="h-3.5 w-3.5" /> Live Support
            </a>

            {/* About Me Trigger Button */}
            <button 
              onClick={() => setShowAboutMe(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase border border-slate-200 bg-white hover:border-red-300 text-slate-700 hover:text-red-600 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-red-500" />
              <span>✦ About Me</span>
            </button>
            
            {/* Top Right Admin Control center login button */}
            <button 
              onClick={() => {
                setShowAdminPanel(!showAdminPanel);
                if (showAdminPanel) {
                  setLoginError(null);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                isAdmin 
                  ? 'bg-purple-50 border-purple-200 text-red-600 shadow-sm font-bengali'
                  : 'bg-white border-slate-200 hover:border-red-300 text-slate-700 hover:text-red-600'
              }`}
            >
              {isAdmin ? (
                <>
                  <UserCheck className="h-4 w-4 text-red-600" />
                  Nabil Portal (Admin)
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-red-500" />
                  Admin Login
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* ADMIN PORTAL PANEL: Float overlap triggered from top-right corner */}
        <AnimatePresence>
          {showAdminPanel && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:col-span-12 bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden relative"
            >
              <button 
                onClick={() => setShowAdminPanel(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>

              {!isAdmin ? (
                /* Sleek and clean login modal: NO prefilled identifiers */
                <div className="max-w-md mx-auto py-4">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-3 rounded-full bg-purple-50 text-red-500 mb-2">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-bengali">অ্যাডমিন কন্ট্রোল লাইভ প্যানেল</h3>
                    <p className="text-xs text-slate-500 mt-1">পাবলিশ প্রসেস এবং মেসেঞ্জার পরিচালনা করতে লগইন করুন</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">
                    {loginError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2 font-bengali">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">User Admin ID</label>
                      <input 
                        type="text" 
                        placeholder="Enter Admin ID"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-purple-200 transition-all font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Secure Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={adminPass}
                          onChange={(e) => setAdminPass(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-purple-200 transition-all font-mono pr-10"
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-red-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-600 to-purple-400 text-white font-extrabold py-3.5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-red-600/10 cursor-pointer text-xs uppercase"
                    >
                      Verify Credentials
                    </button>
                  </form>
                </div>
              ) : (
                /* Full Admin Control Hub once authenticated */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="text-lg font-bold text-slate-900 font-sans">Nabil Ahmed Workspace</h3>
                      </div>
                      <p className="text-xs text-slate-500 font-bengali mt-0.5">সবগুলো কাস্টমার বার্তা এবং ডিজিটাল গাইডবুক পোস্টিং লাইভ এখান থেকে পরিচালনা করুন।</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-2 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Logout Session
                      </button>
                    </div>
                  </div>

                  {/* Tabs layout inside workspace */}
                  <div className="flex border-b border-slate-100 gap-6 flex-wrap">
                    <button 
                      onClick={() => setAdminTab('chats')}
                      className={`pb-3 text-xs uppercase tracking-wider font-extrabold flex items-center gap-2 relative transition-all cursor-pointer ${
                        adminTab === 'chats' ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      লাইভ চ্যাট ইনবক্স ({chatUsers.length})
                      {adminTab === 'chats' && <motion.div layoutId="admActiveTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-red-600" />}
                    </button>
                    <button 
                      onClick={() => setAdminTab('publish')}
                      className={`pb-3 text-xs uppercase tracking-wider font-extrabold flex items-center gap-2 relative transition-all cursor-pointer ${
                        adminTab === 'publish' ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      ডিজিটাল গাইডবুক পোস্ট করুন
                      {adminTab === 'publish' && <motion.div layoutId="admActiveTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-red-600" />}
                    </button>
                    <button 
                      onClick={() => setAdminTab('settings')}
                      className={`pb-3 text-xs uppercase tracking-wider font-extrabold flex items-center gap-2 relative transition-all cursor-pointer ${
                        adminTab === 'settings' ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Lock className="h-4 w-4" />
                      লগইন আইডি ও পাসওয়ার্ড পরিবর্তন
                      {adminTab === 'settings' && <motion.div layoutId="admActiveTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-red-600" />}
                    </button>
                  </div>

                  {/* Sub-panels */}
                  {adminTab === 'chats' ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                      {/* Active chats list */}
                      <div className="md:col-span-4 border-r border-slate-100 pr-0 md:pr-4 space-y-2">
                        <span className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black mb-3">Active Chat Clients</span>
                        
                        {chatUsers.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs font-bengali">
                            এখনো কোনো চ্যাট মেসেজ নেই।
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                            {chatUsers.map((user) => {
                              const userMsgs = messages.filter(m => m.senderName === user);
                              const unreadCount = userMsgs.filter(m => !m.replyText).length;
                              const isSelected = selectedChatUser === user;
                              return (
                                <button
                                  key={user}
                                  onClick={() => setSelectedChatUser(user)}
                                  className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all border cursor-pointer ${
                                    isSelected 
                                      ? 'bg-purple-50/60 border-purple-200 text-red-700 font-bold' 
                                      : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-500 to-purple-400 flex items-center justify-center text-white font-bold font-mono text-xs">
                                      {user.slice(0, 1).toUpperCase()}
                                    </div>
                                    <div className="truncate">
                                      <span className="block text-xs font-semibold truncate leading-none">{user}</span>
                                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{userMsgs.length} messages</span>
                                    </div>
                                  </div>

                                  {unreadCount > 0 && (
                                    <span className="h-5 min-w-5 shrink-0 bg-red-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                                      {unreadCount}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Active workspace message stream */}
                      <div className="md:col-span-8 flex flex-col gap-4">
                        {selectedChatUser ? (
                          <>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Current active customer chat</span>
                                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{selectedChatUser}</h4>
                              </div>
                              <button 
                                onClick={() => {
                                  // Delete all messages from this visitor
                                  if (confirm(`${selectedChatUser} এর সকল চ্যাট হিস্টোরি মুছে দিতে চান?`)) {
                                    const userInbox = messages.filter(m => m.senderName === selectedChatUser);
                                    userInbox.forEach(m => handleDeleteMessage(m.id));
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete entire chat conversion thread"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>

                            {/* Stream of user conversation */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 h-[250px] overflow-y-auto space-y-3 flex flex-col">
                              {messages.filter(m => m.senderName === selectedChatUser).map((msg) => (
                                <div key={msg.id} className="space-y-1">
                                  {/* User query bubble */}
                                  <div className="flex justify-start">
                                    <div className="bg-white border border-slate-100 max-w-[85%] rounded-2xl p-3 shadow-xs">
                                      <div className="flex items-center gap-2 mb-1 justify-between">
                                        <span className="text-[9px] font-bold text-red-600 uppercase font-mono">{msg.senderName}</span>
                                        <span className="text-[9px] text-slate-400">
                                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-800 leading-relaxed font-bengali font-normal">
                                        {msg.messageText}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Answer bubble if replied */}
                                  {msg.replyText && (
                                    <div className="flex justify-end">
                                      <div className="bg-red-600 text-white max-w-[85%] rounded-2xl p-3 shadow-xs">
                                        <div className="flex items-center gap-2 mb-1 justify-between">
                                          <span className="text-[9px] font-mono uppercase tracking-widest font-black text-red-100">Nabil (Admin)</span>
                                          <span className="text-[9px] text-red-200 font-mono">{msg.repliedAt}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed font-bengali">
                                          {msg.replyText}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Inline quick responding workspace */}
                                  {!msg.replyText && (
                                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 mt-2 space-y-2">
                                      <p className="text-[10px] text-red-600 font-semibold font-bengali">নাবিল স্পন্সর্ড রিপ্লাই:</p>
                                      <div className="flex gap-2">
                                        <input 
                                          type="text" 
                                          placeholder="উত্তর লিখুন এবং এন্টার প্রেস করুন..."
                                          value={replyInputMap[msg.id] || ''}
                                          onChange={(e) => setReplyInputMap({ ...replyInputMap, [msg.id]: e.target.value })}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSendReply(msg.id);
                                          }}
                                          className="flex-1 bg-white border border-purple-200 text-xs text-slate-800 p-2 rounded-lg focus:outline-none focus:border-red-600 font-bengali"
                                        />
                                        <button 
                                          onClick={() => handleSendReply(msg.id)}
                                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 rounded-lg flex items-center justify-center font-bold"
                                        >
                                          Send
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              <div ref={adminChatEndRef} />
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-slate-100 border-dashed rounded-3xl text-slate-400">
                            <MessageCircle className="h-10 w-10 text-red-300 animate-pulse mb-2" />
                            <h4 className="text-sm font-bold text-slate-700 font-bengali">কোনো চ্যাট ক্লায়েন্ট সিলেক্ট করা নেই</h4>
                            <p className="text-xs text-slate-500 mt-0.5">বাম প্যানেলে গ্রাহক নাম সিলেক্ট করে লাইভ চ্যাট কন্ট্রোল শুরু করুন।</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : adminTab === 'publish' ? (
                    /* Categorized publisher notes workspace: Form + List of published notes for easy deletion */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Create / Publish New Note */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="pb-3 border-b border-slate-100">
                          <h4 className="text-sm font-bold text-slate-800 font-bengali">নতুন টিপস/গাইডবুক পোস্ট করুন</h4>
                          <p className="text-[10px] text-slate-400 font-sans">Submit new content live immediately</p>
                        </div>
                        <form onSubmit={handleAddNote} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                              Category (ডিজিটাল মার্কেটিং ক্যাটাগরি)
                            </label>
                            <select 
                              value={noteCategory}
                              onChange={(e) => setNoteCategory(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-sans"
                            >
                              {categoriesList.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                              Notice Content (আপনার নোট বা নোটিশ এখানে লিখুন)
                            </label>
                            <textarea 
                              rows={5} 
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="এসইও বা সোশ্যাল মিডিয়া ক্যাম্পেইন বিষয়ক কোনো মূল্যবান টিপস অথবা এনাউন্সমেন্ট লিখুন..."
                              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-4 text-xs rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all placeholder-slate-400 font-bengali leading-relaxed"
                              required
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                              <span>{noteInput.length} characters</span>
                              <span>Press Publish to Go Live</span>
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 text-xs rounded-xl shadow-lg shadow-red-600/10 active:scale-95 transition-all cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                            Publish Update Note
                          </button>
                        </form>
                      </div>

                      {/* Right: Published Notes List with deletion options */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 font-bengali">প্রকাশিত টিপস ও গাইডবুক সমূহ ({notes.length})</h4>
                            <p className="text-[10px] text-slate-400 font-sans">Manage and delete existing live posts</p>
                          </div>
                        </div>

                        {/* Scrolling list for management */}
                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                          {notes.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs font-bengali">
                              কোনো প্রকাশিত আপডেট পাওয়া যায়নি।
                            </div>
                          ) : (
                            notes.map((note) => (
                              <div 
                                key={note.id}
                                className="p-4 bg-slate-50 border border-slate-100/80 rounded-xl flex items-start justify-between gap-3 text-xs"
                              >
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold">
                                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-red-600 border border-purple-100 font-bengali">
                                      {getCategoryLabel(note.category)}
                                    </span>
                                    <span className="text-slate-400 font-mono">
                                      {note.date || 'Update'}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 leading-relaxed font-bengali break-words pr-2 font-medium">
                                    {note.content}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="self-start bg-red-50 hover:bg-red-100 border border-red-100 p-2 text-red-500 rounded-xl active:scale-90 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                                  title="Delete Note"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Settings/Credential Modification Tab Content in Grid format */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left side column: credentials modification */}
                      <div className="lg:col-span-5 bg-white border border-slate-100/50 rounded-2xl p-4 sm:p-6 space-y-6">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase font-sans flex items-center gap-2">
                            <Lock className="h-4 w-4 text-red-600" />
                            লগইন তথ্য পরিবর্তন করুন
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 font-bengali">
                            অ্যাডমিন প্যানেলে লগইন করার জন্য নতুন ইউজার আইডি এবং পাসওয়ার্ড সেট করুন। এটি ফায়ারস্টোর ডাটাবেজে সংরক্ষিত থাকবে।
                          </p>
                        </div>

                        <form onSubmit={handleUpdateAdminCredentials} className="space-y-4 font-sans text-xs">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                              Current Admin ID (চলতি আইডি)
                            </label>
                            <input 
                              type="text"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none font-mono opacity-80"
                              value={dbAdminId}
                              disabled
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">বর্তমানে সক্রিয় অ্যাডমিন আইডি</span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                              New Admin ID (নতুন আইডি)
                            </label>
                            <input 
                              type="text" 
                              placeholder="Enter New Admin ID"
                              value={newAdminIdInput}
                              onChange={(e) => setNewAdminIdInput(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-mono"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                              New Secure Password (নতুন পাসওয়ার্ড)
                            </label>
                            <input 
                              type="password" 
                              placeholder="••••••••"
                              value={newAdminPassInput}
                              onChange={(e) => setNewAdminPassInput(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-mono"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                              Confirm Password (পুনরায় লিখুন)
                            </label>
                            <input 
                              type="password" 
                              placeholder="••••••••"
                              value={confirmAdminPassInput}
                              onChange={(e) => setConfirmAdminPassInput(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-mono"
                              required
                            />
                          </div>

                          <div className="pt-2">
                            <button 
                              type="submit"
                              disabled={isUpdatingCredentials}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 text-xs rounded-xl shadow-lg shadow-red-600/10 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                            >
                              {isUpdatingCredentials ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  Save Info (লগইন তথ্য সংরক্ষণ)
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Right side column: biography & profile customization */}
                      <div className="lg:col-span-7 bg-white border border-slate-100/50 rounded-2xl p-4 sm:p-6 space-y-6">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase font-sans flex items-center gap-2">
                            <User className="h-4 w-4 text-red-600" />
                            আমার পরিচিতি ও বায়ো সেটিংস (Bio Settings)
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 font-bengali">
                            আপনার About Me পেজের ছবি এবং মূল ডেসক্রিপশন পরিবর্তন করার জন্য ফিলাপ করুন। এটি সেভ করার সাথে সাথে লাইভ আপডেট হয়ে যাবে।
                          </p>
                        </div>

                        <form onSubmit={handleUpdateAboutMe} className="space-y-4 font-sans text-xs">
                          {/* Profile Photo selector */}
                          <div className="bg-slate-50 border border-slate-100/80 p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-slate-200 flex items-center justify-center">
                              {isCompressingImage ? (
                                <RefreshCw className="h-5 w-5 text-red-600 animate-spin" />
                              ) : (
                                <img src={aboutMeInput.profileImg} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2 w-full text-left">
                              <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500">Profile Picture (ছবি আপলোড করুন)</span>
                              <div className="flex flex-col sm:flex-row gap-2">
                                {/* Native file upload */}
                                <label className="bg-red-50 hover:bg-red-101 border border-red-200 text-red-600 font-bold px-3 py-1.5 rounded-lg text-center cursor-pointer transition-all flex items-center gap-1.5 justify-center max-w-[170px] shrink-0 text-[11px]">
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>ছবি আপলোড করুন</span>
                                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                                
                                {/* Direct text input for web URLs */}
                                <input 
                                  type="text"
                                  placeholder="অথবা সরাসরি ছবির URL দিন"
                                  className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg p-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 transition-all text-[11px]"
                                  value={aboutMeInput.profileImg}
                                  onChange={(e) => setAboutMeInput({ ...aboutMeInput, profileImg: e.target.value })}
                                />
                              </div>
                              <span className="text-[9px] text-slate-400 block font-sans">সর্বোচ্চ সীমা ৮০০ কেবি। png/jpg ছবি সমর্থন করে।</span>
                            </div>
                          </div>

                          {/* Name and Professional Role */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                                Full Name (নাম)
                              </label>
                              <input 
                                type="text"
                                value={aboutMeInput.name}
                                onChange={(e) => setAboutMeInput({ ...aboutMeInput, name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-bengali font-semibold"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                                Professional Role (পদবি)
                              </label>
                              <input 
                                type="text"
                                value={aboutMeInput.role}
                                onChange={(e) => setAboutMeInput({ ...aboutMeInput, role: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-sans font-semibold"
                                required
                              />
                            </div>
                          </div>

                          {/* Custom Title Card */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                              Headline Title (শিরোনাম)
                            </label>
                            <input 
                              type="text"
                              value={aboutMeInput.title}
                              onChange={(e) => setAboutMeInput({ ...aboutMeInput, title: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-bengali"
                              required
                            />
                          </div>

                          {/* Bio Intro Description text */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                              Bio Introduction (পরিচিতি সূচনা)
                            </label>
                            <textarea 
                              rows={2}
                              value={aboutMeInput.bioIntro}
                              onChange={(e) => setAboutMeInput({ ...aboutMeInput, bioIntro: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-bengali leading-relaxed text-left"
                              required
                            />
                          </div>

                          {/* Bio Body description */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                              Bio Main Body (মূল পরিচিতি বিবরণ)
                            </label>
                            <textarea 
                              rows={3}
                              value={aboutMeInput.bioBody}
                              onChange={(e) => setAboutMeInput({ ...aboutMeInput, bioBody: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-bengali leading-relaxed text-left"
                              required
                            />
                          </div>

                          {/* Skill Customizers */}
                          <div className="space-y-3 pt-2">
                            <span className="block text-[10px] font-mono uppercase tracking-wider text-purple-600 font-extrabold">প্রধান দক্ষতার বিবরণ সংশোধন করুন:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] text-slate-500 mb-1 font-sans">1. SEO Expert Text</label>
                                <input 
                                  type="text"
                                  value={aboutMeInput.seoText}
                                  onChange={(e) => setAboutMeInput({ ...aboutMeInput, seoText: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-800 focus:outline-none focus:border-red-500 font-bengali"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-[9px] text-slate-500 mb-1 font-sans">2. SMM Master Text</label>
                                <input 
                                  type="text"
                                  value={aboutMeInput.smmText}
                                  onChange={(e) => setAboutMeInput({ ...aboutMeInput, smmText: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-800 focus:outline-none focus:border-red-500 font-bengali"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] text-slate-500 mb-1 font-sans">3. Content Marketing Text</label>
                                <input 
                                  type="text"
                                  value={aboutMeInput.contentMarketingText}
                                  onChange={(e) => setAboutMeInput({ ...aboutMeInput, contentMarketingText: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-800 focus:outline-none focus:border-red-500 font-bengali"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] text-slate-500 mb-1 font-sans">4. Paid Ads Text</label>
                                <input 
                                  type="text"
                                  value={aboutMeInput.paidAdsText}
                                  onChange={(e) => setAboutMeInput({ ...aboutMeInput, paidAdsText: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-800 focus:outline-none focus:border-red-500 font-bengali"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Extra reasons / Value points customization */}
                          <div className="space-y-3 pt-2">
                            <span className="block text-[10px] font-mono uppercase tracking-wider text-purple-600 font-extrabold">কেন আমার সাথে কাজ করবেন? বিবরণ সংশোধন করুন:</span>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[9px] text-slate-500 mb-1 font-sans">1. টার্গেটেড অডিয়েন্স রিসার্চ</label>
                                <input 
                                  type="text"
                                  value={aboutMeInput.whyAudienceResearch}
                                  onChange={(e) => setAboutMeInput({ ...aboutMeInput, whyAudienceResearch: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-800 focus:outline-none focus:border-red-500 font-bengali"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-[9px] text-slate-500 mb-1 font-sans">2. কস্ট-ইফেক্টিভ সলিউশন</label>
                                <input 
                                  type="text"
                                  value={aboutMeInput.whyCostEffective}
                                  onChange={(e) => setAboutMeInput({ ...aboutMeInput, whyCostEffective: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-800 focus:outline-none focus:border-red-500 font-bengali"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] text-slate-500 mb-1 font-sans">3. গ্লোবাল রিচ</label>
                                <input 
                                  type="text"
                                  value={aboutMeInput.whyGlobalReach}
                                  onChange={(e) => setAboutMeInput({ ...aboutMeInput, whyGlobalReach: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-800 focus:outline-none focus:border-red-500 font-bengali"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Footer quote customizer */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                              Footer Quote Banner (শেষ বাণী / উক্তি)
                            </label>
                            <textarea 
                              rows={3}
                              value={aboutMeInput.footerQuote}
                              onChange={(e) => setAboutMeInput({ ...aboutMeInput, footerQuote: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-bengali leading-relaxed text-left"
                              required
                            />
                          </div>

                          {/* Submission Button */}
                          <div className="pt-2">
                            <button 
                              type="submit"
                              disabled={isUpdatingAboutMe}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 text-xs rounded-xl shadow-lg shadow-red-600/10 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                            >
                              {isUpdatingAboutMe ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  Saving Profile...
                                </>
                              ) : (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  Save Profile (প্রোফাইল সংরক্ষণ করুন)
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO INTRO BLOCK (AESTHETIC DESIGNS MINIMAL WHITE BACKGROUND) */}
        <div className="lg:col-span-12 text-center py-12 md:py-20 max-w-4xl mx-auto space-y-6 relative">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-purple-100 shadow-sm text-xs font-bold text-red-600"
          >
            <Sparkles className="h-3.5 w-3.5 text-red-500" />
            <span>Digital reach redefined in minimalist performance</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight font-bengali"
          >
            ডিজিটাল মার্কেটিং সলিউশন <br />
            <span className="bg-gradient-to-r from-red-600 via-purple-400 to-red-500 bg-clip-text text-transparent font-sans">
              Organic Reach & High ROI Performance
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-md sm:text-lg text-slate-600 max-w-2xl mx-auto font-sans leading-relaxed"
          >
            তথ্যবহুল স্ট্র্যাটেজি নিয়ে আপনার ব্যবসাকে টার্গেটেড অডিয়েন্স অব্দি পৌঁছে দেওয়ার জন্য নাবিল ফ্রি-ল্যান্সার এজেন্সি সবসময় পাশে রয়েছে। সার্চ র্যাংক, সোশ্যাল লিড এবং ইমেইল অটোমেশন বুস্টআপ করুন আজই।
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-4"
          >
            <a 
              href="#help-center" 
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3.5 text-xs rounded-xl shadow-lg shadow-red-600/10 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-1.5"
            >
              <MessageSquare className="h-4 w-4" />
              লাইভ হেল্প সেন্টার চ্যাট
            </a>
            
            <a 
              href="#channel-hub" 
              className="bg-white border border-slate-200 text-slate-700 hover:border-red-300 font-extrabold px-6 py-3.5 text-xs rounded-xl hover:text-red-600 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-1"
            >
              <span>Explore Marketing Blueprint</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </motion.div>
        </div>


        {/* LEFT COMPONENT: 7-columns wide Digital Marketing Channel Masterclass + Announcements */}
        <div className="lg:col-span-7 space-y-8 flex flex-col">
          
          {/* Categorized notes/Updates live bullets */}
          <section id="announcements" className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/30 rounded-bl-full pointer-events-none" />

            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100/50 text-red-600 flex items-center justify-center">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md sm:text-lg font-bold text-slate-950 font-bengali leading-none">লাইভ মার্কেটিং গাইডবুক ও নোটিশ</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Real-time categorized updates by Nabil</p>
                </div>
              </div>

              {/* Notice Search box */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="টিপস বা নোটিশ সার্চ করুন..."
                  className="bg-slate-50 border border-slate-100 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 w-full sm:w-48 transition-all"
                />
              </div>
            </div>

            {/* Category Selectors / Filters tabs */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {filterCategories.map(catItem => {
                const active = activeCategoryFilter === catItem.value;
                return (
                  <button
                    key={catItem.value}
                    onClick={() => {
                      setActiveCategoryFilter(catItem.value);
                      showToast(`ফিল্টার: "${catItem.label}" ক্যাটাগরি নিষ্কাশন করা হয়েছে।`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition-all border cursor-pointer font-bengali ${
                      active 
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {catItem.label}
                  </button>
                );
              })}
            </div>

            {/* Scrolling grid list of published tips */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {filteredNotes.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs font-bengali"
                  >
                    এই ক্যাটাগরিতে বা সার্চ কিওয়ার্ড অনুযায়ী কোনো আপডেট পাওয়া যায়নি।
                  </motion.div>
                ) : (
                  filteredNotes.map((note) => (
                    <motion.div
                      layout
                      key={note.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-red-100 transition-all shadow-xs relative group flex flex-col justify-between"
                    >
                      {/* Delete absolute button for admins */}
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteNote(note.id)}
                          className="absolute top-4 right-4 bg-red-50 hover:bg-red-100 border border-red-100 p-1.5 text-red-500 rounded-xl active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-wider">
                          <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-red-600 border border-purple-100 font-bengali">
                            {getCategoryLabel(note.category)}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1 font-mono text-[9.5px]">
                            <Clock className="h-3 w-3" /> {note.date || 'Update'}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-bengali pr-8 whitespace-pre-line font-medium">
                          {note.content}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Interactive Channel Details */}
          <section id="channel-hub" className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="pb-4 mb-6 border-b border-slate-100">
              <h3 className="text-md sm:text-lg font-bold text-slate-950 font-bengali">ডিজিটাল মিডিয়া ও প্রধান মাধ্যমসমূহ</h3>
              <p className="text-xs text-slate-500">চ্যানেল সিলেক্ট করে সেরা টুলস ও সফটওয়্যার এবং কৌশলগুলো দেখুন</p>
            </div>

            {/* Quick selectors grids */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {channels.map((chan) => {
                const IconComp = chan.icon;
                const isActive = activeChannelId === chan.id;
                return (
                  <button 
                    key={chan.id}
                    onClick={() => {
                      setActiveChannelId(chan.id);
                      showToast(`মিডিয়া: ${chan.titleEn} ভিউ করা হয়েছে`);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/10'
                        : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    <IconComp className={`h-5 w-5 mb-1 ${isActive ? 'text-white' : 'text-red-500'}`} />
                    <span className="text-[11px] font-bold font-bengali leading-none">{chan.titleBn}</span>
                  </button>
                );
              })}
            </div>

            {/* Details render panel */}
            <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl">
              {(() => {
                const currentChan = channels.find(c => c.id === activeChannelId);
                if (!currentChan) return null;
                const ChanIcon = currentChan.icon;
                return (
                  <div className="space-y-4 font-sans">
                    <div className="flex items-center justify-between gap-2 border-b border-white pb-3">
                      <div className="flex items-center gap-2">
                        <ChanIcon className="h-5 w-5 text-red-500" />
                        <h4 className="font-extrabold text-[#111827] text-sm md:text-md font-bengali leading-none">{currentChan.titleBn}</h4>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-white border border-slate-200 text-red-600 px-2 py-0.5 rounded-md font-bold">
                        {currentChan.titleEn}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bengali font-normal">
                      {currentChan.desc}
                    </p>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-extrabold block mb-1.5">
                        Industry Best software used:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {currentChan.tools.map((t, idx) => (
                          <span key={idx} className="bg-white border text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold hover:border-red-300 transition-colors">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

        </div>


        {/* RIGHT COMPONENT: 5-columns wide Chat-Style LIVE Response Help Desk */}
        <div className="lg:col-span-5 space-y-8 flex flex-col">
          
          {/* Live Help Center System Chatbox */}
          <section id="help-center" className="scroll-mt-24">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm relative flex flex-col h-[520px]"
            >
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center animate-pulse">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-md sm:text-lg font-bold text-slate-990 font-bengali leading-none">লাইভ চ্যাট হেল্প সেন্টার</h3>
                    <p className="text-[10px] text-red-500 font-mono font-black uppercase mt-1 tracking-wider">Direct Live Connection</p>
                  </div>
                </div>

                {chatUser && (
                  <button 
                    onClick={handleExitChat}
                    className="text-[9.5px] uppercase font-mono font-bold text-red-500 hover:bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg transition-all"
                    title="Change user name or exit chating session"
                  >
                    Change Name
                  </button>
                )}
              </div>

              {/* Chat workflow screen conditionally rendered */}
              {!chatUser ? (
                /* STEP 1: Client sets up username by typing and hitting ENTER */
                <div className="flex-1 flex flex-col justify-center items-center text-center p-4 space-y-4">
                  <div className="p-4 rounded-full bg-purple-50 text-red-500 mb-1 border border-purple-100">
                    <User className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 font-bengali">লাইভ চ্যাট শুরু করতে আপনার নাম লিখুন</h4>
                    <p className="text-xs text-slate-500">আপনার নাম দিয়ে এন্টার প্রেস করে সরাসরি চ্যাট রুমে প্রবেশ করুন</p>
                  </div>

                  <form onSubmit={handleRegisterChatUser} className="w-full max-w-xs space-y-2">
                    <input 
                      type="text" 
                      placeholder="যেমন: আরিফ আহমেদ"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRegisterChatUser(e);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-center text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-purple-200 transition-all font-bengali"
                      maxLength={25}
                      required
                    />
                    <button 
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl hover:shadow-lg active:scale-95 transition-all text-xs font-bengali"
                    >
                      চ্যাট শুরু করুন &rarr;
                    </button>
                  </form>
                </div>
              ) : (
                /* STEP 2: Live interactive messaging workflow */
                <div className="flex-1 flex flex-col h-full min-h-0 justify-between">
                  
                  {/* Status Indicator Bar */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl mb-3 text-[10px] font-mono border text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      SYSTEM STATUS: ONLINE
                    </span>
                    <span>Chatting as: <strong className="text-red-600 uppercase underline">{chatUser}</strong></span>
                  </div>

                  {/* Message scroll log container */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin scrollbar-thumb-red-205 scrollbar-track-transparent">
                    
                    {/* Hello greeting from Nabil */}
                    <div className="flex justify-start">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 max-w-[85%] font-bengali text-xs space-y-1 relative shadow-xs">
                        <div className="flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase text-red-600">
                          <Award className="h-3 w-3" />
                          <span>নাবিল আহমেদ (Admin Support)</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-normal">
                          আসসালামু আলাইকুম! ডিজিটাল মার্কেটিং সংক্রান্ত যেকোনো প্রশ্নের সরাসরি উত্তর পেতে নিচে প্রশ্নটি লিখুন এবং এন্টার প্রেস করুন। আমি দ্রুত উত্তর দেওয়ার চেষ্টা করবো।
                        </p>
                      </div>
                    </div>

                    {/* Messages stream fetched real-time */}
                    {(() => {
                      const clientMsgs = messages.filter(m => m.senderName.toLowerCase() === chatUser.toLowerCase());
                      if (clientMsgs.length === 0) {
                        return (
                          <div className="text-center py-10 font-bengali text-slate-400 text-xs italic">
                            নিচে বক্সে আপনার প্রথম টেক্সট বা প্রশ্নটি টাইপ করে পাঠান।
                          </div>
                        );
                      }
                      
                      return clientMsgs.map((msg) => (
                        <div key={msg.id} className="space-y-1.5">
                          {/* Visitor user custom text bubble */}
                          <div className="flex justify-end">
                            <div className="bg-[#f5f3ff] text-[#991b1b] rounded-2xl p-3 max-w-[85%] text-xs shadow-xs text-right border border-[#e9d5ff]">
                              <p className="font-bengali leading-relaxed text-left font-medium">
                                {msg.messageText}
                              </p>
                              <span className="text-[8px] text-red-600 font-mono mt-1 block">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          {/* Admin Response message bubble */}
                          {msg.replyText ? (
                            <div className="flex justify-start">
                              <div className="bg-gradient-to-tr from-[#fff1f2] to-white border border-[#fecaca] text-[#991b1b] rounded-2xl p-3.5 max-w-[85%] text-xs space-y-1 shadow-sm">
                                <div className="flex items-center gap-1.5 text-[9.5px] font-mono font-black uppercase text-[#dc2626]">
                                  <Sparkles className="h-3 w-3 text-amber-500 animate-spin" />
                                  <span>NABIL RESPONSE</span>
                                </div>
                                <p className="font-bengali leading-relaxed text-slate-800 font-medium">
                                  {msg.replyText}
                                </p>
                                <span className="text-[8px] text-slate-400 font-mono block text-right mt-1">
                                  Replied at: {msg.repliedAt || 'Recently'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-start">
                              <div className="flex items-center gap-1 text-[9px] text-[#d97706] font-mono px-3 py-1 bg-[#fef3c7] rounded-full border border-[#fde68a] animate-pulse">
                                <Clock className="h-3.5 w-3.5" />
                                <span>অপেক্ষা করুন, নাবিল জবাব দেওয়ার চেষ্টা করছে...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Interactive typing input footer block with Enter Listener */}
                  <form onSubmit={handleSendLiveMessage} className="mt-3 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="এখানে প্রশ্ন টাইপ করুন এবং এন্টার চাপুন..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendLiveMessage(e);
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-purple-200 transition-all font-bengali"
                      maxLength={180}
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={isSendingMsg || !chatMessage.trim()}
                      className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-red-600/10"
                    >
                      <Send className="h-4.5 w-4.5" />
                    </button>
                  </form>

                </div>
              )}

            </motion.div>
          </section>

          {/* Quick Core Benefits widget */}
          <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm font-sans space-y-4">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-wider uppercase flex items-center gap-2">
              <Lightbulb className="h-4.5 w-4.5 text-red-500" />
              <span>কেন ডিজিটাল মার্কেটিং ফানেল দরকার?</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-600 font-bengali leading-relaxed font-normal">
              <p>
                আপনার অফলাইন ব্যবসাকে বিশ্বজোড়ে ডিজিটাল করার মাধ্যমে নিখুঁত রিয়েল-টাইম ট্র্যাকিং সম্ভব যা গ্রাহকদের সঠিক অডিয়েন্স ইন্টেল দিতে সক্ষম এবং খরচ কমাতে দারুণ পারদর্শী:
              </p>
              <div className="space-y-1.5 pl-1">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 bg-purple-50 border border-purple-100/60 text-red-600 p-0.5 rounded-md shrink-0 mt-0.5" />
                  <span>টার্গেটিং কাস্টমারদের কাছে ইনস্ট্যান্ট সরাসরি পৌঁছানো সম্ভব।</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 bg-purple-50 border border-purple-100/60 text-red-600 p-0.5 rounded-md shrink-0 mt-0.5" />
                  <span>গুগল অনুসন্ধানের সেরা কিওয়ার্ড ব্যবহারের মাধ্যমে র্যাঙ্ক বুস্ট।</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 bg-purple-50 border border-purple-100/60 text-red-600 p-0.5 rounded-md shrink-0 mt-0.5" />
                  <span>ক্রেতাদের মনের ভয়ভীতি দূরীকরণে পারফেক্ট লাইভ কনভার্শন ফানেল।</span>
                </div>
              </div>
            </div>
          </section>

        </div>

      </main>

      {/* Aesthetic minimalist white theme footer */}
      <footer id="main-footer" className="mt-16 border-t border-slate-100 bg-white py-12 relative z-10 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <p className="text-[10px] tracking-widest uppercase font-mono text-slate-400 font-black">
            Nabil Freelancer Agency &trade; | Digital Reach Redefined
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-slate-500 text-xs font-semibold">
            <span>🚀 Freelancing Masterclass</span>
            <span className="text-slate-300">•</span>
            <span>📈 Meta Pixel Retargeting</span>
            <span className="text-slate-300">•</span>
            <span>🎓 High ROI Content Strategy</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            &copy; 2026 Nabil Freelancer. All Rights Reserved. Clean aesthetic White-Purple design.
          </p>
        </div>
      </footer>

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import {
Heart, AlertCircle, Users, MessageCircle, ThumbsUp,
Check, ArrowRight, Lightbulb, Target, Clock,
CheckCircle, Star, Flame, Home, PlusCircle, User,
Bell, Send, Lock, Filter, Mic, PlayCircle,
ChevronRight, Plus, MoreHorizontal, Share2, Bookmark,
Calendar, TrendingUp, Eye, ArrowDown, X, ChevronDown,
Copy, Flag, Edit, Trash2, ExternalLink, Repeat2
} from 'lucide-react';
import CommunityStories from './Communitystories';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import mixpanelService from 'src/services/servicesmixpanel'; // Adjust path based on your structure
import FirebaseService from './friendsService';
import { auth } from './firebaseConfig';

import { initializeNewUser } from './initializeUser';
import {  push, runTransaction } from 'firebase/database';
import { serverTimestamp } from 'firebase/firestore';
import seedSampleData from './seedData';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { 
  getDocs,
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  addDoc,
  doc,
  updateDoc,
  increment,

} from 'firebase/firestore';
import CreatePostModal from "./createpost"
import FeelingOnboarding from './FeelingOnboarding';
// Tour imports
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
const Optimizedsupport = () => {


const [onboardingPreferences, setOnboardingPreferences] = useState(null);

const [showOnboarding, setShowOnboarding] = useState(true);
const [selectedFeeling, setSelectedFeeling] = useState(null);
const [selectedPostTypes, setSelectedPostTypes] = useState([]);
const [posts, setPosts] = useState([]);
// Firebase state
const [firebaseConnected, setFirebaseConnected] = useState(false);

const [userActivities, setUserActivities] = useState([]);
const [allUserActivities, setAllUserActivities] = useState([]);

// UI state
const [showSolutionInput, setShowSolutionInput] = useState({});
const [showCommentInput, setShowCommentInput] = useState({});
const [commentText, setCommentText] = useState({});
const [expandedComments, setExpandedComments] = useState({});
const [expandedSolutions, setExpandedSolutions] = useState({});
const [showShareMenu, setShowShareMenu] = useState({});
const [showMoreMenu, setShowMoreMenu] = useState({});
const [reactionAnimations, setReactionAnimations] = useState({});
const [activeTab, setActiveTab] = useState('all');
const [showPartnerModal, setShowPartnerModal] = useState(false);
const [showMentorModal, setShowMentorModal] = useState(false);
const [userPartners, setUserPartners] = useState([]);
const [userMentors, setUserMentors] = useState([]);
const [potentialMatches, setPotentialMatches] = useState([]);
const [showFullPost, setShowFullPost] = useState({});

const [showCreatePostModal, setShowCreatePostModal] = useState(false);

// Tour state - INLINE TOUR SYSTEM
const [tourActive, setTourActive] = useState(false);
const [tourCompleted, setTourCompleted] = useState(
  localStorage.getItem('community_tour_completed') === 'true'
);
const driverObjRef = useRef(null);

// Tour state
const [tourButtonMounted, setTourButtonMounted] = useState(null);
const tourStartedRef = useRef(false);


const [currentUser, setCurrentUser] = useState(null);
const [userProfile, setUserProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const navigate = useNavigate();

// Firebase initialization


useEffect(() => {
  const initFirebase = async () => {
    try {
      const db = getFirestore();
      const postsRef = collection(db, 'groups', 'socialAvoidance', 'posts');
      const q = query(postsRef, orderBy('timestamp', 'desc'));
      
      // Real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = [];
        snapshot.forEach((doc) => {
          postsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log('📊 Posts loaded:', postsData.length);
        setPosts(postsData);
        setFirebaseConnected(true);
      }, (error) => {
        console.error('❌ Error loading posts:', error);
        setFirebaseConnected(false);
      });
      
      // Cleanup listener on unmount
      return () => unsubscribe();
      
    } catch (error) {
      console.error('Firebase connection failed:', error);
      setFirebaseConnected(false);
    }
  };

  initFirebase();
}, []);

// Interactive Onboarding Tour - WAITS FOR POSTS




useEffect(() => {
  if (!currentUser) return;

  const db = getFirestore();
  
  // Fetch current user's activities
  const userActivitiesRef = collection(db, 'users', currentUser.uid, 'activities');
  const userQuery = query(userActivitiesRef, orderBy('createdAt', 'desc'));
  
  const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      userId: currentUser.uid,
      userName: currentUser.displayName || 'Anonymous',
      userPhoto: currentUser.photoURL || '👤',
      ...doc.data()
    }));
    setUserActivities(activities);
  });

  // Fetch ALL users' activities from ANY user who has an activities subcollection
  // Fetch ALL users' activities from ANY user who has an activities subcollection
const fetchAllActivities = async () => {
  try {
    console.log('🔍 Starting to fetch all community activities...');
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log('👥 Total users found:', usersSnapshot.size);
    
    const allActivities = [];
    
    // Use Promise.all to fetch all activities in parallel
    const activitiesPromises = usersSnapshot.docs.map(async (userDoc) => {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`👤 Checking user: ${userId}`, userData);
      
      try {
        const activitiesRef = collection(db, 'users', userId, 'activities');
        const activitiesSnapshot = await getDocs(activitiesRef);
        
        console.log(`  📋 Activities found for ${userId}:`, activitiesSnapshot.size);
        
        // Only process if user has activities
        if (!activitiesSnapshot.empty) {
          activitiesSnapshot.forEach(activityDoc => {
            const activityData = activityDoc.data();
            console.log(`    ✅ Activity:`, activityData);
            
            allActivities.push({
              id: activityDoc.id,
              userId: userId,
              userName: userData.displayName || userData.name || 'Anonymous',
              userPhoto: userData.photoURL || userData.photo || '👤',
              ...activityData
            });
          });
        }
      } catch (error) {
        // Silently skip users who don't have activities subcollection
        console.log(`  ⚠️ No activities subcollection for user ${userId}`, error.message);
      }
    });
    
    await Promise.all(activitiesPromises);
    
    console.log('📦 Total activities collected:', allActivities.length);
    console.log('📦 Activities array:', allActivities);
    
    // Sort by scheduled date (most recent first)
    allActivities.sort((a, b) => {
      const dateA = a.scheduledDate || a.createdAt || 0;
      const dateB = b.scheduledDate || b.createdAt || 0;
      return dateB - dateA;
    });
    
    console.log('✅ Fetched activities from all users:', allActivities.length);
    setAllUserActivities(allActivities);
    
  } catch (error) {
    console.error('❌ Error fetching community activities:', error);
  }
};


  // Initial fetch
  fetchAllActivities();
  
  // Set up interval to refresh every 30 seconds
  const intervalId = setInterval(fetchAllActivities, 30000);

  return () => {
    unsubscribeUser();
    clearInterval(intervalId);
  };
}, [currentUser]);

// Signal mentor that connections section has loaded
// Signal parent that component has loaded
// In Optimizedsupport.tsx, around line 230

useEffect(() => {
  console.log('✅ OptimizedSupport mounted');
  
  // ✅ Dispatch signal immediately when component mounts
  setTimeout(() => {
    window.dispatchEvent(new Event('COMMUNITY_VIEWED'));
    console.log('✅ COMMUNITY_VIEWED signal dispatched');
  }, 500); // Small delay to ensure DOM is ready
  
}, []);

// Auto-show tour prompt for new users after 15 seconds
useEffect(() => {
  if (!tourCompleted && !tourActive) {
    const timer = setTimeout(() => {
      // Show a gentle reminder about the tour
      const tourButton = document.querySelector('[data-tour-trigger="true"]');
      if (tourButton) {
        tourButton.classList.add('ring-4', 'ring-purple-400', 'ring-offset-2', 'ring-offset-slate-900');
        setTimeout(() => {
          tourButton.classList.remove('ring-4', 'ring-purple-400', 'ring-offset-2', 'ring-offset-slate-900');
        }, 3000);
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }
}, [tourCompleted, tourActive]);


// ═══════════════════════════════════════════════════════════════
// 🎯 INLINE TOUR SYSTEM - Beautiful Interactive Walkthrough
// ═══════════════════════════════════════════════════════════════

const startInteractiveTour = () => {
  // Create driver instance with beautiful styling
  const driverObj = driver({
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    progressText: 'Step {{current}} of {{total}}',
    nextBtnText: 'Next →',
    prevBtnText: '← Previous',
    doneBtnText: '✓ Finish Tour',
    
    onDestroyed: () => {
      setTourActive(false);
      
      // Check if tour was completed (not just closed early)
      const currentStep = driverObj.getActiveIndex();
      const totalSteps = driverObj.getConfig().steps.length;
      
      if (currentStep === totalSteps - 1 || currentStep >= totalSteps - 1) {
        // Tour completed! Show celebration
        localStorage.setItem('community_tour_completed', 'true');
        setTourCompleted(true);
        
        // Show success message
        setTimeout(() => {
          const celebrationDiv = document.createElement('div');
          celebrationDiv.innerHTML = `
            <div style="
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: linear-gradient(135deg, rgba(88, 28, 135, 0.98) 0%, rgba(91, 33, 182, 0.98) 100%);
              padding: 32px;
              border-radius: 24px;
              box-shadow: 0 20px 60px rgba(168, 85, 247, 0.6);
              z-index: 999999;
              text-align: center;
              border: 2px solid rgba(168, 85, 247, 0.5);
              backdrop-filter: blur(10px);
              animation: scaleIn 0.3s ease-out;
            ">
              <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
              <h3 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                Tour Complete!
              </h3>
              <p style="color: #e9d5ff; font-size: 16px; margin-bottom: 0;">
                You're ready to engage with the community!
              </p>
            </div>
          `;
          
          const style = document.createElement('style');
          style.textContent = `
            @keyframes scaleIn {
              from {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0;
              }
              to {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
            }
          `;
          document.head.appendChild(style);
          document.body.appendChild(celebrationDiv);
          
          setTimeout(() => {
            celebrationDiv.style.transition = 'all 0.3s ease-out';
            celebrationDiv.style.opacity = '0';
            celebrationDiv.style.transform = 'translate(-50%, -50%) scale(0.9)';
            setTimeout(() => {
              document.body.removeChild(celebrationDiv);
              document.head.removeChild(style);
            }, 300);
          }, 2500);
        }, 300);
      }
    },
    
    steps: [
      // 1. Welcome
      {
        element: '[data-tour="community-header"]',
        popover: {
          title: '👋 Welcome to Social Avoidance Community!',
          description: 'Let\'s take a quick tour to help you make the most of this supportive space. You\'ll learn how to share experiences, connect with others, and find solutions together.',
          side: 'bottom',
          align: 'start'
        }
      },
      
      // 2. Filter Tabs
      {
        element: '[data-tour="filter-tabs"]',
        popover: {
          title: '🎯 Filter Your Feed',
          description: 'Use these tabs to focus on specific types of content: All posts, Activities, Support requests, Solutions, Journeys, and Challenges.',
          side: 'bottom',
          align: 'start'
        }
      },
      
      // 3. All Posts Tab
      {
        element: '[data-tour="all-posts-tab"]',
        popover: {
          title: '📋 All Posts',
          description: 'See everything happening in the community - from personal stories to solutions and challenges.',
          side: 'bottom',
          align: 'start'
        }
      },
      
      // 4. Create Post
      {
        element: '[data-tour="create-post-btn"]',
        popover: {
          title: '✍️ Share Your Story',
          description: 'Click here to create a new post! Share your experiences, ask for support, or start a challenge.',
          side: 'left',
          align: 'start'
        }
      },
      
      // 5. Feed
      {
        element: '[data-tour="feed"]',
        popover: {
          title: '📰 Community Feed',
          description: 'This is where you\'ll see all community posts. Scroll through to discover stories, solutions, and support from others on similar journeys.',
          side: 'top',
          align: 'start'
        }
      },
      
      // 6. Relate Button
      {
        element: '[data-tour="relate-button"]',
        popover: {
          title: '💜 Relate to Posts',
          description: 'Click "I relate" when you connect with someone\'s experience. It\'s a powerful way to show solidarity and let others know they\'re not alone.',
          side: 'left',
          align: 'start'
        }
      },
      
      // 7. Bookmark
      {
        element: '[data-tour="bookmark-button"]',
        popover: {
          title: '🔖 Save for Later',
          description: 'Bookmark posts that resonate with you or contain helpful information you want to revisit.',
          side: 'left',
          align: 'start'
        }
      },
      
      // 8. Expand Post
      {
        element: '[data-tour="expand-post"]',
        popover: {
          title: '📖 Read Full Stories',
          description: 'Click "Read more" to see the complete post and dive deeper into someone\'s experience.',
          side: 'top',
          align: 'start'
        }
      },
      
      // 9. Add Solution
      {
        element: '[data-tour="add-solution"]',
        popover: {
          title: '💡 Share Solutions',
          description: 'Found something that worked for you? Share your solutions to help others facing similar challenges.',
          side: 'left',
          align: 'start'
        }
      },
      
      // 10. Add Comment
      {
        element: '[data-tour="add-comment"]',
        popover: {
          title: '💬 Join Conversations',
          description: 'Comment to offer support, ask questions, or share your thoughts. Every voice matters here.',
          side: 'left',
          align: 'start'
        }
      },
      
      // 11. Cheer Button
      {
        element: '[data-tour="cheer-button"]',
        popover: {
          title: '🎉 Cheer on Progress',
          description: 'Celebrate milestones and victories! Your encouragement can make someone\'s day.',
          side: 'left',
          align: 'start'
        }
      },
      
      // 12. Send Support
      {
        element: '[data-tour="send-support-button"]',
        popover: {
          title: '🤝 Send Personal Support',
          description: 'Reach out directly to offer encouragement or connect one-on-one.',
          side: 'left',
          align: 'start'
        }
      },
      
      // 13. Partners Tab
      {
        element: '[data-tour="partners-tab"]',
        popover: {
          title: '👥 Find Accountability Partners',
          description: 'Connect with others for mutual support and accountability on your journey.',
          side: 'bottom',
          align: 'start'
        }
      },
      
      // 14. Challenges Tab
      {
        element: '[data-tour="challenges-tab"]',
        popover: {
          title: '🏆 Take on Challenges',
          description: 'Join community challenges to push your boundaries and grow together.',
          side: 'bottom',
          align: 'start'
        }
      },
      
      // 15. Final Step
      {
        element: '[data-tour="community-header"]',
        popover: {
          title: '🌟 You\'re All Set!',
          description: 'You now know how to navigate and engage with the community. Remember: every interaction, no matter how small, contributes to this supportive space. Start exploring!',
          side: 'bottom',
          align: 'start'
        }
      }
    ]
  });
  
  driverObjRef.current = driverObj;
  setTourActive(true);
  driverObj.drive();
};

const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    // Check if element already exists
    const element = document.querySelector(selector);
    if (element) {
      console.log('✅ Element found immediately:', selector);
      resolve(element);
      return;
    }

    // Set up observer to watch for element
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        console.log('✅ Element found:', selector);
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element not found after ${timeout}ms: ${selector}`));
    }, timeout);
  });
};



const handleReaction = async (postId, reactionType) => {
  const key = `${postId}-${reactionType}`;
  setReactionAnimations({ ...reactionAnimations, [key]: true });
  setTimeout(() => {
    setReactionAnimations(prev => ({ ...prev, [key]: false }));
  }, 600);

  const db = getFirestore();
  const postRef = doc(db, 'groups', 'socialAvoidance', 'posts', postId);
  
  await updateDoc(postRef, {
    [`reactions.${reactionType}`]: increment(1)
  });
};


const handleAddComment = async (postId, text) => {
  const db = getFirestore();
  const commentsRef = collection(db, 'groups', 'socialAvoidance', 'posts', postId, 'comments');
  
  await addDoc(commentsRef, {
    text,
    author: '👤',
    authorUid: currentUser?.uid || 'anonymous',
    timestamp: serverTimestamp(),
    likes: 0,
    timeAgo: 'just now'
  });

  setShowCommentInput({ ...showCommentInput, [postId]: false });
  setCommentText({ ...commentText, [postId]: '' });
};

const handleAddSolution = async (postId, solution) => {
  const db = getDatabase();
  const solutionsRef = ref(db, `groups/socialAvoidance/posts/${postId}/solutions`);
  
  await push(solutionsRef, {
    text: solution,
    from: '👤',
    author: currentUser?.uid || 'anonymous',
    timestamp: serverTimestamp(),
    helped: 0,
    verified: false
  });

  setShowSolutionInput({ ...showSolutionInput, [postId]: false });
};

const handleCreatePost = async (postType, postData) => {
  const db = getFirestore();
  const postsRef = collection(db, 'groups', 'socialAvoidance', 'posts');
  
  await addDoc(postsRef, {
    type: postType,
    ...postData,
    author: {
      avatar: '👤',
      uid: currentUser?.uid || 'anonymous'
    },
    timestamp: serverTimestamp(),
    timeAgo: 'just now',
    reactions: {
      relate: 0,
      helped: 0,
      following: 0,
      comments: 0,
      cheering: 0,
      joined: 0,
      trying: 0
    },
    solutions: [],
    comments: [],
    participants: [],
    updates: []
  });
};

const handleOnboardingComplete = (preferences) => {
  setOnboardingPreferences(preferences);
  setShowOnboarding(false);
  
  // Optional: Save preferences to Firebase for the user
  if (preferences.feeling) {
    console.log('User feeling:', preferences.feeling);
  }
  if (preferences.postTypes) {
    console.log('User wants to see:', preferences.postTypes);
    setActiveTab(preferences.postTypes[0]); // Set first preference as active tab
  }
};



const filteredPosts = selectedPostTypes && selectedPostTypes.length > 0
  ? posts.filter(post => selectedPostTypes.includes(post.type))
  : posts;

// ============================================
// STRUGGLE → SOLUTION CARD
// ============================================



const POST_TEMPLATES = [
  {
    type: 'struggle-solution',
    icon: '🆘',
    title: 'Need Support',
    color: 'from-red-600 to-pink-600',
    description: 'Share a struggle you\'re facing and get community support',
    fields: [
      { name: 'struggle', label: 'What are you struggling with?', type: 'textarea', placeholder: 'Describe your situation...', required: true },
      { name: 'helpNeeded', label: 'What help do you need?', type: 'textarea', placeholder: 'Be specific about what would help...', required: true },
      { name: 'whatTried', label: 'What have you tried? (one per line)', type: 'textarea', placeholder: 'List things you\'ve already attempted...', required: false },
      { name: 'urgency', label: 'Urgency Level', type: 'select', options: ['low', 'medium', 'high'], required: true }
    ]
  },
  {
    type: 'journey-tracker',
    icon: '🛤️',
    title: 'Share Journey',
    color: 'from-purple-600 to-indigo-600',
    description: 'Document your progress and inspire others',
    fields: [
      { name: 'title', label: 'Journey Title', type: 'text', placeholder: 'Give your journey a name...', required: true },
      { name: 'before', label: 'Where you started', type: 'textarea', placeholder: 'How things were before...', required: true },
      { name: 'today', label: 'Where you are today', type: 'textarea', placeholder: 'Your current situation...', required: true },
      { name: 'goal', label: 'Where you\'re going', type: 'textarea', placeholder: 'Your goal or aspiration...', required: true },
      { name: 'timeline', label: 'Timeline', type: 'text', placeholder: 'e.g., 3 months, 1 year...', required: false }
    ]
  },
  {
    type: 'what-worked',
    icon: '💡',
    title: 'Share Solution',
    color: 'from-green-600 to-emerald-600',
    description: 'Share what worked for you to help others',
    fields: [
      { name: 'problem', label: 'What was the problem?', type: 'textarea', placeholder: 'Describe the challenge you faced...', required: true },
      { name: 'solution', label: 'What worked for you?', type: 'textarea', placeholder: 'Explain your solution in detail...', required: true },
      { name: 'impact', label: 'How did it help?', type: 'textarea', placeholder: 'What changed after you tried this?', required: true }
    ]
  },
  {
    type: 'micro-challenge',
    icon: '🎯',
    title: 'Create Challenge',
    color: 'from-cyan-600 to-blue-600',
    description: 'Start a challenge and invite others to join',
    fields: [
      { name: 'challenge', label: 'The Challenge', type: 'textarea', placeholder: 'What\'s the challenge?', required: true },
      { name: 'whyThisMatters', label: 'Why this matters', type: 'textarea', placeholder: 'Why should people do this?', required: true },
      { name: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 7 days, 30 days...', required: true },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['beginner', 'intermediate', 'advanced'], required: true }
    ]
  }
];


const StruggleSolutionCard = ({ post , postIndex }) => {
const urgencyStyles = {
high: 'border-red-500/50 bg-red-500/5',
medium: 'border-yellow-500/50 bg-yellow-500/5',
low: 'border-blue-500/50 bg-blue-500/5'
};

const [localReactions, setLocalReactions] = useState(post.reactions);
const [hasReacted, setHasReacted] = useState({});

return (
<div className={`rounded-2xl border-2 ${urgencyStyles[post.urgency]} backdrop-blur-sm p-4 md:p-6 space-y-4 relative`}>
{/* Header */}
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg md:text-xl flex-shrink-0">
{post.author.avatar}
</div>
<div className="min-w-0 flex-1">
<div className="flex items-center gap-2 flex-wrap">
<span className="text-white font-bold text-sm md:text-base">Anonymous</span>
{post.urgency === 'high' && (
<span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
URGENT
</span>
)}
</div>
<span className="text-purple-400 text-xs">{post.timeAgo}</span>
</div>
</div>
<div className="relative">
<button
onClick={() => setShowMoreMenu({ ...showMoreMenu, [post.id]: !showMoreMenu[post.id] })}
className="p-2 hover:bg-white/5 rounded-lg transition-all flex-shrink-0"
>
<MoreHorizontal className="w-5 h-5 text-purple-400" />
</button>

{/* More Menu Dropdown */}
{showMoreMenu[post.id] && (
<div className="absolute right-0 top-10 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl z-20 overflow-hidden min-w-[160px]">
<button className="w-full px-4 py-2 hover:bg-slate-700 text-left text-white text-sm flex items-center gap-2">
<Bookmark className="w-4 h-4" /> Save Post
</button>
<button className="w-full px-4 py-2 hover:bg-slate-700 text-left text-white text-sm flex items-center gap-2">
<Flag className="w-4 h-4" /> Report
</button>
<button className="w-full px-4 py-2 hover:bg-slate-700 text-left text-white text-sm flex items-center gap-2">
<Copy className="w-4 h-4" /> Copy Link
</button>
</div>
)}
</div>
</div>

{/* THE STRUGGLE */}
<div
className="space-y-2 cursor-pointer"
onClick={() => setShowFullPost({ ...showFullPost, [post.id]: !showFullPost[post.id] })}
>
<div className="flex items-center gap-2">
<AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
<span className="text-red-400 font-black text-xs tracking-wider">THE STRUGGLE</span>
</div>
<p className="text-white text-lg md:text-xl font-semibold leading-tight pl-4 md:pl-6">
{post.struggle}
</p>
{!showFullPost[post.id] && (
  <button 
    data-tour="expand-post"
    onClick={(e) => {
      e.stopPropagation();
      setShowFullPost({ ...showFullPost, [post.id]: !showFullPost[post.id] });
      
      const { waiting, sendSignal } = useMentorStore.getState();
      if (waiting) {
        console.log('🔔 Sending signal from expand button');
        sendSignal();
      }
    }}
    ref={(el) => {
      if (el) {
        console.log('✅ EXPAND POST BUTTON MOUNTED');
      }
    }}
    className="text-purple-400 text-sm font-medium pl-4 md:pl-6 flex items-center gap-1 hover:text-purple-300"
    style={{ position: 'relative', zIndex: 10 }}
  >
    <ChevronDown className="w-4 h-4" />
    Read more
  </button>
)}



</div>



{showFullPost[post.id] && (
<>
{/* HELP NEEDED */}
<div className="space-y-2 pl-4 md:pl-6">
<div className="text-blue-400 font-bold text-xs tracking-wide">→ HELP I NEED</div>
<p className="text-purple-200 font-medium text-sm md:text-base">{post.helpNeeded}</p>
</div>

{/* WHAT I'VE TRIED */}
<div className="space-y-2 pl-4 md:pl-6">
<div className="text-yellow-400 font-bold text-xs tracking-wide">✓ WHAT I'VE TRIED</div>
<div className="space-y-1">
{post.whatTried.map((item, idx) => (
<div key={idx} className="flex items-start gap-2">
<span className="text-yellow-600 text-sm">•</span>
<span className="text-purple-300 text-sm">{item}</span>
</div>
))}
</div>
</div>
</>
)}

{/* Quick Stats Bar */}
<div className="flex items-center gap-4 text-xs text-purple-400 pl-4 md:pl-6">
<span className="flex items-center gap-1">
<MessageCircle className="w-3 h-3" />
{post.reactions.comments} comments
</span>
<span className="flex items-center gap-1">
<Lightbulb className="w-3 h-3" />
{post.solutions.length} solutions
</span>
<span className="flex items-center gap-1">
<Clock className="w-3 h-3" />
{post.responseTime}
</span>
</div>

{/* SOLUTIONS FROM COMMUNITY */}
<div className="pt-4 border-t-2 border-white/5 space-y-3">
<button
onClick={() => setExpandedSolutions({ ...expandedSolutions, [post.id]: !expandedSolutions[post.id] })}
className="flex items-center gap-2 text-green-400 font-black text-sm hover:text-green-300"
>
<Lightbulb className="w-5 h-5" />
<span>{post.solutions.length} SOLUTIONS THAT WORKED</span>
<ChevronDown className={`w-4 h-4 transition-transform ${expandedSolutions[post.id] ? 'rotate-180' : ''}`} />
</button>

{expandedSolutions[post.id] && (
<div className="space-y-3">
{post.solutions.map((sol) => (
<div key={sol.id} className="p-3 md:p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
<div className="flex items-start gap-2 md:gap-3 mb-3">
<div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-600 flex items-center justify-center text-sm md:text-lg flex-shrink-0">
{sol.from}
</div>
<p className="text-white text-sm md:text-base flex-1 leading-relaxed">{sol.text}</p>
</div>

{/* Solution Context Tags */}
{sol.context && (
<div className="flex flex-wrap gap-2 mb-3 pl-8 md:pl-11">
{sol.context.map((tag, idx) => (
<span key={idx} className="px-2 py-1 bg-green-900/20 border border-green-500/30 rounded text-green-300 text-xs">
{tag}
</span>
))}
</div>
)}

<div className="flex items-center gap-2 md:gap-4 pl-8 md:pl-11 flex-wrap">
<button
onClick={() => handleReaction(post.id, `solution-${sol.id}`)}
className={`flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 hover:bg-green-900/50
rounded-lg transition-all group ${reactionAnimations[`${post.id}-solution-${sol.id}`] ? 'scale-110' : ''}`}
>
<ThumbsUp className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
<span className="text-green-400 font-bold text-xs md:text-sm">{sol.helped}</span>
<span className="text-green-300 text-xs hidden sm:inline">This helped me</span>
</button>
{sol.verified && (
<span className="flex items-center gap-1 text-blue-400 text-xs font-bold">
<CheckCircle className="w-3 h-3" />

</span>
)}
<button className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1">
<Share2 className="w-3 h-3" />
<span className="hidden sm:inline">Share</span>
</button>
<button className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1">
<Repeat2 className="w-3 h-3" />
<span className="hidden sm:inline">I'll try this</span>
</button>
</div>
</div>
))}
</div>
)}

{/* Add Your Solution */}
{!showSolutionInput[post.id] ? (
<button
  data-tour="add-solution"
  ref={(el) => {
    if (el) {
      console.log('✅ ADD SOLUTION BUTTON MOUNTED');
    }
  }}
  onClick={() => setShowSolutionInput({ ...showSolutionInput, [post.id]: true })}
  className="w-full p-3 md:p-4 border-2 border-dashed border-green-500/30 hover:border-green-500
  rounded-xl text-green-400 font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
>
<Plus className="w-4 h-4 md:w-5 md:h-5" />
Share what worked for you
</button>
) : (
<div className="space-y-2 p-3 md:p-4 bg-white/5 rounded-xl">
<textarea
placeholder="What worked for you? Be specific..."
rows={3}
className="w-full px-3 md:px-4 py-2 md:py-3 bg-slate-900 border border-green-500/30 rounded-lg
text-white text-sm md:text-base placeholder-purple-500 focus:border-green-500 focus:outline-none resize-none"
/>
<div className="flex gap-2">
<button
onClick={() => setShowSolutionInput({ ...showSolutionInput, [post.id]: false })}
className="px-3 md:px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
>
Cancel
</button>
<button
onClick={() => handleAddSolution(post.id, 'solution text')}
className="flex-1 px-3 md:px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold text-sm"
>
Share Solution
</button>
</div>
</div>
)}
</div>

{/* Comments Section */}
{post.comments && post.comments.length > 0 && (
<div className="pt-4 border-t-2 border-white/5 space-y-3">
<button
onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !expandedComments[post.id] })}
className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium text-sm"
>
<MessageCircle className="w-4 h-4" />
<span>{post.comments.length} comments</span>
<ChevronDown className={`w-4 h-4 transition-transform ${expandedComments[post.id] ? 'rotate-180' : ''}`} />
</button>

{expandedComments[post.id] && (
<div className="space-y-2">
{post.comments.map((comment) => (
<div key={comment.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
<div className="flex items-start gap-2">
<div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-sm flex-shrink-0">
{comment.author}
</div>
<div className="flex-1 min-w-0">
<p className="text-purple-200 text-sm mb-1">{comment.text}</p>
<div className="flex items-center gap-3 text-xs text-purple-400">
<span>{comment.timeAgo}</span>
<button
onClick={() => handleReaction(post.id, `comment-${comment.id}`)}
className="hover:text-pink-400 flex items-center gap-1"
>
<Heart className="w-3 h-3" />
{comment.likes}
</button>
<button className="hover:text-purple-300">Reply</button>
</div>
</div>
</div>
</div>
))}
</div>
)}
</div>
)}

{/* Add Comment */}
{!showCommentInput[post.id] ? (
<button
  data-tour="add-comment"
  ref={(el) => {
    if (el) {
      console.log('✅ ADD COMMENT BUTTON MOUNTED');
    }
  }}
  onClick={() => setShowCommentInput({ ...showCommentInput, [post.id]: true })}
  className="w-full p-2 md:p-3 border border-purple-500/30 hover:border-purple-500 rounded-lg text-purple-400
  font-medium text-sm transition-all flex items-center justify-center gap-2"
>
<MessageCircle className="w-4 h-4" />
Add a comment
</button>
) : (
<div className="space-y-2 p-3 bg-white/5 rounded-lg">
<textarea
placeholder="Share your thoughts..."
value={commentText[post.id] || ''}
onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
rows={2}
className="w-full px-3 py-2 bg-slate-900 border border-purple-500/30 rounded-lg
text-white text-sm placeholder-purple-500 focus:border-purple-500 focus:outline-none resize-none"
/>
<div className="flex gap-2">
<button
onClick={() => {
setShowCommentInput({ ...showCommentInput, [post.id]: false });
setCommentText({ ...commentText, [post.id]: '' });
}}
className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
>
Cancel
</button>
<button
onClick={() => handleAddComment(post.id, commentText[post.id])}
className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold text-sm"
>
Post Comment
</button>
</div>
</div>
)}

{/* Reactions */}
<div className="flex items-center gap-2 md:gap-3 pt-3 border-t-2 border-white/5 flex-wrap">
<button
  data-tour="relate-button"
  ref={(el) => {
    // ✅ This fires when button mounts!
    if (el && !tourStartedRef.current && !localStorage.getItem('mentor_journey_optimizedsupport_completed')) {
      console.log('✅ RELATE BUTTON MOUNTED!');
      
      // Only first post's button should trigger
      const allRelateButtons = document.querySelectorAll('[data-tour="relate-button"]');
      const isFirstButton = allRelateButtons[0] === el;
      
      
    }
  }}
  onClick={() => {
    handleReaction(post.id, 'relate');
    setLocalReactions({ ...localReactions, relate: localReactions.relate + (hasReacted.relate ? -1 : 1) });
    setHasReacted({ ...hasReacted, relate: !hasReacted.relate });
  }}
  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 ${hasReacted.relate ? 'bg-pink-500/20' : 'bg-pink-500/10'}
  hover:bg-pink-500/20 border border-pink-500/30 rounded-lg transition-all
  ${reactionAnimations[`${post.id}-relate`] ? 'scale-110' : ''}`}
  style={{ position: 'relative', zIndex: 10 }}
>
  <Heart className={`w-3 h-3 md:w-4 md:h-4 ${hasReacted.relate ? 'fill-pink-400' : ''} text-pink-400`} />
  <span className="text-pink-400 font-bold text-sm">{localReactions.relate}</span>
  <span className="text-purple-300 text-xs md:text-sm hidden sm:inline">I relate</span>
</button>



<button
  data-tour="bookmark-button"
  ref={(el) => {
    if (el) {
      console.log('✅ BOOKMARK BUTTON MOUNTED');
    }
  }}
  onClick={() => {
    setLocalReactions({ ...localReactions, following: localReactions.following + (hasReacted.following ? -1 : 1) });
    setHasReacted({ ...hasReacted, following: !hasReacted.following });
  }}
  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 ${hasReacted.following ? 'bg-blue-500/20' : 'bg-blue-500/10'}
hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all`}>
<Bookmark className={`w-3 h-3 md:w-4 md:h-4 ${hasReacted.following ? 'fill-blue-400' : ''} text-blue-400`} />
<span className="text-blue-400 font-bold text-sm">{localReactions.following}</span>
<span className="text-purple-300 text-xs md:text-sm hidden sm:inline">Following</span>
</button>

<button
onClick={() => setShowShareMenu({ ...showShareMenu, [post.id]: !showShareMenu[post.id] })}
className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20
border border-purple-500/30 rounded-lg transition-all ml-auto"
>
<Share2 className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
<span className="text-purple-300 text-xs md:text-sm hidden sm:inline">Share</span>
</button>
</div>

{/* Share Menu */}
{showShareMenu[post.id] && (
<div className="flex gap-2 p-3 bg-white/5 rounded-lg border border-purple-500/30">
<button className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm flex items-center justify-center gap-2">
<Copy className="w-4 h-4" />
Copy Link
</button>
<button className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm flex items-center justify-center gap-2">
<ExternalLink className="w-4 h-4" />
Share
</button>
</div>
)}
</div>
);
};

// ============================================ // JOURNEY TRACKER CARD (Similar interactive enhancements) // ============================================

const JourneyTrackerCard = ({ post }) => { const [localReactions, setLocalReactions] = useState(post.reactions); const [hasReacted, setHasReacted] = useState({});

 
return (
<div className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5
backdrop-blur-sm p-4 md:p-6 space-y-4 relative">
{/* Similar header and interactive elements as StruggleSolutionCard */}
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 md:gap-3">
<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg md:text-xl">
{post.author.avatar}
</div>
<div>
<div className="flex items-center gap-2">
<span className="text-white font-bold text-sm md:text-base">Anonymous</span>
<span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full font-bold">
JOURNEY
</span>
</div>
<span className="text-purple-400 text-xs">{post.timeAgo} • {post.timeline}</span>
</div>
</div>
<button
onClick={() => setShowMoreMenu({ ...showMoreMenu, [post.id]: !showMoreMenu[post.id] })}
className="p-2 hover:bg-white/5 rounded-lg transition-all"
>
<MoreHorizontal className="w-5 h-5 text-purple-400" />
</button>
</div>

<h3 className="text-white text-lg md:text-xl font-bold">{post.title}</h3>

{/* Timeline */}
<div className="space-y-4">
<div className="relative pl-6 md:pl-8 border-l-4 border-red-500/30">
<div className="absolute -left-[11px] md:-left-[13px] top-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-500 flex items-center justify-center">
<span className="text-white text-xs font-bold">1</span>
</div>
<div className="text-red-400 font-black text-xs mb-1.5 tracking-wider">BEFORE</div>
<p className="text-purple-200 text-sm md:text-base">{post.before}</p>
</div>

<div className="relative pl-6 md:pl-8 border-l-4 border-yellow-500">
<div className="absolute -left-[11px] md:-left-[13px] top-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-yellow-500 flex items-center justify-center">
<Flame className="w-3 h-3 md:w-4 md:h-4 text-white" />
</div>
<div className="text-yellow-400 font-black text-xs mb-1.5 tracking-wider">TODAY</div>
<p className="text-white font-semibold text-base md:text-lg">{post.today}</p>
</div>

<div className="relative pl-6 md:pl-8 border-l-4 border-green-500/30 border-dashed">
<div className="absolute -left-[11px] md:-left-[13px] top-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500/20 border-4 border-green-500"></div>
<div className="text-green-400 font-black text-xs mb-1.5 tracking-wider">GOAL</div>
<p className="text-purple-200 font-medium text-sm md:text-base">{post.goal}</p>
</div>
</div>

{/* Progress Updates */}
{post.updates.length > 0 && (
<div className="pt-4 border-t-2 border-white/5 space-y-2">
<div className="text-blue-400 font-bold text-sm flex items-center gap-2">
<Calendar className="w-4 h-4" />
PROGRESS UPDATES
</div>
{post.updates.map((update, idx) => (
<div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
<div className="flex items-center gap-2 mb-1">
<CheckCircle className="w-4 h-4 text-green-400" />
<span className="text-white font-bold text-sm">Day {update.day}</span>
</div>
<p className="text-purple-200 text-sm pl-6">{update.note}</p>
</div>
))}
</div>
)}

{/* Cheer Button */}
<button className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500
hover:to-emerald-500 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2">
<Flame className="w-5 h-5" />
Cheer them on! 🎉
</button>

{/* Reactions */}
<div className="flex items-center gap-2 md:gap-3 pt-3 border-t-2 border-white/5 flex-wrap">
<button
onClick={() => {
handleReaction(post.id, 'relate');
setLocalReactions({ ...localReactions, relate: localReactions.relate + (hasReacted.relate ? -1 : 1) });
setHasReacted({ ...hasReacted, relate: !hasReacted.relate });
}}
className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 ${hasReacted.relate ? 'bg-pink-500/20' : 'bg-pink-500/10'}
hover:bg-pink-500/20 border border-pink-500/30 rounded-lg transition-all`}
>
<Heart className={`w-3 h-3 md:w-4 md:h-4 ${hasReacted.relate ? 'fill-pink-400' : ''} text-pink-400`} />
<span className="text-pink-400 font-bold text-sm">{localReactions.relate}</span>
</button>

<button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-green-500/10 hover:bg-green-500/20
border border-green-500/30 rounded-lg transition-all">
<Flame className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
<span className="text-green-400 font-bold text-sm">{localReactions.cheering}</span>
<span className="text-purple-300 text-xs md:text-sm hidden sm:inline">Cheering</span>
</button>

<button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20
border border-blue-500/30 rounded-lg transition-all">
<Eye className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
<span className="text-blue-400 font-bold text-sm">{localReactions.following}</span>
</button>
</div>
</div>
);
};

// ============================================ // WHAT WORKED CARD // ============================================

const WhatWorkedCard = ({ post }) => { const [localReactions, setLocalReactions] = useState(post.reactions); const [hasReacted, setHasReacted] = useState({});

 
return (
<div className="rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5
backdrop-blur-sm p-4 md:p-6 space-y-4">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 md:gap-3">
<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-600 flex items-center justify-center text-lg md:text-xl">
{post.author.avatar}
</div>
<div>
<div className="flex items-center gap-2">
<span className="text-white font-bold text-sm md:text-base">Anonymous</span>
<span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-bold flex items-center gap-1">
<Lightbulb className="w-3 h-3" />
SOLUTION
</span>
</div>
<span className="text-purple-400 text-xs">{post.timeAgo}</span>
</div>
</div>
{post.verified && (
<div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full">
<CheckCircle className="w-3 h-3 text-blue-400" />
<span className="text-blue-400 text-xs font-bold"></span>
</div>
)}
</div>

<div className="space-y-4">
<div>
<div className="text-red-400 font-black text-xs mb-2 tracking-wider">THE PROBLEM</div>
<p className="text-purple-200 font-medium text-sm md:text-base pl-4">{post.problem}</p>
</div>

<div className="flex items-center justify-center py-2">
<div className="flex flex-col items-center gap-1">
<ArrowDown className="w-6 h-6 md:w-8 md:h-8 text-green-400 animate-bounce" />
<span className="text-green-400 font-bold text-xs">SOLUTION</span>
</div>
</div>

<div className="p-4 md:p-5 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
<p className="text-white font-bold text-base md:text-lg leading-relaxed">{post.solution}</p>
</div>

<div className="p-3 md:p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
<div className="text-emerald-300 font-bold text-xs mb-2">✨ THE IMPACT</div>
<p className="text-emerald-100 font-medium text-sm md:text-base">{post.impact}</p>
</div>
</div>

{/* Community Stats */}
<div className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl border border-white/10 gap-2">
<div className="flex items-center gap-2">
<Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
<span className="text-white font-bold text-sm md:text-base">{post.reactions.trying}</span>
<span className="text-purple-300 text-xs md:text-sm">trying this now</span>
</div>
<button className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold text-xs md:text-sm transition-all whitespace-nowrap">
I'll Try This
</button>
</div>

{/* Reactions */}
<div className="flex items-center gap-2 md:gap-3 pt-3 border-t-2 border-white/5 flex-wrap">
<button
onClick={() => {
handleReaction(post.id, 'relate');
setLocalReactions({ ...localReactions, relate: localReactions.relate + (hasReacted.relate ? -1 : 1) });
setHasReacted({ ...hasReacted, relate: !hasReacted.relate });
}}
className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 ${hasReacted.relate ? 'bg-pink-500/20' : 'bg-pink-500/10'}
hover:bg-pink-500/20 border border-pink-500/30 rounded-lg transition-all`}
>
<Heart className={`w-3 h-3 md:w-4 md:h-4 ${hasReacted.relate ? 'fill-pink-400' : ''} text-pink-400`} />
<span className="text-pink-400 font-bold text-sm">{localReactions.relate}</span>
</button>

<button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-green-500/10 hover:bg-green-500/20
border border-green-500/30 rounded-lg transition-all">
<ThumbsUp className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
<span className="text-green-400 font-bold text-sm">{localReactions.helped}</span>
<span className="text-purple-300 text-xs md:text-sm hidden sm:inline">Helped me</span>
</button>

<button className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20
border border-purple-500/30 rounded-lg transition-all ml-auto">
<Share2 className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
</button>
</div>
</div>
);
};

const ActivitySupportCard = ({ activity }) => {
  const [showSupport, setShowSupport] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [cheers, setCheers] = useState(activity.cheers || 0);
  const [hasCheered, setHasCheered] = useState(false);

  const handleCheer = async () => {
    if (!currentUser || hasCheered) return;
    
    const db = getFirestore();
    const activityRef = doc(db, 'users', activity.userId, 'activities', activity.id);
    
    await updateDoc(activityRef, {
      cheers: increment(1)
    });
    
    setCheers(cheers + 1);
    setHasCheered(true);
  };

  const handleSendSupport = async () => {
    if (!supportMessage.trim()) return;
    
    const db = getFirestore();
    const supportsRef = collection(db, 'users', activity.userId, 'activities', activity.id, 'supports');
    
    await addDoc(supportsRef, {
      message: supportMessage,
      from: currentUser?.displayName || 'Anonymous',
      fromUid: currentUser?.uid,
      fromPhoto: currentUser?.photoURL || '👤',
      timestamp: serverTimestamp()
    });
    
    setSupportMessage('');
    setShowSupport(false);
  };

  const isUpcoming = !activity.completed && activity.scheduledDate > Date.now();
  const isCompleted = activity.completed;
  const timeUntil = isUpcoming ? getTimeUntil(activity.scheduledDate) : null;
  
  return (
    <div className={`rounded-2xl border-2 backdrop-blur-sm p-4 md:p-6 space-y-4 ${
      isCompleted 
        ? 'border-green-500/30 bg-green-500/5' 
        : 'border-blue-500/30 bg-blue-500/5'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-3 flex-1">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg md:text-xl overflow-hidden">
            {activity.userPhoto.startsWith('http') ? (
              <img src={activity.userPhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              activity.userPhoto
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm md:text-base">{activity.userName}</span>
              {isCompleted && (
                <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  COMPLETED
                </span>
              )}
              {isUpcoming && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-bold">
                  UPCOMING
                </span>
              )}
            </div>
            <span className="text-purple-400 text-xs">
              {isCompleted 
                ? `Completed ${new Date(activity.completedDate).toLocaleDateString()}`
                : `Scheduled for ${new Date(activity.scheduledDate).toLocaleDateString()}`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Activity Info */}
      <div className="space-y-2">
        <h3 className="text-white text-lg md:text-xl font-bold">{activity.name}</h3>
        <div className="flex items-center gap-2 text-purple-300 text-sm">
          <span className="text-xl">
            {activity.type === 'Martial Arts' ? '🥋' :
             activity.type === 'Yoga' ? '🧘' :
             activity.type === 'Climbing' ? '🧗' :
             activity.type === 'Dance' ? '💃' : '🎯'}
          </span>
          <span>{activity.type}</span>
        </div>
        
        {isUpcoming && timeUntil && (
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <Clock className="w-4 h-4" />
            <span>{timeUntil} until activity</span>
          </div>
        )}
      </div>

      {/* Why they're doing it */}
      {activity.why && (
        <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-xl">
          <p className="text-purple-200 text-sm"><strong>Why:</strong> {activity.why}</p>
        </div>
      )}

      {/* Anxiety Levels */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-xl border ${
          isCompleted ? 'bg-red-900/10 border-red-500/30' : 'bg-yellow-900/10 border-yellow-500/30'
        }`}>
          <p className="text-xs text-purple-300 mb-1">
            {isCompleted ? 'Before' : 'Current'} Anxiety
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${getAnxietyColor(activity.preAnxiety)}`}>
              {activity.preAnxiety}/10
            </span>
            <span className="text-lg">{getAnxietyEmoji(activity.preAnxiety)}</span>
          </div>
        </div>
        
        {isCompleted && (
          <div className="p-3 bg-green-900/10 border border-green-500/30 rounded-xl">
            <p className="text-xs text-purple-300 mb-1">After Anxiety</p>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${getAnxietyColor(activity.postAnxiety)}`}>
                {activity.postAnxiety}/10
              </span>
              <span className="text-lg">{getAnxietyEmoji(activity.postAnxiety)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Reflection (if completed) */}
      {isCompleted && activity.reflection && (
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-purple-200 text-sm italic">"{activity.reflection}"</p>
        </div>
      )}

      {/* Support Actions */}
      <div className="flex items-center gap-2 pt-3 border-t-2 border-white/5">
        <button
          data-tour="cheer-button"
          onClick={handleCheer}
          disabled={hasCheered || activity.userId === currentUser?.uid}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
            hasCheered 
              ? 'bg-green-500/20 border border-green-500/50' 
              : 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/30'
          }`}
        >
          <Flame className={`w-4 h-4 ${hasCheered ? 'text-green-400' : 'text-green-400'}`} />
          <span className="text-green-400 font-bold text-sm">{cheers}</span>
          <span className="text-purple-300 text-xs hidden sm:inline">
            {hasCheered ? 'Cheered!' : 'Cheer'}
          </span>
        </button>

        {activity.userId !== currentUser?.uid && (
          <button
            data-tour="send-support-button"
            onClick={() => setShowSupport(!showSupport)}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-all"
          >
            <MessageCircle className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-xs hidden sm:inline">Send Support</span>
          </button>
        )}
      </div>

      {/* Support Message Input */}
      {showSupport && (
        <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-purple-500/30">
          <textarea
            placeholder="Send words of encouragement..."
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white text-sm placeholder-purple-500 focus:border-purple-500 focus:outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowSupport(false)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSendSupport}
              className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold text-sm"
            >
              Send Support 💜
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function (add at top with other utilities)
const getTimeUntil = (scheduledDate) => {
  const now = Date.now();
  const diff = scheduledDate - now;
  if (diff < 0) return 'Past';
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const getAnxietyColor = (level) => {
  if (level <= 3) return 'text-green-400';
  if (level <= 6) return 'text-yellow-400';
  return 'text-red-400';
};

const getAnxietyEmoji = (level) => {
  if (level <= 3) return '😊';
  if (level <= 6) return '😐';
  return '😰';
};

// ============================================ // MICRO CHALLENGE CARD // ============================================

const MicroChallengeCard = ({ post }) => { const diffColors = { beginner: 'bg-green-500/10 border-green-500/30 text-green-400', intermediate: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400', advanced: 'bg-red-500/10 border-red-500/30 text-red-400' };

 
const [hasJoined, setHasJoined] = useState(false);
const [localJoined, setLocalJoined] = useState(post.reactions.joined);

return (
<div className="rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5
backdrop-blur-sm p-4 md:p-6 space-y-4">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 md:gap-3">
<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cyan-600 flex items-center justify-center text-lg md:text-xl">
{post.author.avatar}
</div>
<div>
<div className="flex items-center gap-2">
<span className="text-white font-bold text-sm md:text-base">Anonymous</span>
<span className="px-2 py-0.5 bg-cyan-500 text-white text-xs rounded-full font-bold flex items-center gap-1">
<Target className="w-3 h-3" />
CHALLENGE
</span>
</div>
<span className="text-purple-400 text-xs">{post.timeAgo}</span>
</div>
</div>
<span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold border ${diffColors[post.difficulty]}`}>
{post.difficulty}
</span>
</div>

<div className="space-y-3">
<div className="text-cyan-400 font-black text-xs tracking-wider">THE CHALLENGE</div>
<p className="text-white text-xl md:text-2xl font-bold pl-4">{post.challenge}</p>

<div className="flex items-center gap-3 md:gap-4 pl-4 text-xs md:text-sm flex-wrap">
<div className="flex items-center gap-2">
<Clock className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
<span className="text-purple-300 font-medium">{post.duration}</span>
</div>
<div className="flex items-center gap-2">
<Users className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
<span className="text-cyan-400 font-bold">{localJoined}</span>
<span className="text-purple-300">joined</span>
</div>
</div>

{/* Why This Matters */}
<div className="p-3 bg-cyan-900/10 border border-cyan-500/20 rounded-lg">
<div className="text-cyan-300 font-bold text-xs mb-1">💡 WHY THIS MATTERS</div>
<p className="text-cyan-100 text-sm">{post.whyThisMatters}</p>
</div>
</div>

{/* Participants */}
<div className="space-y-3 pt-4 border-t-2 border-white/5">
<div className="text-white font-bold text-sm flex items-center gap-2">
<Star className="w-4 h-4 text-yellow-400" />
PEOPLE DOING IT
</div>

<div className="space-y-2 max-h-64 overflow-y-auto">
{post.participants.map((p, idx) => (
<div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start gap-2 md:gap-3">
<div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-cyan-600 flex items-center justify-center text-sm md:text-lg flex-shrink-0">
{p.avatar}
</div>
<div className="flex-1 min-w-0">
<div className="flex items-center gap-2 mb-1 flex-wrap">
{p.status === 'done' ? (
<CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
) : p.status === 'setback' ? (
<AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
) : (
<Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
)}
<span className={`text-xs font-bold ${
p.status === 'done' ? 'text-green-400' :
p.status === 'setback' ? 'text-yellow-400' :
'text-blue-400'
}`}>
{p.status === 'done' ? 'COMPLETED' : p.status === 'setback' ? 'SETBACK' : 'IN PROGRESS'}
</span>
<span className="text-purple-400 text-xs">{p.timeAgo}</span>
</div>
<p className="text-purple-200 text-xs md:text-sm">{p.note}</p>
</div>
</div>
))}
</div>
</div>

{/* Join Button */}
<button
  data-tour="accept-challenge"
  ref={(el) => {
    if (el) {
      console.log('✅ ACCEPT CHALLENGE BUTTON MOUNTED');
    }
  }}
  onClick={() => {
    setHasJoined(!hasJoined);
    setLocalJoined(localJoined + (hasJoined ? -1 : 1));
    handleReaction(post.id, 'join-challenge');
  }}
  className={`w-full px-4 md:px-6 py-3 md:py-4 ${hasJoined ? 'bg-green-600' : 'bg-gradient-to-r from-cyan-600 to-blue-600'}
  hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-bold text-base md:text-lg transition-all
  flex items-center justify-center gap-2`}
  >
{hasJoined ? (
<>
<CheckCircle className="w-5 h-5" />
Challenge Accepted! 🎯
</>
) : (
<>
<Target className="w-5 h-5" />
Accept Challenge
</>
)}
</button>

{/* Reactions */}
<div className="flex items-center gap-2 md:gap-3 pt-3 border-t-2 border-white/5 flex-wrap">
<button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20
border border-pink-500/30 rounded-lg transition-all">
<Heart className="w-3 h-3 md:w-4 md:h-4 text-pink-400" />
<span className="text-pink-400 font-bold text-sm">{post.reactions.relate}</span>
</button>
<button className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20
border border-purple-500/30 rounded-lg transition-all ml-auto">
<Share2 className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
</button>
</div>
</div>
);
};

// ============================================
// ACCOUNTABILITY PARTNER CARD
// ============================================

const AccountabilityPartnerCard = ({ partner, currentUser }) => {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInText, setCheckInText] = useState('');
  const [showScheduleSync, setShowScheduleSync] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [localStreak, setLocalStreak] = useState(partner.streak || 0);

  const handleCheckIn = async () => {
    if (!checkInText.trim()) return;
    
    const db = getFirestore();
    const checkInsRef = collection(db, 'users', currentUser.uid, 'partners', partner.id, 'checkIns');
    
    await addDoc(checkInsRef, {
      text: checkInText,
      timestamp: serverTimestamp(),
      mood: '😊', // Could add mood selector
      goalProgress: {} // Could track specific goals
    });

    // Update streak
    setLocalStreak(localStreak + 1);
    
    setCheckInText('');
    setShowCheckIn(false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    const db = getFirestore();
    const messagesRef = collection(db, 'partnerships', partner.partnershipId, 'messages');
    
    await addDoc(messagesRef, {
      text: messageText,
      from: currentUser.uid,
      fromName: currentUser.displayName || 'Anonymous',
      timestamp: serverTimestamp()
    });
    
    setMessageText('');
  };

  const handleScheduleSync = async (date, time, type) => {
    const db = getFirestore();
    const syncsRef = collection(db, 'partnerships', partner.partnershipId, 'syncs');
    
    await addDoc(syncsRef, {
      scheduledDate: new Date(`${date}T${time}`).getTime(),
      type: type, // 'video', 'voice', 'text'
      status: 'scheduled',
      participants: [currentUser.uid, partner.uid]
    });
    
    setShowScheduleSync(false);
  };

  const nextSyncDate = partner.nextSync ? new Date(partner.nextSync) : null;
  const daysUntilSync = nextSyncDate ? Math.ceil((nextSyncDate - Date.now()) / (24 * 60 * 60 * 1000)) : null;

  return (
    <div className="rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-sm p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-2xl overflow-hidden border-2 border-blue-400/50">
            {partner.photo?.startsWith('http') ? (
              <img src={partner.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              partner.photo || '👤'
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold text-base md:text-lg">{partner.name}</span>
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-bold flex items-center gap-1">
                <Users className="w-3 h-3" />
                PARTNER
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-300 mt-1">
              <span>Matched {partner.matchedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                {localStreak} day streak
              </span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-lg transition-all">
          <MoreHorizontal className="w-5 h-5 text-purple-400" />
        </button>
      </div>

      {/* Shared Goals */}
      <div className="space-y-2">
        <div className="text-blue-400 font-bold text-sm flex items-center gap-2">
          <Target className="w-4 h-4" />
          SHARED GOALS
        </div>
        <div className="space-y-2">
          {partner.sharedGoals?.map((goal, idx) => (
            <div key={idx} className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-white font-medium text-sm flex-1">{goal.text}</p>
                {goal.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500/50 flex-shrink-0" />
                )}
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-500"
                  style={{ width: `${goal.progress || 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-purple-300">{goal.progress || 0}% complete</span>
                <span className="text-purple-400">{goal.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Sync */}
      {nextSyncDate && (
        <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Next Check-in</div>
                <div className="text-purple-300 text-xs">
                  {nextSyncDate.toLocaleDateString()} at {nextSyncDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
            {daysUntilSync !== null && (
              <div className="text-right">
                <div className="text-cyan-400 font-bold text-lg">{daysUntilSync}</div>
                <div className="text-purple-300 text-xs">days away</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Check-ins */}
      {partner.recentCheckIns && partner.recentCheckIns.length > 0 && (
        <div className="space-y-2">
          <div className="text-green-400 font-bold text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            RECENT CHECK-INS
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {partner.recentCheckIns.map((checkIn, idx) => (
              <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start gap-2">
                  <span className="text-xl">{checkIn.mood}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{checkIn.from}</span>
                      <span className="text-purple-400 text-xs">{checkIn.timeAgo}</span>
                    </div>
                    <p className="text-purple-200 text-sm">{checkIn.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowCheckIn(!showCheckIn)}
          className="px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Check In
        </button>
        <button
          onClick={() => setShowMessages(!showMessages)}
          className="px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Message
        </button>
      </div>

      {/* Check-in Input */}
      {showCheckIn && (
        <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-green-500/30">
          <textarea
            placeholder="How are you doing with your goals? Any wins or struggles?"
            value={checkInText}
            onChange={(e) => setCheckInText(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-slate-900 border border-green-500/30 rounded-lg text-white text-sm placeholder-purple-500 focus:border-green-500 focus:outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCheckIn(false);
                setCheckInText('');
              }}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckIn}
              className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold text-sm"
            >
              Submit Check-in
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {showMessages && (
        <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-purple-500/30">
          <div className="space-y-2 max-h-48 overflow-y-auto mb-2">
            {partner.messages?.map((msg, idx) => (
              <div key={idx} className={`p-2 rounded-lg ${msg.from === currentUser?.uid ? 'bg-purple-600/20 ml-8' : 'bg-slate-800 mr-8'}`}>
                <p className="text-white text-sm">{msg.text}</p>
                <span className="text-purple-400 text-xs">{msg.timeAgo}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Send encouragement..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white text-sm placeholder-purple-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Schedule Sync Button */}
      <button
        onClick={() => setShowScheduleSync(!showScheduleSync)}
        className="w-full px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 rounded-lg text-blue-400 font-medium text-sm transition-all flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Schedule Next Sync-up
      </button>

      {/* Schedule Sync Modal */}
      {showScheduleSync && (
        <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-blue-500/30">
          <div className="text-white font-bold text-sm mb-2">Schedule Your Next Check-in</div>
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="px-3 py-2 bg-slate-900 border border-blue-500/30 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              type="time"
              className="px-3 py-2 bg-slate-900 border border-blue-500/30 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="text-purple-300 text-xs mb-2">Choose format:</div>
          <div className="grid grid-cols-3 gap-2">
            <button className="px-3 py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium transition-all flex items-center justify-center gap-1">
              <Video className="w-3 h-3" />
              Video
            </button>
            <button className="px-3 py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium transition-all flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" />
              Voice
            </button>
            <button className="px-3 py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium transition-all flex items-center justify-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Text
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowScheduleSync(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => handleScheduleSync('2025-01-25', '14:00', 'video')}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold text-sm"
            >
              Schedule
            </button>
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t-2 border-white/5">
        <div className="text-center">
          <div className="text-cyan-400 font-bold text-lg">{partner.totalCheckIns || 0}</div>
          <div className="text-purple-300 text-xs">Check-ins</div>
        </div>
        <div className="text-center">
          <div className="text-green-400 font-bold text-lg">{partner.goalsCompleted || 0}</div>
          <div className="text-purple-300 text-xs">Goals Met</div>
        </div>
        <div className="text-center">
          <div className="text-orange-400 font-bold text-lg flex items-center justify-center gap-1">
            <Flame className="w-4 h-4" />
            {localStreak}
          </div>
          <div className="text-purple-300 text-xs">Day Streak</div>
        </div>
      </div>
    </div>
  );
};


// ============================================
// PARTNER MATCH MODAL
// ============================================

const PartnerMatchModal = ({ isOpen, onClose, currentUser }) => {
  const [filters, setFilters] = useState({
    recoveryStage: 'any',
    struggleType: 'any',
    availability: 'any'
  });
  const [potentialPartners, setPotentialPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchPotentialPartners();
    }
  }, [isOpen, filters]);

  const fetchPotentialPartners = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const matches = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (
          doc.id !== currentUser?.uid &&
          userData.openToPartnership &&
          (filters.recoveryStage === 'any' || userData.recoveryStage === filters.recoveryStage) &&
          (filters.struggleType === 'any' || userData.primaryStruggle === filters.struggleType)
        ) {
          matches.push({
            id: doc.id,
            ...userData
          });
        }
      });
      
      setPotentialPartners(matches);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
    setLoading(false);
  };

  const handleSendRequest = async (partnerId) => {
    const db = getFirestore();
    const requestsRef = collection(db, 'partnerRequests');
    
    await addDoc(requestsRef, {
      from: currentUser.uid,
      fromName: currentUser.displayName || 'Anonymous',
      fromPhoto: currentUser.photoURL || '👤',
      to: partnerId,
      status: 'pending',
      timestamp: serverTimestamp(),
      message: `Hi! I'd love to be accountability partners. Let's support each other!`
    });
    
    setSentRequests({ ...sentRequests, [partnerId]: true });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl md:text-2xl font-bold">Find Your Partner</h2>
                <p className="text-purple-300 text-sm">Match with someone at a similar stage</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <X className="w-6 h-6 text-purple-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div>
              <label className="text-purple-300 text-sm font-medium mb-1.5 block">Recovery Stage</label>
              <select
                value={filters.recoveryStage}
                onChange={(e) => setFilters({ ...filters, recoveryStage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="any">Any Stage</option>
                <option value="beginner">Just Starting (Beginner)</option>
                <option value="intermediate">Making Progress (Intermediate)</option>
                <option value="advanced">Well Along (Advanced)</option>
              </select>
            </div>

            <div>
              <label className="text-purple-300 text-sm font-medium mb-1.5 block">Primary Struggle</label>
              <select
                value={filters.struggleType}
                onChange={(e) => setFilters({ ...filters, struggleType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="any">Any Struggle</option>
                <option value="social-anxiety">Social Anxiety</option>
                <option value="crowds">Crowds/Public Spaces</option>
                <option value="phone-calls">Phone Calls</option>
                <option value="meeting-new-people">Meeting New People</option>
                <option value="work-social">Work/Professional Settings</option>
                <option value="dating">Dating/Romance</option>
              </select>
            </div>

            <div>
              <label className="text-purple-300 text-sm font-medium mb-1.5 block">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="any">Any Time</option>
                <option value="daily">Daily Check-ins</option>
                <option value="few-times-week">Few Times a Week</option>
                <option value="weekly">Weekly</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-400">Finding your perfect match...</p>
            </div>
          ) : potentialPartners.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
              <p className="text-purple-400 text-lg mb-2">No matches found</p>
              <p className="text-purple-500 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            potentialPartners.map((partner) => (
              <div
                key={partner.id}
                className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                    {partner.photoURL?.startsWith('http') ? (
                      <img src={partner.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      partner.photoURL || '👤'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-bold">{partner.displayName || 'Anonymous'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        partner.recoveryStage === 'beginner' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        partner.recoveryStage === 'intermediate' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {partner.recoveryStage || 'Beginner'}
                      </span>
                    </div>
                    <p className="text-purple-300 text-sm mb-2">{partner.bio || 'Looking for an accountability partner to grow together'}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-purple-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {partner.primaryStruggle || 'Social anxiety'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {partner.availability || 'Weekly check-ins'}
                      </span>
                      {partner.currentStreak && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          {partner.currentStreak} day streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shared Goals Preview */}
                {partner.lookingFor && (
                  <div className="p-2 bg-blue-900/10 border border-blue-500/20 rounded-lg mb-3">
                    <p className="text-blue-300 text-xs">
                      <strong>Looking for:</strong> {partner.lookingFor}
                    </p>
                  </div>
                )}

                {/* Match Score */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm">
                      {partner.matchScore || Math.floor(Math.random() * 20) + 80}% Match
                    </span>
                  </div>
                  {partner.responseRate && (
                    <span className="text-green-400 text-xs font-medium">
                      {partner.responseRate} response rate
                    </span>
                  )}
                </div>

                {/* Action Button */}
                {sentRequests[partner.id] ? (
                  <div className="w-full px-4 py-2 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 font-bold text-sm text-center flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Request Sent!
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendRequest(partner.id)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Partner Request
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-purple-500/20 bg-slate-900/50">
          <div className="flex items-start gap-2 text-xs text-purple-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-purple-200">How it works:</strong> Send a request, and if they accept, 
              you'll be matched! Set shared goals, schedule check-ins, and support each other's journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


// ============================================ // MAIN RENDER // ============================================

if (showOnboarding) {
  return <FeelingOnboarding onComplete={handleOnboardingComplete} />;
}


// ... rest of your existing component

return ( <div id="community-top-bar" data-tour="community-header"  className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950"> {/* Top Bar - Mobile Optimized */} <div className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-800/30 sticky top-0 z-50"> <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4"> <div className="flex items-center justify-between"> <div className="flex items-center gap-2 md:gap-3"> <div className="text-2xl md:text-3xl">💜</div> <div> <div className="text-white font-bold text-sm md:text-base">Social Avoidance</div> <div className="text-purple-400 text-xs"> {firebaseConnected ? '🟢 Live' : '🔴 Offline'} • 1,247 members </div> </div> </div>

 


<div className="flex items-center gap-2 md:gap-3">

{!tourCompleted && (
  <button
    onClick={startInteractiveTour}
    data-tour-trigger="true"
    className="group relative px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 rounded-xl text-white font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-purple-500/50 flex items-center gap-2 animate-pulse-slow"
  >
    <span className="text-lg">🎯</span>
    <span className="hidden sm:inline">Start Tour</span>
    <span className="sm:hidden">Tour</span>
    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    
    {/* Sparkle effect */}
    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 -z-10 animate-pulse"></div>
  </button>
)}

{tourCompleted && (
  <button
    onClick={startInteractiveTour}
    className="px-3 py-2 bg-slate-700/50 hover:bg-purple-600/80 rounded-lg text-purple-300 hover:text-white text-sm transition-all flex items-center gap-2"
  >
    <Repeat2 className="w-4 h-4" />
    <span className="hidden sm:inline">Replay Tour</span>
    <span className="sm:hidden">Tour</span>
  </button>
)}


</div>
</div>
</div>
</div>

{/* Main Content */}
<div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8">

{/* Welcome Tour Banner - Only shown to new users */}
{!tourCompleted && (
  <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-purple-900/50 border-2 border-purple-500/40 p-6 backdrop-blur-sm">
    {/* Animated background */}
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse"></div>
    
    <div className="relative z-10">
      <div className="flex items-start gap-4">
        <div className="text-4xl">🎯</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Welcome to Your Support Community!
            <span className="text-sm font-normal px-2 py-1 bg-purple-500/30 rounded-full">New</span>
          </h3>
          <p className="text-purple-200 mb-4 leading-relaxed">
            Ready to make the most of this space? Take our interactive tour to discover how to 
            share experiences, connect with others, find solutions, and build meaningful support relationships.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={startInteractiveTour}
              className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-bold transition-all duration-300 shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Start Interactive Tour
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                localStorage.setItem('community_tour_completed', 'true');
                setTourCompleted(true);
              }}
              className="px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-purple-300 hover:text-white transition-all flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Filters - Mobile Scrollable */}
<div data-tour="filter-tabs"   className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 scrollbar-hide">
  <button
    data-tour="all-posts-tab"
    onClick={() => setActiveTab('all')}
    className={`px-3 md:px-4 py-2 ${activeTab === 'all' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
    rounded-lg text-white font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
  >
    All Posts
  </button>
  <button
    data-tour="activities-tab"
    onClick={() => setActiveTab('activities')}
    className={`px-3 md:px-4 py-2 ${activeTab === 'activities' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
    rounded-lg text-purple-300 font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
  >
    🎯 Community Activities
  </button>
  <button
    data-tour="support-tab"
    onClick={() => setActiveTab('support')}
    className={`px-3 md:px-4 py-2 ${activeTab === 'support' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
    rounded-lg text-purple-300 font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
  >
    🆘 Need Support
  </button>
  <button
    data-tour="solutions-tab"
    onClick={() => setActiveTab('solutions')}
    className={`px-3 md:px-4 py-2 ${activeTab === 'solutions' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
    rounded-lg text-purple-300 font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
  >
    💡 Solutions
  </button>
  <button
    data-tour="journeys-tab"
    onClick={() => setActiveTab('journeys')}
    className={`px-3 md:px-4 py-2 ${activeTab === 'journeys' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
    rounded-lg text-purple-300 font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
  >
    🛤️ Journeys
  </button>
  <button
    data-tour="challenges-tab"
    onClick={() => setActiveTab('challenges')}
    className={`px-3 md:px-4 py-2 ${activeTab === 'challenges' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
    rounded-lg text-purple-300 font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
  >
    🎯 Challenges
  </button>
  <button
  data-tour="partners-tab"
  onClick={() => setActiveTab('accountability')}
  className={`px-3 md:px-4 py-2 ${activeTab === 'accountability' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
  rounded-lg text-purple-300 font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
>
  🤝 My Partners
</button>

</div>

{/* Create Post Button */}


<CreatePostModal
  data-tour="create-post-btn"
  isOpen={showCreatePostModal}
  onClose={() => setShowCreatePostModal(false)}
  onSubmit={handleCreatePost}
  currentUser={currentUser}
/>





{/* ========== ALSO ADD THIS DIAGNOSTIC BUTTON ========== */}





{/* Feed */}
{/* Feed */}
{/* Feed */}
<div  data-tour="feed" className="space-y-4 md:space-y-6">
  {activeTab === 'activities' ? (
    // Show community activities
    allUserActivities.length > 0 ? (
      allUserActivities.map((activity) => (
        <ActivitySupportCard key={activity.id} activity={activity} />
      ))
    ) : (
      <div className="text-center py-12">
        <p className="text-purple-400 text-lg">No activities yet. Be the first to share!</p>
      </div>
    )
  ) : activeTab === 'accountability' ? (
    // Show accountability partners
    <>
      <button
  data-tour="find-partner-btn"
  onClick={() => setShowPartnerModal(true)}
  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-3 mb-6"
  >
        <Users className="w-6 h-6" />
        Find Accountability Partner
      </button>

      {userPartners.length > 0 ? (
        userPartners.map((partner) => (
          <AccountabilityPartnerCard key={partner.id} partner={partner} currentUser={currentUser} />
        ))
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
          <p className="text-purple-400 text-lg mb-2">No partners yet</p>
          <p className="text-purple-500 text-sm mb-6">Find someone to support your journey!</p>
        </div>
      )}
    </>
  ) : activeTab === 'mentorship' ? (
    // Show mentorship (placeholder for now)
    <>
      <button
        onClick={() => setShowMentorModal(true)}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-3 mb-6"
      >
        <Star className="w-6 h-6" />
        Find a Mentor or Become One
      </button>

      {userMentors.length > 0 ? (
        userMentors.map((mentor) => (
          <div key={mentor.id} className="p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-2 border-purple-500/30 rounded-2xl">
            <p className="text-white">Mentor card coming soon...</p>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
          <p className="text-purple-400 text-lg mb-2">No mentors yet</p>
          <p className="text-purple-500 text-sm mb-6">Connect with someone who's been there!</p>
        </div>
      )}
    </>
  ) : (
    // Show regular posts (filtered by tab)
    posts
      .filter(post => {
        if (activeTab === 'all') return true;
        if (activeTab === 'support') return post.type === 'struggle-solution';
        if (activeTab === 'solutions') return post.type === 'what-worked';
        if (activeTab === 'journeys') return post.type === 'journey-tracker';
        if (activeTab === 'challenges') return post.type === 'micro-challenge';
        return true;
      })
      .map((post , index) => (
        <div key={post.id}>
          {post.type === 'struggle-solution' && <StruggleSolutionCard post={post} postIndex={index} />}
          {post.type === 'journey-tracker' && <JourneyTrackerCard post={post} />}
          {post.type === 'what-worked' && <WhatWorkedCard post={post} />}
          {post.type === 'micro-challenge' && <MicroChallengeCard post={post} />}
        </div>
      ))
  )}
</div>

{/* Partner Match Modal */}
<PartnerMatchModal
  isOpen={showPartnerModal}
  onClose={() => setShowPartnerModal(false)}
  currentUser={currentUser}
/>
</div>

{/* Mobile Bottom Navigation (Optional) */}
{/* Modals */}


{/* Add padding for mobile bottom nav */}
<div className="md:hidden h-20"></div>

{/* Custom Tour Styling */}
<style>{`
  @keyframes pulse-slow {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  /* Beautiful Driver.js customizations */
  .driver-popover {
    background: linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(91, 33, 182, 0.95) 100%) !important;
    border: 2px solid rgba(168, 85, 247, 0.5) !important;
    border-radius: 16px !important;
    box-shadow: 0 20px 60px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2) !important;
    backdrop-filter: blur(10px) !important;
  }
  
  .driver-popover-title {
    color: #fff !important;
    font-size: 18px !important;
    font-weight: 700 !important;
    margin-bottom: 8px !important;
  }
  
  .driver-popover-description {
    color: #e9d5ff !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
  }
  
  .driver-popover-progress-text {
    color: #c084fc !important;
    font-size: 12px !important;
    font-weight: 600 !important;
  }
  
  .driver-popover-next-btn,
  .driver-popover-prev-btn,
  .driver-popover-close-btn {
    background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%) !important;
    color: white !important;
    border: none !important;
    padding: 10px 20px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3) !important;
  }
  
  .driver-popover-next-btn:hover,
  .driver-popover-prev-btn:hover {
    background: linear-gradient(135deg, #9333ea 0%, #db2777 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5) !important;
  }
  
  .driver-popover-close-btn {
    background: rgba(148, 163, 184, 0.3) !important;
    box-shadow: none !important;
  }
  
  .driver-popover-close-btn:hover {
    background: rgba(148, 163, 184, 0.5) !important;
  }
  
  .driver-popover-navigation-btns {
    gap: 8px !important;
  }
  
  /* Highlighted element styling */
  .driver-active-element {
    outline: 3px solid #a855f7 !important;
    outline-offset: 4px !important;
    border-radius: 12px !important;
  }
  
  /* Overlay styling */
  .driver-overlay {
    background: rgba(0, 0, 0, 0.3) !important;
  }
  
  /* Progress bar */
  .driver-popover-progress-text {
    background: rgba(168, 85, 247, 0.2) !important;
    padding: 4px 12px !important;
    border-radius: 12px !important;
    border: 1px solid rgba(168, 85, 247, 0.3) !important;
  }
`}</style>
</div>
); };


export default Optimizedsupport;
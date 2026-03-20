import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Lightbulb,  Trophy, Flame, TrendingUp, Calendar, Target, Award, CheckCircle, Star, Plus, Trash2, Edit3, BarChart3, Zap, Heart, MessageCircle, Users, Gift, LogOut, User, Loader2, ChevronDown, ChevronUp, Clock, Wind, Brain, Smile, Frown, Meh, Activity, Play, Search, Filter, ArrowRight, Bell, CheckSquare } from 'lucide-react';
import { useAutoCloseModals } from 'src/hooks/useAutoCloseModals';

import { useMentorStore } from 'src/store/useMentorStore';
import { mentorScriptBlogView, mentorScriptBlogViewQuick } from 'src/mentor/mentorScriptBlogView';
import { useTourModalControl, useSkipHiddenSteps } from 'src/hooks/useTourModalControl';

import 'driver.js/dist/driver.css';
import 'src/mentor/driver-custom.css';

// Firebase imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, setDoc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import {  useRef } from 'react';

interface ModalStates {
  [key: string]: boolean;
}

interface TourStep {
  target: string;
  text: string;
  pauseForModal?: string;
  requireModalClose?: boolean;
  onModalContent?: boolean;
  showAfterModalClose?: string;
  [key: string]: any;
}









// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
apiKey: "AIzaSyBNCXIOAX2HUdeLvUxkTJh7DVbv8JU485s",
authDomain: "goalgrid-c5e9c.firebaseapp.com",
projectId: "goalgrid-c5e9c",
storageBucket: "goalgrid-c5e9c.firebasestorage.app",
databaseURL: "https://goalgrid-c5e9c-default-rtdb.firebaseio.com",
messagingSenderId: "544004357501",
appId: "1:544004357501:web:4b81a3686422b28534e014",
measurementId: "G-BJQMLK9JJ1"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================================================
// CONSTANTS & PREDEFINED DATA
// ============================================================================

const TourPopover = ({ step, currentStep, totalSteps, onNext, onSkip }) => {
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef(null);

  useEffect(() => {
  if (!step) return;

  const targetElement = document.querySelector(step.target);
  if (!targetElement) return;

  // Scroll to element first and wait for it to complete
  targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

  // Add highlight class
  targetElement.classList.add('tour-highlight-element');

  // Calculate popover position AFTER a delay to let scroll finish
  const updatePosition = () => {
    const rect = targetElement.getBoundingClientRect();
    const popoverHeight = popoverRef.current?.offsetHeight || 200;
    const popoverWidth = 350;

    let top, left;

    switch (step.position) {
      case 'top':
        top = rect.top - popoverHeight - 10;
        left = rect.left + (rect.width / 2) - (popoverWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + (rect.width / 2) - (popoverWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (popoverHeight / 2);
        left = rect.left - popoverWidth - 10;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (popoverHeight / 2);
        left = rect.right + 10;
        break;
      default:
        top = rect.bottom + 10;
        left = rect.left + (rect.width / 2) - (popoverWidth / 2);
    }

    // Ensure popover stays within viewport
    if (top < 10) top = 10;
    if (left < 10) left = 10;
    if (left + popoverWidth > window.innerWidth - 10) {
      left = window.innerWidth - popoverWidth - 10;
    }

    setPopoverPosition({ top, left });
  };

  // Wait for scroll animation to complete before positioning
  setTimeout(updatePosition, 300);
  
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition);

  return () => {
    targetElement.classList.remove('tour-highlight-element');
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition);
  };
}, [step]);


  if (!step) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-[102] pointer-events-auto"
      style={{
        top: `${popoverPosition.top}px`,
        left: `${popoverPosition.left}px`,
        maxWidth: '350px',
        minWidth: '300px',
      }}
    >
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-2xl border-2 border-purple-400/50 p-5 backdrop-blur-xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx < currentStep ? 'w-8 bg-yellow-400' : 'w-4 bg-purple-300/30'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-purple-200">
            {currentStep}/{totalSteps}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-yellow-300 mb-2">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-white text-sm leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm text-purple-200 hover:text-white transition-colors"
          >
            Skip Tour
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
          >
            {currentStep === totalSteps ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Got It!
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pointer Arrow */}
      <div
        className="absolute w-4 h-4 bg-gradient-to-br from-purple-600 to-indigo-600 transform rotate-45 border-r-2 border-b-2 border-purple-400/50"
        style={{
          [step.position === 'top' ? 'bottom' : 'top']: '-8px',
          left: '50%',
          marginLeft: '-8px',
          ...(step.position === 'bottom' && { 
            borderRight: 'none', 
            borderBottom: 'none', 
            borderLeft: '2px solid rgba(192, 132, 252, 0.5)', 
            borderTop: '2px solid rgba(192, 132, 252, 0.5)' 
          }),
        }}
      />
    </div>
  );
};


const ACTIVITY_CATEGORIES = [
{
name: 'Martial Arts',
icon: '🥋',
examples: ['Muay Thai', 'Boxing', 'Jiu-Jitsu', 'Karate', 'Taekwondo'],
anxietyRating: 'Medium',
socialStyle: 'Task-focused with partner work',
description: 'Physical activity with structured interaction'
},
{
name: 'Fitness Classes',
icon: '💪',
examples: ['CrossFit', 'Spin Class', 'Yoga', 'Pilates', 'Boot Camp'],
anxietyRating: 'Low-Medium',
socialStyle: 'Minimal required interaction',
description: 'Group exercise with individual focus'
},
{
name: 'Climbing',
icon: '🧗',
examples: ['Bouldering', 'Rock Climbing', 'Indoor Climbing'],
anxietyRating: 'Low',
socialStyle: 'Natural conversation while climbing',
description: 'Problem-solving with casual social opportunities'
},
{
name: 'Team Sports',
icon: '⚽',
examples: ['Soccer', 'Basketball', 'Volleyball', 'Ultimate Frisbee'],
anxietyRating: 'Medium-High',
socialStyle: 'Active team coordination',
description: 'Collaborative play with ongoing communication'
},
{
name: 'Dance',
icon: '💃',
examples: ['Salsa', 'Hip Hop', 'Ballroom', 'Contemporary'],
anxietyRating: 'Medium',
socialStyle: 'Structured partner/group interaction',
description: 'Expressive movement with guided socializing'
},
{
name: 'Art Classes',
icon: '🎨',
examples: ['Painting', 'Pottery', 'Drawing', 'Sculpture'],
anxietyRating: 'Low',
socialStyle: 'Quiet focus with optional chat',
description: 'Creative work with relaxed social atmosphere'
},
];

const BREATHING_EXERCISES = [
{
name: '4-7-8 Breathing',
duration: '2 min',
steps: ['Breathe in through nose for 4 seconds', 'Hold breath for 7 seconds', 'Exhale through mouth for 8 seconds', 'Repeat 4 times'],
benefit: 'Activates relaxation response'
},
{
name: 'Box Breathing',
duration: '3 min',
steps: ['Inhale for 4 counts', 'Hold for 4 counts', 'Exhale for 4 counts', 'Hold for 4 counts', 'Repeat'],
benefit: 'Used by Navy SEALs for stress'
},
{
name: 'Deep Belly Breathing',
duration: '2 min',
steps: ['Place hand on belly', 'Breathe deeply into belly (not chest)', 'Feel hand rise and fall', 'Breathe slowly for 2 minutes'],
benefit: 'Calms nervous system quickly'
},
];

const THOUGHT_REFRAMES = [
{
anxiousThought: 'Everyone will judge me',
reframe: 'Most people are focused on themselves, not judging you. Everyone was a beginner once.',
icon: '👥'
},
{
anxiousThought: "I'll be the worst one there",
reframe: "Being a beginner is expected and respected. You're there to learn, not to be perfect.",
icon: '🌱'
},
{
anxiousThought: "I'll embarrass myself",
reframe: 'Making mistakes is part of learning. Nobody remembers small slip-ups except you.',
icon: '💪'
},
{
anxiousThought: "I don't belong there",
reframe: 'You signed up, so you DO belong. Everyone feels this way at first.',
icon: '✨'
},
{
anxiousThought: 'What if I panic or freeze?',
reframe: "You can always take a break, leave early, or go at your own pace. You're in control.",
icon: '🛡️'
},
];

const FIRST_TIMER_TIPS = {
'Muay Thai': [
'Arrive 10-15 minutes early to introduce yourself',
"Don't worry about gear - most gyms lend wraps/gloves for first class",
'Everyone expects beginners to struggle with combinations',
'The soreness tomorrow means you pushed yourself!',
'Partners are usually supportive and helpful'
],
'Boxing': [
'Basic jab-cross is all you need to know at first',
'Wrap your hands properly - ask for help!',
"Don't compare yourself to experienced boxers",
'Focus on form over power at first',
'Take water breaks whenever needed'
],
'Yoga': [
'Tell instructor if first class - they\'ll give modifications',
'Stay in child\'s pose anytime you need a break',
'Nobody cares if you can\'t do a pose',
'Bring water and arrive early for good spot',
'Flexibility comes with time - be patient'
],
'CrossFit': [
'All workouts are scalable to your level',
'Form matters more than speed/weight',
'Everyone was intimidated their first day',
'Ask questions - community is usually friendly',
'Listen to your body and modify as needed'
],
'default': [
'Arrive a few minutes early',
'Introduce yourself to instructor',
'Let them know it\'s your first time',
'Nobody expects perfection from beginners',
'You can take breaks anytime you need'
]
};

const ACHIEVEMENTS = [
{ id: 'first_step', title: 'First Step', description: 'Scheduled your first activity', icon: '🌟', threshold: 1, type: 'scheduled' },
{ id: 'showed_up', title: 'Showed Up!', description: 'Completed your first activity despite nerves', icon: '🎯', threshold: 1, type: 'completed' },
{ id: 'three_times', title: 'Building Momentum', description: 'Completed 3 activities', icon: '🔥', threshold: 3, type: 'completed' },
{ id: 'week_streak', title: 'Week Warrior', description: 'Attended for 7 days straight', icon: '⚡', threshold: 7, type: 'streak' },
{ id: 'anxiety_slayer', title: 'Anxiety Slayer', description: 'Your anxiety dropped 50% from first class', icon: '🗡️', threshold: 50, type: 'anxiety_drop' },
{ id: 'ten_complete', title: 'Veteran', description: 'Completed 10 activities', icon: '👑', threshold: 10, type: 'completed' },
{ id: 'comfort_zone', title: 'Comfort Zone Expander', description: 'Tried 3 different activity types', icon: '🚀', threshold: 3, type: 'variety' },
];

const MOTIVATIONAL_QUOTES = [
"Courage is not the absence of fear, but action in spite of it.",
"You're not going to die. You're going to learn.",
"Everyone you admire started as a nervous beginner.",
"The anticipation is always worse than the reality.",
"Your future self will thank you for showing up.",
"Discomfort is temporary. Regret lasts longer.",
"You've survived 100% of your scary situations so far.",
"Growth happens outside your comfort zone.",
];

const SITUATION_TYPES = [
  { id: 'medical', name: 'Medical Appointment', icon: '🏥', color: 'red' },
  { id: 'social', name: 'Social Event', icon: '🎉', color: 'pink' },
  { id: 'work', name: 'Work/School', icon: '💼', color: 'blue' },
  { id: 'public', name: 'Public Place (Gym, Store)', icon: '🏪', color: 'green' },
  { id: 'phone', name: 'Phone Call', icon: '📞', color: 'purple' },
  { id: 'other', name: 'Other', icon: '🎯', color: 'indigo' }
];

const PREP_KITS = {
  medical: {
    sections: [
      { 
        title: 'Symptom Documentation', 
        items: ['When symptoms started', 'Frequency and duration', 'What makes it better/worse', 'Current severity (1-10)']
      },
      { 
        title: 'Questions to Ask', 
        items: ['What tests do you recommend?', 'What are treatment options?', 'What should I watch for?', 'When should I follow up?']
      },
      { 
        title: 'Your Rights', 
        items: ['You can request specific tests', 'You can ask for second opinions', 'You can request copies of records', 'You can bring someone with you']
      },
      {
        title: 'Communication Scripts',
        items: [
          '"I\'ve been experiencing [X] for [timeframe]"',
          '"I\'m concerned about [specific worry]"',
          '"Can you explain that in simpler terms?"',
          '"I\'d like to discuss [treatment/test] options"'
        ]
      }
    ]
  },
  social: {
    sections: [
      {
        title: 'Conversation Starters',
        items: [
          'How do you know [host/organizer]?',
          'Have you been to one of these before?',
          'What brought you here tonight?',
          'That\'s an interesting [accessory/item] - where\'d you get it?'
        ]
      },
      {
        title: 'Exit Strategies',
        items: [
          'Bathroom break (take your time)',
          '"I need to make a quick call"',
          '"I have an early morning tomorrow"',
          'Help the host with something',
          'Just leave - it\'s okay!'
        ]
      },
      {
        title: 'Reality Checks',
        items: [
          'People are focused on themselves, not judging you',
          'Silences in conversation are normal',
          'You don\'t need to be "on" the whole time',
          'Leaving early is completely acceptable'
        ]
      }
    ]
  },
  work: {
    sections: [
      {
        title: 'Professional Scripts',
        items: [
          '"I\'d like to schedule time to discuss [topic]"',
          '"Can I get clarification on [specific thing]?"',
          '"I need [resource/time] to complete this well"',
          '"I have a different perspective on this..."'
        ]
      },
      {
        title: 'Assertiveness Tips',
        items: [
          'Use "I" statements',
          'State facts, not emotions first',
          'Offer solutions, not just problems',
          'It\'s okay to say "I need to think about that"'
        ]
      }
    ]
  },
  public: {
    sections: [
      {
        title: 'What People Actually Notice',
        items: [
          'Almost nothing about you specifically',
          'They\'re focused on their own workout/shopping',
          'If they notice you, they forget in 30 seconds',
          'Everyone was a beginner once'
        ]
      },
      {
        title: 'Practical Tips',
        items: [
          'Go during off-peak hours first',
          'Familiarize yourself with layout online',
          'Have a specific plan/list',
          'Headphones are your friend',
          'Set a time limit (just 15 minutes is enough)'
        ]
      }
    ]
  }
};

const GROUNDING_TECHNIQUES = [
  {
    name: '5-4-3-2-1 Technique',
    steps: ['5 things you can see', '4 things you can touch', '3 things you can hear', '2 things you can smell', '1 thing you can taste']
  },
  {
    name: 'Body Scan',
    steps: ['Notice your feet on the ground', 'Feel your back against the chair', 'Notice your hands', 'Relax your shoulders', 'Soften your jaw']
  },
  {
    name: 'Countdown',
    steps: ['Count backwards from 100 by 7s', 'Or name categories (colors, cities, animals)', 'Focus on the mental task', 'Brings you back to present']
  }
];

const INTERACTION_PLANNER_TOUR_STEPS = [
  {
    step: 1,
    target: '#exposure-hierarchy-section',
    title: '📈 Exposure Hierarchy',
    description: 'Build your personalized fear ladder - rank situations from easiest to hardest!',
    position: 'bottom',
  },
  {
    step: 2,
    target: '.grid.grid-cols-2.md\\:grid-cols-3.gap-3',
    title: '🎭 Choose Situation Type',
    description: 'Pick the type that matches your planned interaction - medical, social, work, public, or phone calls.',
    position: 'top',
  },
  {
    step: 3,
    target: 'input[placeholder*="Doctor appointment"]',
    title: '✏️ Be Specific',
    description: '"Doctor appointment for persistent cough" is better than just "doctor". Specificity helps you prepare!',
    position: 'top',
  },
  {
    step: 4,
    target: 'input[type="date"]',
    title: '📆 Schedule It',
    description: 'Set a date and time. Having a set appointment makes it real and gives you time to prepare.',
    position: 'top',
  },
  {
    step: 5,
    target: 'input[type="range"]',
    title: '😰 Rate Your Anxiety',
    description: 'How difficult does this feel RIGHT NOW? You\'ll compare this to how you feel AFTER!',
    position: 'top',
  },
  {
    step: 6,
    target: 'textarea[placeholder*="health concerns"]',
    title: '❓ Your "Why"',
    description: 'When anxiety spikes and you want to cancel, this reminder will keep you going.',
    position: 'top',
  },
  {
    step: 7,
    target: '#prep-kit-btn',
    title: '🎒 Prep Kit',
    description: 'Get situation-specific scripts, questions to ask, and reality checks. Click here when you need help preparing!',
    position: 'top',
  },
  {
    step: 8,
    target: '.grid.grid-cols-2.md\\:grid-cols-4.gap-3',
    title: '🛠️ Quick Tools',
    description: 'Breathing, reframing, discovery, and motivation - all one click away!',
    position: 'top',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================



const calculateStreak = (activities) => {
if (activities.length === 0) return 0;

const completedActivities = activities
.filter(a => a.completed && a.completedDate)
.sort((a, b) => b.completedDate - a.completedDate);

if (completedActivities.length === 0) return 0;

const today = new Date().setHours(0, 0, 0, 0);
const oneDayMs = 24 * 60 * 60 * 1000;

let streak = 0;
let currentDate = today;

for (const activity of completedActivities) {
const activityDate = new Date(activity.completedDate).setHours(0, 0, 0, 0);
const diffDays = Math.floor((currentDate - activityDate) / oneDayMs);

if (diffDays === 0 || diffDays === 1) {
if (diffDays === 1) streak++;
currentDate = activityDate;
} else {
break;
}
}

return streak;
};

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnxietyActivityTracker() {

  // Inline tour for Interaction Planner
const [interactionPlannerTourStep, setInteractionPlannerTourStep] = useState(0);
const [hasSeenInteractionPlannerTour, setHasSeenInteractionPlannerTour] = useState(() => {
  return localStorage.getItem('hasSeenInteractionPlannerTour') === 'true';
});

const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [activities, setActivities] = useState([]);
const [showNewActivity, setShowNewActivity] = useState(false);
const [showBreathing, setShowBreathing] = useState(false);
const [showReframing, setShowReframing] = useState(false);
const [showDiscovery, setShowDiscovery] = useState(false);
const [notification, setNotification] = useState(null);
const [showOnboarding, setShowOnboarding] = useState(true);
const [selectedBreathing, setSelectedBreathing] = useState(null);
const [breathingTimer, setBreathingTimer] = useState(0);
const [breathingActive, setBreathingActive] = useState(false);

// New activity form
const [newActivityName, setNewActivityName] = useState('');
const [newActivityType, setNewActivityType] = useState('');
const [newActivityDate, setNewActivityDate] = useState('');
const [newActivityTime, setNewActivityTime] = useState('');
const [newActivityWhy, setNewActivityWhy] = useState('');
const [preAnxiety, setPreAnxiety] = useState(5);

// Check-in form
const [checkInActivity, setCheckInActivity] = useState(null);
const [postAnxiety, setPostAnxiety] = useState(5);
const [reflection, setReflection] = useState('');
const [wasItBad, setWasItBad] = useState('');

const [activeInteraction, setActiveInteraction] = useState(null);
const [interactionTimer, setInteractionTimer] = useState(0);
const [plannerTab, setPlannerTab] = useState('plan'); // 'ladder'|'plan'|'prep'|'history'
const [planActionSteps, setPlanActionSteps] = useState([]);
const [newActionStep, setNewActionStep] = useState('');
const [expandedInteraction, setExpandedInteraction] = useState(null);


const [exposureHierarchy, setExposureHierarchy] = useState([]);
const [selectedInteraction, setSelectedInteraction] = useState(null);
const [duringInteractionMode, setDuringInteractionMode] = useState(null);
const [interactionStartTime, setInteractionStartTime] = useState(null);

const [achievementsOpen, setAchievementsOpen] = useState(false);

const [onboardingStep, setOnboardingStep] = useState(1); // 1=welcome, 2=goal, 3=baseline
const [userGoal, setUserGoal] = useState(''); // 'social' | 'medical' | 'general'
const [baselineAnxiety, setBaselineAnxiety] = useState(6);
const [onboardingComplete, setOnboardingComplete] = useState(() => {
  return localStorage.getItem('onboardingComplete') === 'true';
});


const [planStep, setPlanStep] = useState(0);
const [planDraft, setPlanDraft] = useState({
  type: '', typeName: '', name: '',
  date: '', time: '', anxiety: 5,
  why: '', actionSteps: [],
});
const [planNewStep, setPlanNewStep] = useState('');
 
// Helper — resets the funnel back to step 1
const resetPlanFunnel = () => {
  setPlanStep(1);
  setPlanDraft({ type:'', typeName:'', name:'', date:'', time:'', anxiety:5, why:'', actionSteps:[] });
  setPlanNewStep('');
};



const active = useMentorStore((s) => s.active);
const stepIndex = useMentorStore((s) => s.stepIndex);
const { startJourney } = useMentorStore();

const setStepIndex = useMentorStore((s) => s.setStepIndex);


// Tour modal control
const { isBlocked } = useTourModalControl({
  currentStepIndex: stepIndex,
  tourSteps: mentorScriptBlogView,
  modalStates: {
    showBreathing,
    showReframing,
    showDiscovery,
    

  },
  isTourActive: active,
});

// Skip hidden steps - NO onStepChange parameter  
// Skip hidden steps
useSkipHiddenSteps(
  stepIndex,
  mentorScriptBlogView,
  {
    showBreathing,
    showReframing,
    showDiscovery,

  },
  active  // ✅ Only 4 parameters now, not 5
);


// Block tour when modal is open
// Block tour when modal is open

// ✅ Sync modal states to mentor store
useEffect(() => {
  if (!active) return;
  
  useMentorStore.setState({
    showBreathing,
    showReframing,
    showDiscovery,
 
  });
}, [active, showBreathing, showReframing, showDiscovery]);

// Auto-start inline tour on first modal open

useEffect(() => {
  if (!active) return;  // ✅ Use Zustand state

  const handleClick = (e: any) => {
    const target = e.target as HTMLElement;
    const isNext = target.closest('.driver-popover-next-btn');
    
    if (isNext) {
      const step = mentorScriptBlogView[stepIndex];  // ✅ Use Zustand state
      if (step?.requireModalClose && step?.pauseForModal) {
        const modalStates: any = {
          showBreathing,
          showReframing,
          showDiscovery,
          
        };
        if (modalStates[step.pauseForModal]) {
          e.preventDefault();
          e.stopPropagation();
          alert('Please close the modal to continue the tour.');
          return;
        }
      }
      setStepIndex(stepIndex + 1);  // ✅ Use Zustand setter
    }
  };

  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}, [active, stepIndex, showBreathing, showReframing, showDiscovery, setStepIndex]);  // ✅ Updated dependencies
// ✅ NEW: Auto-dismiss onboarding when tour starts
useEffect(() => {
  if (active) {
    setShowOnboarding(false);
  }
}, [active]);


// Sync tour state
// ✅ Sync modal states to Zustand whenever they change


// ADD THIS NEW useEffect:
useEffect(() => {
  if (!active) return;
  
  // Detect when breathing modal closes
  if (!showBreathing) {
    const currentStep = mentorScriptBlogView[stepIndex];
    if (currentStep?.onModalContent && currentStep?.target === '.space-y-3') {
      setTimeout(() => {
        setStepIndex(stepIndex + 1);
      }, 500);
    }
  }
}, [showBreathing, active, stepIndex]);



// ============================================================================
// FIREBASE AUTHENTICATION
// ============================================================================

useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
if (currentUser) {
setUser(currentUser);
setLoading(false);
} else {
setLoading(false);
}
});

return () => unsubscribe();
}, []);

useEffect(() => {
  if (!activeInteraction) return;

  const interval = setInterval(() => {
    setInteractionTimer(prev => prev + 1);
  }, 1000);

  return () => clearInterval(interval);
}, [activeInteraction]);





const handleGoogleSignIn = async () => {
try {
setLoading(true);
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
setUser(result.user);
showNotification(`Welcome, ${result.user.displayName || 'User'}! 🎉`);
} catch (error) {
console.error('Google sign in failed:', error);
showNotification('Sign in failed. Please try again.');
} finally {
setLoading(false);
}
};

const handleSignOut = async () => {
if (!user) return;
await signOut(auth);
setUser(null);
setActivities([]);
};

// ============================================================================
// FIREBASE DATA SYNC
// ============================================================================

useEffect(() => {
    if (!user) return;

    const activitiesCollection = collection(db, 'users', user.uid, 'activities');
    const q = query(activitiesCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched activities:', activitiesArray); // Debug log
      setActivities(activitiesArray);
    }, (error) => {
      console.error('Error fetching activities:', error);
      showNotification('Error loading activities');
    });

    return () => unsubscribe();
  }, [user]);


  useEffect(() => {
  if (!active) return;

  const handleClick = (e: any) => {
    const target = e.target as HTMLElement;
    const isNext = target.closest('.driver-popover-next-btn');
    
    if (isNext) {
      const currentStep = mentorScriptBlogView[stepIndex];
      const nextStep = mentorScriptBlogView[stepIndex + 1];
      
      // ✅ If leaving a modal step, close the modal first
      if (currentStep?.onModalContent && !nextStep?.onModalContent) {
        // Close whichever modal is open
        if (showBreathing) setShowBreathing(false);
        if (showReframing) setShowReframing(false);
        if (showDiscovery) setShowDiscovery(false);
        
        
        // Wait for modal to close, then advance
        setTimeout(() => {
          setStepIndex(stepIndex + 1);
        }, 300);
      } else {
        // Normal advancement
        setStepIndex(prev => prev + 1);
      }
    }
  };

  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}, [active, stepIndex, showBreathing, showReframing, showDiscovery]);
// ============================================================================
// FIREBASE OPERATIONS
// ============================================================================


const saveActivityToFirebase = async (activity) => {
if (!user) return;
const activitiesCollection = collection(db, 'users', user.uid, 'activities');
const newDoc = doc(activitiesCollection);
await setDoc(newDoc, activity);
};

const updateActivityInFirebase = async (activityId, updates) => {
if (!user) return;
const activityDoc = doc(db, 'users', user.uid, 'activities', activityId);
await updateDoc(activityDoc, updates);
};

const deleteActivityFromFirestore = async (activityId) => {
if (!user) return;
const activityDoc = doc(db, 'users', user.uid, 'activities', activityId);
await deleteDoc(activityDoc);
};

const saveExposureHierarchyToFirebase = async (hierarchy) => {
  if (!user) return;
  const hierarchyDoc = doc(db, 'users', user.uid, 'settings', 'exposureHierarchy');
  await setDoc(hierarchyDoc, { items: hierarchy, updatedAt: Date.now() });
};

const saveInteractionToFirebase = async (interaction) => {
  if (!user) return;
  const interactionsCollection = collection(db, 'users', user.uid, 'interactions');
  const newDoc = doc(interactionsCollection);
  await setDoc(newDoc, interaction);
};

const handleNextTourStep = () => {
  if (interactionPlannerTourStep < INTERACTION_PLANNER_TOUR_STEPS.length) {
    setInteractionPlannerTourStep(prev => prev + 1);
  } else {
    // Tour complete
    setInteractionPlannerTourStep(0);
    setHasSeenInteractionPlannerTour(true);
    localStorage.setItem('hasSeenInteractionPlannerTour', 'true');
    
    // ⭐ DISPATCH EVENT TO NOTIFY MAIN TOUR
    window.dispatchEvent(new CustomEvent('inlineTourCompleted', { 
      detail: { tourName: 'interactionPlanner' } 
    }));
  }
};


const saveUserProfile = async (profile) => {
  if (!user) return;
  const profileDoc = doc(db, 'users', user.uid, 'settings', 'profile');
  await setDoc(profileDoc, { ...profile, updatedAt: Date.now() });
};
 
// This function auto-seeds the exposure hierarchy with starter steps
// based on the user's chosen goal. Call it inside completeOnboarding below.
const seedStarterHierarchy = async (goal) => {
  if (!user) return;
 
  const starterSteps = {
    social: [
      { description: 'Make eye contact and smile at a stranger', difficulty: 2 },
      { description: 'Say hello to someone new at an event', difficulty: 4 },
      { description: 'Attend a group class or activity alone', difficulty: 6 },
      { description: 'Introduce yourself to someone and keep a conversation going', difficulty: 8 },
    ],
    medical: [
      { description: 'Look up a doctor or clinic online without calling', difficulty: 2 },
      { description: 'Call to book an appointment (can hang up if needed)', difficulty: 4 },
      { description: 'Attend the appointment and answer basic questions', difficulty: 6 },
      { description: 'Ask the doctor a question you prepared in advance', difficulty: 8 },
    ],
    general: [
      { description: 'Identify one situation you\'ve been avoiding', difficulty: 2 },
      { description: 'Go somewhere slightly outside your comfort zone for 10 min', difficulty: 4 },
      { description: 'Stay in an uncomfortable situation until anxiety drops naturally', difficulty: 6 },
      { description: 'Face your biggest avoided situation with a plan', difficulty: 8 },
    ],
  };
 
  const steps = (starterSteps[goal] || starterSteps.general).map((s, i) => ({
    id: `starter_${i}_${Date.now()}`,
    ...s,
    status: 'pending',
    dateAdded: Date.now(),
    completedDate: null,
    attempts: 0,
    notes: [],
  }));
 
  const hierarchyDoc = doc(db, 'users', user.uid, 'settings', 'exposureHierarchy');
  await setDoc(hierarchyDoc, { items: steps, updatedAt: Date.now() });
  setExposureHierarchy(steps);
};


const handleSkipTour = () => {
  setInteractionPlannerTourStep(0);
  setHasSeenInteractionPlannerTour(true);
  localStorage.setItem('hasSeenInteractionPlannerTour', 'true');
  
  // ⭐ DISPATCH EVENT TO NOTIFY MAIN TOUR
  window.dispatchEvent(new CustomEvent('inlineTourCompleted', { 
    detail: { tourName: 'interactionPlanner' } 
  }));
};



const getCurrentTourStep = () => {
  if (interactionPlannerTourStep === 0) return null;
  return INTERACTION_PLANNER_TOUR_STEPS[interactionPlannerTourStep - 1];
};


// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

const showNotification = (message) => {
setNotification(message);
setTimeout(() => setNotification(null), 3000);
};

// ============================================================================
// ACTIVITY HANDLERS
// ============================================================================

const createNewActivity = async () => {
  if (!newActivityName.trim() || !newActivityDate || !newActivityTime) {
    showNotification('Please fill in all required fields');
    return;
  }

  // FIX: Properly combine date and time
  const dateTimeString = `${newActivityDate}T${newActivityTime}`;
  const scheduledDateTime = new Date(dateTimeString).getTime();
  
  // Validate the timestamp
  if (isNaN(scheduledDateTime)) {
    showNotification('Invalid date/time selected');
    return;
  }

  const activity = {
    name: newActivityName.trim(),
    type: newActivityType || 'Other',
    scheduledDate: scheduledDateTime,
    why: newActivityWhy.trim(),
    preAnxiety: preAnxiety,
    completed: false,
    createdAt: Date.now()
  };

  await saveActivityToFirebase(activity);

  // Reset form
  setNewActivityName('');
  setNewActivityType('');
  setNewActivityDate('');
  setNewActivityTime('');
  setNewActivityWhy('');
  setPreAnxiety(5);
  setShowNewActivity(false);

  showNotification('🎯 Activity scheduled! You got this!');
  console.log('Upcoming activities:', upcomingActivities);
console.log('All activities:', activities);
};

const completeActivity = async () => {
if (!checkInActivity) return;

await updateActivityInFirebase(checkInActivity.id, {
completed: true,
completedDate: Date.now(),
postAnxiety: postAnxiety,
reflection: reflection.trim(),
wasItBad: wasItBad
});

const anxietyDrop = checkInActivity.preAnxiety - postAnxiety;
let message = '🎉 You did it! ';
if (anxietyDrop > 3) message += 'Your anxiety dropped significantly!';
else if (anxietyDrop > 0) message += 'You faced your fears!';
else message += 'You showed up despite the nerves!';

showNotification(message);

// Reset check-in form
setCheckInActivity(null);
setPostAnxiety(5);
setReflection('');
setWasItBad('');
};

// ============================================================================
// COMPUTED VALUES
// ============================================================================

const upcomingActivities = activities.filter(a => !a.completed && a.scheduledDate > Date.now());
const completedActivities = activities.filter(a => a.completed).sort((a, b) => b.completedDate - a.completedDate);
const nextActivity = upcomingActivities[0];

const stats = useMemo(() => {
const completed = activities.filter(a => a.completed);
const totalCompleted = completed.length;
const currentStreak = calculateStreak(activities);

const avgPreAnxiety = completed.length > 0
? (completed.reduce((sum, a) => sum + (a.preAnxiety || 0), 0) / completed.length).toFixed(1)
: 0;

const avgPostAnxiety = completed.length > 0
? (completed.reduce((sum, a) => sum + (a.postAnxiety || 0), 0) / completed.length).toFixed(1)
: 0;

const anxietyDrop = (avgPreAnxiety - avgPostAnxiety).toFixed(1);

const uniqueTypes = new Set(completed.map(a => a.type)).size;

return {
totalCompleted,
currentStreak,
avgPreAnxiety,
avgPostAnxiety,
anxietyDrop,
uniqueTypes
};
}, [activities]);

const achievementsData = useMemo(() => {
return ACHIEVEMENTS.map(achievement => {
let progress = 0;
let unlocked = false;

switch (achievement.type) {
case 'scheduled':
progress = activities.length;
unlocked = activities.length >= achievement.threshold;
break;
case 'completed':
progress = stats.totalCompleted;
unlocked = stats.totalCompleted >= achievement.threshold;
break;
case 'streak':
progress = stats.currentStreak;
unlocked = stats.currentStreak >= achievement.threshold;
break;
case 'anxiety_drop':
progress = Math.abs(parseFloat(stats.anxietyDrop));
unlocked = Math.abs(parseFloat(stats.anxietyDrop)) >= achievement.threshold;
break;
case 'variety':
progress = stats.uniqueTypes;
unlocked = stats.uniqueTypes >= achievement.threshold;
break;
}

return { ...achievement, progress, unlocked };
});
}, [activities, stats]);

// ============================================================================
// BREATHING EXERCISE TIMER
// ============================================================================


useEffect(() => {
if (!breathingActive) return;

const interval = setInterval(() => {
setBreathingTimer(prev => prev + 1);
}, 1000);

return () => clearInterval(interval);
}, [breathingActive]);

useEffect(() => {
  if (!user) return;
  
  const hierarchyDoc = doc(db, 'users', user.uid, 'settings', 'exposureHierarchy');
  const unsubscribe = onSnapshot(hierarchyDoc, (doc) => {
    if (doc.exists()) {
      setExposureHierarchy(doc.data().items || []);
    }
  });
  
  return () => unsubscribe();
}, [user]);

const startBreathingExercise = (exercise) => {
setSelectedBreathing(exercise);
setBreathingTimer(0);
setBreathingActive(true);
};

const stopBreathingExercise = () => {
setBreathingActive(false);
setSelectedBreathing(null);
setBreathingTimer(0);
showNotification('Great work! You should feel calmer now 🌸');
};


const addActionStep = () => {
  if (!newActionStep.trim()) return;
  setPlanActionSteps(prev => [...prev, {
    id: Date.now().toString(),
    text: newActionStep.trim(),
    completed: false,
  }]);
  setNewActionStep('');
};
 
const toggleActionStep = (id) => {
  setPlanActionSteps(prev =>
    prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
  );
};
 
const removeActionStep = (id) => {
  setPlanActionSteps(prev => prev.filter(s => s.id !== id));
};


// ============================================================================
// LOADING STATE
// ============================================================================

if (loading) {
return (
<div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950 text-white flex items-center justify-center">
<div className="text-center">
<Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
<p className="text-xl text-purple-200">Loading...</p>
</div>
</div>
);
}

// ============================================================================
// SIGN IN PAGE
// ============================================================================

if (!user) {
return (
<div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950 text-white flex items-center justify-center p-4">
<div className="max-w-md w-full">
<div className="text-center mb-12">
<div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-purple-800/40 backdrop-blur-sm rounded-full border border-purple-500/30">
<Heart className="w-5 h-5 text-pink-300" />
<span className="text-sm font-medium text-purple-200">Anxiety Activity Tracker</span>
</div>

<h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent">
Face Your Fears
</h1>

<p className="text-lg text-purple-200 mb-8">
Track activities you're nervous about. See your anxiety decrease over time.
</p>
</div>

<div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-md p-8 rounded-3xl border-2 border-purple-500/30 shadow-2xl">
<h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome!</h2>
<p className="text-purple-300 text-center mb-6">Sign in to start tracking</p>

<button
onClick={handleGoogleSignIn}
className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
>
<svg className="w-6 h-6" viewBox="0 0 24 24">
<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
</svg>
Sign in with Google
</button>
</div>

<div className="mt-8 text-center">
<p className="text-purple-400 text-sm italic">
"{MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]}"
</p>
</div>
</div>
</div>
);
}

// ============================================================================
// RENDER MAIN APP
// ============================================================================

return (
<div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950 text-white pb-20">


{active&& isBlocked && (
  <div className="fixed top-20 right-4 px-4 py-3 bg-yellow-600 rounded-xl text-white text-sm font-semibold shadow-2xl z-50 animate-pulse">
    ⏸️ Close the modal to continue
  </div>
)}

{/* HEADER */}
<div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900/95 via-purple-800/95 to-pink-900/95 backdrop-blur-md border-b-2 border-purple-500/30 shadow-2xl">
<div className="px-6 py-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
{user?.photoURL ? (
<img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-purple-400 shadow-lg" />
) : (
<div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center border-2 border-purple-400">
<User className="w-5 h-5" />
</div>
)}
<div>
<p className="text-base font-bold text-purple-100">{user?.displayName || 'User'}</p>
<p className="text-xs text-purple-300">{stats.totalCompleted} completed</p>
</div>
</div>

<div className="flex items-center gap-3">
<div className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 rounded-full border border-orange-400/30">
<Flame className="w-4 h-4 text-orange-400" />
<span className="text-sm font-bold text-orange-100">{stats.currentStreak}</span>
</div>

        <button
          onClick={() => {
            localStorage.removeItem('anxiety-tracker-tour-seen');
            startJourney(mentorScriptBlogView);
          }}
          className="p-2.5 bg-purple-800/40 hover:bg-purple-700/40 rounded-xl border border-purple-500/30 transition-all"
          title="Restart Tour"
        >
          <Lightbulb className="w-5 h-5 text-purple-300" />
        </button>

        <button
          onClick={handleSignOut}
          className="p-2.5 bg-purple-800/40 hover:bg-purple-700/40 rounded-xl border border-purple-500/30 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
</div>
</div>
</div>
</div>

<div className="p-6 pt-16 max-w-6xl mx-auto">

{/* WELCOME SECTION */}
<div className="mb-8">
<h1 className="text-4xl font-bold text-purple-100 mb-2">
Hey {user?.displayName?.split(' ')[0] || 'there'}! 👋
</h1>


<p className="text-base text-purple-200 italic">
"{MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]}"
</p>
</div>

{/* NEXT ACTIVITY COUNTDOWN */}
{nextActivity && (
<div data-tour="next-challenge" className="mb-8">
<div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 backdrop-blur-md rounded-3xl border-2 border-pink-500/30 shadow-2xl p-6">
<div className="flex items-center gap-3 mb-4">
<div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
<Target className="w-6 h-6 text-white" />
</div>
<div>
<h2 className="text-2xl font-bold text-white">Next Challenge</h2>
<p className="text-sm text-purple-300">You've got this!</p>
</div>
</div>

<div className="bg-purple-950/30 rounded-2xl p-5 mb-4">
<div className="flex items-start justify-between mb-3">
<div className="flex-1">
<h3 className="text-2xl font-bold text-white mb-2">{nextActivity.name}</h3>
<div className="flex items-center gap-2 text-purple-300 text-sm mb-2">
<span className="text-2xl">{ACTIVITY_CATEGORIES.find(c => c.name === nextActivity.type)?.icon || '🎯'}</span>
<span>{nextActivity.type}</span>
</div>
<p className="text-sm text-purple-400">{new Date(nextActivity.scheduledDate).toLocaleString()}</p>
</div>
<div className="text-right">
<div className="text-4xl font-bold text-pink-400 mb-1">
{getTimeUntil(nextActivity.scheduledDate)}
</div>
<p className="text-xs text-purple-300">until start</p>
</div>
</div>

{nextActivity.why && (
<div className="p-3 bg-purple-900/30 rounded-xl border border-purple-700/30">
<p className="text-sm text-purple-200"><strong>Why I'm doing this:</strong> {nextActivity.why}</p>
</div>
)}
</div>

<div className="mb-4">
<div className="flex items-center justify-between mb-2">
<span className="text-sm text-purple-300">Pre-activity anxiety</span>
<span className="text-2xl">{getAnxietyEmoji(nextActivity.preAnxiety)}</span>
</div>
<div className="flex items-center gap-2">
<span className={`text-2xl font-bold ${getAnxietyColor(nextActivity.preAnxiety)}`}>
{nextActivity.preAnxiety}/10
</span>
</div>
</div>

<div className="grid grid-cols-2 gap-3">
<button
onClick={() => setShowBreathing(true)}
className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
>
<Wind className="w-5 h-5" />
Breathing
</button>
<button
onClick={() => setShowReframing(true)}
className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
>
<Brain className="w-5 h-5" />
Reframe
</button>
</div>


<button
  onClick={() => {
    setActiveInteraction(nextActivity);
    setInteractionTimer(0);
    showNotification('💪 You got this! Support is here if you need it.');
  }}
  data-tour="realtime-support-btn"
  className="w-full mt-3 px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2"
>
  <Play className="w-6 h-6" />
  I'm Starting Now - Give Me Support
</button>

<button
onClick={() => setCheckInActivity(nextActivity)}
data-tour="checkin-btn"
className="w-full mt-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2"
>
<CheckCircle className="w-6 h-6" />
Check In After Activity
</button>
</div>
</div>
)}

{/* QUICK ACTIONS */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

  

<button
  onClick={() => setShowBreathing(true)}
  id="breathing-button"
  className="p-5 bg-gradient-to-br from-blue-800/60 to-cyan-900/60 hover:from-blue-700/60 hover:to-cyan-800/60 rounded-2xl border-2 border-blue-500/30 transition-all shadow-xl hover:shadow-2xl"
>
  <Wind className="w-8 h-8 text-blue-400 mb-2" />
  <h3 className="font-bold text-white mb-1">Breathing Exercises</h3>
  <p className="text-sm text-blue-300">Calm your nerves now</p>
</button>

<button
  onClick={() => setShowReframing(true)}
  data-tour="reframe-button"
  className="p-5 bg-gradient-to-br from-purple-800/60 to-purple-900/60 hover:from-purple-700/60 hover:to-purple-800/60 rounded-2xl border-2 border-purple-500/30 transition-all shadow-xl hover:shadow-2xl"
>
  <Brain className="w-8 h-8 text-purple-400 mb-2" />
  <h3 className="font-bold text-white mb-1">Thought Reframing</h3>
  <p className="text-sm text-purple-300">Challenge anxious thoughts</p>
</button>

<button
  onClick={() => setShowDiscovery(true)}
  data-tour="discover-button"
  className="p-5 bg-gradient-to-br from-green-800/60 to-green-900/60 hover:from-green-700/60 hover:to-green-800/60 rounded-2xl border-2 border-green-500/30 transition-all shadow-xl hover:shadow-2xl"
>
  <Search className="w-8 h-8 text-green-400 mb-2" />
  <h3 className="font-bold text-white mb-1">Discover Activities</h3>
  <p className="text-sm text-green-300">Find anxiety-friendly options</p>
</button>


</div>

{/* STATS GRID */}
<div data-tour="stats-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
<div className="bg-gradient-to-br from-green-800/60 to-emerald-900/60 backdrop-blur-sm p-5 rounded-2xl border-2 border-green-500/30 shadow-xl">
<div className="flex items-center gap-2 mb-2">
<CheckCircle className="w-5 h-5 text-green-400" />
<span className="text-purple-300 text-sm font-medium">Completed</span>
</div>
<p className="text-4xl font-bold text-white mb-1">{stats.totalCompleted}</p>
<p className="text-green-400 text-sm">You showed up!</p>
</div>

<div className="bg-gradient-to-br from-orange-800/60 to-red-900/60 backdrop-blur-sm p-5 rounded-2xl border-2 border-orange-500/30 shadow-xl">
<div className="flex items-center gap-2 mb-2">
<Flame className="w-5 h-5 text-orange-400" />
<span className="text-purple-300 text-sm font-medium">Streak</span>
</div>
<p className="text-4xl font-bold text-white mb-1">{stats.currentStreak}</p>
<p className="text-orange-400 text-sm">Days in a row</p>
</div>

<div className="bg-gradient-to-br from-blue-800/60 to-purple-900/60 backdrop-blur-sm p-5 rounded-2xl border-2 border-blue-500/30 shadow-xl">
<div className="flex items-center gap-2 mb-2">
<TrendingUp className="w-5 h-5 text-blue-400" />
<span className="text-purple-300 text-sm font-medium">Anxiety Drop</span>
</div>
<p className="text-4xl font-bold text-white mb-1">{stats.anxietyDrop}</p>
<p className="text-blue-400 text-sm">Average decrease</p>
</div>

<div className="bg-gradient-to-br from-purple-800/60 to-pink-900/60 backdrop-blur-sm p-5 rounded-2xl border-2 border-purple-500/30 shadow-xl">
<div className="flex items-center gap-2 mb-2">
<Activity className="w-5 h-5 text-purple-400" />
<span className="text-purple-300 text-sm font-medium">Variety</span>
</div>
<p className="text-4xl font-bold text-white mb-1">{stats.uniqueTypes}</p>
<p className="text-purple-400 text-sm">Different types</p>
</div>
</div>


<div className="mb-8" id="action-planner-section">
 
  {/* Section header */}
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '36px', height: '36px',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 16px rgba(79,70,229,0.4)',
      }}>
        <span style={{ fontSize: '16px' }}>🪜</span>
      </div>
      <div>
        <h2 style={{ color: '#f3f0ff', fontWeight: '700', fontSize: '20px', margin: 0 }}>Action Planner</h2>
        <p style={{ color: 'rgba(196,181,253,0.6)', fontSize: '12px', margin: 0 }}>Your fear ladder + interaction plans</p>
      </div>
    </div>
  </div>
 
  {/* Tab bar */}
  <div style={{
    display: 'flex', gap: '4px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '14px',
    padding: '4px',
    marginBottom: '20px',
    border: '1px solid rgba(255,255,255,0.07)',
  }}>
    {[
      { id: 'ladder', label: 'My Plans', emoji: '📋' },
      { id: 'plan',   label: 'Plan',    emoji: '📋' },
      { id: 'prep',   label: 'Prep Kit',emoji: '🎒' },
      { id: 'history',label: 'History', emoji: '📈' },
    ].map(tab => (
      <button
        key={tab.id}
        onClick={() => setPlannerTab(tab.id)}
        style={{
          flex: 1, padding: '9px 4px',
          borderRadius: '10px',
          border: 'none',
          background: plannerTab === tab.id
            ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
            : 'transparent',
          color: plannerTab === tab.id ? '#fff' : 'rgba(196,181,253,0.55)',
          fontWeight: plannerTab === tab.id ? '700' : '500',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '3px',
          boxShadow: plannerTab === tab.id ? '0 2px 12px rgba(79,70,229,0.4)' : 'none',
        }}
      >
        <span style={{ fontSize: '14px' }}>{tab.emoji}</span>
        {tab.label}
      </button>
    ))}
  </div>
 
  {/* ── TAB: LADDER ─────────────────────────────────────────────────── */}
  {plannerTab === 'ladder' && (
  <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>

    {upcomingActivities.length === 0 ? (
      <div style={{
        textAlign: 'center', padding: '40px 20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px dashed rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>📋</div>
        <p style={{ color: 'rgba(196,181,253,0.5)', fontSize: '14px', marginBottom: '12px' }}>
          No plans yet — build your first one
        </p>
        <button
          onClick={() => setPlannerTab('plan')}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            border: 'none', borderRadius: '10px',
            color: '#fff', fontWeight: '700', fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Build a plan →
        </button>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {upcomingActivities
          .sort((a, b) => a.scheduledDate - b.scheduledDate)
          .map(activity => (
          <div key={activity.id} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', overflow: 'hidden',
          }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>
                {SITUATION_TYPES.find(t => t.name === activity.type)?.icon || '🎯'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#f3f0ff', fontWeight: '700', fontSize: '14px',
                  margin: '0 0 2px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activity.name}
                </p>
                <p style={{ color: 'rgba(196,181,253,0.45)', fontSize: '11px', margin: 0 }}>
                  {new Date(activity.scheduledDate).toLocaleDateString('en-GB', {
                    weekday: 'short', day: 'numeric', month: 'short'
                  })} · {new Date(activity.scheduledDate).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: '#f472b6', fontWeight: '800', fontSize: '13px', margin: '0 0 1px' }}>
                  {getTimeUntil(activity.scheduledDate)}
                </p>
                <p style={{ color: 'rgba(196,181,253,0.35)', fontSize: '10px', margin: 0 }}>away</p>
              </div>
            </div>

            {/* Action steps */}
            {activity.actionSteps?.length > 0 ? (
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.05)',
                padding: '10px 14px',
                background: 'rgba(79,70,229,0.06)',
              }}>
                <p style={{ color: 'rgba(196,181,253,0.4)', fontSize: '11px', fontWeight: '600',
                  marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your action steps
                </p>
                {activity.actionSteps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: i < activity.actionSteps.length - 1 ? '6px' : 0,
                  }}>
                    <div style={{
                      width: '16px', height: '16px', flexShrink: 0,
                      borderRadius: '4px',
                      border: '1.5px solid rgba(167,139,250,0.3)',
                    }} />
                    <p style={{ color: 'rgba(243,240,255,0.7)', fontSize: '12px', margin: 0 }}>
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.05)',
                padding: '9px 14px',
              }}>
                <p style={{ color: 'rgba(196,181,253,0.3)', fontSize: '11px',
                  fontStyle: 'italic', margin: 0 }}>
                  No action steps — 
                  <button onClick={() => setPlannerTab('plan')}
                    style={{ background: 'none', border: 'none', color: 'rgba(167,139,250,0.5)',
                      fontSize: '11px', cursor: 'pointer', padding: '0 0 0 4px', textDecoration: 'underline' }}>
                    add some
                  </button>
                </p>
              </div>
            )}

          </div>
        ))}
      </div>
    )}
  </div>
)}

 
  {/* ── TAB: PLAN ───────────────────────────────────────────────────── */}
  
{plannerTab === 'plan' && (
  <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
 
    {/* Progress bar — only visible once inside the funnel */}
    {planStep > 0 && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
        {[1,2,3,4,5].map(s => (
          <div key={s} style={{
            height: '4px', flex: 1, borderRadius: '2px',
            background: s <= planStep
              ? 'linear-gradient(90deg,#4f46e5,#7c3aed)'
              : 'rgba(255,255,255,0.08)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    )}
 
    {/* ══════════════════════════════════════════════
        STEP 0 — Hero intro: this is YOUR action plan
        ══════════════════════════════════════════════ */}
    {planStep === 0 && (
      <div style={{ animation: 'fadeSlideUp 0.35s ease' }}>
 
        {/* Big icon */}
        <div style={{
          width: '64px', height: '64px',
          background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          borderRadius: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 0 32px rgba(79,70,229,0.35)',
        }}>
          <span style={{ fontSize: '28px' }}>📋</span>
        </div>
 
        {/* Headline */}
        <h2 style={{
          color: '#f3f0ff', fontSize: '26px', fontWeight: '800',
          lineHeight: '1.2', marginBottom: '12px',
        }}>
          Build your own<br />
          <span style={{
            background: 'linear-gradient(90deg,#a78bfa,#ec4899)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            action plan
          </span>
        </h2>
 
        <p style={{
          color: 'rgba(196,181,253,0.7)', fontSize: '15px',
          lineHeight: '1.7', marginBottom: '28px',
        }}>
          Most people avoid scary situations because they don't have a plan.
          This is where you build one — on your terms, in your words.
        </p>
 
        {/* What you'll build — 3 pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {[
            {
              emoji: '🎯',
              title: 'A specific situation you commit to facing',
              sub: 'Not "go to the gym someday" — a real date, a real time',
            },
            {
              emoji: '💬',
              title: 'Your own words for why it matters',
              sub: 'Your anchor when anxiety tells you to cancel',
            },
            {
              emoji: '✅',
              title: 'A checklist of actions you\'ll take',
              sub: 'Tiny steps you choose — not advice from a stranger',
            },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
            }}>
              <div style={{
                width: '36px', height: '36px', flexShrink: 0,
                borderRadius: '10px',
                background: 'rgba(79,70,229,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>
                {item.emoji}
              </div>
              <div>
                <p style={{
                  color: '#f3f0ff', fontWeight: '700', fontSize: '14px',
                  margin: '0 0 3px',
                }}>
                  {item.title}
                </p>
                <p style={{
                  color: 'rgba(196,181,253,0.5)', fontSize: '12px',
                  margin: 0, lineHeight: '1.4',
                }}>
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
 
        {/* Existing plans count — if they have upcoming activities */}
        {/* YOUR ACTIVE PLANS */}
{upcomingActivities.length > 0 && (
  <div style={{ marginBottom: '24px' }}>
    <p style={{ color: 'rgba(196,181,253,0.5)', fontSize: '12px', fontWeight: '600',
      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
      Your active plans
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {upcomingActivities.map(activity => (
        <div key={activity.id} style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}>
          {/* Header row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '13px 14px',
          }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>
              {SITUATION_TYPES.find(t => t.name === activity.type)?.icon || '🎯'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#f3f0ff', fontWeight: '700', fontSize: '14px',
                margin: '0 0 2px', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activity.name}
              </p>
              <p style={{ color: 'rgba(196,181,253,0.45)', fontSize: '11px', margin: 0 }}>
                {new Date(activity.scheduledDate).toLocaleDateString('en-GB', {
                  weekday: 'short', day: 'numeric', month: 'short'
                })} · {new Date(activity.scheduledDate).toLocaleTimeString([], {
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ color: '#f472b6', fontWeight: '800', fontSize: '13px', margin: '0 0 1px' }}>
                {getTimeUntil(activity.scheduledDate)}
              </p>
              <p style={{ color: 'rgba(196,181,253,0.35)', fontSize: '10px', margin: 0 }}>away</p>
            </div>
          </div>

          {/* Action steps checklist — only if they have some */}
          {activity.actionSteps?.length > 0 && (
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              padding: '10px 14px',
              background: 'rgba(79,70,229,0.06)',
            }}>
              <p style={{ color: 'rgba(196,181,253,0.4)', fontSize: '11px',
                fontWeight: '600', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your action steps
              </p>
              {activity.actionSteps.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: i < activity.actionSteps.length - 1 ? '6px' : 0,
                }}>
                  <div style={{
                    width: '16px', height: '16px', flexShrink: 0,
                    borderRadius: '4px',
                    border: '1.5px solid rgba(167,139,250,0.3)',
                    background: 'transparent',
                  }} />
                  <p style={{ color: 'rgba(243,240,255,0.7)', fontSize: '12px', margin: 0 }}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* No action steps nudge */}
          {(!activity.actionSteps || activity.actionSteps.length === 0) && (
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              padding: '9px 14px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <p style={{ color: 'rgba(196,181,253,0.3)', fontSize: '11px',
                fontStyle: 'italic', margin: 0 }}>
                No action steps added yet
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

{/* CTA */}
<button
  onClick={() => setPlanStep(1)}
  style={{
    width: '100%', padding: '17px',
    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
    border: 'none', borderRadius: '14px',
    color: '#fff', fontWeight: '800', fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 4px 28px rgba(79,70,229,0.4)',
  }}
>
  {upcomingActivities.length > 0 ? '+ Build another plan' : 'Build my action plan →'}
</button>
 
        <p style={{
          color: 'rgba(196,181,253,0.3)', fontSize: '11px',
          textAlign: 'center', marginTop: '12px',
        }}>
          Takes about 2 minutes · Saved to your account
        </p>
      </div>
    )}
 
    {/* ══════════════════════════════════════════════
        STEP 1 — What kind of situation?
        ══════════════════════════════════════════════ */}
    {planStep === 1 && (
      <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
        <p style={{ color: 'rgba(196,181,253,0.5)', fontSize: '12px', fontWeight: '600',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Step 1 of 5
        </p>
        <h3 style={{ color: '#f3f0ff', fontSize: '22px', fontWeight: '700',
          marginBottom: '6px', lineHeight: '1.2' }}>
          What kind of situation is this?
        </h3>
        <p style={{ color: 'rgba(196,181,253,0.55)', fontSize: '14px',
          marginBottom: '24px', lineHeight: '1.5' }}>
          Pick the closest match — it loads your prep kit automatically.
        </p>
 
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SITUATION_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => {
                setPlanDraft(d => ({ ...d, type: type.id, typeName: type.name }));
                setTimeout(() => setPlanStep(2), 180);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '15px 16px', borderRadius: '14px',
                border: planDraft.type === type.id
                  ? '1.5px solid rgba(167,139,250,0.7)'
                  : '1px solid rgba(255,255,255,0.08)',
                background: planDraft.type === type.id
                  ? 'rgba(124,58,237,0.18)'
                  : 'rgba(255,255,255,0.03)',
                cursor: 'pointer', transition: 'all 0.15s ease',
                textAlign: 'left', width: '100%',
              }}
            >
              <span style={{ fontSize: '22px', flexShrink: 0 }}>{type.icon}</span>
              <p style={{ color: '#f3f0ff', fontWeight: '600', fontSize: '14px', margin: 0 }}>
                {type.name}
              </p>
              <span style={{ marginLeft: 'auto', color: 'rgba(167,139,250,0.4)', fontSize: '18px' }}>›</span>
            </button>
          ))}
        </div>
 
        <button
          onClick={() => setPlanStep(0)}
          style={{
            width: '100%', marginTop: '16px', padding: '12px',
            background: 'none', border: 'none',
            color: 'rgba(196,181,253,0.35)', fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          ← Back to overview
        </button>
      </div>
    )}
 
    {/* STEPS 2–5: paste your existing step 2, 3, 4, 5 blocks here unchanged */}
    {/* The only change is that Back on step 1 now goes to planStep(0) not nothing */}
 
    {planStep === 2 && (
      <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
        <p style={{ color: 'rgba(196,181,253,0.5)', fontSize: '12px', fontWeight: '600',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Step 2 of 5
        </p>
        <h3 style={{ color: '#f3f0ff', fontSize: '22px', fontWeight: '700',
          marginBottom: '6px', lineHeight: '1.2' }}>
          What exactly, and when?
        </h3>
        <p style={{ color: 'rgba(196,181,253,0.55)', fontSize: '14px',
          marginBottom: '24px', lineHeight: '1.5' }}>
          Be specific — "Doctor appointment for persistent cough on Tuesday" beats "doctor visit".
        </p>
 
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px', borderRadius: '20px',
          background: 'rgba(79,70,229,0.15)',
          border: '1px solid rgba(79,70,229,0.25)',
          marginBottom: '20px',
        }}>
          <span style={{ fontSize: '14px' }}>{SITUATION_TYPES.find(t => t.id === planDraft.type)?.icon}</span>
          <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '600' }}>{planDraft.typeName}</span>
          <button onClick={() => setPlanStep(1)} style={{ background:'none', border:'none', color:'rgba(167,139,250,0.5)', cursor:'pointer', fontSize:'14px', padding:'0 0 0 4px', lineHeight:1 }}>×</button>
        </div>
 
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <p style={{ color:'rgba(196,181,253,0.6)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Describe it</p>
            <input
              type="text"
              value={planDraft.name}
              onChange={e => setPlanDraft(d => ({ ...d, name: e.target.value }))}
              placeholder={
                planDraft.type === 'medical' ? 'e.g. GP appointment about persistent headaches' :
                planDraft.type === 'social'  ? "e.g. Friend's birthday dinner with new people" :
                planDraft.type === 'work'    ? 'e.g. Ask manager about flexible hours' :
                planDraft.type === 'phone'   ? 'e.g. Call to dispute a bank charge' :
                planDraft.type === 'public'  ? 'e.g. First time at the new gym' :
                'e.g. Describe the situation'
              }
              autoFocus
              style={{ width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', padding:'14px 16px', color:'#f3f0ff', fontSize:'15px', outline:'none' }}
            />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <div>
              <p style={{ color:'rgba(196,181,253,0.6)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Date</p>
              <input type="date" value={planDraft.date} onChange={e => setPlanDraft(d => ({ ...d, date: e.target.value }))} min={new Date().toISOString().split('T')[0]}
                style={{ width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', padding:'12px 14px', color:'#f3f0ff', fontSize:'14px', outline:'none' }} />
            </div>
            <div>
              <p style={{ color:'rgba(196,181,253,0.6)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Time</p>
              <input type="time" value={planDraft.time} onChange={e => setPlanDraft(d => ({ ...d, time: e.target.value }))}
                style={{ width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', padding:'12px 14px', color:'#f3f0ff', fontSize:'14px', outline:'none' }} />
            </div>
          </div>
        </div>
 
        <div style={{ display:'flex', gap:'10px', marginTop:'24px' }}>
          <button onClick={() => setPlanStep(1)} style={{ flex:1, padding:'13px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', color:'rgba(196,181,253,0.6)', fontWeight:'600', fontSize:'14px', cursor:'pointer' }}>← Back</button>
          <button onClick={() => {
            if (!planDraft.name.trim()) { showNotification('Describe the situation first'); return; }
            if (!planDraft.date || !planDraft.time) { showNotification('Set a date and time'); return; }
            setPlanStep(3);
          }} style={{ flex:2, padding:'13px', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:'700', fontSize:'14px', cursor:'pointer', boxShadow:'0 4px 16px rgba(79,70,229,0.35)' }}>Continue →</button>
        </div>
      </div>
    )}
 
    {planStep === 3 && (
      <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
        <p style={{ color:'rgba(196,181,253,0.5)', fontSize:'12px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>Step 3 of 5</p>
        <h3 style={{ color:'#f3f0ff', fontSize:'22px', fontWeight:'700', marginBottom:'6px', lineHeight:'1.2' }}>How does this feel right now?</h3>
        <p style={{ color:'rgba(196,181,253,0.55)', fontSize:'14px', marginBottom:'24px', lineHeight:'1.5' }}>Be honest — this is your baseline. We'll compare it to how you feel after.</p>
 
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'28px 20px', textAlign:'center', marginBottom:'20px' }}>
          <div style={{ fontSize:'52px', marginBottom:'6px' }}>{planDraft.anxiety <= 3 ? '😌' : planDraft.anxiety <= 6 ? '😰' : '😱'}</div>
          <div style={{ fontSize:'52px', fontWeight:'800', lineHeight:1, color: planDraft.anxiety <= 3 ? '#4ade80' : planDraft.anxiety <= 6 ? '#facc15' : '#f87171', marginBottom:'6px' }}>
            {planDraft.anxiety}<span style={{ fontSize:'22px', opacity:0.4 }}>/10</span>
          </div>
          <p style={{ color:'rgba(196,181,253,0.5)', fontSize:'13px', margin:0 }}>
            {planDraft.anxiety <= 2 ? "Barely anxious — that's great"
              : planDraft.anxiety <= 4 ? 'Mild nerves — manageable'
              : planDraft.anxiety <= 6 ? "Moderate anxiety — you're feeling it"
              : planDraft.anxiety <= 8 ? 'High anxiety — this takes real courage'
              : "Very high — we'll help you prepare well"}
          </p>
        </div>
 
        <input type="range" min="1" max="10" step="1" value={planDraft.anxiety}
          onChange={e => setPlanDraft(d => ({ ...d, anxiety: parseInt(e.target.value) }))}
          style={{ width:'100%', marginBottom:'24px' }} />
 
        <div style={{ marginBottom:'24px' }}>
          <p style={{ color:'rgba(196,181,253,0.6)', fontSize:'12px', fontWeight:'600', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Why are you doing this anyway? (your anchor)</p>
          <textarea value={planDraft.why} onChange={e => setPlanDraft(d => ({ ...d, why: e.target.value }))}
            placeholder="e.g. I can't keep avoiding my health. I need answers more than I need comfort."
            rows={3}
            style={{ width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', padding:'12px 14px', color:'#f3f0ff', fontSize:'14px', outline:'none', resize:'none', lineHeight:'1.5' }} />
          <p style={{ color:'rgba(196,181,253,0.35)', fontSize:'11px', marginTop:'6px' }}>When anxiety spikes and you want to cancel — this is what you'll read.</p>
        </div>
 
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={() => setPlanStep(2)} style={{ flex:1, padding:'13px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', color:'rgba(196,181,253,0.6)', fontWeight:'600', fontSize:'14px', cursor:'pointer' }}>← Back</button>
          <button onClick={() => setPlanStep(4)} style={{ flex:2, padding:'13px', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:'700', fontSize:'14px', cursor:'pointer', boxShadow:'0 4px 16px rgba(79,70,229,0.35)' }}>Continue →</button>
        </div>
      </div>
    )}
 
    {planStep === 4 && (
      <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
        <p style={{ color:'rgba(196,181,253,0.5)', fontSize:'12px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>Step 4 of 5</p>
        <h3 style={{ color:'#f3f0ff', fontSize:'22px', fontWeight:'700', marginBottom:'6px', lineHeight:'1.2' }}>What will you actually do?</h3>
        <p style={{ color:'rgba(196,181,253,0.55)', fontSize:'14px', marginBottom:'20px', lineHeight:'1.5' }}>
          These are <strong style={{ color:'#c4b5fd' }}>your</strong> actions — written by you, owned by you.
          Tap suggestions or write your own. This becomes your personal checklist on the day.
        </p>
 
        {planDraft.type && (() => {
          const suggestions = {
            medical: ['Arrive 10 minutes early','Write my symptoms down beforehand','Bring my medications list','Ask at least one question I prepared','Request a copy of any test results'],
            social:  ['Set a minimum time (30 min) then I can leave','Introduce myself to one new person','Use a conversation starter I prepared','Take a bathroom break if overwhelmed','Message a friend before I go in'],
            work:    ['Write my key points beforehand','Practice saying the main thing out loud','Bring notes I can refer to','Say "I need a moment to think" if stuck','Follow up in writing after'],
            phone:   ['Write down what I need to say first','Have a glass of water nearby','Call at a quiet time','Say "can I call you back?" if overwhelmed','Have account details ready'],
            public:  ['Go at an off-peak time','Have headphones in','Set a 15-minute minimum','Look up the layout beforehand','Bring what I need so I don\'t have to ask'],
          };
          const list = suggestions[planDraft.type] || suggestions.public;
          const added = new Set(planDraft.actionSteps.map(s => s.text));
          return (
            <div style={{ marginBottom:'16px' }}>
              <p style={{ color:'rgba(196,181,253,0.4)', fontSize:'11px', fontWeight:'600', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                Tap to add — or write your own below
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {list.map((tip, i) => {
                  const isAdded = added.has(tip);
                  return (
                    <button key={i}
                      onClick={() => {
                        if (isAdded) {
                          setPlanDraft(d => ({ ...d, actionSteps: d.actionSteps.filter(s => s.text !== tip) }));
                        } else {
                          setPlanDraft(d => ({ ...d, actionSteps: [...d.actionSteps, { id: Date.now().toString()+i, text: tip, completed: false }] }));
                        }
                      }}
                      style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', borderRadius:'10px', border: isAdded ? '1px solid rgba(79,70,229,0.4)' : '1px solid rgba(255,255,255,0.07)', background: isAdded ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.03)', cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.15s ease' }}>
                      <div style={{ width:'20px', height:'20px', flexShrink:0, borderRadius:'6px', border: isAdded ? 'none' : '1.5px solid rgba(167,139,250,0.3)', background: isAdded ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', color:'#fff', transition:'all 0.15s ease' }}>
                        {isAdded ? '✓' : ''}
                      </div>
                      <span style={{ color: isAdded ? '#c4b5fd' : 'rgba(243,240,255,0.75)', fontSize:'13px' }}>{tip}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
 
        <div style={{ background:'rgba(79,70,229,0.08)', border:'1px solid rgba(79,70,229,0.2)', borderRadius:'12px', padding:'14px', marginBottom:'16px' }}>
          <p style={{ color:'rgba(196,181,253,0.5)', fontSize:'11px', fontWeight:'600', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Write your own step</p>
          <div style={{ display:'flex', gap:'8px' }}>
            <input type="text" value={planNewStep} onChange={e => setPlanNewStep(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter' && planNewStep.trim()) { setPlanDraft(d => ({ ...d, actionSteps:[...d.actionSteps,{id:Date.now().toString(),text:planNewStep.trim(),completed:false}] })); setPlanNewStep(''); }}}
              placeholder="e.g. Bring my list of symptoms"
              style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(79,70,229,0.25)', borderRadius:'9px', padding:'10px 12px', color:'#f3f0ff', fontSize:'13px', outline:'none' }} />
            <button onClick={() => { if (!planNewStep.trim()) return; setPlanDraft(d => ({ ...d, actionSteps:[...d.actionSteps,{id:Date.now().toString(),text:planNewStep.trim(),completed:false}] })); setPlanNewStep(''); }}
              style={{ padding:'10px 16px', borderRadius:'9px', border:'none', background:'rgba(79,70,229,0.35)', color:'#a78bfa', fontWeight:'700', fontSize:'18px', cursor:'pointer', lineHeight:1 }}>+</button>
          </div>
        </div>
 
        {planDraft.actionSteps.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', padding:'10px 14px', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'10px' }}>
            <span style={{ fontSize:'14px' }}>✓</span>
            <p style={{ color:'#4ade80', fontSize:'13px', fontWeight:'600', margin:0 }}>
              {planDraft.actionSteps.length} action step{planDraft.actionSteps.length > 1 ? 's' : ''} in your plan
            </p>
          </div>
        )}
 
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={() => setPlanStep(3)} style={{ flex:1, padding:'13px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', color:'rgba(196,181,253,0.6)', fontWeight:'600', fontSize:'14px', cursor:'pointer' }}>← Back</button>
          <button onClick={() => setPlanStep(5)} style={{ flex:2, padding:'13px', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:'700', fontSize:'14px', cursor:'pointer', boxShadow:'0 4px 16px rgba(79,70,229,0.35)' }}>
            {planDraft.actionSteps.length === 0 ? 'Skip for now →' : 'Continue →'}
          </button>
        </div>
      </div>
    )}
 
    {planStep === 5 && (
      <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
        <p style={{ color:'rgba(196,181,253,0.5)', fontSize:'12px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>Step 5 of 5</p>
        <h3 style={{ color:'#f3f0ff', fontSize:'22px', fontWeight:'700', marginBottom:'6px', lineHeight:'1.2' }}>Your action plan</h3>
        <p style={{ color:'rgba(196,181,253,0.55)', fontSize:'14px', marginBottom:'20px', lineHeight:'1.5' }}>This is yours. Review it, then lock it in.</p>
 
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'16px', overflow:'hidden', marginBottom:'20px' }}>
          <div style={{ padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
              <span style={{ fontSize:'18px' }}>{SITUATION_TYPES.find(t => t.id === planDraft.type)?.icon}</span>
              <span style={{ color:'#a78bfa', fontSize:'12px', fontWeight:'600' }}>{planDraft.typeName}</span>
            </div>
            <p style={{ color:'#f3f0ff', fontWeight:'700', fontSize:'16px', margin:0 }}>{planDraft.name}</p>
          </div>
 
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            {[
              { label:'Date', val: planDraft.date ? new Date(planDraft.date+'T12:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—' },
              { label:'Time', val: planDraft.time || '—' },
              { label:'Anxiety', val: `${planDraft.anxiety}/10 ${getAnxietyEmoji(planDraft.anxiety)}` },
            ].map((cell,i) => (
              <div key={i} style={{ padding:'12px 14px', borderRight: i<2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <p style={{ color:'rgba(196,181,253,0.45)', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'3px' }}>{cell.label}</p>
                <p style={{ color:'#f3f0ff', fontSize:'13px', fontWeight:'600', margin:0 }}>{cell.val}</p>
              </div>
            ))}
          </div>
 
          {planDraft.why && (
            <div style={{ padding:'14px 16px', borderBottom: planDraft.actionSteps.length > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <p style={{ color:'rgba(196,181,253,0.45)', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'5px' }}>Your why</p>
              <p style={{ color:'rgba(243,240,255,0.75)', fontSize:'13px', fontStyle:'italic', margin:0, lineHeight:'1.5' }}>"{planDraft.why}"</p>
            </div>
          )}
 
          {planDraft.actionSteps.length > 0 && (
            <div style={{ padding:'14px 16px' }}>
              <p style={{ color:'rgba(196,181,253,0.45)', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'10px' }}>
                Your {planDraft.actionSteps.length} action step{planDraft.actionSteps.length > 1 ? 's' : ''}
              </p>
              {planDraft.actionSteps.map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom: i<planDraft.actionSteps.length-1 ? '8px' : 0 }}>
                  <div style={{ width:'18px', height:'18px', borderRadius:'5px', border:'1.5px solid rgba(167,139,250,0.3)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'2px', background:'rgba(167,139,250,0.2)' }} />
                  </div>
                  <p style={{ color:'rgba(243,240,255,0.8)', fontSize:'13px', margin:0 }}>{s.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
 
        <button
          onClick={async () => {
            const scheduledDateTime = new Date(`${planDraft.date}T${planDraft.time}`).getTime();
            if (isNaN(scheduledDateTime)) { showNotification('Invalid date/time'); return; }
            const activity = {
              name: planDraft.name.trim(),
              type: planDraft.typeName || 'Other',
              scheduledDate: scheduledDateTime,
              why: planDraft.why.trim(),
              preAnxiety: planDraft.anxiety,
              actionSteps: planDraft.actionSteps,
              completed: false,
              createdAt: Date.now(),
            };
            await saveActivityToFirebase(activity);
            showNotification('🔒 Plan saved! You built that.');
            resetPlanFunnel();
            setPlannerTab('ladder');
          }}
          style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#059669,#0891b2)', border:'none', borderRadius:'14px', color:'#fff', fontWeight:'800', fontSize:'16px', cursor:'pointer', boxShadow:'0 4px 24px rgba(5,150,105,0.35)', marginBottom:'10px' }}
        >
          Lock it in 🔒
        </button>
        <button onClick={() => setPlanStep(4)} style={{ width:'100%', padding:'12px', background:'none', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', color:'rgba(196,181,253,0.5)', fontWeight:'500', fontSize:'13px', cursor:'pointer' }}>
          ← Edit action steps
        </button>
      </div>
    )}
 
  </div>
)}

 
  {/* ── TAB: PREP ───────────────────────────────────────────────────── */}
  {plannerTab === 'prep' && (
    <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
 
      {/* Situation picker */}
      <p style={{ color: 'rgba(196,181,253,0.6)', fontSize: '12px', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Pick a situation to prep for
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
        {SITUATION_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setNewActivityType(
              newActivityType === type.name ? '' : type.name
            )}
            style={{
              padding: '10px 6px', borderRadius: '12px',
              border: newActivityType === type.name
                ? '1.5px solid rgba(167,139,250,0.7)'
                : '1px solid rgba(255,255,255,0.07)',
              background: newActivityType === type.name
                ? 'rgba(124,58,237,0.2)'
                : 'rgba(255,255,255,0.03)',
              cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '3px' }}>{type.icon}</div>
            <p style={{ color: '#f3f0ff', fontSize: '10px', fontWeight: '600', margin: 0 }}>{type.name}</p>
          </button>
        ))}
      </div>
 
      {/* Show prep kit inline */}
      {newActivityType && (() => {
        const typeId = SITUATION_TYPES.find(t => t.name === newActivityType)?.id;
        const kit = PREP_KITS[typeId];
        if (!kit) return (
          <p style={{ color: 'rgba(196,181,253,0.5)', textAlign: 'center', padding: '20px' }}>
            No prep kit for this type yet
          </p>
        );
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {kit.sections.map((section, si) => (
              <div key={si} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', overflow: 'hidden',
              }}>
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(79,70,229,0.12)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ fontSize: '14px' }}>📌</span>
                  <p style={{ color: '#c4b5fd', fontWeight: '700', fontSize: '13px', margin: 0 }}>{section.title}</p>
                </div>
                <div style={{ padding: '4px 0' }}>
                  {section.items.map((item, ii) => (
                    <div key={ii} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      padding: '10px 16px',
                      borderBottom: ii < section.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                      <div style={{
                        width: '20px', height: '20px', flexShrink: 0,
                        borderRadius: '6px',
                        background: 'rgba(79,70,229,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: '700', color: '#a78bfa',
                        marginTop: '1px',
                      }}>
                        {ii + 1}
                      </div>
                      <p style={{ color: 'rgba(243,240,255,0.8)', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
 
            {/* Grounding techniques */}
            <div style={{
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: '14px', padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px' }}>⚡</span>
                <p style={{ color: '#67e8f9', fontWeight: '700', fontSize: '13px', margin: 0 }}>
                  If you freeze or panic during
                </p>
              </div>
              {GROUNDING_TECHNIQUES.map((t, ti) => (
                <div key={ti} style={{ marginBottom: ti < GROUNDING_TECHNIQUES.length - 1 ? '10px' : 0 }}>
                  <p style={{ color: '#a5f3fc', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}>→ {t.name}</p>
                  <p style={{ color: 'rgba(165,243,252,0.6)', fontSize: '11px', lineHeight: '1.5', margin: 0 }}>
                    {t.steps.join(' · ')}
                  </p>
                </div>
              ))}
            </div>
 
            {/* CTA */}
            <button
              onClick={() => {
                setShowBreathing(true);
              }}
              style={{
                width: '100%', padding: '13px',
                background: 'rgba(79,70,229,0.2)',
                border: '1px solid rgba(79,70,229,0.3)',
                borderRadius: '12px',
                color: '#c4b5fd', fontWeight: '600', fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              🌬 Do a breathing exercise first
            </button>
          </div>
        );
      })()}
 
      {!newActivityType && (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          border: '1px dashed rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>🎒</div>
          <p style={{ color: 'rgba(196,181,253,0.5)', fontSize: '14px' }}>
            Pick a situation above to see your prep kit
          </p>
        </div>
      )}
    </div>
  )}
 
  {/* ── TAB: HISTORY ────────────────────────────────────────────────── */}
  {plannerTab === 'history' && (
    <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
      {completedActivities.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          border: '1px dashed rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>📈</div>
          <p style={{ color: 'rgba(196,181,253,0.5)', fontSize: '14px' }}>
            No completed activities yet — check in after your first one
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {completedActivities.map(activity => {
            const drop = (activity.preAnxiety || 0) - (activity.postAnxiety || 0);
            const isExpanded = expandedInteraction === activity.id;
 
            return (
              <div key={activity.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                overflow: 'hidden',
              }}>
                {/* Summary row */}
                <button
                  onClick={() => setExpandedInteraction(isExpanded ? null : activity.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    padding: '14px 16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', flexShrink: 0,
                    borderRadius: '10px',
                    background: drop >= 3
                      ? 'rgba(5,150,105,0.2)'
                      : drop > 0
                      ? 'rgba(234,179,8,0.2)'
                      : 'rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px',
                  }}>
                    {drop >= 3 ? '🎉' : drop > 0 ? '💪' : '🏃'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#f3f0ff', fontWeight: '600', fontSize: '14px', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activity.name}
                    </p>
                    <p style={{ color: 'rgba(196,181,253,0.5)', fontSize: '12px', margin: 0 }}>
                      {new Date(activity.completedDate).toLocaleDateString()} · {activity.type}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{
                      fontSize: '15px', fontWeight: '800', margin: '0 0 2px',
                      color: drop > 0 ? '#4ade80' : drop === 0 ? '#facc15' : '#f87171',
                    }}>
                      {drop > 0 ? `↓${drop}` : drop === 0 ? '→0' : `↑${Math.abs(drop)}`}
                    </p>
                    <p style={{ color: 'rgba(196,181,253,0.4)', fontSize: '10px', margin: 0 }}>anxiety</p>
                  </div>
                  <span style={{ color: 'rgba(196,181,253,0.4)', fontSize: '16px', marginLeft: '4px' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>
 
                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{
                    padding: '0 16px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '14px',
                  }}>
                    {/* Before / After */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      {[
                        { label: 'Before', val: activity.preAnxiety, bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
                        { label: 'After',  val: activity.postAnxiety, bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.2)'  },
                      ].map(cell => (
                        <div key={cell.label} style={{
                          background: cell.bg, border: `1px solid ${cell.border}`,
                          borderRadius: '10px', padding: '10px 12px',
                        }}>
                          <p style={{ color: 'rgba(196,181,253,0.6)', fontSize: '11px', margin: '0 0 4px' }}>{cell.label}</p>
                          <p style={{ color: '#f3f0ff', fontSize: '22px', fontWeight: '800', margin: 0 }}>
                            {cell.val}/10 <span style={{ fontSize: '16px' }}>{getAnxietyEmoji(cell.val)}</span>
                          </p>
                        </div>
                      ))}
                    </div>
 
                    {activity.wasItBad && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px' }}>
                        <p style={{ color: 'rgba(196,181,253,0.5)', fontSize: '11px', marginBottom: '3px' }}>Was it as bad as feared?</p>
                        <p style={{ color: '#f3f0ff', fontSize: '13px', margin: 0 }}>{activity.wasItBad}</p>
                      </div>
                    )}
 
                    {activity.reflection && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px' }}>
                        <p style={{ color: 'rgba(196,181,253,0.5)', fontSize: '11px', marginBottom: '3px' }}>Reflection</p>
                        <p style={{ color: '#f3f0ff', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{activity.reflection}</p>
                      </div>
                    )}
 
                    {/* Action steps checklist (if saved) */}
                    {activity.actionSteps?.length > 0 && (
                      <div style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: '10px', padding: '12px' }}>
                        <p style={{ color: '#c4b5fd', fontWeight: '600', fontSize: '12px', marginBottom: '8px' }}>Action steps</p>
                        {activity.actionSteps.map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <div style={{
                              width: '16px', height: '16px', borderRadius: '4px',
                              background: s.completed ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '9px', color: '#4ade80', flexShrink: 0,
                            }}>
                              {s.completed ? '✓' : ''}
                            </div>
                            <p style={{ color: 'rgba(243,240,255,0.7)', fontSize: '12px', margin: 0 }}>{s.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
 
                    <button
                      onClick={() => deleteActivityFromFirestore(activity.id)}
                      style={{
                        marginTop: '10px', padding: '8px 14px',
                        background: 'none', border: '1px solid rgba(248,113,113,0.2)',
                        borderRadius: '8px', color: 'rgba(248,113,113,0.6)',
                        fontSize: '12px', cursor: 'pointer',
                      }}
                    >
                      Delete record
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  )}
 
</div>


{/* ACHIEVEMENTS */}
<div data-tour="achievements-section" className="mb-6">
  <button
    onClick={() => setAchievementsOpen(prev => !prev)}
    className="flex items-center gap-2 text-purple-300 hover:text-purple-100 transition-colors mb-2"
  >
    <Award className="w-4 h-4 text-yellow-400" />
    <span className="text-sm font-semibold text-purple-100">Achievements</span>
    <span className="text-xs text-purple-400 ml-1">
      ({achievementsData.filter(a => a.unlocked).length}/{achievementsData.length})
    </span>
    <ChevronDown
      className={`w-3 h-3 text-purple-400 transition-transform ml-auto ${achievementsOpen ? 'rotate-180' : ''}`}
    />
  </button>

  {achievementsOpen && (
    <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md px-4 py-3 rounded-2xl border border-purple-500/30 shadow-xl overflow-x-auto">
      <div className="flex gap-3 w-max">
        {achievementsData.map(achievement => (
          <div
            key={achievement.id}
            className={`flex-shrink-0 w-28 p-3 rounded-xl border text-center transition-all ${
              achievement.unlocked
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-md'
                : 'bg-purple-950/40 border-purple-700/30 opacity-60'
            }`}
          >
            <div className="text-2xl mb-1">{achievement.icon}</div>
            <p className="text-xs font-bold text-purple-100 leading-tight mb-1">{achievement.title}</p>
            <p className="text-[10px] text-purple-400 mb-1.5">{achievement.progress}/{achievement.threshold}</p>
            {!achievement.unlocked && (
              <div className="h-1 bg-purple-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${Math.min((achievement.progress / achievement.threshold) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )}
</div>



{/* UPCOMING ACTIVITIES */}


{/* COMPLETED HISTORY */}
{completedActivities.length > 0 && (
<div data-tour="completed-section" className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md p-6 rounded-3xl border-2 border-purple-500/30 mb-8 shadow-2xl">
<div className="flex items-center gap-3 mb-6">
<CheckCircle className="w-6 h-6 text-green-400" />
<h2 className="text-2xl font-bold text-purple-100">Completed Activities</h2>
<span className="text-sm text-purple-400">({completedActivities.length})</span>
</div>

<div className="space-y-4">
{completedActivities.map((activity) => (
<div key={activity.id} className="bg-purple-950/30 rounded-2xl p-5 border border-purple-700/30">
<div className="flex items-start justify-between mb-3">
<div className="flex-1">
<h3 className="text-lg font-bold text-white mb-2">{activity.name}</h3>
<div className="flex items-center gap-2 text-sm text-purple-400 mb-3">
<span>{ACTIVITY_CATEGORIES.find(c => c.name === activity.type)?.icon || '🎯'}</span>
<span>{activity.type}</span>
<span>•</span>
<span>{new Date(activity.completedDate).toLocaleDateString()}</span>
</div>
</div>
<button
onClick={() => deleteActivityFromFirestore(activity.id)}
className="p-2 hover:bg-red-900/50 rounded-lg transition-colors"
>
<Trash2 className="w-4 h-4 text-red-400" />
</button>
</div>

<div data-tour="anxiety-comparison" className="grid grid-cols-2 gap-4 mb-4">
<div className="p-3 bg-red-900/20 rounded-xl border border-red-700/30">
<p className="text-xs text-purple-300 mb-1">Before</p>
<div className="flex items-center gap-2">
<span className={`text-2xl font-bold ${getAnxietyColor(activity.preAnxiety)}`}>
{activity.preAnxiety}/10
</span>
<span className="text-xl">{getAnxietyEmoji(activity.preAnxiety)}</span>
</div>
</div>
<div className="p-3 bg-green-900/20 rounded-xl border border-green-700/30">
<p className="text-xs text-purple-300 mb-1">After</p>
<div className="flex items-center gap-2">
<span className={`text-2xl font-bold ${getAnxietyColor(activity.postAnxiety)}`}>
{activity.postAnxiety}/10
</span>
<span className="text-xl">{getAnxietyEmoji(activity.postAnxiety)}</span>
</div>
</div>
</div>

{activity.wasItBad && (
<div className="p-3 bg-purple-900/30 rounded-xl border border-purple-700/30 mb-3">
<p className="text-sm text-purple-200"><strong>Was it as bad as you feared?</strong> {activity.wasItBad}</p>
</div>
)}

{activity.reflection && (
<div className="p-3 bg-purple-900/30 rounded-xl border border-purple-700/30">
<p className="text-sm text-purple-200">{activity.reflection}</p>
</div>
)}
</div>
))}
</div>
</div>
)}

</div>

{/* SCHEDULE ACTIVITY FAB */}
<button
  onClick={() => setShowNewActivity(true)}
  data-tour="schedule-activity-btn"
  className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center border-2 border-purple-400/50 z-40"
>
  <Plus className="w-6 h-6" />
</button>

{/* NEW ACTIVITY MODAL */}
{showNewActivity && (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
<div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl p-6 rounded-3xl border-2 border-purple-500/50 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
<div className="flex items-center justify-between mb-6">
<h2 className="text-2xl font-bold text-white">Schedule New Activity</h2>
<button onClick={() => setShowNewActivity(false)} className="p-2 hover:bg-purple-800/50 rounded-lg">
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-purple-300 mb-2">Activity Name *</label>
<input
type="text"
value={newActivityName}
onChange={(e) => setNewActivityName(e.target.value)}
placeholder="e.g., First Muay Thai Class"
className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
/>
</div>

<div>
<label className="block text-sm font-medium text-purple-300 mb-2">Activity Type</label>
<select
value={newActivityType}
onChange={(e) => setNewActivityType(e.target.value)}
className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
>
<option value="">Select type...</option>
{ACTIVITY_CATEGORIES.map(cat => (
<option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
))}
<option value="Other">🎯 Other</option>
</select>
</div>

<div className="grid grid-cols-2 gap-4">
<div>
<label className="block text-sm font-medium text-purple-300 mb-2">Date *</label>
<input
  type="date"
  value={newActivityDate}
  onChange={(e) => setNewActivityDate(e.target.value)}
  min={new Date().toISOString().split('T')[0]}
  className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
/>
</div>
<div>
<label className="block text-sm font-medium text-purple-300 mb-2">Time *</label>
<input
type="time"
value={newActivityTime}
onChange={(e) => setNewActivityTime(e.target.value)}
className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
/>
</div>
</div>

<div>
<label className="block text-sm font-medium text-purple-300 mb-2">Why are you doing this?</label>
<textarea
value={newActivityWhy}
onChange={(e) => setNewActivityWhy(e.target.value)}
placeholder="e.g., Good for mental health, socializing while focused on a task"
rows={3}
className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 resize-none"
/>
</div>

<div>
<label className="block text-sm font-medium text-purple-300 mb-2">
How anxious are you right now? {getAnxietyEmoji(preAnxiety)}
</label>
<div className="flex items-center gap-3 mb-2">
<input
type="range"
min="1"
max="10"
value={preAnxiety}
onChange={(e) => setPreAnxiety(parseInt(e.target.value))}
className="flex-1"
/>
<span className={`text-2xl font-bold ${getAnxietyColor(preAnxiety)}`}>{preAnxiety}/10</span>
</div>
<div className="flex justify-between text-xs text-purple-400">
<span>😊 Calm</span>
<span>😐 Moderate</span>
<span>😰 High</span>
</div>
</div>

<button
onClick={createNewActivity}
className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all shadow-xl"
>
Schedule Activity 🎯
</button>
</div>
</div>
</div>
)}


{/* DEBUG PANEL - REMOVE AFTER FIXING */}



{/* BREATHING EXERCISES MODAL */}
{showBreathing && (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-gradient-to-br from-blue-900/95 to-cyan-900/95 backdrop-blur-xl p-6 rounded-3xl border-2 border-blue-500/50 shadow-2xl max-w-lg w-full">
<div className="flex items-center justify-between mb-6">
<h2 className="text-2xl font-bold text-white">Breathing Exercises</h2>
<button onClick={() => { 
  setShowBreathing(false); 
  setBreathingActive(false); 
  setSelectedBreathing(null); 

}} className="p-2 hover:bg-blue-800/50 rounded-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

{!selectedBreathing ? (
<div className="space-y-3">
{BREATHING_EXERCISES.map((exercise, idx) => (
<button
key={idx}
onClick={() => startBreathingExercise(exercise)}
className="w-full p-5 bg-blue-950/50 rounded-2xl border-2 border-blue-700/30 hover:border-blue-500/50 transition-all text-left"
>
<div className="flex items-center justify-between mb-2">
<h3 className="font-bold text-white text-lg">{exercise.name}</h3>
<span className="text-sm text-blue-300">{exercise.duration}</span>
</div>
<p className="text-sm text-blue-300 mb-2">{exercise.benefit}</p>
<div className="flex items-center gap-2 text-blue-400">
<Play className="w-4 h-4" />
<span className="text-xs">Start exercise</span>
</div>
</button>
))}
</div>
) : (
<div className="text-center">
<div className="w-32 h-32 mx-auto mb-6 relative">
<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse opacity-50"></div>
<div className="absolute inset-4 bg-blue-900 rounded-full flex items-center justify-center">
<Wind className="w-16 h-16 text-blue-300" />
</div>
</div>

<h3 className="text-2xl font-bold text-white mb-2">{selectedBreathing.name}</h3>
<p className="text-lg text-blue-300 mb-6">{Math.floor(breathingTimer / 60)}:{(breathingTimer % 60).toString().padStart(2, '0')}</p>

<div className="bg-blue-950/50 rounded-2xl p-5 mb-6 text-left">
<ol className="space-y-2">
{selectedBreathing.steps.map((step, idx) => (
<li key={idx} className="text-sm text-blue-200 flex items-start gap-2">
<span className="font-bold text-blue-400">{idx + 1}.</span>
<span>{step}</span>
</li>
))}
</ol>
</div>

<button
onClick={stopBreathingExercise}
className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold transition-all"
>
Done - I Feel Calmer
</button>
</div>
)}
</div>
</div>
)}

{/* THOUGHT REFRAMING MODAL */}
{showReframing && (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl p-6 rounded-3xl border-2 border-purple-500/50 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
<div className="flex items-center justify-between mb-6">
<h2 className="text-2xl font-bold text-white">Reframe Your Thoughts</h2>
<button onClick={() => setShowReframing(false)} className="p-2 hover:bg-purple-800/50 rounded-lg">
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<div className="space-y-4">
{THOUGHT_REFRAMES.map((item, idx) => (
<div key={idx} className="bg-purple-950/50 rounded-2xl p-5 border-2 border-purple-700/30">
<div className="flex items-start gap-3 mb-3">
<span className="text-3xl">{item.icon}</span>
<div className="flex-1">
<div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3 mb-3">
<p className="text-sm text-red-200 font-medium">❌ Anxious thought:</p>
<p className="text-white italic">"{item.anxiousThought}"</p>
</div>
<div className="bg-green-900/20 border border-green-700/30 rounded-xl p-3">
<p className="text-sm text-green-200 font-medium">✅ Reality check:</p>
<p className="text-white">{item.reframe}</p>
</div>
</div>
</div>
</div>
))}
</div>

<button
onClick={() => setShowReframing(false)}
className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all"
>
I Feel Better Now
</button>
</div>
</div>
)}

{/* DISCOVERY MODAL */}
{showDiscovery && (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl p-6 rounded-3xl border-2 border-purple-500/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
<div className="flex items-center justify-between mb-6">
<h2 className="text-2xl font-bold text-white">Discover Activities</h2>
<button onClick={() => (false)} className="p-2 hover:bg-purple-800/50 rounded-lg">
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<p className="text-purple-200 mb-6">Find activities perfect for task-focused socializing</p>

<div className="space-y-4">
{ACTIVITY_CATEGORIES.map((category, idx) => (
<div key={idx} className="bg-purple-950/50 rounded-2xl p-5 border-2 border-purple-700/30">
<div className="flex items-start gap-3 mb-3">
<span className="text-4xl">{category.icon}</span>
<div className="flex-1">
<h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
<p className="text-sm text-purple-300 mb-3">{category.description}</p>

<div className="grid grid-cols-2 gap-2 mb-3">
<div className="bg-purple-900/30 rounded-lg p-2">
<p className="text-xs text-purple-400">Anxiety Rating</p>
<p className="text-sm font-bold text-white">{category.anxietyRating}</p>
</div>
<div className="bg-purple-900/30 rounded-lg p-2">
<p className="text-xs text-purple-400">Social Style</p>
<p className="text-sm font-bold text-white">{category.socialStyle.split(' ')[0]}</p>
</div>
</div>

<div className="flex flex-wrap gap-2">
{category.examples.map((example, i) => (
<span key={i} className="px-2 py-1 bg-purple-800/50 rounded-lg text-xs text-purple-200">
{example}
</span>
))}
</div>
</div>
</div>
</div>
))}
</div>
</div>
</div>
)}

{/* INTERACTION PLANNER MODAL */}

{/* PREP KIT MODAL */}



{/* EXPOSURE HIERARCHY MODAL */}


{/* ADD LIVE SLIDER UPDATE SCRIPT */}
<script dangerouslySetInnerHTML={{__html: `
  document.addEventListener('input', function(e) {
    if (e.target.id === 'hierarchy-difficulty') {
      const display = document.getElementById('difficulty-display');
      if (display) {
        display.textContent = e.target.value + '/10';
      }
    }
  });
`}} />

{/* DURING INTERACTION SUPPORT - STICKY BOTTOM PANEL */}
{activeInteraction && (
  <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-900/98 to-purple-900/98 backdrop-blur-xl border-t-2 border-indigo-500/50 shadow-2xl z-50 animate-slide-up">
    <div className="max-w-4xl mx-auto p-6">
      
      {/* HEADER WITH TIMER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{activeInteraction.name}</h3>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-bold">
                {Math.floor(interactionTimer / 60)}:{(interactionTimer % 60).toString().padStart(2, '0')} elapsed
              </span>
              {interactionTimer >= 300 && (
                <span className="text-yellow-300">- You've been here 5+ minutes! 🎉</span>
              )}
              {interactionTimer >= 600 && (
                <span className="text-green-300">- 10 minutes! You're crushing it! 💪</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('End this interaction and check in?')) {
              setCheckInActivity(activeInteraction);
              setActiveInteraction(null);
              setInteractionTimer(0);
            }
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl font-semibold transition-all flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          End & Check In
        </button>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        
        {/* BREATHING */}
        <button
          onClick={() => setShowBreathing(true)}
          className="p-4 bg-gradient-to-br from-blue-700/80 to-cyan-800/80 hover:from-blue-600/80 hover:to-cyan-700/80 rounded-xl border-2 border-blue-500/30 transition-all text-center"
        >
          <Wind className="w-8 h-8 text-blue-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">Breathing</p>
          <p className="text-xs text-blue-300">Calm down now</p>
        </button>

        <button
  onClick={() => {
    document.getElementById('action-planner-section')?.scrollIntoView({ behavior: 'smooth' });
    setPlannerTab('plan');
  }}
  className="p-5 bg-gradient-to-br from-indigo-800/60 to-purple-900/60 hover:from-indigo-700/60 hover:to-purple-800/60 rounded-2xl border-2 border-indigo-500/30 transition-all shadow-xl hover:shadow-2xl"
>
  <Calendar className="w-8 h-8 text-indigo-400 mb-2" />
  <h3 className="font-bold text-white mb-1">Action Planner</h3>
  <p className="text-sm text-indigo-300">Plan + prep for situations</p>
</button>

        {/* GROUNDING */}
        <button
          onClick={() => {
            const technique = GROUNDING_TECHNIQUES[0];
            showNotification(`${technique.name}: ${technique.steps[0]}`);
            setTimeout(() => showNotification(technique.steps[1]), 3000);
          }}
          className="p-4 bg-gradient-to-br from-purple-700/80 to-pink-800/80 hover:from-purple-600/80 hover:to-pink-700/80 rounded-xl border-2 border-purple-500/30 transition-all text-center"
        >
          <Brain className="w-8 h-8 text-purple-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">Ground Me</p>
          <p className="text-xs text-purple-300">5-4-3-2-1</p>
        </button>

        {/* ENCOURAGEMENT */}
        <button
          onClick={() => {
            const messages = [
              "You're doing great! Keep going! 💪",
              "The hard part is already done - you showed up! 🌟",
              "Your anxiety will pass. You're safe. ❤️",
              "Every second here is progress! 🎯",
              "You've survived 100% of your anxious moments so far! 🔥"
            ];
            showNotification(messages[Math.floor(Math.random() * messages.length)]);
          }}
          className="p-4 bg-gradient-to-br from-yellow-700/80 to-orange-800/80 hover:from-yellow-600/80 hover:to-orange-700/80 rounded-xl border-2 border-yellow-500/30 transition-all text-center"
        >
          <Sparkles className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">Encourage Me</p>
          <p className="text-xs text-yellow-300">You got this!</p>
        </button>

        {/* REALITY CHECK */}
        <button
          onClick={() => {
            const checks = [
              "Nobody is staring at you. They're focused on themselves.",
              "Your anxiety feels big, but it will pass. It always does.",
              "You don't have to be perfect. Just being here is enough.",
              "It's okay to leave if you need to. You're in control.",
              "Most people can't tell you're anxious. You're doing fine."
            ];
            showNotification(checks[Math.floor(Math.random() * checks.length)]);
          }}
          className="p-4 bg-gradient-to-br from-green-700/80 to-emerald-800/80 hover:from-green-600/80 hover:to-emerald-700/80 rounded-xl border-2 border-green-500/30 transition-all text-center"
        >
          <Target className="w-8 h-8 text-green-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">Reality Check</p>
          <p className="text-xs text-green-300">Ground yourself</p>
        </button>

      </div>

      {/* COLLAPSIBLE GROUNDING TECHNIQUES */}
      <details className="bg-indigo-950/60 rounded-xl border border-indigo-700/30 overflow-hidden">
        <summary className="p-3 cursor-pointer hover:bg-indigo-900/50 transition-colors font-semibold text-indigo-200 flex items-center gap-2">
          <ChevronDown className="w-4 h-4" />
          Need More Help? Show Grounding Techniques
        </summary>
        <div className="p-4 space-y-3 bg-indigo-950/80">
          {GROUNDING_TECHNIQUES.map((technique, idx) => (
            <div key={idx} className="p-3 bg-indigo-900/50 rounded-lg">
              <p className="font-bold text-indigo-100 mb-2 flex items-center gap-2">
                <span className="text-indigo-400">→</span>
                {technique.name}
              </p>
              <div className="space-y-1 pl-6">
                {technique.steps.map((step, stepIdx) => (
                  <p key={stepIdx} className="text-xs text-indigo-300">• {step}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* PROGRESS MESSAGES */}
      <div className="mt-4 p-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl border border-green-700/30">
        <p className="text-center text-green-200">
          {interactionTimer < 60 && "🌟 You started! That's the hardest part!"}
          {interactionTimer >= 60 && interactionTimer < 300 && "💪 You're doing it! Keep going!"}
          {interactionTimer >= 300 && interactionTimer < 600 && "🔥 5 minutes! You're stronger than your anxiety!"}
          {interactionTimer >= 600 && interactionTimer < 900 && "🎯 10 minutes! This is incredible progress!"}
          {interactionTimer >= 900 && "👑 15+ minutes! You're absolutely crushing this!"}
        </p>
      </div>

    </div>
  </div>
)}


{/* CHECK-IN MODAL */}
{checkInActivity && (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-gradient-to-br from-green-900/95 to-emerald-900/95 backdrop-blur-xl p-6 rounded-3xl border-2 border-green-500/50 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
<div className="flex items-center justify-between mb-6">
<h2 className="text-2xl font-bold text-white">Check In - How Was It?</h2>
<button onClick={() => setCheckInActivity(null)} className="p-2 hover:bg-green-800/50 rounded-lg">
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<div className="bg-green-950/50 rounded-2xl p-5 mb-6 border border-green-700/30">
<h3 className="text-xl font-bold text-white mb-2">{checkInActivity.name}</h3>
<p className="text-sm text-green-300">Great job showing up! 🎉</p>
</div>

<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-green-300 mb-2">
How anxious do you feel NOW? {getAnxietyEmoji(postAnxiety)}
</label>
<div className="flex items-center gap-3 mb-2">
<input
type="range"
min="1"
max="10"
value={postAnxiety}
onChange={(e) => setPostAnxiety(parseInt(e.target.value))}
className="flex-1"
/>
<span className={`text-2xl font-bold ${getAnxietyColor(postAnxiety)}`}>{postAnxiety}/10</span>
</div>
<div className="flex justify-between text-xs text-green-400">
<span>😊 Calm</span>
<span>😐 Moderate</span>
<span>😰 High</span>
</div>
</div>

<div className="grid grid-cols-2 gap-4 p-4 bg-green-950/30 rounded-xl border border-green-700/30">
<div>
<p className="text-xs text-green-300 mb-1">Before</p>
<p className={`text-2xl font-bold ${getAnxietyColor(checkInActivity.preAnxiety)}`}>
{checkInActivity.preAnxiety}/10
</p>
</div>
<div>
<p className="text-xs text-green-300 mb-1">After</p>
<p className={`text-2xl font-bold ${getAnxietyColor(postAnxiety)}`}>
{postAnxiety}/10
</p>
</div>
</div>

<div>
<label className="block text-sm font-medium text-green-300 mb-2">
Was it as bad as you feared?
</label>
<div className="grid grid-cols-3 gap-2">
<button
onClick={() => setWasItBad('No, much better!')}
className={`p-3 rounded-xl font-semibold text-sm transition-all ${
wasItBad === 'No, much better!'
? 'bg-green-600 text-white'
: 'bg-green-950/50 text-green-300 border border-green-700/30'
}`}
>
<Smile className="w-6 h-6 mx-auto mb-1" />
Much better!
</button>
<button
onClick={() => setWasItBad('About the same')}
className={`p-3 rounded-xl font-semibold text-sm transition-all ${
wasItBad === 'About the same'
? 'bg-yellow-600 text-white'
: 'bg-green-950/50 text-green-300 border border-green-700/30'
}`}
>
<Meh className="w-6 h-6 mx-auto mb-1" />
Same
</button>
<button
onClick={() => setWasItBad('Yes, it was hard')}
className={`p-3 rounded-xl font-semibold text-sm transition-all ${
wasItBad === 'Yes, it was hard'
? 'bg-red-600 text-white'
: 'bg-green-950/50 text-green-300 border border-green-700/30'
}`}
>
<Frown className="w-6 h-6 mx-auto mb-1" />
It was hard
</button>
</div>
</div>

<div>
<label className="block text-sm font-medium text-green-300 mb-2">
How did it go? Any thoughts?
</label>
<textarea
value={reflection}
onChange={(e) => setReflection(e.target.value)}
placeholder="Share your experience... What surprised you? What did you learn?"
rows={4}
className="w-full px-4 py-3 bg-green-950/50 border-2 border-green-700/30 rounded-xl text-white placeholder-green-400 focus:outline-none focus:border-green-500 resize-none"
/>
</div>

<button
onClick={completeActivity}
className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2"
>
<CheckCircle className="w-6 h-6" />
Complete Check-In
</button>
</div>
</div>
</div>
)}

{/* ONBOARDING OVERLAY */}
{showOnboarding && !onboardingComplete && !active && (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    style={{ background: 'rgba(10,6,25,0.85)', backdropFilter: 'blur(12px)' }}>
 
    <div className="w-full sm:max-w-lg mx-auto"
      style={{
        background: 'linear-gradient(160deg, #1a0f3c 0%, #0f172a 60%, #0c1a2e 100%)',
        borderTop: '1px solid rgba(139,92,246,0.3)',
        borderLeft: '1px solid rgba(139,92,246,0.15)',
        borderRight: '1px solid rgba(139,92,246,0.15)',
        borderRadius: '24px 24px 0 0',
        padding: '32px 28px 40px',
      }}
      className="sm:rounded-3xl sm:border sm:border-purple-500/20">
 
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            width: s === onboardingStep ? '24px' : '8px',
            height: '8px',
            borderRadius: '4px',
            background: s === onboardingStep
              ? 'linear-gradient(90deg, #a78bfa, #ec4899)'
              : s < onboardingStep
              ? 'rgba(167,139,250,0.5)'
              : 'rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
 
      {/* ── STEP 1: Welcome ── */}
      {onboardingStep === 1 && (
        <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #7c3aed, #db2777)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 0 32px rgba(124,58,237,0.4)',
          }}>
            <span style={{ fontSize: '24px' }}>💜</span>
          </div>
 
          <h2 style={{
            fontSize: '28px', fontWeight: '700', color: '#f3f0ff',
            marginBottom: '10px', lineHeight: '1.2',
          }}>
            Welcome, {user?.displayName?.split(' ')[0] || 'there'}
          </h2>
          <p style={{ color: 'rgba(196,181,253,0.8)', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
            This app helps you face situations that make you anxious — step by step,
            at your own pace. No pressure. Just progress.
          </p>
 
          <p style={{ color: 'rgba(196,181,253,0.6)', fontSize: '13px', marginBottom: '14px', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            What brings you here?
          </p>
 
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'social',  emoji: '👥', label: 'Social anxiety',          sub: 'Events, conversations, new people' },
              { id: 'medical', emoji: '🏥', label: 'Medical or work situations', sub: 'Appointments, calls, difficult conversations' },
              { id: 'general', emoji: '🎯', label: 'General fear-facing',      sub: 'Avoiding things I know I should do' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setUserGoal(opt.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: userGoal === opt.id
                    ? '1.5px solid rgba(167,139,250,0.8)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: userGoal === opt.id
                    ? 'rgba(124,58,237,0.2)'
                    : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{opt.emoji}</span>
                <div>
                  <p style={{ color: '#f3f0ff', fontWeight: '600', fontSize: '14px', margin: 0 }}>{opt.label}</p>
                  <p style={{ color: 'rgba(196,181,253,0.6)', fontSize: '12px', margin: 0, marginTop: '2px' }}>{opt.sub}</p>
                </div>
                {userGoal === opt.id && (
                  <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg,#a78bfa,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
 
          <button
            onClick={() => {
              if (!userGoal) { showNotification('Pick one to continue 👆'); return; }
              setOnboardingStep(2);
            }}
            style={{
              width: '100%', marginTop: '24px',
              padding: '15px',
              background: userGoal
                ? 'linear-gradient(135deg, #7c3aed, #db2777)'
                : 'rgba(255,255,255,0.06)',
              borderRadius: '14px', border: 'none',
              color: userGoal ? '#fff' : 'rgba(255,255,255,0.3)',
              fontWeight: '700', fontSize: '15px',
              cursor: userGoal ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: userGoal ? '0 4px 24px rgba(124,58,237,0.4)' : 'none',
            }}
          >
            Continue →
          </button>
        </div>
      )}
 
      {/* ── STEP 2: Baseline anxiety ── */}
      {onboardingStep === 2 && (
        <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #0891b2, #6366f1)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '24px' }}>📊</span>
          </div>
 
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#f3f0ff', marginBottom: '10px' }}>
            Where are you starting?
          </h2>
          <p style={{ color: 'rgba(196,181,253,0.7)', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
            On a typical day, how much does anxiety affect you in situations you avoid?
            This is your personal baseline — we'll watch it drop.
          </p>
 
          {/* Big anxiety display */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '28px 24px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>
              {baselineAnxiety <= 3 ? '😌' : baselineAnxiety <= 6 ? '😰' : '😱'}
            </div>
            <div style={{
              fontSize: '48px', fontWeight: '800',
              background: baselineAnxiety <= 3
                ? 'linear-gradient(135deg,#4ade80,#22d3ee)'
                : baselineAnxiety <= 6
                ? 'linear-gradient(135deg,#facc15,#fb923c)'
                : 'linear-gradient(135deg,#f87171,#ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '4px',
            }}>
              {baselineAnxiety}<span style={{ fontSize: '24px', opacity: 0.5 }}>/10</span>
            </div>
            <p style={{ color: 'rgba(196,181,253,0.6)', fontSize: '13px' }}>
              {baselineAnxiety <= 3 ? 'Low — mild nerves in some situations'
                : baselineAnxiety <= 6 ? 'Moderate — anxiety regularly holds you back'
                : 'High — anxiety stops you often'}
            </p>
          </div>
 
          <input
            type="range" min="1" max="10" value={baselineAnxiety}
            onChange={e => setBaselineAnxiety(parseInt(e.target.value))}
            style={{ width: '100%', marginBottom: '28px' }}
          />
 
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setOnboardingStep(1)}
              style={{
                flex: 1, padding: '14px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(196,181,253,0.7)', fontWeight: '600', fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => setOnboardingStep(3)}
              style={{
                flex: 2, padding: '14px',
                background: 'linear-gradient(135deg, #0891b2, #6366f1)',
                borderRadius: '14px', border: 'none',
                color: '#fff', fontWeight: '700', fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
              }}
            >
              That's me →
            </button>
          </div>
        </div>
      )}
 
      {/* ── STEP 3: Your ladder preview ── */}
      {onboardingStep === 3 && (
        <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #059669, #0891b2)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '24px' }}>🪜</span>
          </div>
 
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#f3f0ff', marginBottom: '10px' }}>
            Your fear ladder is ready
          </h2>
          <p style={{ color: 'rgba(196,181,253,0.7)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
            We've built you a starter ladder based on your goal. 
            You'll tackle these step by step — always starting with the easiest.
          </p>
 
          {/* Preview of starter steps */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            marginBottom: '24px',
          }}>
            {({
              social: [
                { d: 'Make eye contact and smile at a stranger', diff: 2 },
                { d: 'Say hello to someone new at an event', diff: 4 },
                { d: 'Attend a group class or activity alone', diff: 6 },
                { d: 'Introduce yourself and keep a conversation going', diff: 8 },
              ],
              medical: [
                { d: 'Look up a doctor or clinic online without calling', diff: 2 },
                { d: 'Call to book an appointment', diff: 4 },
                { d: 'Attend the appointment and answer basic questions', diff: 6 },
                { d: 'Ask the doctor a question you prepared in advance', diff: 8 },
              ],
              general: [
                { d: 'Identify one situation you\'ve been avoiding', diff: 2 },
                { d: 'Go somewhere slightly outside your comfort zone', diff: 4 },
                { d: 'Stay until anxiety drops naturally', diff: 6 },
                { d: 'Face your biggest avoided situation with a plan', diff: 8 },
              ],
            }[userGoal] || []).map((step, i, arr) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{
                  width: '28px', height: '28px', flexShrink: 0,
                  borderRadius: '8px',
                  background: step.diff <= 3
                    ? 'rgba(74,222,128,0.15)' : step.diff <= 6
                    ? 'rgba(250,204,21,0.15)' : 'rgba(248,113,113,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700',
                  color: step.diff <= 3 ? '#4ade80' : step.diff <= 6 ? '#facc15' : '#f87171',
                }}>
                  {step.diff}
                </div>
                <p style={{
                  color: 'rgba(243,240,255,0.85)', fontSize: '13px',
                  margin: 0, lineHeight: '1.4',
                }}>
                  {step.d}
                </p>
              </div>
            ))}
          </div>
 
          <p style={{
            color: 'rgba(196,181,253,0.5)', fontSize: '12px',
            textAlign: 'center', marginBottom: '20px',
          }}>
            You can add, edit, or remove steps anytime in the Action Planner
          </p>
 
          <button
            onClick={async () => {
              // Save profile + seed hierarchy + mark onboarding done
              await saveUserProfile({ goal: userGoal, baselineAnxiety, completedAt: Date.now() });
              await seedStarterHierarchy(userGoal);
              localStorage.setItem('onboardingComplete', 'true');
              setOnboardingComplete(true);
              setShowOnboarding(false);
              showNotification("🎉 Your ladder is ready. Let's start climbing!");
            }}
            style={{
              width: '100%', padding: '16px',
              background: 'linear-gradient(135deg, #059669, #0891b2)',
              borderRadius: '14px', border: 'none',
              color: '#fff', fontWeight: '700', fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 28px rgba(5,150,105,0.4)',
              letterSpacing: '0.01em',
            }}
          >
            Let's start climbing 🪜
          </button>
        </div>
      )}
 
    </div>
  </div>
)}

{/* NOTIFICATION */}
{notification && (
<div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-up border-2 border-purple-400/50 backdrop-blur-sm z-50">
<p className="font-bold text-center">{notification}</p>
</div>
)}

<style>{`
@keyframes slide-up {
from {
transform: translateY(100px);
opacity: 0;
}
to {
transform: translateY(0);
opacity: 1;
}
}

@keyframes fade-in {
from {
opacity: 0;
}
to {
opacity: 1;
}
}

@keyframes scale-in {
from {
transform: scale(0.9);
opacity: 0;
}
to {
transform: scale(1);
opacity: 1;
}
}

.animate-slide-up {
animation: slide-up 0.3s ease-out;
}

.animate-fade-in {
animation: fade-in 0.2s ease-out;
}

.animate-scale-in {
animation: scale-in 0.3s ease-out;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

html {
scroll-behavior: smooth;
-webkit-overflow-scrolling: touch;
}

button, a, input, select, textarea {
-webkit-tap-highlight-color: transparent;
touch-action: manipulation;
}

button {
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
outline: 2px solid #a78bfa;
outline-offset: 2px;
}

* {
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

input[type="range"] {
-webkit-appearance: none;
appearance: none;
width: 100%;
height: 8px;
border-radius: 5px;
background: rgba(139, 92, 246, 0.3);
outline: none;
}

input[type="range"]::-webkit-slider-thumb {
-webkit-appearance: none;
appearance: none;
width: 20px;
height: 20px;
border-radius: 50%;
background: linear-gradient(135deg, #a78bfa, #ec4899);
cursor: pointer;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

input[type="range"]::-moz-range-thumb {
width: 20px;
height: 20px;
border-radius: 50%;
background: linear-gradient(135deg, #a78bfa, #ec4899);
cursor: pointer;
border: none;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
`}</style>
</div>
);
}
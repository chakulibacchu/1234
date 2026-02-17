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

const [showInteractionPlanner, setShowInteractionPlanner] = useState(false);
const [showExposureHierarchy, setShowExposureHierarchy] = useState(false);
const [showPrepKit, setShowPrepKit] = useState(null); // stores situation type
const [exposureHierarchy, setExposureHierarchy] = useState([]);
const [selectedInteraction, setSelectedInteraction] = useState(null);
const [duringInteractionMode, setDuringInteractionMode] = useState(null);
const [interactionStartTime, setInteractionStartTime] = useState(null);





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
    showInteractionPlanner,
    showExposureHierarchy,
    showPrepKit: !!showPrepKit,
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
    showInteractionPlanner,
    showExposureHierarchy,
    showPrepKit: !!showPrepKit,
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
    showInteractionPlanner,
    showExposureHierarchy,
    showPrepKit: !!showPrepKit,
  });
}, [active, showBreathing, showReframing, showDiscovery, showInteractionPlanner, showExposureHierarchy, showPrepKit]);

// Auto-start inline tour on first modal open
useEffect(() => {
  if (showInteractionPlanner && !hasSeenInteractionPlannerTour && interactionPlannerTourStep === 0) {
    setTimeout(() => {
      setInteractionPlannerTourStep(1);
    }, 500);
  }
}, [showInteractionPlanner, hasSeenInteractionPlannerTour]);

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
          showInteractionPlanner,
          showExposureHierarchy,
          showPrepKit: !!showPrepKit,
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
}, [active, stepIndex, showBreathing, showReframing, showDiscovery, showInteractionPlanner, showExposureHierarchy, showPrepKit, setStepIndex]);  // ✅ Updated dependencies
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



useEffect(() => {
  const slider = document.getElementById('hierarchy-difficulty');
  const display = document.getElementById('difficulty-display');
  
  if (slider && display) {
    const updateDisplay = () => {
      display.textContent = slider.value + '/10';
    };
    
    slider.addEventListener('input', updateDisplay);
    return () => slider.removeEventListener('input', updateDisplay);
  }
}, [showExposureHierarchy]);

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
        if (showInteractionPlanner) setShowInteractionPlanner(false);
        if (showExposureHierarchy) setShowExposureHierarchy(false);
        if (showPrepKit) setShowPrepKit(false);
        
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
}, [active, stepIndex, showBreathing, showReframing, showDiscovery, showInteractionPlanner, showExposureHierarchy, showPrepKit]);
// ============================================================================
// FIREBASE OPERATIONS
// ============================================================================

const handleComplete = () => {
  // User finished interacting with the module
  setShowInteractionPlanner(false); // Close the modal
  
  // Resume the tour to next step after a short delay
  setTimeout(() => {
    resumeTour();
  }, 500);
};

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

<div className="p-6 max-w-6xl mx-auto">

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

  {/* TOUR BUTTON */}
<button
  onClick={() => {
    console.log('🎯 TOUR BUTTON CLICKED!');
    console.log('Script:', mentorScriptBlogView);
    startJourney(mentorScriptBlogView);
  }}
  style={{
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 999999,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }}
>
  🎯 Take Tour
</button>

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

<button
  onClick={() => setShowInteractionPlanner(true)}
  id="interaction-planner-button"
  className="p-5 bg-gradient-to-br from-indigo-800/60 to-purple-900/60 hover:from-indigo-700/60 hover:to-purple-800/60 rounded-2xl border-2 border-indigo-500/30 transition-all shadow-xl hover:shadow-2xl"
>
  <Calendar className="w-8 h-8 text-indigo-400 mb-2" />
  <h3 className="font-bold text-white mb-1">Interaction Planner</h3>
  <p className="text-sm text-indigo-300">Prepare for situations</p>
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

{/* ACHIEVEMENTS */}
<div data-tour="achievements-section" className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md p-6 rounded-3xl border-2 border-purple-500/30 mb-8 shadow-2xl">
<div className="flex items-center gap-3 mb-6">
<Award className="w-6 h-6 text-yellow-400" />
<h2 className="text-2xl font-bold text-purple-100">Achievements</h2>
</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
{achievementsData.map(achievement => (
<div
key={achievement.id}
className={`p-5 rounded-2xl border-2 text-center transition-all ${
achievement.unlocked
? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-xl'
: 'bg-purple-950/40 border-purple-700/30 opacity-70'
}`}
>
<div className="text-4xl mb-2">{achievement.icon}</div>
<p className="text-sm font-bold text-purple-100 mb-1">{achievement.title}</p>
<p className="text-xs text-purple-300 mb-2">{achievement.progress}/{achievement.threshold}</p>
{!achievement.unlocked && (
<div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
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

{/* UPCOMING ACTIVITIES */}
{upcomingActivities.length > 0 && (
  <div id="upcoming-section" className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md p-6 rounded-3xl border-2 border-purple-500/30 mb-8 shadow-2xl">
    <div className="flex items-center gap-3 mb-6">
      <Calendar className="w-6 h-6 text-purple-400" />
      <h2 className="text-2xl font-bold text-purple-100">All Upcoming Activities</h2>
      <span className="text-sm text-purple-400">({upcomingActivities.length})</span>
    </div>

    <div className="space-y-3">
      {upcomingActivities.map((activity) => (
        <div key={activity.id} className="p-4 bg-purple-950/30 rounded-2xl border border-purple-700/30 hover:border-purple-600/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">{activity.name}</h3>
              <div className="flex items-center gap-2 text-sm text-purple-400 mb-2">
                <span className="text-2xl">{ACTIVITY_CATEGORIES.find(c => c.name === activity.type)?.icon || '🎯'}</span>
                <span>{activity.type}</span>
              </div>
              <p className="text-sm text-purple-400">
                {new Date(activity.scheduledDate).toLocaleDateString()} at {new Date(activity.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
            <div className="text-right flex items-center gap-3">
              <div>
                <div className="text-2xl font-bold text-pink-400">{getTimeUntil(activity.scheduledDate)}</div>
                <button
                  onClick={() => setCheckInActivity(activity)}
                  className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-semibold transition-all"
                >
                  Check In
                </button>
              </div>
              <button
                onClick={() => deleteActivityFromFirestore(activity.id)}
                className="p-2 hover:bg-red-900/50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

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
{showInteractionPlanner && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl p-6 rounded-3xl border-2 border-indigo-500/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      
      {/* ⭐ ADD THIS INLINE TOUR OVERLAY ⭐ */}
      {interactionPlannerTourStep > 0 && getCurrentTourStep() && (
        <>
          

          {/* Tour Highlight Styles */}
          <style jsx>{`
            @keyframes tourPulse {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7),
                            0 0 0 4px rgba(168, 85, 247, 0.4),
                            0 0 20px 8px rgba(168, 85, 247, 0.3);
              }
              50% {
                box-shadow: 0 0 0 8px rgba(168, 85, 247, 0.4),
                            0 0 0 12px rgba(168, 85, 247, 0.2),
                            0 0 30px 15px rgba(168, 85, 247, 0.2);
              }
            }
            
            .tour-highlight-element {
              position: relative !important;
              z-index: 101 !important;
              animation: tourPulse 2s ease-in-out infinite;
              border-radius: 12px;
              outline: 4px solid rgba(168, 85, 247, 0.8) !important;
              outline-offset: 4px;
              pointer-events: auto !important;
            }
          `}</style>

          {/* Tour Popover */}
          <TourPopover 
            step={getCurrentTourStep()}
            currentStep={interactionPlannerTourStep}
            totalSteps={INTERACTION_PLANNER_TOUR_STEPS.length}
            onNext={handleNextTourStep}
            onSkip={handleSkipTour}
          />
        </>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Interaction Planner</h2>
            <p className="text-sm text-indigo-300">Prepare for anxiety-inducing situations</p>
          </div>
        </div>
       <button
  onClick={() => {
    setShowInteractionPlanner(false);
    handleComplete();
  }}
  className="p-2 hover:bg-indigo-800/50 rounded-lg transition-colors"
>
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>
      </div>

      {/* MAIN SECTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* EXPOSURE HIERARCHY */}
        <button
          onClick={() => {
            setShowInteractionPlanner(false);
            setShowExposureHierarchy(true);
          }}
          id="exposure-hierarchy-section"
          className="p-6 bg-gradient-to-br from-purple-800/60 to-pink-900/60 rounded-2xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-purple-600/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-purple-300" />
            </div>
            <ArrowRight className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">My Exposure Hierarchy</h3>
          <p className="text-sm text-purple-300 mb-3">Visual ladder of feared situations ranked by difficulty</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-purple-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-1/3"></div>
            </div>
            <span className="text-xs text-purple-400">{exposureHierarchy.length} steps</span>
          </div>
        </button>

        {/* UPCOMING INTERACTIONS */}
        <button
          onClick={() => {
            // Scroll to upcoming activities section
            setShowInteractionPlanner(false);
            document.querySelector('#upcoming-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-6 bg-gradient-to-br from-blue-800/60 to-indigo-900/60 rounded-2xl border-2 border-blue-500/30 hover:border-blue-400/50 transition-all text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-blue-600/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-blue-300" />
            </div>
            <ArrowRight className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Upcoming Interactions</h3>
          <p className="text-sm text-blue-300 mb-3">View and manage planned exposures</p>
          <div className="flex items-center gap-2 text-sm">
            <Bell className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300">{upcomingActivities.length} scheduled</span>
          </div>
        </button>

      </div>

      {/* PLAN NEW INTERACTION */}
      <div className="bg-gradient-to-br from-indigo-950/80 to-purple-950/80 rounded-2xl border-2 border-indigo-500/30 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Plus className="w-6 h-6 text-indigo-400" />
          <h3 className="text-xl font-bold text-white">Plan New Interaction</h3>
        </div>

        {/* SITUATION TYPE SELECTION */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-indigo-300 mb-3">
            What type of situation? *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SITUATION_TYPES.map((type) => (
              <button
                key={type.id}
                id={`situation-type-${type.id}`}  // ADD THIS LINE
                onClick={() => setNewActivityType(type.name)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  newActivityType === type.name
                    ? `bg-${type.color}-600/30 border-${type.color}-500 shadow-lg`
                    : 'bg-indigo-950/40 border-indigo-700/30 hover:border-indigo-600/50'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <p className="text-sm font-semibold text-white">{type.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVITY NAME */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-indigo-300 mb-2">
            What specifically? *
          </label>
          <input
            type="text"
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            placeholder="e.g., Doctor appointment for persistent cough"
            className="w-full px-4 py-3 bg-indigo-950/50 border-2 border-indigo-500/30 rounded-xl text-white placeholder-indigo-400 focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* DATE & TIME */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-indigo-300 mb-2">Date *</label>
            <input
  type="date"
  value={newActivityDate}
  onChange={(e) => setNewActivityDate(e.target.value)}
  min={new Date().toISOString().split('T')[0]}
  className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
/>
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-300 mb-2">Time *</label>
            <input
              type="time"
              value={newActivityTime}
              onChange={(e) => setNewActivityTime(e.target.value)}
              className="w-full px-4 py-3 bg-indigo-950/50 border-2 border-indigo-500/30 rounded-xl text-white focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* DIFFICULTY RATING */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-indigo-300 mb-2">
            How difficult does this feel? {getAnxietyEmoji(preAnxiety)}
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
            <span className={`text-2xl font-bold ${getAnxietyColor(preAnxiety)}`}>
              {preAnxiety}/10
            </span>
          </div>
          <div className="flex justify-between text-xs text-indigo-400">
            <span>😊 Easy</span>
            <span>😐 Moderate</span>
            <span>😰 Very Difficult</span>
          </div>
        </div>

        {/* WHY */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-indigo-300 mb-2">
            Why are you doing this?
          </label>
          <textarea
            value={newActivityWhy}
            onChange={(e) => setNewActivityWhy(e.target.value)}
            placeholder="e.g., Need to address health concerns, can't keep avoiding this"
            rows={2}
            className="w-full px-4 py-3 bg-indigo-950/50 border-2 border-indigo-500/30 rounded-xl text-white placeholder-indigo-400 focus:outline-none focus:border-indigo-400 resize-none"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={createNewActivity}
            id="schedule-interaction-btn"
            className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Schedule It
          </button>
          
          <button
            onClick={() => {
              if (newActivityType) {
                const situationType = SITUATION_TYPES.find(t => t.name === newActivityType);
                if (situationType) {
                  setShowInteractionPlanner(false);
                  setShowPrepKit(situationType.id);
                }
              } else {
                showNotification('Please select a situation type first');
              }
            }}
            id="prep-kit-btn"
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <Target className="w-5 h-5" />
            View Prep Kit
          </button>
        </div>
      </div>

      {/* QUICK ACCESS TOOLS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setShowInteractionPlanner(false);
            setShowBreathing(true);
          }}
          className="p-4 bg-blue-800/40 hover:bg-blue-800/60 rounded-xl border border-blue-500/30 transition-all text-center"
        >
          <Wind className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-blue-300">Breathing</p>
        </button>

        <button
          onClick={() => {
            setShowInteractionPlanner(false);
            setShowReframing(true);
          }}
          className="p-4 bg-purple-800/40 hover:bg-purple-800/60 rounded-xl border border-purple-500/30 transition-all text-center"
        >
          <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-purple-300">Reframe</p>
        </button>

        <button
          onClick={() => {
            setShowInteractionPlanner(false);
            setShowDiscovery(true);
          }}
          className="p-4 bg-pink-800/40 hover:bg-pink-800/60 rounded-xl border border-pink-500/30 transition-all text-center"
        >
          <Search className="w-6 h-6 text-pink-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-pink-300">Discover</p>
        </button>

        <button
          onClick={() => {
            const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
            showNotification(randomQuote);
          }}
          className="p-4 bg-yellow-800/40 hover:bg-yellow-800/60 rounded-xl border border-yellow-500/30 transition-all text-center"
        >
          <Sparkles className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-yellow-300">Motivate Me</p>
        </button>
      </div>

    </div>
  </div>
)}

{/* PREP KIT MODAL */}
{showPrepKit && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gradient-to-br from-indigo-900/95 to-blue-900/95 backdrop-blur-xl p-6 rounded-3xl border-2 border-indigo-500/50 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            {SITUATION_TYPES.find(t => t.id === showPrepKit)?.icon && (
              <span className="text-2xl">{SITUATION_TYPES.find(t => t.id === showPrepKit).icon}</span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {SITUATION_TYPES.find(t => t.id === showPrepKit)?.name} Prep Kit
            </h2>
            <p className="text-sm text-indigo-300">Everything you need to prepare</p>
          </div>
        </div>
        <button 
          onClick={() => setShowPrepKit(null)} 
          className="p-2 hover:bg-indigo-800/50 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* PREP KIT CONTENT */}
      {PREP_KITS[showPrepKit] ? (
        <div className="space-y-5">
          
          {/* SECTIONS */}
          {PREP_KITS[showPrepKit].sections.map((section, idx) => (
            <div 
              key={idx}
              className="bg-indigo-950/50 rounded-2xl border-2 border-indigo-700/30 p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600/30 rounded-xl flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{section.title}</h3>
              </div>

              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx}
                    className="flex items-start gap-3 p-3 bg-indigo-900/30 rounded-xl hover:bg-indigo-900/50 transition-colors"
                  >
                    <div className="w-6 h-6 bg-indigo-600/40 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-indigo-200">{itemIdx + 1}</span>
                    </div>
                    <p className="text-indigo-100 text-sm flex-1 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* VISUALIZATION EXERCISE */}
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl border-2 border-purple-500/30 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600/30 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Visualization Exercise</h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-purple-950/40 rounded-xl">
                <p className="text-purple-200 text-sm leading-relaxed mb-3">
                  Close your eyes and imagine yourself going through this situation successfully:
                </p>
                <ul className="space-y-2 text-sm text-purple-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Picture yourself arriving calm and prepared</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>See yourself handling it with confidence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Imagine the relief you'll feel when it's done</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Visualize yourself proud of facing this fear</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setShowPrepKit(null);
                  setShowBreathing(true);
                }}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Wind className="w-5 h-5" />
                Do Breathing Exercise
              </button>
            </div>
          </div>

          {/* WHAT TO EXPECT */}
          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl border-2 border-blue-500/30 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600/30 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">What to Expect</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-blue-950/40 rounded-xl">
                <p className="text-sm text-blue-200 mb-2">
                  <strong className="text-blue-100">Your anxiety will likely be highest BEFORE</strong>, not during
                </p>
                <p className="text-xs text-blue-300">
                  The anticipation is almost always worse than the reality
                </p>
              </div>

              <div className="p-3 bg-blue-950/40 rounded-xl">
                <p className="text-sm text-blue-200 mb-2">
                  <strong className="text-blue-100">It's okay if you're not perfect</strong>
                </p>
                <p className="text-xs text-blue-300">
                  The goal is to show up, not to be flawless
                </p>
              </div>

              <div className="p-3 bg-blue-950/40 rounded-xl">
                <p className="text-sm text-blue-200 mb-2">
                  <strong className="text-blue-100">You can leave or take breaks</strong>
                </p>
                <p className="text-xs text-blue-300">
                  You're in control and can adjust as needed
                </p>
              </div>

              <div className="p-3 bg-blue-950/40 rounded-xl">
                <p className="text-sm text-blue-200 mb-2">
                  <strong className="text-blue-100">Most people won't notice your anxiety</strong>
                </p>
                <p className="text-xs text-blue-300">
                  Internal feelings don't show externally as much as you think
                </p>
              </div>
            </div>
          </div>

          {/* PRACTICAL TIPS */}
          {showPrepKit === 'medical' && (
            <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 rounded-2xl border-2 border-red-500/30 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-600/30 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Medical Appointment Tips</h3>
              </div>

              <div className="space-y-2 text-sm text-red-200">
                <p className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✓</span>
                  <span>Bring a list of medications you're currently taking</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✓</span>
                  <span>Write down your top 3 concerns beforehand</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✓</span>
                  <span>It's okay to bring someone with you for support</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✓</span>
                  <span>Take notes during the appointment (or ask if you can record)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✓</span>
                  <span>Request copies of test results for your records</span>
                </p>
              </div>
            </div>
          )}

          {showPrepKit === 'social' && (
            <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-2xl border-2 border-pink-500/30 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-600/30 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Social Event Tips</h3>
              </div>

              <div className="space-y-2 text-sm text-pink-200">
                <p className="flex items-start gap-2">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span>Arrive slightly after start time (not first, not last)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span>Set a minimum time (like 30 mins) then you can leave guilt-free</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span>Have a friend you can text during bathroom breaks</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span>Offer to help the host - gives you something to do</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span>Remember: Most people are also nervous about socializing</span>
                </p>
              </div>
            </div>
          )}

          {showPrepKit === 'work' && (
            <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-2xl border-2 border-blue-500/30 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600/30 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Work/School Tips</h3>
              </div>

              <div className="space-y-2 text-sm text-blue-200">
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span>Prepare key points in writing beforehand</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span>Practice saying your main point out loud first</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span>It's professional to say "Let me think about that"</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span>Follow up in writing to confirm what was discussed</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span>Remember: Advocating for yourself is expected, not rude</span>
                </p>
              </div>
            </div>
          )}

          {showPrepKit === 'public' && (
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-2xl border-2 border-green-500/30 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600/30 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Public Place Tips</h3>
              </div>

              <div className="space-y-2 text-sm text-green-200">
                <p className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Go during off-peak hours your first few times</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Look up the layout online so you know where things are</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Headphones are socially acceptable almost everywhere</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Set a timer for just 15-20 minutes - that's enough!</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>People are genuinely not watching or judging you</span>
                </p>
              </div>
            </div>
          )}

          {/* GROUNDING TECHNIQUES */}
          <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-2xl border-2 border-cyan-500/30 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-600/30 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white">If You Get Overwhelmed During</h3>
            </div>

            <div className="space-y-3">
              {GROUNDING_TECHNIQUES.map((technique, idx) => (
                <div key={idx} className="p-4 bg-cyan-950/40 rounded-xl">
                  <p className="font-bold text-cyan-100 mb-2 flex items-center gap-2">
                    <span className="text-cyan-400">→</span>
                    {technique.name}
                  </p>
                  <div className="space-y-1">
                    {technique.steps.map((step, stepIdx) => (
                      <p key={stepIdx} className="text-xs text-cyan-300 pl-4">
                        {step}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={() => {
                setShowPrepKit(null);
                setShowInteractionPlanner(true);
              }}
              className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              Back to Planner
            </button>

            <button
              onClick={() => {
                setShowPrepKit(null);
                showNotification('You\'re prepared! Remember: the anticipation is worse than reality 💪');
              }}
              className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              I'm Ready!
            </button>
          </div>

        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-indigo-300">No prep kit available for this situation type yet.</p>
        </div>
      )}

    </div>
  </div>
)}


{/* EXPOSURE HIERARCHY MODAL */}
{showExposureHierarchy && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl p-6 rounded-3xl border-2 border-purple-500/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">My Exposure Hierarchy</h2>
            <p className="text-sm text-purple-300">Your fear ladder - ranked by difficulty</p>
          </div>
        </div>
        <button 
          onClick={() => setShowExposureHierarchy(false)} 
          className="p-2 hover:bg-purple-800/50 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* EXPLANATION */}
      <div className="bg-purple-950/50 rounded-2xl border-2 border-purple-700/30 p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">How This Works</h3>
            <p className="text-sm text-purple-200 mb-3">
              An exposure hierarchy helps you gradually face fears by starting with easier situations and building up to harder ones. Rate each situation by difficulty, then tackle them in order.
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <Target className="w-4 h-4" />
              <span>Start with steps rated 3-5 for best results</span>
            </div>
          </div>
        </div>
      </div>

      {/* ADD NEW STEP SECTION */}
      <div className="bg-gradient-to-br from-indigo-950/80 to-purple-950/80 rounded-2xl border-2 border-indigo-500/30 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Plus className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Add New Step</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-indigo-300 mb-2">
              Describe the situation
            </label>
            <input
              type="text"
              placeholder="e.g., Make eye contact with cashier"
              className="w-full px-4 py-3 bg-indigo-950/50 border-2 border-indigo-500/30 rounded-xl text-white placeholder-indigo-400 focus:outline-none focus:border-indigo-400"
              id="hierarchy-description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-indigo-300 mb-2">
              Difficulty Level (1 = easiest, 10 = hardest)
            </label>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="range"
                min="1"
                max="10"
                defaultValue="5"
                className="flex-1"
                id="hierarchy-difficulty"
              />
              <span className="text-2xl font-bold text-indigo-300 min-w-[60px]" id="difficulty-display">5/10</span>
            </div>
            <div className="flex justify-between text-xs text-indigo-400">
              <span>😊 Easy</span>
              <span>😐 Moderate</span>
              <span>😰 Very Hard</span>
            </div>
          </div>

          <button
            onClick={() => {
              const description = document.getElementById('hierarchy-description').value;
              const difficulty = parseInt(document.getElementById('hierarchy-difficulty').value);
              
              if (!description.trim()) {
                showNotification('Please describe the situation');
                return;
              }

              const newStep = {
                id: Date.now().toString(),
                description: description.trim(),
                difficulty: difficulty,
                status: 'pending', // pending, in-progress, completed
                dateAdded: Date.now(),
                completedDate: null,
                attempts: 0,
                notes: []
              };

              const updatedHierarchy = [...exposureHierarchy, newStep].sort((a, b) => a.difficulty - b.difficulty);
              setExposureHierarchy(updatedHierarchy);
              saveExposureHierarchyToFirebase(updatedHierarchy);

              // Clear inputs
              document.getElementById('hierarchy-description').value = '';
              document.getElementById('hierarchy-difficulty').value = '5';
              document.getElementById('difficulty-display').textContent = '5/10';

              showNotification('✨ Step added to your hierarchy!');
            }}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add to Hierarchy
          </button>
        </div>
      </div>

      {/* THE LADDER - VISUAL HIERARCHY */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Your Fear Ladder
          </h3>
          <div className="text-sm text-purple-300">
            {exposureHierarchy.filter(s => s.status === 'completed').length} / {exposureHierarchy.length} completed
          </div>
        </div>

        {exposureHierarchy.length === 0 ? (
          <div className="text-center py-12 bg-purple-950/30 rounded-2xl border-2 border-purple-700/30">
            <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-purple-300 mb-2">Your hierarchy is empty</p>
            <p className="text-sm text-purple-400">Add your first step above to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exposureHierarchy
              .sort((a, b) => b.difficulty - a.difficulty) // Hardest at top (like a ladder)
              .map((step, index) => {
                const isCurrentStep = step.status === 'in-progress';
                const isCompleted = step.status === 'completed';
                const isPending = step.status === 'pending';
                const position = exposureHierarchy.length - index; // Position on ladder

                return (
                  <div
                    key={step.id}
                    className={`relative p-5 rounded-2xl border-2 transition-all ${
                      isCurrentStep
                        ? 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-500/50 shadow-xl'
                        : isCompleted
                        ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 opacity-75'
                        : 'bg-purple-950/40 border-purple-700/30 hover:border-purple-600/50'
                    }`}
                  >
                    {/* STEP NUMBER BADGE */}
                    <div className={`absolute -left-3 -top-3 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-xl ${
                      isCurrentStep
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white'
                        : isCompleted
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                        : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                    }`}>
                      {isCompleted ? '✓' : position}
                    </div>

                    <div className="flex items-start gap-4 ml-6">
                      {/* MAIN CONTENT */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-lg font-bold text-white flex-1">{step.description}</h4>
                          
                          {/* DIFFICULTY INDICATOR */}
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[...Array(10)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-6 rounded-full ${
                                    i < step.difficulty
                                      ? step.difficulty <= 3
                                        ? 'bg-green-500'
                                        : step.difficulty <= 6
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                      : 'bg-purple-900/30'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className={`text-sm font-bold ${
                              step.difficulty <= 3 ? 'text-green-400' :
                              step.difficulty <= 6 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {step.difficulty}/10
                            </span>
                          </div>
                        </div>

                        {/* STATUS & META INFO */}
                        <div className="flex items-center gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-green-300">Completed {new Date(step.completedDate).toLocaleDateString()}</span>
                              </>
                            )}
                            {isCurrentStep && (
                              <>
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-300">Current Step - You got this!</span>
                              </>
                            )}
                            {isPending && (
                              <>
                                <Clock className="w-4 h-4 text-purple-400" />
                                <span className="text-purple-300">Not started yet</span>
                              </>
                            )}
                          </div>

                          {step.attempts > 0 && (
                            <div className="flex items-center gap-1 text-purple-400">
                              <Trophy className="w-4 h-4" />
                              <span>{step.attempts} attempt{step.attempts > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>

                        {/* NOTES */}
                        {step.notes && step.notes.length > 0 && (
                          <div className="p-3 bg-purple-900/30 rounded-xl border border-purple-700/30 mb-3">
                            <p className="text-sm text-purple-200 italic">"{step.notes[step.notes.length - 1]}"</p>
                          </div>
                        )}

                        {/* ACTION BUTTONS */}
                        <div className="flex items-center gap-2">
                          {!isCompleted && (
                            <>
                              <button
                                onClick={() => {
                                  const updatedHierarchy = exposureHierarchy.map(s => ({
                                    ...s,
                                    status: s.id === step.id ? 'in-progress' : s.status
                                  }));
                                  setExposureHierarchy(updatedHierarchy);
                                  saveExposureHierarchyToFirebase(updatedHierarchy);
                                  showNotification('🎯 Marked as current step!');
                                }}
                                className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              >
                                <Target className="w-4 h-4" />
                                {isCurrentStep ? 'Current' : 'Set as Current'}
                              </button>

                              <button
                                onClick={() => {
                                  const note = prompt('Add a note about this attempt:');
                                  if (!note) return;

                                  const updatedHierarchy = exposureHierarchy.map(s => {
                                    if (s.id === step.id) {
                                      return {
                                        ...s,
                                        attempts: s.attempts + 1,
                                        notes: [...(s.notes || []), note]
                                      };
                                    }
                                    return s;
                                  });
                                  setExposureHierarchy(updatedHierarchy);
                                  saveExposureHierarchyToFirebase(updatedHierarchy);
                                  showNotification('📝 Progress noted!');
                                }}
                                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              >
                                <Edit3 className="w-4 h-4" />
                                Add Note
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Mark "${step.description}" as completed?`)) {
                                    const updatedHierarchy = exposureHierarchy.map(s => {
                                      if (s.id === step.id) {
                                        return {
                                          ...s,
                                          status: 'completed',
                                          completedDate: Date.now()
                                        };
                                      }
                                      return s;
                                    });
                                    setExposureHierarchy(updatedHierarchy);
                                    saveExposureHierarchyToFirebase(updatedHierarchy);
                                    showNotification('🎉 Step completed! You\'re making progress!');
                                  }
                                }}
                                className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Complete
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Delete "${step.description}" from hierarchy?`)) {
                                const updatedHierarchy = exposureHierarchy.filter(s => s.id !== step.id);
                                setExposureHierarchy(updatedHierarchy);
                                saveExposureHierarchyToFirebase(updatedHierarchy);
                                showNotification('Step removed');
                              }
                            }}
                            className="ml-auto p-2 hover:bg-red-900/50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* PROGRESS STATS */}
      {exposureHierarchy.length > 0 && (
        <div className="bg-gradient-to-br from-purple-950/50 to-indigo-950/50 rounded-2xl border-2 border-purple-500/30 p-5 mb-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Your Progress
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {exposureHierarchy.filter(s => s.status === 'in-progress').length}
              </p>
              <p className="text-xs text-purple-300">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">
                {exposureHierarchy.filter(s => s.status === 'completed').length}
              </p>
              <p className="text-xs text-purple-300">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">
                {exposureHierarchy.filter(s => s.status === 'pending').length}
              </p>
              <p className="text-xs text-purple-300">Pending</p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="h-4 bg-purple-900/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              style={{
                width: `${exposureHierarchy.length > 0 
                  ? (exposureHierarchy.filter(s => s.status === 'completed').length / exposureHierarchy.length) * 100 
                  : 0}%`
              }}
            />
          </div>
        </div>
      )}

      {/* TIPS */}
      <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl border-2 border-blue-500/30 p-5">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white">Hierarchy Tips</h3>
        </div>
        <div className="space-y-2 text-sm text-blue-200">
          <p className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Start with steps rated 3-5 for the best success rate</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>It's okay to repeat steps multiple times before moving up</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Break down hard steps into smaller sub-steps</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Celebrate each completion - progress is progress!</span>
          </p>
        </div>
      </div>

    </div>
  </div>
)}

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
{showOnboarding && activities.length === 0 && !active && (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
<div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl p-8 rounded-3xl border-2 border-purple-500/50 shadow-2xl max-w-md w-full animate-scale-in">
<div className="text-center mb-6">
<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
<Heart className="w-8 h-8 text-white" />
</div>
<h2 className="text-3xl font-bold text-white mb-2">Welcome! 🎉</h2>
<p className="text-purple-200">Your journey to facing fears starts here</p>
</div>

<div className="space-y-4 mb-6">
<div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
<Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
<div>
<h3 className="font-bold text-white text-sm mb-1">Schedule Activities</h3>
<p className="text-purple-300 text-xs">Plan activities you're nervous about</p>
</div>
</div>

<div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
<Wind className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
<div>
<h3 className="font-bold text-white text-sm mb-1">Calm Your Nerves</h3>
<p className="text-purple-300 text-xs">Use breathing exercises before activities</p>
</div>
</div>

<div className="flex items-start gap-3 p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
<TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
<div>
<h3 className="font-bold text-white text-sm mb-1">Track Progress</h3>
<p className="text-purple-300 text-xs">Watch your anxiety decrease over time</p>
</div>
</div>
</div>

<button
onClick={() => setShowOnboarding(false)}
className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-white transition-all shadow-xl"
>
Let's Get Started! 🚀
</button>
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
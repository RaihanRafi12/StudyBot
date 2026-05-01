import { useState, useEffect } from 'react';
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';
import { Dashboard } from './components/dashboard';
import { ResourcesView } from './components/resources-view';
import { UserProfile } from './components/user-profile';
import { AuthScreen } from './components/auth-screen';
import { AccessRequestModal } from './components/access-request-modal';
import { RatingModal } from './components/rating-modal';
import { UploadView } from './components/upload-view';
import { ActivityLog } from './components/activity-log';
import { FullCalendar } from './components/full-calendar';
import { SettingsView } from './components/settings-view';
import { NotificationPanel } from './components/notification-panel';
import { ResourceListModal } from './components/resource-list-modal';
import { ResourceDetailModal } from './components/resource-detail-modal';
import { LandingPage } from './components/landing-page';
import { Resource } from './components/resource-card';
import { AdminApp } from './components/admin-app';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from './components/ui/button';
import { X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  institution: string;
  major: string;
  year: string;
  points: number;
  uploadCount: number;
  accessCount: number;
  monthlyAccess: number;
}

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  time: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'exam' | 'deadline' | 'reminder' | 'class';
  description?: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // User state
  const [user, setUser] = useState<User>({
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    institution: 'University of Technology',
    major: 'Computer Science',
    year: '3rd Year',
    points: 0,
    uploadCount: 0,
    accessCount: 2,
    monthlyAccess: 2,
  });

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Activities
  const [activities, setActivities] = useState<Activity[]>([]);

  // Upcoming events
  const [upcomingEvents] = useState<UpcomingEvent[]>([
    {
      id: 'event-1',
      title: 'Computer Networks Midterm',
      date: 'Jan 5, 2026',
      type: 'exam',
    },
    {
      id: 'event-2',
      title: 'Project Submission Deadline',
      date: 'Jan 10, 2026',
      type: 'deadline',
    },
    {
      id: 'event-3',
      title: 'Research Paper Upload',
      date: 'Jan 15, 2026',
      type: 'reminder',
    },
  ]);

  // Calendar events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: 'cal-1',
      title: 'Computer Networks Midterm',
      date: new Date(2026, 0, 5),
      type: 'exam',
      description: 'Chapters 1-5: Network protocols, OSI model, TCP/IP',
    },
    {
      id: 'cal-2',
      title: 'Project Submission Deadline',
      date: new Date(2026, 0, 10),
      type: 'deadline',
      description: 'Final project submission for Database Systems course',
    },
    {
      id: 'cal-3',
      title: 'Research Paper Upload',
      date: new Date(2026, 0, 15),
      type: 'reminder',
      description: 'Upload research paper on AI Ethics',
    },
    {
      id: 'cal-4',
      title: 'Machine Learning Workshop',
      date: new Date(2026, 0, 8),
      type: 'class',
      description: 'Advanced techniques in deep learning',
    },
    {
      id: 'cal-5',
      title: 'Algorithms Final Exam',
      date: new Date(2026, 0, 20),
      type: 'exam',
      description: 'Comprehensive exam covering all topics',
    },
  ]);

  // Resources
  const [resources, setResources] = useState<Resource[]>([
    // Courses
    {
      id: 'res-1',
      title: 'Advanced Algorithms and Data Structures',
      category: 'Courses',
      uploader: 'Dr. Sarah Williams',
      uploaderId: 'user-2',
      uploadDate: 'Dec 15, 2025',
      isPublic: true,
      rating: 4.8,
      reviewCount: 24,
      description: 'Comprehensive course materials covering advanced algorithmic techniques, complexity analysis, and optimization strategies.',
      fullDetails: 'This comprehensive course covers advanced topics in algorithms and data structures. You will learn about dynamic programming, graph algorithms, advanced tree structures, and computational complexity theory.\\n\\nThe course includes video lectures, problem sets, and practical coding exercises. Perfect for computer science students preparing for technical interviews or advanced studies.',
      topics: ['Dynamic Programming', 'Graph Algorithms', 'Tree Structures', 'Complexity Analysis', 'Optimization'],
      hasAccess: true,
      files: [
        { id: 'file-1-1', name: 'Course_Syllabus.pdf', size: '2.3 MB', type: 'PDF' },
        { id: 'file-1-2', name: 'Lecture_Notes_Complete.pdf', size: '15.7 MB', type: 'PDF' },
        { id: 'file-1-3', name: 'Problem_Sets.zip', size: '8.4 MB', type: 'ZIP' },
        { id: 'file-1-4', name: 'Video_Lectures.mp4', size: '450 MB', type: 'Video' },
      ],
      additionalInfo: {
        Duration: '12 weeks',
        Level: 'Advanced',
        Prerequisites: 'Basic Data Structures',
        Language: 'English',
      },
    },
    {
      id: 'res-2',
      title: 'Introduction to Machine Learning',
      category: 'Courses',
      uploader: 'Prof. Michael Chen',
      uploaderId: 'user-3',
      uploadDate: 'Jan 5, 2026',
      isPublic: true,
      rating: 4.9,
      reviewCount: 42,
      description: 'Complete introduction to machine learning covering supervised and unsupervised learning, neural networks, and practical applications.',
      fullDetails: 'Learn the fundamentals of machine learning from scratch. This course covers both theoretical foundations and practical implementation using Python and popular ML libraries.\\n\\nTopics include linear regression, classification algorithms, clustering, neural networks, and deep learning basics. Includes hands-on projects with real-world datasets.',
      topics: ['Supervised Learning', 'Unsupervised Learning', 'Neural Networks', 'Deep Learning', 'Python', 'TensorFlow'],
      hasAccess: true,
      files: [
        { id: 'file-2-1', name: 'ML_Fundamentals.pdf', size: '12.5 MB', type: 'PDF' },
        { id: 'file-2-2', name: 'Python_Notebooks.zip', size: '25.3 MB', type: 'ZIP' },
        { id: 'file-2-3', name: 'Datasets.zip', size: '120 MB', type: 'ZIP' },
      ],
      additionalInfo: {
        Duration: '10 weeks',
        Level: 'Intermediate',
        Prerequisites: 'Python Programming',
        Language: 'English',
      },
    },
    {
      id: 'res-3',
      title: 'Web Development Bootcamp',
      category: 'Courses',
      uploader: 'Emma Davis',
      uploaderId: 'user-4',
      uploadDate: 'Dec 28, 2025',
      isPublic: false,
      rating: 4.7,
      reviewCount: 38,
      description: 'Full-stack web development bootcamp covering HTML, CSS, JavaScript, React, Node.js, and modern development practices.',
      fullDetails: 'Master modern web development with this comprehensive bootcamp. Learn to build responsive websites and full-stack applications from scratch.\n\nCoverage includes frontend technologies (HTML5, CSS3, JavaScript, React), backend development (Node.js, Express), databases (MongoDB, PostgreSQL), and deployment strategies.',
      topics: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Responsive Design'],
      hasAccess: false,
      files: [
        { id: 'file-3-1', name: 'Frontend_Complete_Guide.pdf', size: '18.2 MB', type: 'PDF' },
        { id: 'file-3-2', name: 'Backend_Tutorial.pdf', size: '14.7 MB', type: 'PDF' },
        { id: 'file-3-3', name: 'Project_Files.zip', size: '75.5 MB', type: 'ZIP' },
      ],
      additionalInfo: {
        Duration: '16 weeks',
        Level: 'Beginner to Advanced',
        Prerequisites: 'None',
        Language: 'English',
      },
    },
    {
      id: 'res-4',
      title: 'Database Systems and SQL',
      category: 'Courses',
      uploader: 'Dr. James Peterson',
      uploaderId: 'user-8',
      uploadDate: 'Jan 10, 2026',
      isPublic: true,
      rating: 4.6,
      reviewCount: 31,
      description: 'Comprehensive database course covering relational databases, SQL, normalization, transactions, and database design.',
      fullDetails: 'Learn everything about database systems from fundamentals to advanced topics. Covers relational database theory, SQL queries, database design, normalization, indexing, and transaction management.\n\nIncludes practical exercises with MySQL, PostgreSQL, and MongoDB.',
      topics: ['SQL', 'Database Design', 'Normalization', 'Transactions', 'Indexing', 'MySQL', 'PostgreSQL'],
      hasAccess: false,
      files: [
        { id: 'file-4-1', name: 'Database_Theory.pdf', size: '10.3 MB', type: 'PDF' },
        { id: 'file-4-2', name: 'SQL_Practice_Exercises.pdf', size: '5.8 MB', type: 'PDF' },
        { id: 'file-4-3', name: 'Sample_Databases.sql', size: '3.2 MB', type: 'SQL' },
      ],
      additionalInfo: {
        Duration: '8 weeks',
        Level: 'Intermediate',
        Prerequisites: 'Basic Programming',
        Language: 'English',
      },
    },
    
    // Projects
    {
      id: 'res-5',
      title: 'E-Commerce Platform Full Stack',
      category: 'Projects',
      uploader: 'Alex Thompson',
      uploaderId: 'user-9',
      uploadDate: 'Jan 8, 2026',
      isPublic: true,
      rating: 4.8,
      reviewCount: 27,
      description: 'Complete e-commerce platform with React frontend, Node.js backend, payment integration, and admin dashboard.',
      fullDetails: 'A fully functional e-commerce platform built with modern technologies. Features include user authentication, product catalog, shopping cart, payment processing with Stripe, order management, and comprehensive admin dashboard.\\n\\nBuilt with React, Redux, Node.js, Express, MongoDB, and includes Docker configuration for easy deployment.',
      topics: ['React', 'Redux', 'Node.js', 'Express', 'MongoDB', 'Stripe API', 'Docker', 'E-commerce'],
      hasAccess: false,
      files: [
        { id: 'file-5-1', name: 'Source_Code.zip', size: '45.2 MB', type: 'ZIP' },
        { id: 'file-5-2', name: 'Documentation.pdf', size: '8.5 MB', type: 'PDF' },
        { id: 'file-5-3', name: 'Setup_Guide.md', size: '125 KB', type: 'Markdown' },
        { id: 'file-5-4', name: 'Demo_Video.mp4', size: '180 MB', type: 'Video' },
      ],
      additionalInfo: {
        'Tech Stack': 'MERN Stack',
        'Build Tool': 'Vite',
        License: 'MIT',
        Status: 'Production Ready',
      },
      externalLink: 'https://github.com/example/ecommerce-platform',
    },
    {
      id: 'res-6',
      title: 'Social Media Dashboard',
      category: 'Projects',
      uploader: 'Sarah Martinez',
      uploaderId: 'user-10',
      uploadDate: 'Dec 20, 2025',
      isPublic: false,
      rating: 4.5,
      reviewCount: 19,
      description: 'Analytics dashboard for social media metrics with real-time data visualization, charts, and reporting features.',
      fullDetails: 'Professional social media analytics dashboard with beautiful visualizations. Track multiple social media accounts, analyze engagement metrics, and generate comprehensive reports.\\n\\nBuilt with React, Chart.js, and integrates with Twitter, Instagram, and Facebook APIs.',
      topics: ['React', 'Data Visualization', 'Chart.js', 'API Integration', 'Analytics', 'Dashboard'],
      hasAccess: false,
      files: [
        { id: 'file-6-1', name: 'Dashboard_Source.zip', size: '32.7 MB', type: 'ZIP' },
        { id: 'file-6-2', name: 'API_Documentation.pdf', size: '4.2 MB', type: 'PDF' },
        { id: 'file-6-3', name: 'Screenshots.zip', size: '12.5 MB', type: 'ZIP' },
      ],
      additionalInfo: {
        'Tech Stack': 'React, Node.js',
        Framework: 'Next.js',
        Database: 'PostgreSQL',
        Status: 'Beta',
      },
    },
    {
      id: 'res-7',
      title: 'Mobile Fitness Tracker App',
      category: 'Projects',
      uploader: 'David Lee',
      uploaderId: 'user-11',
      uploadDate: 'Jan 12, 2026',
      isPublic: true,
      rating: 4.7,
      reviewCount: 23,
      description: 'Cross-platform mobile fitness tracking application built with React Native, featuring workout logging and progress tracking.',
      fullDetails: 'Complete fitness tracking mobile app for iOS and Android. Features include workout plans, exercise logging, progress charts, calorie tracking, and social sharing.\\n\\nBuilt with React Native and Firebase for real-time synchronization across devices.',
      topics: ['React Native', 'Firebase', 'Mobile Development', 'iOS', 'Android', 'Health & Fitness'],
      hasAccess: false,
      files: [
        { id: 'file-7-1', name: 'App_Source_Code.zip', size: '55.3 MB', type: 'ZIP' },
        { id: 'file-7-2', name: 'Design_Assets.zip', size: '28.4 MB', type: 'ZIP' },
        { id: 'file-7-3', name: 'User_Guide.pdf', size: '6.7 MB', type: 'PDF' },
      ],
      additionalInfo: {
        Platform: 'iOS & Android',
        'Min SDK': 'iOS 13+, Android 8+',
        Database: 'Firebase Realtime DB',
        Status: 'Released',
      },
    },
    {
      id: 'res-8',
      title: 'Task Management System',
      category: 'Projects',
      uploader: 'Jennifer Wang',
      uploaderId: 'user-12',
      uploadDate: 'Jan 3, 2026',
      isPublic: true,
      rating: 4.6,
      reviewCount: 21,
      description: 'Collaborative task management system with team features, kanban boards, and project tracking.',
      fullDetails: 'Enterprise-grade task management system inspired by Jira and Trello. Features kanban boards, sprint planning, team collaboration, file attachments, and detailed analytics.\n\nBuilt with Vue.js, Python Django, and PostgreSQL.',
      topics: ['Vue.js', 'Python', 'Django', 'PostgreSQL', 'Kanban', 'Agile', 'Project Management'],
      hasAccess: false,
      files: [
        { id: 'file-8-1', name: 'Frontend_Code.zip', size: '38.9 MB', type: 'ZIP' },
        { id: 'file-8-2', name: 'Backend_Code.zip', size: '22.1 MB', type: 'ZIP' },
        { id: 'file-8-3', name: 'Installation_Guide.pdf', size: '3.8 MB', type: 'PDF' },
      ],
      additionalInfo: {
        'Frontend': 'Vue.js 3',
        'Backend': 'Django 4.2',
        Database: 'PostgreSQL 14',
        Deployment: 'Docker',
      },
    },

    // Research Papers
    {
      id: 'res-9',
      title: 'Deep Learning for Natural Language Processing',
      category: 'Research',
      uploader: 'Prof. Michael Chen',
      uploaderId: 'user-3',
      uploadDate: 'Dec 18, 2025',
      isPublic: false,
      rating: 4.9,
      reviewCount: 15,
      description: 'Curated collection of groundbreaking research papers on deep learning applications in NLP, including transformers and BERT.',
      fullDetails: 'Comprehensive collection of cutting-edge research papers on deep learning for NLP. Includes seminal papers on transformers, BERT, GPT models, and recent advances in large language models.\n\nPapers are organized by topic with annotations and implementation notes.',
      topics: ['Deep Learning', 'NLP', 'Transformers', 'BERT', 'GPT', 'Language Models'],
      hasAccess: false,
      files: [
        { id: 'file-9-1', name: 'Attention_Is_All_You_Need.pdf', size: '2.1 MB', type: 'PDF' },
        { id: 'file-9-2', name: 'BERT_Paper.pdf', size: '1.8 MB', type: 'PDF' },
        { id: 'file-9-3', name: 'GPT3_Paper.pdf', size: '3.2 MB', type: 'PDF' },
        { id: 'file-9-4', name: 'Annotations_Notes.pdf', size: '5.4 MB', type: 'PDF' },
      ],
      additionalInfo: {
        'Paper Count': '25 papers',
        Topics: 'NLP, Transformers, LLMs',
        Year: '2017-2024',
        Venue: 'NeurIPS, ICML, ACL',
      },
    },
    {
      id: 'res-10',
      title: 'Computer Vision and Image Recognition',
      category: 'Research',
      uploader: 'Dr. Lisa Anderson',
      uploaderId: 'user-6',
      uploadDate: 'Jan 7, 2026',
      isPublic: true,
      rating: 4.8,
      reviewCount: 18,
      description: 'Research papers on computer vision, convolutional neural networks, object detection, and image segmentation.',
      fullDetails: 'Collection of influential papers in computer vision and image recognition. Covers CNN architectures, object detection methods (YOLO, R-CNN), semantic segmentation, and recent advances in vision transformers.\n\nIncludes implementation guides and dataset references.',
      topics: ['Computer Vision', 'CNN', 'Object Detection', 'Image Segmentation', 'Vision Transformers'],
      hasAccess: false,
      files: [
        { id: 'file-10-1', name: 'ResNet_Paper.pdf', size: '1.9 MB', type: 'PDF' },
        { id: 'file-10-2', name: 'YOLO_Research.pdf', size: '2.3 MB', type: 'PDF' },
        { id: 'file-10-3', name: 'Vision_Transformers.pdf', size: '2.7 MB', type: 'PDF' },
        { id: 'file-10-4', name: 'Implementation_Notes.pdf', size: '4.1 MB', type: 'PDF' },
      ],
      additionalInfo: {
        'Paper Count': '20 papers',
        Topics: 'CV, Object Detection, Segmentation',
        Year: '2015-2024',
        Venue: 'CVPR, ICCV, ECCV',
      },
    },
    {
      id: 'res-11',
      title: 'Blockchain and Distributed Systems',
      category: 'Research',
      uploader: 'Prof. Robert Taylor',
      uploaderId: 'user-7',
      uploadDate: 'Dec 22, 2025',
      isPublic: false,
      rating: 4.7,
      reviewCount: 12,
      description: 'Academic research on blockchain technology, consensus algorithms, smart contracts, and distributed ledger systems.',
      fullDetails: 'Comprehensive collection of research papers on blockchain technology and distributed systems. Topics include consensus mechanisms, scalability solutions, smart contract security, and cryptocurrency economics.\\n\\nIncludes both theoretical foundations and practical applications.',
      topics: ['Blockchain', 'Consensus Algorithms', 'Smart Contracts', 'Distributed Systems', 'Cryptocurrency'],
      hasAccess: false,
      files: [
        { id: 'file-11-1', name: 'Bitcoin_Whitepaper.pdf', size: '850 KB', type: 'PDF' },
        { id: 'file-11-2', name: 'Ethereum_Paper.pdf', size: '1.2 MB', type: 'PDF' },
        { id: 'file-11-3', name: 'Consensus_Algorithms.pdf', size: '3.5 MB', type: 'PDF' },
        { id: 'file-11-4', name: 'Smart_Contract_Security.pdf', size: '2.8 MB', type: 'PDF' },
      ],
      additionalInfo: {
        'Paper Count': '18 papers',
        Topics: 'Blockchain, Consensus, DApps',
        Year: '2008-2024',
        Venue: 'IEEE, ACM, Blockchain Conferences',
      },
    },
    {
      id: 'res-12',
      title: 'Quantum Computing Fundamentals',
      category: 'Research',
      uploader: 'Dr. Emily Carter',
      uploaderId: 'user-13',
      uploadDate: 'Jan 11, 2026',
      isPublic: true,
      rating: 4.9,
      reviewCount: 14,
      description: 'Research papers on quantum computing, quantum algorithms, and quantum information theory.',
      fullDetails: 'Essential papers on quantum computing covering quantum gates, quantum algorithms (Shor\'s, Grover\'s), quantum error correction, and quantum supremacy.\\n\\nIncludes beginner-friendly introductions and advanced theoretical papers.',
      topics: ['Quantum Computing', 'Quantum Algorithms', 'Quantum Information', 'Quantum Gates'],
      hasAccess: false,
      files: [
        { id: 'file-12-1', name: 'Quantum_Computing_Intro.pdf', size: '3.2 MB', type: 'PDF' },
        { id: 'file-12-2', name: 'Shors_Algorithm.pdf', size: '1.5 MB', type: 'PDF' },
        { id: 'file-12-3', name: 'Quantum_Error_Correction.pdf', size: '2.9 MB', type: 'PDF' },
        { id: 'file-12-4', name: 'Quantum_Supremacy.pdf', size: '2.1 MB', type: 'PDF' },
      ],
      additionalInfo: {
        'Paper Count': '15 papers',
        Topics: 'Quantum Algorithms, QC Theory',
        Year: '1994-2024',
        Venue: 'Nature, Science, QIP',
      },
    },

    // Documents
    {
      id: 'res-13',
      title: 'Data Structures and Algorithms Cheat Sheet',
      category: 'Documents',
      uploader: 'James Wilson',
      uploaderId: 'user-5',
      uploadDate: 'Jan 6, 2026',
      isPublic: true,
      rating: 4.7,
      reviewCount: 45,
      description: 'Comprehensive cheat sheet covering all major data structures and algorithms with time complexity analysis.',
      fullDetails: 'Quick reference guide for data structures and algorithms. Includes arrays, linked lists, stacks, queues, trees, graphs, sorting algorithms, searching algorithms, and dynamic programming.\\n\\nPerfect for interview preparation and quick revision.',
      topics: ['Data Structures', 'Algorithms', 'Big O Notation', 'Interview Prep'],
      hasAccess: false,
      files: [
        { id: 'file-13-1', name: 'DS_Algorithms_Cheatsheet.pdf', size: '3.5 MB', type: 'PDF' },
        { id: 'file-13-2', name: 'Complexity_Chart.pdf', size: '1.2 MB', type: 'PDF' },
        { id: 'file-13-3', name: 'Code_Examples.zip', size: '8.7 MB', type: 'ZIP' },
      ],
      additionalInfo: {
        Pages: '45 pages',
        Format: 'PDF with code snippets',
        Language: 'Python, Java, C++',
        Updated: 'January 2026',
      },
    },
    {
      id: 'res-14',
      title: 'Python Programming Complete Guide',
      category: 'Documents',
      uploader: 'Rachel Green',
      uploaderId: 'user-14',
      uploadDate: 'Dec 25, 2025',
      isPublic: true,
      rating: 4.8,
      reviewCount: 52,
      description: 'Complete Python programming guide from basics to advanced topics including OOP, decorators, and async programming.',
      fullDetails: 'Comprehensive Python guide covering everything from basic syntax to advanced features. Includes object-oriented programming, functional programming, decorators, generators, context managers, and asynchronous programming.\\n\\nWith hundreds of code examples and practice exercises.',
      topics: ['Python', 'OOP', 'Decorators', 'Async/Await', 'Generators', 'Context Managers'],
      hasAccess: false,
      files: [
        { id: 'file-14-1', name: 'Python_Complete_Guide.pdf', size: '22.4 MB', type: 'PDF' },
        { id: 'file-14-2', name: 'Code_Examples.zip', size: '15.8 MB', type: 'ZIP' },
        { id: 'file-14-3', name: 'Practice_Exercises.pdf', size: '8.3 MB', type: 'PDF' },
      ],
      additionalInfo: {
        Pages: '350 pages',
        Version: 'Python 3.12',
        Level: 'Beginner to Advanced',
        Updated: 'December 2025',
      },
    },
    {
      id: 'res-15',
      title: 'System Design Interview Preparation',
      category: 'Documents',
      uploader: 'Kevin Zhang',
      uploaderId: 'user-15',
      uploadDate: 'Jan 9, 2026',
      isPublic: false,
      rating: 4.9,
      reviewCount: 38,
      description: 'Complete system design interview guide with real-world examples, architecture patterns, and scalability strategies.',
      fullDetails: 'Master system design interviews with this comprehensive guide. Covers designing scalable systems, microservices architecture, database design, caching strategies, load balancing, and more.\\n\\nIncludes case studies of real systems like Twitter, Netflix, and Uber.',
      topics: ['System Design', 'Scalability', 'Microservices', 'Database Design', 'Caching', 'Load Balancing'],
      hasAccess: false,
      files: [
        { id: 'file-15-1', name: 'System_Design_Guide.pdf', size: '18.6 MB', type: 'PDF' },
        { id: 'file-15-2', name: 'Case_Studies.pdf', size: '12.3 MB', type: 'PDF' },
        { id: 'file-15-3', name: 'Architecture_Diagrams.pdf', size: '9.4 MB', type: 'PDF' },
      ],
      additionalInfo: {
        Pages: '280 pages',
        'Case Studies': '15 real-world examples',
        Level: 'Intermediate to Advanced',
        Updated: 'January 2026',
      },
    },
    {
      id: 'res-16',
      title: 'Git and Version Control Mastery',
      category: 'Documents',
      uploader: 'Tom Anderson',
      uploaderId: 'user-16',
      uploadDate: 'Dec 30, 2025',
      isPublic: true,
      rating: 4.6,
      reviewCount: 41,
      description: 'Master Git and version control with this detailed guide covering workflows, branching strategies, and best practices.',
      fullDetails: 'Complete guide to Git and version control. Learn basic commands, branching strategies (Git Flow, GitHub Flow), resolving merge conflicts, rebasing, cherry-picking, and collaborative workflows.\\n\\nIncludes GitHub, GitLab, and Bitbucket specific features.',
      topics: ['Git', 'Version Control', 'Branching', 'Merge Conflicts', 'GitHub', 'Workflows'],
      hasAccess: false,
      files: [
        { id: 'file-16-1', name: 'Git_Mastery_Guide.pdf', size: '14.2 MB', type: 'PDF' },
        { id: 'file-16-2', name: 'Command_Reference.pdf', size: '4.5 MB', type: 'PDF' },
        { id: 'file-16-3', name: 'Workflow_Diagrams.pdf', size: '6.1 MB', type: 'PDF' },
      ],
      additionalInfo: {
        Pages: '185 pages',
        Commands: '100+ Git commands',
        Level: 'Beginner to Advanced',
        Updated: 'December 2025',
      },
    },
    {
      id: 'res-17',
      title: 'Computer Networks Lab Manual',
      category: 'Documents',
      uploader: 'Dr. Lisa Anderson',
      uploaderId: 'user-6',
      uploadDate: 'Jan 4, 2026',
      isPublic: true,
      rating: 4.5,
      reviewCount: 28,
      description: 'Practical lab experiments covering network protocols, socket programming, and network security fundamentals.',
      fullDetails: 'Comprehensive lab manual for computer networks course. Includes 15 hands-on experiments covering TCP/IP, socket programming, routing protocols, network security, and packet analysis.\\n\\nAll experiments include theory, procedures, and sample code.',
      topics: ['TCP/IP', 'Socket Programming', 'Routing', 'Network Security', 'Wireshark', 'Packet Analysis'],
      hasAccess: false,
      files: [
        { id: 'file-17-1', name: 'Lab_Manual_Complete.pdf', size: '16.7 MB', type: 'PDF' },
        { id: 'file-17-2', name: 'Sample_Code.zip', size: '12.4 MB', type: 'ZIP' },
        { id: 'file-17-3', name: 'Network_Diagrams.pdf', size: '5.8 MB', type: 'PDF' },
      ],
      additionalInfo: {
        Experiments: '15 labs',
        Duration: '1 semester',
        Tools: 'Wireshark, Packet Tracer',
        Level: 'Undergraduate',
      },
    },
    {
      id: 'res-18',
      title: 'Operating Systems Concepts',
      category: 'Documents',
      uploader: 'Prof. Mark Johnson',
      uploaderId: 'user-17',
      uploadDate: 'Jan 13, 2026',
      isPublic: false,
      rating: 4.8,
      reviewCount: 33,
      description: 'Detailed study notes on operating systems covering processes, memory management, file systems, and synchronization.',
      fullDetails: 'Complete operating systems study material covering process management, CPU scheduling, memory management, virtual memory, file systems, I/O systems, and deadlock handling.\n\nIncludes diagrams, algorithms, and practice problems with solutions.',
      topics: ['Processes', 'Scheduling', 'Memory Management', 'File Systems', 'Deadlocks', 'Synchronization'],
      hasAccess: false,
      files: [
        { id: 'file-18-1', name: 'OS_Concepts_Notes.pdf', size: '20.5 MB', type: 'PDF' },
        { id: 'file-18-2', name: 'Practice_Problems.pdf', size: '9.2 MB', type: 'PDF' },
        { id: 'file-18-3', name: 'Solutions.pdf', size: '11.3 MB', type: 'PDF' },
      ],
      additionalInfo: {
        Pages: '425 pages',
        Chapters: '12 chapters',
        Level: 'Undergraduate/Graduate',
        Updated: 'January 2026',
      },
    },
  ]);

  // Modals
  const [accessRequestModal, setAccessRequestModal] = useState<{
    isOpen: boolean;
    resourceId: string | null;
  }>({ isOpen: false, resourceId: null });

  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    resourceId: string | null;
  }>({ isOpen: false, resourceId: null });

  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [resourceListModal, setResourceListModal] = useState<{
    isOpen: boolean;
    type: 'uploads' | 'accessed' | null;
  }>({ isOpen: false, type: null });

  const [resourceDetailModal, setResourceDetailModal] = useState<{
    isOpen: boolean;
    resourceId: string | null;
  }>({ isOpen: false, resourceId: null });

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handlers
  const handleLogin = (email: string, password: string) => {
    // Mock login
    setIsAuthenticated(true);
    setShowAuthModal(false);
    setCurrentView('dashboard');
    toast.success('Welcome back to StudyBot!');
  };

  const handleSignup = (data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'faculty' | 'researcher' | 'visitor' | 'admin';
    institution?: string;
    major?: string;
    year?: string;
  }) => {
    // Check if admin
    if (data.role === 'admin') {
      setUser({
        ...user,
        name: data.name,
        email: data.email,
        institution: 'StudyBot Administration',
        major: 'Administrator',
        year: 'Admin',
        points: 0,
      });
      setIsAuthenticated(true);
      setIsAdmin(true);
      setCurrentView('admin-dashboard');
      toast.success('Logged in as Administrator', {
        icon: '🛡️',
      });
      return;
    }

    // Regular user signup with bonus points
    setUser({
      ...user,
      name: data.name,
      email: data.email,
      institution: data.institution || '',
      major: data.major || '',
      year: data.year || '',
      points: 20, // Bonus points on signup
    });
    setIsAuthenticated(true);
    setShowAuthModal(false);
    setCurrentView('dashboard');
    toast.success(`Account created as ${data.role}! You received 20 bonus points!`, {
      icon: '🎉',
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentView('courses');
    setIsSidebarOpen(true);
    toast.success('Logged out successfully');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const handleRequestAccess = (resourceId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to request access to resources');
      setShowAuthModal(true);
      return;
    }
    setAccessRequestModal({ isOpen: true, resourceId });
  };

  const handleSubmitAccessRequest = (message: string) => {
    if (accessRequestModal.resourceId) {
      const resource = resources.find((r) => r.id === accessRequestModal.resourceId);
      if (user.points < 4) {
        toast.error('You need at least 4 points to request access');
        return;
      }
      
      // Deduct points
      setUser({ ...user, points: user.points - 4 });

      // Mark as requested
      setResources(
        resources.map((r) =>
          r.id === accessRequestModal.resourceId
            ? { ...r, accessRequested: true }
            : r
        )
      );

      // Add notification
      setNotifications([
        {
          id: `notif-${Date.now()}`,
          message: `Access request sent for "${resource?.title}"`,
          time: 'Just now',
          read: false,
        },
        ...notifications,
      ]);

      // Add activity
      setActivities([
        {
          id: `act-${Date.now()}`,
          type: 'request',
          message: `Requested access to "${resource?.title}"`,
          time: 'Just now',
        },
        ...activities,
      ]);

      toast.success('Access request sent successfully!');
    }
  };

  const handleViewResource = (resourceId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to view resources');
      setShowAuthModal(true);
      return;
    }
    setResourceDetailModal({ isOpen: true, resourceId });
  };

  const handleRateResource = (resourceId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate resources');
      setShowAuthModal(true);
      return;
    }
    setRatingModal({ isOpen: true, resourceId });
  };

  const handleSubmitRating = (rating: number, comment: string) => {
    if (ratingModal.resourceId) {
      const resource = resources.find((r) => r.id === ratingModal.resourceId);

      // Update resource rating (simplified calculation)
      setResources(
        resources.map((r) =>
          r.id === ratingModal.resourceId
            ? {
                ...r,
                rating: (r.rating * r.reviewCount + rating) / (r.reviewCount + 1),
                reviewCount: r.reviewCount + 1,
              }
            : r
        )
      );

      // Add activity
      setActivities([
        {
          id: `act-${Date.now()}`,
          type: 'review',
          message: `Reviewed "${resource?.title}" with ${rating} stars`,
          time: 'Just now',
        },
        ...activities,
      ]);

      toast.success('Review submitted successfully!');
    }
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    setUser({ ...user, ...updates });
    toast.success('Profile updated successfully!');
  };

  const handleUploadResource = (resource: {
    title: string;
    category: string;
    description: string;
    isPublic: boolean;
  }) => {
    const newResource: Resource = {
      id: `res-${Date.now()}`,
      ...resource,
      uploader: user.name,
      uploaderId: user.id,
      rating: 0,
      reviewCount: 0,
      hasAccess: true,
    };

    setResources([newResource, ...resources]);
    setUser({
      ...user,
      points: user.points + 2,
      uploadCount: user.uploadCount + 1,
    });

    setActivities([
      {
        id: `act-${Date.now()}`,
        type: 'upload',
        message: `Uploaded "${resource.title}"`,
        time: 'Just now',
      },
      ...activities,
    ]);

    toast.success('Resource uploaded successfully! +2 points earned', {
      icon: '🎉',
    });
  };

  const handleAddCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      id: `cal-${Date.now()}`,
      ...event,
    };
    setCalendarEvents([...calendarEvents, newEvent]);
    toast.success('Event added to calendar!');
  };

  const handleSaveSettings = (settings: any) => {
    toast.success('Settings saved successfully!');
  };

  const handleViewUploads = () => {
    setResourceListModal({ isOpen: true, type: 'uploads' });
  };

  const handleViewAccessed = () => {
    setResourceListModal({ isOpen: true, type: 'accessed' });
  };

  const handleDownloadFile = (fileId: string) => {
    toast.success('File download started!', {
      description: 'Your download will begin shortly.',
    });
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleNavigate = (view: string) => {
    // Check if view requires authentication
    const requiresAuth = ['profile', 'uploads', 'activity', 'settings'].includes(view);
    
    if (requiresAuth && !isAuthenticated) {
      toast.error('Please login to access this page');
      setShowAuthModal(true);
      return;
    }

    setCurrentView(view);
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Filter resources by search
  const filteredResources = resources.filter((r) =>
    searchQuery
      ? r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const selectedAccessResource = accessRequestModal.resourceId
    ? resources.find((r) => r.id === accessRequestModal.resourceId)
    : null;

  const selectedRatingResource = ratingModal.resourceId
    ? resources.find((r) => r.id === ratingModal.resourceId)
    : null;

  const selectedDetailResource = resourceDetailModal.resourceId
    ? resources.find((r) => r.id === resourceDetailModal.resourceId)
    : null;

  return (
    <>
      {/* Render AdminApp if user is admin, otherwise render regular StudyBot */}
      {isAdmin ? (
        <AdminApp
          adminName={user.name}
          adminEmail={user.email}
          resources={resources}
          onLogout={handleLogout}
          onUpdateResources={setResources}
        />
      ) : (
        <div className={`min-h-screen ${theme}`}>
          <div className="flex flex-col h-screen bg-background text-foreground">
            {/* Only show Header and Sidebar if not on landing page */}
            {currentView !== 'landing' && (
              <Header
                theme={theme}
                onThemeToggle={handleThemeToggle}
                points={isAuthenticated ? user.points : undefined}
                onSearch={setSearchQuery}
                onNotificationClick={isAuthenticated ? () => setIsNotificationPanelOpen(true) : undefined}
                unreadCount={isAuthenticated ? notifications.filter((n) => !n.read).length : 0}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                isAuthenticated={isAuthenticated}
                onLoginClick={() => setShowAuthModal(true)}
                onLogout={handleLogout}
                userName={isAuthenticated ? user.name : undefined}
              />
            )}

            <div className="flex flex-1 overflow-hidden relative">
              {currentView !== 'landing' && (
                <Sidebar 
                  currentView={currentView} 
                  onNavigate={handleNavigate}
                  onClose={() => setIsSidebarOpen(false)}
                  isOpen={isSidebarOpen}
                  isAuthenticated={isAuthenticated}
                />
              )}

              <main className="flex-1 overflow-y-auto">
                {currentView === 'landing' && (
                  <LandingPage
                    onGetStarted={() => {
                      setShowAuthModal(true);
                    }}
                    onBrowseResources={() => {
                      setCurrentView('courses');
                    }}
                    theme={theme}
                  />
                )}

                {currentView === 'dashboard' && (
                  <>
                    {!isAuthenticated ? (
                      <LandingPage
                        onGetStarted={() => {
                          setShowAuthModal(true);
                        }}
                        onBrowseResources={() => {
                          setCurrentView('courses');
                        }}
                        theme={theme}
                      />
                    ) : (
                      <Dashboard
                        points={user.points}
                        monthlyAccess={user.monthlyAccess}
                        uploadCount={user.uploadCount}
                        activities={activities}
                        upcomingEvents={upcomingEvents}
                      />
                    )}
                  </>
                )}

                {(currentView === 'courses' ||
                  currentView === 'documents' ||
                  currentView === 'projects' ||
                  currentView === 'research') && (
                  <ResourcesView
                    resources={filteredResources.filter((r) => {
                      if (currentView === 'courses') return r.category.toLowerCase() === 'courses';
                      if (currentView === 'documents') return r.category.toLowerCase() === 'documents';
                      if (currentView === 'projects') return r.category.toLowerCase() === 'projects';
                      if (currentView === 'research') return r.category.toLowerCase() === 'research';
                      return true;
                    })}
                    onRequestAccess={handleRequestAccess}
                    onView={handleViewResource}
                    onRate={handleRateResource}
                    viewType={currentView as 'courses' | 'documents' | 'projects' | 'research'}
                  />
                )}

                {currentView === 'profile' && isAuthenticated && (
                  <UserProfile
                    user={user}
                    points={user.points}
                    uploadCount={user.uploadCount}
                    accessCount={user.accessCount}
                    activities={activities}
                    onUpdateProfile={handleUpdateProfile}
                    onViewUploads={handleViewUploads}
                    onViewAccessed={handleViewAccessed}
                  />
                )}

                {currentView === 'uploads' && isAuthenticated && (
                  <UploadView onUpload={handleUploadResource} />
                )}

                {currentView === 'activity' && isAuthenticated && (
                  <ActivityLog activities={activities} />
                )}

                {currentView === 'calendar' && (
                  <FullCalendar 
                    events={calendarEvents}
                    onAddEvent={handleAddCalendarEvent}
                    isAuthenticated={isAuthenticated}
                  />
                )}

                {currentView === 'settings' && isAuthenticated && (
                  <SettingsView 
                    theme={theme}
                    onThemeChange={setTheme}
                    onSaveSettings={handleSaveSettings}
                    onLogout={handleLogout}
                  />
                )}
              </main>
            </div>
          </div>

          {/* Auth Modal */}
          <AnimatePresence>
            {showAuthModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                  onClick={() => setShowAuthModal(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                >
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 z-10"
                      onClick={() => setShowAuthModal(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <AuthScreen onLogin={handleLogin} onSignup={handleSignup} />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Modals */}
          <AccessRequestModal
            isOpen={accessRequestModal.isOpen}
            onClose={() => setAccessRequestModal({ isOpen: false, resourceId: null })}
            resourceTitle={selectedAccessResource?.title || ''}
            onSubmit={handleSubmitAccessRequest}
            currentPoints={user.points}
          />

          <RatingModal
            isOpen={ratingModal.isOpen}
            onClose={() => setRatingModal({ isOpen: false, resourceId: null })}
            resourceTitle={selectedRatingResource?.title || ''}
            onSubmit={handleSubmitRating}
          />

          <ResourceDetailModal
            isOpen={resourceDetailModal.isOpen}
            onClose={() => setResourceDetailModal({ isOpen: false, resourceId: null })}
            resource={selectedDetailResource}
            onDownload={handleDownloadFile}
          />

          {isAuthenticated && (
            <>
              <NotificationPanel
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onMarkAllRead={handleMarkAllRead}
              />

              <ResourceListModal
                isOpen={resourceListModal.isOpen}
                onClose={() => setResourceListModal({ isOpen: false, type: null })}
                title={resourceListModal.type === 'uploads' ? 'My Uploaded Resources' : 'My Accessed Resources'}
                resources={
                  resourceListModal.type === 'uploads'
                    ? resources.filter((r) => r.uploaderId === user.id)
                    : resources.filter((r) => r.hasAccess && r.uploaderId !== user.id)
                }
                emptyMessage={
                  resourceListModal.type === 'uploads'
                    ? 'You haven\'t uploaded any resources yet'
                    : 'You haven\'t accessed any resources yet'
                }
              />
            </>
          )}

          <Toaster />
        </div>
      )}
    </>
  );
}
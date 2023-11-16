// Unique key used for the GM data storage to avoid naming conflicts across scripts
const CACHE_KEY = 's1a/enhancednuoflix';

// Logger prefix
const MSG_PREFIX = 'Enhanced NuoFlix';

// Fixed configs
const highlightedCommentsColor = '#4A4A20';
const highlightedRepliesColor = '#373434';
const highlightedHasNewRepliesColor = '#52522a';
const cssClassNewComments = 'newComment';
const cssClassHasNewReplies = 'hasNewReply';
const cssClassNewReplies = 'newReply';
const expandedReplyCount = 3;

// Defaults
const defaultStart = 1;
const defaultLength = 5;
const defaultLanguage = 'de';

// Map execution flows to pages
const pageRoutes = new Map([
  // path       route name
  [ '/',        'start'   ],
  [ '/profil',  'profile' ],
  [ '/.+',      'video'   ],
]);

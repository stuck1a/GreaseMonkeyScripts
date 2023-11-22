// Unique key used for the GM data storage to avoid naming conflicts across scripts
/**@global*/ const CACHE_KEY = 's1a/enhancednuoflix';

// Logger prefix
/**@global*/ const MSG_PREFIX = 'Enhanced NuoFlix';

// Fixed configs
/**@global*/ const highlightedCommentsColor = '#4A4A20';
/**@global*/ const highlightedRepliesColor = '#373434';
/**@global*/ const highlightedHasNewRepliesColor = '#52522a';
/**@global*/ const cssClassNewComments = 'newComment';
/**@global*/ const cssClassHasNewReplies = 'hasNewReply';
/**@global*/ const cssClassNewReplies = 'newReply';
/**@global*/ const expandedReplyCount = 3;

// Defaults
/**@global*/ const defaultStart = 1;
/**@global*/ const defaultLength = 5;
/**@global*/ const defaultLanguage = 'de';

// Map execution flows to pages
/**@global*/ const pageRoutes = new Map([
  // path       route name
  [ '/',        'start'   ],
  [ '/profil',  'profile' ],
  [ '/.+',      'video'   ],
]);

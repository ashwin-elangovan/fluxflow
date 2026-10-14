import { readFile, writeFile } from 'node:fs/promises';

const topicsPath = new URL('../public/data/mds/mds_view_data.json', import.meta.url);
const tweetsPath = new URL('../public/data/beeswarm/full_tweets_data.json', import.meta.url);
const clusterPath = new URL('../public/data/cluster/cluster_view_data.json', import.meta.url);

const topics = JSON.parse(await readFile(topicsPath, 'utf8'));
const tweets = JSON.parse(await readFile(tweetsPath, 'utf8'));
const cluster = JSON.parse(await readFile(clusterPath, 'utf8'));

const places = [
  ['Chicago', 41.8781, -87.6298], ['New York', 40.7128, -74.0060], ['Austin', 30.2672, -97.7431],
  ['San Francisco', 37.7749, -122.4194], ['Toronto', 43.6532, -79.3832], ['Mexico City', 19.4326, -99.1332],
  ['London', 51.5072, -0.1276], ['Berlin', 52.5200, 13.4050], ['Lagos', 6.5244, 3.3792],
  ['Nairobi', -1.2921, 36.8219], ['Mumbai', 19.0760, 72.8777], ['Singapore', 1.3521, 103.8198],
  ['Tokyo', 35.6762, 139.6503], ['Seoul', 37.5665, 126.9780], ['Sydney', -33.8688, 151.2093],
  ['São Paulo', -23.5505, -46.6333], ['Buenos Aires', -34.6037, -58.3816], ['Cape Town', -33.9249, 18.4241]
];

const newTopicSpecs = [
  ['generativeai', ['models', 'creativity', 'workflows']], ['climateaction', ['energy', 'cities', 'resilience']],
  ['electricvehicles', ['charging', 'range', 'mobility']], ['spaceexploration', ['rockets', 'moon', 'science']],
  ['womensfootball', ['matchday', 'fans', 'league']], ['indiegames', ['design', 'players', 'release']],
  ['digitalhealth', ['care', 'wellness', 'access']], ['futureofwork', ['hybrid', 'skills', 'teams']],
  ['sustainablefashion', ['materials', 'design', 'circular']], ['streetfood', ['markets', 'flavor', 'culture']],
  ['musicfestivals', ['live', 'artists', 'community']], ['urbangardening', ['neighborhoods', 'food', 'green']]
];

const extraTopicNames = [
  'opensource', 'cybersecurity', 'cloudcomputing', 'quantumcomputing', 'robotics', 'augmentedreality', 'creatoreconomy', 'fintech', 'digitalprivacy', 'datascience',
  'renewableenergy', 'oceanhealth', 'biodiversity', 'zerowaste', 'cleanwater', 'airquality', 'sustainablecities', 'circulareconomy', 'conservation', 'greenbuildings',
  'mentalhealth', 'nutrition', 'sleephealth', 'fitness', 'publichealth', 'medicalresearch', 'telemedicine', 'healthyaging', 'mindfulness', 'healthcareaccess',
  'remotework', 'startups', 'smallbusiness', 'ecommerce', 'productdesign', 'leadership', 'careers', 'productivity', 'education', 'financialliteracy',
  'basketball', 'cricket', 'tennis', 'running', 'cycling', 'motorsport', 'baseball', 'hockey', 'surfing', 'olympics',
  'architecture', 'publictransit', 'housing', 'smartcities', 'placemaking', 'walkability', 'communitydesign', 'infrastructure',
  'photography', 'books', 'film', 'animation', 'design', 'podcasts', 'travel', 'cooking', 'coffee', 'art',
  'pets', 'parenting', 'hiking',
  'machinelearning', 'devtools', 'edgecomputing', 'semiconductors', 'webdevelopment', 'spacetech', 'blockchain',
  'climatejustice', 'solarenergy', 'windenergy', 'rewilding', 'sustainableagriculture', 'plasticpollution', 'ecotourism',
  'womenshealth', 'menshealth', 'disabilityrights', 'neuroscience', 'vaccines', 'maternalhealth', 'rarediseases', 'communitycare',
  'freelancing', 'workplaceculture', 'entrepreneurship', 'venturecapital', 'reskilling', 'laborrights', 'personalfinance',
  'formulaone', 'golf', 'volleyball', 'rugby', 'boxing', 'skateboarding', 'esports', 'mountaineering',
  'urbanplanning', 'localgovernment', 'civictech', 'historicpreservation', 'parks', 'bikesharing', 'roadsafety', 'libraries', 'publicspaces', 'neighborhoodlife',
  'theater', 'dance', 'museums', 'classicalmusic', 'hiphop', 'comics', 'fashiondesign', 'journalism', 'streaming', 'gamingculture',
  'homecooking', 'gardening', 'diy', 'interiordesign', 'relationships', 'wellness', 'personalgrowth', 'vanlife', 'minimalism', 'outdoorrecreation'
];
newTopicSpecs.push(...extraTopicNames.map(name => [name, [name, 'community', 'trends']]));

const categoryTopics = {
  technology: ['generativeai','electricvehicles','spaceexploration','opensource','cybersecurity','cloudcomputing','quantumcomputing','robotics','augmentedreality','fintech','digitalprivacy','datascience','machinelearning','devtools','edgecomputing','semiconductors','webdevelopment','spacetech','blockchain'],
  planet: ['climateaction','renewableenergy','oceanhealth','biodiversity','zerowaste','cleanwater','airquality','sustainablecities','circulareconomy','conservation','greenbuildings','urbangardening','climatejustice','solarenergy','windenergy','rewilding','sustainableagriculture','plasticpollution','ecotourism'],
  health: ['digitalhealth','mentalhealth','nutrition','sleephealth','fitness','publichealth','medicalresearch','telemedicine','healthyaging','mindfulness','healthcareaccess','womenshealth','menshealth','disabilityrights','neuroscience','vaccines','maternalhealth','rarediseases','communitycare'],
  work: ['futureofwork','creatoreconomy','remotework','startups','smallbusiness','ecommerce','productdesign','leadership','careers','productivity','education','financialliteracy','freelancing','workplaceculture','entrepreneurship','venturecapital','reskilling','laborrights','personalfinance'],
  sports: ['womensfootball','basketball','cricket','tennis','running','cycling','motorsport','baseball','hockey','surfing','olympics','formulaone','golf','volleyball','rugby','boxing','skateboarding','esports','mountaineering'],
  cities: ['architecture','publictransit','housing','smartcities','placemaking','walkability','communitydesign','infrastructure','urbanplanning','localgovernment','civictech','historicpreservation','parks','bikesharing','roadsafety','libraries','publicspaces','neighborhoodlife'],
  culture: ['indiegames','musicfestivals','photography','books','film','animation','design','podcasts','art','theater','dance','museums','classicalmusic','hiphop','comics','fashiondesign','journalism','streaming','gamingculture'],
  lifestyle: ['sustainablefashion','streetfood','travel','cooking','coffee','pets','parenting','hiking','homecooking','gardening','diy','interiordesign','relationships','wellness','personalgrowth','vanlife','minimalism','outdoorrecreation']
};
const categoryNames = Object.keys(categoryTopics);
const categoryByTopic = new Map(categoryNames.flatMap(category => categoryTopics[category].map(name => [name, category])));

// The demo is fully curated. Remove the malformed legacy scrape rather than allowing
// fragments such as "avengersendgamemovie40" or numeric topics back into the interface.
for (const id of Object.keys(tweets)) delete tweets[id];
topics.splice(0, topics.length);

let sequence = 0;
const generatedIds = [];
const randomUnit = seed => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};
const dateFor = (index, topicSeed) => {
  // Seed every topic with at least one post in every month, then let the remaining
  // posts follow organic primary and secondary bursts.
  if (index < 12) {
    const day = 3 + Math.floor(randomUnit(topicSeed * 131 + index * 17) * 24);
    const hour = Math.floor(randomUnit(topicSeed * 47 + index * 29) * 24);
    const minute = Math.floor(randomUnit(topicSeed * 73 + index * 31) * 60);
    return new Date(Date.UTC(2022, index, day, hour, minute, 0)).toISOString().replace('T', ' ').replace('Z', '');
  }
  const primaryPeak = (topicSeed * 47 + 24) % 365;
  const secondaryPeak = (primaryPeak + 72 + (topicSeed * 11) % 80) % 365;
  const choice = randomUnit(index + topicSeed * 1009);
  const center = choice < .7 ? primaryPeak : choice < .9 ? secondaryPeak : randomUnit(index * 7 + 19) * 364;
  const spread = choice < .9 ? 10 + (topicSeed % 24) : 75;
  const bell = randomUnit(index * 3 + 1) + randomUnit(index * 3 + 2) + randomUnit(index * 3 + 3) - 1.5;
  const day = Math.round((center + bell * spread + 365) % 365);
  const hour = Math.floor(randomUnit(index * 5 + topicSeed) * 24);
  const minute = Math.floor(randomUnit(index * 13 + topicSeed) * 60);
  return new Date(Date.UTC(2022, 0, 1 + day, hour, minute, 0)).toISOString().replace('T', ' ').replace('Z', '');
};

const topicLabels = {
  generativeai: 'Generative AI', climateaction: 'Climate Action', electricvehicles: 'Electric Vehicles',
  spaceexploration: 'Space Exploration', womensfootball: "Women's Football", indiegames: 'Indie Games',
  digitalhealth: 'Digital Health', futureofwork: 'Future of Work', sustainablefashion: 'Sustainable Fashion',
  streetfood: 'Street Food', musicfestivals: 'Music Festivals', urbangardening: 'Urban Gardening',
  opensource: 'Open Source', cloudcomputing: 'Cloud Computing', quantumcomputing: 'Quantum Computing',
  augmentedreality: 'Augmented Reality', creatoreconomy: 'Creator Economy', digitalprivacy: 'Digital Privacy',
  datascience: 'Data Science', renewableenergy: 'Renewable Energy', oceanhealth: 'Ocean Health',
  zerowaste: 'Zero Waste', cleanwater: 'Clean Water', airquality: 'Air Quality', sustainablecities: 'Sustainable Cities',
  circulareconomy: 'Circular Economy', greenbuildings: 'Green Buildings', mentalhealth: 'Mental Health',
  sleephealth: 'Sleep Health', publichealth: 'Public Health', medicalresearch: 'Medical Research',
  healthyaging: 'Healthy Aging', healthcareaccess: 'Healthcare Access', remotework: 'Remote Work',
  smallbusiness: 'Small Business', productdesign: 'Product Design', financialliteracy: 'Financial Literacy',
  publictransit: 'Public Transit', smartcities: 'Smart Cities', communitydesign: 'Community Design'
};
const humanize = value => topicLabels[String(value)] || String(value)
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/[_-]+/g, ' ')
  .replace(/\b\w/g, letter => letter.toUpperCase());

const openings = [
  'A small thing I noticed today', 'Still thinking about a conversation from this morning',
  'Not a hot take, just an observation', 'One detail keeps getting lost in this debate',
  'Quick field note', 'I changed my mind about part of this',
  'The most useful comment I heard all week', 'This looked simple until we tried it',
  'A hopeful sign from today', 'Honestly, the hard part is not the headline',
  'Something worth watching', 'Today’s reminder', 'I keep coming back to this',
  'A question our group could not resolve', 'The local version of this story feels different'
];

const observations = [
  (a, b) => `${a} gets attention, but ${b} is where the real trade-offs show up`,
  (a, b) => `people agree on ${a} in theory and split the moment ${b} becomes concrete`,
  (a, b) => `the best ideas connected ${a} to everyday decisions about ${b}`,
  (a, b) => `${a} moved faster once someone asked who actually benefits from ${b}`,
  (a, b) => `the gap between the promise of ${a} and the reality of ${b} is still wide`,
  (a, b) => `a practical example of ${a} did more than another hour of abstract talk about ${b}`,
  (a, b) => `the conversation shifted when we treated ${b} as a design constraint, not an afterthought`,
  (a, b) => `there is more experimentation around ${a} than the usual coverage of ${b} suggests`,
  (a, b) => `the strongest argument for ${a} came from someone worried about ${b}`,
  (a, b) => `we may be measuring ${a} carefully while missing what ${b} feels like on the ground`,
  (a, b) => `${a} is becoming normal quietly; ${b} is where the tension is surfacing`,
  (a, b) => `the useful question was not “does ${a} work?” but “for whom does ${b} work?”`
];

const endings = [
  'Curious whether other cities are seeing the same pattern.',
  'No clean answer yet, but the question feels better now.',
  'The next six months should tell us a lot.',
  'Would love to hear from people doing this work day to day.',
  'Progress, but definitely not a victory lap.',
  'The boring implementation details matter more than ever.',
  'I left with more questions than I arrived with—in a good way.',
  'Worth revisiting after the next round of results.',
  'There is room here for a much more honest conversation.',
  'That nuance rarely survives the headline.',
  'Maybe the real signal is what people are trying between announcements.',
  'Keeping an eye on this one.'
];
const usedBodiesByTopic = new Map();

function postContent(topicName, keywords, index, hubIndex, place, createdAt) {
  const seed = index * 31 + hubIndex * 101;
  const topic = humanize(topicName);
  const keywordA = humanize(keywords[seed % keywords.length]).toLowerCase();
  const keywordB = humanize(keywords[(seed + 1) % keywords.length]).toLowerCase();
  const opening = openings[Math.floor(randomUnit(seed + 17) * openings.length)];
  const observation = observations[Math.floor(randomUnit(seed + 43) * observations.length)](keywordA, keywordB);
  const ending = endings[Math.floor(randomUnit(seed + 79) * endings.length)];
  const date = new Date(createdAt.replace(' ', 'T') + 'Z');
  const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  const day = date.getUTCDate();
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).toLowerCase();
  const contexts = [
    `In ${place}, the ${topic} conversation is getting specific: ${observation}.`,
    `${opening} in ${place}, thinking about ${topic}: ${observation}. ${ending}`,
    `${month} field note on ${topic} from ${place}: ${observation}.`,
    `Heard three very different takes on ${topic} in ${place}. My takeaway: ${observation}.`,
    `${opening}. Around ${place}, ${observation}. That matters for ${topic}. ${ending}`,
    `${topic} check-in from ${place}: ${observation}. ${ending}`,
    `What changed for me this week on ${topic}? ${observation}.`,
    `${opening} about ${topic}: ${observation}. Anyone seeing this differently?`,
    `A thread I want to keep pulling on in ${topic}: ${observation}.`,
    `${topic} has been noisy, but one signal stands out—${observation}. ${ending}`,
    `Talked with people on both sides of the ${topic} debate in ${place}. ${observation}.`,
    `${observation[0].toUpperCase()}${observation.slice(1)}. That feels important for ${topic} in ${place}.`
  ];
  const context = contexts[Math.floor(randomUnit(seed + 113) * contexts.length)];
  const tag = index % 5 === 0 ? ` #${topicName}` : '';
  let body = context;
  const usedBodies = usedBodiesByTopic.get(topicName) || new Set();
  if (usedBodies.has(body)) {
    const followUp = ` Next I’m watching how ${keywordA} changes in ${place} after ${time}.`;
    body = `${body.slice(0, Math.max(80, 278 - tag.length - followUp.length))}${followUp}`;
  }
  usedBodies.add(body);
  usedBodiesByTopic.set(topicName, usedBodies);
  return `${body}${tag}`.slice(0, 278);
}

function addPost(topicName, keywords, index, hubIndex, sentimentBias = 0) {
  const id = `demo-${String(++sequence).padStart(5, '0')}`;
  const place = places[index % 30 < 12 ? hubIndex % places.length : (index * 5 + hubIndex) % places.length];
  const createdAt = dateFor(index, hubIndex);
  const sentimentNoise = (randomUnit(index * 37 + hubIndex * 17) + randomUnit(index * 53 + hubIndex * 29) - 1) * .72;
  const sentimentScore = Number(Math.max(-1, Math.min(1, sentimentBias + sentimentNoise)).toFixed(2));
  const content = postContent(topicName, keywords, index, hubIndex, place[0], createdAt);
  tweets[id] = {
    id: 10000 + sequence, tweet_id: id, content, user_mentions_count: String(index % 4),
    favorite_count: String((index * 19 + hubIndex * 7) % 480), retweet_count: String((index * 11) % 160),
    hashtag_id: `demo-${topicName}`, user_id: 5000 + sequence, created_at: createdAt,
    sentiment: sentimentScore > .15 ? 'positive' : sentimentScore < -.15 ? 'negative' : 'neutral',
    sentiment_score: sentimentScore, location: place[0], latitude: String(place[1]), longitude: String(place[2]),
    anamoly: Number((((index * 13 + hubIndex) % 100) / 100).toFixed(2)),
    x: Number(Math.sin(sequence * .61).toFixed(4)), y: Number(Math.cos(sequence * .47).toFixed(4)),
    length: content.length, followers_count: 120 + ((index * 977 + hubIndex * 431) % 95000),
    friends_count: 80 + ((index * 131) % 5200), status_count: 500 + ((index * 1901) % 180000), synthetic: true
  };
  generatedIds.push(id);
  return id;
}

const newTopics = newTopicSpecs.map(([name, keywords], topicIndex) => {
  const postCount = 45 + Math.floor(randomUnit(topicIndex * 97 + 29) * 46);
  const sentimentBias = (randomUnit(topicIndex * 83 + 41) - .5) * .9;
  const childrens = Array.from({ length: postCount }, (_, index) => addPost(name, keywords, index, topicIndex + 4, sentimentBias));
  // Categories occupy interpretable neighborhoods: x moves from people-led to systems-led,
  // while y moves from practical/current discussion to speculative/future discussion.
  const centers = { technology: [1.45, 1.35], planet: [1.75, .75], health: [-1.4, -.55], work: [0, -.65], sports: [-1.7, -1.35], cities: [1.55, .05], culture: [-1.1, .7], lifestyle: [-.8, -1.45] };
  const [centerX, centerY] = centers[categoryByTopic.get(name)];
  const jitterX = (randomUnit(topicIndex * 17 + 3) - .5) * 1.05;
  const jitterY = (randomUnit(topicIndex * 23 + 7) - .5) * .9;
  return {
    name, start_time: '2022-01-01 00:00:00.000', end_time: '2022-12-31 23:59:59.000',
    user_volume: childrens.length, sentiment: Number((((topicIndex % 7) - 3) / 10).toFixed(2)),
    anamoly: Number((.28 + (topicIndex % 6) * .11).toFixed(2)),
    x: Number((centerX + jitterX).toFixed(4)), y: Number((centerY + jitterY).toFixed(4)),
    childrens, keywords
  };
});
topics.push(...newTopics);

const topicByName = new Map(topics.map(topic => [String(topic.name), topic]));
for (const topic of topics) {
  const posts = topic.childrens.map(id => tweets[id]).filter(Boolean);
  const dates = posts.map(post => post.created_at).sort();
  topic.user_volume = posts.length;
  topic.start_time = dates[0] || topic.start_time;
  topic.end_time = dates.at(-1) || topic.end_time;
  topic.sentiment = posts.reduce((sum, post) => sum + Number(post.sentiment_score || 0), 0) / Math.max(1, posts.length);
}

function refreshCluster(node) {
  const topic = topicByName.get(String(node.name));
  if (topic) node.glyph = structuredClone(topic);
  (node.children || []).forEach(refreshCluster);
}
refreshCluster(cluster);

const emergingGlyph = {
  name: 'emerging conversations', start_time: '2022-01-01 00:00:00.000', end_time: '2022-12-31 23:59:59.000',
  user_volume: newTopics.reduce((sum, topic) => sum + topic.user_volume, 0), sentiment: 0.04, anamoly: 0.58,
  x: 0, y: 0, childrens: newTopics.flatMap(topic => topic.childrens), keywords: newTopicSpecs.flatMap(([, keys]) => keys)
};
cluster.children = [];
categoryNames.forEach((category, categoryIndex) => {
  const topicsInCategory = newTopics.filter(topic => categoryByTopic.get(topic.name) === category);
  const glyph = {
    ...emergingGlyph,
    name: category,
    user_volume: topicsInCategory.reduce((sum, topic) => sum + topic.user_volume, 0),
    childrens: topicsInCategory.flatMap(topic => topic.childrens),
    keywords: topicsInCategory.flatMap(topic => topic.keywords).slice(0, 24)
  };
  cluster.children.push({
    name: category,
    glyph,
    children: topicsInCategory.map(topic => ({ name: topic.name, glyph: structuredClone(topic) }))
  });
});
const allIds = Object.keys(tweets);
cluster.value = allIds.length;
cluster.glyph = { ...cluster.glyph, user_volume: allIds.length, start_time: '2022-01-01 00:00:00.000', end_time: '2022-12-31 23:59:59.000', childrens: allIds };

await writeFile(topicsPath, `${JSON.stringify(topics, null, 2)}\n`);
await writeFile(tweetsPath, `${JSON.stringify(tweets, null, 2)}\n`);
await writeFile(clusterPath, `${JSON.stringify(cluster, null, 2)}\n`);

console.log(`Generated ${generatedIds.length} synthetic posts; ${Object.keys(tweets).length} total posts across ${topics.length} topics.`);

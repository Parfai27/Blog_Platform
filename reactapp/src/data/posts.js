export const posts = [
  {
    id: "bus-lanes",
    title: "One month on Kigali's new bus lanes",
    excerpt: "The aisle is still crowded. What changed is the waiting, and the watch that used to scold me every morning.",
    category: "City",
    author: "Amina Uwase",
    date: "2026-10-21",
    image: "/images/road.jpg",
    body: "I have taken the Nyabugogo bus every weekday since the lanes opened. The ride itself is not pretty. People still pack the aisle, and the afternoon bus home is loud. What changed is the waiting. On KN 3 the bus used to crawl behind cars that stopped twice in one block. Now it keeps a clearer path, and I get to the office before the standup starts. I do not know yet if the lanes are fair to everyone else on the road. I only know my walk from the stop is the same, and my morning is quieter.",
  },
  {
    id: "kimironko-tomatoes",
    title: "The tomato seller who knows my order",
    excerpt: "She laughs when I ask for the soft ones, then adds two extra for the sauce I always burn.",
    category: "Food",
    author: "Eric Habimana",
    date: "2026-10-18",
    image: "/images/market.jpg",
    body: "The tomato seller at Kimironko knows I always ask for the soft ones. She laughs and gives me two extra when I buy a kilo for sauce. The market is louder on Saturday, and the walk back up the hill takes longer when the bag is wet. I still go. A kitchen without those tomatoes tastes like I skipped the week.",
  },
  {
    id: "first-javascript",
    title: "The comma that taught me to stay",
    excerpt: "I used to close the laptop when the error turned red. A classmate read it out loud, one word at a time.",
    category: "Craft",
    author: "Diane Mukamana",
    date: "2026-10-14",
    image: "/images/writing.jpg",
    body: "I kept closing the laptop when the error was red. On Thursday a classmate sat with me and read the message out loud, word by word. The bug was a missing comma. I felt silly, then I felt awake. The page finally showed my name. I am still slow, and I still dislike the red text, but I can find a comma now.",
  },
  {
    id: "rain-in-musanze",
    title: "He asked me not to call the rain a disaster",
    excerpt: "The beans were leaning. We worked until the mist lifted, then ate potatoes with the skins on.",
    category: "Field notes",
    author: "Claude Ndayisaba",
    date: "2026-10-09",
    image: "/images/rain.jpg",
    body: "My uncle called before sunrise to say the beans were leaning. The rain had come hard for three nights, and the stakes he cut last week were too short. We worked until the mist lifted off the field. He does not trust a forecast on a phone. He trusts the way the soil sticks to the hoe. By noon the row was standing again. He told me not to write that the rain was a disaster. It was a heavy rain. The beans are still there.",
  },
  {
    id: "sunday-isombe",
    title: "Isombe, without the lecture",
    excerpt: "Pound the leaves until your arm complains. Add the peanut flour late, or the sauce turns stubborn.",
    category: "Food",
    author: "Ineza Keza",
    date: "2026-10-05",
    image: "/images/kitchen.jpg",
    body: "Soak the cassava leaves until the water runs clearer, then pound them until your arm complains. Fry the onion slowly. Add the peanut flour only after the leaves have softened, or the sauce goes thick too soon. My aunt adds a little smoked fish at the end and tells everyone she did not. Serve it with boiled green banana, not with a speech.",
  },
  {
    id: "huye-to-kigali",
    title: "The bus conductor who said my stop correctly",
    excerpt: "I moved with two bags and a mattress. Last night I found the bus that takes me home without the long stand.",
    category: "City",
    author: "Patrick Mugisha",
    date: "2026-09-28",
    image: "/images/city.jpg",
    body: "I moved with two bags and a mattress tied to the roof of a friend's car. Huye was quiet in a way I understood. Kigali is quiet only very early. The first week I got lost between two buildings that looked the same. What I miss is the path behind my old house. I do not want to write that the city is too big. I want to write that I am still learning which bus takes me home. Last night I found it. The conductor said the stop the way my cousin says it, quickly, like everyone should already know.",
  },
  {
    id: "margin-notes",
    title: "Why the margin is the point",
    excerpt: "The finished sentence is not the whole draft. The note in the margin is where the next writer begins.",
    category: "Craft",
    author: "Keza Irakoze",
    date: "2026-09-20",
    image: "/images/books.jpg",
    body: "Open Margin started as a habit, not a brand. We left notes in the margins of each other's drafts: a clearer verb, a fact to check, a sentence that should stay because it sounded like the writer. This site is that habit with the door open. Bring a draft. Read someone else's. The margin is not empty space. It is the room we leave for the next sentence.",
  },
  {
    id: "power-cut",
    title: "Bread in the doorway",
    excerpt: "The power went at seven, right when the kettle clicked. We waited with the door open and the street doing the lighting.",
    category: "Daily life",
    author: "Samuel Hakizimana",
    date: "2026-09-12",
    image: "/images/writing.jpg",
    body: "The power went at 7, right when the kettle clicked. We ate bread in the doorway and waited. A neighbor's radio kept going on batteries. Nobody made a speech about it. When the lights returned, the kettle finished the cup it had started, and the evening went on as if the dark had been a short chapter.",
  },
]

export function sortPosts(list, order) {
  return [...list].sort((a, b) => {
    const left = new Date(a.date).getTime()
    const right = new Date(b.date).getTime()
    return order === "oldest" ? left - right : right - left
  })
}

export function filterPosts(list, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return list
  return list.filter((post) =>
    [post.title, post.excerpt, post.category, post.author, post.body]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  )
}

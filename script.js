import { supabase } from "./supabase/client.js";

const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");
const logoutBtn = document.querySelector(".logout-btn");

async function signUpUser(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error("Signup error:", error.message);
        updateNotifications(error.message);
        return;
    }

    console.log("User signed up:", data);

document.body.classList.add("logged-in");

const authContainer =
    document.querySelector("#auth-container");

authContainer.style.display = "none";
}

async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("Login error:", error.message);
        alert(error.message);
        return;
    }

    updateNotifications(
    "Welcome back to CDXX 🌿"
);

document.body.classList.add("logged-in");

const authContainer =
    document.querySelector("#auth-container");

authContainer.style.display = "none";
}

logoutBtn?.addEventListener("click", logoutUser);

async function checkUser() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const authContainer = document.querySelector("#auth-container");

if (user) {
    console.log("Current user:", user);

    document.body.classList.add("logged-in");

    authContainer.style.display = "none";

} else {
    console.log("No active user");

    authContainer.style.display = "flex";
}}

checkUser();

async function logoutUser() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error(error.message);
        return;
    }

    updateNotifications("Logged out successfully 🌙");
    location.reload();
}

signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#signup-email").value;
    const password = document.querySelector("#signup-password").value;

    await signUpUser(email, password);
});

loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-password").value;

    await loginUser(email, password);
});

/* ========================================= */
/* NAVIGATION ACTIVE STATE */
/* ========================================= */

const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {

    link.addEventListener('click', () => {

        navLinks.forEach(item => {
            item.classList.remove('active');
        });

        link.classList.add('active');

    });

});

/* ========================================= */
/* POSTS DATA */
/* ========================================= */

let savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];
let uploadedImage = '';
let uploadedVideo = '';

let posts = JSON.parse(
    localStorage.getItem('greenhausPosts')
) || [
    

    {
        username: 'Xanelle Tiger',
        time: '2h ago',
        content: 'Sunset smoke sessions in Cape Town just hit differently 🌅🍃',
        image: './images/smoking-by-beach.jpg',
        video: '',
        likes: 45,
        comments: 22,

        commentsData: [

            {
                username: 'Nomsa_Z',
                text: 'This vibe is immaculate 🌿'
            },

            {
                username: 'CloudWalker',
                text: 'Late-night GreenHaus energy hits different.'
            }

        ]
    },

    {
        username: 'CollinBeatz',
        time: '5h ago',
        content: 'Late-night coding with neo soul playlists and rain outside 🎵🌧️',
        image: './images/coding-at-night.jpeg',
        video: '',
        likes: 67,
        comments: 35,

        commentsData: [

            {
                username: 'LoFiSoul',
                text: 'Need the playlist ASAP 🎵'
            }

        ]
    }

];

/* ========================================= */
/* FEED CONTAINER */
/* ========================================= */

const feedContainer = document.querySelector('.feed-container');

/* ========================================= */
/* POST ACTIONS EVENT DELEGATION */
/* ========================================= */

feedContainer.addEventListener('click', (event) => {

    const likeButton =
        event.target.closest('.like-btn');

    const commentButton =
        event.target.closest('.comment-btn');

    const saveButton =
        event.target.closest('.save-btn');

    /* LIKE SYSTEM */

    if (likeButton) {

        const postCard =
            likeButton.closest('.post-card');

        const postIndex =
            Array.from(feedContainer.children)
            .indexOf(postCard);

        const likeCount =
            likeButton.querySelector('span');

        let currentLikes =
            Number(likeCount.textContent);

        if (
            likeButton.classList.contains('liked')
        ) {

            currentLikes--;

            likeButton.classList.remove('liked');

        } else {

            currentLikes++;

            likeButton.classList.add('liked');

        }

        likeCount.textContent =
            currentLikes;

        posts[postIndex].likes =
            currentLikes;

        savePosts();

        updateNotifications(
            'Someone appreciated your vibe 🌿'
        );

    }

    /* COMMENT SYSTEM */

    if (commentButton) {

        activePostIndex =
            commentButton.dataset.index;

        commentsModal.classList.add('active');

        renderComments();

    }

    /* SAVE SYSTEM */

    if (saveButton) {

        const postIndex =
            saveButton.dataset.index;

        const selectedPost =
            posts[postIndex];

        const alreadySaved =
            savedPosts.includes(
                selectedPost.content
            );

        if (alreadySaved) {

            savedPosts = savedPosts.filter(post => {

                return post !==
                    selectedPost.content;

            });

            updateNotifications(
                'Post removed from saved vibes'
            );

        } else {

            savedPosts.push(
                selectedPost.content
            );

            updateNotifications(
                'Post saved successfully 🌿'
            );

        }

        localStorage.setItem(
            'savedPosts',
            JSON.stringify(savedPosts)
        );

        renderPosts();

    }

});

/* ========================================= */
/* RENDER POSTS FUNCTION */
/* ========================================= */

function renderPosts(postsToRender = posts) {

    // CLEAR FEED
    feedContainer.innerHTML = '';

    // LOOP THROUGH POSTS
    postsToRender.forEach((post, index) => {

        feedContainer.innerHTML += `

            <div class="post-card">

                <div class="post-header">

                    <div class="user-info">

                        <h3>${post.username}</h3>

                        <span>${post.time}</span>

                    </div>

                </div>

                <p class="post-text">
                    ${post.content}
                </p>

                ${
    post.video

    ?

    `

    <video
        class="post-video"
        src="${post.video}"
        controls
        autoplay
        muted
        loop
    ></video>

    `

    :

    `

    <img
        src="${post.image}"
        alt="Post Image"
    >

    `
}

                <div class="post-actions">

                    <button class="like-btn">

                        ⬆ <span>${post.likes}</span>

                    </button>

                    <button class="comment-btn"
                    data-index="${index}">

                        💬 <span>${post.comments}</span>

                    </button>

                    <button class="save-btn" data-index="${index}">

                    🔖

                    <span>

                        ${
                        savedPosts.includes(post.content)
                        ? 'Saved'
                        : 'Save'
                        }

                    </span>

                  </button>

                </div>

            </div>

        `;

    });

    
}

/* SAVE POSTS TO STORAGE */

function savePosts() {

    localStorage.setItem(
        'greenhausPosts',
        JSON.stringify(posts)
    );

}


/* ========================================= */
/* LIKE BUTTON SYSTEM */
/* ========================================= */



/* ========================================= */
/* SAVE POSTS SYSTEM */
/* ========================================= */



/* ========================================= */
/* CREATE POST SYSTEM */
/* ========================================= */

const imageUpload = document.querySelector('#image-upload');

const videoUpload = document.querySelector('#video-upload');

/* VIDEO UPLOAD SYSTEM */

videoUpload?.addEventListener('change', () => {

    const file = videoUpload.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {

        uploadedVideo = event.target.result;

    };

    reader.readAsDataURL(file);

});

/* IMAGE UPLOAD SYSTEM */

imageUpload?.addEventListener('change', () => {

    const file = imageUpload.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {

        uploadedImage = event.target.result;

    };

    reader.readAsDataURL(file);

});

const postButton = document.querySelector('#post-btn');

postButton?.addEventListener('click', () => {

    const postInput = document.querySelector('#post-input');

    // GET INPUT VALUE
    const postContent = postInput.value;

    // PREVENT EMPTY POSTS
    if (postContent.trim() === '') {
        return;
    }

    // CREATE NEW POST OBJECT
    const newPost = {

        username: 'You',
        time: 'Just now',
        content: postContent,
        image: uploadedVideo
    ? ''
    : uploadedImage || './images/lounge.jpg',
        video: uploadedVideo,
        likes: 0,
        comments: 0,
        commentsData: []

    };

    // ADD POST TO START OF ARRAY
    posts.unshift(newPost);
    savePosts();

    // RERENDER POSTS
    renderPosts();
    renderTrending();
    updateNotifications('New vibe posted 🍃');

    // CLEAR INPUT
    
    uploadedImage = '';

    imageUpload.value = '';
    
    uploadedVideo = '';

    videoUpload.value = '';

    postInput.value = '';

});

/* ========================================= */
/* INITIAL RENDER */
/* ========================================= */

renderPosts();
/* ========================================= */
/* MOBILE SIDEBAR */
/* ========================================= */

const menuToggle = document.querySelector('.menu-toggle');

const sidebar = document.querySelector('.sidebar-left');

menuToggle?.addEventListener('click', () => {

    sidebar.classList.toggle('active');

});

/* ========================================= */
/* THEME SYSTEM */
/* ========================================= */

const themeButtons =
    document.querySelectorAll('.mood-slide');

themeButtons.forEach(button => {

    button.addEventListener('click', () => {

        themeButtons.forEach(card => {

    card.classList.remove('active-mood');

});

button.classList.add('active-mood');

        const theme = button.dataset.theme;

        switch(theme) {

            case 'green':

                document.documentElement.style.setProperty('--bg-1', '#081c15');
                document.documentElement.style.setProperty('--bg-2', '#1b4332');
                document.documentElement.style.setProperty('--accent', '#95d5b2');

                break;

            case 'purple':

                document.documentElement.style.setProperty('--bg-1', '#240046');
                document.documentElement.style.setProperty('--bg-2', '#5a189a');
                document.documentElement.style.setProperty('--accent', '#c77dff');

                break;

            case 'autumn':

                document.documentElement.style.setProperty('--bg-1', '#432818');
                document.documentElement.style.setProperty('--bg-2', '#99582a');
                document.documentElement.style.setProperty('--accent', '#ddb892');

                break;

            case 'rain':

                document.documentElement.style.setProperty('--bg-1', '#0f172a');
                document.documentElement.style.setProperty('--bg-2', '#334155');
                document.documentElement.style.setProperty('--accent', '#7dd3fc');

                break;

        }

    });

});

/* ========================================= */
/* LIVE SEARCH SYSTEM */
/* ========================================= */

const searchInput = document.querySelector('#search-input');

searchInput?.addEventListener('input', () => {

    const searchTerm = searchInput.value.toLowerCase();

    const filteredPosts = posts.filter(post => {

        return (

            post.content.toLowerCase().includes(searchTerm)

            ||

            post.username.toLowerCase().includes(searchTerm)

        );

    });

    renderPosts(filteredPosts);

});

/* ========================================= */
/* COMMENTS MODAL SYSTEM */
/* ========================================= */

const commentsModal = document.querySelector('.comments-modal');

const closeModalButton = document.querySelector('.close-modal');

const commentsContainer = document.querySelector('.comments-container');

const submitCommentButton = document.querySelector('#submit-comment');

const commentInput = document.querySelector('#comment-input');

let activePostIndex = null;

/* OPEN MODAL */



/* RENDER COMMENTS */

function renderComments() {

    commentsContainer.innerHTML = '';

    const activePost = posts[activePostIndex];

    activePost.commentsData.forEach(comment => {

        commentsContainer.innerHTML += `

            <div class="comment">

                <h4>${comment.username}</h4>

                <p>${comment.text}</p>

            </div>

        `;

    });

}

/* SUBMIT COMMENT */

submitCommentButton.addEventListener('click', () => {

    const commentText = commentInput.value;

    if (commentText.trim() === '') {
        return;
    }

    const newComment = {

        username: 'You',
        text: commentText

    };

    posts[activePostIndex].commentsData.push(newComment);

    posts[activePostIndex].comments++;

    savePosts();

    renderComments();

    renderPosts();

    renderTrending();

    commentInput.value = '';

});

/* CLOSE MODAL */

closeModalButton.addEventListener('click', () => {

    commentsModal.classList.remove('active');

});

/* CLOSE WHEN CLICKING OUTSIDE */

commentsModal.addEventListener('click', (event) => {

    if (event.target === commentsModal) {

        commentsModal.classList.remove('active');

    }

});

/* ========================================= */
/* NOTIFICATION SYSTEM */
/* ========================================= */

const notificationCount = document.querySelector('.notification-count');

const toast = document.querySelector('.toast');

const toastMessage = document.querySelector('#toast-message');

let notifications = 0;

/* SHOW TOAST */

function showToast(message) {

    toastMessage.textContent = message;

    toast.classList.add('active');

    setTimeout(() => {

        toast.classList.remove('active');

    }, 3000);

}

/* UPDATE NOTIFICATIONS */

function updateNotifications(message) {

    notifications++;

    notificationCount.textContent = notifications;

    showToast(message);

}

/* ========================================= */
/* PROFILE DROPDOWN */
/* ========================================= */

const profileTrigger = document.querySelector('.profile-trigger');

const profileDropdown = document.querySelector('.profile-dropdown');

/* TOGGLE DROPDOWN */

if (profileTrigger) {

    profileTrigger.addEventListener('click', () => {

        profileDropdown.classList.toggle('active');

    });

}

/* CLICK OUTSIDE TO CLOSE */

document.addEventListener('click', (event) => {

    const dropdownWrapper = document.querySelector(
        '.profile-dropdown-wrapper'
    );

    if (
    dropdownWrapper &&
    !dropdownWrapper.contains(event.target)
) {

    profileDropdown.classList.remove('active');

}

});

/* ========================================= */
/* TRENDING HASHTAGS SYSTEM */
/* ========================================= */

const trendingList = document.querySelector('.trending-list');

/* EXTRACT HASHTAGS */

function extractHashtags(text) {

    const hashtags = text.match(/#[a-zA-Z0-9_]+/g);

    return hashtags || [];

}

/* RENDER TRENDING */

function renderTrending() {

    trendingList.innerHTML = '';

    const hashtagCounts = {};

    posts.forEach(post => {

        const hashtags = extractHashtags(post.content);

        hashtags.forEach(tag => {

            if (hashtagCounts[tag]) {

                hashtagCounts[tag]++;

            } else {

                hashtagCounts[tag] = 1;

            }

        });

    });

    const sortedTrends = Object.entries(hashtagCounts)
        .sort((a, b) => b[1] - a[1]);

    sortedTrends.slice(0, 5).forEach(trend => {

        trendingList.innerHTML += `

            <div class="trend-item">

                <p>${trend[0]}</p>

                <span>${trend[1]} posts</span>

            </div>

        `;

    });

}

renderTrending();

/* ========================================= */
/* MUSIC PLAYER SYSTEM */
/* ========================================= */

const audio = document.querySelector('#lofi-audio');

const playButton = document.querySelector('#play-btn');

const albumCover = document.querySelector('.album-cover');

let isPlaying = false;

playButton.addEventListener('click', () => {

    if (isPlaying) {

        audio.pause();

        playButton.classList.remove('playing');

playButton.innerHTML = `

    <span class="play-icon">
        ▶
    </span>

    <span class="play-text">
        Play Vibes
    </span>

`;

        albumCover.classList.remove('playing');

    } else {

        audio.play();

        playButton.classList.add('playing');

playButton.innerHTML = `

    <span class="play-icon">
        ⏸
    </span>

    <span class="play-text">
        Pause Vibes
    </span>

`;

        albumCover.classList.add('playing');

    }

    isPlaying = !isPlaying;

});

/* ========================================= */
/* ROOM DATA */
/* ========================================= */



/* ========================================= */
/* LIVE CHAT SYSTEM */
/* ========================================= */

const chatMessages = document.querySelector('.chat-messages');

const chatInput = document.querySelector('#chat-input');

const sendChatButton = document.querySelector('#send-chat');

/* ========================================= */
/* ROOM SYSTEM */
/* ========================================= */

let currentRoom = 'hotbox';

/* ROOM MESSAGES */

const defaultRoomMessages = {

    hotbox: [

        {
            user: 'CloudWalker',
            text: 'Passing the aux 🌧️'
        },

        {
            user: 'LoudPack',
            text: 'This room is floating rn 🍃'
        }

    ],

    chill: [

        {
            user: 'RainMode',
            text: 'Lo-fi and rain tonight.'
        },

        {
            user: 'NeoSoul',
            text: 'Everybody breathe slowly 🌿'
        }

    ],

    neosoul: [

        {
            user: 'MidnightDev',
            text: 'Late-night coding session activated.'
        },

        {
            user: 'LofiGhost',
            text: 'This synthwave playlist is crazy.'
        }

    ]

};

const roomMessages = JSON.parse(
    localStorage.getItem('greenhausRooms')
) || defaultRoomMessages;

/* ========================================= */
/* ROOM ATMOSPHERES */
/* ========================================= */

const roomAtmospheres = {

    hotbox: {

        title: '🌿 #Hot Box',

        status: 'Late-night chaos and smoke sessions.',

        online: 324,

        replies: [

            'Pass the lighter 😭',
            'This room is too funny tonight.',
            'Somebody play Brent Faiyaz.',
            'This edible is illegal.',
            'Peak GreenHaus behavior rn.'

        ],

        users: [

            'CloudWalker',
            'LoudPack',
            '420Vision',
            'SmokeySoul',
            'AshTray'

        ]

    },

    chill: {

        title: '🌧️ #Chill Room',

        status: 'Rainy night conversations and calm energy.',

        online: 189,

        replies: [

            'The rain sounds crazy tonight.',
            'Everybody breathe slowly.',
            'Lo-fi therapy session.',
            'This room feels peaceful.',
            'Need tea and synthwave rn.'

        ],

        users: [

            'RainMode',
            'NeoSoul',
            'MoonFlower',
            'BlueAura',
            'SlowVibes'

        ]

    },

    neosoul: {

        title: '🎵 #NeoSoul Nights',

        status: 'Coding, music and cinematic vibes.',

        online: 96,

        replies: [

            'This synth is heavenly.',
            'Late-night coding energy.',
            'Cyberpunk playlist activated.',
            'Need more neon aesthetics.',
            'This room feels futuristic.'

        ],

        users: [

            'MidnightDev',
            'LofiGhost',
            'PixelRain',
            'NeoTokyo',
            'AfterHours'

        ]

    }

};

/* SAVE ROOM MESSAGES */

function saveRoomMessages() {

    localStorage.setItem(
        'greenhausRooms',
        JSON.stringify(roomMessages)
    );

}

/* GET CURRENT TIME */

function getCurrentTime() {

    const now = new Date();

    return now.toLocaleTimeString([], {

        hour: '2-digit',
        minute: '2-digit'

    });

}

/* SEND MESSAGE */

sendChatButton.addEventListener('click', () => {

    const message = chatInput.value;

    if (message.trim() === '') {
        return;
    }

    addMessage('You', message);

    roomMessages[currentRoom].push({

    user: 'You',
    text: message

});

saveRoomMessages();

    chatInput.value = '';

    simulateReply();

});

/* ENTER KEY SEND */

chatInput.addEventListener('keypress', (event) => {

    if (event.key === 'Enter') {

        sendChatButton.click();

    }

});

function addMessage(
    username,
    message,
    isSystem = false
) {

    const time = getCurrentTime();

    if (isSystem) {

        chatMessages.innerHTML += `

            <div class="system-message">

                <span>
                    ${message}
                </span>

            </div>

        `;

    } else {

        chatMessages.innerHTML += `

            <div class="chat-message">

                <div class="chat-top">

                    <strong>${username}</strong>

                    <span class="chat-time">
                        ${time}
                    </span>

                </div>

                <p>${message}</p>

            </div>

        `;

    }

    /* AUTO SCROLL */

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}

/* ========================================= */
/* ROOM SWITCHING SYSTEM */
/* ========================================= */

const roomCards = document.querySelectorAll('.room-card');

const liveRoomTitle = document.querySelector('#live-room-title');

const roomStatus = document.querySelector('#room-status');

/* ========================================= */
/* RENDER ROOM */
/* ========================================= */

function renderRoomMessages() {

    chatMessages.innerHTML = '';

    const roomTitle =
document.querySelector('#live-room-title');

const roomStatus =
document.querySelector('#room-status');

roomTitle.textContent =
roomAtmospheres[currentRoom].title;

roomStatus.textContent =
roomAtmospheres[currentRoom].status;

    roomMessages[currentRoom].forEach(message => {

        addMessage(
            message.user,
            message.text
        );

    });

}

/* ========================================= */
/* ROOM SWITCHING */
/* ========================================= */

roomCards.forEach(card => {

    card.addEventListener('click', () => {

        roomCards.forEach(room => {

            room.classList.remove('active-room');

        });

        card.classList.add('active-room');

        currentRoom = card.dataset.room;

        renderRoomMessages();

        updateNotifications(
            `Joined ${card.innerText}`
        );

    });

});

/* SIMULATE REPLY */

function simulateReply() {

    const typingElement = document.createElement('div');

    typingElement.classList.add('typing-status');

    typingElement.innerHTML = `

    <div class="typing-bubble">

        <span></span>
        <span></span>
        <span></span>

    </div>

`;

    chatMessages.appendChild(typingElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {

        typingElement.remove();

        const roomData =
roomAtmospheres[currentRoom];

const randomReply = roomData.replies[
    Math.floor(
        Math.random() * roomData.replies.length
    )
];

const randomUser = roomData.users[
    Math.floor(
        Math.random() * roomData.users.length
    )
];

        addMessage(randomUser, randomReply);

        roomMessages[currentRoom].push({

    user: randomUser,
    text: randomReply

});

saveRoomMessages();

    }, 2000);

}

/* ========================================= */
/* INITIAL ROOM LOAD */
/* ========================================= */

renderRoomMessages();

/* ========================================= */
/* LIVE ONLINE COUNT SYSTEM */
/* ========================================= */

function updateOnlineCounts() {

    const roomCards =
        document.querySelectorAll('.room-card');

    roomCards.forEach(card => {

        const roomName = card.dataset.room;

        const room =
            roomAtmospheres[roomName];

        /* RANDOM FLUCTUATION */

        const randomChange =
            Math.floor(Math.random() * 11) - 5;

        room.online += randomChange;

        /* PREVENT NEGATIVE NUMBERS */

        if (room.online < 20) {

            room.online = 20;

        }

        /* UPDATE UI */

        const onlineElement =
            card.querySelector('.online-count');

        onlineElement.textContent =
            `${room.online} online`;

    });

}

/* UPDATE EVERY 5 SECONDS */

setInterval(updateOnlineCounts, 5000);

/* ========================================= */
/* LIVE ROOM ACTIVITY SYSTEM */
/* ========================================= */

function simulateRoomActivity() {

    const room =
        roomAtmospheres[currentRoom];

    const randomUser = room.users[
        Math.floor(
            Math.random() * room.users.length
        )
    ];

    const activityType =
        Math.random();

    /* USER JOINS */

    if (activityType > 0.5) {

        addMessage(
            '',
            `${randomUser} joined the room 🌿`,
            true
        );

        room.online++;

    }

    /* USER LEAVES */

    else {

        addMessage(
            '',
            `${randomUser} left the room 🌙`,
            true
        );

        room.online--;

        if (room.online < 20) {

            room.online = 20;

        }

    }

}

/* RANDOM ROOM ACTIVITY */

setInterval(simulateRoomActivity, 8000);

async function testConnection() {

    const { data, error } =
        await supabase.auth.getSession();

    if (error) {

        console.error(
            'Supabase connection failed:',
            error
        );

    } else {

        console.log(
            'Supabase connected successfully 🌿'
        );

    }

}

testConnection();

supabase.auth.onAuthStateChange((event, session) => {

    if (session) {

        document.body.classList.add("logged-in");

        console.log("User logged in");

    } else {

        document.body.classList.remove("logged-in");

        console.log("User logged out");
    }

});

/* ========================================= */
/* GIG GUIDE SYSTEM */
/* ========================================= */

const postGigBtn =
    document.querySelector("#post-gig-btn");

const gigList =
    document.querySelector(".gig-list");

const gigMediaInput =
    document.querySelector("#gig-media");

let gigs = JSON.parse(
    localStorage.getItem("greenhausGigs")
) || [];

let uploadedGigMedia = "";

/* HANDLE MEDIA UPLOAD */

gigMediaInput.addEventListener("change", () => {

    const file = gigMediaInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event) {

        uploadedGigMedia =
            event.target.result;

    };

    reader.readAsDataURL(file);

});

/* RENDER GIGS */

function renderGigs() {

    gigList.innerHTML = "";

    gigs.forEach(gig => {

        gigList.innerHTML += `

            <div class="gig-item">

                <h4>${gig.title}</h4>

                <p>📍 ${gig.venue}</p>

                <p>🗓 ${gig.date}</p>

                ${
                    gig.ticketLink
                    ?
                    `
                    <a
                        href="${gig.ticketLink}"
                        target="_blank"
                        class="gig-ticket-link"
                    >
                        🎟 Buy Tickets
                    </a>
                    `
                    :
                    ""
                }

                ${
    gig.media?.startsWith("data:video")

    ?

    `
    <video
        src="${gig.media}"
        controls
        class="gig-media"
    ></video>
    `

    :

    `
    <img
        src="${gig.media}"
        class="gig-media"
    >
    `
}

            </div>

        `;

    });

}

/* POST GIG */

postGigBtn.addEventListener("click", () => {

    const title =
        document.querySelector("#gig-title").value;

    const venue =
        document.querySelector("#gig-venue").value;

    const date =
        document.querySelector("#gig-date").value;

    const ticketLink =
        document.querySelector("#gig-link").value;

    if (
        title.trim() === "" ||
        venue.trim() === "" ||
        date.trim() === ""
    ) {
        return;
    }

    const newGig = {

        title,
        venue,
        date,
        ticketLink,
        media: uploadedGigMedia

    };

    gigs.unshift(newGig);

    localStorage.setItem(
        "greenhausGigs",
        JSON.stringify(gigs)
    );

    renderGigs();

});

/* INITIAL LOAD */

renderGigs();


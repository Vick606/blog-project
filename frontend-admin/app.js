const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');

const loginForm = document.getElementById('login-form');
const postForm = document.getElementById('post-form');
const loginSection = document.getElementById('login-section');
const postsSection = document.getElementById('posts-section');
const commentsSection = document.getElementById('comments-section');
const newPostBtn = document.getElementById('new-post-btn');
const postFormContainer = document.getElementById('post-form-container');

loginForm.addEventListener('submit', login);
postForm.addEventListener('submit', savePost);
newPostBtn.addEventListener('click', () => {
    postFormContainer.style.display = 'block';
    postForm.reset();
    postForm.dataset.mode = 'create';
});

tinymce.init({
    selector: '#content',
    plugins: 'advlist autolink lists link image charmap print preview hr anchor pagebreak',
    toolbar_mode: 'floating',
});

async function login(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.token) {
            token = data.token;
            localStorage.setItem('token', token);
            loginSection.style.display = 'none';
            postsSection.style.display = 'block';
            fetchPosts();
        } else {
            alert('Login failed');
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
}

async function savePost(e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = tinymce.get('content').getContent();
    const mode = postForm.dataset.mode;
    const id = postForm.dataset.id;

    try {
        const url = mode === 'create' ? `${API_URL}/posts` : `${API_URL}/posts/${id}`;
        const method = mode === 'create' ? 'POST' : 'PUT';
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content, published: true })
        });
        const newPost = await response.json();
        fetchPosts();
        postForm.reset();
        postFormContainer.style.display = 'none';
    } catch (error) {
        console.error('Error saving post:', error);
    }
}

async function fetchPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function displayPosts(posts) {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p class="${post.published ? 'published' : 'unpublished'}">
                ${post.published ? 'Published' : 'Unpublished'}
            </p>
            <button onclick="editPost(${post.id})">Edit</button>
            <button onclick="togglePublishPost(${post.id}, ${!post.published})">
                ${post.published ? 'Unpublish' : 'Publish'}
            </button>
            <button onclick="deletePost(${post.id})">Delete</button>
            <button onclick="viewComments(${post.id})">View Comments</button>
        `;
        postsList.appendChild(postElement);
    });
}

async function editPost(id) {
    try {
        const response = await fetch(`${API_URL}/posts/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const post = await response.json();
        document.getElementById('title').value = post.title;
        tinymce.get('content').setContent(post.content);
        postForm.dataset.mode = 'edit';
        postForm.dataset.id = id;
        postFormContainer.style.display = 'block';
    } catch (error) {
        console.error('Error fetching post for edit:', error);
    }
}

async function togglePublishPost(id, publishState) {
    try {
        await fetch(`${API_URL}/posts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ published: publishState })
        });
        fetchPosts();
    } catch (error) {
        console.error('Error toggling post publish state:', error);
    }
}

async function deletePost(id) {
    if (confirm('Are you sure you want to delete this post?')) {
        try {
            await fetch(`${API_URL}/posts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }
}

async function viewComments(postId) {
    try {
        const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const comments = await response.json();
        displayComments(comments);
        commentsSection.style.display = 'block';
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

function displayPosts(posts) {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';

    posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.setAttribute('data-aos', 'fade-up');
        postElement.setAttribute('data-aos-delay', index * 100);
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p class="${post.published ? 'published' : 'unpublished'}">
                ${post.published ? 'Published' : 'Unpublished'}
            </p>
            <button onclick="editPost(${post.id})" class="action-btn">Edit</button>
            <button onclick="togglePublishPost(${post.id}, ${!post.published})" class="action-btn">
                ${post.published ? 'Unpublish' : 'Publish'}
            </button>
            <button onclick="deletePost(${post.id})" class="action-btn">Delete</button>
        `;
        postsList.appendChild(postElement);
    });

    AOS.init();
}

async function deleteComment(id) {
    if (confirm('Are you sure you want to delete this comment?')) {
        try {
            await fetch(`${API_URL}/comments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Refresh comments after deletion
            viewComments(currentPostId);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    }
}

if (token) {
    loginSection.style.display = 'none';
    postsSection.style.display = 'block';
    fetchPosts();
}

document.addEventListener('DOMContentLoaded', () => {
    AOS.init();
});
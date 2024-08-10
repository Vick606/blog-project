const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');

const loginForm = document.getElementById('login-form');
const postForm = document.getElementById('post-form');
const loginSection = document.getElementById('login-section');
const postsSection = document.getElementById('posts-section');

loginForm.addEventListener('submit', login);
postForm.addEventListener('submit', createPost);

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

async function createPost(e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content, published: true })
        });
        const newPost = await response.json();
        fetchPosts();
        postForm.reset();
    } catch (error) {
        console.error('Error creating post:', error);
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
            <p>${post.content}</p>
            <button onclick="deletePost(${post.id})">Delete</button>
        `;
        postsList.appendChild(postElement);
    });
}

async function deletePost(id) {
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

if (token) {
    loginSection.style.display = 'none';
    postsSection.style.display = 'block';
    fetchPosts();
}
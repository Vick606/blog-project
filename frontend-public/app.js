const API_URL = 'http://localhost:3000/api';

async function fetchPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`);
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function displayPosts(posts) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    posts.forEach((post, index) => {
        const postElement = document.createElement('article');
        postElement.classList.add('post');
        postElement.setAttribute('data-aos', 'fade-up');
        postElement.setAttribute('data-aos-delay', index * 100);
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <div class="post-meta">By ${post.author.username} on ${new Date(post.createdAt).toLocaleDateString()}</div>
            <p>${post.content.substring(0, 150)}...</p>
            <a href="#" class="read-more">Read more</a>
        `;
        container.appendChild(postElement);
    });

    AOS.init();
}

fetchPosts();
fetch('php/fetch_posts.php')
    .then(response => response.json())
    .then(posts => {
        const postList = document.getElementById('post-list');
        posts.forEach(post => {
            const li = document.createElement('li');
            li.textContent = post.title;
            postList.appendChild(li);
        });
    });

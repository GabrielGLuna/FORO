var iduser="iduser=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim(); 
        if (cookie.startsWith(iduser)) {
            var cokie = cookie.substring(iduser.length);
            iduser = cokie;
        }
    }
        
window.onload = function() {    
    loadChanels(); 
    loadPosts();
};

// Obtener elementos de la ventana emergente
const postsContainer = document.getElementById("posts-container");
const modal = document.getElementById("comment-modal");
const closeBtn = document.querySelector(".close-btn");
const existingComments = document.querySelector(".existing-comments");
const commentInput = document.getElementById("comment-input");

// Delegar eventos al contenedor para manejar botones
postsContainer.addEventListener('click', (event) => {
    if (event.target.closest('.like-button')) {
        console.log("diste like");
        const postId = event.target.closest('.like-button').getAttribute('data-id');
        likePost(postId, event.target.closest('.like-button'));
    } else if (event.target.closest('.comment-button')) {
        const postId = event.target.closest('.comment-button').getAttribute('data-id');
        commentPost(postId, event.target.closest('.comment-button'))
        modal.style.display = "block";
        console.log("hiciste clic en comentar");
    }
});
modal.addEventListener('click', (event)=>{
    if(event.target.closest('#submit-comment')){  
        console.log("presionaste comentar");
        var data = event.target.closest('#submit-comment').getAttribute('data-id');
        var dataId = data.split(',');
        var idUser = dataId[0];
        var postId = dataId[1];
        console.log("post", postId);
        console.log("user", idUser);
        sendComment(postId,idUser);            
    }
});

function loadChanels(){
    console.log("entro en load js", iduser);
    $.ajax({
        url: '../../dist/php/post.php',
                type: 'POST',
                data: { action: 'loadChanels', idUser:iduser},
                dataType: 'json',
                success: function(response){
                    console.log("canales: ", response.list);
                    if (response.success) {      
                        response.list.forEach(canal => {
                            
                            console.log("canales: ", canal.canalname);
                                // Crear el formato HTML para cada post
                                var postHTML = `
                        <button class="button-chanel" data-id="${channel.id_canal}">
                            <img src="dist/php/${channel.image}" class="mini-image" alt="${channel.canalname}">
                            <p>${channel.canalname}</p>
                        </button>
                    
                                `;
                                // Agregar el nuevo post al contenedor
                                document.getElementById('canales-group').innerHTML += postHTML;
                            });                        
                    }
                },
                error: function nojalo(error) {
                    console.error("no jalo", error);
                }
    });
    
}
function sendComment(postId, idUser) {
    var comment = document.getElementById("comment-input").value;
            console.log("esto es el coment", comment);
            document.getElementById("comment-input").value="";            
            $.ajax({
                url: '../../dist/php/post.php',
                type: 'POST',
                data: { action: 'sendComment', id_post: postId, idUser: idUser, comment:comment },
                dataType: 'json',
                success: function(response){
                    if (response.success) {
                        console.log("si jalo w");
                        document.getElementById("comment-input").value = "";
                        comment = document.getElementById("comment-input").value;
                    }
                },
                error: function nojalo() {
                    console.log("no jalo w");   
                }
            });
}


// Función para manejar el like
function likePost(postId, button) {
    
    $.ajax({
        url: '../../dist/php/post.php',
        type: 'POST',
        data: { action: 'like', id_post: postId },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                console.log('Like añadido correctamente');
                const newLikes = response.new_likes || 1;
                button.querySelector('i').className = 'bx bx-like';
                button.querySelector('span').textContent = ` Like (${newLikes})`;

            } else {
                console.error('Error al añadir el like:', response.error);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error en la soli citud AJAX:', error);
        }
    });
}


function commentPost(postId, button) {
    var idUser="idUser=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim(); 
        if (cookie.startsWith(idUser)) {
            var cokie = cookie.substring(idUser.length);
            idUser = cokie;
        }
    }
    var postHTML = `<div id="comment-group">
                    <div id="existing-comments" >
                        <!-- Aquí se mostrarán comentarios existentes -->
                        <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
                    </div>
                    <div class="add-comment">
                    <textarea placeholder="Escribe tu comentario aquí..." id="comment-input"></textarea>
                    <button id="submit-comment" data-id="${idUser},${postId}">comentar</button>                                        
                    </div>
                    </div>
                    `;
                    // Agregar el nuevo post al contenedor
                    document.getElementById('comments-part').innerHTML += postHTML;
                    console.log(modal.style.display);
                    $.ajax({
                        url: '../../dist/php/post.php',
                        type: 'POST',
                        data: { action: 'comment', id_post: postId },
                        dataType: 'json',
                        success: function (response) {
                            if (response.success) {
                                var commentsContainer = document.getElementById('existing-comments');
                                commentsContainer.innerHTML = ''; // Limpiar el contenido
                console.log("respuesta:", response.comments);
                
                // Recorrer y mostrar cada comentario
                response.comments.forEach(comments => {
                    commentsContainer.innerHTML += `
                    <div class="comment">
                    <p><strong>Usuario ${comments.username}:</strong> ${comments.contenido}</p>
                    </div>
                    `;
                });
            } else {
                console.error('Error al obtener comentarios:', response.error);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error en la solicitud en esta parte:', error);
        }
    });    
}


// Cerrar la ventana al hacer clic en la 'X'
closeBtn.addEventListener('click', () => {
    modal.style.display = "none";
    var group = document.getElementById('comment-group');
    group.remove();
});

// Cerrar la ventana al hacer clic fuera del contenido
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
        var group = document.getElementById('comment-group');
        group.remove();
    }
});

function loadPosts() {
    // Crear una solicitud AJAX
    console.log("id:", iduser);    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost/FORO/dist/php/get_posts.php?iduser=${iduser}`, true);
    
    // Cuando la solicitud se haya completado con éxito
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                var response = JSON.parse(xhr.responseText); // Parsear el JSON devuelto
                var posts = response.data; // Parsear el JSON devuelto
                // Si hay posts
                if (posts.length > 0) {
                    posts.forEach(post => {
                        // Crear el formato HTML para cada post
                        var postHTML = `
                            <div class="post">
                                <div class="head-post">
                                    <img src="../../dist/php/${post.image}" alt="User Photo">
                                    <div class="info">
                                        <span class="name">${post.username}</span>
                                        <span class="time">${post.fecha}</span>
                                    </div>                   
                                </div>
                                <div class="body-post">
                                    ${post.contenido_texto}
                                </div>
                                <div class="interaction-post">
                                    <button class="like-button" data-id="${post.id_post}">
                                        <i class='bx bx-like'></i>Like
                                    </button>
                                    <button class="comment-button" data-id="${post.id_post}">
                                        <i class='bx bx-comment-detail'></i>Comentar
                                    </button>
                                    <button>
                                        <i class='bx bx-share-alt'></i> Compartir
                                    </button>
                                </div>
                            </div>
                        `;
                        // Agregar el nuevo post al contenedor
                        document.getElementById('posts-container').innerHTML += postHTML;
                    });
                } else {
                    document.getElementById('posts-container').innerHTML = "No hay posts disponibles.";
                }
            } catch (e) {
                alert("Hubo un error al procesar los datos: " + e.message);
            }
        } else {
            alert("Hubo un error al cargar los posts.");
        }
    };
    

    xhr.send(); // Enviar la solicitud
}


function sendMessage() {
    // Obtener el mensaje del input
    var message = document.getElementById("post-input").value;
    console.log("mensaje a enviar", message);

    // Verificar que el mensaje no esté vacío
    if (message.trim() === "") {
        alert("Por favor, escribe un mensaje.");
        return;
    }

    // Crear un objeto FormData para enviar el mensaje y otros parámetros al servidor
    var formData = new FormData();
    formData.append("message", message);  // El mensaje a enviar
    formData.append("titulo_post", "Titulo");  // Titulo fijo
    formData.append("contenido_image", "");  // Imagen vacía (puedes cambiarlo si envías imágenes)
    formData.append("likes", "");  // Likes vacíos (puedes poner un valor si quieres)
    formData.append("numero_com", "");  // Número de comentarios vacíos (puedes poner un valor si quieres)
    formData.append("id_usuario", iduser);  // ID de usuario fijo
    formData.append("id_canal", 1);  // ID de canal fijo

    // Usar AJAX para enviar los datos al servidor
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost/FORO/dist/php/post.php", true); // URL del archivo PHP
    xhr.onload = function() {
        if (xhr.status === 200) {
            // Mostrar una respuesta del servidor
            console.log("mensaje enviado correctamente");
            document.getElementById("response").innerHTML = xhr.responseText;
            // Limpiar el campo de texto
            document.getElementById("post-input").value = "";
        } else {
            alert("Hubo un error al enviar el mensaje.");
        }
    };
    xhr.send(formData); // Enviar los datos al servidor
}






//styles
// Selección de elementos
const themeToggleButtons = document.querySelectorAll('.toggle-theme');
const body = document.body;

// Cargar el tema desde localStorage o usar el tema por defecto
const currentTheme = localStorage.getItem('theme') || 'light';
setTheme(currentTheme);

// Función para alternar el tema
function setTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark');
        updateIcons('dark');
    } else {
        body.classList.remove('dark');
        updateIcons('light');
    }
    localStorage.setItem('theme', theme);
}

// Función para actualizar íconos de los botones de tema
function updateIcons(theme) {
    themeToggleButtons.forEach(button => {
        const icon = button.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('bx-sun');
            icon.classList.add('bx-moon');
        } else {
            icon.classList.remove('bx-moon');
            icon.classList.add('bx-sun');
        }
    });
}

// Añadir eventos a los botones
themeToggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark') ? 'light' : 'dark';
        setTheme(newTheme);
    });
});
<?php
require "db.php"; // Asegúrate de que db.php esté correctamente incluido

// Verificar si el mensaje fue enviado
if (isset($_POST['message'])) {
    $message = trim($_POST['message']);  // El mensaje a insertar
    $titulo_post = "Titulo";  // Titulo fijo
    $contenido_image = isset($_POST['contenido_image']) ? $_POST['contenido_image'] : NULL;  // Imagen, por ahora vacía
    $likes = isset($_POST['likes']) ? $_POST['likes'] : NULL;  // Likes, por ahora vacíos
    $numero_com = isset($_POST['numero_com']) ? $_POST['numero_com'] : NULL;  // Número de comentarios, por ahora vacío
    $id_usuario = trim($_POST['id_usuario']);  // ID del usuario fijo
    $id_canal = 1;  // ID del canal fijo


    // Verificar que el mensaje no esté vacío
    if (!empty($message)) {
        // Escapar caracteres especiales para evitar SQL injection
        $message = $connection->real_escape_string($message);
        $titulo_post = $connection->real_escape_string($titulo_post);
        $contenido_image = $connection->real_escape_string($contenido_image);
        $likes = $connection->real_escape_string($likes);
        $numero_com = $connection->real_escape_string($numero_com);

        // Insertar el mensaje en la base de datos
        $sql = "INSERT INTO post (titulo_post, contenido_texto, contenido_image, likes, numero_com, id_usuario, id_canal) 
                VALUES ('$titulo_post', '$message', '$contenido_image', '$likes', '$numero_com', '$id_usuario', '$id_canal')";

        if ($connection->query($sql) === TRUE) {
            echo "Mensaje enviado con éxito.";
        } else {
            echo "Error: " . $sql . "<br>" . $connection->error;  // Mostrar errores si los hay
        }
    } else {
        echo "El mensaje está vacío.";  // Si el mensaje está vacío, se muestra este mensaje
    }
} 

// Cerrar la conexión
$action = $_POST['action'] ?? null;
$id_post = $_POST['id_post'] ?? null;
$idUser = $_POST['idUser'] ?? null;
$comment = $_POST['comment'] ?? null;

if ($action === 'like') {

    if(!empty($id_post)){
        $sql = "UPDATE post SET likes = likes + 1 WHERE id_post = ?";
        $stmt = $connection->prepare($sql);
        $stmt->bind_param("i", $id_post);

        if ($stmt->execute()) {
            // Obtener el nuevo valor de likes
            $likes_query = "SELECT likes FROM post WHERE id_post = ?";
            $likes_stmt = $connection->prepare($likes_query);
            $likes_stmt->bind_param("i", $id_post);
            $likes_stmt->execute();
            $likes_stmt->bind_result($new_likes);
            $likes_stmt->fetch();

            echo json_encode(['success' => true, 'new_likes' => $new_likes]);
            $likes_stmt->close();
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        $stmt->close();
    }
} elseif ($action === 'comment') {
    if (!empty($id_post)) {
        
        // Realizar un SELECT para obtener los comentarios asociados al post
        $sql = "SELECT c.id_comentario, c.contenido, c.id_usuario, u.username, c.id_post
                FROM comentario c
                INNER JOIN usuario u ON c.id_usuario = u.iduser
                WHERE c.id_post = ?;";
        $stmt = $connection->prepare($sql);
        $stmt->bind_param("i", $id_post);
        
        if ($stmt->execute()) {
            // Obtener los resultados
            $result = $stmt->get_result();
            $comments = [];

            while ($row = $result->fetch_assoc()) {
                $comments[] = $row; // Agregar cada fila al array de comentarios
            }
            echo json_encode(['success' => true, 'comments' => $comments]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }

        $stmt->close();
    } else {
        http_response_code(400);
    }
} elseif ($action === 'sendComment') {
    if (!empty($id_post) && !empty($idUser)) {
        $sql = "INSERT INTO comentario( contenido, id_usuario , id_post)
                VALUES('$comment','$idUser','$id_post')";
                $stmt = $connection -> prepare($sql);
                $stmt->execute();

    }
} elseif ($action === 'loadChanels') {
    if (!empty($idUser)) {
        $sql1 = "SELECT canales FROM usuario WHERE iduser = ?";
        $stmt1 = $connection->prepare($sql1);
        $stmt1->bind_param("i", $idUser);       
        if ($stmt1->execute()) {
            $result1 = $stmt1->get_result();
            if ($result1->num_rows > 0) {
                $row = $result1->fetch_assoc();
                $canales = rtrim($row['canales'], ',');
                if (!empty($canales)) {
                    $sql2 = "SELECT * FROM canales WHERE id_canal IN ($canales)";
                    $stmt2 = $connection->prepare($sql2);
                    if ($stmt2->execute()) {
                        $result2 = $stmt2->get_result();
                        $lista_canales = [];
                        while ($canal = $result2->fetch_assoc()) {
                            $lista_canales[] = $canal;
                        }
                        echo json_encode(["success" => true, "list" => $lista_canales]);
                    }
                    $stmt2->close();
                }
            }
        }
        $stmt1->close();
    }
}


$connection->close();  // Cerrar la conexión a la base de datos
?>

<?php
require "db.php"; // Asegúrate de que db.php esté correctamente incluido

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Función para enviar una respuesta JSON consistente
function jsonResponse($status, $message, $data = null) {
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ]);
    exit(); // Detener la ejecución después de enviar la respuesta
}

// Verificar que la conexión a la base de datos fue exitosa
if ($connection) {
    // Verificar si se recibió el parámetro 'iduser'
    if (isset($_GET['iduser'])) {
        $iduser = intval($_GET['iduser']); // Convertir el parámetro a un número entero para evitar inyecciones SQL

        $sql = "SELECT 
            p.id_post,
            p.titulo_post,
            p.likes,
            p.numero_com,
            p.id_usuario,
            p.id_canal,
            p.contenido_texto,
            p.fecha,
            u.image AS user_image,
            u.username AS username
        FROM post p
        INNER JOIN usuario u ON p.id_usuario = u.iduser
        WHERE p.id_usuario = ?";

        
        // Preparar la consulta,
        $stmt = $connection->prepare($sql);
        if ($stmt) {
            $stmt->bind_param("i", $iduser); // Vincular el parámetro
            $stmt->execute(); // Ejecutar la consulta
            $result = $stmt->get_result(); // Obtener los resultados

            // Verificar si se obtuvieron resultados
            if ($result->num_rows > 0) {
                // Crear un array para almacenar los posts
                $posts = [];
                
                // Recorrer los resultados y agregarlos al array
                while ($row = $result->fetch_assoc()) {
                    $posts[] = [
                        'id_post' => $row['id_post'],
                        'titulo_post' => $row['titulo_post'],
                        'likes' => $row['likes'],
                        'numero_com' => $row['numero_com'],
                        'id_usuario' => $row['id_usuario'],
                        'id_canal' => $row['id_canal'],
                        'contenido_texto' => $row['contenido_texto'],
                        'fecha' => $row['fecha'],
                        'image' => $row['user_image'], // Agregar la imagen del usuario
                        'username' => $row['username'], // Agregar la imagen del usuario
                    ];
                }
                
                // Enviar la respuesta con los posts
                jsonResponse('ok', 'Posts obtenidos con éxito.', $posts);
            } else {
                // Si no se encontraron posts, enviar un mensaje de error
                jsonResponse('error', 'No se encontraron posts para el usuario especificado.');
            }

            // Cerrar el statement
            $stmt->close();
        } else {
            jsonResponse('error', 'Error al preparar la consulta.');
        }
    } else {
        // Si no se recibió el parámetro 'iduser', devolver un mensaje de error
        jsonResponse('error', 'Falta el parámetro iduser.');
    }

    // Cerrar la conexión
    $connection->close();
} else {
    // Si no hay conexión a la base de datos, devolver un error
    jsonResponse('error', 'No se pudo conectar a la base de datos.');
}
?>

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

// Configuración de CORS para producción
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.VERCEL_URL || 'https://tudominio.com'
        : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Middleware para loggear todas las peticiones
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path} - Body:`, req.body);
    next();
});

// Conexión a MySQL usando pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || "209.133.211.106",
    user: process.env.DB_USER || "trilogit_admin",
    password: process.env.DB_PASSWORD || "Admin50p0r73*",
    database: process.env.DB_DATABASE || "trilogit_helpdesk",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}

// Función para inicializar la base de datos
const initializeDatabase = async () => {
    try {
        console.log("✅ Pool de conexiones MySQL creado");
        
        // Verificar y actualizar la estructura de la tabla usuarios
        try {
            const [userColumns] = await pool.query("SHOW COLUMNS FROM usuarios WHERE Field = 'rol'");
            if (userColumns.length === 0) {
                await pool.query(
                    "ALTER TABLE usuarios ADD COLUMN rol VARCHAR(20) DEFAULT 'normal'"
                );
                console.log("✅ Columna 'rol' agregada a la tabla usuarios");
            }
        } catch (error) {
            console.error("⚠️ Error al verificar/agregar columna rol:", error.message);
        }

        // Verificar y actualizar la estructura de la tabla tickets
        const alterTicketsTableSQL = `
            ALTER TABLE tickets 
            MODIFY COLUMN usuario_id INT NULL,
            DROP FOREIGN KEY IF EXISTS tickets_ibfk_1,
            ADD FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;
        `;
        
        try {
            await pool.query(alterTicketsTableSQL);
            console.log("✅ Tabla tickets actualizada para permitir tickets públicos");
        } catch (error) {
            console.error("⚠️ Error al modificar tabla tickets (puede ser normal si ya está modificada):", error.message);
        }

        // Crear tabla comentarios si no existe
        const createComentariosSQL = `
            CREATE TABLE IF NOT EXISTS comentarios (
                id INT PRIMARY KEY AUTO_INCREMENT,
                ticket_id INT NOT NULL,
                usuario_id INT NOT NULL,
                contenido TEXT NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        `;

        await pool.query(createComentariosSQL);
        console.log("✅ Tabla comentarios verificada/creada");

    } catch (error) {
        console.error("❌ Error inicializando base de datos:", error);
    }
};

// Inicializar la base de datos
initializeDatabase().catch(console.error);

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ message: "API funcionando correctamente" });
});

// Ruta para login
app.post("/login", async (req, res) => {
    console.log("🔐 Intento de login recibido:", req.body);
    const { email, password } = req.body;

    try {
        const [usuarios] = await pool.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Correo electrónico o contraseña incorrectos"
            });
        }

        const usuario = usuarios[0];
        const validPassword = await bcrypt.compare(password, usuario.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Correo electrónico o contraseña incorrectos"
            });
        }

        const { password: _, ...usuarioSinPassword } = usuario;
        console.log("✅ Login exitoso para:", email);
        
        res.status(200).json({
            success: true,
            message: "Login exitoso",
            usuario: usuarioSinPassword
        });
    } catch (error) {
        console.error("❌ Error en login:", error);
        res.status(500).json({
            success: false,
            message: "Error al iniciar sesión"
        });
    }
});

// Ruta para registro de usuarios
app.post("/register", async (req, res) => {
    const { nombre, email, telefono, area, empresa, password } = req.body;

    try {
        // Verificar si el email ya existe
        const [existingUser] = await pool.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "El correo electrónico ya está registrado"
            });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar nuevo usuario con rol 'normal' por defecto
        const [result] = await pool.query(
            `INSERT INTO usuarios (nombre, email, telefono, area, empresa, password, rol) 
             VALUES (?, ?, ?, ?, ?, ?, 'normal')`,
            [nombre, email, telefono, area, empresa, hashedPassword]
        );

        // Obtener el usuario recién creado (sin la contraseña)
        const [newUser] = await pool.query(
            "SELECT id, nombre, email, telefono, area, empresa, rol FROM usuarios WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente",
            usuario: newUser[0]
        });
    } catch (error) {
        console.error("❌ Error en registro:", error);
        res.status(500).json({
            success: false,
            message: "Error al registrar usuario"
        });
    }
});

// Ruta para obtener tickets
app.get("/tickets", async (req, res) => {
    const userId = req.headers['user-id'];
    console.log("🎫 Obteniendo tickets para usuario:", userId);
    
    try {
        const [user] = await pool.query(
            "SELECT rol FROM usuarios WHERE id = ?",
            [userId]
        );

        if (!user.length) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autorizado"
            });
        }

        // Consulta modificada para obtener nombre y email del creador
        let query = `
            SELECT 
                t.*,
                COALESCE(u.nombre, 'Usuario Eliminado') as creador,
                COALESCE(u.email, 'N/A') as email_creador
            FROM tickets t
            LEFT JOIN usuarios u ON t.usuario_id = u.id
        `;

        if (user[0].rol === 'normal') {
            query += " WHERE t.usuario_id = ?";
        }

        query += " ORDER BY t.fecha_creacion DESC";

        console.log("🔍 Ejecutando consulta:", query);
        const [tickets] = await pool.query(
            query,
            user[0].rol === 'normal' ? [userId] : []
        );

        // Log para depuración
        console.log("✅ Primer ticket de ejemplo:", tickets[0]);
        console.log(`✅ Se encontraron ${tickets.length} tickets`);
        
        res.json(tickets);
    } catch (error) {
        console.error("❌ Error al obtener tickets:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener tickets"
        });
    }
});

// Ruta para obtener detalles de un ticket específico
app.get("/ticket/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    try {
        // Primero verificamos si el usuario tiene acceso al ticket
        const [user] = await pool.query(
            "SELECT rol FROM usuarios WHERE id = ?",
            [userId]
        );

        if (!user.length) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autorizado"
            });
        }

        // Consulta para obtener los detalles del ticket
        let query = `
            SELECT t.*, 
                   u.nombre as creador, 
                   u.email as email_creador
            FROM tickets t
            LEFT JOIN usuarios u ON t.usuario_id = u.id
            WHERE t.id = ?
        `;

        // Si el usuario es normal, verificamos que sea el propietario del ticket
        if (user[0].rol === 'normal') {
            query = `
                SELECT t.*, 
                       u.nombre as creador, 
                       u.email as email_creador
                FROM tickets t
                LEFT JOIN usuarios u ON t.usuario_id = u.id
                WHERE t.id = ? AND (t.usuario_id = ? OR t.usuario_id IS NULL)
            `;
        }

        const [ticket] = await pool.query(
            query,
            user[0].rol === 'normal' ? [id, userId] : [id]
        );

        if (!ticket.length) {
            return res.status(404).json({
                success: false,
                message: "Ticket no encontrado o no tienes permiso para verlo"
            });
        }

        // Obtener comentarios del ticket
        const [comentarios] = await pool.query(
            `SELECT c.*, u.nombre as nombre_usuario, u.email as email_usuario
             FROM comentarios c
             LEFT JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.ticket_id = ?
             ORDER BY c.fecha_creacion DESC`,
            [id]
        );

        // Combinar ticket con sus comentarios
        const ticketConComentarios = {
            ...ticket[0],
            comentarios
        };

        res.json(ticketConComentarios);
    } catch (error) {
        console.error("❌ Error al obtener detalles del ticket:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener detalles del ticket"
        });
    }
});

// Ruta para registrar un nuevo ticket
app.post("/register-ticket", async (req, res) => {
    const { usuario_id, titulo, descripcion } = req.body;

    try {
        // Generar número de ticket
        const [lastTicket] = await pool.query(
            "SELECT MAX(CAST(SUBSTRING(ticket_number, 2) AS UNSIGNED)) as last_number FROM tickets WHERE ticket_number IS NOT NULL"
        );
        const nextNumber = (lastTicket[0].last_number || 0) + 1;
        const ticketNumber = `T${String(nextNumber).padStart(6, '0')}`;

        // Insertar el ticket solo con el número generado
        const [result] = await pool.query(
            "INSERT INTO tickets (usuario_id, titulo, descripcion, estado, ticket_number) VALUES (?, ?, ?, 'Abierto', ?)",
            [usuario_id, titulo, descripcion, ticketNumber]
        );

        res.status(200).json({
            success: true,
            message: "Ticket creado exitosamente",
            ticketId: result.insertId,
            ticketNumber
        });
    } catch (error) {
        console.error("❌ Error al crear ticket:", error);
        res.status(500).json({
            success: false,
            message: "Error al crear el ticket"
        });
    }
});

// Ruta para tickets públicos
app.post("/public-ticket", async (req, res) => {
    const { nombre, email, titulo, descripcion, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const [existingUser] = await pool.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        let userId;

        // Si el usuario no existe, crearlo
        if (existingUser.length === 0) {
            // Encriptar la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Crear el nuevo usuario
            const [newUser] = await pool.query(
                `INSERT INTO usuarios (nombre, email, password, rol, telefono, area, empresa) 
                 VALUES (?, ?, ?, 'normal', '', '', '')`,
                [nombre, email, hashedPassword]
            );
            userId = newUser.insertId;
        } else {
            userId = existingUser[0].id;
        }

        // Generar número de ticket
        const [lastTicket] = await pool.query(
            "SELECT MAX(CAST(SUBSTRING(ticket_number, 2) AS UNSIGNED)) as last_number FROM tickets WHERE ticket_number IS NOT NULL"
        );
        const nextNumber = (lastTicket[0].last_number || 0) + 1;
        const ticketNumber = `T${String(nextNumber).padStart(6, '0')}`;

        // Crear el ticket
        const [result] = await pool.query(
            "INSERT INTO tickets (usuario_id, titulo, descripcion, estado, ticket_number) VALUES (?, ?, ?, 'Abierto', ?)",
            [userId, titulo, descripcion, ticketNumber]
        );

        res.status(201).json({
            success: true,
            message: "Ticket creado exitosamente",
            ticketNumber,
            userCreated: existingUser.length === 0
        });
    } catch (error) {
        console.error("❌ Error al crear ticket público:", error);
        res.status(500).json({
            success: false,
            message: "Error al crear el ticket"
        });
    }
});

// Ruta para actualizar el estado de un ticket
app.put("/update-ticket", async (req, res) => {
    const { id, estado } = req.body;
    const userId = req.headers['user-id'];

    try {
        const [user] = await pool.query(
            "SELECT rol FROM usuarios WHERE id = ?",
            [userId]
        );

        if (!user.length || (user[0].rol !== 'administrador' && user[0].rol !== 'soporte')) {
            return res.status(403).json({
                success: false,
                message: "No tiene permisos para actualizar tickets"
            });
        }

        await pool.query(
            "UPDATE tickets SET estado = ? WHERE id = ?",
            [estado, id]
        );

        res.json({
            success: true,
            message: "Estado del ticket actualizado"
        });
    } catch (error) {
        console.error("❌ Error al actualizar ticket:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar el ticket"
        });
    }
});

// Ruta para obtener datos de un usuario
app.get("/user/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [user] = await pool.query(
            "SELECT id, nombre, email, telefono, area, empresa, rol FROM usuarios WHERE id = ?",
            [id]
        );

        if (!user.length) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        res.json(user[0]);
    } catch (error) {
        console.error("❌ Error al obtener usuario:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener datos del usuario"
        });
    }
});

// Ruta para obtener estadísticas de tickets
app.get("/ticket-stats", async (req, res) => {
    try {
        const query = `
            SELECT 
                estado,
                COUNT(*) as cantidad
            FROM tickets
            GROUP BY estado
            ORDER BY 
                CASE estado
                    WHEN 'Abierto' THEN 1
                    WHEN 'En proceso' THEN 2
                    WHEN 'Resuelto' THEN 3
                    WHEN 'Cerrado' THEN 4
                    ELSE 5
                END
        `;

        const [results] = await pool.query(query);
        console.log("📊 Estadísticas de tickets:", results);
        res.json(results);
    } catch (error) {
        console.error("❌ Error obteniendo estadísticas:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener estadísticas de tickets"
        });
    }
});

// Ruta para actualizar usuario
app.put("/update-user", async (req, res) => {
    const { id, nombre, telefono, empresa, area } = req.body;
    
    try {
        // Verificar si el usuario existe
        const [existingUser] = await pool.query(
            "SELECT id FROM usuarios WHERE id = ?",
            [id]
        );

        if (existingUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // Actualizar usuario
        await pool.query(
            `UPDATE usuarios 
             SET nombre = ?, telefono = ?, empresa = ?, area = ?
             WHERE id = ?`,
            [nombre, telefono, empresa, area, id]
        );

        // Obtener usuario actualizado
        const [updatedUser] = await pool.query(
            "SELECT id, nombre, email, telefono, area, empresa, rol FROM usuarios WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Usuario actualizado exitosamente",
            usuario: updatedUser[0]
        });
    } catch (error) {
        console.error("❌ Error actualizando usuario:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar usuario"
        });
    }
});

// Middleware para verificar rol de administrador
const checkAdminRole = async (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "No autorizado"
        });
    }

    try {
        const [user] = await pool.query(
            "SELECT rol FROM usuarios WHERE id = ?",
            [userId]
        );

        if (!user.length || user[0].rol !== 'administrador') {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado. Se requiere rol de administrador"
            });
        }

        next();
    } catch (error) {
        console.error("❌ Error verificando rol:", error);
        res.status(500).json({
            success: false,
            message: "Error al verificar permisos"
        });
    }
};

// Middleware para verificar rol de soporte o administrador
const checkSupportRole = async (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "No autorizado"
        });
    }

    try {
        const [user] = await pool.query(
            "SELECT rol FROM usuarios WHERE id = ?",
            [userId]
        );

        if (!user.length || (user[0].rol !== 'administrador' && user[0].rol !== 'soporte')) {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado. Se requiere rol de soporte o administrador"
            });
        }

        next();
    } catch (error) {
        console.error("❌ Error verificando rol:", error);
        res.status(500).json({
            success: false,
            message: "Error al verificar permisos"
        });
    }
};

// Ruta para obtener todos los usuarios
app.get("/get-all-users", checkSupportRole, async (req, res) => {
    try {
        const [users] = await pool.query(
            "SELECT id, nombre, email, telefono, area, empresa, rol FROM usuarios"
        );
        
        console.log(`✅ Se encontraron ${users.length} usuarios`);
        res.json(users);
    } catch (error) {
        console.error("❌ Error obteniendo usuarios:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener la lista de usuarios"
        });
    }
});

// Ruta para cambiar el rol de un usuario
app.put("/update-user-role", checkAdminRole, async (req, res) => {
    const { userId, newRole } = req.body;
    
    if (!['administrador', 'soporte', 'normal'].includes(newRole)) {
        return res.status(400).json({
            success: false,
            message: "Rol inválido"
        });
    }

    try {
        await pool.query(
            "UPDATE usuarios SET rol = ? WHERE id = ?",
            [newRole, userId]
        );

        res.json({
            success: true,
            message: "Rol actualizado correctamente"
        });
    } catch (error) {
        console.error("❌ Error actualizando rol:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar rol"
        });
    }
});

// Ruta para eliminar usuario
app.delete("/delete-user/:id", checkAdminRole, async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query(
            "DELETE FROM usuarios WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Usuario eliminado correctamente"
        });
    } catch (error) {
        console.error("❌ Error eliminando usuario:", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar usuario"
        });
    }
});

// Ruta para agregar comentario a un ticket
app.post("/ticket/:id/comentario", async (req, res) => {
    const { id } = req.params;
    const { usuario_id, contenido } = req.body;

    try {
        // Verificar si el ticket existe
        const [ticket] = await pool.query(
            "SELECT id FROM tickets WHERE id = ?",
            [id]
        );

        if (ticket.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket no encontrado"
            });
        }

        // Insertar el comentario
        const [result] = await pool.query(
            "INSERT INTO comentarios (ticket_id, usuario_id, contenido) VALUES (?, ?, ?)",
            [id, usuario_id, contenido]
        );

        // Obtener el comentario recién creado con la información del usuario
        const [comentario] = await pool.query(
            `SELECT c.*, u.nombre as nombre_usuario, u.email as email_usuario
             FROM comentarios c
             LEFT JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Comentario agregado exitosamente",
            comentario: comentario[0]
        });
    } catch (error) {
        console.error("❌ Error al agregar comentario:", error);
        res.status(500).json({
            success: false,
            message: "Error al agregar el comentario"
        });
    }
});

// Manejador de errores 404 para rutas no encontradas
app.use((req, res) => {
    console.log("❌ Ruta no encontrada:", req.path);
    res.status(404).json({
        success: false,
        message: "Ruta no encontrada"
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

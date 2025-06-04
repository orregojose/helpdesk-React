const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: "209.133.211.106",
    user: "trilogit_admin",
    password: "Admin50p0r73*",
    database: "trilogit_helpdesk"
});

// Datos del administrador
const adminData = {
    nombre: 'Administrador',
    email: 'admin@trilogit.com',
    password: 'Admin123*', // Esta contraseña será hasheada
    telefono: '123456789',
    area: 'Sistemas',
    empresa: 'Trilogit',
    rol: 'administrador'
};

// Función para crear el administrador
async function createAdmin() {
    try {
        // Generar hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Consulta SQL para insertar el administrador
        const query = `
            INSERT INTO usuarios (nombre, email, password, telefono, area, empresa, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        // Ejecutar la consulta
        db.query(
            query,
            [adminData.nombre, adminData.email, hashedPassword, adminData.telefono, adminData.area, adminData.empresa, adminData.rol],
            (err, result) => {
                if (err) {
                    console.error('Error al crear el administrador:', err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        console.log('El email del administrador ya existe en la base de datos.');
                    }
                } else {
                    console.log('✅ Administrador creado exitosamente');
                    console.log('Email:', adminData.email);
                    console.log('Contraseña:', adminData.password);
                }
                db.end();
            }
        );
    } catch (error) {
        console.error('Error:', error);
        db.end();
    }
}

// Ejecutar la función
createAdmin(); 
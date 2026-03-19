const pgPool = require('../config/db');
const LogMongo = require('../models/LogMongo');

const obtenerUsuarios = async (req, res) => {
    try {
        const { rows } = await pgPool.query(`
            SELECT u.id_usuario, u.nombre, u.email, u.telefono, r.nombre as rol 
            FROM usuarios u LEFT JOIN  roles r ON u.id_rol = r.id_rol
            ORDER BY u.id_usuario DESC 
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, telefono, id_rol } = req.body;
        const { rows } = await pgPool.query(
            'INSERT INTO usuarios (nombre, email, password, telefono, id_rol) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, nombre, email',
            [nombre, email, password, telefono, id_rol]
        );

        await LogMongo.create({ accion: 'REGISTRAR_USUARIO', detalles: { email } });
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pgPool.query('DELETE FROM usuarios WHERE id_usuario = $1 RETURNING email', [id]);

        if(rows.length > 0) {
            await LogMongo.create({ accion: 'ELIMINAR_USUARIO', detalles: { email: rows[0].email } });
            res.json({ mensaje: 'Usuario eliminado' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, telefono, id_rol } = req.body;
        await pgPool.query(
            'UPDATE usuarios SET nombre = $1, email = $2, telefono = $3, id_rol = $4 WHERE id_usuario = $5',
            [nombre, email, telefono, id_rol, id]
        );
        res.json({ mensaje: 'Usuario actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscamos al usuario y traemos su ROL de una vez haciendo un JOIN
        const { rows } = await pgPool.query(`
            SELECT u.id_usuario, u.nombre, u.email, u.password, r.nombre as rol 
            FROM usuarios u 
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.email = $1
        `, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'El correo no existe' });
        }

        const usuario = rows[0];

        // Verificamos la contraseña (aquí asumo texto plano por ahora,
        // pero lo ideal es usar bcrypt.compare después)
        if (usuario.password !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Si todo está bien, mandamos los datos al Front
        // IMPORTANTE: Aquí va el ROL para que el Front decida qué mostrar
        res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol // Esto dirá 'dueño' o 'empleado'
            }
        });

        // Guardamos el log en MongoDB para saber quién entró
        await LogMongo.create({
            accion: 'LOGIN_EXITOSO',
            detalles: { email, rol: usuario.rol }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerUsuarios, crearUsuario, eliminarUsuario, actualizarUsuario, login };
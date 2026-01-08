const bcrypt = require('bcrypt');
const sqlManager = require('./utils/SqlManager');

const username = 'Oleksandr';
const email = 'oleksandr.kulinich@nure.ua';
const password = 'admin'; // пароль

async function createAdmin() {
    try {
        const hash = await bcrypt.hash(password, 10);
        console.log(`Hash generated: ${hash}`);

        await sqlManager.run('auth_register', {
            username,
            email,
            password_hash: hash
        });

        console.log('Admin user created successfully!');
        process.exit();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

createAdmin();
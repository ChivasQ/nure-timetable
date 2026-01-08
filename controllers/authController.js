const bcrypt = require('bcrypt');
const sqlManager = require('../utils/SqlManager');

const getLoginPage = (req, res) => {
    res.render('login', { error: null });
};

const getRegisterPage = (req, res) => {
    res.render('register', { error: null });
};

const register = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Хешуємо пароль
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await sqlManager.run('auth_register', {
            username,
            email,
            password_hash: hashedPassword
        });

        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Помилка реєстрації (можливо, такий юзер вже є)' });
    }
};

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

const login = async (req, res) => {
    const { username, password } = req.body;
    // console.log(`Login attempt for user: ${username}`); muhehe
    // console.log(`Login attempt password: ${password}`); muhehehe
    
    try {
        const users = await sqlManager.run('auth_find_user', { email: username });
        const user = users[0];

        if (!user) {
            return res.render('login', { error: 'Користувача не знайдено' });
        }

        // Перевіряємо пароль
        const match = await bcrypt.compare(password, user.password_hash);
        
        if (match) {
            // Зберігаємо юзера в сесію
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email
            };
            return res.redirect('/admin'); // Перенаправляємо в адмінку
        } else {
            return res.render('login', { error: 'Невірний пароль' });
        }
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Помилка сервера' });
    }
};

const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

module.exports = { getLoginPage, getRegisterPage, register, login, logout };
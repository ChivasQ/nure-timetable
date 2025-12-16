const express = require('express');
const bodyParser = require('body-parser');
const sqlManager = require('./utils/SqlManager');
let process = require('process');

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// 1. Сторінка довідників
app.get('/admin/dictionaries', async (req, res) => {
    try {
        const [teachers, subjects, classrooms, groups] = await Promise.all([
            sqlManager.run('get_teachers'),   // SELECT * FROM teachers ORDER BY full_name
            sqlManager.run('get_subjects'),   // SELECT * FROM subjects ORDER BY full_name
            sqlManager.run('get_classrooms'), // SELECT * FROM classrooms ORDER BY room_number
            sqlManager.run('get_groups')      // SELECT * FROM studentgroups ORDER BY name
        ]);

        res.render('dictionaries', { teachers, subjects, classrooms, groups });
    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка завантаження довідників');
    }
});

// --- ДОПОМІЖНА ФУНКЦІЯ (Додайте це десь зверху файлу або перед роутами) ---
function generateShortName(fullName) {
    if (!fullName) return '';
    // Розбиваємо "Мазурова Оксана Олексіївна" на масив слів
    const parts = fullName.trim().split(/\s+/);
    
    if (parts.length >= 3) {
        // Якщо є Прізвище Ім'я По-батькові -> "Прізвище І. П."
        return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`;
    } else if (parts.length === 2) {
        // Якщо тільки Прізвище Ім'я -> "Прізвище І."
        return `${parts[0]} ${parts[1][0]}.`;
    } else {
        // Якщо одне слово -> залишаємо як є
        return fullName;
    }
}

app.post('/admin/dictionaries/add/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const b = req.body;

        if (type === 'teacher') {
            const shortName = generateShortName(b.full_name);
            
            await sqlManager.run('add_teacher', { 
                full_name: b.full_name, 
                short_name: shortName 
            });
        }
        
        if (type === 'subject') {
            await sqlManager.run('add_subject', { 
                full_name: b.full_name, 
                short_name: b.short_name 
            });
        }

        if (type === 'classroom') {
            await sqlManager.run('add_classroom', { 
                room_number: b.room_number, 
                building: b.building, 
                capacity: b.capacity 
            });
        }

        if (type === 'group') {
            await sqlManager.run('add_group', { 
                name: b.name, 
                student_count: b.student_count, 
                course_year: b.course_year || 1 
            });
        }

        res.redirect('/admin/dictionaries');
    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка додавання');
    }
});

app.post('/admin/dictionaries/edit/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const b = req.body;

        if (type === 'teacher') {
            const shortName = generateShortName(b.full_name);
            await sqlManager.run('update_teacher', { 
                full_name: b.full_name, 
                short_name: shortName, 
                id: b.id 
            });
        }

        if (type === 'subject') {
            await sqlManager.run('update_subject', { 
                full_name: b.full_name, 
                short_name: b.short_name, 
                id: b.id 
            });
        }

        if (type === 'classroom') {
            await sqlManager.run('update_classroom', { 
                room_number: b.room_number, 
                building: b.building, 
                capacity: b.capacity, 
                id: b.id 
            });
        }

        if (type === 'group') {
            await sqlManager.run('update_group', { 
                name: b.name, 
                student_count: b.student_count, 
                id: b.id 
            });
        }

        res.redirect('/admin/dictionaries');
    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка редагування');
    }
});

app.post('/admin/dictionaries/delete/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        
        if (type === 'teacher') await sqlManager.run('delete_teacher', { id: id });
        if (type === 'subject') await sqlManager.run('delete_subject', { id: id });
        if (type === 'classroom') await sqlManager.run('delete_classroom', { id: id });
        if (type === 'group') await sqlManager.run('delete_group', { id: id });

        res.redirect('/admin/dictionaries');
    } catch (err) {
        console.error(err);
        res.send(`<script>alert('Неможливо видалити: цей запис використовується у розкладі!'); window.location.href='/admin/dictionaries';</script>`);
    }
});

app.listen(port, () => {
    console.log(`\x1b[32m[INFO]\x1b[0m\tServer runs at http://localhost:${port}`);
});



// process.once('SIGINT', function () {
//   console.log('Reloading...');
//    sqlManager.load();
// }); 

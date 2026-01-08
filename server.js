const express = require('express');
const bodyParser = require('body-parser');
const sqlManager = require('./utils/SqlManager');
let process = require('process');
const session = require('express-session');
const isAuthenticated = require('./middleware/authMiddleware');


const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: '2C76t5ZP4bhZ2KBXBX7QR3ghD7QNTuFV7gjmJNdRbkwbFG7ZXfYFGNtJMBqWk7cgG6MrM9TYFWvUgNCNjKUFYuTQnrCc2VatVUJSUvsCaxAdk55vjRp3XAj3JvxC5R8ZyEz7Z6rRqhNceeqfQT5uKQa7j95c29ma',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Сесія живе 24 години
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);
const adminRoutes = require('./routes/admin');
app.use('/admin', isAuthenticated, adminRoutes);
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);


app.get('/admin/dictionaries', async (req, res) => {
    try {
        const { 
            teacher_search,
            room_min, room_max,
            room_building,
            group_sort
        } = req.query;

        // Пошук для ВЧИТЕЛІВ
        let teachers;
        if (teacher_search) { 
            teachers = await sqlManager.run('search_teachers', { search_query: teacher_search });
        } else {
            teachers = await sqlManager.run('get_teachers');
        }

        // фільтрація для АУДИТОРІЙ
        const minCap = room_min ? parseInt(room_min) : 0;
        const maxCap = room_max ? parseInt(room_max) : 9999;
        const buildFilter = room_building || '';
        
        const classrooms = await sqlManager.run('filter_classrooms', {
            min_cap: minCap,
            max_cap: maxCap,
            building: buildFilter
        });
        
        const allRooms = await sqlManager.run('get_classrooms');
        const buildings = [...new Set(allRooms.map(r => r.building))]; 


        // сортування для ГРУП
        let groups = await sqlManager.run('get_groups');
        
        if (group_sort === 'name_asc') {
            groups.sort((a, b) => a.name.localeCompare(b.name));
        } else if (group_sort === 'name_desc') {
            groups.sort((a, b) => b.name.localeCompare(a.name));
        } else if (group_sort === 'students_desc') {
            groups.sort((a, b) => b.student_count - a.student_count);
        }

        const subjects = await sqlManager.run('get_subjects');

        res.render('dictionaries', { 
            teachers, 
            subjects, 
            classrooms, 
            groups, 
            buildings,
            query: req.query
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка завантаження довідників: ' + err.message);
    }
});


function generateShortName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    
    if (parts.length >= 3) {
        return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`;
    } else if (parts.length === 2) {
        return `${parts[0]} ${parts[1][0]}.`;
    } else {
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
        res.send(`<script>
                    alert('Неможливо видалити: цей запис використовується у розкладі!'); 
                    window.location.href='/admin/dictionaries';
                  </script>`);
    }
});

app.listen(port, () => {
    console.log(`\x1b[32m[INFO]\x1b[0m\tServer runs at http://localhost:${port}`);
});



// process.once('SIGINT', function () {
//   console.log('Reloading...');
//    sqlManager.load();
// }); 

let addModal;

document.addEventListener('DOMContentLoaded', function() {
    addModal = new bootstrap.Modal(document.getElementById('addLessonModal'));
});

function openAddModal(date, slotId) {
document.getElementById('addLessonForm').reset(); // Очистити форму
    document.getElementById('inputId').value = ''; // ID пустий = це додавання
    document.getElementById('modalTitle').innerText = 'Додати пару';
    
    document.getElementById('inputDate').value = date;
    document.getElementById('inputSlotId').value = slotId;
    
    // Скидаємо виділення груп
    const select = document.querySelector('select[name="groups"]');
    Array.from(select.options).forEach(opt => opt.selected = false);
    
    lessonModal.show();
}

async function openEditModal(id) {
    try {
        // Запитуємо дані з сервера
        const res = await fetch(`/admin/lesson/${id}`);
        const data = await res.json();
        
        if (!data.success) {
            alert('Помилка завантаження даних');
            return;
        }

        const { lesson, groupIds } = data;

        // Заповнюємо форму
        document.getElementById('inputId').value = lesson.id;
        document.getElementById('modalTitle').innerText = 'Редагувати пару';
        
        // Встановлюємо значення селектів
        document.querySelector('select[name="subject_id"]').value = lesson.subject_id;
        document.querySelector('select[name="teacher_id"]').value = lesson.teacher_id;
        document.querySelector('select[name="classroom_id"]').value = lesson.classroom_id;
        document.querySelector('select[name="lesson_type_id"]').value = lesson.lesson_type_id;
        
        // Зберігаємо дату і слот (вони приховані, але потрібні для сабміту)
        document.getElementById('inputDate').value = lesson.schedule_date.split('T')[0]; // Форматуємо дату
        document.getElementById('inputSlotId').value = lesson.time_slot_id;

        // Виділяємо групи у списку
        const groupSelect = document.querySelector('select[name="groups"]');
        Array.from(groupSelect.options).forEach(option => {
            // Перевіряємо, чи є ID опції у списку groupIds, що прийшов з сервера
            option.selected = groupIds.includes(parseInt(option.value));
        });

        lessonModal.show();
    } catch (err) {
        console.error(err);
        alert('Помилка з\'єднання');
    }
}

async function submitAddLesson() {
    const form = document.getElementById('addLessonForm');

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const selectGroups = form.querySelector('select[name="groups"]');
    const selectedGroupIds = Array.from(selectGroups.selectedOptions).map(option => option.value);

    if (selectedGroupIds.length === 0) {
        alert('Будь ласка, виберіть хоча б одну групу');
        return;
    }

    data.groups = selectedGroupIds;

    const url = data.id ? '/admin/edit' : '/admin/add';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success) {
            location.reload(); 
        } else {
            alert('Помилка: ' + result.message);
        }
    } catch (err) {
        console.error(err);
        alert('Помилка сервера');
    }
}

async function deleteLesson(id) {
    if(!confirm('Видалити цю пару?')) return;

    try {
        const res = await fetch('/admin/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });

        const result = await res.json();
        if (result.success) {
            location.reload();
        } else {
            alert('Помилка видалення: ' + result.message);
        }
    } catch (err) {
        console.error(err);
        alert('Помилка');
    }
}
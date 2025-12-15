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
    
    addModal.show();
}

async function openEditModal(id) {
    try {
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

        addModal.show();
    } catch (err) {
        console.error(err);
        alert('Помилка з\'єднання');
    }
}

async function loadFreeRooms() {
    const date = document.getElementById('inputDate').value;
    const slotId = document.getElementById('inputSlotId').value;
    const capacity = document.getElementById('filterCapacity').value || 0;
    const select = document.getElementById('classroomSelect');
    const statusText = document.getElementById('roomStatusText');
    const btn = document.querySelector('button[onclick="loadFreeRooms()"]');

    // Валідація
    if (!date || !slotId) {
        alert('Помилка: Немає дати або часу');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Шукаю...';
    select.disabled = true;

    try {
        // Робимо запит до нашого нового API
        const res = await fetch(`/api/free-classrooms?date=${date}&slot_id=${slotId}&capacity=${capacity}`);
        const result = await res.json();

        if (result.success) {
            // Очищаємо поточний список
            select.innerHTML = '';

            if (result.rooms.length > 0) {
                // Додаємо знайдені вільні аудиторії
                result.rooms.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.id;
                    option.text = `🚪 ${room.room_number} (${room.building}) — ${room.capacity} місць`;
                    select.appendChild(option);
                });
                
                statusText.className = "form-text text-success";
                statusText.innerText = `✅ Знайдено ${result.rooms.length} вільних аудиторій.`;
            } else {
                // Якщо нічого не знайшли
                const option = document.createElement('option');
                option.text = "Немає вільних аудиторій з такими параметрами";
                select.appendChild(option);
                statusText.className = "form-text text-danger";
                statusText.innerText = "Нічого не знайдено.";
            }
        } else {
            alert('Помилка сервера: ' + result.message);
        }
    } catch (err) {
        console.error(err);
        alert('Не вдалося завантажити список');
    } finally {
        // Повертаємо інтерфейс до життя
        btn.disabled = false;
        btn.innerHTML = '🔄 Знайти вільні';
        select.disabled = false;
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

function updateStudentCountInfo() {
    const select = document.getElementById('groupSelect');
    const badge = document.getElementById('totalStudentsBadge');
    
    let total = 0;
    Array.from(select.selectedOptions).forEach(option => {
        total += parseInt(option.getAttribute('data-students') || 0);
    });

    badge.innerText = total;
    return total;
}

async function checkRoomAvailability() {
    const date = document.getElementById('inputDate').value;
    const slotId = document.getElementById('inputSlotId').value;
    const select = document.getElementById('classroomSelect');
    const btn = document.querySelector('button[onclick="checkRoomAvailability()"]');
    
    if (!date || !slotId) {
        alert('Помилка: Немає дати або часу');
        return;
    }

    const requiredSeats = updateStudentCountInfo();

    btn.disabled = true;
    btn.innerHTML = '⏳ Перевірка...';

    try {
        const res = await fetch(`/api/check-rooms?date=${date}&slot_id=${slotId}`);
        const result = await res.json();

        if (result.success) {
            // Зберігаємо поточний вибір, щоб не злетів
            const currentVal = select.value;
            select.innerHTML = '';

            result.rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                
                let icon = '';
                let statusText = '';
                let colorClass = '';

                const capacity = room.capacity;
                const isUnlimited = capacity === -1;
                
                
                // Якщо зайнято
                if (room.is_occupied) {
                    icon = '🔴';
                    statusText = '(ЗАЙНЯТО)';
                    option.style.color = 'red'; // Червоний текст
                    option.disabled = true; // Забороняємо вибір (або можна залишити enabled)
                } 
                // Якщо вільно, але мало місць
                else if (!isUnlimited && capacity < requiredSeats) {
                    icon = '🟠'; // Помаранчевий
                    statusText = `(Замала: ${capacity}/${requiredSeats})`;
                    option.style.color = '#d35400';
                } 
                // Все супер
                else {
                    icon = '🟢';
                    statusText = isUnlimited ? '(∞ місць)' : `(${capacity} місць)`;
                    option.style.color = 'green';
                    option.style.fontWeight = 'bold';
                }

                option.text = `${icon} ${room.room_number} ${statusText}`;
                select.appendChild(option);
            });

            if (currentVal) select.value = currentVal;

        } else {
            alert('Помилка сервера: ' + result.message);
        }
    } catch (err) {
        console.error(err);
        alert('Помилка з\'єднання');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '🔄 Перевірити доступність';
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
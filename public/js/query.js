let addModal;

document.addEventListener('DOMContentLoaded', function() {
    addModal = new bootstrap.Modal(document.getElementById('addLessonModal'));
});

function openAddModal(date, slotId) {
    document.getElementById('inputDate').value = date;
    document.getElementById('inputSlotId').value = slotId;
    addModal.show();
}

async function submitAddLesson() {
    const form = document.getElementById('addLessonForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const res = await fetch('/admin/add', {
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
        alert('Помилка');
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
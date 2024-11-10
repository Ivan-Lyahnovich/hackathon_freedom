// Находим элементы фильтра и кнопки
const filter = document.querySelector('.filter');
const filterToggleBtn = document.querySelector('.filter-toggle-btn');

// Добавляем обработчик события для кнопки
filterToggleBtn.addEventListener('click', function () {
    // Переключаем фильтр между скрытым и видимым
    if (filter.style.left === '0px') {
        filter.style.left = '-100%'; // Скрываем фильтр
    } else {
        filter.style.left = '0px'; // Показываем фильтр
    }
});

// Убедимся, что фильтр скрыт по умолчанию на маленьких экранах
window.addEventListener('resize', function () {
    if (window.innerWidth < 753) {
        filter.style.left = '-100%'; // Скрываем фильтр
    } else {
        filter.style.left = ''; // Сбрасываем стиль при увеличении экрана
    }
});

// Изначально скрываем фильтр при загрузке страницы, если ширина экрана меньше 753px
if (window.innerWidth < 753) {
    filter.style.left = '-100%';
}



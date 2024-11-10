document.addEventListener("DOMContentLoaded", function() {
    // Кнопка сброса фильтров
    const resetFiltersBtn = document.querySelector('.reset-filters-btn');

// Обработчик для кнопки сброса фильтров
    resetFiltersBtn.addEventListener('click', function() {
        // Сбрасываем все фильтры в их начальные значения
        activeFilters = {
            "Возраст": [],
            "Стаж": [],
            "Местоположение": [],
            "Навыки": ""
        };

        // Пытаемся сбросить значения всех фильтров на странице
        const ageFilter = document.querySelector('.age-filter'); // Если есть элемент для фильтрации по возрасту
        const experienceFilter = document.querySelector('.experience-filter'); // Если есть элемент для фильтрации по стажу
        const locationFilter = document.querySelector('.location-filter'); // Если есть элемент для фильтрации по местоположению
        const skillsFilter = document.querySelector('.skills-filter'); // Если есть элемент для фильтрации по навыкам

        // Проверяем существование каждого элемента перед сбросом значения
        if (ageFilter) {
            ageFilter.value = '';
        }
        if (experienceFilter) {
            experienceFilter.value = '';
        }
        if (locationFilter) {
            locationFilter.value = '';
        }
        if (skillsFilter) {
            skillsFilter.value = '';
        }

        // Перерисовываем вакансии с учетом сброшенных фильтров
        displayJobs();
    });

})
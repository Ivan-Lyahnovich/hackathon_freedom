document.addEventListener("DOMContentLoaded", function() {
    const filterButtonsContainer = document.getElementById("filter-buttons");
    const jobListContainer = document.getElementById("job-list");
    const resultCountContainer = document.getElementById("result-count");
    const searchInput = document.querySelector(".search-input");
    const sortingSelect = document.querySelector(".sorting-select");

    let jobs = [];
    let activeFilters = {
        "Возраст": [],
        "Стаж": [],
        "Местоположение": [],
        "Навыки": ""
    };

    const filters = {
        "Возраст": ["20-30 лет", "31-40 лет", "41-50 лет", "50+"],
        "Стаж": ["0-1 год", "2-5 лет", "6+ лет"],
        "Местоположение": ["Астана", "Алматы", "Караганда", "Павлодар", "Прочие"]
    };

    fetch('data/jobs.json')
        .then(response => response.json())
        .then(data => {
            // Преобразуем объект JSON в массив
            jobs = Object.values(data);
            createFilterButtons();
            updateFilterCounts();
            displayJobs();
        })
        .catch(error => console.error("Ошибка загрузки данных:", error));


    sortingSelect.addEventListener("change", displayJobs);

    function createFilterButtons() {
        for (let category in filters) {
            const filterCategory = filters[category];
            const categoryDiv = document.createElement("div");
            categoryDiv.classList.add("filter-category");

            const categoryTitle = document.createElement("h4");
            categoryTitle.textContent = category;
            categoryDiv.appendChild(categoryTitle);

            filterCategory.forEach(value => {
                const button = document.createElement("button");
                button.classList.add("filter-button");
                button.dataset.category = category;
                button.dataset.value = value;
                button.addEventListener("click", () => toggleFilter(category, value, button));
                categoryDiv.appendChild(button);
            });

            filterButtonsContainer.appendChild(categoryDiv);
        }
    }

    function displayJobs() {
        jobListContainer.innerHTML = "";
        let filteredJobs = jobs.filter(job => {
            return (
                (activeFilters["Возраст"].length === 0 || activeFilters["Возраст"].includes(getAgeGroup(job.age))) &&
                (activeFilters["Стаж"].length === 0 || isExperienceFiltered(job.experience)) &&
                (activeFilters["Местоположение"].length === 0 || isLocationFiltered(job.location)) &&
                (activeFilters["Навыки"] === "" || job.hardSkills.some(skill => skill.toLowerCase().includes(activeFilters["Навыки"].toLowerCase())))
            );
        });

        const sortOrder = sortingSelect.value;
        filteredJobs.sort((a, b) => {
            const salaryA = parseSalary(a.salary);
            const salaryB = parseSalary(b.salary);
            return sortOrder === "less" ? salaryA - salaryB : salaryB - salaryA;
        });

        resultCountContainer.textContent = `${filteredJobs.length}`;

        filteredJobs.forEach(job => {
            const jobCard = document.createElement("div");
            jobCard.classList.add("job-card");

            const infoColumn = document.createElement("div");
            infoColumn.classList.add("info-column");

            let jobContent = `
        <p><strong class="job_title"> ${job.specialization}</strong></p>
        <h3>${job.name}</h3>
        <p>${job.age} лет <strong> ${job.salary} тг.</strong></p> 
        <p>Город:<strong> ${job.location}</strong></p>
        <p>Текущая должность:<strong> ${job.currentPosition}</strong></p>
        `;

            // Добавляем только дополнительные строки, если экран меньше 752px
            if (window.innerWidth <= 752) {
                jobContent += `
            <div class="additional-info">
                <p class="previous-positions">Предыдущие должности: <strong>${job.previousPositions.join(", ")}</strong></p>
                <p class="education">Образование: <strong>${job.education}</strong></p>
            </div>
            <button class="toggle-info-btn">Читать далее</button>
            `;
            } else {
                // Если экран больше 752px, показываем все данные сразу
                jobContent += `
            <p>Предыдущие должности: <strong>${job.previousPositions.join(", ")}</strong></p>
            <p>Образование: <strong>${job.education}</strong></p>
            `;
            }

            infoColumn.innerHTML = jobContent;

            const skillsColumn = document.createElement("div");
            skillsColumn.classList.add("skills-column");
            skillsColumn.innerHTML = `
        <p><strong>Ключевые навыки: <br> </strong> ${job.hardSkills.join(", ")}</p>
        `;

            const buttonsContainer = document.createElement("div");
            buttonsContainer.classList.add("card_buttons_container");

            const saveButton = document.createElement("a");
            saveButton.classList.add("save-button");
            saveButton.href = `rezume/${job.name.replace(/ /g, '_')}.pdf`;
            saveButton.download = "";
            saveButton.textContent = "Скачать резюме";

            // Создаем кнопку WhatsApp, если номер телефона есть
            const phoneButton = document.createElement("a");
            phoneButton.classList.add("phone-button");

            // Проверка, есть ли номер телефона и добавление ссылки
            if (job.phone && job.phone !== "Не указано") {
                phoneButton.href = `https://wa.me/${job.phone}`;
                phoneButton.textContent = "WhatsApp";
                phoneButton.classList.remove("disabled");
            } else {
                phoneButton.textContent = "";
                phoneButton.classList.add("disabled");
                phoneButton.style.display = "none"; // Скрываем кнопку
            }

            buttonsContainer.appendChild(saveButton);
            buttonsContainer.appendChild(phoneButton);
            skillsColumn.appendChild(buttonsContainer);

            jobCard.appendChild(infoColumn);
            jobCard.appendChild(skillsColumn);
            jobListContainer.appendChild(jobCard);

            // Добавляем обработчик на кнопку "Читать далее", если она есть
            if (window.innerWidth <= 752) {
                const toggleButton = jobCard.querySelector('.toggle-info-btn');
                const additionalInfo = jobCard.querySelector('.additional-info');
                toggleButton.addEventListener('click', () => {
                    additionalInfo.classList.toggle('visible');
                    toggleButton.textContent = additionalInfo.classList.contains('visible') ? 'Скрыть' : 'Читать далее';
                });
            }
        });
    }


// Также обновим при изменении размера окна
    window.addEventListener('resize', displayJobs);






    function parseSalary(salaryRange) {
        const salaries = salaryRange.match(/\d+/g).map(Number);
        return Math.max(...salaries); // Возвращаем максимальное значение в диапазоне
    }


    function updateFilterCounts() {
        const counts = {
            "Возраст": { "20-30 лет": 0, "31-40 лет": 0, "41-50 лет": 0, "50+": 0 },
            "Стаж": { "0-1 год": 0, "2-5 лет": 0, "6+ лет": 0 },
            "Местоположение": { "Астана": 0, "Алматы": 0, "Караганда": 0, "Павлодар": 0, "Прочие": 0 }
        };

        jobs.forEach(job => {
            const ageGroup = getAgeGroup(job.age);
            if (counts["Возраст"][ageGroup] !== undefined) counts["Возраст"][ageGroup]++;
            if (counts["Стаж"]["0-1 год"] !== undefined && job.experience <= 1) counts["Стаж"]["0-1 год"]++;
            if (counts["Стаж"]["2-5 лет"] !== undefined && job.experience >= 2 && job.experience <= 5) counts["Стаж"]["2-5 лет"]++;
            if (counts["Стаж"]["6+ лет"] !== undefined && job.experience >= 6) counts["Стаж"]["6+ лет"]++;
            if (counts["Местоположение"][job.location] !== undefined) counts["Местоположение"][job.location]++;
            else counts["Местоположение"]["Прочие"]++;
        });

        document.querySelectorAll(".filter-button").forEach(button => {
            const category = button.dataset.category;
            const value = button.dataset.value;

            // Создаем новый контейнер для кнопки
            const filterContainer = document.createElement("div");
            filterContainer.classList.add("filter-container");

            // Создаем элемент для категории
            const categoryElement = document.createElement("span");
            categoryElement.classList.add("category");
            categoryElement.textContent = value;

            // Создаем элемент для количества
            const countElement = document.createElement("span");
            countElement.classList.add("count");
            countElement.textContent = `${counts[category][value] || 0}`;

            // Добавляем элементы в контейнер
            filterContainer.appendChild(categoryElement);
            filterContainer.appendChild(countElement);

            // Заменяем старую кнопку на новый контейнер
            button.innerHTML = '';  // Очищаем текущий элемент
            button.appendChild(filterContainer);
        });
    }

    function getAgeGroup(age) {
        if (age >= 20 && age <= 30) return "20-30 лет";
        if (age >= 31 && age <= 40) return "31-40 лет";
        if (age >= 41 && age <= 50) return "41-50 лет";
        return "50+";
    }

    function isExperienceFiltered(experience) {
        if (activeFilters["Стаж"].length === 0) return true;
        if (activeFilters["Стаж"].includes("0-1 год") && experience <= 1) return true;
        if (activeFilters["Стаж"].includes("2-5 лет") && experience >= 2 && experience <= 5) return true;
        if (activeFilters["Стаж"].includes("6+ лет") && experience >= 6) return true;
        return false;
    }

    function isLocationFiltered(location) {
        if (activeFilters["Местоположение"].includes("Прочие")) {
            return !["Астана", "Алматы", "Караганда", "Павлодар"].includes(location);
        }
        return activeFilters["Местоположение"].length === 0 || activeFilters["Местоположение"].includes(location);
    }

    function toggleFilter(category, value, button) {
        const index = activeFilters[category].indexOf(value);
        if (index === -1) {
            activeFilters[category].push(value);
            button.classList.add("active");
        } else {
            activeFilters[category].splice(index, 1);
            button.classList.remove("active");
        }
        displayJobs();
    }

    searchInput.addEventListener("input", function() {
        activeFilters["Навыки"] = searchInput.value;
        displayJobs();
    });


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
            ageFilter.classList.remove('active');  // Убираем активное состояние
        }
        if (experienceFilter) {
            experienceFilter.value = '';
            experienceFilter.classList.remove('active');
        }
        if (locationFilter) {
            locationFilter.value = '';
            locationFilter.classList.remove('active');
        }
        if (skillsFilter) {
            skillsFilter.value = '';
            skillsFilter.classList.remove('active');
        }

        // Добавляем класс "inactive" или "disabled" на кнопки, если они не активны
        const filterButtons = document.querySelectorAll('.filter-button'); // Если кнопки фильтров имеют класс 'filter-button'
        filterButtons.forEach(button => {
            button.classList.remove('active');
            button.classList.add('inactive'); // Или используйте класс, который делает кнопку неактивной
        });

        // Перерисовываем вакансии с учетом сброшенных фильтров
        displayJobs();
    });



});

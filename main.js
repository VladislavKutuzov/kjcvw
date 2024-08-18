var sheetID = "1cTcTpfSATgJzzvVfw3JSSQkkfjoh4Ja6oyqgbknUeq0"; // ID вашей таблицы
var sheetGID = "0"; // ID листа, по умолчанию это первый лист

// Определение функции parseDate
function parseDate(dateString) {
    var date = new Date(dateString);

    if (isNaN(date.getTime())) {
        var parts = dateString.split('/');
        if (parts.length === 3) {
            date = new Date(parts[2], parts[0] - 1, parts[1]);
        } else {
            date = new Date();
        }
    }

    return date;
}

function loadTasks(query, typeFilter = "") {
    googleQuery(sheetID, sheetGID, 'A:L', query, typeFilter);
}

function googleQuery(sheet_id, sheet, range, query, typeFilter) {
    google.charts.load('current', { 'packages': ['table'] });
    google.charts.setOnLoadCallback(function() {
        queryTable(typeFilter);
    });

    function queryTable(typeFilter) {
        var opts = { sendMethod: 'auto' };
        var gquery = new google.visualization.Query(`https://docs.google.com/spreadsheets/d/${sheet_id}/gviz/tq?gid=${sheet}&range=${range}&headers=1&tq=${query}`, opts);
        gquery.send(function(e) {
            callback(e, typeFilter);
        });
    }

    function callback(e, typeFilter) {
        if (e.isError()) {
            console.log('Error in query: ' + e.getMessage() + ' ' + e.getDetailedMessage());
            return;
        }
        var data = e.getDataTable();
        generateHTML(data, typeFilter); // Генерация HTML на основе данных
    }
}

function generateHTML(data, typeFilter) {
    var container = document.querySelector('#network-tools');
    container.innerHTML = ''; // Очищаем контейнер перед добавлением новых данных

    var toolCards = []; // Массив для хранения объектов с данными инструментов

    var today = new Date(); // Текущая дата

    // Сначала извлекаем все данные из таблицы
    for (var i = 0; i < data.getNumberOfRows(); i++) {
        var publishDateStr = data.getValue(i, 0); // Дата публикации
        var brand = data.getValue(i, 1); // Бренд
        var title = data.getValue(i, 2); // Название продукта
        var type = data.getValue(i, 3); // Тип продукта
        var description = data.getValue(i, 4); // Описание продукта
        var price = data.getValue(i, 5); // Цена
        var oldPrice = data.getValue(i, 6); // Старая цена
        var quantity = data.getValue(i, 7); // Количество
        var features = data.getValue(i, 8); // Характеристики
        var featuresTwo = data.getValue(i, 9); // Характеристики
        var image1 = data.getValue(i, 10); // Изображение 1
        var image2 = data.getValue(i, 11); // Изображение 2

        var publishDate = parseDate(publishDateStr); // Преобразование строки в объект Date

        // Проверка на соответствие фильтру по типу
        if (typeFilter && type !== typeFilter) {
            continue; // Пропускаем, если тип не совпадает с фильтром
        }

        // Проверка, если с момента публикации прошло больше недели
        var isNew = (today - publishDate) <= 14 * 24 * 60 * 60 * 1000; // 14 дней в миллисекундах

        // Собираем все данные в объект
        var toolData = {
            publishDate: publishDate,
            isNew: isNew,
            brand: brand,
            title: title,
            description: description,
            price: price,
            oldPrice: oldPrice,
            quantity: quantity,
            features: features,
            featuresTwo: featuresTwo,
            image1: image1,
            image2: image2,
            brandClass: (brand === 'Makita') ? 'MAKITA' : (brand === 'Bosch') ? 'BOSCH' : brand,
            priceClass: oldPrice ? '' : 'no--OldPrice'
        };

        toolCards.push(toolData); // Добавляем объект с данными в массив
    }

    // Сортируем массив по дате публикации (от новой к старой)
    toolCards.sort(function(a, b) {
        return b.publishDate - a.publishDate;
    });

    // Генерация HTML на основе отсортированных данных
    toolCards.forEach(function(tool) {
        var toolCardHTML = `
            <div class="tool-card">
                ${tool.isNew ? '<div class="new">NEW</div>' : ''}

                <div class="slider">
                    <div class="slides">
                        <div class="slide"><img src="${tool.image1}" alt="${tool.title}"></div>
                        <div class="slide"><img src="${tool.image2}" alt="${tool.title}"></div>
                    </div>
                    <div class="slider-controls">
                        <span class="prev">&#10094;</span>
                        <span class="next">&#10095;</span>
                    </div>
                    <div class="slider-dots"></div>
                </div>

                <p class="brand ${tool.brandClass}">${tool.brandClass}</p>
                <p class="title">${tool.title}</p>
                <p class="description">${tool.description}</p>

                <p class="features">Характеристики:</p>
                <p class="featuresInfo">Мощность - ${tool.features} В </br> Скорость вращения - ${tool.featuresTwo} об/мин</p>
                <div class="prices">
                    <div>
                        <p class="price">${tool.price} ₽</p>
                        <p class="priceInfo">за 1 шт</p>
                    </div>
                    <p class="oldprice ${tool.priceClass}">${tool.oldPrice ? tool.oldPrice + ' ₽' : ''}</p>
                </div>

                <div class="tool-info">
                    <p class="quantity">Доступно: ${tool.quantity} шт.</p>
                    <button class="btn-telephone"><img src="images/telephone.png" alt="Позвонить">Позвонить</button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', toolCardHTML);
    });

    // Инициализируем слайдеры после добавления карток в DOM
    initializeSliders();
}

function initializeSliders() {
    const sliders = document.querySelectorAll('.slider');

    sliders.forEach(function(slider) {
        const slides = slider.querySelector('.slides');
        const dots = slider.querySelector('.slider-dots');
        const slideCount = slider.querySelectorAll('.slide').length;
        let currentIndex = 0;

        // Создание точек
        for (let i = 0; i < slideCount; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dots.appendChild(dot);
        }

        const allDots = slider.querySelectorAll('.dot');

        function updateSlider(index) {
            slides.style.transform = `translateX(-${index * 100}%)`;
            allDots.forEach(dot => dot.classList.remove('active'));
            allDots[index].classList.add('active');
        }

        slider.querySelector('.next').addEventListener('click', function() {
            currentIndex = (currentIndex + 1) % slideCount;
            updateSlider(currentIndex);
        });

        slider.querySelector('.prev').addEventListener('click', function() {
            currentIndex = (currentIndex - 1 + slideCount) % slideCount;
            updateSlider(currentIndex);
        });

        allDots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                updateSlider(index);
                currentIndex = index;
            });
        });
    });
}

$(document).ready(function () {
    // Обработчики для категорий
    $('.menu__inner-menu a').on('click', function (e) {
        let toolsTitle = document.getElementById('toolsTitle');
        e.preventDefault();
        const typeFilter = $(this).text();
        toolsTitle.innerHTML = " > " + typeFilter;

        if (typeFilter == "Акции") {
            loadTasks("SELECT * WHERE G IS NOT NULL", '');
        }else {
            loadTasks("SELECT *", typeFilter);
        }
    });

    $('.titlee a').on('click', function (e) {
        let toolsTitle = document.getElementById('toolsTitle');
        loadTasks("SELECT *", "");
        toolsTitle.innerHTML = "";

    });

    // По умолчанию загружаем все сетевые инструменты
    loadTasks("SELECT *", "");
});

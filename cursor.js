document.addEventListener('DOMContentLoaded', function () {
    const catalogToggle = document.getElementById('catalog-toggle');
    const catalogMenu = document.getElementById('catalog-menu');
    if (window.innerWidth >= 769) {
        // Для больших экранов
        if (catalogMenu.classList.contains('show')) {
            catalogMenu.classList.remove('show');
            setTimeout(() => {
                catalogMenu.style.display = 'none'; // Скрываем меню после завершения анимации
            }, 500); // Длительность анимации
        } else {
            catalogMenu.style.display = 'flex'; // Отображаем меню перед началом анимации
            setTimeout(() => {
                catalogMenu.classList.add('show');
            }, 10); // Небольшая задержка для применения класса
        }
    } else {
        // Для мобильных устройств
        catalogMenu.style.display = 'none';
    }


    function toggleMenu() {
        if (window.innerWidth >= 769) {
            // Для больших экранов
            if (catalogMenu.classList.contains('show')) {
                catalogMenu.classList.remove('show');
                setTimeout(() => {
                    catalogMenu.style.display = 'none'; // Скрываем меню после завершения анимации
                }, 500); // Длительность анимации
            } else {
                catalogMenu.style.display = 'flex'; // Отображаем меню перед началом анимации
                setTimeout(() => {
                    catalogMenu.classList.add('show');
                }, 10); // Небольшая задержка для применения класса
            }
        } else {
            // Для мобильных устройств
            if (catalogMenu.style.display === 'block') {
                catalogMenu.style.opacity = '0';
                catalogMenu.style.display = 'none'; // Скрываем меню после завершения анимации

            } else {
                catalogMenu.style.display = 'block'; // Отображаем меню
                catalogMenu.style.opacity = '1';

            }
        }
    }

    catalogToggle.addEventListener('click', function (e) {
        e.preventDefault();
        toggleMenu();
    });

    // Переключение меню при изменении размера окна
    // window.addEventListener('resize', function () {
    //     if (window.innerWidth >= 769) {
    //         catalogMenu.style.display = 'none'; // Убедимся, что меню скрыто на больших экранах
    //     } else {
    //         catalogMenu.style.display = 'block'; // Убедимся, что меню отображается на мобильных устройствах
    //     }
    // });
});

document.querySelector('.menu-icon').addEventListener('click', function () {
    const popupMenu = document.querySelector('.popup-menu');
    popupMenu.style.display = popupMenu.style.display === 'block' ? 'none' : 'block';
});

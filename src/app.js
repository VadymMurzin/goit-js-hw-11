// Імпорт бібліотек
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

// Початкові значення
let currentPage = 1;
let currentQuery = '';
const perPage = 40;
const apiKey = '36850923-8246eaaf64fc6f741d3ffc06e';

// Елементи DOM
const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

// Ініціалізація SimpleLightbox
const lightbox = new SimpleLightbox('.gallery a');

// Оновлення галереї зображень
function updateGallery(images) {
  const cardsHTML = images.map((image) => createCardHTML(image)).join('');
  gallery.innerHTML += cardsHTML;

  // Оновлення SimpleLightbox
  lightbox.refresh();
}

// Створення розмітки карти зображення
function createCardHTML(image) {
  return `
    <div class="photo-card">
      <a href="${image.largeImageURL}">
        <img src="${image.webformatURL}" width="200" height="150" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </div>
  `;
}

// Очищення галереї
function clearGallery() {
  gallery.innerHTML = '';
}

// Показ повідомлення про кінець результатів пошуку
function showEndMessage() {
  Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
}

// Показ повідомлення про загальну кількість знайдених зображень
function showTotalHitsMessage(totalHits) {
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
}

// Показ повідомлення про відсутність результатів пошуку
function showNoResultsMessage() {
  Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}

// Обробка події подачі форми
searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Отримання значення пошукового запиту
  const searchQuery = searchForm.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    return;
  }

  // Перевірка, чи змінився пошуковий запит
  if (searchQuery !== currentQuery) {
    currentQuery = searchQuery;
    currentPage = 1;
    clearGallery();
  }

  // Виконання HTTP-запиту до Pixabay API
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: currentQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: perPage,
      },
    });

    const { data } = response;
    const { hits, totalHits } = data;

    if (hits.length > 0) {
      updateGallery(hits);
      showTotalHitsMessage(totalHits);

      // Перевірка, чи досягнуто кінця результатів пошуку
      if (hits.length >= totalHits || hits.length >= data.total) {
        loadMoreBtn.style.display = 'none';
        showEndMessage();
      } else {
        loadMoreBtn.style.display = 'block';
      }

      // Збільшення значення поточної сторінки
      currentPage += 1;
    } else {
      showNoResultsMessage();
    }
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Oops! Something went wrong.');
  }
});

// Обробка події натиснення кнопки "Load more"
loadMoreBtn.addEventListener('click', async () => {
  searchForm.dispatchEvent(new Event('submit'));
});

// Обробка події прокрутки сторінки
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 10) {
    loadMoreBtn.click();
  }
});


const API_URL = "https://workspace-methed.vercel.app/";
const LOCATION_URL = "api/locations";
const VACANCY_URL = "api/vacancy";
const BOT_TOKEN = "6616036408:AAHsGLnjAuvBHDnPBJHxK7g8ZZFnDma0A2I";


const cardsList = document.querySelector('.cards__list');

let lastUrl = '';
const pagination = {};

const getData = async (url, cbSuccess, cbError) => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        cbSuccess(data);


    } catch (err) {
        cbError(err)
    }
};

const createCard = vacancy => `
<article class="vacancy" tabindex="0" data-id="${vacancy.id}">
<img class="vacancy__img" src="${API_URL}${vacancy.logo}" alt="лготип ${vacancy.company}">
<p class="vacancy__company">${vacancy.company}</p>
<h3 class="vacancy__title">${vacancy.title}</h3>
<ul class="vacancy__fields">
    <li class="vacancy__field">от ${parseInt(vacancy.salary)
        .toLocaleString()}₽
    </li>
    <li class="vacancy__field">${vacancy.format}</li>
    <li class="vacancy__field">${vacancy.type}</li>
    <li class="vacancy__field">${vacancy.experience}</li>
</ul>
</article>
`;

const createCards = (data) =>
    data.vacancies.map(vacancy => {
        const li = document.createElement('li');
        li.classList.add('cards__item');
        li.insertAdjacentHTML('beforeend', createCard(vacancy));
        return li;
    })

const renderVacancies = (data) => {

    cardsList.textContent = '';
    const cards = createCards(data)
    cardsList.append(...cards);
    if (data.pagination) {
        Object.assign(pagination, data.pagination)
    }
    observer.observe(cardsList.lastElementChild);
};

const renderMoreVacancies = (data) => {

    const cards = createCards(data)
    cardsList.append(...cards);
    if (data.pagination) {
        Object.assign(pagination, data.pagination);
    }

    observer.observe(cardsList.lastElementChild);
};

const loadMoreVacacies = () => {

    if (pagination.totalPages > pagination.currentPage) {
        const urlWithParams = new URL(lastUrl);
        urlWithParams.searchParams.set('page', pagination.currentPage + 1);
        urlWithParams.searchParams.set('limit', window.innerWidth < 768 ? 6 : 12);

        getData(urlWithParams, renderMoreVacancies, renderError).then(() => {
            lastUrl = urlWithParams;
        });
    }

};

const renderError = err => {
    console.warn(err);
}

const createDetailVacancy = ({
    id,
    title,
    company,
    description,
    email,
    salary,
    type,
    format,
    experience,
    location,
    logo,
}) => `

    <article class="detail">
        <div class="detail__header">
            <img class="detail__logo" src="${API_URL}${logo}" alt="Логотип компании ${company}">
            <p class="detail__company">${company}</p>
            <h2 class="detail__title">${title}</h2>
        </div>

        <div class="detail__main">
            <p class="detail__description">
            ${description.replaceAll('\n', '<br>')}
            </p>
            <ul class="detail__fields">
                <li class="detail__firld">
                  ${parseInt(salary).toLocaleString()}₽
                </li>
                <li class="detail__firld">
                    ${type}
                </li>
                <li class="detail__firld">
                  ${format}
                </li>
                <li class="detail__firld">
                    ${experience}
                </li>
                <li class="detail__firld">
                    ${location}
                </li>
            </ul>
        </div>

        ${isNaN(parseInt(id.slice(-1))) ?
        `
            <p class="detail__resume">Отправляйте резюме на 
            <a class="blue-text" href="mailto:${email}">${email}</a>
            </p>
            `:
        `
            <form class="detail__tg">
                <input class="detail__input" type="text" name="message" placeholder="напишите свой email для отклика">
                <input type="hidden" name="vacancyId" value="${id}}">
                <button class="detail__btn">отправить</button>
            </form>
            `
    }
        
    </article>
`;

const sendTelegram = (modal) => {
    modal.addEventListener("submit", (e) => {
        e.preventDefault();
        const form = e.target.closest('.detail__tg');
        //    const formData = new FormData(form);
        const userId = '714533032';

        const text = `Отклик  на вакансию ${form.vacancyId.value}, email: ${form.message.value}`;


        const urlBot = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${userId}&text=${text}`;

        fetch(urlBot).then(res => alert('успешно отправлено')).catch(err => {
            alert('ошибка');
            console.log(err);
        })
    })
}

const renderModal = data => {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    const modalMain = document.createElement('div');
    modalMain.classList.add('modal__main');
    modalMain.innerHTML = createDetailVacancy(data);
    const modalClose = document.createElement('button');
    modalClose.classList.add('modal__close')
    modalClose.innerHTML = `
   <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
   <path
       d="M6.7831 6L11.3887 1.39444C11.4797 1.28816 11.5272 1.15145 11.5218 1.01163C11.5164 0.871815 11.4585 0.739182 11.3595 0.640241C11.2606 0.541299 11.128 0.483337 10.9881 0.477936C10.8483 0.472535 10.7116 0.520094 10.6053 0.611109L5.99977 5.21666L1.39421 0.605553C1.2896 0.50094 1.14771 0.442169 0.999768 0.442169C0.851823 0.442169 0.709937 0.50094 0.605324 0.605553C0.50071 0.710167 0.441939 0.852053 0.441939 0.999998C0.441939 1.14794 0.50071 1.28983 0.605324 1.39444L5.21643 6L0.605324 10.6056C0.547167 10.6554 0.499934 10.7166 0.466587 10.7856C0.433241 10.8545 0.414502 10.9296 0.411547 11.0061C0.408592 11.0826 0.421483 11.1589 0.449414 11.2302C0.477344 11.3015 0.51971 11.3662 0.573851 11.4204C0.627993 11.4745 0.692741 11.5169 0.764033 11.5448C0.835325 11.5727 0.91162 11.5856 0.988131 11.5827C1.06464 11.5797 1.13972 11.561 1.20864 11.5276C1.27757 11.4943 1.33885 11.447 1.38866 11.3889L5.99977 6.78333L10.6053 11.3889C10.7116 11.4799 10.8483 11.5275 10.9881 11.5221C11.128 11.5167 11.2606 11.4587 11.3595 11.3598C11.4585 11.2608 11.5164 11.1282 11.5218 10.9884C11.5272 10.8485 11.4797 10.7118 11.3887 10.6056L6.7831 6Z"
       fill="#CCCCCC" />
</svg>
   `;
    modalMain.append(modalClose);
    modal.append(modalMain);
    document.body.append(modal);

    modal.addEventListener('click', ({ target }) => {
        if (target === modal || target.closest('.modal__close')) {
            modal.remove();
        }
    });
    sendTelegram(modal)
};

const openModal = (id) => {
    getData(`${API_URL}${VACANCY_URL}/${id}`, renderModal, renderError)
}

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadMoreVacacies()
            }
        })
    }, {
    rootMargin: '100px',
},
);

const openFilter = (btn, dropDown, classNameBtn, classNameDb) => {
    dropDown.style.height = `${dropDown.scrollHeight}px`;
    btn.classList.add(classNameBtn);
    dropDown.classList.add(classNameDb);
}
const closeFilter = (btn, dropDown, classNameBtn, classNameDb) => {
    btn.classList.remove(classNameBtn);
    dropDown.classList.remove(classNameDb);
    dropDown.style.height = '';
}

const init = () => {
    const filterForm = document.querySelector(".filter__form");
    const vacanciesFilterBtn = document.querySelector(".vacancies__filter-btn");
    const vacanciesFilter = document.querySelector(".vacancies__filter");

    vacanciesFilterBtn.addEventListener('click', () => {
        if (vacanciesFilterBtn.classList.contains('vacancies__filter-btn_active')) {
            closeFilter(
                vacanciesFilterBtn,
                vacanciesFilter,
                "vacancies__filter-btn_active",
                "vacancies__filter_active",
            )
        } else {
            openFilter(
                vacanciesFilterBtn,
                vacanciesFilter,
                "vacancies__filter-btn_active",
                "vacancies__filter_active",
            )
        }
    });

    window.addEventListener('resize', () => {
        if (vacanciesFilterBtn.classList.contains('vacancies__filter-btn_active')) {
            // vacanciesFilter.style.height = `${dropDown.scrollHeight}px`;
            closeFilter(
                vacanciesFilterBtn,
                vacanciesFilter,
                "vacancies__filter-btn_active",
                "vacancies__filter_active",
            )
        }
        
    });

    // select city ==================== //
    const citySelect = document.querySelector('#city');
    const cityChoices = new Choices(citySelect, {
        searchEnabled: false,
        itemSelectText: '',
    });

    getData(
        `${API_URL}${LOCATION_URL}`,
        (locationData) => {
            const locations = locationData.map(location => ({
                value: location,
            }));
            cityChoices.setChoices(
                locations,
                "value",
                "label",
                false,
            );
        },
        (err) => {
            console.log(err);
        },
    );

    // cards ====================== //
    const urlWithParams = new URL(`${API_URL}${VACANCY_URL}`);

    urlWithParams.searchParams.set('limit', window.innerWidth < 768 ? 6 : 12);
    urlWithParams.searchParams.set("page", 1);

    getData(
        urlWithParams,
        renderVacancies,
        renderError,
    ).then(() => {
        lastUrl = urlWithParams;
    });
    // modal ============= //
    cardsList.addEventListener('click', ({ target }) => {
        const vacancyCard = target.closest('.vacancy');

        if (vacancyCard) {
            const vacancyId = vacancyCard.dataset.id;
            openModal(vacancyId);
        }
    });
    cardsList.addEventListener('keydown', ({code, target}) => {
        const vacancyCard = target.closest('.vacancy')
        if ((code === 'Enter' || code === 'NumpadEnter') && vacancyCard) {
            const vacancyId = vacancyCard.dataset.id;
            openModal(vacancyId);
            target.blur();
        }
    })

    // filter ====================== //
    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(filterForm);

        const urlWithParam = new URL(`${API_URL}${VACANCY_URL}`);

        formData.forEach((value, key) => {
            urlWithParam.searchParams.append(key, value);
        });
        
        getData(
            urlWithParam,
            renderVacancies,
            renderError,
        ).then(() => {
            lastUrl = urlWithParam;
        })
        .then(() => {
            closeFilter(
                vacanciesFilterBtn,
                vacanciesFilter,
                "vacancies__filter-btn_active",
                "vacancies__filter_active",
            );
        });
    });
};

init();





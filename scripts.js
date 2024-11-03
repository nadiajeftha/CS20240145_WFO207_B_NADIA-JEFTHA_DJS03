import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

const starting = document.createDocumentFragment();

function previewButton({ author, id, image, title }) {
  const element = document.createElement("button");
  element.classList = "preview";
  element.setAttribute("data-preview", id);

  element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;

  return element;
}

for (const book of matches.slice(0, BOOKS_PER_PAGE)) {
  const element = previewButton(book);
  starting.appendChild(element);
}

document.querySelector("[data-list-items]").appendChild(starting);

function optionsGenerator(optionSelector, defaultText, data) {
  const fragment = document.createDocumentFragment();
  const defaultOption = document.createElement("option");
  defaultOption.value = "any";
  defaultOption.innerText = defaultText;
  fragment.appendChild(defaultOption);

  for (const [id, name] of Object.entries(data)) {
    const option = document.createElement("option");
    option.value = id;
    option.innerText = name;
    fragment.appendChild(option);
  }

  document.querySelector(optionSelector).appendChild(fragment);

  optionsGenerator("[data-search-genres]", "All Genres", genres);
  optionsGenerator("[data-search-authors]", "All Authors", authors);

  const authorsHtml = document.createDocumentFragment();
  const firstAuthorElement = document.createElement("option");
  firstAuthorElement.value = "any";
  firstAuthorElement.innerText = "All Authors";
  authorsHtml.appendChild(firstAuthorElement);

  for (const [id, name] of Object.entries(authors)) {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    authorsHtml.appendChild(element);
  }

  document.querySelector("[data-search-authors]").appendChild(authorsHtml);

  function applyTheme(theme) {
    if (theme === "night") {
      document.documentElement.style.setProperty(
        "--color-dark",
        "255, 255, 255"
      );
      document.documentElement.style.setProperty("--color-light", "10, 10, 20");
    } else {
      document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
      document.documentElement.style.setProperty(
        "--color-light",
        "255, 255, 255"
      );
    }
  }
  //inittial theme
  applyTheme(
    window.matchMedia("(prefers-color-scheme:dark)").matches ? "night" : "day"
  );
  //change the theme in settings
  document
    .querySelector("[data-settings-form]")
    .addEventListener("submit", (event) => {
      event.preventDefault;
      const formData = new FormData(event.target);
      const { theme } = Object.fromEntries(formData);
      applyTheme(theme);
      document.querySelector("[data-setting-overlay]").open = false;
    });

  function showMoreBtn() {
    const remaining = matches.length * BOOKS_PER_PAGE;
    const button = document.querySelector("[data-list-button]");
    button.disabled = remaining < 1;
    button.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining">
     (${remaining > 0 ? remaining : 0})
     </span>
`;
  }
  showMoreBtn();

  function toggleOverlay(selctor, isOpen) {
    document.querySelector(selctor).open = isOpen;
  }

  document
    .querySelector("[data-search-cancel]")
    .addEventListener("click", () =>
      toggleOverlay("[data-search-overlay]", false)
    );

  document
    .querySelector("[data-settings-cancel]")
    .addEventListener("click", () =>
      toggleOverlay("[data-settings-overlay]", false)
    );

  document
    .querySelector("[data-header-search]")
    .addEventListener("click", () => {
      toggleOverlay("[data-search-overlay]", true);
      document.querySelector("[data-search-title]").focus();
    });
  document
    .querySelector("[data-header-settings]")
    .addEventListener("click", () =>
      toggleOverlay("[data-settings-overlay]", true)
    );
  document
    .querySelector("[data-list-close]")
    .addEventListener("click", () =>
      toggleOverlay("[data-list-active]", false)
    );

  document
    .querySelector("[data-settings-form]")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const { theme } = Object.fromEntries(formData);

      if (theme === "night") {
        document.documentElement.style.setProperty(
          "--color-dark",
          "255, 255, 255"
        );
        document.documentElement.style.setProperty(
          "--color-light",
          "10, 10, 20"
        );
      } else {
        document.documentElement.style.setProperty(
          "--color-dark",
          "10, 10, 20"
        );
        document.documentElement.style.setProperty(
          "--color-light",
          "255, 255, 255"
        );
      }

      document.querySelector("[data-settings-overlay]").open = false;
    });

  document
    .querySelector("[data-search-form]")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const filters = Object.fromEntries(formData);
      const result = [];

      for (const book of books) {
        let genreMatch = filters.genre === "any";

        for (const singleGenre of book.genres) {
          if (genreMatch) break;
          if (singleGenre === filters.genre) {
            genreMatch = true;
          }
        }

        if (
          (filters.title.trim() === "" ||
            book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
          (filters.author === "any" || book.author === filters.author) &&
          genreMatch
        ) {
          result.push(book);
        }
      }

      page = 1;
      matches = result;

      if (result.length < 1) {
        document
          .querySelector("[data-list-message]")
          .classList.add("list__message_show");
      } else {
        document
          .querySelector("[data-list-message]")
          .classList.remove("list__message_show");
      }

      document.querySelector("[data-list-items]").innerHTML = "";
      const newItems = document.createDocumentFragment();

      for (const { author, id, image, title } of result.slice(
        0,
        BOOKS_PER_PAGE
      )) {
        const element = document.createElement("button");
        element.classList = "preview";
        element.setAttribute("data-preview", id);

        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

        newItems.appendChild(element);
      }

      document.querySelector("[data-list-items]").appendChild(newItems);
      document.querySelector("[data-list-button]").disabled =
        matches.length - page * BOOKS_PER_PAGE < 1;

      document.querySelector("[data-list-button]").innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${
          matches.length - page * BOOKS_PER_PAGE > 0
            ? matches.length - page * BOOKS_PER_PAGE
            : 0
        })</span>
    `;

      window.scrollTo({ top: 0, behavior: "smooth" });
      document.querySelector("[data-search-overlay]").open = false;
    });

  document.querySelector("[data-list-button]").addEventListener("click", () => {
    const fragment = document.createDocumentFragment();

    for (const { author, id, image, title } of matches.slice(
      page * BOOKS_PER_PAGE,
      (page + 1) * BOOKS_PER_PAGE
    )) {
      const element = document.createElement("button");
      element.classList = "preview";
      element.setAttribute("data-preview", id);

      element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

      fragment.appendChild(element);
    }

    document.querySelector("[data-list-items]").appendChild(fragment);
    page += 1;
  });

  document
    .querySelector("[data-list-items]")
    .addEventListener("click", (event) => {
      const pathArray = Array.from(event.path || event.composedPath());
      let active = null;

      for (const node of pathArray) {
        if (active) break;

        if (node?.dataset?.preview) {
          let result = null;

          for (const singleBook of books) {
            if (result) break;
            if (singleBook.id === node?.dataset?.preview) result = singleBook;
          }

          active = result;
        }
      }

      if (active) {
        document.querySelector("[data-list-active]").open = true;
        document.querySelector("[data-list-blur]").src = active.image;
        document.querySelector("[data-list-image]").src = active.image;
        document.querySelector("[data-list-title]").innerText = active.title;
        document.querySelector("[data-list-subtitle]").innerText = `${
          authors[active.author]
        } (${new Date(active.published).getFullYear()})`;
        document.querySelector("[data-list-description]").innerText =
          active.description;
      }
    });
}

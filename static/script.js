document.addEventListener("DOMContentLoaded", function () {
  const translations = {
    en: {
      mishlei: "Mishlei - Proverbs",
      chapters: "Chapters",
      today: "Today",
      chapter: "Chapter",
      commentators: "Commentators",
      chapterPrefix: "Chapter",
    },
    ru: {
      mishlei: "Мишлей - Притчи",
      chapters: "Главы",
      today: "Сегодня",
      chapter: "Глава",
      commentators: "Комментаторы",
      chapterPrefix: "Глава",
    },
  };

  const chapterList = document.getElementById("chapterList");
  const verseList = document.getElementById("verseList");
  const commentatorList = document.getElementById("commentatorList");
  const currentChapterSpan = document.getElementById("currentChapter");
  const todayButton = document.getElementById("todayButton");
  const langButtons = document.querySelectorAll(".lang-btn");
  let currentLanguage = "en";
  let activeCommentators = new Set();
  let currentChapter = null;
  let currentVerses = {};

  function fetchChapters(lang) {
    fetch(`/chapters/${lang}`)
      .then((response) => response.json())
      .then((data) => {
        chapterList.innerHTML = `
          <h2>${translations[lang].chapters}</h2>
          <button id="todayButton">${translations[lang].today}</button>
        `;
        for (let chapter in data) {
          const chapterButton = document.createElement("button");
          chapterButton.innerText = `${translations[lang].chapterPrefix} ${chapter}`;
          chapterButton.onclick = () => {
            displayChapter(data[chapter], chapter);
            document
              .querySelectorAll("#chapterList button")
              .forEach((btn) => btn.classList.remove("selected"));
            chapterButton.classList.add("selected");
          };
          chapterList.appendChild(chapterButton);
        }

        document.getElementById("todayButton").addEventListener("click", () => {
          const today = new Date().getDate();
          const chapterButton = Array.from(
            chapterList.querySelectorAll("button")
          ).find(
            (btn) =>
              btn.innerText === `${translations[lang].chapterPrefix} ${today}`
          );
          if (chapterButton) {
            chapterButton.click();
          } else {
            alert(
              `${translations[lang].chapterPrefix} ${today} is not available.`
            );
          }
        });

        openTodayChapter();
      });
  }

  function displayChapter(chapter, chapterNumber) {
    currentChapter = chapterNumber;
    currentVerses = chapter;
    currentChapterSpan.textContent = chapterNumber;
    verseList.innerHTML = `<h2>${translations[currentLanguage].chapter} ${chapterNumber}</h2>`;
    for (let verse in chapter) {
      const verseDiv = document.createElement("div");
      verseDiv.classList.add("verse");
      verseDiv.innerHTML = `<span class="verse-number">${verse}.</span> ${chapter[verse]}`;
      verseList.appendChild(verseDiv);
    }
    fetchCommentCounts();
  }

  function fetchCommentators() {
    commentatorList.innerHTML = `<h2>${translations[currentLanguage].commentators}</h2>`;
    const commentators = [
      "Rashi",
      "ibn-ezra",
      "Alshich",
      "Chomat Anakh",
      "JPS",
      "Malbim",
      "Malbim Beur Hamilot",
      "Metzudat David",
      "Metzudat Zion",
      "Minchat Shai",
      "Nachna Leibowirz",
      "Ralbag",
      "Rishon Letzion",
      "Steinsaltz",
    ];
    commentators.forEach((commentator) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = commentator;
      checkbox.onchange = () => {
        toggleCommentary(commentator);
        label.classList.toggle("selected", checkbox.checked);
      };
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(commentator));
      commentatorList.appendChild(label);
    });
  }

  function fetchCommentCounts() {
    console.log(`Fetching comment counts for chapter ${currentChapter}`);
    fetch(`/comment_count/${currentLanguage}/${currentChapter}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Comment counts:", data);
        const commentatorLabels = commentatorList.querySelectorAll("label");
        commentatorLabels.forEach((label) => {
          const commentator = label.textContent.trim().split(" (")[0]; // Extract the name without the current count
          const count = data[commentator] || 0;
          const checkbox = label.querySelector("input[type='checkbox']");
          label.innerHTML = "";
          label.appendChild(checkbox);
          label.appendChild(
            document.createTextNode(` ${commentator} (${count})`)
          );
        });
      });
  }

  function toggleCommentary(commentator) {
    if (activeCommentators.has(commentator)) {
      activeCommentators.delete(commentator);
    } else {
      activeCommentators.add(commentator);
    }
    updateComments();
  }

  function updateComments() {
    const verses = verseList.querySelectorAll(".verse");
    verses.forEach((verseDiv) => {
      const verseNumber = verseDiv
        .querySelector(".verse-number")
        .textContent.slice(0, -1);
      fetch(`/comments/${currentLanguage}/${currentChapter}/${verseNumber}`)
        .then((response) => response.json())
        .then((data) => {
          const existingCommentaries = verseDiv.querySelectorAll(".commentary");
          existingCommentaries.forEach((commentary) => commentary.remove());

          activeCommentators.forEach((commentator) => {
            const commentText = data[commentator];
            if (commentText) {
              const commentElement = document.createElement("div");
              commentElement.classList.add("commentary");
              commentElement.innerHTML = `<b>${commentator}</b>: ${commentText}`;
              verseDiv.appendChild(commentElement);
            }
          });
        });
    });
  }

  function openTodayChapter() {
    const today = new Date().getDate();
    const chapterButton = Array.from(
      chapterList.querySelectorAll("button")
    ).find(
      (btn) =>
        btn.innerText ===
        `${translations[currentLanguage].chapterPrefix} ${today}`
    );
    if (chapterButton) {
      chapterButton.click();
    } else {
      alert(
        `${translations[currentLanguage].chapterPrefix} ${today} is not available.`
      );
    }
  }

  function updateTextContent(lang) {
    document.querySelector("header h1").textContent =
      translations[lang].mishlei;
    document.querySelector("#chapterList h2").textContent =
      translations[lang].chapters;
    document.querySelector("#todayButton").textContent =
      translations[lang].today;
    document.querySelector(
      "#verseList h2"
    ).textContent = `${translations[lang].chapter} ${currentChapter}`;
    document.querySelector("#commentatorList h2").textContent =
      translations[lang].commentators;

    const chapterButtons = chapterList.querySelectorAll(
      "button:not(#todayButton)"
    );
    chapterButtons.forEach((button, index) => {
      button.textContent = `${translations[lang].chapterPrefix} ${index + 1}`;
    });
  }

  langButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      currentLanguage = e.target.id.split("-")[1];
      fetchChapters(currentLanguage);
      updateTextContent(currentLanguage);
      langButtons.forEach((btn) => btn.classList.remove("selected"));
      e.target.classList.add("selected");
    });
  });

  fetchChapters(currentLanguage);
  fetchCommentators();
});

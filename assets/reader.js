(() => {
  const REPO = "hf7y/french-textbook";
  const list = document.querySelector("#lesson-list");
  const article = document.querySelector("#lesson");
  const filter = document.querySelector("#lesson-filter");
  const btnReviewed = document.querySelector("#btn-reviewed");
  const btnSections = document.querySelector("#btn-sections");

  let lessons = [];
  let sectionsData = [];
  let mode = "reviewed"; // "reviewed" | "sections"

  const escape = (text) => text.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);

  const inline = (text) => escape(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');

  function renderTable(lines) {
    const rows = lines
      .filter((line) => line.startsWith("|"))
      .map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()));
    if (rows.length < 2 || !rows[1].every((cell) => /^:?-{3,}:?$/.test(cell))) {
      return null;
    }
    const header = rows[0].map((cell) => `<th>${inline(cell)}</th>`).join("");
    const body = rows.slice(2).map((row) =>
      `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`
    ).join("");
    return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
  }

  function renderMarkdown(markdown) {
    const body = markdown.replace(/^---\n[\s\S]*?\n---\n*/, "").trim();
    const lines = body.split("\n");
    const output = [];
    for (let index = 0; index < lines.length;) {
      const tableLines = [];
      while (index + tableLines.length < lines.length &&
             lines[index + tableLines.length].startsWith("|")) {
        tableLines.push(lines[index + tableLines.length]);
      }
      const table = renderTable(tableLines);
      if (table) {
        output.push(table);
        index += tableLines.length;
      } else if (/^#{1,3} /.test(lines[index])) {
        const level = lines[index].match(/^#+/)[0].length;
        output.push(`<h${level}>${inline(lines[index].slice(level + 1))}</h${level}>`);
        index += 1;
      } else if (/^[-*] /.test(lines[index])) {
        const items = [];
        while (index < lines.length && /^[-*] /.test(lines[index])) {
          items.push(`<li>${inline(lines[index].slice(2))}</li>`);
          index += 1;
        }
        output.push(`<ul>${items.join("")}</ul>`);
      } else if (/^\d+\. /.test(lines[index])) {
        const items = [];
        while (index < lines.length && /^\d+\. /.test(lines[index])) {
          items.push(`<li>${inline(lines[index].replace(/^\d+\. /, ""))}</li>`);
          index += 1;
        }
        output.push(`<ol>${items.join("")}</ol>`);
      } else if (lines[index].trim()) {
        output.push(`<p>${inline(lines[index])}</p>`);
        index += 1;
      } else {
        index += 1;
      }
    }
    return output.join("\n");
  }

  function currentLessons() {
    return mode === "sections" ? sectionsData : lessons;
  }

  function showLessons() {
    const query = filter.value.toLocaleLowerCase();
    list.replaceChildren(...currentLessons()
      .filter((lesson) => lesson.title.toLocaleLowerCase().includes(query))
      .map((lesson) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${lesson.id}`;
        link.textContent = lesson.title;
        item.append(link);
        return item;
      }));
  }

  function buildIssueUrl(lesson) {
    const title = encodeURIComponent(`Lesson correction: ${lesson.title}`);
    const body = encodeURIComponent(
      `**Reviewed lesson:** \`data/sections/${lesson.id}.md\`\n\n` +
      `**OCR source:** \`${lesson.path}\`\n\n` +
      `**Describe the correction:**\n\n` +
      `<!-- Quote the text, explain the correction, and identify its location. -->`
    );
    const labels = encodeURIComponent("repair-lesson");
    return `https://github.com/${REPO}/issues/new?title=${title}&body=${body}&labels=${labels}`;
  }

  function buildToolbar(lesson) {
    const toolbar = document.createElement("div");
    toolbar.className = "lesson-toolbar";

    const downloadLink = document.createElement("a");
    downloadLink.href = lesson.path;
    downloadLink.download = lesson.path.split("/").pop();
    downloadLink.textContent = "⬇ Download .md";
    downloadLink.className = "toolbar-btn";

    const reportLink = document.createElement("a");
    reportLink.href = buildIssueUrl(lesson);
    reportLink.target = "_blank";
    reportLink.rel = "noopener noreferrer";
    reportLink.textContent = "⚠ Report an error";
    reportLink.className = "toolbar-btn toolbar-btn--report";

    toolbar.append(downloadLink, reportLink);
    return toolbar;
  }

  async function showLesson() {
    const id = location.hash.slice(1);
    const lesson = currentLessons().find((entry) => entry.id === id);
    document.querySelectorAll("#lesson-list a").forEach((link) =>
      link.toggleAttribute("aria-current", link.hash === location.hash)
    );
    if (!lesson) {
      article.innerHTML = "<p>Select a lesson from the list.</p>";
      return;
    }
    article.textContent = "Loading lesson...";
    try {
      const response = await fetch(lesson.path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const content = await response.text();
      article.innerHTML = "";
      if (mode === "sections") {
        article.append(buildToolbar(lesson));
      }
      const body = document.createElement("div");
      body.innerHTML = renderMarkdown(content);
      article.append(body);
    } catch (error) {
      article.textContent = `Unable to load this lesson (${error.message}).`;
    }
  }

  function switchMode(newMode) {
    mode = newMode;
    const isReviewed = mode === "reviewed";
    btnReviewed.classList.toggle("active", isReviewed);
    btnReviewed.setAttribute("aria-pressed", String(isReviewed));
    btnSections.classList.toggle("active", !isReviewed);
    btnSections.setAttribute("aria-pressed", String(!isReviewed));
    filter.value = "";
    history.replaceState(null, "", " ");
    showLessons();
    showLesson();
  }

  btnReviewed.addEventListener("click", () => switchMode("reviewed"));
  btnSections.addEventListener("click", () => switchMode("sections"));
  filter.addEventListener("input", showLessons);
  window.addEventListener("hashchange", showLesson);

  function loadIndex(url) {
    return fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  }

  loadIndex("data/sections/index.json")
    .then((records) => { lessons = records; showLessons(); showLesson(); })
    .catch((error) => {
      article.textContent = `The reviewed lesson index could not be loaded (${error.message}).`;
    });

  loadIndex("sections/index.json")
    .then((records) => { sectionsData = records; })
    .catch(() => { /* sections not available in this environment */ });
})();

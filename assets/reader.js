(() => {
  const list = document.querySelector("#lesson-list");
  const article = document.querySelector("#lesson");
  const filter = document.querySelector("#lesson-filter");
  let lessons = [];

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

  function showLessons() {
    const query = filter.value.toLocaleLowerCase();
    list.replaceChildren(...lessons
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

  async function showLesson() {
    const id = location.hash.slice(1);
    const lesson = lessons.find((entry) => entry.id === id);
    document.querySelectorAll("#lesson-list a").forEach((link) =>
      link.toggleAttribute("aria-current", link.hash === location.hash)
    );
    if (!lesson) {
      article.innerHTML = "<p>Select a reviewed lesson from the list.</p>";
      return;
    }
    article.textContent = "Loading lesson...";
    try {
      const response = await fetch(lesson.path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      article.innerHTML = renderMarkdown(await response.text());
    } catch (error) {
      article.textContent = `Unable to load this lesson (${error.message}).`;
    }
  }

  filter.addEventListener("input", showLessons);
  window.addEventListener("hashchange", showLesson);
  fetch("data/sections/index.json")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((records) => {
      lessons = records;
      showLessons();
      showLesson();
    })
    .catch((error) => {
      article.textContent = `The lesson index could not be loaded (${error.message}).`;
    });
})();

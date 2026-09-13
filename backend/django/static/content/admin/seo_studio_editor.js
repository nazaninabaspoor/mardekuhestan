/**
 * دکمه بزرگ/کوچک کردن ادیتور متن مقاله در استودیو SEO.
 */
(function () {
  function findBodyField() {
    return (
      document.querySelector(".field-body") ||
      document.querySelector(".form-row.field-body") ||
      null
    );
  }

  function ensureButton(field) {
    if (!field || field.querySelector(".mk-editor-size-btn")) return;
    const label = field.querySelector("label") || field.querySelector(".flex-container");
    const bar = document.createElement("div");
    bar.className = "mk-editor-size-bar";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mk-editor-size-btn";
    btn.textContent = "بزرگ کردن فضای نوشتن";
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", function () {
      const open = field.classList.toggle("is-editor-expanded");
      btn.textContent = open ? "کوچک کردن فضای نوشتن" : "بزرگ کردن فضای نوشتن";
      btn.setAttribute("aria-pressed", open ? "true" : "false");
      if (open) {
        field.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    bar.appendChild(btn);
    if (label && label.parentNode === field) {
      label.insertAdjacentElement("afterend", bar);
    } else {
      field.insertBefore(bar, field.firstChild);
    }
  }

  function boot() {
    ensureButton(findBodyField());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  // تب‌های Unfold ممکن است دیرتر فیلد را نشان دهند
  window.setTimeout(boot, 400);
  window.setTimeout(boot, 1200);
})();

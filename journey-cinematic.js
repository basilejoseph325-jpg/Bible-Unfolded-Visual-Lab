/* Bible Unfolded Story Adventure — cinematic continuity for Visual Lab.
   No saved state, progress edits, unlock changes, or intercepted navigation. */
(function () {
  "use strict";
  if (window.__buJourneyCinematicInstalled) return;
  window.__buJourneyCinematicInstalled = true;

  var scenes = [
    "01_the_beginning.webp",
    "02_faith_promises.webp",
    "03_deliverance.webp",
    "04_judges_kings.webp",
    "05_exile_return.webp",
    "06_the_messiah.webp",
    "07_good_news_spreads.webp",
    "08_revelation.webp"
  ];

  function chooseScene(index) {
    if (!Number.isInteger(index) || index < 0 || index >= scenes.length) return;
    var root = document.documentElement;
    root.dataset.buJourneyEra = String(index + 1);
    root.style.setProperty("--bu-journey-photo",
      'url("journey-art/' + scenes[index] + '")');
  }

  function init() {
    chooseScene(0);
    document.addEventListener("click", function (event) {
      var el = event.target && event.target.nodeType === 1
        ? event.target : event.target && event.target.parentElement;
      if (!el || !el.closest) return;

      var stop = el.closest("#journey-stops .route-stop");
      if (stop) {
        // Keep the existing story's lock/unlock rules entirely in charge.
        if (!stop.classList.contains("open") || stop.disabled) return;
        var list = document.querySelectorAll("#journey-stops .route-stop");
        var index = Array.prototype.indexOf.call(list, stop);
        chooseScene(index);
        return;
      }

      // Reaching playable Genesis/Exodus chapters from Browse Bible Books
      // must also carry the matching chapter atmosphere.
      var book = el.closest("#hebrew-books .book-tile");
      if (book) {
        var label = (book.textContent || "").toLowerCase();
        if (label.indexOf("exodus") !== -1) chooseScene(2);
        else if (label.indexOf("genesis") !== -1) chooseScene(0);
      }
    }, true);

    // Handy non-invasive check for the Visual Lab acceptance tests.
    document.documentElement.dataset.buJourneyCinematic = "ready";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {once:true});
  } else {
    init();
  }
})();

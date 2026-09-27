import { getQuotes } from "./api.js";
import { createQuoteCard } from "./quoteCard.js";
const list = document.querySelector("#quote-list");
const message = document.querySelector("#list-message");
const search = document.querySelector("#quote-search");
const refresh = document.querySelector("#refresh");
let filter = "all";
function updateView() {
    const cards = [...list.children];
    const completed = cards.filter(card => card.dataset.status === "completed").length;
    document.querySelector("#total-count").textContent = cards.length;
    document.querySelector("#pending-count").textContent = cards.length - completed;
    document.querySelector("#completed-count").textContent = completed;
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
        card.hidden = !(filter === "all" || card.dataset.status === filter) || !card.dataset.search.includes(query);
        if (!card.hidden) visible++;
    });
    message.textContent = !cards.length ? "No requests yet. New customer requests will appear here." : !visible ? "No requests match your search or filter." : "";
}
async function loadQuotes() {
    refresh.disabled = true;
    message.textContent = "Loading requests…";
    try {
        const quotes = await getQuotes();
        list.replaceChildren(...quotes.map(quote => createQuoteCard(quote)));
        updateView();
    } catch (error) { message.textContent = "Could not load requests. Check that your backend is running, then click Refresh."; }
    finally { refresh.disabled = false; }
}
search.addEventListener("input", updateView);
document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
    filter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    updateView();
}));
list.addEventListener("quotes-changed", updateView);
refresh.addEventListener("click", loadQuotes);
loadQuotes();

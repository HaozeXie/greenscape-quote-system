import { updateQuoteApi, deleteQuoteApi } from "./api.js";

export function createQuoteCard(quote) {
    const card = document.createElement("div");
    card.className = "quote-card";
    card.innerHTML = `
        <div class="card-top"><span class="request-id"></span><p class="quote-status"></p></div>
        <h3></h3><p class="email"></p><p class="phone"></p>
        <div class="price-summary"><span>QUOTED AMOUNT</span><p class="quote-amount"></p></div>
        <label>Service:
            <select class="service-select">
                <option value="lawn-maintenance">Lawn Maintenance</option>
                <option value="hedge-trimming">Hedge Trimming</option>
                <option value="seasonal-cleanup">Seasonal Cleanup</option>
                <option value="garden-care">Garden Care</option>
            </select>
        </label>
        <label>Quote amount (CAD):
            <input class="amount-input" type="number" min="0" max="99999999.99" step="0.01" placeholder="Enter amount">
        </label>
        <div class="card-actions"><button class="update-button" type="button">Save quote</button>
        <button class="delete-button" type="button">Delete</button></div>
        <p class="card-message" role="status"></p>`;
    card.querySelector(".request-id").textContent = "REQUEST #" + quote.id;
    card.dataset.search = [quote.name, quote.email, quote.phone].join(" ").toLowerCase();
    card.querySelector("h3").textContent = quote.name;
    card.querySelector(".email").textContent = "Email: " + quote.email;
    card.querySelector(".phone").textContent = "Phone: " + quote.phone;
    const service = card.querySelector("select");
    const amount = card.querySelector("input");
    const save = card.querySelector(".update-button");
    const remove = card.querySelector(".delete-button");
    const message = card.querySelector(".card-message");
    function render() {
        card.dataset.status = quote.status === "completed" ? "completed" : "pending";
        service.value = quote.service;
        amount.value = quote.amount ?? "";
        card.querySelector(".quote-status").textContent = (quote.status === "completed" ? "Completed" : "Pending");
        card.querySelector(".quote-amount").textContent = quote.amount == null ? "Awaiting quote" : "" + new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(quote.amount) + " CAD";
    }
    function busy(value) { save.disabled = remove.disabled = service.disabled = amount.disabled = value; }
    service.addEventListener("change", () => { amount.value = ""; });
    save.addEventListener("click", async () => {
        if (!amount.checkValidity()) { amount.reportValidity(); return; }
        busy(true);
        message.textContent = "Saving…";
        try {
            quote = await updateQuoteApi(quote.id, service.value, amount.value === "" ? undefined : amount.value);
            render();
            card.dispatchEvent(new CustomEvent("quotes-changed", { bubbles: true }));
            message.textContent = quote.status === "completed" ? "Quote saved successfully!" : "Saved as pending. Enter an amount to complete the quote.";
        } catch (error) { message.textContent = error.message; }
        finally { busy(false); }
    });
    remove.addEventListener("click", async () => {
        busy(true);
        try { await deleteQuoteApi(quote.id); const parent = card.parentElement; card.remove(); parent.dispatchEvent(new CustomEvent("quotes-changed", { bubbles: true })); }
        catch (error) { message.textContent = error.message; busy(false); }
    });
    render();
    return card;
}

const form = document.querySelector("form");

const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const serviceSelect = document.querySelector("#service");
const formMessage = document.querySelector("#form-message");

const menuButton = document.querySelector("#menu-button");
const navMenu = document.querySelector("#nav-menu");

const serviceContainer = document.querySelector(".service-container");

const phonePattern = /^[0-9\s-()]+$/;


function showError(message) {
    formMessage.textContent = message;

    formMessage.classList.add("error");
    formMessage.classList.remove("success");
}


function showSuccess(message) {
    formMessage.textContent = message;

    formMessage.classList.remove("error");
    formMessage.classList.add("success");
}


const services = [
    {
        name: "Lawn Maintenance",
        description: "Keep your lawn healthy with regular mowing and edging."
    },
    {
        name: "Hedge Trimming",
        description: "Professional trimming for clean and tidy hedges."
    },
    {
        name: "Seasonal Cleanup",
        description: "Spring and fall cleanup for leaves and debris."
    },
    {
        name: "Garden Care",
        description: "Weeding, plant care, and general garden maintenance."
    }
];


services.forEach(function (service) {
    const card = document.createElement("div");

    card.classList.add("service-card");


    const title = document.createElement("h3");

    title.textContent = service.name;


    const description = document.createElement("p");

    description.textContent = service.description;


    card.append(title);
    card.append(description);

    serviceContainer.append(card);
});


const cards = document.querySelectorAll(".service-card");

cards.forEach(function (card) {
    card.addEventListener("click", function () {
        card.classList.toggle("selected");
    });
});


menuButton.addEventListener("click", function () {
    navMenu.classList.toggle("open");
});


form.addEventListener("submit", function (event) {
    event.preventDefault();


    if (nameInput.value.trim() === "") {
        showError("Please enter your name.");
        return;
    }


    if (emailInput.value.trim() === "") {
        showError("Please enter your email.");
        return;
    }


    if (!emailInput.checkValidity()) {
        showError("Please enter a valid email.");
        return;
    }


    if (phoneInput.value.trim() === "") {
        showError("Please enter your phone number.");
        return;
    }


    if (!phonePattern.test(phoneInput.value.trim())) {
        showError("Please enter a valid phone number.");
        return;
    }


    if (serviceSelect.value === "") {
        showError("Please choose a service.");
        return;
    }


    const quoteData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        service: serviceSelect.value
    };


    fetch("http://localhost:3000/api/quotes", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(quoteData)
    })
        .then(function (response) {
            if (!response.ok) throw new Error("Request failed");
            return response.json();
        })
        .then(function (data) {
            console.log(data);

            showSuccess("Request received! Status: pending. Check your quote below using your phone number.");

            form.reset();

            setTimeout(function () {
                formMessage.textContent = "";
                formMessage.classList.remove("success");
            }, 2000);
        })
        .catch(function (error) {
            console.error(error);

            showError("Something went wrong. Please try again.");
        });
});

const lookupForm = document.querySelector("#lookup-form");
lookupForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const phone = document.querySelector("#lookup-phone").value.replace(/[^0-9]/g, "");
    const message = document.querySelector("#lookup-message");
    const results = document.querySelector("#lookup-results");
    const button = lookupForm.querySelector("button");
    results.replaceChildren();
    if (phone.length < 7 || phone.length > 15) {
        message.textContent = "Please enter a valid phone number (7–15 digits).";
        return;
    }
    button.disabled = true;
    message.textContent = "Looking up your quotes…";
    try {
        const response = await fetch("http://localhost:3000/api/quotes/lookup?phone=" + encodeURIComponent(phone));
        if (!response.ok) throw new Error("Could not look up quotes. Please try again.");
        const quotes = await response.json();
        message.textContent = quotes.length ? "Your quote requests:" : "No quotes found for this phone number.";
        for (const quote of quotes) {
            const card = document.createElement("div");
            card.className = "quote-card";
            const title = document.createElement("h3");
            title.textContent = "Request #" + quote.id + " · " + quote.service.replaceAll("-", " ");
            const status = document.createElement("p");
            status.textContent = "Status: " + (quote.status === "completed" ? "completed" : "pending");
            card.append(title, status);
            if (quote.status === "completed" && quote.amount != null) {
                const price = document.createElement("p");
                price.textContent = "Quote: " + new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(quote.amount) + " CAD";
                card.append(price);
            }
            results.append(card);
        }
    } catch (error) { message.textContent = error.message; }
    finally { button.disabled = false; }
});

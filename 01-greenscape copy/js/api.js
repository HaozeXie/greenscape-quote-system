const API_URL = "http://localhost:3000/api/quotes";

function checkResponse(response, message) {
    if (!response.ok) {
        throw new Error(message + ": " + response.status);
    }
}

export async function getQuotes() {
    const response = await fetch(API_URL);

    checkResponse(
        response,
        "Failed to load quotes"
    );

    return response.json();
}

export async function updateQuoteApi(
    id,
    service,
    amount
) {
    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                service: service,
                ...(amount !== undefined ? { amount } : {})
            })
        }
    );

    checkResponse(
        response,
        "Update failed"
    );

    return response.json();
}

export async function deleteQuoteApi(id) {
    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "DELETE"
        }
    );

    checkResponse(
        response,
        "Delete failed"
    );

    return response.json();
}
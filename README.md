# GreenScape Quote Manager

A full-stack quote management application for a landscaping business. Customers can request a quote and track it using their phone number, while administrators can review requests, set prices, and manage quote statuses.

## Features

### Customer website
- Responsive landscaping service website.
- Quote request form with name, email, phone number, and service selection.
- Quote lookup by phone number, including multiple requests for the same number.
- Pending status for requests awaiting a price.
- Completed status and a CAD amount after a quote is saved.

### Admin workspace
- Request cards displaying customer details, services, status, and quoted amounts.
- Overview counts for total, pending, and completed requests.
- Status filters and search by name, email, or phone number.
- Service editing, quote pricing, and request deletion.
- Updated counts and card details after saving or deleting a request.

“Completed” means the quote has been priced; it does not mean the landscaping work has been completed.

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript, Fetch API
- **Backend:** Node.js, Express
- **Database:** MySQL, mysql2
- **Configuration:** dotenv

## Repository Structure

```text
.
├── 01-greenscape copy/
│   ├── index.html
│   ├── admin.html
│   ├── css/
│   ├── js/
│   └── images/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
├── .gitignore
└── README.md
```

## Run Locally

### 1. Install prerequisites

Install Node.js with npm, MySQL 8.0 or later, and VS Code with the Live Server extension. Start your local MySQL server.

Download or clone this repository, then open a terminal in its root directory.

### 2. Create the database

Open the MySQL terminal:

```bash
mysql -u root -p
```

Run the following SQL:

```sql
CREATE DATABASE IF NOT EXISTS greenscape;
USE greenscape;

CREATE TABLE IF NOT EXISTS quotes (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    service VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
);
```

Exit the MySQL terminal with `exit;` before entering the shell commands below.

### 3. Configure and start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit the local `.env` file with your MySQL connection settings:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=greenscape
```

Keep `.env` private and exclude it from Git commits and manual uploads.

Start the backend:

```bash
npm start
```

The API runs at `http://localhost:3000`. Leave this terminal running. After changing backend code or configuration, stop it with Control+C and run `npm start` again.

For an existing `quotes` table without `amount` or `status`, the backend adds the missing fields at startup. The table itself must already exist.

### 4. Open the frontend

Open the repository in VS Code. Right-click `01-greenscape copy/index.html` and choose **Open with Live Server**.

Use Live Server on port **5500** with either `127.0.0.1` or `localhost`, matching the backend's allowed frontend origins. Opening HTML directly as a local file is not the intended setup.

Open `admin.html` from the same folder using Live Server to access the admin workspace.

## Try the Quote Workflow

1. Submit a customer request using fictional contact details and a test phone number such as `4165550123`.
2. Open the admin workspace and click **Refresh** if it was already open.
3. Find the request. Its initial status is **Pending**.
4. Enter a price such as `125.00` and click **Save quote**.
5. The card displays **Completed** and the saved CAD amount.
6. Return to the customer page and use **Check Your Quote** with the same phone number.
7. The customer sees the saved quote and its completed status.

Changing the service and saving without an amount resets its quote to pending. Saving a price, including `0`, completes the quote.

## API Overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/services` | Retrieve the backend's sample service list |
| GET | `/api/quotes` | Retrieve all requests for the admin workspace |
| POST | `/api/quotes` | Create a customer request |
| GET | `/api/quotes/lookup?phone=4165550123` | Look up quote summaries by phone number |
| PATCH | `/api/quotes/:id` | Update the service and optionally save an amount |
| DELETE | `/api/quotes/:id` | Delete a request |

Example pricing request body:

```json
{
  "service": "garden-care",
  "amount": "125.00"
}
```

The backend saves the amount and completed status together. Phone lookup returns quote summaries without customer names or email addresses.

## Current Scope

This is a portfolio and learning project designed for local demonstration.

- Admin pages and management endpoints do not yet have authentication or authorization.
- Phone lookup uses the phone number alone and does not verify ownership.
- Frontend API URLs currently point to `localhost:3000`.
- Online deployment requires production configuration and access controls before using real customer data.
- Customer data is stored in the local MySQL database and is not included in this repository.

## Planned Improvements

- Administrator authentication and API authorization.
- Verified customer quote lookup.
- Deployment configuration and an online demo using fictional data.
- Automated integration tests for the full quote lifecycle.

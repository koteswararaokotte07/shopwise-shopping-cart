# Shopwise — Product Listing & Shopping Cart

A full-stack, single-user shopping demo. Products and cart items are read from and stored in MySQL through a Spring Boot API. The backend calculates all prices and totals.

## Features

- Browse products from the REST API, search by name, and add products.
- Add products to a persistent cart; repeated additions increase quantity.
- Change quantities, remove individual items, and clear the cart.
- View item and cart totals formatted in Indian Rupees.
- Server-side validation and readable API errors.
- Responsive React interface, loading states, and network error handling.

> **Single-user demo:** this application intentionally has one shared cart in its database. It is not suitable for multiple independent users until user identity and per-user cart ownership are added.

## Technology

- Frontend: React, Vite, JavaScript, CSS
- Backend: Java 21, Spring Boot 3, Spring Web, Spring Data JPA, Jakarta Validation
- Database: MySQL
- Backend tests: JUnit 5, Spring Boot Test, H2

## Requirements

- Java 21 or newer
- Maven 3.9+
- Node.js 20.19+ and npm
- MySQL 8+ (or Docker, if you prefer to run MySQL in a container)

## Project layout

```text
shopping-cart-app/
├── backend/
│   ├── src/main/java/com/shopwise/
│   ├── src/main/resources/application.properties
│   └── src/test/
├── frontend/
│   ├── src/
│   └── package.json
├── .env.example
└── README.md
```

## Database and environment

Create a MySQL database and user (or use an existing local MySQL account):

```sql
CREATE DATABASE shopping_cart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shopwise'@'localhost' IDENTIFIED BY 'choose-a-local-password';
GRANT ALL PRIVILEGES ON shopping_cart.* TO 'shopwise'@'localhost';
```

The application creates/updates tables using Hibernate and inserts example products only when the product table is empty. Set the database environment variables in the terminal used to start the backend. Do not commit credentials.

PowerShell:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/shopping_cart?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME = "shopwise"
$env:DB_PASSWORD = "choose-a-local-password"
$env:SERVER_PORT = "8080"
```

`.env.example` documents the variables; Spring Boot does not load a `.env` file automatically.

## Run locally

Start the backend from `shopping-cart-app/backend`:

```powershell
mvn spring-boot:run
```

The API is available at `http://localhost:8080/api`.

In another terminal, create `shopping-cart-app/frontend/.env.local` with:

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
```

Then start the frontend from `shopping-cart-app/frontend`:

```powershell
npm install
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`).

## API

All endpoints are under `/api`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/products` | List products |
| `GET` | `/products/{id}` | Get one product |
| `POST` | `/products` | Create a product (`name`, `description`, `price`, optional `imageUrl`) |
| `PUT` | `/products/{id}` | Replace a product |
| `DELETE` | `/products/{id}` | Delete a product and its cart entry |
| `GET` | `/cart` | Get cart items, item totals, and cart total |
| `POST` | `/cart/items` | Add `{ "productId": 1, "quantity": 1 }` |
| `PATCH` | `/cart/items/{productId}` | Set quantity with `{ "quantity": 2 }` |
| `DELETE` | `/cart/items/{productId}` | Remove an item |
| `DELETE` | `/cart` | Empty the cart |

Prices must be greater than zero; names cannot be blank; quantities must be positive integers. Errors use a JSON body with a readable `message` and, for field errors, an `errors` map. Monetary values use `BigDecimal` and are never accepted as cart prices from the client.

## Tests and production build

From `shopping-cart-app/backend`:

```powershell
mvn test
mvn package
```

Backend tests use an in-memory H2 database and do not require MySQL.

From `shopping-cart-app/frontend`:

```powershell
npm test
npm run build
```

## Troubleshooting

- **Backend cannot connect to MySQL:** check that MySQL is running, the database exists, and `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` match your local setup.
- **Frontend reports a network error:** start the backend and check that `VITE_API_BASE_URL` points to its `/api` URL. Restart Vite after changing `.env.local`.
- **Port already in use:** set `SERVER_PORT` to an available backend port and update `VITE_API_BASE_URL` to match.
- **No products appear:** confirm the backend started successfully and check its logs for database startup errors. Example products are inserted automatically into an empty products table.

## GitHub

Publish this folder as its own repository so the existing Drishti project remains separate. Do not push the parent workspace repository as the shopping-cart project.

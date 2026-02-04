# Postman Documentation

This project includes a `postman.json` file that can be imported into [Postman](https://www.postman.com/) to test the API endpoints.

## How to Import
1. Open Postman.
2. Click **Import** in the top left.
3. Drag and drop the `postman.json` file into the import window.

## Collection Structure
- **Auth folder**: Contains requests for `Signup` and `Login`.
- **Products folder**: Contains requests for fetching the product list.
- **Cart folder**: Contains requests for managing the shopping cart.

## Environment Variables
The collection is configured to use `http://localhost:8000` as the base URL. If your server is running elsewhere, edit the URL in the requests.

## Authentication
Most endpoints (Cart, Orders) require authentication.
1. Run the **Login** request.
2. Copy the `access_token` from the response.
3. In requests that require auth (e.g., Get Cart), go to the **Headers** tab.
4. Set the `Authorization` header to `Bearer <your_copied_token>`.

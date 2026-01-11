# GA Admin Dashboard

Admin dashboard for managing orders, users, and payments from the GA Multilens database.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://vacanzidev_db_user:Fxrzcgx34bTWNcIE@gamultilens.tuzaora.mongodb.net/gaMultilens?retryWrites=true&w=majority&appName=gaMultilens
DATABASE_NAME=gaMultilens
COLLECTION_NAME=accounts_login
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Dashboard**: Overview with statistics for orders, users, payments, and revenue
- **Orders**: View all orders with details including payment status, order status, and cart items
- **Users**: View all users from the accounts_login collection
- **Payments**: View all payment transactions with status and amount details

## Pages

- `/` - Dashboard home with statistics
- `/orders` - List of all orders
- `/users` - List of all users
- `/payments` - List of all payments

Each page includes:
- Data tables with key information
- "View Details" button to see full JSON data for each record
- Refresh button to reload data
- Responsive design

## Database Collections

The dashboard connects to the following MongoDB collections:
- `orders` - Order information
- `accounts_login` - User accounts
- `payments` - Payment transactions
"# ga-admin" 

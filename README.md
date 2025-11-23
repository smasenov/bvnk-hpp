# BVNK Hosted Payment Page (HPP)

## How to Test the Project

Follow the steps below to properly set up and test the **bvnk-hpp** project.

---

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone <repository-url>
cd bvnk-hpp
```

### 2. Configure Environment Variables

In the root of the project, locate the `.env` file. Add a valid merchant ID:

```
MERCHANT_ID=your_valid_merchant_id
```

### 3. Install Dependencies

Install all required packages:

```bash
npm install
```

### 4. Start the Development Server

Run the project locally:

```bash
npm run dev
```

### 5. Open the Application

Visit the following URL in your browser:

```
http://localhost:3000/
```

### 6. Test the Payment Flow

* Paste a **valid payment ID** into the input field.
* Press the button to trigger the payment processing.

---
If you need additional setup steps, environment variable explanations, or API documentation added to this README, let me know!


## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── buttons/        # Button components (CopyButton)
│   ├── LoadingSpinner/ # Loading indicator
│   ├── PageLayout/     # Page layout wrapper
│   ├── PaymentCard/    # Payment card wrapper
│   └── PaymentHeader/  # Payment header component
├── hooks/              # Custom React hooks
│   ├── useCountdownTimer.ts
│   └── usePayment.ts
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   ├── create-payment/# Payment creation page
│   └── payin/         # Payment flow pages
│       └── [uuid]/    # Dynamic route for payment UUID
├── styles/            # Global styles
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
    ├── api.ts         # API client functions
    ├── clipboard.ts   # Clipboard utilities
    ├── paymentExpiration.ts
    └── timer.ts       # Timer formatting utilities
```

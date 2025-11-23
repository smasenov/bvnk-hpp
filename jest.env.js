// This file runs BEFORE Next.js loads to set environment variables
// Set NODE_ENV to test before Next.js can initialize
process.env.NODE_ENV = 'test';

// Disable Next.js unhandled rejection filter to prevent stack overflow in tests
process.env.NEXT_UNHANDLED_REJECTION_FILTER = 'disabled';


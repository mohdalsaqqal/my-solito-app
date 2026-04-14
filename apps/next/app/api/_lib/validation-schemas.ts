/**
 * Zod validation schemas for public-facing route handlers.
 *
 * Each schema validates the JSON body of a POST request.
 * Import the schema and use:
 *   const parsed = SomeSchema.safeParse(await request.json())
 *   if (!parsed.success) return fail('CODE', parsed.error.errors[0].message, 400)
 */

import { z } from 'zod'

// ── Auth ────────────────────────────────────────────────────────────────

export const LoginBodySchema = z.object({
  email: z.string().min(1, 'Email is required').max(255),
  password: z.string().min(1, 'Password is required').max(128),
})

export const RegisterBodySchema = z.object({
  name: z.string().min(1, 'Name is required').max(128),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

export const RequestResetBodySchema = z.object({
  email: z.string().email('Invalid email address').max(255),
})

export const ResetPasswordBodySchema = z.object({
  token: z.string().min(1, 'Token is required').max(512),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

// ── Cart ────────────────────────────────────────────────────────────────

export const CartAddBodySchema = z.object({
  productId: z.string().min(1, 'Product ID is required').max(64),
  quantity: z.number().int().min(1).max(99).default(1),
  variantId: z.string().max(64).optional(),
})

export const CartSetQuantityBodySchema = z.object({
  productId: z.string().min(1, 'Product ID is required').max(64),
  quantity: z.number().int().min(0).max(99),
})

export const CartRemoveBodySchema = z.object({
  productId: z.string().min(1, 'Product ID is required').max(64),
})

// ── Account ─────────────────────────────────────────────────────────────

export const AddressBodySchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
  line1: z.string().min(1, 'Address line 1 is required').max(255),
  line2: z.string().max(255).optional().default(''),
  city: z.string().min(1, 'City is required').max(128),
  state: z.string().max(128).optional().default(''),
  postalCode: z.string().max(32).optional().default(''),
  country: z.string().min(1, 'Country is required').max(64),
  phone: z.string().max(32).optional().default(''),
  isDefault: z.boolean().optional().default(false),
})

// ── Reviews ─────────────────────────────────────────────────────────────

export const ReviewBodySchema = z.object({
  productId: z.string().min(1, 'Product ID is required').max(64),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional().default(''),
  body: z.string().max(2000).optional().default(''),
})

// ── Checkout ────────────────────────────────────────────────────────────

export const CheckoutQuoteBodySchema = z.object({
  cartHash: z.string().min(1, 'Cart hash is required').max(256),
  shippingAddressId: z.string().max(64).optional(),
  couponCode: z.string().max(64).optional().default(''),
})

export const PlaceOrderBodySchema = z.object({
  cartHash: z.string().min(1, 'Cart hash is required').max(256),
  shippingAddressId: z.string().min(1, 'Shipping address is required').max(64),
  paymentMethod: z.enum(['networks', 'cod', 'wallet']),
  couponCode: z.string().max(64).optional().default(''),
  notes: z.string().max(500).optional().default(''),
})

// ── Referral ────────────────────────────────────────────────────────────

export const ReferralValidateBodySchema = z.object({
  code: z.string().min(1, 'Referral code is required').max(64),
})

export const ReferralApplyBodySchema = z.object({
  referralCode: z.string().min(1, 'Referral code is required').max(64),
  name: z.string().min(1, 'Name is required').max(128),
  email: z.string().email('Invalid email address').max(255),
})

// ── Pharmacist ──────────────────────────────────────────────────────────

export const PharmacistScanResolveBodySchema = z.object({
  barcode: z.string().min(1, 'Barcode is required').max(128),
})

export const PharmacistConsultationSubmitBodySchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required').max(64),
  notes: z.string().max(2000),
  recommendations: z.array(z.string().max(64)).optional(),
})

// ── Helper ──────────────────────────────────────────────────────────────

/**
 * Validate a request body against a Zod schema.
 * Returns undefined if valid, or a Response if invalid.
 */
export function validateBody<T extends z.ZodType>(
  body: unknown,
  schema: T,
): { data: z.infer<T> } | Response {
  const result = schema.safeParse(body)
  if (!result.success) {
    const firstError = result.error.issues[0]
    const { fail } = require('./response')
    return fail(
      'VALIDATION_ERROR',
      firstError.message,
      400,
      { scope: 'body-validation', cause: result.error.flatten() },
    )
  }
  return { data: result.data }
}

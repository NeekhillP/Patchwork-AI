---
version: alpha
name: PatchWork AI
description: A charcoal collaborative workspace with a tactile patchwork identity.
colors:
  canvas: "#141518"
  panel: "#1b1c20"
  raised: "#24252b"
  line: "#383940"
  ink: "#f2f0eb"
  muted: "#a4a4af"
  accent: "#c1b5ed"
  paper: "#e6e2d8"
  danger: "#f1a6a6"
typography:
  sans:
    fontFamily: "Segoe UI, Arial, sans-serif"
  editorial:
    fontFamily: "Georgia, serif"
rounded:
  control: "0.5rem"
  tile: "2rem"
spacing:
  form-width: "25rem"
  preview-width: "28.75rem"
components:
  auth-input:
    height: "3rem"
  primary-button:
    height: "3rem"
---

# PatchWork AI design system

## Overview

Product UI for people signing into a shared AI conversation workspace. English is the current UI language; no specific geographic market is established. The visual reference is a studio pinboard: differently shaped pieces assembled into one whole. The signature is a four-piece mark and a compact conversation quilt. Keep forms familiar and quiet; avoid glowing gradients, stock testimonials, fake usage metrics, and unsupported social login.

Runtime CSS is canonical: `Frontend/src/index.css` owns RGB color tuples and scrollbar tokens; `Frontend/tailwind.config.js` adapts the variables with alpha support into semantic utilities. This document mirrors accepted values in hex. AuthLayout owns composition; AuthForm owns fields, validation, feedback, and request state. Login and Register each control their email/password state and supply an Axios submit handler through AuthForm props. Neither duplicates form markup. The public `/` route always renders the dummy Home page, including after successful authentication.

## Colors

Canvas and panel distinguish the two page halves. Ink is the primary action surface; accent identifies the product and keyboard focus. Paper and accent form the preview's contrasting patches. Muted copy remains readable; danger always accompanies error text. Dark is the only current theme. Forced-colors mode preserves system controls and scrollbars. Scrollbar thumb/hover/active tokens are `#52535e`, `#727381`, and `#a4a4af`, respectively, against canvas.

## Typography

System sans keeps fields and controls immediate without remote font shifts. Georgia italic appears only in the editorial headline's “together.” Body copy uses 14–16px type; the form heading uses 32–36px. Utility captions use 11–12px. No external font service is required.

## Layout

At 1024px and above, a 1.05:1 split gives the brand story a little more space. The form is capped at 400px and preview at 460px. Below that breakpoint, show the compact brand header and a single form column. Document scrolling owns overflow; controls remain reachable on short screens. Field help and request feedback reserve space to keep the submit button stable.

## Elevation & Depth

Use flat tonal surfaces and fine borders. No floating form card or ambient glow. The preview demonstrates a conversation and is explicitly marked as a glimpse, never a live session.

## Shapes

Controls have 8px corners and 48px height. Decorative patches use selective 32px corners. The fourth logo square rotates slightly to suggest an individual contribution within the whole.

## Components

Native labels, inputs, buttons, and router links own semantics. Shared `.auth-input`, `.primary-button`, and `.text-link` recipes own visual states. Provide hover, pressed, visible focus, disabled, invalid, and busy states. Form errors are inline and linked to their fields; submit focuses the first invalid input. API errors use a stable live region. Passwords start masked with a labeled reveal button. The spinner is reserved inside the fixed-height button; reduced-motion preferences disable animation.

API contract: `Backend/src/models/user.model.js` and `Backend/src/routes/user.routes.js` require email (5–50 characters) and password (at least 6 characters). Only those fields are submitted. Registration signs in with the returned bearer token, matching the existing server response. Sessions live only in React memory, so refreshing requires signing in again. Never persist passwords or tokens in browser storage. Welcome is an account confirmation while the workspace is unbuilt. Sign out calls the existing authenticated endpoint. Production API hosting/CORS is an environment concern.

## Do's and Don'ts

- Do reuse AuthLayout and AuthForm across both auth routes.
- Do keep product copy direct and server errors free of internal details.
- Don't add unsupported OAuth, reset-password links, or legal claims.
- Don't use the conversation illustration as an interactive chat surface.

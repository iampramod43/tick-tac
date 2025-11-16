import { NextResponse } from "next/server";

// Clerk handles SSO callbacks automatically through middleware
// This route exists to prevent 404 errors for SSO callbacks during sign-up
export async function GET() {
  // Clerk middleware will handle the actual SSO callback processing
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}

export async function POST() {
  // Clerk middleware will handle the actual SSO callback processing
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}


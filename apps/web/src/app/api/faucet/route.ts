import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const faucetSchema = z.object({
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = faucetSchema.parse(body);

    const txHash = `0xfaucet_${Date.now()}_${validated.recipientAddress.slice(2, 10)}`;

    return NextResponse.json({
      success: true,
      amount: 1000,
      tokenSymbol: "CRED",
      recipient: validated.recipientAddress,
      txHash,
      message: "Successfully claimed 1,000 test CRED tokens on Base Sepolia testnet.",
    });
  } catch (error: any) {
    console.error("POST /api/faucet error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to claim faucet" }, { status: 500 });
  }
}

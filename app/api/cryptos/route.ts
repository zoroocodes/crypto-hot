import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cryptos = await prisma.cryptocurrency.findMany();
    return NextResponse.json(cryptos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cryptos' }, { status: 500 });
  }
}
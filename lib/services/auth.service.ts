import { prisma } from '@/lib/db'

export interface CreateUserProfileParams {
  id: string
  email: string
  username: string
  displayName: string
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase()
  const existing = await prisma.user.findFirst({
    where: {
      username: {
        equals: normalized,
        mode: 'insensitive',
      },
    },
    select: { id: true },
  })
  return !existing
}

export async function isEmailAvailable(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase()
  const existing = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  })
  return !existing
}

export async function createUserProfile(data: CreateUserProfileParams) {
  return await prisma.user.create({
    data: {
      id: data.id,
      email: data.email.trim().toLowerCase(),
      username: data.username.trim().toLowerCase(),
      displayName: data.displayName.trim(),
    },
  })
}

export async function getUserProfileById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  })
}

export async function getUserProfileByUsername(username: string) {
  return await prisma.user.findFirst({
    where: {
      username: {
        equals: username.trim().toLowerCase(),
        mode: 'insensitive',
      },
    },
  })
}

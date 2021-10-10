import { createChallenge, updateChallenge } from 'db/ChallengeDb'
import { listUser, removeUser, updateUser } from 'db/UsersDb'
import { Request } from 'express'
import { BaseChallenge } from 'models/Challenge'
import { User } from 'models/User'
import { Namespace } from 'socket.io'
import { ServerConfig } from './serverconfig'

export function registerAdminNamespace(
  adminIo: Namespace,
  gameIo: Namespace,
  serverConfig: ServerConfig,
) {
  adminIo.use((socket, next) =>
    (socket.request as Request<User>).user?.isAdmin
      ? next()
      : next(new Error('unauthorized')),
  )

  adminIo.on('connection', adminSocket => {
    adminSocket.on(
      'challenge:create',
      async (chall: BaseChallenge, callback) => {
        try {
          const challenge = await createChallenge(chall)
          callback(challenge)
          gameIo.emit('challenge:added', challenge)
        } catch (error) {
          if (error instanceof Error) {
            callback({ error: error.message })
          } else {
            callback({ error: 'an error occured' })
          }
        }
      },
    )

    adminSocket.on(
      'challenge:update',
      async (challName: string, chall: BaseChallenge, callback) => {
        try {
          const challenge = await updateChallenge(challName, chall)
          callback(challenge)
          gameIo.emit('challenge:updated', challenge)
        } catch (error) {
          if (error instanceof Error) {
            callback({ error: error.message })
          } else {
            callback({ error: 'an error occured' })
          }
        }
      },
    )

    adminSocket.on('challenge:broke', async (challName: string) => {
      const updated = await updateChallenge(challName, { isBroken: true })
      gameIo.emit('challenge:updated', updated)
    })

    adminSocket.on('challenge:repair', async (challName: string) => {
      const updated = await updateChallenge(challName, { isBroken: false })
      gameIo.emit('challenge:updated', updated)
    })

    // adminSocket.on('game:end', async () => {
    //   await closeAllChallenge()
    //   gameIo.disconnectSockets()
    // })

    adminSocket.on('game:openRegistration', () => {
      serverConfig.setRegistrationClosed(false)
    })

    adminSocket.on('game:closeRegistration', () => {
      serverConfig.setRegistrationClosed(true)
    })

    adminSocket.on('users:list', async (callback) => {
      const users = await listUser()
      callback(users)
    })

    adminSocket.on('users:changeTeam', async (username: string, team: string, callback) => {
      const user = await updateUser(username, { team })
      callback(user)
    })

    adminSocket.on('users:changePassword', async (username: string, password: string, callback) => {
      const user = await updateUser(username, { password })
      callback(user)
    })

    adminSocket.on('users:changeIsAdmin', async (username: string, isAdmin: boolean, callback) => {
      const user = await updateUser(username, { isAdmin })
      callback(user)
    })

    adminSocket.on('users:delete', async (username: string, callback) => {
      await removeUser(username)

      gameIo.in(username).disconnectSockets()
      adminSocket.in(username).disconnectSockets()
      callback()
    })
  })
}

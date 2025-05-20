const { onSchedule } = require("firebase-functions/v2/scheduler")
import * as admin from 'firebase-admin'

admin.initializeApp()

export const aggregatePresence = onSchedule('every 5 minutes', async () => {
    // Берём все статусы
    const statusSnap = await admin.database().ref('status').once('value')
    const statuses = statusSnap.val() || {}
    const onlineCount = Object.values(statuses).filter((s: any) => s.online)
        .length

    // Формируем ключи
    const now = new Date()
    const dateKey = now.toISOString().slice(0, 10)   // "YYYY-MM-DD"
    const timeKey = now.toISOString().slice(11, 16)  // "HH:mm"

    // Пишем в presenceLogs
    await admin
        .database()
        .ref(`presenceLogs/${dateKey}/${timeKey}`)
        .set(onlineCount)
})
export interface AppNotification {
  id: string
  userId: string
  type: 'bid_received' | 'bid_accepted' | 'bid_updated' | 'new_plan' | string
  message: string
  isRead: boolean
  createdAt: string
}

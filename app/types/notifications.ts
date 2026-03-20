export interface StationNotificationPayload {
    title: string
    type: 'called' | 'prepare' | 'movestock' | 'sales' | 'pendingorder' | 'cancelorder' | 'krequest' | 'soldout' | 'available'
    body: string
    product_id?: number
    sales_id?: number
    table_number?: number
    floor_number?: number
    move_id?: string
    request_no?: string
}

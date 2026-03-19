export interface StationNotificationPayload {
    'title': string
    'type': 'prepare' | 'movestock' | 'sales' | 'pendingorder' | 'cancelorder' | 'krequest' | 'soldout' | 'available'
    'body': string
    'sales-id'?: string | number
    'table-number'?: string | number
    'floor-number'?: string | number
    'move-id'?: string
    'request-no'?: string
    'data'?: SoldOutItem
}

export interface SoldOutItem {
    'item-code': string
    'item-name': string
    'item-desc': string
    'item-price': number
    'item-img-no': string
    'item-soldout': number
}

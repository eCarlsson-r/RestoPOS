export interface Timestamps {
    created_at?: string
    updated_at?: string
}

export interface ApiResponse<T> {
    data: T
    error?: number
}

// --- Core Master Data ---

export interface Branch extends Timestamps {
    id: number
    name: string
    address: string
    phone: string
    floor_number: number
    table_number: number
    kitchen_no: number
    bartender_no: number
}

export interface Category extends Timestamps {
    id: number
    name: string
    kitchen_process: string
    description: string
}

export interface Product extends Timestamps {
    id: number
    name: string
    description?: string
    img_no?: number
    category_id?: number
    price: number
    cost?: number
    discount?: number
    soldout?: number
    category?: Category
    recipe?: Recipe[]
    image?: string
}

export interface Customer extends Timestamps {
    id: number
    name: string
    gender: 'M' | 'F'
    pob?: string
    dob?: string
    address?: string
    mobile?: string
    email?: string
    discount: number
    tax: number
    img_no: number
    account_id?: number
}

export interface Employee extends Timestamps {
    id: number
    name: string
    branch_id: string
    gender: 'M' | 'F'
    status: string
    job_type: string
    join_date?: string
    quit_date?: string
    home_address?: string
    phone?: string
    mobile?: string
    email?: string
    img_no: number
    account_id?: number
    branch?: Branch
    user?: User
}

export interface User extends Timestamps {
    id: number
    name: string
    email: string
    username: string
    type: 'ADMIN' | 'WAITER' | 'CASHIER' | 'KITCHEN'
    email_verified_at?: string
    employee?: Employee
}

export interface Table extends Timestamps {
    id: number
    table_number: string
    floor_number: string
    branch_id: string
    capacity: number
    size: number
    direction: 'H' | 'V'
    status: 'available' | 'occupied' | 'reserved' | 'dirty'
    position_x: number
    position_y: number
    shape: 'circle' | 'square'
    active_sales_id?: number
}

// --- Transactional ---

export interface Sale extends Timestamps {
    id: number
    branch_id: string
    table_id: number
    employee_id: number
    customer_id: number
    date: string
    time: string
    discount: number
    tax: number
    status: 'O' | 'P' | 'C' | 'D' | 'X'
    employee?: User
    table?: Table
    customer?: Customer
    records?: SaleRecord[]
    invoice?: SaleInvoice
}

export interface SaleRecord extends Timestamps {
    id?: number
    sale_id?: number
    item_type: string
    item_code: number
    quantity: number
    item_price: number
    discount_pcnt: number
    discount_amnt: number
    item_note?: string
    item_status: 'O' | 'P' | 'C' | 'D' | 'X'
    order_employee?: string
    order_date?: string
    order_time?: string
    deliver_employee?: string
    item?: Product | Package
}

export interface SaleInvoice extends Timestamps {
    id: number
    sale_id: number
    pay_method: string
    pay_bank?: string
    pay_card?: string
    pay_amount: number
    pay_change: number
    card_type?: string
    voucher?: string
    employee_id: number
}

// --- Operational Master Data ---

export interface Ingredient extends Timestamps {
    id: number
    name: string
    description?: string
    unit: string
    min_stock: number
}

export interface Recipe extends Timestamps {
    id?: number
    product_id?: number
    ingredient_id: number
    quantity: number
    unit: string
    purchase_price: number
}

export interface Supplier extends Timestamps {
    id: number
    name: string
    branch_id: string
    storage: string
    contact_person?: string
    npwp?: string
    address?: string
    phone?: string
    mobile?: string
    email?: string
}

export interface Stock extends Timestamps {
    id: number
    item_type: string
    item_code: string
    branch_id: string
    storage: string
    purchase_price: number
    quantity: number
    min_stock: number
}

export interface StockMove extends Timestamps {
    id: number
    move_date: string
    from_branch_id: number
    from_storage: string
    to_branch_id: number
    to_storage: string
    status: string
    items?: StockMoveItem[]
}

export interface StockMoveItem {
    id?: number
    movement_id?: number
    item_type: string
    item_code: string
    qty: number
    purchase_price?: number
}

// --- Operational & Miscellaneous ---

export interface Utility extends Timestamps {
    id: number
    name: string
    description?: string
    unit: string
}

export interface Package extends Timestamps {
    id: number
    name: string
    price: number
    description?: string
    products?: PackageProduct[]
}

export interface PackageProduct extends Timestamps {
    id?: number
    package_id?: number
    product_id: number
    quantity: number
    price: number
}

export interface Prepare extends Timestamps {
    id: number
    name: string
    cost: number
    quantity: number
    unit: string
    recipe: PrepareRecipe[]
}

export interface PrepareLog extends Timestamps {
    id: number
    prepare_id: string
    branch_id: string
    storage: string
    date: string
    time: string
}

export interface PrepareRecipe extends Timestamps {
    id?: number
    prepare_id?: number
    ingredient_id: number
    quantity: number
    unit: string
    purchase_price: number
}

export interface KitchenRequest extends Timestamps {
    id: number
    date: string
    time: string
    from_branch_id: number
    from_branch: Branch
    from_storage: string
    to_branch_id: number
    to_branch: Branch
    to_storage: string
    respond_date?: string
    respond_time?: string
    status: string
    items?: KitchenRequestItem[]
}

export interface KitchenRequestItem extends Timestamps {
    id?: number
    request_id?: number
    item_type: string
    item_code: number
    quantity: number
}

export interface StockCardLog {
    date: string
    reference: string
    description: string
    in: number
    out: number
    balance: number
}

export interface PurchaseOrder extends Timestamps {
    id: number
    supplier_id: number
    supplier?: Supplier
    date: string
    delivery_date: string
    status: string
    description: string
    items?: PurchaseOrderItem[]
}

export interface PurchaseOrderItem extends Timestamps {
    id?: number
    purchase_order_id?: number
    item_type: string
    item_code: number
    ingredient?: Ingredient
    utility?: Utility
    quantity: number
    price: number
    discount?: number
}

export interface PurchaseReturn extends Timestamps {
    id: number
    supplier_id: number
    supplier?: Supplier
    date: string
    delivery_date: string
    description: string
    items?: PurchaseReturnItem[]
}

export interface PurchaseReturnItem extends Timestamps {
    id?: number
    purchase_return_id?: number
    item_type: string
    item_code: number
    ingredient?: Ingredient
    utility?: Utility
    quantity: number
    price: number
    discount?: number
}

export interface KitchenTicketItem {
    id: number
    name: string
    quantity: number
    item_status: 'O' | 'P' | 'C' | 'D' | 'X'
    note: string
}

export interface KitchenTicket {
    id: number
    floor_number: number
    table_number: number
    status: 'O' | 'P' | 'C' | 'D' | 'X'
    items: KitchenTicketItem[]
    sales_id: number
    customer_name: string
    created_at: Date
    time_elapsed: number
}

export interface File extends Timestamps {
    id: number
    name: string
    type: string
    ext: string
    size: number
    upload_date: string
}

export interface NotificationSubscription extends Timestamps {
    id: number
    user_id: number
    endpoint: string
    public_key: string
    auth_token: string
}
